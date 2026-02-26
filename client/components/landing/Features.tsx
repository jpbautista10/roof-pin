import { MapPin, Star, Image, Code2 } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Pin Every Job",
    description:
      "Drop geo-tagged pins on every completed project. Build a visual portfolio that grows with your business.",
  },
  {
    icon: Star,
    title: "Showcase Reviews",
    description:
      "Attach star ratings and customer testimonials to each pin. Social proof that converts visitors into leads.",
  },
  {
    icon: Image,
    title: "Before & After Slider",
    description:
      "Upload before and after photos with a touch-friendly comparison slider. Let the work speak for itself.",
  },
  {
    icon: Code2,
    title: "One-Line Embed",
    description:
      "Copy a single iframe snippet and paste it on your website. Your map widget is live in seconds.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Everything you need to prove your work
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A complete toolkit to turn completed projects into your strongest
            sales tool.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                {f.title}
              </h3>
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
