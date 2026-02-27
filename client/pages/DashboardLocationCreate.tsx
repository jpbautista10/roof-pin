import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import imageCompression from "browser-image-compression";
import { ArrowLeft, ImagePlus, Loader2, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/auth/AuthProvider";
import {
  createLocation,
  fetchLocationById,
  updateLocation,
} from "@/lib/locations";
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

const WORK_TYPES = ["Shingle", "Flat", "Tile", "Metal"] as const;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const YEARS = Array.from({ length: 8 }, (_, i) =>
  String(new Date().getFullYear() - i),
);

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

function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <svg
            className={`w-7 h-7 ${star <= value ? "text-amber-400" : "text-slate-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

interface ImageUploadProps {
  label: string;
  preview: string | null;
  onFile: (file: File, preview: string) => void;
  onClear: () => void;
}

function ImageUpload({ label, preview, onFile, onClear }: ImageUploadProps) {
  const [compressing, setCompressing] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
      });
      const url = URL.createObjectURL(compressed);
      onFile(compressed, url);
      toast.success(
        `Compressed: ${Math.round(file.size / 1024)}KB -> ${Math.round(compressed.size / 1024)}KB`,
      );
    } catch {
      toast.error("Failed to compress image");
    } finally {
      setCompressing(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {preview ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors">
          <ImagePlus className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-sm text-slate-500">
            {compressing ? "Compressing..." : "Click to upload"}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Auto-compressed to WebP
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            disabled={compressing}
          />
        </label>
      )}
    </div>
  );
}

async function uploadLocationImage(params: {
  userId: string;
  locationId: string;
  file: File;
  kind: "before" | "after";
}) {
  const ext =
    params.file.type === "image/webp"
      ? "webp"
      : (params.file.name.split(".").pop()?.toLowerCase() ?? "jpg");
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
    storage_path: filePath,
    public_url: data.publicUrl,
  };
}

export default function DashboardLocationCreate() {
  const navigate = useNavigate();
  const params = useParams<{ locationId: string }>();
  const queryClient = useQueryClient();
  const { user, company } = useAuth();
  const isEditMode = Boolean(params.locationId);

  const [address, setAddress] = useState("");
  const [debouncedAddress, setDebouncedAddress] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<GeocodeSuggestion | null>(null);
  const [neighborhood, setNeighborhood] = useState("");

  const [projectName, setProjectName] = useState("");
  const [workType, setWorkType] = useState<(typeof WORK_TYPES)[number] | "">(
    "",
  );
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [privacyMode, setPrivacyMode] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [stars, setStars] = useState(5);

  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  const [latitude, setLatitude] = useState(INITIAL_COORDS.lat);
  const [longitude, setLongitude] = useState(INITIAL_COORDS.lng);

  const editLocationQuery = useQuery({
    queryKey: ["locations", "single", params.locationId],
    enabled: isEditMode && Boolean(params.locationId),
    queryFn: async () => fetchLocationById(params.locationId!),
  });

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedAddress(address.trim()),
      250,
    );
    return () => window.clearTimeout(timeout);
  }, [address]);

  const suggestQuery = useQuery({
    queryKey: ["geocode", "suggest", debouncedAddress],
    enabled: debouncedAddress.length >= 2,
    queryFn: async () => {
      const response = await fetch(
        `/api/geocode/suggest?q=${encodeURIComponent(debouncedAddress)}&limit=6`,
      );
      if (!response.ok) {
        throw new Error("Could not fetch location suggestions.");
      }
      return (await response.json()) as GeocodeSuggestResponse;
    },
  });

  useEffect(() => {
    const location = editLocationQuery.data;
    if (!location) {
      return;
    }

    setProjectName(location.project_name ?? "");
    setAddress(location.place_label ?? "");
    setNeighborhood(location.place_label ?? "");
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setWorkType(
      (location.work_type as (typeof WORK_TYPES)[number] | null) ?? "",
    );
    setPrivacyMode(location.privacy_mode ?? false);

    if (location.date_completed) {
      const [savedMonth, savedYear] = location.date_completed.split(" ");
      setMonth(savedMonth ?? "");
      setYear(savedYear ?? "");
    }

    setCustomerName(location.review?.customer_name ?? "");
    setReviewText(location.review?.review_text ?? "");
    setStars(location.review?.stars ?? 5);

    const before = location.images.find((image) => image.kind === "before");
    const after = location.images.find((image) => image.kind === "after");
    setBeforePreview(before?.public_url ?? null);
    setAfterPreview(after?.public_url ?? null);
  }, [editLocationQuery.data]);

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

      if (!selectedSuggestion && !isEditMode) {
        throw new Error("Please pick a location from suggestions.");
      }

      if (!privacyMode && (!beforeFile || !afterFile)) {
        throw new Error("Upload before and after images.");
      }

      const locationPayload = {
        project_name: projectName.trim(),
        place_label:
          neighborhood.trim() || selectedSuggestion?.label || address.trim(),
        latitude,
        longitude,
        geocode_latitude:
          selectedSuggestion?.latitude ??
          editLocationQuery.data?.geocode_latitude ??
          latitude,
        geocode_longitude:
          selectedSuggestion?.longitude ??
          editLocationQuery.data?.geocode_longitude ??
          longitude,
        work_type: workType || null,
        date_completed: month && year ? `${month} ${year}` : null,
        privacy_mode: privacyMode,
        address_json: {
          city: selectedSuggestion?.city ?? null,
          state: selectedSuggestion?.state ?? null,
          country: selectedSuggestion?.country ?? null,
          postcode: selectedSuggestion?.postcode ?? null,
          full_address: selectedSuggestion?.label ?? address.trim(),
          neighborhood: neighborhood || null,
        },
      };

      const location = isEditMode
        ? await updateLocation(params.locationId!, locationPayload)
        : await createLocation({
            company_id: company.id,
            created_by_user_id: user.id,
            ...locationPayload,
          });

      const existingBefore = editLocationQuery.data?.images.find(
        (image) => image.kind === "before",
      );
      const existingAfter = editLocationQuery.data?.images.find(
        (image) => image.kind === "after",
      );

      if (!privacyMode) {
        if (!isEditMode && (!beforeFile || !afterFile)) {
          throw new Error("Upload before and after images.");
        }

        if (beforeFile) {
          const beforeUpload = await uploadLocationImage({
            userId: user.id,
            locationId: location.id,
            file: beforeFile,
            kind: "before",
          });

          const upsertBefore = await supabase.from("location_images").upsert(
            {
              location_id: location.id,
              kind: "before",
              public_url: beforeUpload.public_url,
              storage_path: beforeUpload.storage_path,
              sort_order: 0,
            },
            { onConflict: "location_id,kind,sort_order" },
          );

          if (upsertBefore.error) {
            throw upsertBefore.error;
          }
        }

        if (afterFile) {
          const afterUpload = await uploadLocationImage({
            userId: user.id,
            locationId: location.id,
            file: afterFile,
            kind: "after",
          });

          const upsertAfter = await supabase.from("location_images").upsert(
            {
              location_id: location.id,
              kind: "after",
              public_url: afterUpload.public_url,
              storage_path: afterUpload.storage_path,
              sort_order: 0,
            },
            { onConflict: "location_id,kind,sort_order" },
          );

          if (upsertAfter.error) {
            throw upsertAfter.error;
          }
        }

        if (isEditMode && !beforePreview && existingBefore) {
          const deleteBefore = await supabase
            .from("location_images")
            .delete()
            .eq("location_id", location.id)
            .eq("kind", "before")
            .eq("sort_order", 0);
          if (deleteBefore.error) throw deleteBefore.error;
        }

        if (isEditMode && !afterPreview && existingAfter) {
          const deleteAfter = await supabase
            .from("location_images")
            .delete()
            .eq("location_id", location.id)
            .eq("kind", "after")
            .eq("sort_order", 0);
          if (deleteAfter.error) throw deleteAfter.error;
        }
      }

      if (!privacyMode) {
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
        } else if (isEditMode && editLocationQuery.data?.review) {
          const deleteReview = await supabase
            .from("location_reviews")
            .delete()
            .eq("location_id", location.id);
          if (deleteReview.error) throw deleteReview.error;
        }
      }
    },
    onSuccess: async () => {
      if (company?.id) {
        await queryClient.invalidateQueries({
          queryKey: ["locations", company.id],
        });
      }
      toast.success(isEditMode ? "Location updated." : "Location created.");
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

  if (isEditMode && editLocationQuery.isLoading) {
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-6 text-sm text-slate-600">
        Loading location...
      </section>
    );
  }

  const suggestions = suggestQuery.data?.suggestions ?? [];

  return (
    <section className="max-w-full mx-auto px-4 sm:px-6 py-2">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? "Edit Location" : "Add a New Pin"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEditMode
              ? "Update your location details and project media."
              : "Add a completed project to your public map."}
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link to={`/dashboard/${company.slug}`}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate();
        }}
        className="space-y-6"
      >
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Location
          </h2>
          <div className="space-y-2">
            <Label htmlFor="address">Address / Zip Code</Label>
            <Input
              id="address"
              placeholder="e.g. 30303 or 123 Main St, Atlanta GA"
              value={address}
              onFocus={() => setShowSuggestions(true)}
              onChange={(event) => {
                setAddress(event.target.value);
                setShowSuggestions(true);
              }}
            />
            {showSuggestions && debouncedAddress.length >= 2 ? (
              <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                {suggestQuery.isLoading ? (
                  <p className="px-3 py-2 text-sm text-slate-500">
                    Searching...
                  </p>
                ) : suggestions.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-slate-500">
                    No suggestions found.
                  </p>
                ) : (
                  suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                      onClick={() => {
                        setSelectedSuggestion(suggestion);
                        setAddress(suggestion.label);
                        setLatitude(suggestion.latitude);
                        setLongitude(suggestion.longitude);
                        setShowSuggestions(false);
                      }}
                    >
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      {suggestion.label}
                    </button>
                  ))
                )}
              </div>
            ) : null}
            <p className="text-xs text-slate-400">
              Select a suggestion first, then drag pin or click map to refine.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Neighborhood</Label>
            <Input
              id="neighborhood"
              placeholder="e.g. Buckhead"
              value={neighborhood}
              onChange={(event) => setNeighborhood(event.target.value)}
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <MapContainer
              center={[latitude, longitude]}
              zoom={14}
              scrollWheelZoom
              className="h-[300px] w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapCenterUpdater lat={latitude} lng={longitude} />
              <MapClickSetter
                onSet={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
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
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Project Details
          </h2>
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="Northside Roof Replacement"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Work Type</Label>
            <Select
              value={workType}
              onValueChange={(value) =>
                setWorkType(value as (typeof WORK_TYPES)[number])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select work type" />
              </SelectTrigger>
              <SelectContent>
                {WORK_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Completed</Label>
            <div className="grid grid-cols-2 gap-3">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">Privacy Mode</Label>
              <p className="text-xs text-slate-500 mt-0.5">
                Hide customer details and testimonials for this project.
              </p>
            </div>
            <Switch checked={privacyMode} onCheckedChange={setPrivacyMode} />
          </div>
        </div>

        {!privacyMode ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Customer & Review
            </h2>
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                placeholder="e.g. James W."
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewText">Review Text</Label>
              <Textarea
                id="reviewText"
                placeholder="What did the customer say about the work?"
                rows={4}
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Star Rating</Label>
              <StarSelector value={stars} onChange={setStars} />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <ImageUpload
                label="Before Image"
                preview={beforePreview}
                onFile={(file, url) => {
                  setBeforeFile(file);
                  setBeforePreview(url);
                }}
                onClear={() => {
                  setBeforeFile(null);
                  setBeforePreview(null);
                }}
              />
              <ImageUpload
                label="After Image"
                preview={afterPreview}
                onFile={(file, url) => {
                  setAfterFile(file);
                  setAfterPreview(url);
                }}
                onClear={() => {
                  setAfterFile(null);
                  setAfterPreview(null);
                }}
              />
            </div>
          </div>
        ) : null}

        <Button
          type="submit"
          className="w-full h-11 text-sm font-semibold"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving location...
            </>
          ) : isEditMode ? (
            "Save Changes"
          ) : (
            "Save Pin"
          )}
        </Button>
      </form>
    </section>
  );
}
