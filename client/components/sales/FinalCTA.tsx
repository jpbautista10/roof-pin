import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function FinalCTA() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Your next appointment could look completely different.
        </h2>

        <p className="text-lg text-slate-300 max-w-xl mx-auto mb-8">
          Join 150+ contractors who stopped scrolling through iPhone photos and
          started closing like pros.
        </p>

        <Link
          to="/checkout"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-xl hover:bg-slate-100 transition-all"
        >
          Get Lifetime Access — $497
          <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            One-time payment
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            30-day money back
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            Only 5 spots left
          </span>
        </div>
      </div>
    </section>
  );
}
