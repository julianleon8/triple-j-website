-- private_lead_photos.sql
--
-- RECONSTRUCTED 2026-09-07 from the live database, not authored from scratch.
--
-- This migration was applied out of band on 2026-09-07 (ledger version
-- 20260907143042) with no file in the repo — the exact drift that
-- scripts/check-migrations.mjs exists to catch, and the same failure mode that
-- once left gallery_photos unreproducible. The DDL below was introspected from
-- storage.buckets and pg_policies so the schema can be rebuilt from this repo.
-- It is idempotent and re-running it is a no-op against the current database.
--
-- The filename deliberately carries NO numeric prefix. check-migrations.mjs
-- matches a file stem against the ledger's `name`, and the applier recorded
-- this one as bare "private_lead_photos"; renaming it to 034_* would leave the
-- orphan unresolved and add a phantom unapplied file alongside it.
--
-- WHAT IT DOES. Private customer site photos are not gallery photos: the
-- gallery bucket is public and its contents are marketing. Lead photos are a
-- customer's own property, so they get a separate private bucket that no
-- browser-side role can reach at all.
--
-- The lock is a RESTRICTIVE policy, which is the important detail. Permissive
-- policies OR together, so any future "authenticated users can read their
-- files" policy on storage.objects would silently widen access to this bucket
-- too. A restrictive policy ANDs with everything else, so `bucket_id <>
-- 'lead-photos'` is a floor that later policies cannot lift. Reads and writes
-- go through the service-role client, which bypasses RLS entirely.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lead-photos', 'lead-photos', false, 819200, array['image/jpeg'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 800 KB and image/jpeg only: these are camera captures re-encoded client-side
-- before upload, so anything larger or of another type is a bug, not a photo.

drop policy if exists "Lead photos server only" on storage.objects;

create policy "Lead photos server only"
  on storage.objects
  as restrictive
  for all
  to anon, authenticated
  using (bucket_id <> 'lead-photos')
  with check (bucket_id <> 'lead-photos');
