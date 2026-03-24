import { Clock, Users } from "lucide-react";

export default function UrgencyBanner() {
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7 text-amber-600" />
            </div>

            <div className="text-center sm:text-left flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                We only onboard 20 new companies per month
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We personally help every new customer get set up — importing
                jobs, configuring branding, and making sure your team is ready.
                We limit new sign-ups so we can give each company the attention
                they deserve.
              </p>
            </div>

            <div className="flex-shrink-0 text-center bg-white rounded-xl border border-amber-200 px-5 py-3">
              <div className="flex items-center gap-1.5 text-amber-700 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {currentMonth}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">5</p>
              <p className="text-xs text-slate-500">spots remaining</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
