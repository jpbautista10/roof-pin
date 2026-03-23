import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const valueStack = [
  { item: "Branded Live Map & Sales Tool", value: "$2,000+" },
  { item: "Before/After Photo Showcases", value: "$500" },
  { item: "Smart Review Routing System", value: "$1,000/yr" },
  { item: "QR Code Review Collection", value: "$300" },
  { item: "Bulk CSV Import (100s of past jobs)", value: "$200" },
  { item: "Lifetime Updates & New Features", value: "Priceless" },
];

const included = [
  "One-time payment — no subscriptions ever",
  "Lifetime access to all features",
  "All future updates included",
  "Personal onboarding support",
  "Branded with your logo & colors",
  "Unlimited pins & projects",
  "30-day money-back guarantee",
];

export default function PricingOffer() {
  return (
    <section id="pricing" className="py-16 sm:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            The no-brainer offer
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Everything you need.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">
              One price. Forever.
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            What usually costs thousands in custom development or locks you into
            monthly subscriptions — we give you for one flat payment.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="rounded-2xl border-2 border-primary/20 bg-white shadow-xl shadow-primary/5 overflow-hidden">
            {/* Value stack header */}
            <div className="bg-slate-50 px-4 sm:px-8 py-5 sm:py-6 border-b border-slate-200/80">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">
                Here&apos;s what you&apos;re getting
              </p>
              <div className="space-y-2.5 sm:space-y-3">
                {valueStack.map((v) => (
                  <div
                    key={v.item}
                    className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                  >
                    <span className="text-xs sm:text-sm text-slate-700 leading-snug">
                      {v.item}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-400 line-through shrink-0 sm:text-right">
                      {v.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Total Value</span>
                <span className="text-sm font-bold text-slate-400 line-through">$4,000+</span>
              </div>
            </div>

            {/* Price */}
            <div className="px-6 sm:px-8 py-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-2xl text-slate-400 line-through font-medium">$997</span>
                <span className="bg-teal-100 text-teal-700 text-xs font-bold uppercase px-2 py-1 rounded-full">
                  50% off
                </span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl sm:text-6xl font-extrabold text-slate-900">$497</span>
                <span className="text-lg text-slate-500 font-medium">one-time</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Lifetime access. No monthly fees. No per-lead charges. No surprises. Ever.
              </p>

              <Link
                to="/checkout"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                Get Lifetime Access Now
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Included checklist */}
              <div className="mt-8 text-left space-y-3">
                {included.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
