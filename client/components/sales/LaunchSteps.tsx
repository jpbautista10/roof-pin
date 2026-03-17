import { CreditCard, Upload, Rocket } from "lucide-react";

const steps = [
  {
    icon: CreditCard,
    num: "1",
    title: "Buy",
    description: "One-time payment, instant access. No subscriptions, no contracts.",
  },
  {
    icon: Upload,
    num: "2",
    title: "Import",
    description: "Upload your logo, CSV-import your past jobs, pick your brand colors. 5 minutes.",
  },
  {
    icon: Rocket,
    num: "3",
    title: "Close",
    description: "Pull it up at your next appointment. Watch prospects say yes.",
  },
];

export default function LaunchSteps() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Dead simple
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Live in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">
              10 minutes
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            No developers. No complicated setup. Three steps and you're closing deals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-slate-300 to-transparent z-0" />
              )}
              <div className="relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm text-center h-full">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">
                  Step {s.num}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2 mb-3">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
