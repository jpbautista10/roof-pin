import { Link } from "react-router-dom";
import { MapPin, CheckCircle2, ArrowRight, Rocket, Upload, Palette } from "lucide-react";

const nextSteps = [
  {
    icon: Palette,
    title: "Set Up Your Brand",
    description: "Upload your logo, pick your colors, and name your map. Takes 2 minutes.",
  },
  {
    icon: Upload,
    title: "Import Your Jobs",
    description: "CSV-import your past projects. Hundreds of pins in minutes — no typing.",
  },
  {
    icon: Rocket,
    title: "Start Closing",
    description: "Pull up your branded map at your next appointment. Watch prospects say yes.",
  },
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-teal-50/30 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Success badge */}
        <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-teal-600" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
          Welcome to Neighborhood Proof!
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-md mx-auto">
          Your payment was successful. You now have lifetime access. Let's get
          you set up and closing deals.
        </p>

        {/* Next steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
          {nextSteps.map((step, i) => (
            <div
              key={step.title}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                {step.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/onboarding"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          Start Onboarding
          <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="mt-4 text-sm text-slate-500">
          Need help? Email us at{" "}
          <span className="font-medium text-slate-700">support@neighborhoodproof.com</span>{" "}
          — we'll set it up with you.
        </p>

        {/* Logo */}
        <div className="mt-12 flex items-center justify-center gap-2 text-slate-400">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <MapPin className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium">Neighborhood Proof</span>
        </div>
      </div>
    </div>
  );
}
