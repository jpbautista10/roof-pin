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
  },
  {
    id: "p4",
    tenant_id: "t1",
    lat: 33.735,
    lng: -84.435,
    zip_code: "30310",
    customer_name: "Angela T.",
    neighborhood: "West End",
    review_text:
      "From the free inspection to the final walkthrough, Smith Roofing was transparent and honest. No surprise charges, just great work.",
    stars: 4,
    before_img_url:
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&h=400&fit=crop",
    after_img_url:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop",
    created_at: "2024-08-05T16:45:00Z",
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
  },
  {
    id: "p6",
    tenant_id: "t1",
    lat: 33.757,
    lng: -84.342,
    zip_code: "30307",
    customer_name: "Patricia H.",
    neighborhood: "Inman Park",
    review_text:
      "Absolutely thrilled with our new roof! Smith Roofing took our old, leaky roof and transformed it. The curb appeal alone was worth every penny.",
    stars: 5,
    before_img_url:
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=400&fit=crop",
    after_img_url:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&h=400&fit=crop",
    created_at: "2024-06-12T13:20:00Z",
  },
];

export function getTenantBySlug(slug: string): Tenant | undefined {
  return mockTenants.find((t) => t.slug === slug);
}

export function getPinsForTenant(tenantId: string): Pin[] {
  return mockPins.filter((p) => p.tenant_id === tenantId);
}
