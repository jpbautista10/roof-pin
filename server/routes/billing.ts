import type {
  BillingCreateCheckoutOrderRequest,
  BillingPaymentIntentResponse,
  BillingStatusResponse,
  CheckoutOrderStatusResponse,
  SendCheckoutLoginLinkResponse,
} from "@shared/api";
import type { RequestHandler } from "express";
import type Stripe from "stripe";
import { z } from "zod";
import { getAuthenticatedUser } from "../lib/auth";
import { getAppUrl, getStripeWebhookSecret } from "../lib/env";
import { getBillingConfig, getStripeClient } from "../lib/stripe";
import { getSupabaseAdmin } from "../lib/supabase-admin";

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  has_paid_access: boolean;
  paid_at: string | null;
  onboarding_completed_at: string | null;
  company_id: string | null;
};

type CheckoutOrder = {
  id: string;
  public_token: string;
  auth_user_id: string | null;
  email: string;
  contact_name: string;
  company_name: string;
  stripe_payment_intent_id: string;
  stripe_customer_id: string | null;
  stripe_event_id: string | null;
  status: string;
  amount: number;
  amount_refunded: number;
  currency: string;
  paid_at: string | null;
  refunded_at: string | null;
  disputed_at: string | null;
  login_link_sent_at: string | null;
};

const checkoutSchema = z.object({
  email: z.string().trim().email(),
  contactName: z.string().trim().min(2).max(120),
  companyName: z.string().trim().min(2).max(160),
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function getUserProfile(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, email, full_name, has_paid_access, paid_at, onboarding_completed_at, company_id",
    )
    .eq("id", userId)
    .single<UserProfile>();

  if (error) {
    throw error;
  }

  return data;
}

async function getUserProfileByEmail(email: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, email, full_name, has_paid_access, paid_at, onboarding_completed_at, company_id",
    )
    .ilike("email", normalizeEmail(email))
    .maybeSingle<UserProfile>();

  if (error) {
    throw error;
  }

  return data;
}

async function getCheckoutOrderByIntentId(paymentIntentId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("checkout_orders")
    .select(
      "id, public_token, auth_user_id, email, contact_name, company_name, stripe_payment_intent_id, stripe_customer_id, stripe_event_id, status, amount, amount_refunded, currency, paid_at, refunded_at, disputed_at, login_link_sent_at",
    )
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle<CheckoutOrder>();

  if (error) {
    throw error;
  }

  return data;
}

async function getCheckoutOrderByToken(token: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("checkout_orders")
    .select(
      "id, public_token, auth_user_id, email, contact_name, company_name, stripe_payment_intent_id, stripe_customer_id, stripe_event_id, status, amount, amount_refunded, currency, paid_at, refunded_at, disputed_at, login_link_sent_at",
    )
    .eq("public_token", token)
    .maybeSingle<CheckoutOrder>();

  if (error) {
    throw error;
  }

  return data;
}

