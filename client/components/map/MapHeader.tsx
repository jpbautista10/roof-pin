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
    <div className="absolute inset-x-0 top-0 z-30 flex flex-col items-center pointer-events-none">
      {/* Floating logo — no background */}
      <div className="pointer-events-auto mt-3 mb-2 flex items-center justify-center">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={`${company.name} logo`}
            className="h-11 w-11 rounded-xl object-contain bg-white/60 border border-white/50 p-0.5 cursor-pointer select-none shrink-0 shadow-sm"
            onDoubleClick={() => navigate(`/dashboard/${company.slug}`)}
            draggable={false}
          />
        ) : (
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center text-sm font-bold cursor-pointer select-none shrink-0 shadow-sm"
            style={{
              backgroundColor: brandColor,
              color: brandTextColor,
              textShadow: "0 1px 2px rgba(0,0,0,0.15)",
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
      </div>

      {/* Liquid glass segmented control */}
      <div className="pointer-events-auto">
        <div
          className="inline-flex rounded-2xl p-1.5"
          style={{
            background: "rgba(255,255,255,0.45)",
            backdropFilter: "saturate(150%) blur(12px)",
            WebkitBackdropFilter: "saturate(150%) blur(12px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow:
              "0 2px 12px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,0.7)",
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
      className={`relative flex items-center gap-1.5 rounded-xl px-5 py-1.5 text-xs font-medium transition-all ${
        active
          ? "bg-white/90 text-slate-900 shadow-sm"
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
