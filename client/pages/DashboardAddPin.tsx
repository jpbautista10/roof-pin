import { useState } from "react";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useData } from "@/data/DataContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import type { WorkType } from "@/types";

const WORK_TYPES: WorkType[] = ["Shingle", "Flat", "Tile", "Metal"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const YEARS = Array.from({ length: 6 }, (_, i) => String(2024 - i));

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
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
      // Compress to max 200KB, 1200px width, WebP output
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: "image/webp",
      });
      const url = URL.createObjectURL(compressed);
      onFile(compressed, url);
      toast.success(`Compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB`);
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
          <img src={preview} alt={label} className="w-full h-full object-cover" />
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
            {compressing ? "Compressing…" : "Click to upload"}
          </span>
          <span className="text-xs text-slate-400 mt-1">Auto-compressed to WebP ≤200KB</span>
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

export default function DashboardAddPin() {
  const { tenant, addPin } = useData();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [workType, setWorkType] = useState<WorkType | "">("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [privacyMode, setPrivacyMode] = useState(false);

  // Non-privacy fields
  const [customerName, setCustomerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [stars, setStars] = useState(5);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [_beforeFile, setBeforeFile] = useState<File | null>(null);
  const [_afterFile, setAfterFile] = useState<File | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Mock lat/lng — in production, geocode from address via Mapbox
    const mockLat = 33.749 + (Math.random() - 0.5) * 0.08;
    const mockLng = -84.388 + (Math.random() - 0.5) * 0.08;

    const newPin = {
      id: `p${Date.now()}`,
      tenant_id: tenant.id,
      lat: mockLat,
      lng: mockLng,
      zip_code: address,
      customer_name: privacyMode ? "" : customerName,
      neighborhood: neighborhood,
      review_text: privacyMode ? "" : reviewText,
      stars: privacyMode ? 0 : stars,
      before_img_url: privacyMode ? "" : (beforePreview || ""),
      after_img_url: privacyMode ? "" : (afterPreview || ""),
      created_at: new Date().toISOString(),
      work_type: (workType || "Shingle") as import("@/types").WorkType,
      date_completed: month && year ? `${month} ${year}` : "January 2024",
      privacy_mode: privacyMode,
    };

    addPin(newPin);
    toast.success("Pin added successfully!");
    navigate("/dashboard");
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Add a New Pin</h1>
          <p className="text-sm text-slate-500 mt-1">
            Add a completed project to your public map.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location */}
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
                onChange={(e) => setAddress(e.target.value)}
              />
              <p className="text-xs text-slate-400">
                Will be geocoded to lat/lng via Mapbox when connected.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Neighborhood</Label>
              <Input
                id="neighborhood"
                placeholder="e.g. Buckhead"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
              />
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Project Details
            </h2>
            <div className="space-y-2">
              <Label>Work Type</Label>
              <Select value={workType} onValueChange={(v) => setWorkType(v as WorkType)}>
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
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Privacy Mode</Label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Anonymize this project? Pin will show in the general area, no customer details shown.
                </p>
              </div>
              <Switch checked={privacyMode} onCheckedChange={setPrivacyMode} />
            </div>
          </div>

          {/* Customer & Review (only when NOT privacy mode) */}
          {!privacyMode && (
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
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewText">Review Text</Label>
                <Textarea
                  id="reviewText"
                  placeholder="What did the customer say about the work?"
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
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
          )}

          {/* Submit */}
          <Button type="submit" className="w-full h-11 text-sm font-semibold">
            Save Pin
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
