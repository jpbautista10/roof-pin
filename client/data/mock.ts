import { Tenant, Pin } from "@/types";

export const mockTenants: Tenant[] = [
  {
    id: "t1",
    user_id: "u1",
    slug: "smithroofing",
    company_name: "Smith Roofing Co.",
    brand_color: "#2563EB",
    logo_url: "",
    cta_link: "https://smithroofing.com/contact",
  },
];

export const mockPins: Pin[] = [
  {
    id: "p1",
    tenant_id: "t1",
    lat: 33.749,
    lng: -84.388,
    zip_code: "30303",
    customer_name: "James W.",
    neighborhood: "Downtown Atlanta",
    review_text:
      "Smith Roofing replaced our entire roof in just two days. The crew was professional, clean, and the new architectural shingles look incredible. Highly recommend!",
    stars: 5,
    before_img_url:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
    after_img_url:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    created_at: "2024-11-15T10:00:00Z",
    work_type: "Shingle",
    date_completed: "November 2024",
    privacy_mode: false,
  },
  {
    id: "p2",
    tenant_id: "t1",
    lat: 33.772,
    lng: -84.365,
    zip_code: "30306",
    customer_name: "Maria L.",
    neighborhood: "Virginia-Highland",
    review_text:
      "After the storm damage, Smith Roofing handled everything from the insurance claim to the final inspection. Our new roof is beautiful and we couldn't be happier.",
    stars: 5,
    before_img_url:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
    after_img_url:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
    created_at: "2024-10-22T14:30:00Z",
    work_type: "Flat",
    date_completed: "October 2024",
    privacy_mode: false,
  },
  {
    id: "p3",
    tenant_id: "t1",
    lat: 33.789,
    lng: -84.412,
    zip_code: "30309",
    customer_name: "David & Sarah K.",
    neighborhood: "Midtown",
    review_text:
      "We got multiple quotes and Smith Roofing was the best value by far. The metal roof they installed is stunning and should last a lifetime.",
    stars: 5,
    before_img_url:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
    after_img_url:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=400&fit=crop",
    created_at: "2024-09-10T09:15:00Z",
    work_type: "Metal",
    date_completed: "September 2024",
    privacy_mode: false,
  },
  {
    id: "p4",
    tenant_id: "t1",
    lat: 33.735,
    lng: -84.435,
    zip_code: "30310",
    customer_name: "",
    neighborhood: "West End",
    review_text: "",
    stars: 0,
    before_img_url: "",
    after_img_url: "",
    created_at: "2024-08-05T16:45:00Z",
    work_type: "Shingle",
    date_completed: "August 2024",
    privacy_mode: true,
  },
  {
    id: "p5",
    tenant_id: "t1",
    lat: 33.808,
    lng: -84.355,
    zip_code: "30324",
    customer_name: "Robert M.",
    neighborhood: "Buckhead",
    review_text:
      "Premium quality work at a fair price. The team showed up on time every day and left the property spotless. Our neighbors are already asking for their number!",
    stars: 5,
    before_img_url:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop",
    after_img_url:
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=600&h=400&fit=crop",
    created_at: "2024-07-20T11:00:00Z",
    work_type: "Tile",
    date_completed: "July 2024",
    privacy_mode: false,
  },
  {
    id: "p6",
    tenant_id: "t1",
    lat: 33.757,
    lng: -84.342,
    zip_code: "30307",
    customer_name: "",
    neighborhood: "Inman Park",
    review_text: "",
    stars: 0,
    before_img_url: "",
    after_img_url: "",
    created_at: "2024-06-12T13:20:00Z",
    work_type: "Metal",
    date_completed: "June 2024",
    privacy_mode: true,
  },
];

/**
 * Simple hash function for deterministic offset per pin.
 * Ensures privacy-mode pins get a stable random offset that doesn't jump on re-render.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

/**
 * Returns display coordinates for a pin.
 * If privacy_mode is true, offsets lat/lng by a small deterministic amount
 * so the pin lands in the general neighborhood rather than the exact house.
 */
export function getDisplayCoords(pin: Pin): { lat: number; lng: number } {
  if (!pin.privacy_mode) {
    return { lat: pin.lat, lng: pin.lng };
  }
  const h = hashString(pin.id);
  // Normalize hash to a value between -0.5 and 0.5
  const offsetLat = ((h % 1000) / 1000) * 0.005;
  const offsetLng = (((h >> 10) % 1000) / 1000) * 0.005;
  return {
    lat: pin.lat + offsetLat,
    lng: pin.lng + offsetLng,
  };
}

export function getTenantBySlug(slug: string): Tenant | undefined {
  return mockTenants.find((t) => t.slug === slug);
}

export function getPinsForTenant(tenantId: string): Pin[] {
  return mockPins.filter((p) => p.tenant_id === tenantId);
}
