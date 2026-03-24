import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/BrandLogo";

export default function SalesFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <BrandLogo to="/" size="sm" onDarkBackground />

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
          <p>&copy; {new Date().getFullYear()} Roof Wise Pro. All rights reserved.</p>
          <p>30-Day Money-Back Guarantee &middot; Lifetime Access &middot; No Monthly Fees</p>
        </div>
      </div>
    </footer>
  );
}
