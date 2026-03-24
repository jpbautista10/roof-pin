import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

/** Match `client/components/landing/Navbar.tsx` bar height */
const HEADER_HEIGHT_CLASS = "h-16";

export const LEGAL_PAGE_HEADER_OFFSET_CLASS = "pt-16";

/** Space below fixed header before page title (Terms / Privacy / Support) */
export const LEGAL_PAGE_HEADLINE_TOP_CLASS = "mt-6";

type LegalPageHeaderProps = {
  /** Max width of inner bar (match main content column) */
  containerClassName?: string;
  homeLinkLabel?: string;
};

export default function LegalPageHeader({
  containerClassName = "max-w-3xl",
  homeLinkLabel = "Back to home",
}: LegalPageHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-lg supports-[backdrop-filter]:bg-white/75">
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-4 px-4 sm:px-6",
          HEADER_HEIGHT_CLASS,
          containerClassName,
        )}
      >
        <BrandLogo to="/" size="sm" />
        <Link
          to="/"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {homeLinkLabel}
        </Link>
      </div>
    </header>
  );
}
