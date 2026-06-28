import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ENV } from "../_core/env";
import { publicProcedure, router } from "../_core/trpc";
import {
  createCheckoutSession,
  getSubscriptionByEmail,
  isPremiumSubscription,
  getStripe,
  verifyAndFulfillCheckoutSession,
} from "../stripe";

export const subscriptionRouter = router({
  getStatus: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const sub = await getSubscriptionByEmail(input.email);
      if (!sub) return { plan: "free" as const, isPremium: false, currentPeriodEnd: null };
      return {
        plan: sub.plan,
        isPremium: isPremiumSubscription(sub),
        currentPeriodEnd: sub.currentPeriodEnd,
      };
    }),

  createCheckout: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        plan: z.enum(["monthly", "lifetime"]),
      })
    )
    .mutation(async ({ input }) => {
      if (!ENV.stripeSecretKey) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe is not configured" });
      }

      const priceId =
        input.plan === "monthly" ? ENV.stripeMonthlyPriceId : ENV.stripeLifetimePriceId;
      if (!priceId) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe price not configured" });
      }

      const mode = input.plan === "monthly" ? "subscription" : "payment";
      try {
        const session = await createCheckoutSession({
          email: input.email,
          priceId,
          mode,
          successUrl: `${ENV.appUrl}/premium/success?session={CHECKOUT_SESSION_ID}&plan=${input.plan}`,
          cancelUrl: `${ENV.appUrl}/?upgrade=canceled`,
        });

        if (!session.url) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create checkout session" });
        }

        return { url: session.url };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not start checkout";
        if (/price|prod_|Stripe/i.test(message)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Payment setup error. Check that STRIPE_LIFETIME_PRICE_ID in Render is a price_ ID (not prod_).",
          });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }
    }),

  /** Called from /premium/success after Stripe redirect — activates premium without waiting for webhook. */
  confirmCheckout: publicProcedure
    .input(z.object({ sessionId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      if (!ENV.stripeSecretKey) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe is not configured" });
      }
      try {
        const result = await verifyAndFulfillCheckoutSession(input.sessionId);
        if (!result.fulfilled) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Payment not completed yet. Try again in a moment." });
        }
        return {
          isPremium: true,
          plan: result.plan,
          email: result.email,
        };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        const message = err instanceof Error ? err.message : "Could not verify payment";
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }
    }),

  cancel: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const sub = await getSubscriptionByEmail(input.email);
      if (!sub?.stripeSubscriptionId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No subscription found" });
      }
      await getStripe().subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      return { success: true as const };
    }),
});
