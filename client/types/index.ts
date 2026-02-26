export interface Tenant {
  id: string;
  user_id: string;
  slug: string;
  company_name: string;
  brand_color: string;
  logo_url: string;
  cta_link: string;
}

export interface Pin {
  id: string;
  tenant_id: string;
  lat: number;
  lng: number;
  zip_code: string;
  customer_name: string;
  neighborhood: string;
  review_text: string;
  stars: number;
  before_img_url: string;
  after_img_url: string;
  created_at: string;
}
