import { supabase } from "@/lib/supabase";
import { Database, TablesInsert } from "@shared/database.types";

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
        }
      | {
          customer_name: string | null;
          review_text: string | null;
          stars: number | null;
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
      "*, location_images(id, kind, public_url, sort_order), location_reviews(customer_name, review_text, stars)",
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
      "*, location_images(id, kind, public_url, sort_order), location_reviews(customer_name, review_text, stars)",
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
