-- Phase 4.2 — receipt OCR + QBO push
--
-- One row per receipt photo Julian shoots in /hq/jobs/[id] →
-- Receipt. Claude vision extracts vendor / date / total / line items;
-- the row is saved local-first (qbo_expense_id null), then pushed to
-- QuickBooks Online as a Purchase. If push fails, the row stays
-- pending; /hq/settings/quickbooks surfaces a "N receipts pending"
-- batch-retry button.
--
-- Storage layout: image lives in the existing 'gallery' bucket under
-- jobs/{job_id}/receipts/{timestamp}.jpg. We keep them in 'gallery'
-- (vs creating a new bucket) because the bucket already has the
-- right RLS for /hq writes and we don't want to manage two buckets.
-- Receipts are PRIVATE — they never appear in any public list.

create table if not exists public.job_receipts (
  id                       uuid primary key default uuid_generate_v4(),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  job_id                   uuid not null references public.jobs(id) on delete cascade,
  -- Extracted fields (editable on the confirm sheet before push) --
  vendor                   text,
  receipt_date             date,
  subtotal                 numeric(10,2),
  tax                      numeric(10,2),
  total                    numeric(10,2),
  line_items               jsonb default '[]'::jsonb,
  memo                     text,
  -- Audit / extraction context --
  extraction_confidence    numeric(3,2),    -- 0..1; <0.7 → confirm sheet shows a "double-check" warning
  raw_transcript           text,            -- whatever Claude returned, for debugging
  image_url                text not null,
  image_path               text not null,   -- storage path so we can delete on row delete
  -- QBO push state --
  qbo_expense_id           text,            -- QBO Purchase.Id once pushed
  qbo_attachable_id        text,            -- QBO Attachable.Id (the receipt image attached to the expense)
  qbo_pushed_at            timestamptz,
  qbo_push_error           text             -- last error if push failed; cleared on retry success
);

create index if not exists job_receipts_job_id_idx
  on public.job_receipts (job_id);

create index if not exists job_receipts_qbo_pending_idx
  on public.job_receipts (job_id)
  where qbo_pushed_at is null;

-- updated_at auto-trigger so /hq UI can show "edited 2m ago"
create or replace function public.tg_job_receipts_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists job_receipts_touch_updated_at on public.job_receipts;
create trigger job_receipts_touch_updated_at
  before update on public.job_receipts
  for each row execute function public.tg_job_receipts_touch_updated_at();

alter table public.job_receipts enable row level security;

create policy "authed full access on job_receipts"
  on public.job_receipts
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Configurable QBO Account ID for receipt push --
-- Single account by design (Decisions.md 2026-04-24, Phase 4.2): every
-- receipt posts to the same chart-of-accounts entry until Julian asks
-- for per-receipt categorization. /hq/settings/quickbooks lets him pick
-- which account once.
alter table public.qbo_tokens
  add column if not exists expense_account_id  text;

alter table public.qbo_tokens
  add column if not exists expense_account_name text; -- cached for display so we don't re-query every page

comment on column public.job_receipts.qbo_expense_id is
  'QBO Purchase.Id once the receipt has been pushed to QuickBooks. NULL means pending push.';

comment on column public.qbo_tokens.expense_account_id is
  'QBO Account.Id the Phase 4.2 receipt OCR flow posts every Purchase to. Configured once via /hq/settings/quickbooks.';
