alter table public.users
  add column if not exists has_paid_access boolean not null default false,
  add column if not exists paid_at timestamptz,
  add column if not exists stripe_customer_id text;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  stripe_payment_intent_id text not null unique,
  stripe_customer_id text,
  stripe_charge_id text,
  stripe_event_id text,
  status text not null,
  amount integer not null,
  amount_refunded integer not null default 0,
  currency text not null,
  receipt_email text,
  paid_at timestamptz,
  refunded_at timestamptz,
  disputed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_status_check check (
    status in (
      'requires_payment_method',
      'requires_confirmation',
      'requires_action',
      'processing',
      'succeeded',
      'payment_failed',
      'refunded',
      'disputed',
      'canceled'
    )
  )
);

create index if not exists payments_user_id_created_at_idx
  on public.payments (user_id, created_at desc);

create unique index if not exists users_stripe_customer_id_key
  on public.users (stripe_customer_id)
  where stripe_customer_id is not null;

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

alter table public.payments enable row level security;

drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments"
on public.payments
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.company_has_paid_access(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.companies
    join public.users on users.id = companies.owner_user_id
    where companies.id = p_company_id
      and users.has_paid_access = true
  );
$$;

grant execute on function public.company_has_paid_access(uuid) to anon, authenticated;

drop policy if exists "Public can read companies" on public.companies;
create policy "Public can read companies"
on public.companies
for select
to public
using (public.company_has_paid_access(id));

drop policy if exists "Public can read locations" on public.locations;
create policy "Public can read locations"
on public.locations
for select
to public
using (public.company_has_paid_access(company_id));

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
      and public.company_has_paid_access(locations.company_id)
  )
);

drop policy if exists "Public can read location reviews rows" on public.location_reviews;
create policy "Public can read location reviews rows"
on public.location_reviews
for select
to public
using (
  is_visible = true
  and deleted_at is null
  and exists (
    select 1
    from public.locations
    where locations.id = location_reviews.location_id
      and public.company_has_paid_access(locations.company_id)
  )
);
