import { BarChart3, Clock, Target, TrendingUp, Trophy } from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Close more jobs on the spot",
    description:
      "Prospects see 14 pins on their street — you're the obvious choice. No more 'let me think about it.'",
  },
  {
    icon: TrendingUp,
    title: "Look like the biggest contractor in town",
    description:
      "Even if you're a 3-person crew, 200 pins on a map says otherwise. Perception is everything.",
  },
  {
    icon: Clock,
    title: 'End the "let me think about it"',
    description:
      "Hard to say no when they can see you literally own the neighborhood. Social proof does the selling.",
  },
  {
    icon: Trophy,
    title: "Stop losing to slicker competitors",
    description:
      "Your presentation is now the most professional in the room. Let your competition fumble through photos.",
  },
  {
    icon: BarChart3,
    title: "Every finished job makes the next one easier",
    description:
      "Your map compounds over time. More pins = more proof = higher close rate. It only gets better.",
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            The impact
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            What this means for your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">
              close rate
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className={`rounded-2xl bg-slate-50 border border-slate-200/80 p-6 ${
                i === benefits.length - 1 && benefits.length % 3 !== 0
                  ? "md:col-span-2 lg:col-span-1"
                  : ""
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                {b.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
