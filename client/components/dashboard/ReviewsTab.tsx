import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  MapPin,
  QrCode,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LocationWithAssets } from "@/lib/locations";
import { supabase } from "@/lib/supabase";

type ReviewFilter = "all" | "positive" | "negative" | "hidden" | "deleted";

interface ReviewItem {
  locationId: string;
  projectName: string;
  neighborhood: string;
  customerName: string | null;
  reviewText: string | null;
  stars: number | null;
  source: string;
  isVisible: boolean;
  deletedAt: string | null;
  createdAt: string;
}

function getNeighborhood(addressJson: unknown, fallback: string) {
  if (addressJson && typeof addressJson === "object") {
    const obj = addressJson as Record<string, unknown>;
    if (typeof obj.neighborhood === "string" && obj.neighborhood.trim()) {
      return obj.neighborhood;
    }
    if (typeof obj.city === "string" && obj.city.trim()) {
      return obj.city;
    }
  }
  return fallback;
}

function StarRow({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((v) => (
        <Star
          key={v}
          className={`h-3.5 w-3.5 ${v <= stars ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
        />
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

interface ReviewsTabProps {
  locations: LocationWithAssets[];
  companyId: string;
  onRequestReview: (locationId: string) => void;
}

export default function ReviewsTab({
  locations,
  companyId,
  onRequestReview,
}: ReviewsTabProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Build flat list of reviews from locations
  const allReviews = useMemo(() => {
    const items: ReviewItem[] = [];
    for (const loc of locations) {
      if (!loc.review) continue;
      items.push({
        locationId: loc.id,
        projectName: loc.project_name,
        neighborhood: getNeighborhood(loc.address_json, loc.place_label),
        customerName: loc.review.customer_name,
        reviewText: loc.review.review_text,
        stars: loc.review.stars,
        source: loc.review.source,
        isVisible: loc.review.is_visible ?? true,
        deletedAt: loc.review.deleted_at ?? null,
        createdAt: loc.review.created_at ?? loc.created_at,
      });
    }
    return items;
  }, [locations]);

  const stats = useMemo(() => {
    const total = allReviews.length;
    const active = allReviews.filter((r) => !r.deletedAt);
    const avgRating =
      active.length > 0
        ? active.reduce((s, r) => s + (r.stars ?? 0), 0) / active.length
        : 0;
    const hidden = allReviews.filter(
      (r) => !r.isVisible && !r.deletedAt,
    ).length;
    const deleted = allReviews.filter((r) => r.deletedAt).length;
    return { total, avgRating, hidden, deleted };
  }, [allReviews]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allReviews.filter((r) => {
      if (filter === "positive" && (r.stars ?? 0) < 4) return false;
      if (filter === "negative" && (r.stars ?? 0) >= 4) return false;
      if (filter === "hidden" && (r.isVisible || r.deletedAt)) return false;
      if (filter === "deleted" && !r.deletedAt) return false;
      if (filter === "all" && r.deletedAt) return false;
      if (!q) return true;
      return (
        (r.customerName ?? "").toLowerCase().includes(q) ||
        (r.reviewText ?? "").toLowerCase().includes(q) ||
        r.projectName.toLowerCase().includes(q) ||
        r.neighborhood.toLowerCase().includes(q)
      );
    });
  }, [allReviews, filter, search]);

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({
      locationId,
      isVisible,
    }: {
      locationId: string;
      isVisible: boolean;
    }) => {
      const { error } = await supabase
        .from("location_reviews")
        .update({ is_visible: isVisible } as any)
        .eq("location_id", locationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", companyId] });
      toast.success("Review visibility updated.");
    },
    onError: () => toast.error("Unable to update visibility."),
  });

  const softDeleteMutation = useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from("location_reviews")
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq("location_id", locationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", companyId] });
      toast.success("Review deleted.");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Unable to delete review."),
  });

  const restoreMutation = useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from("location_reviews")
        .update({ deleted_at: null, is_visible: true } as any)
        .eq("location_id", locationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", companyId] });
      toast.success("Review restored.");
    },
    onError: () => toast.error("Unable to restore review."),
  });

  const filters: { value: ReviewFilter; label: string }[] = [
    { value: "all", label: "Active" },
    { value: "positive", label: "Positive" },
    { value: "negative", label: "Negative" },
    { value: "hidden", label: "Hidden" },
    { value: "deleted", label: "Deleted" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Reviews" value={stats.total} />
        <StatCard
          label="Avg Rating"
          value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}
        />
        <StatCard label="Hidden" value={stats.hidden} />
        <StatCard label="Deleted" value={stats.deleted} />
      </div>

      {/* Filters + search */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, text, project..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-600">
          No reviews match your filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <ReviewCard
              key={review.locationId}
              review={review}
              onToggleVisibility={() =>
                toggleVisibilityMutation.mutate({
                  locationId: review.locationId,
                  isVisible: !review.isVisible,
                })
              }
              onDelete={() => setDeleteTarget(review.locationId)}
              onRestore={() => restoreMutation.mutate(review.locationId)}
              onRequestNew={() => onRequestReview(review.locationId)}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>
              The review will be soft-deleted and hidden from the public map.
              You can restore it later or request a new review from the
              customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={softDeleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={softDeleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) softDeleteMutation.mutate(deleteTarget);
              }}
            >
              {softDeleteMutation.isPending ? "Deleting..." : "Delete review"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ReviewCard({
  review,
  onToggleVisibility,
  onDelete,
  onRestore,
  onRequestNew,
}: {
  review: ReviewItem;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onRequestNew: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isDeleted = Boolean(review.deletedAt);
  const textTruncated = (review.reviewText ?? "").length > 120 && !expanded;

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        isDeleted
          ? "border-red-200 bg-red-50/30"
          : !review.isVisible
            ? "border-amber-200 bg-amber-50/30"
            : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {typeof review.stars === "number" && (
              <StarRow stars={review.stars} />
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                review.source === "customer_link"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {review.source === "customer_link" ? "Customer" : "Owner"}
            </span>
            {isDeleted && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                Deleted
              </span>
            )}
            {!isDeleted && !review.isVisible && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                Hidden
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm font-medium text-slate-900">
            {review.customerName || "Anonymous"}
          </p>
          {review.reviewText && (
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              {textTruncated
                ? `${review.reviewText.slice(0, 120)}...`
                : review.reviewText}
              {(review.reviewText ?? "").length > 120 && (
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="ml-1 text-xs font-medium text-primary hover:underline"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {review.neighborhood}
            </span>
            <span>{review.projectName}</span>
            <span>{formatDate(review.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {isDeleted ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-emerald-600"
                onClick={onRestore}
                title="Restore review"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-primary"
                onClick={onRequestNew}
                title="Request new review"
              >
                <QrCode className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-slate-900"
                onClick={onToggleVisibility}
                title={review.isVisible ? "Hide review" : "Show review"}
              >
                {review.isVisible ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-red-600"
                onClick={onDelete}
                title="Delete review"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
