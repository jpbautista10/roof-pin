import { ReactNode, useMemo, useState } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  PanelsTopLeft,
  Plus,
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
import ChangePasswordDialog from "@/components/dashboard/ChangePasswordDialog";
import ChangeEmailDialog from "@/components/dashboard/ChangeEmailDialog";

const navDefinitions = [
  { to: "", label: "Overview", icon: LayoutDashboard },
  { to: "pins", label: "Pins", icon: MapPin },
  { to: "settings", label: "Settings", icon: Settings },
];

function getInitials(email: string | null | undefined) {
  if (!email) return "U";
  return email.slice(0, 2).toUpperCase();
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { companySlug } = useParams();

  if (!companySlug) return null;

  return (
    <nav className="space-y-1">
      {navDefinitions.map((item) => {
        const to = `/dashboard/${companySlug}${item.to ? `/${item.to}` : ""}`;
        const isActive =
          item.to === ""
            ? location.pathname === `/dashboard/${companySlug}` ||
              location.pathname === `/dashboard/${companySlug}/`
            : location.pathname.startsWith(to);

        return (
          <Link
            key={item.to}
            to={to}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
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

function UserMenu({
  email,
  companyName,
  isSigningOut,
  onSignOut,
  onChangePassword,
  onChangeEmail,
}: {
  email: string | null;
  companyName: string | null;
  isSigningOut: boolean;
  onSignOut: () => void;
  onChangePassword: () => void;
  onChangeEmail: () => void;
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
        <DropdownMenuItem onSelect={onChangePassword}>
          <KeyRound className="mr-2 h-4 w-4" />
          Change password
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onChangeEmail}>
          <Mail className="mr-2 h-4 w-4" />
          Change email
        </DropdownMenuItem>
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
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  const activeNav = useMemo(() => {
    if (!companySlug) return navDefinitions[0];

    const exactMatch = navDefinitions.find((item) => {
      const to = `/dashboard/${companySlug}${item.to ? `/${item.to}` : ""}`;
      return location.pathname === to;
    });

    if (exactMatch) return exactMatch;
    if (location.pathname.includes("/locations/") || location.pathname.includes("/import")) {
      return navDefinitions[1]; // Pins
    }
    return navDefinitions[0];
  }, [companySlug, location.pathname]);

  async function handleSignOut() {
    if (isSigningOut) return;
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
      <div className="flex flex-col lg:flex-row w-full min-h-[100dvh]">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
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
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {company?.name ?? "Dashboard"}
                </span>
              </Link>
            </div>

            <UserMenu
              email={user?.email ?? null}
              companyName={company?.name ?? null}
              isSigningOut={isSigningOut}
              onSignOut={() => void handleSignOut()}
              onChangePassword={() => setShowPasswordDialog(true)}
              onChangeEmail={() => setShowEmailDialog(true)}
            />
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col gap-4 p-4 bg-white border-r border-slate-200">
          <div className="flex items-center gap-3 px-1 py-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {company?.name ?? "Dashboard"}
              </p>
            </div>
          </div>

          <NavLinks />

          <div className="mt-auto space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
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
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <header className="mb-4 hidden items-center justify-between bg-white px-5 py-4 border-b border-slate-200 lg:flex">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {activeNav.label}
              </h1>
            </div>
            <UserMenu
              email={user?.email ?? null}
              companyName={company?.name ?? null}
              isSigningOut={isSigningOut}
              onSignOut={() => void handleSignOut()}
              onChangePassword={() => setShowPasswordDialog(true)}
              onChangeEmail={() => setShowEmailDialog(true)}
            />
          </header>

          <div className="p-5 pt-0">{children ?? <Outlet />}</div>
        </main>
      </div>

      {/* Floating action button */}
      <Link
        to={companySlug ? `/dashboard/${companySlug}/locations/new` : "/dashboard"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
        aria-label="Add new pin"
      >
        <Plus className="h-6 w-6" />
      </Link>

      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
      <ChangeEmailDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
      />
    </div>
  );
}
