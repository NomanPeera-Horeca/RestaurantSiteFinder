import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { createLead, updateLeadScore, getAllLeads, getLeadById } from "../db";
import { notifyOwner } from "../_core/notification";
import { appendLeadToSheet, appendLeadScoreUpdate, appendMetricToSheet } from "../google-sheets";

export const leadRouter = router({
  /** Capture a new lead (email + phone) */
  capture: publicProcedure
    .input(z.object({
      email: z.string().email(),
      phone: z.string().min(7),
      address: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await createLead({
        email: input.email,
        phone: input.phone,
        address: input.address ?? null,
        lat: input.lat != null ? String(input.lat) : null,
        lng: input.lng != null ? String(input.lng) : null,
      });

      // Also append to Google Sheets (non-blocking)
      appendLeadToSheet({
        email: input.email,
        phone: input.phone,
        address: input.address,
        lat: input.lat != null ? String(input.lat) : null,
        lng: input.lng != null ? String(input.lng) : null,
      }).catch(e => console.warn("[Sheets] Lead append failed:", e));

      return { leadId: result.id };
    }),

  /** Update lead with opportunity score after analysis completes */
  updateScore: publicProcedure
    .input(z.object({
      leadId: z.number(),
      opportunityScore: z.number().min(1).max(10),
      recommendation: z.string(),
    }))
    .mutation(async ({ input }) => {
      await updateLeadScore(input.leadId, input.opportunityScore, input.recommendation);

      // Get lead email for Sheets update
      try {
        const lead = await getLeadById(input.leadId);
        if (lead) {
          appendLeadScoreUpdate({
            email: lead.email,
            opportunityScore: input.opportunityScore,
            recommendation: input.recommendation,
          }).catch(e => console.warn("[Sheets] Score update append failed:", e));
        }
      } catch (e) {
        console.warn("[Sheets] Could not fetch lead for score update:", e);
      }

      // Notify owner for high-quality leads (score >= 7)
      if (input.opportunityScore >= 7) {
        try {
          await notifyOwner({
            title: `High-Quality Lead (Score: ${input.opportunityScore}/10)`,
            content: `A new lead has completed a full Restaurant Site Finder analysis with a ${input.recommendation} recommendation and an opportunity score of ${input.opportunityScore}/10.\n\nThis is a high-potential prospect for Horeca Store equipment sales. Check the leads dashboard for contact details.`,
          });
        } catch (e) {
          console.warn("Failed to send owner notification:", e);
        }
      }

      return { success: true };
    }),

  /** Track a website metric event */
  trackEvent: publicProcedure
    .input(z.object({
      type: z.string(),
      page: z.string(),
      details: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Append to Google Sheets (non-blocking)
      appendMetricToSheet({
        type: input.type,
        page: input.page,
        details: input.details,
      }).catch(e => console.warn("[Sheets] Metric append failed:", e));

      return { success: true };
    }),

  /** Admin: list all leads */
  list: publicProcedure.query(async () => {
    const allLeads = await getAllLeads();
    return allLeads;
  }),
});
