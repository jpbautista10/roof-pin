import { Link } from "react-router-dom";
import { MapPin, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Neighborhood Proof
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              How It Works
            </a>
            <Link
              to="/auth/login"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          <a
            href="#features"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-slate-600 hover:text-slate-900"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-slate-600 hover:text-slate-900"
          >
            How It Works
          </a>
          <Link
            to="/auth/login"
            onClick={() => setMobileOpen(false)}
            className="block w-full text-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  );
}
