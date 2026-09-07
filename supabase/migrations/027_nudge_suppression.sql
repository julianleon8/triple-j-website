-- 027_nudge_suppression.sql
--
-- Per-entity "we already told you about this" markers, plus the indexes the
-- new nudge crons query on.
--
-- WHY THESE COLUMNS EXIST
-- Nothing in the schema records that a notification was sent about a specific
-- lead or quote. push_subscriptions stores devices; cron_runs (026) stores
-- runs. Neither is per-entity, so a daily nudge cron would re-push the same
-- stale lead every morning forever until someone touched it.
--
-- Deriving suppression from cron_runs was considered and rejected: it would
-- mean joining every candidate row against a JSON blob of past run details,
-- which is neither indexable nor correct after a partial run.
--
-- This copies the pattern migration 019 already proved on customers
-- (review_asked_at / review_followup_due_at / review_left_at + a partial
-- index): a nullable timestamp on the entity, and a partial index over exactly
-- the rows still awaiting a nudge.
--
-- CADENCE RULE: nudge at most ONCE per entity, ever. The push is the "you
-- haven't seen this yet" signal; /hq NeedsAttentionFeed remains the durable
-- list and keeps showing the row until it is worked. This matches the framing
-- already in the review-followups docstring ("best-effort nudge — not a hard
-- requirement") and makes repeat-nagging structurally impossible rather than
-- a tuning problem.

-- ── 1. Suppression markers ───────────────────────────────────────────────────
alter table public.leads
  add column if not exists nudged_at timestamptz;

alter table public.quotes
  add column if not exists stall_nudged_at timestamptz;

comment on column public.leads.nudged_at is
  'When the stale-lead cron pushed about this lead. Set once; a lead is never nudged twice. NULL = never nudged.';
comment on column public.quotes.stall_nudged_at is
  'When the quote-sweep cron pushed about this quote sitting sent-but-silent. Set once. NULL = never nudged.';

-- ── 2. Indexes for the nudge queries ─────────────────────────────────────────
-- Partial, so they stay small: the pending set is the tail of the table, and
-- rows drop out of the index permanently once nudged or once status moves on.

create index if not exists leads_nudge_pending_idx
  on public.leads (created_at)
  where status = 'new' and nudged_at is null;

create index if not exists quotes_stall_pending_idx
  on public.quotes (sent_at)
  where status = 'sent' and stall_nudged_at is null;

-- ── 3. Quote expiry index ────────────────────────────────────────────────────
-- quotes had no index on status or valid_until (021_hq_perf_indexes added only
-- customer_id, created_at). The expiry sweep scans sent quotes by valid_until
-- daily, so it gets its own partial index.
--
-- Note valid_until is nullable and has NO server-side default — QuoteWizard
-- sets +30d client-side, so any quote created outside that wizard has NULL.
-- The sweep must skip those rather than treat NULL as expired.

create index if not exists quotes_expiry_idx
  on public.quotes (valid_until)
  where status = 'sent';
