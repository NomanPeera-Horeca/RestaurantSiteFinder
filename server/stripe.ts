import Stripe from "stripe";
import { ENV } from "./_core/env";
import { getSubscriptionByEmail, upsertSubscription } from "./db";
import type { Subscription } from "../drizzle/schema";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!ENV.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(ENV.stripeSecretKey, {
      apiVersion: "2026-06-24.dahlia",
    });
  }
  return stripeClient;
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const periodEnd = subscription.items?.data?.[0]?.current_period_end;
  return periodEnd ? new Date(periodEnd * 1000) : null;
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const subscription = invoice.parent?.subscription_details?.subscription;
  if (!subscription) return null;
  return typeof subscription === "string" ? subscription : subscription.id;
}

export { getSubscriptionByEmail };

/** Checkout line_items require a Price ID (price_...), not a Product ID (prod_...). */
export async function resolveStripePriceId(priceOrProductId: string): Promise<string> {
  const id = priceOrProductId.trim();
  if (id.startsWith("price_")) return id;

  if (id.startsWith("prod_")) {
    const product = await getStripe().products.retrieve(id, { expand: ["default_price"] });
    const defaultPrice = product.default_price;
    if (typeof defaultPrice === "string") return defaultPrice;
    if (defaultPrice && typeof defaultPrice === "object" && !("deleted" in defaultPrice)) {
      return defaultPrice.id;
    }
    const prices = await getStripe().prices.list({ product: id, active: true, limit: 1 });
    if (prices.data[0]?.id) return prices.data[0].id;
    throw new Error(
      `Stripe product ${id} has no default price. Set STRIPE_LIFETIME_PRICE_ID to a price_ ID in Render.`
    );
  }

  throw new Error(
    `Invalid Stripe price config "${id}". Use a Price ID starting with price_ (not prod_).`
  );
}

export async function createCheckoutSession({
  email,
  priceId,
  mode,
  successUrl,
  cancelUrl,
}: {
  email: string;
  priceId: string;
  mode: "subscription" | "payment";
  successUrl: string;
  cancelUrl: string;
}) {
  const resolvedPriceId = await resolveStripePriceId(priceId);
  return getStripe().checkout.sessions.create({
    customer_email: email.trim().toLowerCase(),
    payment_method_types: ["card"],
    line_items: [{ price: resolvedPriceId, quantity: 1 }],
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { email: email.trim().toLowerCase() },
  });
}

export function planFromPriceId(priceId: string): "premium_monthly" | "premium_lifetime" | null {
  if (priceId === ENV.stripeMonthlyPriceId) return "premium_monthly";
  if (priceId === ENV.stripeLifetimePriceId) return "premium_lifetime";
  return null;
}

export function isPremiumSubscription(sub: Subscription | null): boolean {
  if (!sub) return false;
  return (
    sub.plan !== "free" &&
    sub.status === "active" &&
    (sub.currentPeriodEnd === null || sub.currentPeriodEnd > new Date())
  );
}

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const email =
    session.metadata?.email ??
    session.customer_email ??
    session.customer_details?.email ??
    "";
  if (!email) {
    console.warn("[Stripe] checkout.session.completed missing email");
    return;
  }

  const lineItems = await getStripe().checkout.sessions.listLineItems(session.id, { limit: 1 });
  const priceId = lineItems.data[0]?.price?.id ?? "";
  const plan = planFromPriceId(priceId) ?? (session.mode === "payment" ? "premium_lifetime" : "premium_monthly");

  let currentPeriodEnd: Date | null = null;
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  let stripeSubscriptionId: string | null =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;

  if (stripeSubscriptionId) {
    const subscription = await getStripe().subscriptions.retrieve(stripeSubscriptionId);
    currentPeriodEnd = getSubscriptionPeriodEnd(subscription);
  } else if (session.mode === "payment") {
    currentPeriodEnd = null;
  }

  await upsertSubscription({
    email: email.trim().toLowerCase(),
    stripeCustomerId,
    stripeSubscriptionId,
    plan,
    status: "active",
    currentPeriodEnd,
  });
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const customer = await getStripe().customers.retrieve(customerId);
  const email =
    !("deleted" in customer && customer.deleted) && "email" in customer && customer.email
      ? customer.email
      : null;
  if (!email) return;

  const priceId = subscription.items.data[0]?.price?.id ?? "";
  const plan = planFromPriceId(priceId) ?? "premium_monthly";

  await upsertSubscription({
    email,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    plan,
    status: subscription.status === "active" ? "active" : subscription.status === "trialing" ? "trialing" : subscription.status === "past_due" ? "past_due" : "canceled",
    currentPeriodEnd: getSubscriptionPeriodEnd(subscription),
  });
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const customer = await getStripe().customers.retrieve(customerId);
  const email =
    !("deleted" in customer && customer.deleted) && "email" in customer && customer.email
      ? customer.email
      : null;
  if (!email) return;

  await upsertSubscription({
    email,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    plan: "free",
    status: "canceled",
    currentPeriodEnd: null,
  });
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  await handleSubscriptionUpdated({ ...subscription, status: "past_due" });
}
