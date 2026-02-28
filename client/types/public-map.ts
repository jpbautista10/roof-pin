export interface PublicCompany {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cta_url: string | null;
  brand_primary_color: string;
  brand_secondary_color: string;
  brand_accent_color: string;
}

export interface PublicLocationImage {
  id: string;
  kind: string;
  public_url: string;
  sort_order: number;
}

export interface PublicLocationReview {
  customer_name: string | null;
  review_text: string | null;
  stars: number | null;
}

export interface PublicLocation {
  id: string;
  project_name: string;
  place_label: string;
  latitude: number;
  longitude: number;
  privacy_mode: boolean;
  date_completed: string | null;
  created_at: string;
  images: PublicLocationImage[];
  reviews: PublicLocationReview[];
}
