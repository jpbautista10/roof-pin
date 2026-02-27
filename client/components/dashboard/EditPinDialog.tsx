import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import type { Pin, WorkType } from "@/types";

const WORK_TYPES: WorkType[] = ["Shingle", "Flat", "Tile", "Metal"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const YEARS = Array.from({ length: 6 }, (_, i) => String(2024 - i));

interface EditPinDialogProps {
  pin: Pin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Pin>) => void;
}

export default function EditPinDialog({ pin, open, onOpenChange, onSave }: EditPinDialogProps) {
  const [neighborhood, setNeighborhood] = useState("");
  const [workType, setWorkType] = useState<WorkType>("Shingle");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [privacyMode, setPrivacyMode] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [stars, setStars] = useState(5);

  useEffect(() => {
    if (pin) {
      setNeighborhood(pin.neighborhood);
      setWorkType(pin.work_type);
      setPrivacyMode(pin.privacy_mode);
      setCustomerName(pin.customer_name);
      setReviewText(pin.review_text);
      setStars(pin.stars);
      const parts = pin.date_completed.split(" ");
      setMonth(parts[0] || "");
      setYear(parts[1] || "");
    }
  }, [pin]);

  if (!pin) return null;

  function handleSave() {
    if (!pin) return;
    onSave(pin.id, {
      neighborhood,
      work_type: workType,
      date_completed: month && year ? `${month} ${year}` : pin.date_completed,
      privacy_mode: privacyMode,
      customer_name: privacyMode ? "" : customerName,
      review_text: privacyMode ? "" : reviewText,
      stars: privacyMode ? 0 : stars,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Pin</DialogTitle>
          <DialogDescription>Update the details for this project pin.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Neighborhood */}
          <div className="space-y-2">
            <Label htmlFor="edit-neighborhood">Neighborhood</Label>
            <Input
              id="edit-neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
            />
          </div>

          {/* Work Type */}
          <div className="space-y-2">
            <Label>Work Type</Label>
            <Select value={workType} onValueChange={(v) => setWorkType(v as WorkType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Completed */}
          <div className="space-y-2">
            <Label>Date Completed</Label>
            <div className="grid grid-cols-2 gap-3">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div>
              <Label className="text-sm font-semibold">Privacy Mode</Label>
              <p className="text-xs text-slate-500 mt-0.5">Hide customer details on public map.</p>
            </div>
            <Switch checked={privacyMode} onCheckedChange={setPrivacyMode} />
          </div>

          {/* Customer fields (non-privacy only) */}
          {!privacyMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-customer">Customer Name</Label>
                <Input
                  id="edit-customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-review">Review Text</Label>
                <Textarea
                  id="edit-review"
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Star Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStars(s)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-7 h-7 ${s <= stars ? "text-amber-400" : "text-slate-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
