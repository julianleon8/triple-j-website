-- `/quote` landing page: add `quote_page` to the leads.source allowlist.
--
-- Two things are being repaired here alongside the addition.
--
-- 1. `hq_test`. src/app/api/test/lead/route.ts has always inserted this value,
--    but 014 never listed it. The constraint IS applied in production, so that
--    route has been failing its insert since 014 landed -- the HQ "create test
--    lead" button was broken, silently, for months. It is in the list now.
--
-- 2. NOT VALID. 014 added the constraint NOT VALID and never followed up, so it
--    governed new inserts but was never checked against existing rows. Every
--    row in the table is `website_form`, so there is nothing to clean up and no
--    reason to carry the unvalidated posture forward. This one validates.
--
-- drop-if-exists keeps it idempotent whether or not 014 ever ran.

alter table public.leads drop constraint if exists leads_source_check;

alter table public.leads
  add constraint leads_source_check
    check (source in (
      'website_form',
      'quote_page',
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

comment on column public.leads.source is
  'Where the lead came from. Governed by leads_source_check. The public POST /api/leads
   accepts only website_form | quote_page from the client (closed zod enum, so a bad
   value is a 400 and never reaches this constraint); every other value is set
   server-side by an ingest path.';
