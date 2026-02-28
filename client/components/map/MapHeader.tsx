import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicCompany } from "@/types/public-map";
import { List, Map } from "lucide-react";

interface MapHeaderProps {
  company: PublicCompany;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MapHeader({
  company,
  activeTab,
  onTabChange,
}: MapHeaderProps) {
  const navigate = useNavigate();
  const brandColor = company.brand_primary_color || "#0f766e";

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-30">
      {/* Left: Logo + Company Name */}
      <div className="flex items-center gap-3 min-w-0">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={`${company.name} logo`}
            className="w-9 h-9 rounded-lg object-contain bg-white border border-slate-200/60 p-0.5 cursor-pointer select-none shrink-0"
            onDoubleClick={() => navigate(`/dashboard/${company.slug}`)}
            draggable={false}
          />
        ) : (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer select-none shrink-0"
            style={{ backgroundColor: brandColor }}
            onDoubleClick={() => navigate(`/dashboard/${company.slug}`)}
          >
            {company.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        )}
        <span className="text-sm font-bold text-slate-900 truncate">
          {company.name}
        </span>
      </div>

      {/* Right: Tabs */}
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="h-9">
          <TabsTrigger value="map" className="text-xs gap-1.5 px-3">
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Map View</span>
            <span className="sm:hidden">Map</span>
          </TabsTrigger>
          <TabsTrigger value="locations" className="text-xs gap-1.5 px-3">
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Locations</span>
            <span className="sm:hidden">List</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </header>
  );
}