async function getLatestCheckoutOrderForUser(userId: string, email: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const normalizedEmail = normalizeEmail(email);
  const { data, error } = await supabaseAdmin
    .from("checkout_orders")
    .select("status")
    .or(`auth_user_id.eq.${userId},email.eq.${normalizedEmail}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ status: string }>();

  if (error) {
    throw error;
  }

  return data?.status ?? null;
}

async function getLatestPaidCheckoutOrderForAuthUser(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("checkout_orders")
    .select(
      "id, public_token, auth_user_id, email, contact_name, company_name, stripe_payment_intent_id, stripe_customer_id, stripe_event_id, status, amount, amount_refunded, currency, paid_at, refunded_at, disputed_at, login_link_sent_at",
    )
    .eq("auth_user_id", userId)
    .not("paid_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<CheckoutOrder>();

  if (error) {
    throw error;
  }

  return data;
}

async function getExistingStripeCustomerId(email: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("checkout_orders")
    .select("stripe_customer_id")
    .eq("email", normalizeEmail(email))
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ stripe_customer_id: string }>();

  if (error) {
    throw error;
  }

  return data?.stripe_customer_id ?? null;
}

async function ensureStripeCustomer(
  email: string,
  contactName: string,
  companyName: string,
) {
  const existingCustomerId = await getExistingStripeCustomerId(email);
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email,
    name: contactName,
    metadata: {
      checkoutEmail: email,
      companyName,
    },
  });

  return customer.id;
}

async function insertCheckoutOrder(order: {
  email: string;
  contact_name: string;
  company_name: string;
  stripe_payment_intent_id: string;
  stripe_customer_id: string | null;
  status: string;
  amount: number;
  currency: string;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("checkout_orders")
    .insert(order)
    .select(
      "id, public_token, auth_user_id, email, contact_name, company_name, stripe_payment_intent_id, stripe_customer_id, stripe_event_id, status, amount, amount_refunded, currency, paid_at, refunded_at, disputed_at, login_link_sent_at",
    )
    .single<CheckoutOrder>();

  if (error) {
    throw error;
  }

  return data;
}

async function upsertCheckoutOrder(order: CheckoutOrder) {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.from("checkout_orders").upsert(order, {
    onConflict: "stripe_payment_intent_id",
  });

  if (error) {
    throw error;
  }
}

async function updateUserAccess(
  userId: string,
  values: {
    email: string;
    fullName?: string | null;
    hasPaidAccess: boolean;
    paidAt: string | null;
  },
) {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from("users")
    .update({
      email: values.email,
      full_name: values.fullName ?? null,
      has_paid_access: values.hasPaidAccess,
      paid_at: values.paidAt,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

async function linkOrderToUser(orderId: string, userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from("checkout_orders")
    .update({ auth_user_id: userId })
    .eq("id", orderId);

  if (error) {
    throw error;
  }
}

async function ensureAuthUserForOrder(order: CheckoutOrder) {
  const existingProfile = await getUserProfileByEmail(order.email);
  if (existingProfile) {
    await linkOrderToUser(order.id, existingProfile.id);
    return existingProfile;
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: order.email,
    email_confirm: true,
    user_metadata: {
      full_name: order.contact_name,
      company_name: order.company_name,
    },
  });

  if (error || !data.user) {
    throw error ?? new Error("Unable to create auth user.");
  }

  await updateUserAccess(data.user.id, {
    email: order.email,
    fullName: order.contact_name,
    hasPaidAccess: order.status === "succeeded",
    paidAt: order.paid_at,
  });
  await linkOrderToUser(order.id, data.user.id);

  return {
    id: data.user.id,
    email: order.email,
    full_name: order.contact_name,
    has_paid_access: order.status === "succeeded",
    paid_at: order.paid_at,
    onboarding_completed_at: null,
    company_id: null,
  } satisfies UserProfile;
}

async function sendMagicLinkEmail(order: CheckoutOrder, force = false) {
  if (order.login_link_sent_at && !force) {
    return order.login_link_sent_at;
  }

  const user = await ensureAuthUserForOrder(order);

  await updateUserAccess(user.id, {
    email: order.email,
    fullName: order.contact_name,
    hasPaidAccess: order.status === "succeeded",
    paidAt: order.paid_at,
  });

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.auth.signInWithOtp({
    email: order.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${getAppUrl()}/auth/login?next=${encodeURIComponent("/dashboard")}`,
    },
  });

  if (error) {
    throw error;
  }

  const sentAt = new Date().toISOString();
  const { error: updateError } = await supabaseAdmin
    .from("checkout_orders")
    .update({
      auth_user_id: user.id,
      login_link_sent_at: sentAt,
    })
    .eq("id", order.id);

  if (updateError) {
    throw updateError;
  }

  return sentAt;
}

