import Stripe from "stripe";
import {
  getStripeCurrency,
  getStripeLifetimeAmount,
  getStripeSecretKey,
} from "./env";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey());
  }

  return stripeClient;
}

export function getBillingConfig() {
  return {
    amount: getStripeLifetimeAmount(),
    currency: getStripeCurrency(),
  };
}
