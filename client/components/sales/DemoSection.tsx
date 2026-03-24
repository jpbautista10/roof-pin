import { Maximize2, Play, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const DEMO_EMBED_SRC = "/s/demo?embed=true";

export default function DemoSection() {
  const [showDemo, setShowDemo] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

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
            <>
              {/* Only one iframe mounted: inline (desktop + mobile) or fullscreen overlay (mobile) */}
              {!fullscreen && (
                <div
                  className={cn(
                    "relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/50",
                    "min-h-[min(72vh,640px)] h-[min(72vh,640px)] md:min-h-0 md:h-auto md:aspect-[16/9]",
                  )}
                >
                  <iframe
                    src={DEMO_EMBED_SRC}
                    className="absolute inset-0 w-full h-full border-0"
                    title="Live Demo Map"
                  />
                  <button
                    type="button"
                    onClick={() => setFullscreen(true)}
                    className="md:hidden absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-md ring-1 ring-slate-200/80 backdrop-blur-sm"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Full screen
                  </button>
                </div>
              )}

              {fullscreen && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-white md:hidden">
                  <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
                    <p className="text-sm font-semibold text-slate-900">
                      Live demo map
                    </p>
                    <button
                      type="button"
                      onClick={() => setFullscreen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
                      aria-label="Close fullscreen map"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <iframe
                    src={DEMO_EMBED_SRC}
                    className="min-h-0 w-full flex-1 border-0"
                    title="Live Demo Map fullscreen"
                  />
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowDemo(true)}
              className="w-full min-h-[min(52vh,420px)] md:min-h-0 md:aspect-[16/9] rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden relative group cursor-pointer"
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
