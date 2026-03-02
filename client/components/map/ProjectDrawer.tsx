import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Calendar, Hammer, ImageOff, Lock, MapPin, Star } from "lucide-react";
import { getContrastTextColor, getValidBrandColor } from "@/lib/color";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { PublicCompany, PublicLocation } from "@/types/public-map";

interface ProjectDrawerProps {
  location: PublicLocation | null;
  company: PublicCompany;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatProjectDate(dateCompleted: string | null, createdAt: string) {
  if (dateCompleted) {
    const parsedDate = new Date(`${dateCompleted} 1`);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      });
    }
  }

  const fallbackDate = new Date(createdAt);
  if (!Number.isNaN(fallbackDate.getTime())) {
    return fallbackDate.toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  }

  return "Date unavailable";
}

function StarRow({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`h-4 w-4 ${value <= stars ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
        />
      ))}
    </div>
  );
}

function PrivateProjectPreview() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <div className="absolute inset-0 grid grid-cols-2">
        <div className="bg-gradient-to-br from-slate-200 to-slate-100" />
        <div className="bg-gradient-to-br from-slate-50 to-slate-200" />
      </div>

      <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white/80" />

      <div className="absolute left-3 top-3 rounded-md bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
        Before
      </div>
      <div className="absolute right-3 top-3 rounded-md bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
        After
      </div>

      <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-500 shadow-lg">
        <Lock className="h-5 w-5" />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/35 to-transparent px-4 pb-4 pt-10">
        <p className="text-center text-xs font-medium text-white/95">
          Photos are hidden for this private project
        </p>
      </div>
    </div>
  );
}

function anonymizeName(customerName: string | null) {
  if (!customerName) {
    return "Private customer";
  }

  const nameParts = customerName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0];
  if (!firstName) {
    return "Private customer";
  }

  const lastInitial = nameParts[1]?.charAt(0);

  return lastInitial ? `${firstName} ${lastInitial}.` : firstName;
}

export default function ProjectDrawer({
  location,
  company,
  open,
  onOpenChange,
}: ProjectDrawerProps) {
  if (!location) {
    return null;
  }

  const beforeImage = location.images.find((image) => image.kind === "before");
  const afterImage = location.images.find((image) => image.kind === "after");
  const ctaUrl = company.cta_url;
  const reviews = location.privacy_mode
    ? location.reviews.map((review) => ({
        ...review,
        customer_name: anonymizeName(review.customer_name),
      }))
    : location.reviews;
  const brandColor = getValidBrandColor(company.brand_primary_color);
  const brandTextColor = getContrastTextColor(brandColor);
  const projectDate = formatProjectDate(
    location.date_completed,
    location.created_at,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto">
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetDescription
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: brandColor }}
            >
              {company.name}
            </SheetDescription>
            <SheetTitle className="text-xl font-bold text-slate-900">
              {location.privacy_mode
                ? `Project in ${location.neighborhood || location.place_label}`
                : location.project_name}
            </SheetTitle>
          </SheetHeader>

          {location.privacy_mode && (
            <div className="px-6 pb-5">
              <div className="rounded-xl bg-slate-50 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${brandColor}1A` }}
                  >
                    <Hammer className="w-4 h-4" style={{ color: brandColor }} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Work Type</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {location.work_type || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${brandColor}1A` }}
                  >
                    <Calendar
                      className="w-4 h-4"
                      style={{ color: brandColor }}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Completed</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {projectDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${brandColor}1A` }}
                  >
                    <MapPin className="w-4 h-4" style={{ color: brandColor }} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Neighborhood</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {location.neighborhood || location.place_label}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!location.privacy_mode && (
            <div className="px-6 pb-5">
              {beforeImage?.public_url && afterImage?.public_url ? (
                <BeforeAfterSlider
                  beforeImg={beforeImage.public_url}
                  afterImg={afterImage.public_url}
                />
              ) : (
                <div className="bg-slate-100 rounded-xl aspect-[4/3] flex flex-col items-center justify-center gap-2">
                  <ImageOff className="w-8 h-8 text-slate-300" />
                  <p className="text-sm text-slate-400 font-medium">
                    Images not available
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="px-6 pb-4 flex gap-2 flex-wrap">
            {!location.privacy_mode ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                  <MapPin className="w-3 h-3" />
                  {location.neighborhood || location.place_label}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                  <Calendar className="w-3 h-3" />
                  {projectDate}
                </span>
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center w-full">
                This project location has been anonymized for privacy.
              </p>
            )}
          </div>

          {reviews.length > 0 ? (
            location.privacy_mode ? (
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {typeof reviews[0]?.stars === "number" ? (
                    <StarRow stars={reviews[0].stars} />
                  ) : null}
                  {reviews[0]?.review_text ? (
                    <blockquote className="text-[15px] leading-relaxed italic text-slate-700">
                      "{reviews[0].review_text}"
                    </blockquote>
                  ) : null}
                  <p className="text-sm font-medium text-slate-500">
                    - {reviews[0]?.customer_name || "Private customer"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="px-6 pb-6 space-y-4">
                {reviews.map((review, index) => (
                  <div
                    key={`${review.customer_name ?? "review"}-${index}`}
                    className="rounded-lg bg-slate-50 p-3"
                  >
                    {typeof review.stars === "number" ? (
                      <div className="mb-2">
                        <StarRow stars={review.stars} />
                      </div>
                    ) : null}
                    {review.review_text ? (
                      <blockquote className="text-sm text-slate-700 leading-relaxed italic">
                        "{review.review_text}"
                      </blockquote>
                    ) : null}
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      - {review.customer_name || "Customer"}
                    </p>
                  </div>
                ))}
              </div>
            )
          ) : null}
        </div>

        {ctaUrl ? (
          <div className="border-t border-slate-200 p-6">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-lg py-3 text-sm font-semibold"
              style={{ backgroundColor: brandColor, color: brandTextColor }}
            >
              Get a quote
            </a>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
