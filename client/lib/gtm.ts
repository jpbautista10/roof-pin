type GTMPrimitive = string | number | boolean | null | undefined;

type GTMEventParams = Record<string, GTMPrimitive | GTMPrimitive[] | GTMItem[]>;

export type GTMItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

type PageViewParams = {
  page_path: string;
  page_title: string;
  page_location?: string;
};

type CheckoutEventParams = {
  currency: string;
  value: number;
  items: GTMItem[];
  order_token?: string;
  payment_intent_id?: string;
  checkout_step?: string;
};

type PurchaseEventParams = CheckoutEventParams & {
  transaction_id: string;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function pushGtmEvent(event: string, params: GTMEventParams = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...params,
  });
}

export function trackPageView({
  page_path,
  page_title,
  page_location,
}: PageViewParams) {
  pushGtmEvent("page_view", {
    page_path,
    page_title,
    page_location:
      page_location ??
      (typeof window !== "undefined" ? window.location.href : page_path),
  });
}

export function trackBeginCheckout(params: CheckoutEventParams) {
  pushGtmEvent("begin_checkout", params);
}

export function trackCheckoutProgress(params: CheckoutEventParams) {
  pushGtmEvent("checkout_progress", params);
}

export function trackAddPaymentInfo(params: CheckoutEventParams) {
  pushGtmEvent("add_payment_info", params);
}

export function trackPurchase(params: PurchaseEventParams) {
  pushGtmEvent("purchase", params);
}

export function buildLifetimeAccessItem(value: number): GTMItem {
  return {
    item_id: "roof-wise-pro-lifetime",
    item_name: "Roof Wise Pro Lifetime Access",
    item_category: "Software",
    item_variant: "One-time purchase",
    price: value,
    quantity: 1,
  };
}
