-- migration_storage.sql — a public bucket for venue artwork.
--
-- Logos, crests and covers used to be base64 data URLs inside org_settings,
-- so every player downloaded every venue's artwork inline on every load.
-- They now upload here and the row stores a short public URL instead.
--
-- Rows written before this migration still hold data URLs and keep working:
-- the app puts either string straight into an <img src>. Nothing to backfill.
--
-- Safe to run more than once.

-- ── the bucket ─────────────────────────────────────────────────────────
-- public = true so venue artwork loads on the pre-login Discover screen
-- without a signed URL. Nothing private is ever put in here.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'serve-media', 'serve-media', true,
  5242880,                                   -- 5 MB ceiling; the app compresses to well under
  array['image/png','image/jpeg','image/webp','image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ── policies ───────────────────────────────────────────────────────────
-- Anyone may read (that's the point of a public bucket); only a signed-in
-- account may add or change files, and only inside this bucket.
drop policy if exists "serve media read"   on storage.objects;
create policy "serve media read" on storage.objects
  for select using (bucket_id = 'serve-media');

drop policy if exists "serve media insert" on storage.objects;
create policy "serve media insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'serve-media');

-- update/delete are limited to the uploader, so one venue can't overwrite
-- another's logo by guessing its path.
drop policy if exists "serve media update" on storage.objects;
create policy "serve media update" on storage.objects
  for update to authenticated
  using (bucket_id = 'serve-media' and owner = auth.uid())
  with check (bucket_id = 'serve-media' and owner = auth.uid());

drop policy if exists "serve media delete" on storage.objects;
create policy "serve media delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'serve-media' and owner = auth.uid());
