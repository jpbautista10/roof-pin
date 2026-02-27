import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/lib/supabase";

const DEFAULT_COLORS = {
  primary: "#0f766e",
  secondary: "#0ea5e9",
  accent: "#f59e0b",
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, dbUser, company, refreshProfile } = useAuth();

  const [companyName, setCompanyName] = useState(company?.name ?? "");
  const [slug, setSlug] = useState(company?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(
    company?.brand_primary_color ?? DEFAULT_COLORS.primary,
  );
  const [secondaryColor, setSecondaryColor] = useState(
    company?.brand_secondary_color ?? DEFAULT_COLORS.secondary,
  );
  const [accentColor, setAccentColor] = useState(
    company?.brand_accent_color ?? DEFAULT_COLORS.accent,
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(company?.logo_url ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (slugTouched) {
      return;
    }

    setSlug(
      slugify(companyName, {
        lower: true,
        strict: true,
        trim: true,
      }),
    );
  }, [companyName, slugTouched]);

  const isValid = useMemo(() => {
    return companyName.trim().length > 1 && slug.trim().length > 1;
  }, [companyName, slug]);

  async function uploadLogo(nextSlug: string) {
    if (!user || !logoFile) {
      return company?.logo_url ?? null;
    }

    const fileExt = logoFile.name.split(".").pop()?.toLowerCase() ?? "png";
    const filePath = `${user.id}/${nextSlug}-${Date.now()}.${fileExt}`;

    const uploadResult = await supabase.storage
      .from("company-logos")
      .upload(filePath, logoFile, { upsert: true });

    if (uploadResult.error) {
      throw uploadResult.error;
    }

    const { data } = supabase.storage
      .from("company-logos")
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedSlug = slugify(slug, {
        lower: true,
        strict: true,
        trim: true,
      });

      if (!formattedSlug) {
        throw new Error("Please provide a valid company slug.");
      }

      const slugCheck = await supabase
        .from("companies")
        .select("id")
        .eq("slug", formattedSlug)
        .maybeSingle<{ id: string }>();

      if (slugCheck.error) {
        throw slugCheck.error;
      }

      if (slugCheck.data && slugCheck.data.id !== company?.id) {
        throw new Error("That slug is already in use. Try another one.");
      }

      const logoUrl = await uploadLogo(formattedSlug);

      let savedCompanyId = company?.id ?? null;

      if (savedCompanyId) {
        const updated = await supabase
          .from("companies")
          .update({
            name: companyName.trim(),
            slug: formattedSlug,
            logo_url: logoUrl,
            brand_primary_color: primaryColor,
            brand_secondary_color: secondaryColor,
            brand_accent_color: accentColor,
          })
          .eq("id", savedCompanyId)
          .select("id")
          .single<{ id: string }>();

        if (updated.error) {
          throw updated.error;
        }

        savedCompanyId = updated.data.id;
      } else {
        const inserted = await supabase
          .from("companies")
          .insert({
            owner_user_id: user.id,
            name: companyName.trim(),
            slug: formattedSlug,
            logo_url: logoUrl,
            brand_primary_color: primaryColor,
            brand_secondary_color: secondaryColor,
            brand_accent_color: accentColor,
          })
          .select("id")
          .single<{ id: string }>();

        if (inserted.error) {
          throw inserted.error;
        }

        savedCompanyId = inserted.data.id;
      }

      const profileUpdate = await supabase
        .from("users")
        .update({
          company_id: savedCompanyId,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileUpdate.error) {
        throw profileUpdate.error;
      }

      await refreshProfile();
      toast.success("Onboarding complete.");
      navigate(`/dashboard/${formattedSlug}`, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to complete onboarding.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Set up your company</CardTitle>
            <CardDescription>
              This creates your tenant workspace. You can update these details
              later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="Acme Roofing"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Company slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(event.target.value);
                  }}
                  placeholder="acme-roofing"
                  required
                />
                <p className="text-xs text-slate-500">
                  Your dashboard URL will be `/dashboard/{slug || "company"}`.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(event) => setPrimaryColor(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary</Label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={secondaryColor}
                    onChange={(event) => setSecondaryColor(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent</Label>
                  <Input
                    id="accentColor"
                    type="color"
                    value={accentColor}
                    onChange={(event) => setAccentColor(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Company logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setLogoFile(file);
                    if (file) {
                      setLogoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Company logo preview"
                    className="h-16 w-16 rounded-md border border-slate-200 object-contain bg-white p-1"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-md border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    <Upload className="h-4 w-4" />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Complete onboarding"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
