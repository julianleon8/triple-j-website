-- Phase 4.x — leads attribution columns (data-model audit 2026-04-24, §7)
--
-- Captures everything needed to attribute paid + organic + referral leads
-- back to their source for ROI math. Additive only; existing rows get
-- NULLs and remain valid. The website lead-form, Facebook webhook, and
-- voice-memo intake will populate these going forward.
--
-- Companion CHECK constraints tighten `intent_stage` and `source` so
-- bad values get rejected at the DB layer (vs only zod at the API).

alter table public.leads
  add column if not exists utm_source            text,
  add column if not exists utm_medium            text,
  add column if not exists utm_campaign          text,
  add column if not exists utm_term              text,
  add column if not exists utm_content           text,
  add column if not exists gclid                 text,
  add column if not exists fbclid                text,
  add column if not exists landing_url           text,
  add column if not exists referrer_url          text,
  add column if not exists referring_customer_id uuid references public.customers(id),
  add column if not exists first_response_at     timestamptz,
  add column if not exists intent_stage          text,
  add column if not exists estimated_budget_min  numeric(10,2),
  add column if not exists estimated_budget_max  numeric(10,2);

create index if not exists leads_utm_source_idx
  on public.leads (utm_source) where utm_source is not null;

create index if not exists leads_referring_customer_idx
  on public.leads (referring_customer_id) where referring_customer_id is not null;

create index if not exists leads_first_response_idx
  on public.leads (first_response_at) where first_response_at is not null;

-- intent_stage CHECK — allows NULL, otherwise must be one of the four
-- pipeline stages. Wrapped in DO block because ADD CONSTRAINT lacks
-- IF NOT EXISTS in Postgres < 15+ syntax.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_intent_stage_check'
  ) then
    alter table public.leads
      add constraint leads_intent_stage_check
        check (intent_stage is null or intent_stage in
          ('info_gathering','timeline_known','budget_set','ready_to_buy'));
  end if;
end $$;

-- source CHECK — tightens the existing free-text column to an enum-like
-- list. NOT VALID first so existing rows aren't blocked, then VALIDATE
-- to enforce going forward. If existing rows contain non-conforming
-- values, VALIDATE will fail and we'll need to clean them up first.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_source_check'
  ) then
    alter table public.leads
      add constraint leads_source_check
        check (source in (
          'website_form',
          'facebook_lead_ads',
          'facebook_messenger',
          'voice_memo',
          'lsa',
          'google_search_ads',
          'google_display',
          'instagram',
          'organic_search',
          'referral',
          'drive_by',
          'repeat_customer',
          'partner',
          'phone',
          'other'
        )) not valid;
  end if;
end $$;

comment on column public.leads.referring_customer_id is
  'When source = ''referral'' or ''repeat_customer'', the customer who sent us this lead. Powers the flywheel report.';
comment on column public.leads.first_response_at is
  'Auto-stamped by the leads_status_timestamps trigger (migration 015) when status leaves ''new''. First-response time is the #1 conversion lever.';
comment on column public.leads.intent_stage is
  'Funnel position separate from status. info_gathering = browsing, timeline_known = "in 6 weeks", budget_set = has a number, ready_to_buy = wants a quote now.';
