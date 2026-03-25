import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pushGtmEvent } from "@/lib/gtm";
import { cn } from "@/lib/utils";

export default function MobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function update() {
      const hero = document.getElementById("sales-hero");
      const finalCta = document.getElementById("sales-final-cta");
      if (!hero || !finalCta) return;

      const heroRect = hero.getBoundingClientRect();
      const finalRect = finalCta.getBoundingClientRect();

      const scrolledPastHero = heroRect.bottom < 0;
      const finalCtaInView =
        finalRect.top < window.innerHeight && finalRect.bottom > 0;

      setShow(scrolledPastHero && !finalCtaInView);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 py-3 safe-area-pb transition-transform duration-300 ease-out",
        show ? "translate-y-0" : "translate-y-full pointer-events-none",
      )}
      aria-hidden={!show}
    >
      <Link
        to="/checkout"
        onClick={() =>
          pushGtmEvent("funnel_cta_click", {
            funnel_step: "sales_page",
            cta_location: "mobile_sticky_cta",
            cta_text: "Get Lifetime Access — $497",
            destination: "/checkout",
          })
        }
        className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25"
      >
        Get Lifetime Access — $497
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
