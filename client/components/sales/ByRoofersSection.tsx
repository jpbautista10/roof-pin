import { Hammer, Heart } from "lucide-react";

export default function ByRoofersSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Subtle pattern */}
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

          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Hammer className="w-6 h-6 text-white" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Built by contractors, for contractors
            </h2>

            <p className="text-base text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6">
              We've been on roofs. We've done the awkward iPhone photo scroll in
              front of homeowners. We've lost deals to competitors who just{" "}
              <em>looked</em> more professional. So we built what we wished
              existed.
            </p>

            <p className="text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              We're not a Silicon Valley startup trying to sell you software. We{" "}
              <span className="text-white font-semibold">ARE</span> contractors
              who got tired of looking unprofessional at the appointment. This
              tool was born in the field — and it shows.
            </p>

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400">
              <Heart className="w-4 h-4 text-red-400" />
              Made with love from the job site
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
