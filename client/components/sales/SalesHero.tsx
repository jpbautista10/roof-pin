import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";

export default function SalesHero() {
  return (
    <section
      id="sales-hero"
      className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-teal-50/30" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <MapPin className="w-3.5 h-3.5" />
            The sales tool built for contractors
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Stop Fumbling Through{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">
              iPhone Photos.
            </span>{" "}
            Start Closing Like a Pro.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Pull up a branded, interactive map of every job you've ever done —
            right on your iPad during the appointment. Show prospects you've
            done 14 roofs on their street. Close the deal.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Get Lifetime Access — $497
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              See It Live
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              One-time payment
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              No monthly fees
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              30-day money back
            </span>
          </div>
        </div>

        {/* Before / After visual */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BEFORE */}
            <div className="relative rounded-2xl border-2 border-red-200/60 bg-red-50/30 p-5 sm:p-6">
              <span className="absolute -top-3 left-5 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Before
              </span>
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-red-100">
                  <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-lg">
                    📱
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      iPhone Camera Roll
                    </p>
                    <p className="text-xs text-slate-500">
                      2,847 photos — good luck finding that roof job
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-red-100">
                  <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-lg">
                    🤦
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Personal Photos Mixed In
                    </p>
                    <p className="text-xs text-slate-500">
                      Selfies, lunch, kids — not a great look
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-red-100">
                  <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-lg">
                    😬
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Zero Organization
                    </p>
                    <p className="text-xs text-slate-500">
                      No reviews, no addresses, no professionalism
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AFTER */}
            <div className="relative rounded-2xl border-2 border-teal-200/60 bg-teal-50/30 p-5 sm:p-6">
              <span className="absolute -top-3 left-5 bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                After
              </span>
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-teal-100">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Branded Interactive Map
                    </p>
                    <p className="text-xs text-slate-500">
                      Every job pinned, organized, and beautiful
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-teal-100">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center text-lg">
                    ⭐
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Reviews & Before/After Photos
                    </p>
                    <p className="text-xs text-slate-500">
                      Tap any pin to see proof of quality work
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-teal-100">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center text-lg">
                    🏆
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Professional Presentation
                    </p>
                    <p className="text-xs text-slate-500">
                      Your logo, your colors, your brand — instant credibility
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
