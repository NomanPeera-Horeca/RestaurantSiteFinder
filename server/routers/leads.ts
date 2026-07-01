import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { createLead, updateLeadScore, getAllLeads, getLeadById } from "../db";
import { notifyOwner } from "../_core/notification";
import { appendLeadToSheet, appendLeadScoreUpdate, appendMetricToSheet } from "../google-sheets";

/** Empty string allowed; if provided, must contain at least 7 digits. */
const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || value.replace(/\D/g, "").length >= 7,
    { message: "Please enter a valid phone number" },
  );

function ephemeralLeadId(): number {
  return Math.floor(Date.now() / 1000);
}

async function persistLead(input: {
  email: string;
  phone: string;
  address?: string;
  lat?: number;
  lng?: number;
  serviceModel?: string;
  cuisineConcept?: string;
  priceTier?: string;
}): Promise<{ leadId: number; persisted: boolean }> {
  const base = {
    email: input.email,
    phone: input.phone,
    address: input.address ?? null,
    lat: input.lat != null ? String(input.lat) : null,
    lng: input.lng != null ? String(input.lng) : null,
  };

  try {
    const result = await createLead({
      ...base,
      serviceModel: input.serviceModel ?? null,
      cuisineConcept: input.cuisineConcept ?? null,
      priceTier: input.priceTier ?? null,
    });
    return { leadId: result.id, persisted: true };
  } catch (e) {
    console.warn("[Leads] Insert with concept fields failed, retrying without:", e);
  }

  try {
    const result = await createLead(base);
    return { leadId: result.id, persisted: true };
  } catch (e) {
    console.warn("[Leads] Database unavailable, using ephemeral lead id:", e);
    return { leadId: ephemeralLeadId(), persisted: false };
  }
}

export const leadRouter = router({
  /** Capture a new lead (email + phone) */
  capture: publicProcedure
    .input(z.object({
      email: z.string().email(),
      phone: optionalPhoneSchema,
      address: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      serviceModel: z.string().optional(),
      cuisineConcept: z.string().optional(),
      priceTier: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { leadId } = await persistLead(input);

      appendLeadToSheet({
        email: input.email,
        phone: input.phone,
        address: input.address,
        lat: input.lat != null ? String(input.lat) : null,
        lng: input.lng != null ? String(input.lng) : null,
        serviceModel: input.serviceModel,
        cuisineConcept: input.cuisineConcept,
      }).catch(e => console.warn("[Sheets] Lead append failed:", e));

      return { leadId };
    }),

  /** Update lead with opportunity score after analysis completes */
  updateScore: publicProcedure
    .input(z.object({
      leadId: z.number(),
      opportunityScore: z.number().min(1).max(10),
      recommendation: z.string(),
      conceptFitScore: z.number().min(1).max(10).optional(),
      conceptRecommendation: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        await updateLeadScore(
          input.leadId,
          input.opportunityScore,
          input.recommendation,
          input.conceptFitScore,
          input.conceptRecommendation
        );
      } catch (e) {
        console.warn("[Leads] Score update skipped:", e);
      }

      // Get lead email for Sheets update
      try {
        const lead = await getLeadById(input.leadId);
        if (lead) {
          appendLeadScoreUpdate(
            lead.id,
            input.opportunityScore,
            input.recommendation
          ).catch(e => console.warn("[Sheets] Score update append failed:", e));
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
