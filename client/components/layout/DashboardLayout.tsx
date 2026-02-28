import { ReactNode, useState } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Menu,
  PlusCircle,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navDefinitions = [
  {
    to: "",
    label: "Locations",
    icon: LayoutDashboard,
  },
  {
    to: "locations/new",
    label: "Create Location",
    icon: PlusCircle,
  },
  {
    to: "settings",
    label: "Settings",
    icon: Settings,
  },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { companySlug } = useParams();

  if (!companySlug) {
    return null;
  }

  return (
    <nav className="space-y-1">
      {navDefinitions.map((item) => {
        const to = `/dashboard/${companySlug}${item.to ? `/${item.to}` : ""}`;
        const isActive =
          location.pathname === to ||
          (item.to === "" && location.pathname === `/dashboard/${companySlug}`);

        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
              ? "bg-primary/10 text-primary"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children?: ReactNode;
}) {
  const { companySlug } = useParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            to={companySlug ? `/dashboard/${companySlug}` : "/dashboard"}
            className="inline-flex items-center gap-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-4 w-4 text-white" />
            </span>
            <span className="text-sm font-semibold text-slate-900">
              Dashboard
            </span>
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="border-b border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-base">Navigation</SheetTitle>
                </div>
              </SheetHeader>
              <div className="p-3">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </div>

              <div className="p-3"><a
                href={`/s/${companySlug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="w-full">
                  Preview
                </Button>
              </a></div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <aside className="hidden lg:block lg:w-64">
          <div className="sticky top-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center gap-2 px-2 py-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <MapPin className="h-4 w-4 text-white" />
              </span>
              <span className="text-sm font-semibold text-slate-900">
                Dashboard
              </span>
            </div>
            <NavLinks />
            <div className="p-3">
              <a
              href={`/s/${companySlug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="w-full">
                Preview
              </Button>
            </a>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
