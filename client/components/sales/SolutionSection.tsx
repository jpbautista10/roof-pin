import { Smartphone, Monitor } from "lucide-react";

export default function SolutionSection() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            The solution
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            What if you had a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">
              pro portfolio
            </span>{" "}
            in your pocket?
          </h2>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Imagine pulling up a branded map on your iPad and saying:{" "}
            <em className="text-slate-800 font-medium">
              "See these 14 pins? Those are all roofs we've done right here in
              your neighborhood. Click any one to see the before and after."
            </em>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* How you present now */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">How you present now</p>
                <p className="text-xs text-slate-500">Fumbling through your phone</p>
              </div>
            </div>
            <div className="rounded-xl bg-slate-100 p-4 space-y-2">
              <div className="flex gap-2">
                <div className="w-16 h-16 rounded-lg bg-slate-300/80" />
                <div className="w-16 h-16 rounded-lg bg-slate-300/80" />
                <div className="w-16 h-16 rounded-lg bg-red-200/60 flex items-center justify-center text-xs text-red-500 font-medium">
                  Selfie
                </div>
                <div className="w-16 h-16 rounded-lg bg-slate-300/80" />
              </div>
              <div className="flex gap-2">
                <div className="w-16 h-16 rounded-lg bg-slate-300/80" />
                <div className="w-16 h-16 rounded-lg bg-red-200/60 flex items-center justify-center text-xs text-red-500 font-medium">
                  Lunch
                </div>
                <div className="w-16 h-16 rounded-lg bg-slate-300/80" />
                <div className="w-16 h-16 rounded-lg bg-red-200/60 flex items-center justify-center text-xs text-red-500 font-medium">
                  Kids
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center pt-1">
                "Hold on, let me find it..."
              </p>
            </div>
          </div>

          {/* How you'll present with us */}
          <div className="rounded-2xl bg-white border-2 border-primary/20 p-6 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">How you'll present with us</p>
                <p className="text-xs text-teal-600 font-medium">Clean, branded, professional</p>
              </div>
            </div>
            <div className="rounded-xl bg-slate-100 p-4 relative overflow-hidden">
              {/* Mini map mockup */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(100,116,139,0.15) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(100,116,139,0.15) 1px, transparent 1px)
                  `,
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="relative h-32 flex items-center justify-center">
                {[
                  { top: "20%", left: "25%" },
                  { top: "45%", left: "50%" },
                  { top: "30%", left: "70%" },
                  { top: "60%", left: "35%" },
                  { top: "50%", left: "80%" },
                ].map((pos, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-primary shadow-md ring-2 ring-primary/20"
                    style={{ top: pos.top, left: pos.left }}
                  />
                ))}
              </div>
              <div className="relative bg-white/90 backdrop-blur rounded-lg px-3 py-2 mt-1">
                <p className="text-xs font-semibold text-slate-800">Your Company</p>
                <p className="text-[11px] text-slate-500">14 jobs in this neighborhood</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-10 text-base text-slate-600 max-w-xl mx-auto">
          Your work <span className="font-semibold text-slate-800">IS</span> the proof. We just make it easy to show.
        </p>
      </div>
    </section>
  );
}
