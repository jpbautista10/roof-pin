import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  ExternalLink,
  Image,
  MapPin,
  MessageSquare,
  Palette,
  Star,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { fetchLocationsByCompany, LocationWithAssets } from "@/lib/locations";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
}

function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
          {sub && <p className="truncate text-xs text-slate-500">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function WorkTypeBreakdown({ locations }: { locations: LocationWithAssets[] }) {
  const counts: Record<string, number> = {};
  for (const loc of locations) {
    const wt = loc.work_type || "Unknown";
    counts[wt] = (counts[wt] || 0) + 1;
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return null;

  const max = sorted[0][1];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-slate-500" />
        <p className="text-sm font-semibold text-slate-900">Pins by Work Type</p>
      </div>
      <div className="space-y-2">
        {sorted.map(([type, count]) => (
          <div key={type}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-slate-700">{type}</span>
              <span className="text-sm font-semibold text-slate-900">{count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ChecklistItem {
  label: string;
  done: boolean;
  cta: string;
  to: string;
  external?: boolean;
}

function GettingStartedChecklist({
  items,
}: {
  items: ChecklistItem[];
}) {
  const allDone = items.every((i) => i.done);
  if (allDone) return null;

  const completed = items.filter((i) => i.done).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Getting Started</h3>
        <span className="text-xs text-slate-500">
          {completed}/{items.length} done
        </span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(completed / items.length) * 100}%` }}
        />
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {item.done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-slate-300" />
              )}
              <span
                className={`text-sm ${item.done ? "text-slate-400 line-through" : "text-slate-700"}`}
              >
                {item.label}
              </span>
            </div>
            {!item.done &&
              (item.external ? (
                <a
                  href={item.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  {item.cta}
                  <ExternalLink className="ml-1 inline h-3 w-3" />
                </a>
              ) : (
                <Link
                  to={item.to}
                  className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  {item.cta}
                </Link>
              ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DashboardOverview() {
  const { company } = useAuth();

  const locationsQuery = useQuery({
    queryKey: ["locations", company?.id],
    enabled: Boolean(company?.id),
    queryFn: async () => fetchLocationsByCompany(company!.id),
  });

  if (!company) return null;

  const locations = locationsQuery.data ?? [];
  const publicCount = locations.filter((l) => !l.privacy_mode).length;
  const privateCount = locations.filter((l) => l.privacy_mode).length;
  const reviewCount = locations.filter((l) => l.review).length;
  const needsReviewCount = locations.filter((l) => !l.review).length;

  const avgRating =
    reviewCount > 0
      ? (
          locations
            .filter((l) => l.review?.stars)
            .reduce((sum, l) => sum + (l.review!.stars ?? 0), 0) /
          locations.filter((l) => l.review?.stars).length
        ).toFixed(1)
      : "—";

  const basePath = `/dashboard/${company.slug}`;

  const checklistItems: ChecklistItem[] = [
    {
      label: "Add your first pin",
      done: locations.length > 0,
      cta: "Add pin",
      to: `${basePath}/locations/new`,
    },
    {
      label: "Upload your company logo",
      done: Boolean(company.logo_url),
      cta: "Settings",
      to: `${basePath}/settings`,
    },
    {
      label: "Set your brand color",
      done: company.brand_primary_color !== "#0f766e",
      cta: "Customize",
      to: `${basePath}/settings`,
    },
    {
      label: "Configure review platforms",
      done: Boolean(company.google_place_id || company.yelp_alias),
      cta: "Configure",
      to: `${basePath}/settings`,
    },
    {
      label: "Preview your public map",
      done: locations.length > 0,
      cta: "Preview",
      to: `/s/${company.slug}`,
      external: true,
    },
  ];

  return (
    <section className="space-y-6 pt-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your workspace at a glance.
        </p>
      </div>

      {locationsQuery.isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
          Loading...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Total Pins"
              value={locations.length}
              icon={<MapPin className="h-5 w-5" />}
            />
            <StatCard
              label="Public"
              value={publicCount}
              icon={<Eye className="h-5 w-5" />}
            />
            <StatCard
              label="Private"
              value={privateCount}
              icon={<EyeOff className="h-5 w-5" />}
            />
            <StatCard
              label="Avg Rating"
              value={avgRating}
              icon={<Star className="h-5 w-5" />}
              sub={`${reviewCount} review${reviewCount !== 1 ? "s" : ""}`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <WorkTypeBreakdown locations={locations} />

            <div className="space-y-4">
              <StatCard
                label="Reviews Collected"
                value={reviewCount}
                icon={<MessageSquare className="h-5 w-5" />}
              />
              <StatCard
                label="Needs Review"
                value={needsReviewCount}
                icon={<Image className="h-5 w-5" />}
                sub="Pins without a customer review"
              />
            </div>
          </div>

          <GettingStartedChecklist items={checklistItems} />
        </>
      )}
    </section>
  );
}
