import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function MobileCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 py-3 safe-area-pb">
      <Link
        to="/checkout"
        className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25"
      >
        Get Lifetime Access — $497
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
