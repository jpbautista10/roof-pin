import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/BrandLogo";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div>
            <div className="mb-3">
              <BrandLogo to="/" size="sm" onDarkBackground />
            </div>
            <p className="text-sm max-w-xs leading-relaxed">
              The map-based portfolio widget that helps local contractors win
              more jobs with social proof.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Product
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <Link
                    to="/s/demo"
                    className="hover:text-white transition-colors"
                  >
                    Live Demo
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 text-xs text-slate-500">
          © {new Date().getFullYear()} Roof Wise Pro. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
