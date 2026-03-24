import "./global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthProvider";
import { RequireAuth } from "@/auth/RequireAuth";
import { OnboardingOnly, RequireOnboarding } from "@/auth/RequireOnboarding";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import WelcomePage from "./pages/WelcomePage";

const queryClient = new QueryClient();

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
          <ScrollToTop />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/s/:slug" element={<PublicMap />} />
            <Route path="/review/:token" element={<PublicReview />} />
            <Route path="/get-started" element={<SalesPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/support" element={<SupportPage />} />

            <Route element={<AuthRoutes />}>
              <Route path="/auth/login" element={<Login />} />

              <Route element={<RequireAuth />}>
                <Route path="/dashboard" element={<DashboardRedirect />} />
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

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
