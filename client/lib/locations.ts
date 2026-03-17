import { supabase } from "@/lib/supabase";
import type { Database, TablesInsert } from "@shared/database.types";

export type LocationRow = Database["public"]["Tables"]["locations"]["Row"];

export interface LocationWithAssets extends LocationRow {
  images: Array<{
    id: string;
    kind: string;
    public_url: string;
    sort_order: number;
  }>;
  review: {
    customer_name: string | null;
    review_text: string | null;
    stars: number | null;
    source: string;
    is_visible: boolean;
    deleted_at: string | null;
    created_at: string;
    location_id: string;
  } | null;
}

function mapLocationRow(
  row: LocationRow & {
    location_images?: Array<{
      id: string;
      kind: string;
      public_url: string;
      sort_order: number;
    }> | null;
    location_reviews?:
      | {
          customer_name: string | null;
          review_text: string | null;
          stars: number | null;
          source: string;
          is_visible: boolean;
          deleted_at: string | null;
          created_at: string;
          location_id: string;
        }
      | {
          customer_name: string | null;
          review_text: string | null;
          stars: number | null;
          source: string;
          is_visible: boolean;
          deleted_at: string | null;
          created_at: string;
          location_id: string;
        }[]
      | null;
  },
) {
  return {
    ...row,
    images: row.location_images ?? [],
    review: Array.isArray(row.location_reviews)
      ? (row.location_reviews[0] ?? null)
      : (row.location_reviews ?? null),
  } as LocationWithAssets;
}

export async function fetchLocationsByCompany(companyId: string) {
  const { data, error } = await supabase
    .from("locations")
    .select(
      "*, location_images(id, kind, public_url, sort_order), location_reviews(customer_name, review_text, stars, source, is_visible, deleted_at, created_at, location_id)",
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapLocationRow(row as never));
}

export async function fetchLocationById(locationId: string) {
  const { data, error } = await supabase
    .from("locations")
    .select(
      "*, location_images(id, kind, public_url, sort_order), location_reviews(customer_name, review_text, stars, source, is_visible, deleted_at, created_at, location_id)",
    )
    .eq("id", locationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapLocationRow(data as never);
}

export async function createLocation(
  payload: TablesInsert<"locations">,
): Promise<LocationRow> {
  const { data, error } = await supabase
    .from("locations")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateLocation(
  locationId: string,
  payload: Database["public"]["Tables"]["locations"]["Update"],
): Promise<LocationRow> {
  const { data, error } = await supabase
    .from("locations")
    .update(payload)
    .eq("id", locationId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteLocation(locationId: string) {
  const { error } = await supabase
    .from("locations")
    .delete()
    .eq("id", locationId);
  if (error) {
    throw error;
  }
}

/**
 * One-time cleanup: if address_json.neighborhood equals place_label or
 * full_address (i.e. it's the full address, not an actual neighborhood),
 * clear it so the display fallback (neighborhood → city → place_label) works.
 */
export async function cleanupNeighborhoodData(companyId: string) {
  const { data, error } = await supabase
    .from("locations")
    .select("id, place_label, address_json")
    .eq("company_id", companyId);

  if (error || !data) return 0;

  let fixed = 0;
  for (const row of data) {
    const json = row.address_json as Record<string, unknown> | null;
    if (!json) continue;

    const neighborhood =
      typeof json.neighborhood === "string" ? json.neighborhood.trim() : "";
    const fullAddress =
      typeof json.full_address === "string" ? json.full_address.trim() : "";
    const placeLabel = (row.place_label ?? "").trim();

    if (!neighborhood) continue;

    // If neighborhood is the same as full_address or place_label, it's wrong
    const isBad =
      neighborhood === fullAddress ||
      neighborhood === placeLabel ||
      // Also catch neighborhoods that look like full addresses (contain commas + numbers)
      (neighborhood.includes(",") && /\d/.test(neighborhood));

    if (isBad) {
      const { error: updateError } = await supabase
        .from("locations")
        .update({
          address_json: { ...json, neighborhood: null },
        })
        .eq("id", row.id);

      if (!updateError) fixed++;
    }
  }

  return fixed;
}

/**
 * One-time cleanup: strip time portions from date_completed values
 * e.g. "11/22/24 14:30" → "November 2024"
 */
export async function cleanupDateCompletedData(companyId: string) {
  const { data, error } = await supabase
    .from("locations")
    .select("id, date_completed")
    .eq("company_id", companyId);

  if (error || !data) return 0;

  let fixed = 0;
  for (const row of data) {
    const raw = row.date_completed?.trim();
    if (!raw) continue;

    // Already in "Month Year" format (e.g. "June 2024") — skip
    if (/^[A-Z][a-z]+ \d{4}$/.test(raw)) continue;

    // Try to parse date formats like "11/22/24 14:30", "11/22/24", "2024-11-22", etc.
    let parsed: Date | null = null;

    // MM/DD/YY or MM/DD/YYYY with optional time
    const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (slashMatch) {
      const m = parseInt(slashMatch[1], 10);
      const d = parseInt(slashMatch[2], 10);
      let y = parseInt(slashMatch[3], 10);
      if (y < 100) y += 2000;
      parsed = new Date(y, m - 1, d);
    }

    // ISO format fallback
    if (!parsed || isNaN(parsed.getTime())) {
      parsed = new Date(raw);
    }

    if (!parsed || isNaN(parsed.getTime())) continue;

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const cleaned = `${months[parsed.getMonth()]} ${parsed.getFullYear()}`;

    if (cleaned === raw) continue;

    const { error: updateError } = await supabase
      .from("locations")
      .update({ date_completed: cleaned })
      .eq("id", row.id);

    if (!updateError) fixed++;
  }

  return fixed;
}

export async function deleteLocationsBulk(locationIds: string[]) {
  const { error } = await supabase
    .from("locations")
    .delete()
    .in("id", locationIds);
  if (error) {
    throw error;
  }
}
