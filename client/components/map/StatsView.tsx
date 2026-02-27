import { Card } from "@/components/ui/card";
import { MapPin, Star } from "lucide-react";
import { PublicLocation } from "@/types/public-map";

interface StatsViewProps {
  locations: PublicLocation[];
  onSelectLocation: (location: PublicLocation) => void;
}

export default function StatsView({
  locations,
  onSelectLocation,
}: StatsViewProps) {
  const sortedLocations = [...locations].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  if (sortedLocations.length === 0) {
    return (
      <div className="absolute inset-0 bg-slate-50 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Card className="border-slate-200 p-10 text-center">
            <MapPin className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">
              No locations yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              This company has not published projects.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-slate-50 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-3">
        {sortedLocations.map((location) => {
          const firstReview = location.reviews[0] ?? null;
          const hasReview =
            !location.privacy_mode && Boolean(firstReview?.review_text);

          return (
            <button
              key={location.id}
              type="button"
              className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50"
              onClick={() => onSelectLocation(location)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {location.project_name}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {location.place_label}
                  </p>
                </div>
                {!location.privacy_mode &&
                typeof firstReview?.stars === "number" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {firstReview.stars}
                  </span>
                ) : location.privacy_mode ? (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    Private
                  </span>
                ) : null}
              </div>

              {hasReview ? (
                <p className="mt-2 line-clamp-2 text-xs italic text-slate-600">
                  "{firstReview?.review_text}"
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
