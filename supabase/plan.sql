-- First version is single-user: the anon (publishable) key can read and write this table.
-- Anyone who has the key can change the data. Replace with per-user RLS before sharing the app.
create table if not exists public.trip_plans (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.trip_plans enable row level security;
grant select, insert, update on public.trip_plans to anon;

drop policy if exists "trip_plans_anon_all" on public.trip_plans;
create policy "trip_plans_anon_all" on public.trip_plans
  for all to anon
  using (true)
  with check (true);
