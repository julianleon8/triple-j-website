-- Triple J Metal LLC — Gallery v2: multi-photo + color metadata + featured pin.
-- Additive. Safe to re-run. Run in Supabase SQL Editor after 007_sms_events.sql.
--
-- See `Gallery v2 Plan.md` at repo root. Column naming gotcha: `*_color_line`
-- stores lowercase slugs (e.g. 'turnium', 'sheffield'); the TS `PANEL_COLORS`
-- enum in src/lib/colors.ts uses capitalized display names. The P2 helper
-- src/lib/gallery-colors.ts bridges the casing.

-- ─────────────────────────────────────────
-- gallery_items: additive metadata columns
-- ─────────────────────────────────────────
alter table public.gallery_items
  add column if not exists panel_color      text,
  add column if not exists panel_color_line text,
  add column if not exists trim_color       text,
  add column if not exists trim_color_line  text,
  add column if not exists panel_profile    text,
  add column if not exists gauge            text,
  add column if not exists is_featured      boolean default false;

comment on column public.gallery_items.panel_color      is 'Lowercase color slug, resolved against PANEL_COLORS in src/lib/colors.ts';
comment on column public.gallery_items.panel_color_line is 'Lowercase line slug (e.g. turnium, sheffield); TS enum is capitalized';
comment on column public.gallery_items.trim_color       is 'Lowercase color slug, resolved against PANEL_COLORS';
comment on column public.gallery_items.trim_color_line  is 'Lowercase line slug';
comment on column public.gallery_items.panel_profile    is 'PBR | PBU — see /services/pbr-vs-pbu-panels';
comment on column public.gallery_items.gauge            is 'Steel gauge, typically 26 or 29';
comment on column public.gallery_items.is_featured      is 'Pin to first slot on /gallery + homepage hero cell';

-- ─────────────────────────────────────────
-- gallery_photos: one row per photo, many per gallery_item
-- ─────────────────────────────────────────
create table if not exists public.gallery_photos (
  id               uuid primary key default uuid_generate_v4(),
  created_at       timestamptz not null default now(),
  gallery_item_id  uuid not null references public.gallery_items(id) on delete cascade,
  image_url        text not null,
  alt_text         text default '',
  sort_order       integer default 0,
  is_cover         boolean default false
);

create index if not exists gallery_photos_item_sort_idx
  on public.gallery_photos (gallery_item_id, sort_order);

-- At most one cover per gallery_item
create unique index if not exists gallery_photos_one_cover_per_item_idx
  on public.gallery_photos (gallery_item_id)
  where is_cover = true;

alter table public.gallery_photos enable row level security;

-- Shape copied from 003_gallery.sql: authenticated owner = full access,
-- public read gated on parent item being active.
create policy "Owner full access" on public.gallery_photos
  for all using (auth.role() = 'authenticated');

create policy "Public read photos of active items" on public.gallery_photos
  for select using (
    exists (
      select 1 from public.gallery_items gi
      where gi.id = gallery_photos.gallery_item_id
        and gi.is_active = true
    )
  );

-- ─────────────────────────────────────────
-- Backfill: one cover photo per existing gallery_item
-- Idempotent via NOT EXISTS guard — safe to re-run.
-- ─────────────────────────────────────────
insert into public.gallery_photos (gallery_item_id, image_url, alt_text, is_cover, sort_order)
select gi.id, gi.image_url, gi.alt_text, true, 0
from public.gallery_items gi
where gi.image_url is not null
  and not exists (
    select 1 from public.gallery_photos gp
    where gp.gallery_item_id = gi.id
  );
