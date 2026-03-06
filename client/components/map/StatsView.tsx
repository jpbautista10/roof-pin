import { useMemo } from "react";
import {
  CircleCheck,
  Hammer,
  MapPin,
  Star,
  StarHalf,
  TrendingUp,
} from "lucide-react";
import { PublicLocation } from "@/types/public-map";

interface StatsViewProps {
  locations: PublicLocation[];
}

function formatWorkType(value: string | null) {
  if (!value) return "Unspecified";
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={`f-${i}`}
          className="h-4 w-4 fill-amber-400 text-amber-400"
        />
      ))}
      {hasHalf && (
        <StarHalf className="h-4 w-4 fill-amber-400 text-amber-400" />
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className="h-4 w-4 text-slate-200" />
      ))}
    </div>
  );
}

export default function StatsView({ locations }: StatsViewProps) {
  const stats = useMemo(() => {
    const total = locations.length;

    // Work type breakdown
    const workTypeMap: Record<string, number> = {};
    for (const loc of locations) {
      const type = loc.work_type?.trim();
      if (type) {
        workTypeMap[type] = (workTypeMap[type] ?? 0) + 1;
      }
    }
    const workTypes = Object.entries(workTypeMap)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({ type, count }));

    // Ratings
    const ratingValues = locations.flatMap((loc) =>
      loc.privacy_mode
        ? []
        : loc.reviews
            .map((r) => r.stars)
            .filter((s): s is number => typeof s === "number"),
    );
    const avgRating =
      ratingValues.length > 0
        ? ratingValues.reduce((s, v) => s + v, 0) / ratingValues.length
        : null;
    const totalReviews = ratingValues.length;

    // Rating distribution (1-5)
    const ratingDist = [0, 0, 0, 0, 0];
    for (const r of ratingValues) {
      const bucket = Math.min(Math.max(Math.round(r), 1), 5);
      ratingDist[bucket - 1]++;
    }

    // Neighborhoods
    const neighborhoodSet = new Set<string>();
    for (const loc of locations) {
      const n = loc.neighborhood?.trim();
      if (n) neighborhoodSet.add(n);
    }

    return {
      total,
      workTypes,
      avgRating,
      totalReviews,
      ratingDist,
      neighborhoodCount: neighborhoodSet.size,
    };
  }, [locations]);

  if (locations.length === 0) {
    return (
      <div className="min-h-full bg-slate-50/80">
      <div className="mx-auto max-w-2xl px-4 pt-6 pb-8">
          <div className="rounded-xl border border-white/30 bg-white/60 p-10 text-center shadow-sm backdrop-blur-lg">
            <MapPin className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">
              No locations yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              This company has not published projects.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const maxWorkTypeCount =
    stats.workTypes.length > 0 ? stats.workTypes[0].count : 1;

  return (
    <div className="min-h-full bg-slate-50/80">
      <div className="mx-auto max-w-lg px-4 pt-5 pb-8 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            icon={<CircleCheck className="h-5 w-5 text-blue-600" />}
            value={stats.total}
            label="Total Projects"
          />
          <SummaryCard
            icon={<MapPin className="h-5 w-5 text-emerald-600" />}
            value={stats.neighborhoodCount}
            label="Neighborhoods"
          />
          <SummaryCard
            icon={<Hammer className="h-5 w-5 text-violet-600" />}
            value={stats.workTypes.length}
            label="Work Types"
          />
          <SummaryCard
            icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
            value={stats.totalReviews}
            label="Total Reviews"
          />
        </div>

        {/* Rating overview */}
        {stats.avgRating !== null && (
          <div className="rounded-xl border border-white/30 bg-white/60 p-5 shadow-sm backdrop-blur-lg">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Customer Rating
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-slate-900">
                  {stats.avgRating.toFixed(1)}
                </p>
                <RatingStars rating={stats.avgRating} />
                <p className="mt-1 text-[11px] text-slate-500">
                  {stats.totalReviews} review
                  {stats.totalReviews === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.ratingDist[star - 1];
                  const pct =
                    stats.totalReviews > 0
                      ? (count / stats.totalReviews) * 100
                      : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="w-3 text-right text-[11px] font-medium text-slate-500">
                        {star}
                      </span>
                      <Star className="h-3 w-3 text-amber-400" />
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-[11px] text-slate-400">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Work type breakdown */}
        {stats.workTypes.length > 0 && (
          <div className="rounded-xl border border-white/30 bg-white/60 p-5 shadow-sm backdrop-blur-lg">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Work Type Breakdown
            </h3>
            <div className="space-y-3">
              {stats.workTypes.map(({ type, count }) => {
                const pct = (count / maxWorkTypeCount) * 100;
                return (
                  <div key={type}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        {formatWorkType(type)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {count} project{count === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-white/30 bg-white/60 p-4 shadow-sm backdrop-blur-lg">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/50">
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}
