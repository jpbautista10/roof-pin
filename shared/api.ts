/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface GeocodeSuggestion {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  city: string | null;
  state: string | null;
  country: string | null;
  postcode: string | null;
}

export interface GeocodeSuggestResponse {
  suggestions: GeocodeSuggestion[];
}

export interface BillingPaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  orderToken: string;
  amount: number;
  currency: string;
}

export interface BillingStatusResponse {
  hasPaidAccess: boolean;
  paidAt: string | null;
  onboardingCompletedAt: string | null;
  companySlug: string | null;
  latestPaymentStatus: string | null;
}

export interface BillingCreateCheckoutOrderRequest {
  email: string;
  contactName: string;
  companyName: string;
}

export interface CheckoutOrderStatusResponse {
  email: string;
  contactName: string;
  companyName: string;
  status: string;
  amount: number;
  currency: string;
  paidAt: string | null;
  loginLinkSentAt: string | null;
}

export interface SendCheckoutLoginLinkRequest {
  token: string;
}

export interface SendCheckoutLoginLinkResponse {
  ok: boolean;
  sentAt: string;
}

/** POST /api/support — contact form (website field is honeypot; omit or empty) */
export interface SupportContactRequest {
  name: string;
  /** Business or organization name (optional) */
  companyName?: string;
  email: string;
  subject: string;
  message: string;
  /** Bot trap — must be empty */
  website?: string;
}

export interface SupportContactResponse {
  ok: boolean;
  message?: string;
  error?: string;
}
