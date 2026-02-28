import { ReactNode, useMemo, useState } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  PanelsTopLeft,
  PlusCircle,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "View and manage all locations",
  },
  {
    to: "locations/new",
    label: "Create Location",
    icon: PlusCircle,
    description: "Add a new project location",
  },
  {
    to: "settings",
    label: "Settings",
    icon: Settings,
    description: "Manage company details",
  },
];

function getInitials(email: string | null | undefined) {
  if (!email) {
    return "U";
  }

  return email.slice(0, 2).toUpperCase();
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { companySlug } = useParams();

  if (!companySlug) {
    return null;
  }

  return (
    <nav className="space-y-1.5">
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
            className={`group flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
              isActive
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <item.icon className="mt-0.5 h-4 w-4" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium leading-5">
                {item.label}
              </span>
              <span className="block text-xs text-slate-500 group-hover:text-slate-600">
                {item.description}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function UserMenu({
  email,
  companyName,
  isSigningOut,
  onSignOut,
}: {
  email: string | null;
  companyName: string | null;
  isSigningOut: boolean;
  onSignOut: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 w-10 gap-2 rounded-full border border-slate-200 bg-white p-0 hover:bg-slate-50"
          aria-label="Open account menu"
        >
          <Avatar className="w-full h-full border border-slate-200">
            <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
              {getInitials(email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="truncate text-sm font-semibold text-slate-900">
            {companyName ?? "Your workspace"}
          </p>
          <p className="truncate text-xs font-normal text-slate-500">
            {email ?? "Signed in"}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isSigningOut}
          className="text-red-600 focus:text-red-600"
          onSelect={(event) => {
            event.preventDefault();
            onSignOut();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? "Signing out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardLayout({
  children,
}: {
  children?: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { companySlug } = useParams();
  const { user, company, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const activeNav = useMemo(() => {
    if (!companySlug) {
      return navDefinitions[0];
    }

    const exactMatch = navDefinitions.find((item) => {
      const to = `/dashboard/${companySlug}${item.to ? `/${item.to}` : ""}`;
      return location.pathname === to;
    });

    if (exactMatch) {
      return exactMatch;
    }

    if (location.pathname.includes("/locations/")) {
      return navDefinitions[0];
    }

    return navDefinitions[0];
  }, [companySlug, location.pathname]);

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    try {
      setIsSigningOut(true);
      await signOut();
      toast.success("Signed out.");
      navigate("/auth/login", { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign out.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100/70">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
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
              <SheetContent side="left" className="w-[310px] p-0">
                <SheetHeader className="border-b border-slate-200 px-4 py-3">
                  <SheetTitle className="text-base">Navigation</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 p-4">
                  <NavLinks onNavigate={() => setMobileOpen(false)} />
                  <a
                    href={`/s/${companySlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Preview public map
                    </Button>
                  </a>
                </div>
              </SheetContent>
            </Sheet>

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
          </div>

          <UserMenu
            email={user?.email ?? null}
            companyName={company?.name ?? null}
            isSigningOut={isSigningOut}
            onSignOut={() => void handleSignOut()}
          />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <aside className="hidden lg:block lg:w-80">
          <div className="sticky top-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 px-1 py-1">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Workspace
                </p>
                <p className="truncate text-sm font-semibold text-slate-900">
                  {company?.name ?? "Dashboard"}
                </p>
              </div>
            </div>

            <NavLinks />

            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Public profile
              </p>
              <a
                href={`/s/${companySlug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="w-full">
                  <PanelsTopLeft className="h-4 w-4" />
                  Preview public map
                </Button>
              </a>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-4 hidden items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm lg:flex">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Application shell
              </p>
              <h1 className="text-lg font-semibold text-slate-900">
                {activeNav.label}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link
                  to={
                    companySlug
                      ? `/dashboard/${companySlug}/locations/new`
                      : "/dashboard"
                  }
                >
                  <PlusCircle className="h-4 w-4" />
                  New location
                </Link>
              </Button>
              <UserMenu
                email={user?.email ?? null}
                companyName={company?.name ?? null}
                isSigningOut={isSigningOut}
                onSignOut={() => void handleSignOut()}
              />
            </div>
          </header>

          <div className="rounded-2xl">{children ?? <Outlet />}</div>
        </main>
      </div>
    </div>
  );
}
