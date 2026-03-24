import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 1200, suffix: "+", label: "Projects Pinned" },
  { value: 150, suffix: "+", label: "Roofing Companies" },
  { value: 23, suffix: "", label: "States" },
  { value: 4.8, suffix: "", label: "Avg Customer Rating", decimal: true },
];

function useCountUp(target: number, isVisible: boolean, decimal = false) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCurrent(
        decimal
          ? parseFloat((eased * target).toFixed(1))
          : Math.floor(eased * target),
      );
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isVisible, target, decimal]);

  return current;
}

function StatCard({
  value,
  suffix,
  label,
  decimal,
  isVisible,
}: {
  value: number;
  suffix: string;
  label: string;
  decimal?: boolean;
  isVisible: boolean;
}) {
  const count = useCountUp(value, isVisible, decimal);
  return (
    <div className="text-center">
      <p className="text-4xl sm:text-5xl font-extrabold text-slate-900">
        {decimal ? count.toFixed(1) : count.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-slate-500 font-medium">{label}</p>
    </div>
  );
}

export default function LiveNumbers() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
