alter table public.users
  add column if not exists full_name text;

alter table public.users
  drop column if exists stripe_customer_id;

drop policy if exists "Users can read own payments" on public.payments;
drop trigger if exists payments_set_updated_at on public.payments;
drop table if exists public.payments;

create table if not exists public.checkout_orders (
  id uuid primary key default gen_random_uuid(),
  public_token uuid not null default gen_random_uuid() unique,
  auth_user_id uuid references public.users(id) on delete set null,
  email text not null,
  contact_name text not null,
  company_name text not null,
  stripe_payment_intent_id text not null unique,
  stripe_customer_id text,
  stripe_event_id text,
  status text not null,
  amount integer not null,
  amount_refunded integer not null default 0,
  currency text not null,
  paid_at timestamptz,
  refunded_at timestamptz,
  disputed_at timestamptz,
  login_link_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint checkout_orders_status_check check (
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

create index if not exists checkout_orders_email_created_at_idx
  on public.checkout_orders (email, created_at desc);

create index if not exists checkout_orders_auth_user_id_created_at_idx
  on public.checkout_orders (auth_user_id, created_at desc);

create unique index if not exists checkout_orders_public_token_key
  on public.checkout_orders (public_token);

drop trigger if exists checkout_orders_set_updated_at on public.checkout_orders;
create trigger checkout_orders_set_updated_at
before update on public.checkout_orders
for each row
execute function public.set_updated_at();

alter table public.checkout_orders enable row level security;

drop policy if exists "Users can read own checkout orders" on public.checkout_orders;
create policy "Users can read own checkout orders"
on public.checkout_orders
for select
to authenticated
using (auth.uid() = auth_user_id);
