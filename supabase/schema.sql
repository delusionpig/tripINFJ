create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  destination text not null default '',
  start_date date,
  end_date date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create index if not exists trips_user_id_start_date_idx on public.trips (user_id, start_date);

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trips_set_updated_at on public.trips;
create trigger trips_set_updated_at before update on public.trips
  for each row execute function public.set_updated_at();

alter table public.trips enable row level security;

drop policy if exists "trips_owner_all" on public.trips;
create policy "trips_owner_all" on public.trips
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
