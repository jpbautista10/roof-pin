import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { Check, Copy, Loader2, Upload } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const settingsSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens only",
    ),
  ctaUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\//.test(value),
      "Use a valid URL starting with http:// or https://",
    ),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
  logoFile: z.any().optional(),
});

type SettingsValues = z.infer<typeof settingsSchema>;

export default function DashboardSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, company, refreshProfile } = useAuth();
  const [logoPreview, setLogoPreview] = useState(company?.logo_url ?? "");
  const [copied, setCopied] = useState(false);

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    values: {
      companyName: company?.name ?? "",
      slug: company?.slug ?? "",
      ctaUrl: company?.cta_url ?? "",
      primaryColor: company?.brand_primary_color ?? "#0f766e",
      secondaryColor: company?.brand_secondary_color ?? "#0ea5e9",
      accentColor: company?.brand_accent_color ?? "#f59e0b",
      logoFile: undefined,
    },
  });

  const formattedSlug = useMemo(
    () =>
      slugify(form.watch("slug") || "", {
        lower: true,
        strict: true,
        trim: true,
      }),
    [form.watch("slug")],
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

  const slugTaken = Boolean(
    slugCheckQuery.data &&
      (!company?.id || slugCheckQuery.data.id !== company.id),
  );

  const embedSlug = formattedSlug || company.slug;
  const appBaseUrl =
    import.meta.env.VITE_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const embedUrl = `${appBaseUrl}/s/${embedSlug}?embed=1`;
  const embedSnippet = `<iframe src="${embedUrl}" width="100%" height="640" style="border:0;border-radius:12px;" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;

  async function handleCopyEmbed() {
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setCopied(true);
      toast.success("Embed code copied.");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Unable to copy embed code.");
    }
  }

  const settingsMutation = useMutation({
    mutationFn: async (values: SettingsValues) => {
      if (!user || !company) {
        throw new Error("You must be signed in.");
      }

      const nextSlug = slugify(values.slug, {
        lower: true,
        strict: true,
        trim: true,
      });

      if (!nextSlug) {
        throw new Error("Please provide a valid slug.");
      }

      const slugExists = await supabase
        .from("companies")
        .select("id")
        .eq("slug", nextSlug)
        .maybeSingle<{ id: string }>();

      if (slugExists.error) {
        throw slugExists.error;
      }

      if (slugExists.data && slugExists.data.id !== company.id) {
        throw new Error("That slug is already in use.");
      }

      const logoFileList = values.logoFile as FileList | undefined;
      const logoFile = logoFileList?.[0] ?? null;
      let logoUrl = company.logo_url;

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

      const updateResult = await supabase
        .from("companies")
        .update({
          name: values.companyName.trim(),
          slug: nextSlug,
          cta_url: values.ctaUrl?.trim() || null,
          logo_url: logoUrl,
          brand_primary_color: values.primaryColor,
          brand_secondary_color: values.secondaryColor,
          brand_accent_color: values.accentColor,
        })
        .eq("id", company.id);

      if (updateResult.error) {
        throw updateResult.error;
      }

      return nextSlug;
    },
    onSuccess: async (nextSlug) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["companies", "slug-check"],
        }),
        queryClient.invalidateQueries({ queryKey: ["auth", "company"] }),
        refreshProfile(),
      ]);

      toast.success("Settings updated.");
      navigate(`/dashboard/${nextSlug}/settings`, { replace: true });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to save settings.",
      );
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await settingsMutation.mutateAsync(values);
  });

  if (!company) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-2xl py-2">
      <Card>
        <CardHeader>
          <CardTitle>Company settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" {...form.register("companyName")} />
              {form.formState.errors.companyName ? (
                <p className="text-xs text-red-600">
                  {form.formState.errors.companyName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Public slug</Label>
              <Input
                id="slug"
                {...form.register("slug")}
                onChange={(event) => {
                  const value = slugify(event.target.value, {
                    lower: true,
                    strict: true,
                    trim: true,
                  });
                  form.setValue("slug", value, { shouldValidate: true });
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

            <div className="space-y-2">
              <Label htmlFor="ctaUrl">Call-to-action URL</Label>
              <Input
                id="ctaUrl"
                placeholder="https://yourcompany.com/contact"
                {...form.register("ctaUrl")}
              />
              {form.formState.errors.ctaUrl ? (
                <p className="text-xs text-red-600">
                  {form.formState.errors.ctaUrl.message}
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Used for the quote button on the public map drawer.
                </p>
              )}
            </div>

            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Website embed widget
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Paste this into your website to embed your live map widget.
                </p>
              </div>
              <Input value={embedUrl} readOnly className="font-mono text-xs" />
              <textarea
                value={embedSnippet}
                readOnly
                rows={4}
                className="w-full rounded-md border border-slate-200 bg-white p-3 font-mono text-xs text-slate-700"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleCopyEmbed()}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy embed code"}
              </Button>
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
                  setLogoPreview(
                    file ? URL.createObjectURL(file) : (company.logo_url ?? ""),
                  );
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
                settingsMutation.isPending ||
                slugTaken ||
                slugCheckQuery.isFetching
              }
            >
              {settingsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save settings"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
