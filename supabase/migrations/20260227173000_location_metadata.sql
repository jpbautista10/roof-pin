alter table public.locations
add column if not exists work_type text,
add column if not exists date_completed text,
add column if not exists privacy_mode boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from information_schema.constraint_column_usage
    where table_schema = 'public'
      and table_name = 'locations'
      and constraint_name = 'locations_work_type_check'
  ) then
    alter table public.locations
      add constraint locations_work_type_check
      check (work_type is null or work_type in ('Shingle', 'Flat', 'Tile', 'Metal'));
  end if;
end
$$;
