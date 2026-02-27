drop policy if exists "Public can read companies" on public.companies;
create policy "Public can read companies"
on public.companies
for select
to public
using (true);

drop policy if exists "Public can read locations" on public.locations;
create policy "Public can read locations"
on public.locations
for select
to public
using (
  exists (
    select 1
    from public.companies
    where companies.id = locations.company_id
  )
);

drop policy if exists "Public can read location images rows" on public.location_images;
create policy "Public can read location images rows"
on public.location_images
for select
to public
using (
  exists (
    select 1
    from public.locations
    where locations.id = location_images.location_id
  )
);

drop policy if exists "Public can read location reviews rows" on public.location_reviews;
create policy "Public can read location reviews rows"
on public.location_reviews
for select
to public
using (
  exists (
    select 1
    from public.locations
    where locations.id = location_reviews.location_id
  )
);
