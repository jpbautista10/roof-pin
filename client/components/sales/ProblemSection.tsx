import { X } from "lucide-react";

const painPoints = [
  "You show up to the appointment and scroll through 400 iPhone photos looking for that one before/after",
  "The homeowner sees your personal photos mixed in — not a great look",
  "Your competitor pulls out a slick iPad presentation and suddenly they look more legit",
  "You KNOW your work is better, but you can't prove it on the spot",
];

export default function ProblemSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3">
          Sound familiar?
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          You're losing deals because of how you{" "}
          <span className="underline decoration-red-300 decoration-2 underline-offset-4">
            present
          </span>{" "}
          your work
        </h2>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          The quality of your work isn't the problem. The way you show it is.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
          {painPoints.map((point, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl bg-red-50/50 border border-red-100 p-4"
            >
              <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
