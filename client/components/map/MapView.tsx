import { useState } from "react";
import { Pin, Tenant } from "@/types";
import ProjectDrawer from "./ProjectDrawer";

interface MapViewProps {
  tenant: Tenant;
  pins: Pin[];
}

/**
 * Placeholder map component.
 * Positions pins on a styled container using normalized lat/lng offsets.
 * Designed to be swapped with react-map-gl + Mapbox when API key is available.
 */
export default function MapView({ tenant, pins }: MapViewProps) {
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Calculate bounds for positioning pins relatively
  const lats = pins.map((p) => p.lat);
  const lngs = pins.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 0.01;
  const lngRange = maxLng - minLng || 0.01;

  const padding = 0.15; // 15% padding on each side

  function pinPosition(pin: Pin) {
    const normX = (pin.lng - minLng) / lngRange;
    const normY = 1 - (pin.lat - minLat) / latRange; // invert for screen coords
    return {
      left: `${padding * 100 + normX * (1 - 2 * padding) * 100}%`,
      top: `${padding * 100 + normY * (1 - 2 * padding) * 100}%`,
    };
  }

  function handlePinClick(pin: Pin) {
    setSelectedPin(pin);
    setDrawerOpen(true);
  }

  return (
    <div className="relative w-full h-full bg-[#f0f3f8] overflow-hidden">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100,116,139,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,116,139,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Fake road lines */}
      <div className="absolute top-[30%] left-0 right-0 h-[2px] bg-slate-300/50" />
      <div className="absolute top-[55%] left-0 right-0 h-[2px] bg-slate-300/40" />
      <div className="absolute top-[75%] left-0 right-0 h-[2px] bg-slate-300/30" />
      <div className="absolute top-0 bottom-0 left-[25%] w-[2px] bg-slate-300/50" />
      <div className="absolute top-0 bottom-0 left-[50%] w-[2px] bg-slate-300/40" />
      <div className="absolute top-0 bottom-0 left-[70%] w-[2px] bg-slate-300/30" />

      {/* Diagonal road */}
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background:
            "linear-gradient(135deg, transparent 45%, rgba(148,163,184,0.2) 45%, rgba(148,163,184,0.2) 45.3%, transparent 45.3%)",
        }}
      />

      {/* Pins */}
      {pins.map((pin) => {
        const pos = pinPosition(pin);
        const isSelected = selectedPin?.id === pin.id;
        return (
          <button
            key={pin.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
            style={{ left: pos.left, top: pos.top }}
            onClick={() => handlePinClick(pin)}
          >
            {/* Pulse ring */}
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: tenant.brand_color }}
            />
            {/* Marker dot */}
            <span
              className="relative block w-5 h-5 rounded-full border-[3px] border-white shadow-lg transition-transform group-hover:scale-125"
              style={{
                backgroundColor: tenant.brand_color,
                boxShadow: isSelected
                  ? `0 0 0 4px ${tenant.brand_color}40, 0 4px 12px ${tenant.brand_color}50`
                  : `0 2px 8px ${tenant.brand_color}40`,
                transform: isSelected ? "scale(1.3)" : undefined,
              }}
            />
            {/* Tooltip */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {pin.neighborhood}
              <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-900" />
            </span>
          </button>
        );
      })}

      {/* Branding badge */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-slate-200/60 z-20">
        <p className="text-sm font-bold text-slate-900">{tenant.company_name}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {pins.length} verified project{pins.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Map style badge */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow border border-slate-200/60 z-20">
        <p className="text-[10px] text-slate-400 font-medium">
          Mapbox preview · Connect API key for live map
        </p>
      </div>

      {/* Drawer */}
      <ProjectDrawer
        pin={selectedPin}
        tenant={tenant}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
