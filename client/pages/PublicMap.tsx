import { useState } from "react";
import { useParams } from "react-router-dom";
import { getTenantBySlug, getPinsForTenant } from "@/data/mock";
import MapView from "@/components/map/MapView";
import MapHeader from "@/components/map/MapHeader";
import StatsView from "@/components/map/StatsView";

export default function PublicMap() {
  const { slug } = useParams<{ slug: string }>();
  const tenant = slug ? getTenantBySlug(slug) : undefined;
  const [activeTab, setActiveTab] = useState("map");

  if (!tenant) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Map not found</h1>
          <p className="text-sm text-slate-500 max-w-xs">
            This contractor map doesn't exist. Check the URL or contact the business owner.
          </p>
        </div>
      </div>
    );
  }

  const pins = getPinsForTenant(tenant.id);

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <MapHeader
        tenant={tenant}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "map" ? (
        <MapView tenant={tenant} pins={pins} />
      ) : (
        <StatsView tenant={tenant} pins={pins} />
      )}
    </div>
  );
}
