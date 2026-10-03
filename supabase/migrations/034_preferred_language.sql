-- 034_preferred_language.sql
--
-- The language a person wants to be spoken to in (Spanish site, 2026-10-03).
--
-- Set from the page the form was filled on: anything under /es is Spanish.
-- It picks the customer confirmation email, the quote email, SMS and PDF, and
-- flags the lead in HQ and the owner alert so a Spanish speaker calls back.
-- A lead that converts carries it to its customer row
-- (src/app/api/leads/[id]/convert/route.ts). HQ can correct it either way.
--
-- Additive with a default, so today's code keeps working before and after:
-- every existing row and every insert that does not name the column is 'en'.
-- Apply this BEFORE deploying code that writes the column — PostgREST rejects
-- an insert that names an unknown column, and a rejected lead insert is a lost
-- lead. (POST /api/leads also retries without the column, as a backstop.)
--
-- RLS: all three tables already carry the owner policy (024_lock_down_rls.sql
-- for leads and customers, 011 for partner_inquiries). No new table, nothing
-- to grant.

alter table public.leads
  add column if not exists preferred_language text not null default 'en'
  constraint leads_preferred_language_check check (preferred_language in ('en', 'es'));

alter table public.customers
  add column if not exists preferred_language text not null default 'en'
  constraint customers_preferred_language_check check (preferred_language in ('en', 'es'));

alter table public.partner_inquiries
  add column if not exists preferred_language text not null default 'en'
  constraint partner_inquiries_preferred_language_check check (preferred_language in ('en', 'es'));
