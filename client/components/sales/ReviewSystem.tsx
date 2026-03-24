import { ArrowRight, ShieldAlert, Star, ThumbsUp } from "lucide-react";

const steps = [
  {
    num: "1",
    title: "Finish the job",
    description:
      "Hand the homeowner a QR code or send them your branded review link.",
    icon: "🏠",
  },
  {
    num: "2",
    title: "They submit a review",
    description:
      "Through your branded page — clean, professional, takes 30 seconds.",
    icon: "📝",
  },
  {
    num: "3",
    title: "Smart routing kicks in",
    description:
      "Our system automatically routes the review based on the rating.",
    icon: "🔀",
  },
];

export default function ReviewSystem() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Smart review system
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Turn every review into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">
              revenue
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Bad reviews get handled before they hit Google. Good reviews get
            amplified where they matter most.
          </p>
        </div>

        {/* Flow steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-10 -right-3 z-10">
                  <ArrowRight className="w-5 h-5 text-slate-300" />
                </div>
              )}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center h-full">
                <div className="text-3xl mb-3">{s.icon}</div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                  Step {s.num}
                </p>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-600">{s.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two outcomes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-red-200/60 bg-red-50/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Bad review?
                </p>
                <p className="text-xs text-red-600 font-medium">
                  Routed to your team
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Goes straight to your internal team so you can fix the issue{" "}
              <span className="font-medium text-slate-800">
                before it ever hits Google
              </span>
              . The customer feels heard, the problem gets resolved, and your
              online reputation stays clean.
            </p>
          </div>

          <div className="rounded-2xl border border-teal-200/60 bg-teal-50/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Good review?
                </p>
                <p className="text-xs text-teal-600 font-medium">
                  Amplified everywhere
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              The customer gets prompted to also post on{" "}
              <span className="font-medium text-slate-800">
                Google, Yelp, and other platforms
              </span>
              . Your best reviews automatically get shared where prospects are
              actually searching.
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-slate-500 max-w-lg mx-auto">
          Win-win: customers feel taken care of. You get 5-star reviews where
          they matter. Bad experiences get resolved instead of ignored on
          Google.
        </p>
      </div>
    </section>
  );
}
