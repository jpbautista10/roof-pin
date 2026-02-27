import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useData } from "@/data/DataContext";
import { ImagePlus, X, Loader2, CheckCircle2, XCircle, Minus } from "lucide-react";

const TAKEN_SLUGS = ["test", "taken-slug", "joes-roofing"];

type SlugStatus = "idle" | "checking" | "available" | "taken" | "current";

export default function DashboardSettings() {
  const { tenant, updateTenant } = useData();

  const [companyName, setCompanyName] = useState(tenant.company_name);
  const [slug, setSlug] = useState(tenant.slug);
  const [ctaLink, setCtaLink] = useState(tenant.cta_link);
  const [brandColor, setBrandColor] = useState(tenant.brand_color);
  const [logoPreview, setLogoPreview] = useState<string | null>(tenant.logo_url || null);

  // Slug validation
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("current");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep form in sync if tenant changes from outside
  useEffect(() => {
    setCompanyName(tenant.company_name);
    setSlug(tenant.slug);
    setCtaLink(tenant.cta_link);
    setBrandColor(tenant.brand_color);
    setLogoPreview(tenant.logo_url || null);
  }, [tenant]);

  function formatSlug(raw: string): string {
    return raw
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  function handleSlugChange(raw: string) {
    const formatted = formatSlug(raw);
    setSlug(formatted);

    // Clear any pending debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!formatted) {
      setSlugStatus("idle");
      return;
    }

    if (formatted === tenant.slug) {
      setSlugStatus("current");
      return;
    }

    setSlugStatus("checking");
    debounceRef.current = setTimeout(() => {
      if (TAKEN_SLUGS.includes(formatted)) {
        setSlugStatus("taken");
      } else {
        setSlugStatus("available");
      }
    }, 500);
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const isSaveDisabled = slugStatus === "taken" || slugStatus === "checking" || !slug;

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaveDisabled) return;

    updateTenant({
      company_name: companyName,
      slug,
      cta_link: ctaLink,
      brand_color: brandColor,
      logo_url: logoPreview || "",
    });
    // After saving, the current slug is now the saved one
    setSlugStatus(slug === tenant.slug ? "current" : "current");
    toast.success("Settings saved successfully!", {
      description: "Your changes are now live on the public map.",
    });
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize your public map widget and brand.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Company Info
            </h2>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            {/* Slug with live validation */}
            <div className="space-y-2">
              <Label htmlFor="slug">Map URL Slug</Label>
              <div className="flex items-center gap-0">
                <span className="inline-flex items-center h-10 px-3 rounded-l-md border border-r-0 border-input bg-slate-50 text-sm text-slate-500 whitespace-nowrap">
                  https://
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className={`rounded-l-none rounded-r-none border-r-0 ${
                    slugStatus === "taken"
                      ? "border-red-300 focus-visible:ring-red-400"
                      : slugStatus === "available"
                        ? "border-emerald-300 focus-visible:ring-emerald-400"
                        : ""
                  }`}
                />
                <span className="inline-flex items-center h-10 px-3 rounded-r-md border border-l-0 border-input bg-slate-50 text-sm text-slate-500 whitespace-nowrap">
                  .neighborhoodproof.com
                </span>
              </div>

              {/* Slug status feedback */}
              <div className="h-5 flex items-center">
                {slugStatus === "checking" && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Checking availability...
                  </span>
                )}
                {slugStatus === "taken" && (
                  <span className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    This slug is already taken
                  </span>
                )}
                {slugStatus === "available" && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Slug is available
                  </span>
                )}
                {slugStatus === "current" && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Minus className="w-3.5 h-3.5" />
                    Current active slug
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaLink">CTA Link</Label>
              <Input
                id="ctaLink"
                placeholder="https://yoursite.com/contact"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
              />
              <p className="text-xs text-slate-400">
                Where the "Get a Quote" button takes visitors.
              </p>
            </div>
          </div>

          {/* Brand */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Brand
            </h2>
            <div className="space-y-2">
              <Label>Brand Color</Label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                </div>
                <Input
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-32 font-mono text-sm"
                  maxLength={7}
                />
                <div
                  className="h-10 flex-1 rounded-lg border border-slate-200"
                  style={{ backgroundColor: brandColor }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company Logo</Label>
              {logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-20 w-auto rounded-lg border border-slate-200 bg-white p-2 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setLogoPreview(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 w-fit px-4 py-3 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors">
                  <ImagePlus className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-500">Upload logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold"
            disabled={isSaveDisabled}
          >
            Save Settings
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
