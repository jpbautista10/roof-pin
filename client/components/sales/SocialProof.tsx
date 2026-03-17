import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "My guys close 30% more since we started using this. The map does the selling for us.",
    name: "Mike D.",
    company: "D&M Roofing",
    city: "Phoenix, AZ",
    stars: 5,
  },
  {
    quote: "I pulled it up on my iPad at an appointment and the homeowner said 'you've done my neighbor's house!' Signed on the spot.",
    name: "Travis K.",
    company: "Keystone Exteriors",
    city: "Nashville, TN",
    stars: 5,
  },
  {
    quote: "CSV import saved me hours. 3 years of jobs uploaded in 15 minutes. My whole team was using it by lunch.",
    name: "Sarah L.",
    company: "Lakeview Roofing",
    city: "Chicago, IL",
    stars: 5,
  },
  {
    quote: "The review system alone is worth it. We caught 3 bad reviews before they went public and turned them into happy customers.",
    name: "Marcus W.",
    company: "Elite Home Services",
    city: "Houston, TX",
    stars: 5,
  },
  {
    quote: "We look like a 50-person company now. 200+ pins on our map and prospects can see we dominate the area.",
    name: "Ryan P.",
    company: "ProLine Roofing",
    city: "Orlando, FL",
    stars: 5,
  },
  {
    quote: "Best money I've ever spent on my business. One-time payment, no monthly fees, and it pays for itself on the first close.",
    name: "Jennifer H.",
    company: "Horizon Contractors",
    city: "San Antonio, TX",
    stars: 5,
  },
];

export default function SocialProof() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Trusted by contractors
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Don't take our word for it
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Here's what contractors are saying after switching to a professional
            sales presentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl bg-white border border-slate-200/80 p-6 flex flex-col"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <blockquote className="text-sm text-slate-700 leading-relaxed flex-1">
                "{t.quote}"
              </blockquote>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">
                    {t.company} · {t.city}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[10px] font-medium text-teal-600 uppercase tracking-wider">
                Verified Customer
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
