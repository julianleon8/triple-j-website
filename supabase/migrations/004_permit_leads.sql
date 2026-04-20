-- Triple J Metal LLC — Permit Leads (Lead Engine V1)
-- Daily cron scrapes Central TX municipal permit PDFs, Claude parses + scores them
-- against Triple J's wheelhouse (Filter B), results land here for outbound calling.
-- Run in Supabase SQL Editor after 003_gallery.sql.

create table public.permit_leads (
  id                  uuid primary key default uuid_generate_v4(),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),

  -- Source metadata
  jurisdiction        text not null,            -- temple | bell_county | harker_heights | killeen | copperas_cove | waco | mclennan_county | belton_pz
  source_url          text not null,            -- direct PDF URL the permit was extracted from
  source_report_date  date,                     -- date of the weekly/monthly report

  -- Permit fields
  permit_number       text,
  permit_type         text,                     -- "new construction", "accessory structure", "PEMB", etc.
  address             text,
  city                text,
  state               text default 'TX',
  zip                 text,
  description         text,                     -- raw description from permit
  valuation           numeric,                  -- declared project value in USD

  -- Claude scoring
  wheelhouse_score    smallint check (wheelhouse_score between 1 and 10),
  wheelhouse_reasons  text[],                   -- bullet-point reasoning from Claude

  -- Owner workflow
  status              text default 'new' check (status in ('new','called','qualified','junk','won','lost')),
  notes               text,
  called_at           timestamptz,
  called_by           uuid references auth.users(id),

  -- Audit
  raw_source_text     text,                     -- text chunk Claude extracted this from (debugging)
  extraction_model    text                      -- e.g. "claude-sonnet-4-6"
);

-- Idempotent re-scrape: the same (jurisdiction, source PDF, permit #) should dedupe.
create unique index permit_leads_dedup_idx
  on public.permit_leads (jurisdiction, source_url, permit_number)
  where permit_number is not null;

-- Dashboard sort: hot leads first, then newest.
create index permit_leads_score_idx     on public.permit_leads (wheelhouse_score desc);
create index permit_leads_created_idx   on public.permit_leads (created_at desc);
create index permit_leads_status_idx    on public.permit_leads (status);

-- RLS: owner-only. Service role bypasses via getAdminClient() in the cron route.
alter table public.permit_leads enable row level security;

create policy "Owner full access" on public.permit_leads
  for all using (auth.role() = 'authenticated');
