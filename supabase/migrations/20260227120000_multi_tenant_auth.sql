create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  company_id uuid,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  logo_url text,
  brand_primary_color text not null default '#0f766e',
  brand_secondary_color text not null default '#0ea5e9',
  brand_accent_color text not null default '#f59e0b',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'users'
      and constraint_name = 'users_company_id_fkey'
  ) then
    alter table public.users
      add constraint users_company_id_fkey
      foreign key (company_id)
      references public.companies(id)
      on delete set null;
  end if;
end
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
before update on public.companies
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.companies enable row level security;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
on public.users
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Owners can create companies" on public.companies;
create policy "Owners can create companies"
on public.companies
for insert
to authenticated
with check (auth.uid() = owner_user_id);

drop policy if exists "Owners can read companies" on public.companies;
create policy "Owners can read companies"
on public.companies
for select
to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists "Owners can update companies" on public.companies;
create policy "Owners can update companies"
on public.companies
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "Owners can delete companies" on public.companies;
create policy "Owners can delete companies"
on public.companies
for delete
to authenticated
using (auth.uid() = owner_user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-logos',
  'company-logos',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

drop policy if exists "Public can read company logos" on storage.objects;
create policy "Public can read company logos"
on storage.objects
for select
to public
using (bucket_id = 'company-logos');

drop policy if exists "Users can upload own company logos" on storage.objects;
create policy "Users can upload own company logos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'company-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own company logos" on storage.objects;
create policy "Users can update own company logos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'company-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'company-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own company logos" on storage.objects;
create policy "Users can delete own company logos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'company-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
