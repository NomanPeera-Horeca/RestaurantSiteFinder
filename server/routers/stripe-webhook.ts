import type { Express, Request, Response } from "express";
import express from "express";
import { ENV } from "../_core/env";
import {
  stripe,
  handleCheckoutSessionCompleted,
  handleInvoicePaymentFailed,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from "../stripe";

export function registerStripeWebhook(app: Express): void {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const signature = req.headers["stripe-signature"];
      if (!signature || !ENV.stripeWebhookSecret) {
        res.status(400).send("Webhook secret not configured");
        return;
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, signature, ENV.stripeWebhookSecret);
      } catch (err) {
        console.error("[Stripe] Webhook signature verification failed:", err);
        res.status(400).send("Invalid signature");
        return;
      }

      try {
        switch (event.type) {
          case "checkout.session.completed":
            await handleCheckoutSessionCompleted(event.data.object);
            break;
          case "customer.subscription.updated":
            await handleSubscriptionUpdated(event.data.object);
            break;
          case "customer.subscription.deleted":
            await handleSubscriptionDeleted(event.data.object);
            break;
          case "invoice.payment_failed":
            await handleInvoicePaymentFailed(event.data.object);
            break;
          default:
            break;
        }
      } catch (err) {
        console.error(`[Stripe] Webhook handler error for ${event.type}:`, err);
        res.status(500).send("Webhook handler failed");
        return;
      }

      res.json({ received: true });
    }
  );
}
