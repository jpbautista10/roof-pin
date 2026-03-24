function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseUrl() {
  return process.env.SUPABASE_URL?.trim() || requireEnv("VITE_SUPABASE_URL");
}

export function getSupabaseServiceRoleKey() {
  return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function getStripeSecretKey() {
  return requireEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret() {
  return requireEnv("STRIPE_WEBHOOK_SECRET");
}

export function getStripeCurrency() {
  return process.env.STRIPE_CURRENCY?.trim().toLowerCase() || "usd";
}

export function getStripeLifetimeAmount() {
  const rawValue = process.env.STRIPE_LIFETIME_PRICE_AMOUNT?.trim() || "49700";
  const amount = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("STRIPE_LIFETIME_PRICE_AMOUNT must be a positive integer.");
  }

  return amount;
}
