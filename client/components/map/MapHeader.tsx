import { useNavigate } from "react-router-dom";
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
    <div className="absolute inset-x-0 top-0 z-30 flex flex-col items-center">
      {/* iOS-style frosted glass bar */}
      <header
        className="w-full border-b border-white/25 px-4 pb-2.5 pt-3"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(245,245,247,0.72) 100%)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        {/* Centered logo + name */}
        <div className="flex items-center justify-center gap-2.5 mb-2.5">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={`${company.name} logo`}
              className="h-7 w-7 rounded-md object-contain bg-white/60 border border-white/50 p-0.5 cursor-pointer select-none shrink-0"
              onDoubleClick={() => navigate(`/dashboard/${company.slug}`)}
              draggable={false}
            />
          ) : (
            <div
              className="h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-bold cursor-pointer select-none shrink-0"
              style={{ backgroundColor: brandColor, color: brandTextColor }}
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
          <span className="text-[15px] font-semibold text-slate-900/90 truncate">
            {company.name}
          </span>
        </div>

        {/* iOS segmented control */}
        <div className="flex justify-center">
          <div
            className="inline-flex rounded-full p-[3px]"
            style={{
              background: "rgba(120,120,128,0.12)",
            }}
          >
            <SegmentButton
              active={activeTab === "map"}
              onClick={() => onTabChange("map")}
              icon={<Map className="w-3.5 h-3.5" />}
              label="Map"
            />
            <SegmentButton
              active={activeTab === "locations"}
              onClick={() => onTabChange("locations")}
              icon={<BarChart3 className="w-3.5 h-3.5" />}
              label="Stats"
            />
          </div>
        </div>
      </header>
    </div>
  );
}

function SegmentButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-1.5 rounded-full px-5 py-1 text-xs font-medium transition-all ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-600 hover:text-slate-800"
      }`}
      style={
        active
          ? {
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06), inset 0 0.5px 0 rgba(255,255,255,0.8)",
            }
          : undefined
      }
    >
      {icon}
      {label}
    </button>
  );
}
