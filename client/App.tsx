import "./global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "@/auth/AuthProvider";
import { RequireAuth } from "@/auth/RequireAuth";
import { OnboardingOnly, RequireOnboarding } from "@/auth/RequireOnboarding";
import { RequirePaidAccess } from "@/auth/RequirePaidAccess";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { trackPageView } from "@/lib/gtm";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/auth/Login";
import CheckoutPage from "./pages/CheckoutPage";
import Dashboard from "./pages/Dashboard";
import DashboardImport from "./pages/DashboardImport";
import DashboardLocationCreate from "./pages/DashboardLocationCreate";
import DashboardPins from "./pages/DashboardPins";
import DashboardRedirect from "./pages/DashboardRedirect";
import DashboardSettings from "./pages/DashboardSettings";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import PrivacyPage from "./pages/PrivacyPage";
import PublicMap from "./pages/PublicMap";
import PublicReview from "./pages/PublicReview";
import SalesPage from "./pages/SalesPage";
import SupportPage from "./pages/SupportPage";
import TermsPage from "./pages/TermsPage";
import ThankYouPage from "./pages/ThankYouPage";
import WelcomePage from "./pages/WelcomePage";

const queryClient = new QueryClient();

function getPageTitle(pathname: string) {
  if (pathname === "/") {
    return "Roof Wise Pro - Home";
  }

  if (pathname === "/get-started") {
    return "Roof Wise Pro - Get Started";
  }

  if (pathname === "/checkout") {
    return "Roof Wise Pro - Checkout";
  }

  if (pathname === "/thank-you") {
    return "Roof Wise Pro - Thank You";
  }

  if (pathname === "/auth/login") {
    return "Roof Wise Pro - Login";
  }

  if (pathname === "/onboarding") {
    return "Roof Wise Pro - Onboarding";
  }

  if (pathname === "/dashboard") {
    return "Roof Wise Pro - Dashboard";
  }

  if (pathname.startsWith("/dashboard/")) {
    return "Roof Wise Pro - Dashboard";
  }

  if (pathname === "/support") {
    return "Roof Wise Pro - Support";
  }

  if (pathname === "/privacy") {
    return "Roof Wise Pro - Privacy";
  }

  if (pathname === "/terms") {
    return "Roof Wise Pro - Terms";
  }

  if (pathname.startsWith("/review/")) {
    return "Roof Wise Pro - Review";
  }

  return "Roof Wise Pro";
}

function RouteTracking() {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    const pageTitle = getPageTitle(location.pathname);
    document.title = pageTitle;
    trackPageView({
      page_path: path,
      page_title: pageTitle,
    });
  }, [location.hash, location.pathname, location.search]);

  return null;
}

function AuthRoutes() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <RouteTracking />
          <ScrollToTop />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/s/:slug" element={<PublicMap />} />
            <Route path="/review/:token" element={<PublicReview />} />
            <Route path="/get-started" element={<SalesPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/support" element={<SupportPage />} />

            <Route element={<AuthRoutes />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/thank-you" element={<ThankYouPage />} />
              <Route path="/auth/login" element={<Login />} />

              <Route element={<RequireAuth />}>
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/dashboard" element={<DashboardRedirect />} />
                <Route element={<RequirePaidAccess />}>
                  <Route element={<OnboardingOnly />}>
                    <Route path="/onboarding" element={<Onboarding />} />
                  </Route>
                  <Route element={<RequireOnboarding />}>
                    <Route
                      path="/dashboard/:companySlug"
                      element={<DashboardLayout />}
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="pins" element={<DashboardPins />} />
                      <Route
                        path="locations/new"
                        element={<DashboardLocationCreate />}
                      />
                      <Route
                        path="locations/:locationId/edit"
                        element={<DashboardLocationCreate />}
                      />
                      <Route path="settings" element={<DashboardSettings />} />
                      <Route path="import" element={<DashboardImport />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
