import { Play } from "lucide-react";
import { useState } from "react";

export default function DemoSection() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <section id="demo" className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            See it in action
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            This is what your sales team will pull up on{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">
              every appointment
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Go ahead — click around. Zoom in. Click a pin. This is what your
            prospects will see.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {showDemo ? (
            <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/50">
              <iframe
                src="/s/demo?embed=true"
                className="w-full h-full"
                title="Live Demo Map"
              />
            </div>
          ) : (
            <button
              onClick={() => setShowDemo(true)}
              className="w-full aspect-[16/9] rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden relative group cursor-pointer"
            >
              {/* Grid pattern for map feel */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(100,116,139,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(100,116,139,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }}
              />
              {/* Mock pins */}
              {[
                { top: "25%", left: "20%" },
                { top: "40%", left: "45%" },
                { top: "55%", left: "70%" },
                { top: "35%", left: "65%" },
                { top: "60%", left: "30%" },
                { top: "30%", left: "80%" },
                { top: "45%", left: "15%" },
                { top: "70%", left: "55%" },
              ].map((pos, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-primary/60 ring-2 ring-primary/20"
                  style={{ top: pos.top, left: pos.left }}
                />
              ))}
              {/* Play button overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/5 group-hover:bg-slate-900/10 transition-colors">
                <div className="w-16 h-16 rounded-full bg-primary shadow-xl shadow-primary/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 text-white ml-1" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Click to launch interactive demo
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
