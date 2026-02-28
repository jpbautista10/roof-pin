import { supabase } from "@/lib/supabase";

export async function createOrGetReviewToken(locationId: string) {
  const { data, error } = await supabase.rpc(
    "create_or_get_location_review_token",
    {
      p_location_id: locationId,
    },
  );

  if (error) {
    throw error;
  }

  return data as string;
}
