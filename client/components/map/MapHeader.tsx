import { BarChart3, Map as MapIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getContrastTextColor, getValidBrandColor } from "@/lib/color";
import type { PublicCompany } from "@/types/public-map";

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
    <div className="absolute inset-x-0 top-0 z-30 flex justify-center pointer-events-none pt-[max(0.75rem,env(safe-area-inset-top))]">
      {/* Single horizontal liquid glass pill: logo + segmented control */}
      <div
        className="pointer-events-auto inline-flex items-center gap-3 rounded-2xl px-2.5 py-1.5"
        style={{
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "saturate(170%) blur(16px)",
          WebkitBackdropFilter: "saturate(170%) blur(16px)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow:
            "0 2px 12px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,0.7)",
        }}
      >
        {/* Logo */}
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={`${company.name} logo`}
            className="h-9 w-auto max-w-[80px] rounded-lg object-contain cursor-pointer select-none shrink-0"
            onDoubleClick={() => navigate(`/dashboard/${company.slug}`)}
            draggable={false}
          />
        ) : (
          <button
            type="button"
            className="h-9 w-9 shrink-0 cursor-pointer select-none rounded-lg border-0 text-xs font-bold flex items-center justify-center"
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
          </button>
        )}

        {/* Divider */}
        <div className="h-6 w-px bg-slate-300/40" />

        {/* Segmented control */}
        <div className="inline-flex rounded-xl p-1">
          <SegmentButton
            active={activeTab === "map"}
            onClick={() => onTabChange("map")}
            icon={<MapIcon className="w-3.5 h-3.5" />}
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
