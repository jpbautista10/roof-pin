import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Check, ArrowLeft, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    card: "",
    expiry: "",
    cvc: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      navigate("/welcome");
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/get-started" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <BrandLogo to="/" size="sm" />
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Lock className="w-3 h-3" />
            Secure
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Lifetime Access</span>
                  <span className="text-slate-900 font-medium">$497.00</span>
                </div>
                <div className="flex justify-between text-slate-400 line-through text-xs">
                  <span>Regular Price</span>
                  <span>$997.00</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Total</span>
                <span>$497.00</span>
              </div>

              <div className="mt-6 space-y-2">
                {[
                  "One-time payment",
                  "Lifetime access",
                  "30-day money-back guarantee",
                  "Personal onboarding included",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-slate-500">
                    <Check className="w-3.5 h-3.5 text-teal-500" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-teal-500" />
                SSL Encrypted Payment
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-3 order-1 md:order-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Complete Your Purchase
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Smith"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@company.com"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  value={form.card}
                  onChange={(e) => setForm({ ...form, card: e.target.value })}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Expiry
                  </label>
                  <input
                    type="text"
                    required
                    value={form.expiry}
                    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    CVC
                  </label>
                  <input
                    type="text"
                    required
                    value={form.cvc}
                    onChange={(e) => setForm({ ...form, cvc: e.target.value })}
                    placeholder="123"
                    maxLength={4}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full rounded-lg bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Pay $497 — Get Lifetime Access"
                )}
              </button>

              <p className="text-xs text-slate-400 text-center mt-2">
                Powered by Stripe. Your payment info is encrypted and secure.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
