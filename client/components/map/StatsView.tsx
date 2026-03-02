import { CircleCheck, Hammer, MapPin, Star } from "lucide-react";
import { PublicLocation } from "@/types/public-map";

interface StatsViewProps {
  locations: PublicLocation[];
  onSelectLocation: (location: PublicLocation) => void;
}

export default function StatsView({
  locations,
  onSelectLocation,
}: StatsViewProps) {
  const formatMonthYear = (value: string | null) => {
    if (!value) {
      return "Unknown";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatWorkType = (value: string | null) => {
    if (!value) {
      return "Unspecified";
    }

    return value
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const sortedLocations = [...locations].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const totalProjects = sortedLocations.length;

  const workTypeCounts = sortedLocations.reduce<Record<string, number>>(
    (acc, location) => {
      if (!location.work_type) {
        return acc;
      }

      acc[location.work_type] = (acc[location.work_type] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const topWorkTypeRaw = Object.entries(workTypeCounts).sort(
    ([typeA, countA], [typeB, countB]) =>
      countB - countA || typeA.localeCompare(typeB),
  )[0]?.[0];

  const topWorkType = formatWorkType(topWorkTypeRaw ?? null);

  const ratingValues = sortedLocations.flatMap((location) => {
    if (location.privacy_mode) {
      return [];
    }

    return location.reviews
      .map((review) => review.stars)
      .filter((stars): stars is number => typeof stars === "number");
  });

  const avgRating =
    ratingValues.length > 0
      ? (
          ratingValues.reduce((sum, stars) => sum + stars, 0) /
          ratingValues.length
        ).toFixed(1)
      : "N/A";

  if (sortedLocations.length === 0) {
    return (
      <div className="absolute inset-0 bg-slate-50 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 pt-6 pb-8">
          <div className="rounded-lg border border-slate-200/80 bg-card p-10 text-center text-card-foreground shadow-sm">
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

  return (
    <div className="absolute inset-0 bg-slate-50 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 pt-6 pb-8 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200/80 bg-card text-card-foreground shadow-sm">
            <div className="p-4 text-center">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10">
                <CircleCheck className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {totalProjects}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Total Projects
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200/80 bg-card text-card-foreground shadow-sm">
            <div className="p-4 text-center">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10">
                <Hammer className="h-4 w-4 text-blue-600" />
              </div>
              <p className="truncate text-2xl font-bold text-slate-900">
                {topWorkType}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">Top Work Type</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200/80 bg-card text-card-foreground shadow-sm">
            <div className="p-4 text-center">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10">
                <Star className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{avgRating}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Avg. Rating</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-card text-card-foreground shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Completed Projects
            </h3>
          </div>

          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b bg-slate-50/50 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                    Neighborhood
                  </th>
                  <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                    Work Type
                  </th>
                  <th className="h-12 px-4 text-right align-middle text-xs font-medium text-muted-foreground">
                    Completed
                  </th>
                </tr>
              </thead>

              <tbody className="[&_tr:last-child]:border-0">
                {sortedLocations.map((location) => (
                  <tr
                    key={location.id}
                    className="cursor-pointer border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    onClick={() => onSelectLocation(location)}
                  >
                    <td className="p-4 align-middle text-sm font-medium text-slate-900">
                      {location.neighborhood ||
                        location.place_label ||
                        "Unknown"}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {formatWorkType(location.work_type)}
                      </span>
                    </td>
                    <td className="p-4 text-right align-middle text-sm text-slate-500">
                      {formatMonthYear(
                        location.date_completed ?? location.created_at,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
