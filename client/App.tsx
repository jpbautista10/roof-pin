import "./global.css";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthProvider";
import { RequireAuth } from "@/auth/RequireAuth";
import { OnboardingOnly, RequireOnboarding } from "@/auth/RequireOnboarding";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Onboarding from "./pages/Onboarding";
import PublicMap from "./pages/PublicMap";
import Dashboard from "./pages/Dashboard";
import DashboardRedirect from "./pages/DashboardRedirect";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardLocationCreate from "./pages/DashboardLocationCreate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/s/:slug" element={<PublicMap />} />

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
                    <Route
                      path="locations/new"
                      element={<DashboardLocationCreate />}
                    />
                  </Route>
                </Route>
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
