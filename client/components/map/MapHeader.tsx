import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getContrastTextColor, getValidBrandColor } from "@/lib/color";
import { PublicCompany } from "@/types/public-map";
import { BarChart3, Map } from "lucide-react";

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
  const brandColor = getValidBrandColor(company.brand_primary_color);
  const brandTextColor = getContrastTextColor(brandColor);

  return (
    <header className="absolute inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-white/20 bg-white/70 px-4 backdrop-blur-xl">
      {/* Left: Logo + Company Name */}
      <div className="flex items-center gap-3 min-w-0">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={`${company.name} logo`}
            className="w-8 h-8 rounded-lg object-contain bg-white/80 border border-white/40 p-0.5 cursor-pointer select-none shrink-0 shadow-sm"
            onDoubleClick={() => navigate(`/dashboard/${company.slug}`)}
            draggable={false}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer select-none shrink-0 shadow-sm"
            style={{
              backgroundColor: brandColor,
              color: brandTextColor,
            }}
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
        <span className="text-sm font-semibold text-slate-800 truncate">
          {company.name}
        </span>
      </div>

      {/* Right: Tabs */}
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="h-8 bg-white/50 backdrop-blur-sm border border-white/40 shadow-sm">
          <TabsTrigger value="map" className="text-xs gap-1.5 px-3 data-[state=active]:bg-white/80 data-[state=active]:shadow-sm">
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Map</span>
            <span className="sm:hidden">Map</span>
          </TabsTrigger>
          <TabsTrigger value="locations" className="text-xs gap-1.5 px-3 data-[state=active]:bg-white/80 data-[state=active]:shadow-sm">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Stats</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </header>
  );
}
