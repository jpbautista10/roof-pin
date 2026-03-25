import { zodResolver } from "@hookform/resolvers/zod";
import type {
  BillingCreateCheckoutOrderRequest,
  BillingPaymentIntentResponse,
} from "@shared/api";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Check, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/auth/AuthProvider";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { stripePromise } from "@/lib/stripe";

const includedItems = [
  "One-time payment",
  "Lifetime access",
  "30-day money-back guarantee",
  "Magic-link login included",
];

const checkoutDetailsSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  contactName: z.string().trim().min(2, "Enter your full name"),
  companyName: z.string().trim().min(2, "Enter your company name"),
});

type CheckoutDetailsValues = z.infer<typeof checkoutDetailsSchema>;

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function CheckoutForm({
  amount,
  currency,
  orderToken,
  email,
  contactName,
  companyName,
}: BillingPaymentIntentResponse & CheckoutDetailsValues) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        return_url: `${window.location.origin}/thank-you?token=${encodeURIComponent(orderToken)}`,
        payment_method_data: {
          billing_details: {
            email,
            name: contactName,
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
      navigate(`/thank-you?token=${encodeURIComponent(orderToken)}`, {
        replace: true,
      });
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
                email,
                name: contactName,
              },
            },
          }}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-900">Purchasing for</p>
        <p className="mt-1">{companyName}</p>
        <p>{email}</p>
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
          ? "Processing..."
          : `Pay ${formatPrice(amount, currency)} - Get Lifetime Access`}
      </Button>

      <p className="text-center text-xs text-slate-400">
        Powered by Stripe. We will email your magic login link after payment.
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { company, dbUser, hasPaidAccess, isLoading, user } = useAuth();
  const [checkoutData, setCheckoutData] = useState<
    (BillingPaymentIntentResponse & CheckoutDetailsValues) | null
  >(null);

  const form = useForm<CheckoutDetailsValues>({
    resolver: zodResolver(checkoutDetailsSchema),
    defaultValues: {
      email: user?.email ?? "",
      contactName: dbUser?.full_name ?? "",
      companyName: company?.name ?? "",
    },
  });

  useEffect(() => {
    if (checkoutData) {
      return;
    }

    form.reset({
      email: user?.email ?? form.getValues("email"),
      contactName: dbUser?.full_name ?? form.getValues("contactName"),
      companyName: company?.name ?? form.getValues("companyName"),
    });
  }, [checkoutData, company?.name, dbUser?.full_name, form, user?.email]);

  const createIntentMutation = useMutation({
    mutationFn: async (values: CheckoutDetailsValues) => {
      const payload: BillingCreateCheckoutOrderRequest = {
        email: values.email.trim().toLowerCase(),
        contactName: values.contactName.trim(),
        companyName: values.companyName.trim(),
      };

      const response = await fetch("/api/billing/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(data?.message ?? "Unable to start payment.");
      }

      const paymentIntent =
        (await response.json()) as BillingPaymentIntentResponse;
      return {
        ...paymentIntent,
        ...payload,
      };
    },
    onSuccess: (data) => {
      setCheckoutData(data);
    },
  });

  const elementsOptions = useMemo(
    () =>
      checkoutData
        ? {
            clientSecret: checkoutData.clientSecret,
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
    [checkoutData],
  );

  const onSubmit = form.handleSubmit(async (values) => {
    await createIntentMutation.mutateAsync(values);
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Loading checkout...</p>
      </div>
    );
  }

  if (hasPaidAccess) {
    if (dbUser?.onboarding_completed_at && company?.slug) {
      return <Navigate to={`/dashboard/${company.slug}`} replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link
            to="/get-started"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <BrandLogo to="/" size="sm" />
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Lock className="h-3 w-3" />
            Secure
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:order-2 lg:col-span-2">
            <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
                Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Lifetime Access</span>
                  <span className="font-medium text-slate-900">$497.00</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 line-through">
                  <span>Regular Price</span>
                  <span>$997.00</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 font-bold text-slate-900">
                <span>Total</span>
                <span>$497.00</span>
              </div>

              <div className="mt-6 space-y-2">
                {includedItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs text-slate-500"
                  >
                    <Check className="h-3.5 w-3.5 text-teal-500" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-teal-500" />
                SSL Encrypted Payment
              </div>
            </div>
          </div>

          <div className="lg:order-1 lg:col-span-3">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">
                Checkout
              </p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                Buy now. We email your login link after payment.
              </h1>
              <p className="mt-3 text-base text-slate-600">
                Enter the basics first so we can attach lifetime access to the
                right email and prefill your onboarding.
              </p>
            </div>

            <div className="mt-8 space-y-6">
              {!checkoutData ? (
                <form
                  className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  onSubmit={onSubmit}
                >
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Account details
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      These details are required before payment and will be used
                      for your magic login link.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-700"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      placeholder="you@company.com"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email ? (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.email.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="contactName"
                      className="text-sm font-medium text-slate-700"
                    >
                      Your name
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      autoComplete="name"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      placeholder="Alex Carter"
                      {...form.register("contactName")}
                    />
                    {form.formState.errors.contactName ? (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.contactName.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="companyName"
                      className="text-sm font-medium text-slate-700"
                    >
                      Company name
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      autoComplete="organization"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      placeholder="Acme Roofing"
                      {...form.register("companyName")}
                    />
                    {form.formState.errors.companyName ? (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.companyName.message}
                      </p>
                    ) : null}
                  </div>

                  {createIntentMutation.isError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {createIntentMutation.error instanceof Error
                        ? createIntentMutation.error.message
                        : "Unable to start checkout."}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createIntentMutation.isPending}
                  >
                    {createIntentMutation.isPending
                      ? "Preparing secure checkout..."
                      : "Continue to payment"}
                  </Button>
                </form>
              ) : elementsOptions ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Your payment will unlock lifetime access for{" "}
                    {checkoutData.email}.
                  </div>

                  <Elements stripe={stripePromise} options={elementsOptions}>
                    <CheckoutForm {...checkoutData} />
                  </Elements>

                  <button
                    type="button"
                    onClick={() => setCheckoutData(null)}
                    className="text-sm text-slate-500 hover:text-slate-800"
                  >
                    Edit account details
                  </button>
                </div>
              ) : null}

              <div className="text-sm text-slate-500">
                Already purchased?{" "}
                <Link to="/auth/login" className="font-medium text-primary">
                  Get your login link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
