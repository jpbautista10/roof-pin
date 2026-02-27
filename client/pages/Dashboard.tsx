import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, PlusCircle, Star } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { fetchLocationsByCompany } from "@/lib/locations";
import { Button } from "@/components/ui/button";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function Dashboard() {
  const { company } = useAuth();

  const locationsQuery = useQuery({
    queryKey: ["locations", company?.id],
    enabled: Boolean(company?.id),
    queryFn: async () => fetchLocationsByCompany(company!.id),
  });

  if (!company?.slug) {
    return null;
  }

  const createLink = `/dashboard/${company.slug}/locations/new`;
  const locations = locationsQuery.data ?? [];

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Dashboard</p>
            <h1 className="text-2xl font-bold text-slate-900">
              {company.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your project locations and public proof map pins.
            </p>
          </div>
          <Button asChild>
            <Link to={createLink}>
              <PlusCircle className="h-4 w-4" />
              Create location
            </Link>
          </Button>
        </div>
      </header>

      {locationsQuery.isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
          Loading locations...
        </div>
      ) : locations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <MapPin className="h-5 w-5 text-slate-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            No locations yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
            Add your first location to start showing real work on your public
            map.
          </p>
          <Button asChild className="mt-6">
            <Link to={createLink}>Create your first location</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {locations.map((location) => {
            const before = location.images.find(
              (image) => image.kind === "before",
            );
            const after = location.images.find(
              (image) => image.kind === "after",
            );

            return (
              <article
                key={location.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid grid-cols-2 gap-1 bg-slate-100">
                  <div className="aspect-video bg-slate-200">
                    {before ? (
                      <img
                        src={before.public_url}
                        alt={`${location.project_name} before`}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="aspect-video bg-slate-200">
                    {after ? (
                      <img
                        src={after.public_url}
                        alt={`${location.project_name} after`}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="text-base font-semibold text-slate-900">
                    {location.project_name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {location.place_label}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Added {formatDate(location.created_at)}</span>
                    {location.review?.stars ? (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {location.review.stars}/5
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
