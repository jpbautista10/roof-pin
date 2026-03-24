import type { BillingPaymentIntentResponse } from "@shared/api";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Lock, MapPin, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { stripePromise } from "@/lib/stripe";

const includedItems = [
  "One-time payment",
  "Lifetime access",
  "30-day money-back guarantee",
  "Personal onboarding included",
];

async function sleep(ms: number) {
  await new Promise((resolve) => window.setTimeout(resolve, ms));
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function CheckoutForm({
  clientSecret,
  amount,
  currency,
}: BillingPaymentIntentResponse) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { company, dbUser, refreshProfile, session, user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function waitForEntitlement() {
    if (!session?.access_token) {
      throw new Error("Missing session.");
    }

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const response = await fetch("/api/billing/payment-status", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to verify payment status.");
      }

      const payload = (await response.json()) as {
        hasPaidAccess: boolean;
      };

      if (payload.hasPaidAccess) {
        return;
      }

      await sleep(1000);
    }

    throw new Error(
      "Payment is processing. Refresh in a moment if access does not unlock.",
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        payment_method_data: {
          billing_details: {
            email: user?.email ?? undefined,
            name: company?.name ?? undefined,
          },
        },
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message ?? "Payment failed.");
      setIsSubmitting(false);
      return;
    }

    if (
      result.paymentIntent?.status === "succeeded" ||
      result.paymentIntent?.status === "processing"
    ) {
      try {
        await waitForEntitlement();
        await refreshProfile();
        navigate("/welcome", { replace: true });
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to verify payment.",
        );
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    setErrorMessage(
      "Your payment still needs attention. Please review the form and try again.",
    );
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <PaymentElement
          options={{
            defaultValues: {
              billingDetails: {
                email: user?.email ?? "",
                name: company?.name ?? "",
              },
            },
          }}
        />
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <Button
        type="submit"
        className="w-full py-6 text-base"
        disabled={!stripe || !elements || isSubmitting}
      >
        {isSubmitting
          ? "Processing payment..."
          : `Pay ${formatPrice(amount, currency)} - Get lifetime access`}
      </Button>

      <p className="text-xs text-slate-400 text-center">
        Secure checkout powered by Stripe Elements. Access unlocks after the
        payment webhook confirms your charge.
      </p>

      {!dbUser?.has_paid_access ? null : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => navigate("/welcome", { replace: true })}
        >
          Continue to setup
        </Button>
      )}
    </form>
  );
}

export default function CheckoutPage() {
  const { company, dbUser, hasPaidAccess, isLoading, session } = useAuth();
  const navigate = useNavigate();

  const paymentIntentQuery = useQuery({
    queryKey: ["billing", "payment-intent", session?.user.id],
    enabled: Boolean(session?.access_token) && !hasPaidAccess,
    queryFn: async () => {
      const response = await fetch("/api/billing/create-payment-intent", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(payload?.message ?? "Unable to start payment.");
      }

      return (await response.json()) as BillingPaymentIntentResponse;
    },
    retry: false,
  });

  const elementsOptions = useMemo(
    () =>
      paymentIntentQuery.data
        ? {
            clientSecret: paymentIntentQuery.data.clientSecret,
            appearance: {
              theme: "stripe" as const,
              variables: {
                colorPrimary: "#0f766e",
                colorBackground: "#ffffff",
                colorText: "#0f172a",
                colorDanger: "#dc2626",
                borderRadius: "16px",
              },
            },
          }
        : undefined,
    [paymentIntentQuery.data],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Loading checkout...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth/login" replace />;
  }

  if (hasPaidAccess) {
    if (dbUser?.onboarding_completed_at && company?.slug) {
      return <Navigate to={`/dashboard/${company.slug}`} replace />;
    }

    return <Navigate to="/welcome" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900">
              Neighborhood Proof
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Lock className="w-3 h-3" />
            Secure
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2 lg:order-2">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sticky top-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Lifetime Access
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Neighborhood Proof</span>
                  <span className="text-slate-900 font-medium">$497.00</span>
                </div>
                <div className="flex justify-between text-slate-400 line-through text-xs">
                  <span>Regular price</span>
                  <span>$997.00</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Total</span>
                <span>$497.00</span>
              </div>

              <div className="mt-6 space-y-2">
                {includedItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs text-slate-500"
                  >
                    <Check className="w-3.5 h-3.5 text-teal-500" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">
                  What happens next
                </p>
                <p className="mt-2">
                  After payment clears, we unlock your account immediately and
                  send you into onboarding to create your branded map and
                  dashboard.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-teal-500" />
                SSL encrypted payment
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 lg:order-1">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">
                Payment gate
              </p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                Unlock your account with a one-time payment
              </h1>
              <p className="mt-3 text-base text-slate-600">
                Sign-up comes first, payment comes second, and setup comes last.
                Once Stripe confirms your payment, we unlock onboarding and your
                future dashboard access.
              </p>
            </div>

            <div className="mt-8">
              {paymentIntentQuery.isLoading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
                  Preparing secure checkout...
                </div>
              ) : paymentIntentQuery.isError ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  {paymentIntentQuery.error instanceof Error
                    ? paymentIntentQuery.error.message
                    : "Unable to load checkout."}
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => paymentIntentQuery.refetch()}
                    >
                      Try again
                    </Button>
                  </div>
                </div>
              ) : paymentIntentQuery.data && elementsOptions ? (
                <Elements stripe={stripePromise} options={elementsOptions}>
                  <CheckoutForm {...paymentIntentQuery.data} />
                </Elements>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
                  Unable to initialize Stripe checkout.
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate("/auth/login", { replace: true })}
                className="mt-6 text-sm text-slate-500 hover:text-slate-800"
              >
                Switch accounts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
