import type {
  BillingPaymentIntentResponse,
  BillingStatusResponse,
} from "@shared/api";
import type { RequestHandler } from "express";
import type Stripe from "stripe";
import { getAuthenticatedUser } from "../lib/auth";
import { getStripeWebhookSecret } from "../lib/env";
import { getBillingConfig, getStripeClient } from "../lib/stripe";
import { getSupabaseAdmin } from "../lib/supabase-admin";

type UserProfile = {
  id: string;
  email: string;
  has_paid_access: boolean;
  paid_at: string | null;
  onboarding_completed_at: string | null;
  stripe_customer_id: string | null;
  company_id: string | null;
};

type PaymentRecord = {
  user_id: string;
  stripe_payment_intent_id: string;
  stripe_customer_id: string | null;
  stripe_charge_id: string | null;
  stripe_event_id: string | null;
  status: string;
  amount: number;
  amount_refunded: number;
  currency: string;
  receipt_email: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  disputed_at: string | null;
};

async function getUserProfile(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, email, has_paid_access, paid_at, onboarding_completed_at, stripe_customer_id, company_id",
    )
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function ensureStripeCustomer(profile: UserProfile) {
  if (profile.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  const stripe = getStripeClient();
  const supabaseAdmin = getSupabaseAdmin();
  const customer = await stripe.customers.create({
    email: profile.email || undefined,
    metadata: {
      userId: profile.id,
    },
  });

  const { error } = await supabaseAdmin
    .from("users")
    .update({ stripe_customer_id: customer.id })
    .eq("id", profile.id);

  if (error) {
    throw error;
  }

  return customer.id;
}

async function upsertPayment(record: PaymentRecord) {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.from("payments").upsert(record, {
    onConflict: "stripe_payment_intent_id",
  });

  if (error) {
    throw error;
  }
}

async function updateUserAccess(
  userId: string,
  hasPaidAccess: boolean,
  paidAt: string | null,
) {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from("users")
    .update({
      has_paid_access: hasPaidAccess,
      paid_at: paidAt,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

async function getPaymentByIntentId(paymentIntentId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("payments")
    .select("user_id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle<{ user_id: string }>();

  if (error) {
    throw error;
  }

  return data;
}

async function getCompanySlug(companyId: string | null) {
  if (!companyId) {
    return null;
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("companies")
    .select("slug")
    .eq("id", companyId)
    .maybeSingle<{ slug: string }>();

  if (error) {
    throw error;
  }

  return data?.slug ?? null;
}

async function getLatestPaymentStatus(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("payments")
    .select("status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ status: string }>();

  if (error) {
    throw error;
  }

  return data?.status ?? null;
}

function getChargeId(paymentIntent: Stripe.PaymentIntent) {
  const latestCharge = paymentIntent.latest_charge;

  if (typeof latestCharge === "string") {
    return latestCharge;
  }

  return latestCharge?.id ?? null;
}

async function handlePaymentIntentSucceeded(
  event: Stripe.Event,
  paymentIntent: Stripe.PaymentIntent,
) {
  const metadataUserId = paymentIntent.metadata.userId || null;
  const paymentRecord = metadataUserId
    ? { user_id: metadataUserId }
    : await getPaymentByIntentId(paymentIntent.id);

  if (!paymentRecord?.user_id) {
    throw new Error(
      `Unable to resolve user for payment intent ${paymentIntent.id}`,
    );
  }

  const paidAt = new Date(paymentIntent.created * 1000).toISOString();
  await upsertPayment({
    user_id: paymentRecord.user_id,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_customer_id:
      typeof paymentIntent.customer === "string"
        ? paymentIntent.customer
        : null,
    stripe_charge_id: getChargeId(paymentIntent),
    stripe_event_id: event.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    amount_refunded: 0,
    currency: paymentIntent.currency,
    receipt_email: paymentIntent.receipt_email,
    paid_at: paidAt,
    refunded_at: null,
    disputed_at: null,
  });

  await updateUserAccess(paymentRecord.user_id, true, paidAt);
}

async function handlePaymentIntentFailed(
  event: Stripe.Event,
  paymentIntent: Stripe.PaymentIntent,
) {
  const paymentRecord = paymentIntent.metadata.userId
    ? { user_id: paymentIntent.metadata.userId }
    : await getPaymentByIntentId(paymentIntent.id);

  if (!paymentRecord?.user_id) {
    return;
  }

  await upsertPayment({
    user_id: paymentRecord.user_id,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_customer_id:
      typeof paymentIntent.customer === "string"
        ? paymentIntent.customer
        : null,
    stripe_charge_id: getChargeId(paymentIntent),
    stripe_event_id: event.id,
    status: "payment_failed",
    amount: paymentIntent.amount,
    amount_refunded: 0,
    currency: paymentIntent.currency,
    receipt_email: paymentIntent.receipt_email,
    paid_at: null,
    refunded_at: null,
    disputed_at: null,
  });
}

async function handleChargeRefunded(
  event: Stripe.Event,
  charge: Stripe.Charge,
) {
  if (!charge.refunded || charge.amount_refunded < charge.amount) {
    return;
  }

  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : null;
  if (!paymentIntentId) {
    return;
  }

  const paymentRecord = await getPaymentByIntentId(paymentIntentId);
  if (!paymentRecord?.user_id) {
    return;
  }

  await upsertPayment({
    user_id: paymentRecord.user_id,
    stripe_payment_intent_id: paymentIntentId,
    stripe_customer_id:
      typeof charge.customer === "string" ? charge.customer : null,
    stripe_charge_id: charge.id,
    stripe_event_id: event.id,
    status: "refunded",
    amount: charge.amount,
    amount_refunded: charge.amount_refunded,
    currency: charge.currency,
    receipt_email: charge.billing_details.email,
    paid_at: null,
    refunded_at: new Date().toISOString(),
    disputed_at: null,
  });

  await updateUserAccess(paymentRecord.user_id, false, null);
}

async function handleChargeDisputed(
  event: Stripe.Event,
  dispute: Stripe.Dispute,
) {
  const chargeId =
    typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;
  if (!chargeId) {
    return;
  }

  const stripe = getStripeClient();
  const charge = await stripe.charges.retrieve(chargeId);
  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : null;

  if (!paymentIntentId) {
    return;
  }

  const paymentRecord = await getPaymentByIntentId(paymentIntentId);
  if (!paymentRecord?.user_id) {
    return;
  }

  await upsertPayment({
    user_id: paymentRecord.user_id,
    stripe_payment_intent_id: paymentIntentId,
    stripe_customer_id:
      typeof charge.customer === "string" ? charge.customer : null,
    stripe_charge_id: charge.id,
    stripe_event_id: event.id,
    status: "disputed",
    amount: charge.amount,
    amount_refunded: charge.amount_refunded,
    currency: charge.currency,
    receipt_email: charge.billing_details.email,
    paid_at: null,
    refunded_at: null,
    disputed_at: new Date().toISOString(),
  });

  await updateUserAccess(paymentRecord.user_id, false, null);
}

export const handleCreatePaymentIntent: RequestHandler = async (req, res) => {
  try {
    const authUser = await getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const profile = await getUserProfile(authUser.id);
    if (profile.has_paid_access) {
      res.status(409).json({ message: "Payment already completed." });
      return;
    }

    const customerId = await ensureStripeCustomer(profile);
    const stripe = getStripeClient();
    const { amount, currency } = getBillingConfig();

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: profile.email || undefined,
      metadata: {
        userId: authUser.id,
      },
    });

    await upsertPayment({
      user_id: authUser.id,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: customerId,
      stripe_charge_id: null,
      stripe_event_id: null,
      status: paymentIntent.status,
      amount,
      amount_refunded: 0,
      currency,
      receipt_email: profile.email || null,
      paid_at: null,
      refunded_at: null,
      disputed_at: null,
    });

    if (!paymentIntent.client_secret) {
      res.status(500).json({ message: "Unable to initialize payment." });
      return;
    }

    const payload: BillingPaymentIntentResponse = {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency,
    };

    res.status(200).json(payload);
  } catch (error) {
    console.error("Failed to create payment intent", error);
    res.status(500).json({ message: "Unable to start payment." });
  }
};

export const handleBillingStatus: RequestHandler = async (req, res) => {
  try {
    const authUser = await getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const profile = await getUserProfile(authUser.id);
    const [companySlug, latestPaymentStatus] = await Promise.all([
      getCompanySlug(profile.company_id),
      getLatestPaymentStatus(authUser.id),
    ]);

    const payload: BillingStatusResponse = {
      hasPaidAccess: profile.has_paid_access,
      paidAt: profile.paid_at,
      onboardingCompletedAt: profile.onboarding_completed_at,
      companySlug,
      latestPaymentStatus,
    };

    res.status(200).json(payload);
  } catch (error) {
    console.error("Failed to fetch billing status", error);
    res.status(500).json({ message: "Unable to load billing status." });
  }
};

export const handleStripeWebhook: RequestHandler = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  if (!signature || Array.isArray(signature)) {
    res.status(400).send("Missing Stripe signature.");
    return;
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook payload.";
    res.status(400).send(message);
    return;
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(
          event,
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event,
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case "charge.refunded":
        await handleChargeRefunded(event, event.data.object as Stripe.Charge);
        break;
      case "charge.dispute.created":
        await handleChargeDisputed(event, event.data.object as Stripe.Dispute);
        break;
      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Failed to process Stripe webhook ${event.type}`, error);
    res.status(500).json({ message: "Webhook processing failed." });
  }
};
