import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function SalesFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              Neighborhood Proof
            </span>
          </Link>

          <div className="flex items-center gap-6 text-sm">
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <Link to="/s/demo" className="hover:text-white transition-colors">
              Live Demo
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Neighborhood Proof. All rights reserved.</p>
          <p>30-Day Money-Back Guarantee &middot; Lifetime Access &middot; No Monthly Fees</p>
        </div>
      </div>
    </footer>
  );
}
