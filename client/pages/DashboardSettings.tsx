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
import { getContrastTextColor, getValidBrandColor } from "@/lib/color";
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
  logoFile: z.any().optional(),
});

type SettingsValues = z.infer<typeof settingsSchema>;

const BRAND_COLOR_PRESETS = [
  "#0f766e",
  "#0ea5e9",
  "#2563eb",
  "#4f46e5",
  "#be123c",
  "#f97316",
  "#84cc16",
  "#111827",
];

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
  const selectedBrandColor = getValidBrandColor(form.watch("primaryColor"));
  const selectedBrandTextColor = getContrastTextColor(selectedBrandColor);

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
              <div className="overflow-hidden rounded-md border border-slate-700 bg-slate-950 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-2 font-mono text-[11px] text-slate-400">
                      embed.html
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleCopyEmbed()}
                    aria-label={
                      copied ? "Embed code copied" : "Copy embed code"
                    }
                    title={copied ? "Copied" : "Copy embed code"}
                    className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <textarea
                  value={embedSnippet}
                  readOnly
                  rows={4}
                  spellCheck={false}
                  className="w-full resize-none border-0 bg-slate-950 p-3 font-mono text-xs leading-relaxed text-sky-200 selection:bg-slate-700 selection:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="primaryColor">Brand color</Label>
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Public map primary color
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Used on `/s/:slug` for map pins and primary actions.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-10 w-10 rounded-lg border border-white shadow-sm"
                      style={{ backgroundColor: selectedBrandColor }}
                    />
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                      {selectedBrandColor.toUpperCase()}
                    </span>
                    <label className="relative inline-flex h-10 cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                      Pick
                      <input
                        id="primaryColor"
                        type="color"
                        value={selectedBrandColor}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={(event) => {
                          form.setValue("primaryColor", event.target.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-8 gap-2">
                  {BRAND_COLOR_PRESETS.map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      className="h-7 rounded-md border border-white shadow-sm ring-offset-2 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                      style={{
                        backgroundColor: presetColor,
                        boxShadow:
                          selectedBrandColor === presetColor
                            ? "inset 0 0 0 2px rgba(255,255,255,0.85), 0 0 0 2px rgba(15, 23, 42, 0.28)"
                            : undefined,
                      }}
                      onClick={() => {
                        form.setValue("primaryColor", presetColor, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      aria-label={`Set brand color to ${presetColor}`}
                    />
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Button preview
                  </p>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold"
                    style={{
                      backgroundColor: selectedBrandColor,
                      color: selectedBrandTextColor,
                    }}
                  >
                    Get a quote
                  </button>
                </div>
              </div>
              {form.formState.errors.primaryColor ? (
                <p className="text-xs text-red-600">
                  {form.formState.errors.primaryColor.message}
                </p>
              ) : null}
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
