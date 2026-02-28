create table if not exists public.location_review_requests (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null unique references public.locations(id) on delete cascade,
  token text not null unique,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '30 days'),
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.location_reviews
add column if not exists source text not null default 'owner_form',
add column if not exists review_request_id uuid references public.location_review_requests(id) on delete set null;

do $$
begin
  if not exists (
    select 1
    from information_schema.constraint_column_usage
    where table_schema = 'public'
      and table_name = 'location_reviews'
      and constraint_name = 'location_reviews_source_check'
  ) then
    alter table public.location_reviews
      add constraint location_reviews_source_check
      check (source in ('owner_form', 'customer_link'));
  end if;
end
$$;

alter table public.location_review_requests enable row level security;

drop policy if exists "Owners can manage location review requests" on public.location_review_requests;
create policy "Owners can manage location review requests"
on public.location_review_requests
for all
to authenticated
using (
  exists (
    select 1
    from public.locations
    join public.companies on companies.id = locations.company_id
    where locations.id = location_review_requests.location_id
      and companies.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.locations
    join public.companies on companies.id = locations.company_id
    where locations.id = location_review_requests.location_id
      and companies.owner_user_id = auth.uid()
  )
  and created_by_user_id = auth.uid()
);

drop policy if exists "Owners can manage location reviews" on public.location_reviews;

drop policy if exists "Owners can read location reviews" on public.location_reviews;
create policy "Owners can read location reviews"
on public.location_reviews
for select
to authenticated
using (
  exists (
    select 1
    from public.locations
    join public.companies on companies.id = locations.company_id
    where locations.id = location_reviews.location_id
      and companies.owner_user_id = auth.uid()
  )
);

drop policy if exists "Owners can insert location reviews" on public.location_reviews;
create policy "Owners can insert location reviews"
on public.location_reviews
for insert
to authenticated
with check (
  exists (
    select 1
    from public.locations
    join public.companies on companies.id = locations.company_id
    where locations.id = location_reviews.location_id
      and companies.owner_user_id = auth.uid()
  )
  and source = 'owner_form'
);

drop policy if exists "Owners can update editable location reviews" on public.location_reviews;
create policy "Owners can update editable location reviews"
on public.location_reviews
for update
to authenticated
using (
  exists (
    select 1
    from public.locations
    join public.companies on companies.id = locations.company_id
    where locations.id = location_reviews.location_id
      and companies.owner_user_id = auth.uid()
  )
  and source <> 'customer_link'
)
with check (
  exists (
    select 1
    from public.locations
    join public.companies on companies.id = locations.company_id
    where locations.id = location_reviews.location_id
      and companies.owner_user_id = auth.uid()
  )
  and source <> 'customer_link'
);

drop policy if exists "Owners can delete editable location reviews" on public.location_reviews;
create policy "Owners can delete editable location reviews"
on public.location_reviews
for delete
to authenticated
using (
  exists (
    select 1
    from public.locations
    join public.companies on companies.id = locations.company_id
    where locations.id = location_reviews.location_id
      and companies.owner_user_id = auth.uid()
  )
  and source <> 'customer_link'
);

create or replace function public.create_or_get_location_review_token(p_location_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_token text;
  new_token text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.locations
    join public.companies on companies.id = locations.company_id
    where locations.id = p_location_id
      and companies.owner_user_id = auth.uid()
  ) then
    raise exception 'Location not found or forbidden';
  end if;

  if exists (select 1 from public.location_reviews where location_id = p_location_id) then
    raise exception 'Location already has a review';
  end if;

  select token
  into existing_token
  from public.location_review_requests
  where location_id = p_location_id
    and consumed_at is null
    and expires_at > now()
  limit 1;

  if existing_token is not null then
    return existing_token;
  end if;

  new_token := replace(gen_random_uuid()::text, '-', '');

  insert into public.location_review_requests (location_id, token, created_by_user_id)
  values (p_location_id, new_token, auth.uid())
  on conflict (location_id)
  do update
    set token = excluded.token,
        created_by_user_id = excluded.created_by_user_id,
        consumed_at = null,
        expires_at = now() + interval '30 days',
        created_at = now();

  return new_token;
end;
$$;

create or replace function public.submit_location_review(
  p_token text,
  p_customer_name text,
  p_review_text text,
  p_stars integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.location_review_requests%rowtype;
begin
  if p_stars is null or p_stars < 1 or p_stars > 5 then
    raise exception 'Invalid star rating';
  end if;

  select *
  into request_row
  from public.location_review_requests
  where token = p_token
  limit 1;

  if request_row.id is null then
    raise exception 'Invalid review link';
  end if;

  if request_row.consumed_at is not null then
    raise exception 'This review link was already used';
  end if;

  if request_row.expires_at <= now() then
    raise exception 'This review link has expired';
  end if;

  if exists (select 1 from public.location_reviews where location_id = request_row.location_id) then
    raise exception 'A review already exists for this location';
  end if;

  insert into public.location_reviews (
    location_id,
    customer_name,
    review_text,
    stars,
    source,
    review_request_id
  )
  values (
    request_row.location_id,
    nullif(trim(p_customer_name), ''),
    nullif(trim(p_review_text), ''),
    p_stars,
    'customer_link',
    request_row.id
  );

  update public.location_review_requests
  set consumed_at = now()
  where id = request_row.id;

  return request_row.location_id;
end;
$$;

grant execute on function public.create_or_get_location_review_token(uuid) to authenticated;
grant execute on function public.submit_location_review(text, text, text, integer) to anon, authenticated;
