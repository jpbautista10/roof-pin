import {
  MapPin,
  Star,
  Image,
  Upload,
  Palette,
  Code2,
  Shield,
  QrCode,
  Rocket,
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Pin Every Completed Job",
    description:
      "Geo-tagged map pins with project details, work type, and completion date. Your portfolio grows with every job.",
  },
  {
    icon: Image,
    title: "Before & After Photo Slider",
    description:
      "Interactive, touch-friendly comparison slider. Let the transformation speak for itself.",
  },
  {
    icon: Star,
    title: "Smart Review System",
    description:
      "Bad reviews go to your team for follow-up. Good reviews auto-prompt Google/Yelp posting. Win-win.",
  },
  {
    icon: Upload,
    title: "Bulk CSV Import",
    description:
      "Import your past 100+ jobs in minutes. No manual typing. Upload a spreadsheet and you're done.",
  },
  {
    icon: Palette,
    title: "Your Brand, Your Map",
    description:
      "Custom logo, brand colors, and fully branded to your company. Looks like you built it yourself.",
  },
  {
    icon: Code2,
    title: "One-Line Website Embed",
    description:
      "Also works as a website widget. Copy one iframe snippet and paste it on your site — live in seconds.",
  },
  {
    icon: Shield,
    title: "Privacy Controls",
    description:
      "Hide exact addresses, control what information is visible on your public map. You're in control.",
  },
  {
    icon: QrCode,
    title: "QR Code Review Requests",
    description:
      "Hand a QR code to the homeowner after the job. They scan, review, done. Effortless 5-star collection.",
  },
  {
    icon: Rocket,
    title: "Coming Soon",
    description:
      "Portfolio page builder, neighborhood targeting, automated follow-ups, and more. All included in lifetime access.",
    comingSoon: true,
  },
];

export default function FeatureShowcase() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Everything included
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            One tool. Every feature you need.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            No add-ons, no upsells. Every feature below is included in your
            one-time purchase.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className={`group rounded-2xl border p-6 transition-all duration-300 ${
                f.comingSoon
                  ? "border-dashed border-slate-300 bg-slate-50"
                  : "border-slate-200/80 bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-semibold text-slate-900">
                  {f.title}
                </h3>
                {f.comingSoon && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