async function updateOrderForRevokedAccess(
  order: CheckoutOrder,
  nextStatus: "refunded" | "disputed",
) {
  const revokedAt = new Date().toISOString();
  await upsertCheckoutOrder({
    ...order,
    status: nextStatus,
    paid_at: null,
    refunded_at: nextStatus === "refunded" ? revokedAt : null,
    disputed_at: nextStatus === "disputed" ? revokedAt : null,
  });

  const targetUserId =
    order.auth_user_id ?? (await getUserProfileByEmail(order.email))?.id;
  if (targetUserId) {
    await updateUserAccess(targetUserId, {
      email: order.email,
      fullName: order.contact_name,
      hasPaidAccess: false,
      paidAt: null,
    });
  }
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

async function handlePaymentIntentSucceeded(
  event: Stripe.Event,
  paymentIntent: Stripe.PaymentIntent,
) {
  const order = await getCheckoutOrderByIntentId(paymentIntent.id);
  if (!order) {
    throw new Error(`Unable to resolve checkout order for ${paymentIntent.id}`);
  }

  const paidAt = new Date(paymentIntent.created * 1000).toISOString();
  const nextOrder: CheckoutOrder = {
    ...order,
    stripe_customer_id:
      typeof paymentIntent.customer === "string"
        ? paymentIntent.customer
        : null,
    stripe_event_id: event.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    amount_refunded: 0,
    currency: paymentIntent.currency,
    paid_at: paidAt,
    refunded_at: null,
    disputed_at: null,
  };

  await upsertCheckoutOrder(nextOrder);
  const user = await ensureAuthUserForOrder(nextOrder);
  await updateUserAccess(user.id, {
    email: nextOrder.email,
    fullName: nextOrder.contact_name,
    hasPaidAccess: true,
    paidAt,
  });
  await sendMagicLinkEmail(nextOrder);
}

async function handlePaymentIntentFailed(
  event: Stripe.Event,
  paymentIntent: Stripe.PaymentIntent,
) {
  const order = await getCheckoutOrderByIntentId(paymentIntent.id);
  if (!order) {
    return;
  }

  await upsertCheckoutOrder({
    ...order,
    stripe_customer_id:
      typeof paymentIntent.customer === "string"
        ? paymentIntent.customer
        : null,
    stripe_event_id: event.id,
    status: "payment_failed",
    amount: paymentIntent.amount,
    amount_refunded: 0,
    currency: paymentIntent.currency,
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

  const order = await getCheckoutOrderByIntentId(paymentIntentId);
  if (!order) {
    return;
  }

  await updateOrderForRevokedAccess(
    {
      ...order,
      stripe_customer_id:
        typeof charge.customer === "string" ? charge.customer : null,
      stripe_event_id: event.id,
      amount: charge.amount,
      amount_refunded: charge.amount_refunded,
      currency: charge.currency,
    },
    "refunded",
  );
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

  const order = await getCheckoutOrderByIntentId(paymentIntentId);
  if (!order) {
    return;
  }

  await updateOrderForRevokedAccess(
    {
      ...order,
      stripe_customer_id:
        typeof charge.customer === "string" ? charge.customer : null,
      stripe_event_id: event.id,
      amount: charge.amount,
      amount_refunded: charge.amount_refunded,
      currency: charge.currency,
    },
    "disputed",
  );
}

export const handleCreatePaymentIntent: RequestHandler = async (req, res) => {
  try {
    const parsed = checkoutSchema.safeParse(
      req.body satisfies BillingCreateCheckoutOrderRequest,
    );
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Enter your name, company name, and email." });
      return;
    }

    const email = normalizeEmail(parsed.data.email);
    const contactName = parsed.data.contactName.trim();
    const companyName = parsed.data.companyName.trim();
    const existingUser = await getUserProfileByEmail(email);

    if (existingUser?.has_paid_access) {
      res.status(409).json({
        message:
          "This email already has lifetime access. Use the login link to continue.",
      });
      return;
    }

    const stripe = getStripeClient();
    const customerId = await ensureStripeCustomer(
      email,
      contactName,
      companyName,
    );
    const { amount, currency } = getBillingConfig();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: email,
      metadata: {
        checkoutEmail: email,
        contactName,
        companyName,
      },
    });

    if (!paymentIntent.client_secret) {
      res.status(500).json({ message: "Unable to initialize payment." });
      return;
    }

    const order = await insertCheckoutOrder({
      email,
      contact_name: contactName,
      company_name: companyName,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: customerId,
      status: paymentIntent.status,
      amount,
      currency,
    });

    const payload: BillingPaymentIntentResponse = {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderToken: order.public_token,
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
      getLatestCheckoutOrderForUser(authUser.id, profile.email),
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

export const handleCheckoutOrderStatus: RequestHandler = async (req, res) => {
  try {
    const token = typeof req.query.token === "string" ? req.query.token : null;
    if (!token) {
      res.status(400).json({ message: "Missing checkout token." });
      return;
    }

    const order = await getCheckoutOrderByToken(token);
    if (!order) {
      res.status(404).json({ message: "Checkout order not found." });
      return;
    }

    const payload: CheckoutOrderStatusResponse = {
      email: order.email,
      contactName: order.contact_name,
      companyName: order.company_name,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      paidAt: order.paid_at,
      loginLinkSentAt: order.login_link_sent_at,
    };

    res.status(200).json(payload);
  } catch (error) {
    console.error("Failed to fetch checkout order status", error);
    res.status(500).json({ message: "Unable to load checkout status." });
  }
};

export const handleSendCheckoutLoginLink: RequestHandler = async (req, res) => {
  try {
    const token = z.string().uuid().safeParse(req.body?.token);
    if (!token.success) {
      res.status(400).json({ message: "Missing checkout token." });
      return;
    }

    const order = await getCheckoutOrderByToken(token.data);
    if (!order) {
      res.status(404).json({ message: "Checkout order not found." });
      return;
    }

    if (order.status !== "succeeded") {
      res.status(409).json({ message: "Payment is not complete yet." });
      return;
    }

    const sentAt = await sendMagicLinkEmail(order, true);
    const payload: SendCheckoutLoginLinkResponse = {
      ok: true,
      sentAt,
    };

    res.status(200).json(payload);
  } catch (error) {
    console.error("Failed to send checkout login link", error);
    res.status(500).json({ message: "Unable to send login link." });
  }
};

export const handleLatestCheckoutOrder: RequestHandler = async (req, res) => {
  try {
    const authUser = await getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const order = await getLatestPaidCheckoutOrderForAuthUser(authUser.id);
    if (!order) {
      res.status(404).json({ message: "No paid checkout order found." });
      return;
    }

    const payload: CheckoutOrderStatusResponse = {
      email: order.email,
      contactName: order.contact_name,
      companyName: order.company_name,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      paidAt: order.paid_at,
      loginLinkSentAt: order.login_link_sent_at,
    };

    res.status(200).json(payload);
  } catch (error) {
    console.error("Failed to fetch latest checkout order", error);
    res.status(500).json({ message: "Unable to load checkout order." });
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
