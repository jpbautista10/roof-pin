import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Calendar, ImageOff, MapPin, Star } from "lucide-react";
import { getContrastTextColor, getValidBrandColor } from "@/lib/color";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { PublicCompany, PublicLocation } from "@/types/public-map";

interface ProjectDrawerProps {
  location: PublicLocation | null;
  company: PublicCompany;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  const reviews = location.privacy_mode ? [] : location.reviews;
  const brandColor = getValidBrandColor(company.brand_primary_color);
  const brandTextColor = getContrastTextColor(brandColor);

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
              {location.project_name}
            </SheetTitle>
          </SheetHeader>

          <div className="px-6 pb-5">
            {location.privacy_mode ? (
              <div className="bg-slate-100 rounded-xl aspect-[4/3] flex flex-col items-center justify-center gap-2">
                <ImageOff className="w-8 h-8 text-slate-300" />
                <p className="text-sm text-slate-500 font-medium">
                  Private project
                </p>
                <p className="text-xs text-slate-400">
                  Images and customer details are hidden.
                </p>
              </div>
            ) : beforeImage?.public_url && afterImage?.public_url ? (
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

          <div className="px-6 pb-4 flex gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
              <MapPin className="w-3 h-3" />
              {location.privacy_mode
                ? `Approx area · ${location.place_label}`
                : location.place_label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
              <Calendar className="w-3 h-3" />
              {new Date(location.created_at).toLocaleDateString()}
            </span>
          </div>

          {reviews.length > 0 ? (
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
