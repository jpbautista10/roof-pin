import { UserPlus, MapPinPlus, Code, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    description: "Sign up in 30 seconds. Enter your company name, pick your brand color, and you're ready to go.",
  },
  {
    icon: MapPinPlus,
    step: "02",
    title: "Add Your Projects",
    description: "Enter an address, upload before/after photos, and add a customer review. We handle the rest.",
  },
  {
    icon: Code,
    step: "03",
    title: "Embed on Your Site",
    description: "Copy a single line of code and paste it anywhere on your website. That's it — you're live.",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Win More Jobs",
    description: "Prospects see real proof in their neighborhood. Watch your close rate climb.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Live in minutes, not months
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            No developers needed. No complicated setup. Just results.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-slate-300 to-transparent z-0" />
              )}
              <div className="relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">
                    Step {s.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
