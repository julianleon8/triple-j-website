-- Triple J Metal LLC — Initial Database Schema
-- Supabase / PostgreSQL

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- LEADS
-- ─────────────────────────────────────────
create table public.leads (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now(),
  name            text not null,
  phone           text not null,
  email           text,
  city            text,
  service_type    text default 'carport',     -- carport | garage | barn | other
  structure_type  text,                        -- welded | bolted | unsure
  message         text,
  status          text default 'new' not null, -- new | contacted | quoted | won | lost
  source          text default 'website_form', -- website_form | phone | referral | google
  owner_notes     text
);

-- ─────────────────────────────────────────
-- CUSTOMERS  (converted from leads)
-- ─────────────────────────────────────────
create table public.customers (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now(),
  lead_id     uuid references public.leads(id),
  name        text not null,
  phone       text not null,
  email       text,
  address     text,
  city        text,
  state       text default 'TX',
  zip         text,
  notes       text
);

-- ─────────────────────────────────────────
-- QUOTE TEMPLATES
-- ─────────────────────────────────────────
create table public.quote_templates (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz default now() not null,
  name        text not null,
  description text,
  line_items  jsonb default '[]'::jsonb,
  is_active   boolean default true
);

-- ─────────────────────────────────────────
-- QUOTES
-- ─────────────────────────────────────────
create table public.quotes (
  id               uuid primary key default uuid_generate_v4(),
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now(),
  customer_id      uuid references public.customers(id) not null,
  lead_id          uuid references public.leads(id),
  quote_number     text unique not null,
  status           text default 'draft' not null, -- draft | sent | accepted | declined | expired
  valid_until      date,
  subtotal         numeric(10,2) default 0,
  tax_rate         numeric(5,4) default 0.0825,   -- TX sales tax (where applicable)
  tax_amount       numeric(10,2) default 0,
  total            numeric(10,2) default 0,
  notes            text,
  internal_notes   text,
  accept_token     uuid default uuid_generate_v4() unique not null,
  accepted_at      timestamptz,
  declined_at      timestamptz,
  sent_at          timestamptz
);

-- ─────────────────────────────────────────
-- QUOTE LINE ITEMS
-- ─────────────────────────────────────────
create table public.quote_line_items (
  id           uuid primary key default uuid_generate_v4(),
  quote_id     uuid references public.quotes(id) on delete cascade not null,
  sort_order   integer default 0,
  description  text not null,
  quantity     numeric(10,2) default 1,
  unit         text default 'each',
  unit_price   numeric(10,2) default 0,
  total_price  numeric(10,2) default 0
);

-- ─────────────────────────────────────────
-- JOBS
-- ─────────────────────────────────────────
create table public.jobs (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now(),
  customer_id     uuid references public.customers(id) not null,
  quote_id        uuid references public.quotes(id),
  job_number      text unique not null,
  status          text default 'scheduled' not null, -- scheduled | in_progress | completed | on_hold | cancelled
  job_type        text default 'carport',             -- carport | garage | barn | fence | other
  structure_type  text,                               -- welded | bolted
  address         text,
  city            text,
  scheduled_date  date,
  completed_date  date,
  total_contract  numeric(10,2) default 0,
  amount_paid     numeric(10,2) default 0,
  balance_due     numeric(10,2) generated always as (total_contract - amount_paid) stored,
  crew_notes      text,
  internal_notes  text
);

-- ─────────────────────────────────────────
-- SEED: Quote Templates
-- ─────────────────────────────────────────
insert into public.quote_templates (name, description, line_items) values
(
  '20x20 Standard Carport (Welded)',
  'Basic 20x20 residential carport, welded red iron steel',
  '[
    {"description":"20x20 Red Iron Carport - Welded Steel","quantity":1,"unit":"each","unit_price":2800,"total_price":2800},
    {"description":"Labor and Installation","quantity":1,"unit":"each","unit_price":400,"total_price":400},
    {"description":"Concrete Anchors (4)","quantity":4,"unit":"each","unit_price":25,"total_price":100}
  ]'::jsonb
),
(
  '20x20 Standard Carport (Bolted)',
  'Basic 20x20 residential carport, bolted red iron steel',
  '[
    {"description":"20x20 Red Iron Carport - Bolted Steel","quantity":1,"unit":"each","unit_price":2400,"total_price":2400},
    {"description":"Labor and Installation","quantity":1,"unit":"each","unit_price":350,"total_price":350}
  ]'::jsonb
),
(
  '30x30 Large Carport (Welded)',
  'Large 30x30 carport for RV, boat, or multiple vehicles',
  '[
    {"description":"30x30 Red Iron Carport - Welded Steel","quantity":1,"unit":"each","unit_price":4800,"total_price":4800},
    {"description":"Labor and Installation","quantity":1,"unit":"each","unit_price":600,"total_price":600},
    {"description":"Concrete Anchors (6)","quantity":6,"unit":"each","unit_price":25,"total_price":150}
  ]'::jsonb
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
alter table public.leads enable row level security;
alter table public.customers enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_line_items enable row level security;
alter table public.quote_templates enable row level security;
alter table public.jobs enable row level security;

-- Owner (authenticated) can do everything
create policy "Owner full access" on public.leads for all using (auth.role() = 'authenticated');
create policy "Owner full access" on public.customers for all using (auth.role() = 'authenticated');
create policy "Owner full access" on public.quotes for all using (auth.role() = 'authenticated');
create policy "Owner full access" on public.quote_line_items for all using (auth.role() = 'authenticated');
create policy "Owner full access" on public.quote_templates for all using (auth.role() = 'authenticated');
create policy "Owner full access" on public.jobs for all using (auth.role() = 'authenticated');

-- Public: website form can INSERT leads (no auth)
create policy "Public lead submission" on public.leads
  for insert with check (true);

-- Public: customer can accept/decline quote via token (no auth)
create policy "Public quote acceptance" on public.quotes
  for update
  using (status = 'sent')
  with check (status in ('accepted', 'declined'));
