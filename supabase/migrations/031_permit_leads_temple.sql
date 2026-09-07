-- 031_permit_leads_temple.sql
--
-- The permit scraper is rebuilt on the City of Temple weekly building-permit
-- report (see src/lib/permit-sources.ts and Decisions.md 2026-09-07). Three
-- schema consequences:
--
--   1. Temple publishes fields the April schema had no home for: property
--      owner, applicant, general contractor, job status and the job-type code
--      (ACRS, SFR, BCRR...). Plus lead_class, which is what the owner filters
--      by: accessory work to call on, new homes to market to later, and small
--      commercial.
--
--   2. The dedup index was PARTIAL (where permit_number is not null). PostgREST
--      cannot infer a partial unique index for ON CONFLICT, so the first
--      successful upsert would have failed -- it never ran. Also a permit
--      recurs week to week as its status advances (Plan Review -> Approved ->
--      Closed), so source_url must not be part of the key.
--
--   3. permit_reports: which report PDFs have already been processed.
--      cron_runs records runs, not documents; without this the scraper can
--      neither backfill nor tell "nothing new this week" from "stalled".
--
-- permit_leads held zero rows when this was written (verified 2026-09-07), so
-- the index swap has no data to conflict with.

-- ── 1. New columns ──────────────────────────────────────────────────────────
alter table public.permit_leads
  add column if not exists owner_name      text,
  add column if not exists applicant_name  text,
  add column if not exists contractor_name text,
  add column if not exists job_status      text,
  add column if not exists job_type_code   text,
  add column if not exists lead_class      text;

alter table public.permit_leads
  drop constraint if exists permit_leads_lead_class_check;
alter table public.permit_leads
  add constraint permit_leads_lead_class_check
  check (lead_class is null or lead_class in ('accessory', 'new_home', 'commercial'));

comment on column public.permit_leads.owner_name is
  'Property owner as printed in the municipal report. Public record; HQ-only, never rendered on the public site.';
comment on column public.permit_leads.applicant_name is
  'Permit applicant (person and/or company) as printed.';
comment on column public.permit_leads.contractor_name is
  'General contractor business name as printed. Populated on new-home permits -> the builder-partnership list.';
comment on column public.permit_leads.job_status is
  'Municipal status at the time of the most recent report that listed the permit, e.g. "Plan Review - PR", "Approved (Issued) - AP", "Closed - Final Inspection". Overwritten on each re-sighting; the owner workflow column is `status`.';
comment on column public.permit_leads.job_type_code is
  'Jurisdiction job-type code from the permit number suffix (Temple: ACRS, ACRL, BAR, FLAT, SFR, DUPX, BCRR...).';
comment on column public.permit_leads.lead_class is
  'accessory = direct outbound (sheds, shops, additions, slabs, covers); new_home = future secondary-structure prospect + builder list; commercial = small commercial new/remodel. Assigned by Claude, hinted by job_type_code.';

create index if not exists permit_leads_class_idx
  on public.permit_leads (lead_class);

-- ── 2. Dedup key: (jurisdiction, permit_number), full index ─────────────────
drop index if exists public.permit_leads_dedup_idx;
create unique index if not exists permit_leads_jurisdiction_permit_key
  on public.permit_leads (jurisdiction, permit_number);

-- ── 3. Processed-document ledger ────────────────────────────────────────────
create table if not exists public.permit_reports (
  source_url   text primary key,
  jurisdiction text not null,
  label        text,
  uploaded_at  timestamptz,
  fetched_at   timestamptz not null default now(),
  permit_count integer not null default 0,
  kept_count   integer not null default 0,
  lead_count   integer not null default 0
);

comment on table public.permit_reports is
  'One row per report PDF the scraper has processed. Read to skip already-seen reports and to detect a stalled source (newest uploaded_at too old). Written by /api/cron/scrape-permits via the service role.';
comment on column public.permit_reports.label is
  'Human label from the filename, e.g. "Aug 21-27". Used in push text.';
comment on column public.permit_reports.uploaded_at is
  'Publisher upload time, read from the ?t=YYYYMMDDhhmmss cache-buster Revize appends to each link. NULL when the link carried none.';
comment on column public.permit_reports.permit_count is
  'Rows found in the PDF before any filtering.';
comment on column public.permit_reports.kept_count is
  'Rows that survived the job-type pre-filter and were sent to Claude.';
comment on column public.permit_reports.lead_count is
  'Rows Claude returned with a lead_class, i.e. stored in permit_leads (inserted or re-sighted).';

create index if not exists permit_reports_jurisdiction_uploaded_idx
  on public.permit_reports (jurisdiction, uploaded_at desc);

alter table public.permit_reports enable row level security;
-- No policies: service-role only, following the app_owners convention from 024.
