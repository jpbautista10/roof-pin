import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Map, {
  Marker,
  NavigationControl,
  type MapMouseEvent,
  type MarkerDragEvent,
  type ViewState,
} from "react-map-gl/mapbox";
import imageCompression from "browser-image-compression";
import {
  ArrowLeft,
  Copy,
  ImagePlus,
  Loader2,
  MapPin,
  QrCode,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/auth/AuthProvider";
import LocationPin from "@/components/map/LocationPin";
import {
  createLocation,
  fetchLocationById,
  updateLocation,
} from "@/lib/locations";
import { createOrGetReviewToken } from "@/lib/review-requests";
import { supabase } from "@/lib/supabase";
import { GeocodeSuggestResponse, GeocodeSuggestion } from "@shared/api";

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

const INITIAL_COORDS = { lat: 33.749, lng: -84.388 };
const MAPBOX_STYLE = "mapbox://styles/mapbox/standard";
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

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
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer">
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
  return { storage_path: filePath, public_url: data.publicUrl };
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

  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  const [latitude, setLatitude] = useState(INITIAL_COORDS.lat);
  const [longitude, setLongitude] = useState(INITIAL_COORDS.lng);
  const [viewState, setViewState] = useState<ViewState>({
    latitude: INITIAL_COORDS.lat,
    longitude: INITIAL_COORDS.lng,
    zoom: 14,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  const [reviewLink, setReviewLink] = useState("");
  const [reviewQrDataUrl, setReviewQrDataUrl] = useState("");

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
    enabled: showSuggestions && debouncedAddress.length >= 2,
    queryFn: async () => {
      const response = await fetch(
        `/api/geocode/suggest?q=${encodeURIComponent(debouncedAddress)}&limit=6`,
      );
      if (!response.ok)
        throw new Error("Could not fetch location suggestions.");
      return (await response.json()) as GeocodeSuggestResponse;
    },
  });

  useEffect(() => {
    const location = editLocationQuery.data;
    if (!location) return;

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

    const before = location.images.find((image) => image.kind === "before");
    const after = location.images.find((image) => image.kind === "after");
    setBeforePreview(before?.public_url ?? null);
    setAfterPreview(after?.public_url ?? null);
  }, [editLocationQuery.data]);

  useEffect(() => {
    return () => {
      if (beforePreview?.startsWith("blob:"))
        URL.revokeObjectURL(beforePreview);
      if (afterPreview?.startsWith("blob:")) URL.revokeObjectURL(afterPreview);
    };
  }, [beforePreview, afterPreview]);

  useEffect(() => {
    setViewState((previous) => ({
      ...previous,
      latitude,
      longitude,
    }));
  }, [latitude, longitude]);

  function handleMapClick(event: MapMouseEvent) {
    setLatitude(event.lngLat.lat);
    setLongitude(event.lngLat.lng);
  }

  function handleMarkerDragEnd(event: MarkerDragEvent) {
    setLatitude(event.lngLat.lat);
    setLongitude(event.lngLat.lng);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user || !company) throw new Error("You need to be authenticated.");
      if (!projectName.trim()) throw new Error("Project name is required.");
      if (!selectedSuggestion && !isEditMode) {
        throw new Error("Please pick a location from suggestions.");
      }

      const payload = {
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
        ? await updateLocation(params.locationId!, payload)
        : await createLocation({
            company_id: company.id,
            created_by_user_id: user.id,
            ...payload,
          });

      if (!privacyMode) {
        const hasBeforeImage = Boolean(beforeFile || beforePreview);
        const hasAfterImage = Boolean(afterFile || afterPreview);

        if (!hasBeforeImage || !hasAfterImage) {
          throw new Error("Upload before and after images.");
        }

        if (beforeFile) {
          const uploaded = await uploadLocationImage({
            userId: user.id,
            locationId: location.id,
            file: beforeFile,
            kind: "before",
          });
          const upsert = await supabase.from("location_images").upsert(
            {
              location_id: location.id,
              kind: "before",
              public_url: uploaded.public_url,
              storage_path: uploaded.storage_path,
              sort_order: 0,
            },
            { onConflict: "location_id,kind,sort_order" },
          );
          if (upsert.error) throw upsert.error;
        }

        if (afterFile) {
          const uploaded = await uploadLocationImage({
            userId: user.id,
            locationId: location.id,
            file: afterFile,
            kind: "after",
          });
          const upsert = await supabase.from("location_images").upsert(
            {
              location_id: location.id,
              kind: "after",
              public_url: uploaded.public_url,
              storage_path: uploaded.storage_path,
              sort_order: 0,
            },
            { onConflict: "location_id,kind,sort_order" },
          );
          if (upsert.error) throw upsert.error;
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
        error instanceof Error ? error.message : "Unable to save location.",
      );
    },
  });

  const reviewRequestMutation = useMutation({
    mutationFn: async () => {
      if (!params.locationId) throw new Error("Save location first.");
      const token = await createOrGetReviewToken(params.locationId);
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const link = `${baseUrl}/review/${token}`;
      const qr = await QRCode.toDataURL(link, { margin: 1, width: 280 });
      return { link, qr };
    },
    onSuccess: ({ link, qr }) => {
      setReviewLink(link);
      setReviewQrDataUrl(qr);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to generate review link.",
      );
    },
  });

  async function copyReviewLink() {
    if (!reviewLink) return;
    try {
      await navigator.clipboard.writeText(reviewLink);
      toast.success("Review link copied.");
    } catch {
      toast.error("Unable to copy review link.");
    }
  }

  if (!company?.slug) return null;
  if (isEditMode && editLocationQuery.isLoading) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-6 text-sm text-slate-600">
        Loading location...
      </section>
    );
  }

  const suggestions = suggestQuery.data?.suggestions ?? [];
  const hasReview = Boolean(editLocationQuery.data?.review);
  const reviewLocked =
    editLocationQuery.data?.review?.source === "customer_link";

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-2">
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
          saveMutation.mutate();
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
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
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
            {MAPBOX_TOKEN ? (
              <Map
                {...viewState}
                onMove={(event) => setViewState(event.viewState)}
                onClick={handleMapClick}
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle={MAPBOX_STYLE}
                style={{ width: "100%", height: 300 }}
                attributionControl
              >
                <NavigationControl position="top-right" />
                <Marker
                  latitude={latitude}
                  longitude={longitude}
                  anchor="bottom"
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                >
                  <LocationPin className="-mt-1" />
                </Marker>
              </Map>
            ) : (
              <div className="flex h-[300px] w-full items-center justify-center bg-slate-100">
                <p className="px-4 text-center text-sm text-slate-600">
                  Mapbox token missing. Set `VITE_MAPBOX_ACCESS_TOKEN`.
                </p>
              </div>
            )}
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
                Show approximate location and hide customer details on public
                map.
              </p>
            </div>
            <Switch checked={privacyMode} onCheckedChange={setPrivacyMode} />
          </div>
        </div>

        {!privacyMode ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Project Photos
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <ImageUpload
                label="Before Image"
                preview={beforePreview}
                onFile={(file, preview) => {
                  setBeforeFile(file);
                  setBeforePreview(preview);
                }}
                onClear={() => {
                  setBeforeFile(null);
                  setBeforePreview(null);
                }}
              />
              <ImageUpload
                label="After Image"
                preview={afterPreview}
                onFile={(file, preview) => {
                  setAfterFile(file);
                  setAfterPreview(preview);
                }}
                onClear={() => {
                  setAfterFile(null);
                  setAfterPreview(null);
                }}
              />
            </div>
          </div>
        ) : null}

        {isEditMode ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Customer Review Request
            </h2>
            {hasReview ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                Review received.
                {reviewLocked
                  ? " This review came from customer link and is locked."
                  : ""}
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  Generate a secure link and QR code for your customer to submit
                  their own review.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => reviewRequestMutation.mutate()}
                  disabled={reviewRequestMutation.isPending}
                >
                  <QrCode className="h-4 w-4" />
                  {reviewRequestMutation.isPending
                    ? "Generating..."
                    : "Generate link and QR"}
                </Button>
                {reviewQrDataUrl ? (
                  <img
                    src={reviewQrDataUrl}
                    alt="Customer review QR code"
                    className="h-44 w-44 rounded-lg border border-slate-200 p-2"
                  />
                ) : null}
                {reviewLink ? (
                  <>
                    <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 break-all">
                      {reviewLink}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void copyReviewLink()}
                    >
                      <Copy className="h-4 w-4" />
                      Copy link
                    </Button>
                  </>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        <Button
          type="submit"
          className="w-full h-11 text-sm font-semibold"
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
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
