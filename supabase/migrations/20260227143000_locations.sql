create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  project_name text not null,
  place_label text not null,
  latitude double precision not null,
  longitude double precision not null,
  geocode_latitude double precision not null,
  geocode_longitude double precision not null,
  address_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.location_images (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  kind text not null check (kind in ('before', 'after')),
  storage_path text not null,
  public_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint location_images_unique_kind_per_location unique (location_id, kind, sort_order)
);

create table if not exists public.location_reviews (
  location_id uuid primary key references public.locations(id) on delete cascade,
  customer_name text,
  review_text text,
  stars integer check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists locations_set_updated_at on public.locations;
create trigger locations_set_updated_at
before update on public.locations
for each row
execute function public.set_updated_at();

drop trigger if exists location_reviews_set_updated_at on public.location_reviews;
create trigger location_reviews_set_updated_at
before update on public.location_reviews
for each row
execute function public.set_updated_at();

create index if not exists locations_company_id_created_at_idx
  on public.locations (company_id, created_at desc);

create index if not exists location_images_location_id_idx
  on public.location_images (location_id);

alter table public.locations enable row level security;
alter table public.location_images enable row level security;
alter table public.location_reviews enable row level security;

drop policy if exists "Owners can manage locations" on public.locations;
create policy "Owners can manage locations"
on public.locations
for all
to authenticated
using (
  exists (
    select 1
    from public.companies
    where companies.id = locations.company_id
      and companies.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.companies
    where companies.id = locations.company_id
      and companies.owner_user_id = auth.uid()
  )
  and created_by_user_id = auth.uid()
);

drop policy if exists "Owners can manage location images" on public.location_images;
create policy "Owners can manage location images"
on public.location_images
for all
to authenticated
using (
  exists (
    select 1
    from public.locations
    join public.companies on companies.id = locations.company_id
    where locations.id = location_images.location_id
      and companies.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.locations
    join public.companies on companies.id = locations.company_id
    where locations.id = location_images.location_id
      and companies.owner_user_id = auth.uid()
  )
);

drop policy if exists "Owners can manage location reviews" on public.location_reviews;
create policy "Owners can manage location reviews"
on public.location_reviews
for all
to authenticated
using (
  exists (
    select 1
    from public.locations
    join public.companies on companies.id = locations.company_id
    where locations.id = location_reviews.location_id
      and companies.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.locations
    join public.companies on companies.id = locations.company_id
    where locations.id = location_reviews.location_id
      and companies.owner_user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'location-images',
  'location-images',
  true,
  7340032,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Public can read location images" on storage.objects;
create policy "Public can read location images"
on storage.objects
for select
to public
using (bucket_id = 'location-images');

drop policy if exists "Users can upload own location images" on storage.objects;
create policy "Users can upload own location images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'location-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own location images" on storage.objects;
create policy "Users can update own location images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'location-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'location-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own location images" on storage.objects;
create policy "Users can delete own location images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'location-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
