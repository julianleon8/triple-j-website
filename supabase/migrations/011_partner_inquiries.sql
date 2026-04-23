-- Triple J Metal LLC — Partner Inquiries (B2B referral funnel)
-- Captures inquiries from suppliers, manufacturers, dealers, GCs, and developers
-- who want Triple J to be their installation partner. Distinct from the retail
-- `leads` table because the fields, ops cadence, and status flow are different.
-- Submitted via POST /api/partner-inquiries from /partners. Surfaces in /hq/partners.

create table public.partner_inquiries (
  id                  uuid primary key default uuid_generate_v4(),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),

  -- Submitted via /partners form
  company_name        text not null,
  company_type        text not null,             -- manufacturer | supplier | dealer | gc | developer | architect | other
  contact_name        text not null,
  contact_role        text,                      -- title / role at the company
  email               text not null,
  phone               text,
  message             text not null,             -- free-form: what they're looking for
  estimated_volume    text,                      -- exploring | 1-5 | 6-20 | 20-50 | 50+
  referral_source     text,                      -- "How did you hear about us" — optional

  -- Owner workflow
  status              text default 'new' check (status in ('new','contacted','engaged','declined')),
  notes               text                       -- internal notes, edited from /hq/partners
);

-- Dashboard sort
create index partner_inquiries_created_idx on public.partner_inquiries (created_at desc);
create index partner_inquiries_status_idx  on public.partner_inquiries (status);

-- RLS: owner-only. Service role bypasses via getAdminClient() in API routes.
alter table public.partner_inquiries enable row level security;

create policy "Owner full access" on public.partner_inquiries
  for all using (auth.role() = 'authenticated');
