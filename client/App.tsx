import "./global.css";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/data/DataContext";
import Index from "./pages/Index";
import PublicMap from "./pages/PublicMap";
import Dashboard from "./pages/Dashboard";
import DashboardAddPin from "./pages/DashboardAddPin";
import DashboardSettings from "./pages/DashboardSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <DataProvider>
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/s/:slug" element={<PublicMap />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/add-pin" element={<DashboardAddPin />} />
              <Route path="/dashboard/settings" element={<DashboardSettings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DataProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
