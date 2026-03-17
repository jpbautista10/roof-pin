import { TrendingUp, Clock, Star } from "lucide-react";

const cases = [
  {
    icon: TrendingUp,
    metric: "40%",
    metricLabel: "more closes",
    company: "Martinez Roofing",
    location: "Dallas, TX",
    quote:
      "We went from 'show me your work' objections to pulling up the map and watching homeowners say 'wow, you've done every house on this street.' Close rate jumped 40% in 3 months.",
    person: "Carlos M., Owner",
  },
  {
    icon: Clock,
    metric: "20 min",
    metricLabel: "to set up",
    company: "Summit Exteriors",
    location: "Denver, CO",
    quote:
      "We imported 3 years of past jobs in 20 minutes with the CSV upload. Our sales team had a professional presentation tool the same day. No tech skills needed.",
    person: "Jake R., Sales Manager",
  },
  {
    icon: Star,
    metric: "47",
    metricLabel: "Google reviews in 90 days",
    company: "Apex Roofing",
    location: "Atlanta, GA",
    quote:
      "The QR code review system is a game-changer. We went from 12 Google reviews to 59 in three months. Bad reviews get caught before they go public. It's brilliant.",
    person: "DeShawn T., Owner",
  },
];

export default function CaseStudies() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Real results
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            How contractors are using this to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">
              close more deals
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <div
              key={c.company}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <c.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {c.metric}
                  </p>
                  <p className="text-xs text-slate-500">{c.metricLabel}</p>
                </div>
              </div>

              <blockquote className="text-sm text-slate-600 leading-relaxed flex-1">
                "{c.quote}"
              </blockquote>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-900">
                  {c.company}
                </p>
                <p className="text-xs text-slate-500">
                  {c.person} · {c.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
