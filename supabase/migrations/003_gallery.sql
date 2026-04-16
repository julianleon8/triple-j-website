-- Triple J Metal LLC — Gallery Items
-- Replaces hardcoded PROJECTS array in gallery/page.tsx and Gallery.tsx.
-- Run in Supabase SQL Editor after 002_leads_qualification_fields.sql.

create table public.gallery_items (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz default now(),
  title       text not null,
  city        text default 'Central Texas',
  type        text default 'Carport',  -- Carport | Garage | Barn | RV Cover | Lean-To | Other
  tag         text default 'Welded',   -- Welded | Bolted | Turnkey
  alt_text    text default '',
  image_url   text not null,
  sort_order  integer default 0,
  is_active   boolean default true
);

alter table public.gallery_items enable row level security;

-- Authenticated owner can do everything
create policy "Owner full access" on public.gallery_items
  for all using (auth.role() = 'authenticated');

-- Public can read active items
create policy "Public read active" on public.gallery_items
  for select using (is_active = true);

-- Seed: the 6 existing photos already in /public/images/
insert into public.gallery_items (title, city, type, tag, alt_text, image_url, sort_order) values
  ('Residential Welded Carport', 'Central Texas', 'Carport', 'Welded',
   'Completed residential carport with welded red iron frame',
   '/images/carport-residential-completed.jpg', 1),
  ('Enclosed Metal Garage', 'Central Texas', 'Garage', 'Bolted',
   'Fully enclosed metal garage in green finish',
   '/images/metal-garage-green.jpg', 2),
  ('Carport + Concrete Pad', 'Central Texas', 'Carport', 'Turnkey',
   'Rural carport with fresh concrete pad poured same contract',
   '/images/carport-concrete-rural.jpg', 3),
  ('Double-Width Carport', 'Central Texas', 'Carport', 'Welded',
   'Double-width carport during installation by Triple J crew',
   '/images/double-carport-install.jpg', 4),
  ('Gable-Roof Carport', 'Central Texas', 'Carport', 'Welded',
   'Residential gable-roof carport with clean finish',
   '/images/carport-gable-residential.jpg', 5),
  ('Lean-To Porch Cover', 'Central Texas', 'Porch Cover', 'Bolted',
   'Metal lean-to porch cover attached to home',
   '/images/porch-cover-lean-to.jpg', 6);
