import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { Pin, Tenant } from "@/types";
import { MapPin, Calendar, Hammer, ImageOff } from "lucide-react";

interface ProjectDrawerProps {
  pin: Pin | null;
  tenant: Tenant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function StarIcon() {
  return (
    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function EmptyStarIcon() {
  return (
    <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function ProjectDrawer({ pin, tenant, open, onOpenChange }: ProjectDrawerProps) {
  if (!pin) return null;

  const isPrivacy = pin.privacy_mode;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetDescription className="text-xs font-semibold uppercase tracking-wider text-primary">
              {tenant.company_name}
            </SheetDescription>
            <SheetTitle className="text-xl font-bold text-slate-900">
              Project in {pin.neighborhood}
            </SheetTitle>
          </SheetHeader>

          {isPrivacy ? (
            /* ── Privacy Mode: minimal info only ── */
            <div className="px-6 pb-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Hammer className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Work Type</p>
                    <p className="text-sm font-semibold text-slate-900">{pin.work_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Completed</p>
                    <p className="text-sm font-semibold text-slate-900">{pin.date_completed}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Neighborhood</p>
                    <p className="text-sm font-semibold text-slate-900">{pin.neighborhood}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center">
                This project location has been anonymized for privacy.
              </p>
            </div>
          ) : (
            /* ── Full Mode: images, review, social proof ── */
            <>
              {/* Before/After Slider or Placeholder */}
              <div className="px-6 pb-6">
                {pin.before_img_url && pin.after_img_url ? (
                  <BeforeAfterSlider
                    beforeImg={pin.before_img_url}
                    afterImg={pin.after_img_url}
                  />
                ) : (
                  <div className="bg-slate-100 rounded-xl aspect-[4/3] flex flex-col items-center justify-center gap-2">
                    <ImageOff className="w-8 h-8 text-slate-300" />
                    <p className="text-sm text-slate-400 font-medium">Images coming soon</p>
                  </div>
                )}
              </div>

              {/* Project details badges */}
              <div className="px-6 pb-4 flex gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                  <Hammer className="w-3 h-3" />
                  {pin.work_type}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                  <Calendar className="w-3 h-3" />
                  {pin.date_completed}
                </span>
              </div>

              {/* Review / Social Proof */}
              <div className="px-6 pb-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    i < pin.stars ? <StarIcon key={i} /> : <EmptyStarIcon key={i} />
                  ))}
                </div>
                <blockquote className="text-sm text-slate-700 leading-relaxed italic">
                  "{pin.review_text}"
                </blockquote>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  — {pin.customer_name}
                </p>
              </div>
            </>
          )}
        </div>

        {/* CTA Footer */}
        <div className="border-t border-slate-200 p-6">
          <a
            href={tenant.cta_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full rounded-lg py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 shadow-lg"
            style={{
              backgroundColor: tenant.brand_color,
              boxShadow: `0 8px 20px ${tenant.brand_color}33`,
            }}
          >
            {isPrivacy
              ? "Get a Free Quote"
              : `Get a Quote like ${pin.customer_name}`}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
