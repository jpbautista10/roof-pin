import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  MapPin,
  Pencil,
  PlusCircle,
  QrCode,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthProvider";
import { deleteLocation, fetchLocationsByCompany } from "@/lib/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrGetReviewToken } from "@/lib/review-requests";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QRCode from "qrcode";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

type ListFilter = "all" | "public" | "private" | "needs_review";

function normalizeFilter(value: string | null): ListFilter {
  if (value === "public" || value === "private" || value === "needs_review") {
    return value;
  }
  return "all";
}

function getNeighborhood(addressJson: unknown, fallback: string) {
  if (addressJson && typeof addressJson === "object") {
    const value = (addressJson as Record<string, unknown>).neighborhood;
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

export default function Dashboard() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [reviewLinkLocationId, setReviewLinkLocationId] = useState<
    string | null
  >(null);
  const [reviewLink, setReviewLink] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

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
  const query = searchParams.get("q") ?? "";
  const filter = normalizeFilter(searchParams.get("filter"));

  const filteredLocations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return locations.filter((location) => {
      const neighborhood = getNeighborhood(
        location.address_json,
        location.place_label,
      );

      if (filter === "public" && location.privacy_mode) return false;
      if (filter === "private" && !location.privacy_mode) return false;
      if (filter === "needs_review" && location.review) return false;

      if (!normalizedQuery) return true;

      return (
        location.project_name.toLowerCase().includes(normalizedQuery) ||
        neighborhood.toLowerCase().includes(normalizedQuery) ||
        (location.work_type ?? "").toLowerCase().includes(normalizedQuery) ||
        (location.date_completed ?? "").toLowerCase().includes(normalizedQuery)
      );
    });
  }, [locations, query, filter]);

  function updateListParams(next: { q?: string; filter?: ListFilter }) {
    const params = new URLSearchParams(searchParams);

    if (next.q !== undefined) {
      if (next.q.trim()) params.set("q", next.q);
      else params.delete("q");
    }

    if (next.filter !== undefined) {
      if (next.filter === "all") params.delete("filter");
      else params.set("filter", next.filter);
    }

    setSearchParams(params, { replace: true });
  }

  const deleteMutation = useMutation({
    mutationFn: async (locationId: string) => deleteLocation(locationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["locations", company.id],
      });
      toast.success("Location deleted.");
      setDeleteTargetId(null);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete location.",
      );
    },
  });

  const reviewLinkMutation = useMutation({
    mutationFn: async (locationId: string) => {
      const token = await createOrGetReviewToken(locationId);
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const link = `${baseUrl}/review/${token}`;
      const qr = await QRCode.toDataURL(link, { margin: 1, width: 280 });
      return { link, qr };
    },
    onSuccess: ({ link, qr }) => {
      setReviewLink(link);
      setQrDataUrl(qr);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to generate review link.",
      );
    },
  });

  function openReviewRequest(locationId: string) {
    setReviewLinkLocationId(locationId);
    setReviewLink("");
    setQrDataUrl("");
    reviewLinkMutation.mutate(locationId);
  }

  async function handleCopyReviewLink() {
    try {
      await navigator.clipboard.writeText(reviewLink);
      toast.success("Review link copied.");
    } catch {
      toast.error("Unable to copy review link.");
    }
  }

  return (
    <section className="space-y-6">
      <header className="pt-5 sm:p-6 lg:hidden">
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
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Input
                value={query}
                onChange={(event) =>
                  updateListParams({ q: event.target.value })
                }
                placeholder="Search project, location, work type..."
                className="sm:max-w-md"
              />
              <Select
                value={filter}
                onValueChange={(value) =>
                  updateListParams({ filter: value as ListFilter })
                }
              >
                <SelectTrigger className="h-9 w-full sm:w-[170px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="needs_review">Needs Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-600">
              No locations match your current search or filter.
            </div>
          ) : (
            <>
              <div className="space-y-3 sm:hidden">
                {filteredLocations.map((location) => {
                  const neighborhood = getNeighborhood(
                    location.address_json,
                    location.place_label,
                  );

                  return (
                    <article
                      key={location.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <h3 className="truncate text-sm font-semibold text-slate-900">
                            {neighborhood}
                          </h3>
                          <p className="truncate text-sm text-slate-600">
                            {location.project_name}
                          </p>
                        </div>
                        {location.privacy_mode ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                            <EyeOff className="h-3 w-3" />
                            Private
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            <Eye className="h-3 w-3" />
                            Public
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                          {location.work_type ?? "Unknown"}
                        </span>
                        <span>
                          {location.date_completed ||
                            formatDate(location.created_at)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-2">
                        {!location.review ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            onClick={() => openReviewRequest(location.id)}
                            title="Get review QR"
                            aria-label="Get review QR"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          asChild
                        >
                          <Link
                            to={`/dashboard/${company.slug}/locations/${location.id}/edit`}
                            title="Edit location"
                            aria-label="Edit location"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                          onClick={() => setDeleteTargetId(location.id)}
                          title="Delete location"
                          aria-label="Delete location"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:block">
                <div className="overflow-x-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50/60">
                        <th className="h-12 w-[180px] px-4 text-left align-middle text-xs font-medium text-slate-500">
                          Neighborhood
                        </th>
                        <th className="h-12 px-4 text-left align-middle text-xs font-medium text-slate-500">
                          Work Type
                        </th>
                        <th className="h-12 px-4 text-left align-middle text-xs font-medium text-slate-500">
                          Project
                        </th>
                        <th className="hidden h-12 px-4 text-left align-middle text-xs font-medium text-slate-500 md:table-cell">
                          Completed
                        </th>
                        <th className="h-12 px-4 text-center align-middle text-xs font-medium text-slate-500">
                          Status
                        </th>
                        <th className="h-12 px-4 text-right align-middle text-xs font-medium text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLocations.map((location) => {
                        const neighborhood = getNeighborhood(
                          location.address_json,
                          location.place_label,
                        );

                        return (
                          <tr
                            key={location.id}
                            className="border-b transition-colors hover:bg-slate-50"
                          >
                            <td className="p-4 align-middle text-sm font-medium text-slate-900">
                              {neighborhood}
                            </td>
                            <td className="p-4 align-middle">
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                {location.work_type ?? "Unknown"}
                              </span>
                            </td>
                            <td className="p-4 align-middle text-sm text-slate-600">
                              {location.project_name}
                            </td>
                            <td className="hidden p-4 align-middle text-sm text-slate-500 md:table-cell">
                              {location.date_completed ||
                                formatDate(location.created_at)}
                            </td>
                            <td className="p-4 text-center align-middle">
                              {location.privacy_mode ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                  <EyeOff className="h-3 w-3" />
                                  Private
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                  <Eye className="h-3 w-3" />
                                  Public
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right align-middle">
                              <div className="flex items-center justify-end gap-1">
                                {!location.review ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                    onClick={() =>
                                      openReviewRequest(location.id)
                                    }
                                    title="Get review QR"
                                    aria-label="Get review QR"
                                  >
                                    <QrCode className="h-3.5 w-3.5" />
                                  </Button>
                                ) : null}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                  asChild
                                >
                                  <Link
                                    to={`/dashboard/${company.slug}/locations/${location.id}/edit`}
                                    title="Edit location"
                                    aria-label="Edit location"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                                  onClick={() => setDeleteTargetId(location.id)}
                                  title="Delete location"
                                  aria-label="Delete location"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <AlertDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete location?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the location, review, and image
              references.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (deleteTargetId) {
                  deleteMutation.mutate(deleteTargetId);
                }
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(reviewLinkLocationId)}
        onOpenChange={(open) => {
          if (!open) {
            setReviewLinkLocationId(null);
            setReviewLink("");
            setQrDataUrl("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer review request</DialogTitle>
            <DialogDescription>
              Send this link to your customer so they can submit their own
              review.
            </DialogDescription>
          </DialogHeader>

          {reviewLinkMutation.isPending ? (
            <p className="text-sm text-slate-600">Generating review link...</p>
          ) : (
            <div className="space-y-3">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Review request QR code"
                  className="mx-auto h-48 w-48 rounded-lg border border-slate-200 p-2"
                />
              ) : null}
              {reviewLink ? (
                <>
                  <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 break-all">
                    {reviewLink}
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => void handleCopyReviewLink()}
                  >
                    Copy link
                  </Button>
                </>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
