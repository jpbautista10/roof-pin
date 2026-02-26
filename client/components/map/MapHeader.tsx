import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tenant } from "@/types";
import { Map, BarChart3 } from "lucide-react";

interface MapHeaderProps {
  tenant: Tenant;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MapHeader({ tenant, activeTab, onTabChange }: MapHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="absolute top-4 left-4 z-30 bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4 max-w-xs w-full">
      <div className="flex items-center gap-3 mb-3">
        {/* Logo — double-click navigates to dashboard (secret admin door) */}
        {tenant.logo_url ? (
          <img
            src={tenant.logo_url}
            alt={`${tenant.company_name} logo`}
            className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200/60 p-1 cursor-pointer select-none"
            onDoubleClick={() => navigate("/dashboard")}
            draggable={false}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold cursor-pointer select-none shrink-0"
            style={{ backgroundColor: tenant.brand_color }}
            onDoubleClick={() => navigate("/dashboard")}
          >
            {tenant.company_name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-900 truncate">
            {tenant.company_name}
          </h1>
          <p className="text-xs text-slate-500">Verified Projects</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="w-full grid grid-cols-2 h-9">
          <TabsTrigger value="map" className="text-xs gap-1.5">
            <Map className="w-3.5 h-3.5" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-xs gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Stats & List
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
