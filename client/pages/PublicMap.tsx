import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import MapHeader from "@/components/map/MapHeader";
import MapView from "@/components/map/MapView";
import StatsView from "@/components/map/StatsView";
import ProjectDrawer from "@/components/map/ProjectDrawer";
import { PublicCompany, PublicLocation } from "@/types/public-map";

interface LocationQueryRow {
  id: string;
  project_name: string;
  place_label: string;
  latitude: number;
  longitude: number;
  geocode_latitude: number;
  geocode_longitude: number;
  privacy_mode: boolean;
  date_completed: string | null;
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

const DEMO_SLUGS = new Set(["demo"]);

const demoCompany: PublicCompany = {
  id: "demo-company",
  name: "Neighborhood Roofing Co.",
  slug: "demo",
  logo_url: null,
  cta_url: "https://example.com/contact",
  brand_primary_color: "#0f766e",
  brand_secondary_color: "#0ea5e9",
};

const demoLocations: PublicLocation[] = [
  {
    id: "demo-1",
    project_name: "Buckhead Full Roof Replacement",
    place_label: "Buckhead, Atlanta, GA",
    latitude: 33.8462,
    longitude: -84.3713,
    privacy_mode: false,
    date_completed: "January 2026",
    created_at: new Date("2026-01-18").toISOString(),
    images: [
      {
        id: "demo-1-before",
        kind: "before",
        public_url: "/row-1-column-1.jpg",
        sort_order: 0,
      },
      {
        id: "demo-1-after",
        kind: "after",
        public_url: "/row-1-column-2.jpg",
        sort_order: 0,
      },
    ],
    reviews: [
      {
        customer_name: "Marcus T.",
        review_text:
          "Crew arrived early, explained everything clearly, and the cleanup was perfect.",
        stars: 5,
      },
    ],
  },
  {
    id: "demo-2",
    project_name: "East Atlanta Storm Repair",
    place_label: "East Atlanta Village, Atlanta, GA",
    latitude: 33.7402,
    longitude: -84.3458,
    privacy_mode: true,
    date_completed: "February 2026",
    created_at: new Date("2026-02-04").toISOString(),
    images: [
      {
        id: "demo-2-before",
        kind: "before",
        public_url: "/row-1-column-1.jpg",
        sort_order: 0,
      },
      {
        id: "demo-2-after",
        kind: "after",
        public_url: "/row-1-column-2.jpg",
        sort_order: 0,
      },
    ],
    reviews: [
      {
        customer_name: "Andrea L.",
        review_text:
          "We had active leaks after a storm and they got us watertight fast. Great communication.",
        stars: 5,
      },
    ],
  },
  {
    id: "demo-3",
    project_name: "Decatur Architectural Shingle Upgrade",
    place_label: "Decatur, GA",
    latitude: 33.7748,
    longitude: -84.2963,
    privacy_mode: false,
    date_completed: "February 2026",
    created_at: new Date("2026-02-20").toISOString(),
    images: [
      {
        id: "demo-3-before",
        kind: "before",
        public_url: "/row-1-column-1.jpg",
        sort_order: 0,
      },
      {
        id: "demo-3-after",
        kind: "after",
        public_url: "/row-1-column-2.jpg",
        sort_order: 0,
      },
    ],
    reviews: [
      {
        customer_name: "Priya K.",
        review_text:
          "The before/after difference is huge. The team was respectful and finished on schedule.",
        stars: 4,
      },
    ],
  },
];

function normalizeLocations(rows: LocationQueryRow[]): PublicLocation[] {
  return rows.map((row) => {
    const displayLatitude =
      Number.isFinite(row.latitude) && row.latitude !== 0
        ? row.latitude
        : row.geocode_latitude;
    const displayLongitude =
      Number.isFinite(row.longitude) && row.longitude !== 0
        ? row.longitude
        : row.geocode_longitude;

    return {
      id: row.id,
      project_name: row.project_name,
      place_label: row.place_label,
      latitude: displayLatitude,
      longitude: displayLongitude,
      privacy_mode: row.privacy_mode,
      date_completed: row.date_completed,
      created_at: row.created_at,
      images: row.location_images ?? [],
      reviews: Array.isArray(row.location_reviews)
        ? row.location_reviews.filter(Boolean)
        : row.location_reviews
          ? [row.location_reviews]
          : [],
    };
  });
}

export default function PublicMap() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isDemoMode = DEMO_SLUGS.has(slug ?? "");
  const isEmbedMode = searchParams.get("embed") === "1";
  const [activeTab, setActiveTab] = useState("map");
  const [selectedLocation, setSelectedLocation] =
    useState<PublicLocation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const companyQuery = useQuery({
    queryKey: ["public-map", "company", slug],
    enabled: Boolean(slug) && !isDemoMode,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(
          "id, name, slug, logo_url, cta_url, brand_primary_color, brand_secondary_color",
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
    enabled: Boolean(companyQuery.data?.id) && !isDemoMode,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select(
          "id, project_name, place_label, latitude, longitude, geocode_latitude, geocode_longitude, privacy_mode, date_completed, created_at, location_images(id, kind, public_url, sort_order), location_reviews(customer_name, review_text, stars)",
        )
        .eq("company_id", companyQuery.data!.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return normalizeLocations((data ?? []) as LocationQueryRow[]);
    },
  });

  const company = isDemoMode ? demoCompany : companyQuery.data;
  const locations = isDemoMode ? demoLocations : (locationsQuery.data ?? []);

  const mapSummary = useMemo(() => {
    const ratings = locations
      .flatMap((location) =>
        location.privacy_mode
          ? []
          : location.reviews.map((review) => review.stars ?? null),
      )
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

  if (!isDemoMode && (companyQuery.isLoading || locationsQuery.isLoading)) {
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
      {!isEmbedMode ? (
        <MapHeader
          company={company}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      ) : null}

      {isDemoMode && !isEmbedMode ? (
        <div className="absolute left-4 top-[4.5rem] z-[500] rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          Live Demo Mode
        </div>
      ) : null}

      <div className="relative flex-1 overflow-hidden">
        {isEmbedMode || activeTab === "map" ? (
          <MapView
            locations={locations}
            onSelectLocation={openLocation}
            brandColor={company.brand_primary_color}
          />
        ) : (
          <StatsView locations={locations} onSelectLocation={openLocation} />
        )}
      </div>

      {!isEmbedMode ? (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-[500] -translate-x-1/2">
          <div className="pointer-events-auto rounded-full border border-slate-200 bg-white/95 px-4 py-1.5 text-xs text-slate-600 shadow-sm backdrop-blur">
            {mapSummary.totalProjects} project
            {mapSummary.totalProjects === 1 ? "" : "s"}
            {typeof mapSummary.averageRating === "number"
              ? ` · ${mapSummary.averageRating.toFixed(1)} avg rating`
              : ""}
          </div>
        </div>
      ) : null}

      <ProjectDrawer
        location={selectedLocation}
        company={company}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
