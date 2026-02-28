import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { Loader2, Upload } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const onboardingSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens only",
    ),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
  logoFile: z.any().optional(),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, company, refreshProfile } = useAuth();
  const [slugTouched, setSlugTouched] = useState(false);
  const [logoPreview, setLogoPreview] = useState(company?.logo_url ?? "");

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      companyName: company?.name ?? "",
      slug: company?.slug ?? "",
      primaryColor: company?.brand_primary_color ?? DEFAULT_COLORS.primary,
      secondaryColor:
        company?.brand_secondary_color ?? DEFAULT_COLORS.secondary,
      accentColor: company?.brand_accent_color ?? DEFAULT_COLORS.accent,
    },
  });

  const watchedCompanyName = form.watch("companyName");
  const watchedSlug = form.watch("slug");

  useEffect(() => {
    if (slugTouched) {
      return;
    }

    form.setValue(
      "slug",
      slugify(watchedCompanyName || "", {
        lower: true,
        strict: true,
        trim: true,
      }),
    );
  }, [watchedCompanyName, slugTouched, form]);

  const formattedSlug = useMemo(
    () =>
      slugify(watchedSlug || "", {
        lower: true,
        strict: true,
        trim: true,
      }),
    [watchedSlug],
  );

  const slugCheckQuery = useQuery({
    queryKey: ["companies", "slug-check", formattedSlug],
    enabled: formattedSlug.length > 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id")
        .eq("slug", formattedSlug)
        .maybeSingle<{ id: string }>();

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const onboardingMutation = useMutation({
    mutationFn: async (values: OnboardingValues) => {
      if (!user) {
        throw new Error("You must be signed in.");
      }

      const nextSlug = slugify(values.slug, {
        lower: true,
        strict: true,
        trim: true,
      });

      if (!nextSlug) {
        throw new Error("Please provide a valid company slug.");
      }

      const slugExists = await supabase
        .from("companies")
        .select("id")
        .eq("slug", nextSlug)
        .maybeSingle<{ id: string }>();

      if (slugExists.error) {
        throw slugExists.error;
      }

      if (slugExists.data && slugExists.data.id !== company?.id) {
        throw new Error("That slug is already in use. Try another one.");
      }

      const logoFileList = values.logoFile as FileList | undefined;
      const logoFile = logoFileList?.[0] ?? null;
      let logoUrl = company?.logo_url ?? null;

      if (logoFile) {
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
        logoUrl = data.publicUrl;
      }

      let companyId = company?.id ?? null;

      if (companyId) {
        const updated = await supabase
          .from("companies")
          .update({
            name: values.companyName.trim(),
            slug: nextSlug,
            logo_url: logoUrl,
            brand_primary_color: values.primaryColor,
            brand_secondary_color: values.secondaryColor,
            brand_accent_color: values.accentColor,
          })
          .eq("id", companyId)
          .select("id")
          .single<{ id: string }>();

        if (updated.error) {
          throw updated.error;
        }

        companyId = updated.data.id;
      } else {
        const inserted = await supabase
          .from("companies")
          .insert({
            owner_user_id: user.id,
            name: values.companyName.trim(),
            slug: nextSlug,
            logo_url: logoUrl,
            brand_primary_color: values.primaryColor,
            brand_secondary_color: values.secondaryColor,
            brand_accent_color: values.accentColor,
          })
          .select("id")
          .single<{ id: string }>();

        if (inserted.error) {
          throw inserted.error;
        }

        companyId = inserted.data.id;
      }

      const profileUpdate = await supabase
        .from("users")
        .update({
          company_id: companyId,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileUpdate.error) {
        throw profileUpdate.error;
      }

      return nextSlug;
    },
    onSuccess: async (nextSlug) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["companies", "slug-check"],
        }),
        queryClient.invalidateQueries({ queryKey: ["auth", "profile"] }),
        queryClient.invalidateQueries({ queryKey: ["auth", "company"] }),
        refreshProfile(),
      ]);
      toast.success("Onboarding complete.");
      navigate(`/dashboard/${nextSlug}`, { replace: true });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to complete onboarding.";
      toast.error(message);
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await onboardingMutation.mutateAsync(values);
  });

  const slugTaken = Boolean(
    slugCheckQuery.data &&
      (!company?.id || slugCheckQuery.data.id !== company.id),
  );

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
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Roofing"
                  {...form.register("companyName")}
                />
                {form.formState.errors.companyName ? (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.companyName.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Company slug</Label>
                <Input
                  id="slug"
                  placeholder="acme-roofing"
                  {...form.register("slug")}
                  onChange={(event) => {
                    setSlugTouched(true);
                    form.register("slug").onChange(event);
                  }}
                />
                {slugCheckQuery.isFetching ? (
                  <p className="text-xs text-slate-500">
                    Checking slug availability...
                  </p>
                ) : slugTaken ? (
                  <p className="text-xs text-red-600">
                    That slug is already in use.
                  </p>
                ) : null}
                {form.formState.errors.slug ? (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.slug.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    {...form.register("primaryColor")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary</Label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    {...form.register("secondaryColor")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent</Label>
                  <Input
                    id="accentColor"
                    type="color"
                    {...form.register("accentColor")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoFile">Company logo</Label>
                <Input
                  id="logoFile"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  {...form.register("logoFile")}
                  onChange={(event) => {
                    form.register("logoFile").onChange(event);
                    const file = event.target.files?.[0];
                    setLogoPreview(file ? URL.createObjectURL(file) : "");
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
                className="w-full"
                disabled={
                  onboardingMutation.isPending ||
                  slugTaken ||
                  slugCheckQuery.isFetching
                }
              >
                {onboardingMutation.isPending ? (
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
