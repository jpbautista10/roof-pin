import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-teal-50/30" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <MapPin className="w-3.5 h-3.5" />
            Built for local contractors
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Turn every job into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">
              neighborhood proof
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Drop a pin on every completed project. Show prospects a live map of
            real jobs, real reviews, and real before/after photos — right on
            your website.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/s/smithroofing"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              See live demo
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            No credit card required · Set up in under 5 minutes
          </p>
        </div>

        {/* Fake map preview */}
        <div className="mt-16 relative max-w-4xl mx-auto">
          <div className="aspect-[16/9] rounded-2xl border border-slate-200/80 bg-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden relative">
            {/* Grid pattern for map feel */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                linear-gradient(rgba(100,116,139,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(100,116,139,0.1) 1px, transparent 1px)
              `,
                backgroundSize: "40px 40px",
              }}
            />

            {/* Fake road lines */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-300/60" />
            <div className="absolute top-0 bottom-0 left-1/3 w-px bg-slate-300/60" />
            <div className="absolute top-0 bottom-0 right-1/4 w-px bg-slate-300/40" />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-slate-300/40" />

            {/* Mock pins */}
            {[
              { top: "25%", left: "20%" },
              { top: "40%", left: "45%" },
              { top: "55%", left: "70%" },
              { top: "35%", left: "65%" },
              { top: "60%", left: "30%" },
              { top: "30%", left: "80%" },
            ].map((pos, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2"
                style={{ top: pos.top, left: pos.left }}
              >
                <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/30 ring-4 ring-primary/20 animate-pulse" />
              </div>
            ))}

            {/* Overlay label */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg px-3 py-2 shadow-sm border border-slate-200/60">
              <p className="text-xs font-semibold text-slate-800">
                Smith Roofing Co.
              </p>
              <p className="text-[11px] text-slate-500">6 verified projects</p>
            </div>
          </div>

          {/* Floating card */}
          <div className="absolute -right-2 sm:right-4 top-1/2 -translate-y-1/2 w-56 sm:w-64 bg-white rounded-xl shadow-xl shadow-slate-200/80 border border-slate-200/60 p-4 hidden sm:block">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Project in Buckhead
            </p>
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 text-amber-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">
              "Premium quality work at a fair price. Our neighbors are already
              asking for their number!"
            </p>
            <p className="text-xs text-slate-400 mt-1">— Robert M.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
