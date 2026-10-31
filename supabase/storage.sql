-- Public image bucket for the single-user prototype.
-- Anyone can upload/read because the app uses the public anon key.
insert into storage.buckets (id, name, public)
values ('trip-images', 'trip-images', true)
on conflict (id) do update set public = true;

drop policy if exists "trip_images_anon_insert" on storage.objects;
create policy "trip_images_anon_insert" on storage.objects
  for insert to anon
  with check (bucket_id = 'trip-images');

drop policy if exists "trip_images_public_read" on storage.objects;
create policy "trip_images_public_read" on storage.objects
  for select to public
  using (bucket_id = 'trip-images');
