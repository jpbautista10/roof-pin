import { ShieldCheck } from "lucide-react";

export default function GuaranteeSection() {
  return (
    <section className="py-16 sm:py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-2xl bg-white border border-slate-200/80 p-8 sm:p-12 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-teal-600" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            30-Day No-Questions-Asked Money-Back Guarantee
          </h2>

          <p className="text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Try it for 30 days. Use it at your appointments. Import your jobs.
            If it doesn't help your team close more deals, email us and we'll
            refund every penny. No hoops, no hassle, no hard feelings.
          </p>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Full refund
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              No questions asked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Email us anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
