-- 033_lead_drafts.sql
--
-- Makes a half-captured lead a first-class row instead of a validation error.
--
-- The capture screen saves a lead from a phone number alone, so `name` and
-- `phone` lose their NOT NULL. That is one-way in practice: once a null row
-- exists the constraint cannot be put back without deleting or backfilling.
--
-- WHY THE PREDICATE EXCLUDES SIZE. The design says a lead is a draft while
-- name, service OR size is missing. Size is left out on purpose: dimensions are
-- optional on the public quote form, so including them would mark most of the
-- inbound web funnel as a draft and hang a FINISH button on it. Excluding size
-- also means POST /api/leads is not touched by this migration at all. size_raw
-- is still added -- the capture checklist needs somewhere to put row 4 -- it
-- just is not part of what makes a row a draft.
--
-- is_draft is GENERATED rather than a plain boolean with a trigger: it cannot
-- drift, it is indexable, and PostgREST can filter it directly. The Supabase
-- clients in this repo are untyped, so a column that could go stale would have
-- nothing to catch it.
--
-- Its TypeScript mirror is isDraftLead() in src/lib/hq/capture-draft.ts, and
-- capture-draft.test.ts pins the two against the same fixture table.
--
-- RLS: `leads` is already in the owner_tables array in 024_lock_down_rls.sql,
-- so it keeps the is_owner() policy. Note that array is a LITERAL list -- it
-- does not cover tables added later. This migration adds no table, so there is
-- nothing new to grant, but do not assume that holds for the next one.

alter table public.leads alter column name  drop not null;
alter table public.leads alter column phone drop not null;

-- Must go, or an insert that omits service_type silently becomes 'carport'
-- and is_draft can never be true. Every insert path in src/ already passes the
-- column explicitly (/api/leads, /api/hq/voice-lead, /api/test/lead), so
-- nothing depends on the default.
alter table public.leads alter column service_type drop default;

alter table public.leads
  add column if not exists size_raw text,
  add column if not exists dup_ack  boolean not null default false;

comment on column public.leads.size_raw is
  'Freeform size as the caller said it ("20x30", "20 by 30 12 tall"). Never parsed on write; a future structured width/length/height set would be new columns, not a reinterpretation of this one.';
comment on column public.leads.dup_ack is
  'Owner saw the "already in HQ" match for this phone number and chose New anyway. Stops the capture screen re-prompting.';

alter table public.leads
  add column is_draft boolean
  generated always as (name is null or service_type is null) stored;

comment on column public.leads.is_draft is
  'Generated. A lead still missing a name or a service. Drafts sort first in the Leads inbox New segment, never appear in Hot or Done, and are excluded from urgencyScore so a nameless row cannot become the next call. Mirrored in TS by isDraftLead().';

create index if not exists leads_draft_created_idx
  on public.leads (created_at desc)
  where is_draft;
