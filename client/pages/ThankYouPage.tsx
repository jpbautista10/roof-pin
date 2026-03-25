import type {
  CheckoutOrderStatusResponse,
  SendCheckoutLoginLinkResponse,
} from "@shared/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Mail, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { company, dbUser, hasPaidAccess } = useAuth();
  const autoSendTriggeredRef = useRef(false);

  const orderQuery = useQuery({
    queryKey: ["billing", "checkout-order", token],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await fetch(
        `/api/billing/checkout-order?token=${encodeURIComponent(token ?? "")}`,
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(payload?.message ?? "Unable to load checkout status.");
      }

      return (await response.json()) as CheckoutOrderStatusResponse;
    },
    refetchInterval: (query) => {
      const order = query.state.data;
      if (!order) {
        return 2500;
      }

      if (order.status !== "succeeded") {
        return 2500;
      }

      return order.loginLinkSentAt ? false : 2500;
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/billing/send-login-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(payload?.message ?? "Unable to send login link.");
      }

      return (await response.json()) as SendCheckoutLoginLinkResponse;
    },
    onSuccess: () => {
      void orderQuery.refetch();
    },
  });

  useEffect(() => {
    if (
      token &&
      orderQuery.data?.status === "succeeded" &&
      !orderQuery.data.loginLinkSentAt &&
      !resendMutation.isPending &&
      !autoSendTriggeredRef.current
    ) {
      autoSendTriggeredRef.current = true;
      resendMutation.mutate();
    }
  }, [orderQuery.data, resendMutation.isPending, resendMutation.mutate, token]);

  const email = orderQuery.data?.email ?? "";
  const loginLinkHref = useMemo(() => {
    if (!email) {
      return "/auth/login";
    }

    return `/auth/login?email=${encodeURIComponent(email)}`;
  }, [email]);

  if (hasPaidAccess) {
    if (dbUser?.onboarding_completed_at && company?.slug) {
      return <Navigate to={`/dashboard/${company.slug}`} replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-teal-50/30 px-4 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
        <div className="mb-8 flex justify-center">
          <BrandLogo to="/" />
        </div>

        {!token ? (
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              Missing checkout link
            </h1>
            <p className="text-slate-600">
              Return to the checkout flow to complete your purchase.
            </p>
            <Button asChild>
              <Link to="/get-started">Back to funnel</Link>
            </Button>
          </div>
        ) : orderQuery.isLoading ? (
          <div className="space-y-4 py-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <h1 className="text-3xl font-bold text-slate-900">
              Confirming your payment...
            </h1>
            <p className="text-slate-600">
              We are syncing your order and preparing your login link.
            </p>
          </div>
        ) : orderQuery.isError ? (
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              We could not load your checkout status
            </h1>
            <p className="text-slate-600">
              {orderQuery.error instanceof Error
                ? orderQuery.error.message
                : "Please refresh and try again."}
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => void orderQuery.refetch()}
              >
                Try again
              </Button>
              <Button asChild>
                <Link to="/support">Contact support</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-100">
              <CheckCircle2 className="h-10 w-10 text-teal-600" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                {orderQuery.data.status === "succeeded"
                  ? "Payment received"
                  : "Payment is still processing"}
              </h1>
              <p className="mx-auto max-w-lg text-lg text-slate-600">
                {orderQuery.data.status === "succeeded"
                  ? "Check your email for your magic login link. Once you open it, we will send you straight into onboarding."
                  : "Please keep this page open. We will update it as soon as Stripe confirms the charge."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left text-sm text-slate-600">
              <div className="flex items-center gap-2 font-medium text-slate-900">
                <Mail className="h-4 w-4 text-primary" />
                Login link destination
              </div>
              <p className="mt-2">{orderQuery.data.email}</p>
              <p className="mt-4 text-slate-500">
                Company: {orderQuery.data.companyName}
              </p>
              <p className="text-slate-500">
                Charge:{" "}
                {formatPrice(orderQuery.data.amount, orderQuery.data.currency)}
              </p>
            </div>

            {orderQuery.data.status === "succeeded" ? (
              <>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  {orderQuery.data.loginLinkSentAt
                    ? `A login link was sent to ${orderQuery.data.email}.`
                    : "Your payment is confirmed. Sending your login link now..."}
                </div>

                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resendMutation.mutate()}
                    disabled={resendMutation.isPending}
                  >
                    {resendMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Resend login link
                      </>
                    )}
                  </Button>
                  <Button asChild>
                    <Link to={loginLinkHref}>Go to login page</Link>
                  </Button>
                </div>
              </>
            ) : null}

            <p className="text-sm text-slate-500">
              Wrong email or need help? Visit{" "}
              <Link to="/support" className="font-medium text-primary">
                support
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
