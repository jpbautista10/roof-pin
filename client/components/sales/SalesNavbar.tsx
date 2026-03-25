import { BrandLogo } from "@/components/BrandLogo";
import { pushGtmEvent } from "@/lib/gtm";

export default function SalesNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <BrandLogo to="/" />

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Only 5 spots left this month
            </span>
            <a
              href="#pricing"
              onClick={() =>
                pushGtmEvent("funnel_cta_click", {
                  funnel_step: "sales_page",
                  cta_location: "navbar",
                  cta_text: "Get Lifetime Access",
                  destination: "#pricing",
                })
              }
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors shadow-sm"
            >
              Get Lifetime Access
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
