import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import { MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import MapHeader from "@/components/map/MapHeader";
import MapView from "@/components/map/MapView";
import StatsView from "@/components/map/StatsView";
import ProjectDrawer from "@/components/map/ProjectDrawer";
import { PublicCompany, PublicLocation } from "@/types/public-map";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationQueryRow {
  id: string;
  project_name: string;
  place_label: string;
  latitude: number;
  longitude: number;
  created_at: string;
  location_images: Array<{
    id: string;
    kind: string;
    public_url: string;
    sort_order: number;
  }> | null;
  location_reviews:
    | {
        customer_name: string | null;
        review_text: string | null;
        stars: number | null;
      }
    | {
        customer_name: string | null;
        review_text: string | null;
        stars: number | null;
      }[]
    | null;
}

function normalizeLocations(rows: LocationQueryRow[]): PublicLocation[] {
  return rows.map((row) => ({
    id: row.id,
    project_name: row.project_name,
    place_label: row.place_label,
    latitude: row.latitude,
    longitude: row.longitude,
    created_at: row.created_at,
    images: row.location_images ?? [],
    review: Array.isArray(row.location_reviews)
      ? (row.location_reviews[0] ?? null)
      : row.location_reviews,
  }));
}

export default function PublicMap() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState("map");
  const [selectedLocation, setSelectedLocation] =
    useState<PublicLocation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const companyQuery = useQuery({
    queryKey: ["public-map", "company", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(
          "id, name, slug, logo_url, brand_primary_color, brand_secondary_color, brand_accent_color",
        )
        .eq("slug", slug)
        .maybeSingle<PublicCompany>();

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const locationsQuery = useQuery({
    queryKey: ["public-map", "locations", companyQuery.data?.id],
    enabled: Boolean(companyQuery.data?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select(
          "id, project_name, place_label, latitude, longitude, created_at, location_images(id, kind, public_url, sort_order), location_reviews(customer_name, review_text, stars)",
        )
        .eq("company_id", companyQuery.data!.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return normalizeLocations((data ?? []) as LocationQueryRow[]);
    },
  });

  const company = companyQuery.data;
  const locations = locationsQuery.data ?? [];

  const mapSummary = useMemo(() => {
    const ratings = locations
      .map((location) => location.review?.stars ?? null)
      .filter((value): value is number => typeof value === "number");

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
        : null;

    return {
      totalProjects: locations.length,
      averageRating,
    };
  }, [locations]);

  function openLocation(location: PublicLocation) {
    setSelectedLocation(location);
    setDrawerOpen(true);
  }

  if (companyQuery.isLoading || locationsQuery.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Loading public map...</p>
      </div>
    );
  }

  if (!company || !slug) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="max-w-sm px-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200">
            <MapPin className="h-7 w-7 text-slate-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Map not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            This map does not exist or is not available right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen flex flex-col overflow-hidden">
      <MapHeader
        company={company}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="relative flex-1 overflow-hidden">
        {activeTab === "map" ? (
          <MapView locations={locations} onSelectLocation={openLocation} />
        ) : (
          <StatsView locations={locations} onSelectLocation={openLocation} />
        )}
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-[500] -translate-x-1/2">
        <div className="pointer-events-auto rounded-full border border-slate-200 bg-white/95 px-4 py-1.5 text-xs text-slate-600 shadow-sm backdrop-blur">
          {mapSummary.totalProjects} project
          {mapSummary.totalProjects === 1 ? "" : "s"}
          {typeof mapSummary.averageRating === "number"
            ? ` · ${mapSummary.averageRating.toFixed(1)} avg rating`
            : ""}
        </div>
      </div>

      <ProjectDrawer
        location={selectedLocation}
        company={company}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
