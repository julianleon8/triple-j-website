-- 008 — gallery_photos (RECONSTRUCTED 2026-09-06, not originally authored)
--
-- PROVENANCE: this file did not exist. `gallery_photos` was created directly
-- against production out-of-band, so the repo had no DDL for a live table
-- holding 68 rows, and `009_gallery_drop_image_url.sql:3` referenced an
-- `008_gallery_v2.sql` that was never committed. A clean rebuild of the schema
-- from this directory therefore failed at 009.
--
-- This file was reconstructed by introspecting the live database
-- (information_schema.columns, pg_constraint, pg_indexes) and is written to
-- match production exactly. It is idempotent, so applying it to the existing
-- database is a no-op — it exists so a fresh environment builds correctly.
--
-- One row per photo in a gallery item. `gallery_items` is the project; this is
-- the set of images under it (see 003_gallery.sql, and 012 for the job link).
--
-- RLS is deliberately NOT configured here. Migration 024_lock_down_rls.sql owns
-- every policy on this table ("Owner full access", "Public read photos of
-- active items") and enables RLS on it. Duplicating that here would create two
-- sources of truth for the same policy.

create extension if not exists "uuid-ossp";

create table if not exists public.gallery_photos (
  id               uuid primary key default uuid_generate_v4(),
  created_at       timestamptz not null default now(),
  gallery_item_id  uuid not null references public.gallery_items(id) on delete cascade,
  image_url        text not null,
  alt_text         text default ''::text,
  sort_order       integer default 0,
  is_cover         boolean default false
);

-- Ordered read of a single item's photos — the access pattern for /gallery/[id].
create index if not exists gallery_photos_item_sort_idx
  on public.gallery_photos (gallery_item_id, sort_order);

-- At most one cover photo per gallery item, enforced in the database rather
-- than in application code.
create unique index if not exists gallery_photos_one_cover_per_item_idx
  on public.gallery_photos (gallery_item_id)
  where (is_cover = true);
