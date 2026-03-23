import { getContrastTextColor, getValidBrandColor } from "@/lib/color";
import type { PublicCompany, PublicLocation } from "@/types/public-map";
import { format, parse } from 'date-fns';
import { Calendar, Hammer, ImageOff, MapPin, Star, X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import BeforeAfterSlider from "./BeforeAfterSlider";

interface ProjectPopupProps {
  location: PublicLocation | null;
  company: PublicCompany;
  open: boolean;
  onClose: () => void;
  /** Screen-space position of the pin (for desktop popup placement) */
  anchorPoint?: { x: number; y: number } | null;
}

const MONTH_NAMES: Record<string, string> = {
  january: "Jan", february: "Feb", march: "Mar", april: "Apr",
  may: "May", june: "Jun", july: "Jul", august: "Aug",
  september: "Sep", october: "Oct", november: "Nov", december: "Dec",
};

function formatProjectDate(dateCompleted: string | null, createdAt: string) {
  if (dateCompleted) {
    const parsed = parse(dateCompleted, "MMMM yyyy", new Date());
    return format(parsed, "MMM yyyy");
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

function anonymizeName(customerName: string | null) {
  if (!customerName) return "Private customer";
  const nameParts = customerName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0];
  if (!firstName) return "Private customer";
  const lastInitial = nameParts[1]?.charAt(0);
  return lastInitial ? `${firstName} ${lastInitial}.` : firstName;
}

function PopupContent({
  location,
  company,
  onClose,
}: {
  location: PublicLocation;
  company: PublicCompany;
  onClose: () => void;
}) {
  const beforeImage = location.images.find((img) => img.kind === "before");
  const afterImage = location.images.find((img) => img.kind === "after");
  const ctaUrl = company.cta_url;
  const reviews = location.privacy_mode
    ? location.reviews.map((r) => ({ ...r, customer_name: anonymizeName(r.customer_name) }))
    : location.reviews;
  const brandColor = getValidBrandColor(company.brand_primary_color);
  const brandTextColor = getContrastTextColor(brandColor);
  const projectDate = formatProjectDate(location.date_completed, location.created_at);

  // Visibility settings (default true when columns haven't been added yet)
  const showDate = company.show_completed_date ?? true;
  const showWorkType = company.show_work_type ?? true;
  const showNeighborhood = company.show_neighborhood ?? true;
  const showReviews = company.show_reviews ?? true;
  const showImages = company.show_images ?? true;

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: brandColor }}>
            {company.name}
          </p>
          <h3 className="text-base font-bold text-slate-900 leading-tight mt-0.5">
            {location.privacy_mode
              ? `Project in ${location.neighborhood || location.place_label}`
              : location.project_name}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Privacy mode details */}
      {location.privacy_mode && (showWorkType || showDate || showNeighborhood) && (
        <div className="px-4 pb-3">
          <div className="rounded-lg bg-slate-50 p-3 space-y-2">
            {showWorkType && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${brandColor}1A` }}>
                  <Hammer className="w-3.5 h-3.5" style={{ color: brandColor }} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Work Type</p>
                  <p className="text-xs font-semibold text-slate-900">{location.work_type || "Not specified"}</p>
                </div>
              </div>
            )}
            {showDate && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${brandColor}1A` }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: brandColor }} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Completed</p>
                  <p className="text-xs font-semibold text-slate-900">{projectDate}</p>
                </div>
              </div>
            )}
            {showNeighborhood && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${brandColor}1A` }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: brandColor }} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Neighborhood</p>
                  <p className="text-xs font-semibold text-slate-900">{location.neighborhood || location.place_label}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Images */}
      {!location.privacy_mode && showImages && (
        <div className="px-4 pb-3">
          {beforeImage?.public_url && afterImage?.public_url ? (
            <BeforeAfterSlider beforeImg={beforeImage.public_url} afterImg={afterImage.public_url} />
          ) : (
            <div className="bg-slate-100 rounded-lg aspect-[4/3] flex flex-col items-center justify-center gap-2">
              <ImageOff className="w-7 h-7 text-slate-300" />
              <p className="text-xs text-slate-400 font-medium">Images not available</p>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {!location.privacy_mode && (
        <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
          {showNeighborhood && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
              <MapPin className="w-3 h-3" />
              {location.neighborhood || location.place_label}
            </span>
          )}
          {showDate && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
              <Calendar className="w-3 h-3" />
              {projectDate}
            </span>
          )}
          {showWorkType && location.work_type && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
              <Hammer className="w-3 h-3" />
              {location.work_type}
            </span>
          )}
        </div>
      )}

      {/* Reviews */}
      {showReviews && reviews.length > 0 && (
        <div className="px-4 pb-3 space-y-2">
          {reviews.map((review, i) => (
            <div key={`${review.customer_name ?? "r"}-${i}`} className="rounded-lg bg-slate-50 p-3">
              {typeof review.stars === "number" && (
                <div className="mb-1.5"><StarRow stars={review.stars} /></div>
              )}
              {review.review_text && (
                <blockquote className="text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;{review.review_text}&rdquo;
                </blockquote>
              )}
              <p className="mt-1.5 text-[11px] font-medium text-slate-500">
                - {review.customer_name || "Customer"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      {ctaUrl && (
        <div className="px-4 pb-4">
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold"
            style={{ backgroundColor: brandColor, color: brandTextColor }}
          >
            Get a quote
          </a>
        </div>
      )}
    </>
  );
}

/** Desktop: floating popup above pin */
function DesktopPopup({
  location,
  company,
  onClose,
  anchorPoint,
}: {
  location: PublicLocation;
  company: PublicCompany;
  onClose: () => void;
  anchorPoint: { x: number; y: number } | null;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  // Measure actual popup height after render and position accordingly
  useLayoutEffect(() => {
    if (!anchorPoint || !popupRef.current) return;

    const popupWidth = 340;
    const popupHeight = popupRef.current.offsetHeight;
    const margin = 12;
    const pinGap = 16; // gap between pin and popup

    // Horizontal: center on pin, clamp to viewport
    let left = anchorPoint.x - popupWidth / 2;
    if (left < margin) left = margin;
    if (left + popupWidth > window.innerWidth - margin) left = window.innerWidth - popupWidth - margin;

    // Vertical: prefer above the pin
    let top = anchorPoint.y - popupHeight - pinGap;

    if (top < margin) {
      // Not enough room above — try below the pin (+ ~40px for pin height)
      top = anchorPoint.y + 40;

      // If below also overflows, clamp to bottom
      if (top + popupHeight > window.innerHeight - margin) {
        top = window.innerHeight - popupHeight - margin;
      }
    }

    setPos({ left, top });
  }, [anchorPoint, location]);

  const style: React.CSSProperties = pos
    ? { left: `${pos.left}px`, top: `${pos.top}px`, visibility: "visible" as const }
    : { left: 0, top: 0, visibility: "hidden" as const };

  return (
    <div
      ref={popupRef}
      className="fixed z-[600] w-[340px] max-h-[480px] overflow-y-auto rounded-xl bg-white shadow-2xl border border-slate-200/80"
      style={style}
    >
      <PopupContent location={location} company={company} onClose={onClose} />
    </div>
  );
}

/** Mobile: same popup style as desktop, sized for smaller screens */
function MobilePopup({
  location,
  company,
  onClose,
  anchorPoint,
}: {
  location: PublicLocation;
  company: PublicCompany;
  onClose: () => void;
  anchorPoint: { x: number; y: number } | null;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!anchorPoint || !popupRef.current) return;

    const margin = 8;
    const pinGap = 12;
    const popupWidth = Math.min(300, window.innerWidth - margin * 2);
    const popupHeight = popupRef.current.offsetHeight;

    // Horizontal: center on pin, clamp to viewport
    let left = anchorPoint.x - popupWidth / 2;
    if (left < margin) left = margin;
    if (left + popupWidth > window.innerWidth - margin) left = window.innerWidth - popupWidth - margin;

    // Vertical: prefer above the pin
    let top = anchorPoint.y - popupHeight - pinGap;

    if (top < margin) {
      top = anchorPoint.y + 36;
      if (top + popupHeight > window.innerHeight - margin) {
        top = window.innerHeight - popupHeight - margin;
      }
    }

    setPos({ left, top });
  }, [anchorPoint, location]);

  const popupWidth = Math.min(300, window.innerWidth - 16);

  const style: React.CSSProperties = pos
    ? { left: `${pos.left}px`, top: `${pos.top}px`, width: `${popupWidth}px`, visibility: "visible" as const }
    : { left: 0, top: 0, width: `${popupWidth}px`, visibility: "hidden" as const };

  return (
    <div
      ref={popupRef}
      className="fixed z-[600] max-h-[70vh] overflow-y-auto rounded-xl bg-white shadow-2xl border border-slate-200/80"
      style={style}
    >
      <PopupContent location={location} company={company} onClose={onClose} />
    </div>
  );
}

export default function ProjectPopup({
  location,
  company,
  open,
  onClose,
  anchorPoint,
}: ProjectPopupProps) {
  if (!open || !location) return null;

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopPopup
          location={location}
          company={company}
          onClose={onClose}
          anchorPoint={anchorPoint ?? null}
        />
      </div>
      {/* Mobile */}
      <div className="md:hidden">
        <MobilePopup
          location={location}
          company={company}
          onClose={onClose}
          anchorPoint={anchorPoint ?? null}
        />
      </div>
    </>
  );
}
