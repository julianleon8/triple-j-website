-- 034_leads_builder_design.sql
--
-- The 3D builder (/build) sends leads with their design attached.
--
-- 1. `builder` joins the leads.source allowlist. POST /api/leads accepts it from
--    a client only together with a design, and only a design that passes the
--    builder's own rules (src/lib/builder/rules.ts), so a builder lead can never
--    arrive without one and no other funnel can attach one.
--
-- 2. `design` holds that design: the versioned JSON defined by designSchema in
--    src/lib/builder/design.ts. HQ draws the plan from it and reopens it in 3D;
--    the lead's message also carries a text summary and a share link built from
--    it, so the owner email works without this column. NULL for every other
--    source. No index: nothing queries inside it.
--
-- Additive only. Code that does not know the column keeps working, and the
-- route writes the column for builder leads only.
--
-- RLS: no new table. `leads` keeps its is_owner() policy from 024.

alter table public.leads drop constraint if exists leads_source_check;

alter table public.leads
  add constraint leads_source_check
    check (source in (
      'website_form',
      'quote_page',
      'builder',
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
      'hq_test',
      'other'
    ));

alter table public.leads add column if not exists design jsonb;

alter table public.leads
  add constraint leads_design_is_object
    check (design is null or jsonb_typeof(design) = 'object');

comment on column public.leads.design is
  'The 3D builder design this lead was sent with (designSchema, src/lib/builder/design.ts).
   Set only for source = builder.';

comment on column public.leads.source is
  'Where the lead came from. Governed by leads_source_check. The public POST /api/leads
   accepts only website_form | quote_page | builder from the client (closed zod enum, so a
   bad value is a 400 and never reaches this constraint; builder requires a valid design);
   every other value is set server-side by an ingest path.';
