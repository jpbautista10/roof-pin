-- Add visibility toggle columns for public map pin popups
alter table public.companies
  add column if not exists show_completed_date boolean not null default true,
  add column if not exists show_work_type boolean not null default true,
  add column if not exists show_neighborhood boolean not null default true,
  add column if not exists show_reviews boolean not null default true,
  add column if not exists show_images boolean not null default true;
