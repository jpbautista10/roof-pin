import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { ArrowLeft, Loader2, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/auth/AuthProvider";
import { createLocation } from "@/lib/locations";
import { supabase } from "@/lib/supabase";
import { GeocodeSuggestResponse, GeocodeSuggestion } from "@shared/api";

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

const INITIAL_COORDS = {
  lat: 33.749,
  lng: -84.388,
};

function MapCenterUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);

  return null;
}

function MapClickSetter({
  onSet,
}: {
  onSet: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onSet(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

async function uploadLocationImage(params: {
  userId: string;
  locationId: string;
  file: File;
  kind: "before" | "after";
}) {
  const ext = params.file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filePath = `${params.userId}/${params.locationId}/${params.kind}-${Date.now()}.${ext}`;

  const uploadResult = await supabase.storage
    .from("location-images")
    .upload(filePath, params.file, { upsert: true });

  if (uploadResult.error) {
    throw uploadResult.error;
  }

  const { data } = supabase.storage
    .from("location-images")
    .getPublicUrl(filePath);

  return {
    kind: params.kind,
    storage_path: filePath,
    public_url: data.publicUrl,
  };
}

export default function DashboardLocationCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, company } = useAuth();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<GeocodeSuggestion | null>(null);

  const [projectName, setProjectName] = useState("");
  const [latitude, setLatitude] = useState(INITIAL_COORDS.lat);
  const [longitude, setLongitude] = useState(INITIAL_COORDS.lng);

  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [stars, setStars] = useState(5);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const suggestQuery = useQuery({
    queryKey: ["geocode", "suggest", debouncedQuery],
    enabled: debouncedQuery.length >= 2,
    queryFn: async () => {
      const response = await fetch(
        `/api/geocode/suggest?q=${encodeURIComponent(debouncedQuery)}&limit=6`,
      );
      if (!response.ok) {
        throw new Error("Could not fetch location suggestions.");
      }
      return (await response.json()) as GeocodeSuggestResponse;
    },
  });

  const suggestions = suggestQuery.data?.suggestions ?? [];

  const beforePreview = useMemo(
    () => (beforeImage ? URL.createObjectURL(beforeImage) : ""),
    [beforeImage],
  );
  const afterPreview = useMemo(
    () => (afterImage ? URL.createObjectURL(afterImage) : ""),
    [afterImage],
  );

  useEffect(() => {
    return () => {
      if (beforePreview) URL.revokeObjectURL(beforePreview);
      if (afterPreview) URL.revokeObjectURL(afterPreview);
    };
  }, [beforePreview, afterPreview]);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user || !company) {
        throw new Error("You need to be authenticated to create a location.");
      }

      if (!projectName.trim()) {
        throw new Error("Project name is required.");
      }

      if (!selectedSuggestion) {
        throw new Error("Please select a location from suggestions first.");
      }

      if (!beforeImage || !afterImage) {
        throw new Error("Upload both before and after images.");
      }

      const location = await createLocation({
        company_id: company.id,
        created_by_user_id: user.id,
        project_name: projectName.trim(),
        place_label: selectedSuggestion.label,
        latitude,
        longitude,
        geocode_latitude: selectedSuggestion.latitude,
        geocode_longitude: selectedSuggestion.longitude,
        address_json: {
          city: selectedSuggestion.city,
          state: selectedSuggestion.state,
          country: selectedSuggestion.country,
          postcode: selectedSuggestion.postcode,
        },
      });

      const [beforeUpload, afterUpload] = await Promise.all([
        uploadLocationImage({
          userId: user.id,
          locationId: location.id,
          file: beforeImage,
          kind: "before",
        }),
        uploadLocationImage({
          userId: user.id,
          locationId: location.id,
          file: afterImage,
          kind: "after",
        }),
      ]);

      const insertImages = await supabase.from("location_images").insert([
        {
          location_id: location.id,
          kind: "before",
          public_url: beforeUpload.public_url,
          storage_path: beforeUpload.storage_path,
          sort_order: 0,
        },
        {
          location_id: location.id,
          kind: "after",
          public_url: afterUpload.public_url,
          storage_path: afterUpload.storage_path,
          sort_order: 0,
        },
      ]);

      if (insertImages.error) {
        throw insertImages.error;
      }

      if (reviewText.trim() || customerName.trim()) {
        const insertReview = await supabase.from("location_reviews").upsert({
          location_id: location.id,
          customer_name: customerName.trim() || null,
          review_text: reviewText.trim() || null,
          stars,
        });

        if (insertReview.error) {
          throw insertReview.error;
        }
      }
    },
    onSuccess: async () => {
      if (company?.id) {
        await queryClient.invalidateQueries({
          queryKey: ["locations", company.id],
        });
      }
      toast.success("Location created.");
      navigate(`/dashboard/${company?.slug}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to create location.",
      );
    },
  });

  if (!company?.slug) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-sm text-slate-500">New location</p>
          <h1 className="text-2xl font-bold text-slate-900">
            Create project location
          </h1>
        </div>
        <Button variant="ghost" asChild>
          <Link to={`/dashboard/${company.slug}`}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="location-search">Location</Label>
            <Input
              id="location-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search address, neighborhood, city..."
            />
            {debouncedQuery.length >= 2 ? (
              <div className="max-h-64 overflow-auto rounded-lg border border-slate-200">
                {suggestQuery.isLoading ? (
                  <p className="px-3 py-2 text-sm text-slate-500">
                    Searching...
                  </p>
                ) : suggestions.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-slate-500">
                    No matches found.
                  </p>
                ) : (
                  suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => {
                        setSelectedSuggestion(suggestion);
                        setQuery(suggestion.label);
                        setLatitude(suggestion.latitude);
                        setLongitude(suggestion.longitude);
                      }}
                      className="flex w-full items-start gap-2 border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-700 transition-colors last:border-b-0 hover:bg-slate-50"
                    >
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                      <span>{suggestion.label}</span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
            <p className="text-xs text-slate-500">
              Select a suggestion first, then drag the pin or click the map to
              refine coordinates.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Northside Roof Replacement"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="before-image">Before image</Label>
              <Input
                id="before-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  setBeforeImage(event.target.files?.[0] ?? null)
                }
              />
              {beforePreview ? (
                <img
                  src={beforePreview}
                  alt="Before preview"
                  className="aspect-video w-full rounded-lg border border-slate-200 object-cover"
                />
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="after-image">After image</Label>
              <Input
                id="after-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  setAfterImage(event.target.files?.[0] ?? null)
                }
              />
              {afterPreview ? (
                <img
                  src={afterPreview}
                  alt="After preview"
                  className="aspect-video w-full rounded-lg border border-slate-200 object-cover"
                />
              ) : null}
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-4">
            <p className="text-sm font-medium text-slate-900">
              Optional customer review
            </p>
            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer name</Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Jamie W."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-text">Review text</Label>
              <Textarea
                id="review-text"
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder="They finished quickly and left everything spotless."
              />
            </div>
            <div className="space-y-2">
              <Label>Stars</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStars(value)}
                    className="rounded p-1"
                    aria-label={`Set ${value} stars`}
                  >
                    <Star
                      className={`h-5 w-5 ${value <= stars ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="w-full"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving location...
              </>
            ) : (
              "Save location"
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <MapContainer
              center={[latitude, longitude]}
              zoom={14}
              scrollWheelZoom
              className="h-[420px] w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapCenterUpdater lat={latitude} lng={longitude} />
              <MapClickSetter
                onSet={(nextLat, nextLng) => {
                  setLatitude(nextLat);
                  setLongitude(nextLng);
                }}
              />
              <Marker
                draggable
                position={[latitude, longitude]}
                eventHandlers={{
                  dragend: (event) => {
                    const marker = event.target;
                    const next = marker.getLatLng();
                    setLatitude(next.lat);
                    setLongitude(next.lng);
                  },
                }}
              />
            </MapContainer>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <p className="font-medium text-slate-900">Pin coordinates</p>
            <p className="mt-1">Latitude: {latitude.toFixed(6)}</p>
            <p>Longitude: {longitude.toFixed(6)}</p>
            {selectedSuggestion ? (
              <p className="mt-2 text-xs text-slate-500">
                Initial suggestion: {selectedSuggestion.latitude.toFixed(6)},{" "}
                {selectedSuggestion.longitude.toFixed(6)}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
