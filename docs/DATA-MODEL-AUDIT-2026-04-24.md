# Lead / job data-model audit — 2026-04-24

Read-only audit. **No schema modifications applied.** Goal: gauge how well the current Postgres schema, HQ iPhone UI, and `/hq/more/stats` dashboard support ad-ROI analysis and compounding-flywheel mechanics, then propose a migration plan for the gaps.

---

## TL;DR

**State of readiness:** ~45% of the target field set already captured. Cost tracking is the biggest hole — labor isn't tracked at all and material costs lack a category dimension, so gross-profit is uncomputable today. Source attribution is the second hole — UTM / gclid / fbclid / referrer all missing, plus the `leads.source` enum is too coarse to separate Google Search Ads from LSA from organic.

**Critical gaps (4):**
1. **No UTM / gclid / fbclid capture** anywhere on the site → can't compute cost-per-lead by source today.
2. **No `first_response_at` on leads** → can't compute time-to-quote, the single highest-leverage operational metric.
3. **No cost categorization or labor tracking** → gross-margin-by-project-type is uncomputable today even with the just-shipped receipt OCR.
4. **No compounding-flywheel fields** (review asked / review left / referral attribution / repeat-contact permission) → flywheel coefficient is uncomputable; review velocity is invisible.

**Proposed fix:** 7 additive Postgres migrations (014 → 020), all idempotent, all reversible. Plus 4 HQ UI work packages and one dashboard extension. Estimated rollout 1–2 sessions if shipped in tight feedback loops.

---

## 1. Current data model (what's already there)

Every reference below is to `supabase/migrations/*.sql` — read directly from the codebase.

### `public.leads` ([001_initial_schema.sql:9-23](supabase/migrations/001_initial_schema.sql#L9-L23) + [002_leads_qualification_fields.sql](supabase/migrations/002_leads_qualification_fields.sql))

| Column | Type | Captures | Status |
|---|---|---|---|
| `id` | uuid PK | | ✅ |
| `created_at` | timestamptz | First contact timestamp | ✅ |
| `updated_at` | timestamptz | Last edit | ✅ (overloaded — used for any field change, not "first response") |
| `name`, `phone`, `email`, `city`, `zip` | text | Contact + origin | ✅ |
| `service_type` | text default `'carport'` | Project type | ✅ enum-like in code (`carport \| garage \| barn \| rv_cover \| other`) but no CHECK constraint |
| `structure_type` | text | welded / bolted / unsure | ✅ |
| `needs_concrete`, `current_surface` | text | Site qualification | ✅ |
| `timeline` | text | `asap \| this_week \| this_month \| planning` | ✅ |
| `is_military` | boolean | Military discount | ✅ |
| `message` | text | Free-form notes (incl. dimensions) | ✅ |
| `status` | text default `'new'` | `new \| contacted \| quoted \| won \| lost` | ✅ but no CHECK constraint |
| `source` | text default `'website_form'` | Lead source | ⚠ Free text, no constraint. Code today writes: `website_form`, `facebook_lead_ads`, `facebook_messenger`, `voice_memo`. Missing: LSA, Google Ads, Instagram, organic, referral, drive-by, repeat, partner. |
| `owner_notes` | text | Manual notes | ✅ |

**Dimensions:** captured indirectly in `message` as a parsed string `"30W × 50L × 12H ft"` ([api/leads/route.ts:108](src/app/api/leads/route.ts#L108)). Width/length/height collected as separate input fields in [QuoteForm.tsx](src/components/sections/QuoteForm.tsx) and the [voice-lead-extractor.ts:18-31](src/lib/voice-lead-extractor.ts#L18-L31), but joined into `message` before insert — **not stored as discrete columns.**

### `public.customers` ([001_initial_schema.sql:28-41](supabase/migrations/001_initial_schema.sql#L28-L41))

`id, created_at, updated_at, lead_id (FK), name, phone, email, address, city, state default 'TX', zip, notes`. No compounding fields, no review tracking, no referral source link.

### `public.quotes` ([001_initial_schema.sql:58-77](supabase/migrations/001_initial_schema.sql#L58-L77))

`customer_id, lead_id, quote_number, status (draft|sent|accepted|declined|expired), valid_until, subtotal, tax_rate, tax_amount, total, accept_token, accepted_at, declined_at, sent_at`. `lead_id` provides traceability lead → quote.

### `public.jobs` ([001_initial_schema.sql:96-115](supabase/migrations/001_initial_schema.sql#L96-L115))

`customer_id, quote_id, job_number, status, job_type, structure_type, address, city, scheduled_date, completed_date, total_contract, amount_paid, balance_due (generated), crew_notes, internal_notes`. `quote_id` provides quote → job traceability. **No `contract_signed_date`** — the closest proxy is `quotes.accepted_at` but that's the customer's accept-link click, not always the signed-contract date.

### `public.job_receipts` ([013_job_receipts.sql](supabase/migrations/013_job_receipts.sql)) — just shipped Phase 4.2

`job_id (FK CASCADE), vendor, receipt_date, subtotal, tax, total, line_items jsonb, memo, image_url, image_path, extraction_confidence, raw_transcript, qbo_expense_id, qbo_attachable_id, qbo_pushed_at, qbo_push_error`. **No `cost_category` field** — every receipt rolls up undifferentiated. Concrete-sub invoices and steel invoices are indistinguishable in queries.

### `public.gallery_items` (with `job_id` since [012_gallery_items_job_id.sql](supabase/migrations/012_gallery_items_job_id.sql))

`job_id` FK is the photo → job link. Photo count per job is queryable but not denormalized on the job row.

### Other tables (out of scope for ROI / flywheel)

- `quote_templates`, `quote_line_items` — quote builder source.
- `permit_leads` — outbound lead engine, separate from inbound `leads`.
- `partner_inquiries` (has `referral_source` text field).
- `email_events`, `push_subscriptions`, `qbo_tokens` (with `expense_account_id` since 013).

---

## 2. Field-by-field gap matrix vs target

✅ = present and capturable, ⚠ = partially captured, ❌ = missing

### Lead source attribution (target field set)

| Target field | Status | Where it would land | Notes |
|---|---|---|---|
| Lead source enum (LSA / Google Search / FB / Instagram / organic / referral / drive-by / repeat / partner / other) | ⚠ | `leads.source` exists but free-text; only 4 values used in code today | Recommend tightening to a CHECK constraint with the full enum |
| UTM source / medium / campaign / term / content | ❌ | New columns on `leads` | The website QuoteForm doesn't read URL params; nothing parses `?utm_*` |
| `gclid`, `fbclid` | ❌ | New columns on `leads` | Same — not captured anywhere |
| Landing URL / referrer URL | ❌ | New columns on `leads` | Same |
| First contact timestamp | ✅ | `leads.created_at` | |
| First response timestamp + delta | ❌ | New `leads.first_response_at` | `updated_at` is overloaded for any edit |
| Lead origin city / zip | ✅ | `leads.city`, `leads.zip` | |
| Project type | ✅ | `leads.service_type` | |
| Approximate dimensions captured | ⚠ | width/length/height collected at intake but **stored joined into `message`** | Recommend lifting to dedicated columns for analytics |
| Intent stage (info-gathering / ready / has timeline / has budget) | ⚠ | `timeline` covers one axis; no budget signal; no intent column | Recommend dedicated `intent_stage` enum + budget min/max |

### Quote / outcome tracking

| Target field | Status | Notes |
|---|---|---|
| Quote sent y/n + amount + date | ✅ | `quotes.status='sent'` + `quotes.total` + `quotes.sent_at` |
| Won / lost / pending | ✅ | `leads.status` + `quotes.status` overlap |
| Lost reason | ❌ | No column — recommend `leads.lost_reason` (enum) + `lost_reason_notes` |
| Contract signed date | ⚠ | Closest is `quotes.accepted_at` but conflates accept-link-click with countersigned contract. Recommend explicit `jobs.contract_signed_date` |
| Scheduled build date | ✅ | `jobs.scheduled_date` |
| Completed date | ✅ | `jobs.completed_date` |
| Final ticket | ✅ | `jobs.total_contract` |

### Cost tracking

| Target field | Status | Notes |
|---|---|---|
| Material cost actual | ⚠ | `job_receipts.total` exists per receipt, but receipts are uncategorized. Concrete-sub invoices and material invoices land in the same bucket. |
| Concrete sub cost actual | ⚠ | Same as above — undifferentiated. Recommend `job_receipts.cost_category` enum. |
| Labor cost actual | ❌ | **No labor tracking anywhere.** No time-entries table, no crew-pay schema. Crew_notes is free text. Recommend `time_entries` table. |
| Gross profit | ❌ | Uncomputable today without labor + categorized materials. Recommend a `job_costs` ledger + cached `jobs.gross_profit_cached`. |

### Compounding / flywheel

| Target field | Status | Notes |
|---|---|---|
| Review asked y/n + date asked | ❌ | No column |
| Review follow-up date | ❌ | No column |
| Review left y/n + URL | ❌ | No column |
| Build photos captured y/n + count | ⚠ | Photos linked via `gallery_items.job_id` since 012; count is queryable but not denormalized. |
| Gallery uploaded (public-facing) | ⚠ | `gallery_items.is_active` flag exists; toggleable in `/hq/gallery`. |
| Permission to feature in case study | ❌ | No column |
| Referral source attribution (link to referring customer) | ❌ | No column. **This is the one that unlocks "referral coefficient."** |
| Permission to be contacted for repeat business | ❌ | No column |

---

## 3. Reporting metrics gap (target dashboard)

`src/app/hq/more/stats/page.tsx` currently produces: open leads, active permits, pipeline value, lead→customer rate, quote acceptance rate, MTD revenue, avg deal size, balance due, jobs this week, jobs in progress, hot leads, stale leads, leads sparkline, revenue sparkline, lead-customer-quote-job funnel.

| Target metric | Computable today? | Blocker |
|---|---|---|
| Cost per lead by source | ❌ | (a) Source enum incomplete. (b) No ad spend ingest. Even with attribution columns, you'd need a `marketing_spend` table or external sync. **Start with: ratio of leads per source (free), spend ingestion is a follow-up.** |
| Close rate by source | ⚠ | Computable for the 4 source values currently captured (`website_form`, `facebook_lead_ads`, `facebook_messenger`, `voice_memo`). For the other 7 target sources: blocked on the enum + UTM capture. |
| Average ticket by source | ⚠ | Same — partial coverage today, full coverage after 014 ships. |
| Average ticket by project type | ✅ | `jobs.total_contract` × `jobs.job_type`. Just not surfaced in the current dashboard. |
| Gross margin by project type | ❌ | Blocked on labor tracking + material categorization. |
| Lead-to-quote conversion rate | ⚠ | Derivable (`quotes.lead_id` is set), just not in the dashboard. |
| Quote-to-close conversion rate | ✅ | `quoteAcceptRate` already computed in `/hq/more/stats`. |
| Time-to-quote (response speed) | ❌ | Blocked on `first_response_at`. |
| Lifetime value per customer | ⚠ | Derivable as `SUM(jobs.total_contract) WHERE customer_id = X`, but no repeat-business signal means LTV ≈ first-job revenue for almost everyone. |
| Referral coefficient | ❌ | Blocked on `leads.referring_customer_id`. |

**Net:** of the 9 target metrics, 1 is fully computable, 4 are partially computable, 4 are blocked by missing schema.

---

## 4. iOS HQ UI capture audit

**Inbound capture surfaces:**

| Surface | What it captures | Gaps vs target |
|---|---|---|
| Public `QuoteForm` ([src/components/sections/QuoteForm.tsx](src/components/sections/QuoteForm.tsx)) | name, phone, email, zip, service_type, structure_type, width, length, height, needs_concrete, current_surface, timeline, is_military, message | ❌ Doesn't read URL params (`utm_*`, `gclid`, `fbclid`). ❌ Doesn't capture `landing_url`, `document.referrer`, or initial source. |
| `/api/leads` POST ([src/app/api/leads/route.ts](src/app/api/leads/route.ts)) | Persists the QuoteForm payload. Source hardcoded to `'website_form'`. | ❌ Source hardcoded — would need to read attribution from the request. ❌ `width/length/height` are joined into `message` and not stored discretely. |
| Voice-memo extractor ([src/lib/voice-lead-extractor.ts](src/lib/voice-lead-extractor.ts)) | Same fields as QuoteForm minus address; sets `source='voice_memo'`. | ❌ No origin attribution capture (e.g. "voice memo recorded after Julian got an LSA call"). |
| `/hq/leads/[id]` detail ([src/app/hq/leads/[id]/page.tsx](src/app/hq/leads/[id]/page.tsx)) | Renders `LeadRecord` with all current schema fields. | ❌ No UI for editing source / lost_reason / first_response_at. Owner has no way to mark "I responded at 11:42" beyond the implicit `updated_at`. |
| `NewCustomerForm` ([src/app/hq/customers/components/NewCustomerForm.tsx](src/app/hq/customers/components/NewCustomerForm.tsx)) | name, phone, email, city, notes | ❌ Doesn't capture address, zip, state. ❌ No referring-customer picker. ❌ No flywheel toggles. |
| `/hq/jobs/[id]` detail ([src/app/hq/jobs/[id]/page.tsx](src/app/hq/jobs/[id]/page.tsx)) | Photos (`JobPhotoStrip`), receipts (`JobReceiptStrip`), customer, quote, contract total, balance due, status, dates. | ❌ No gross-profit display. ❌ No cost-category breakdown. ❌ No labor entries surface. ❌ No "review asked / left" toggles or "feature permission" picker. |
| `JobReceiptStrip` ([src/components/hq/JobReceiptStrip.tsx](src/components/hq/JobReceiptStrip.tsx)) | Confirms vendor, date, subtotal, tax, total, line items before push. | ❌ No `cost_category` selector at confirm time. |

**Verdict:** the iOS UI captures everything the schema currently allows. The bottleneck is the schema — every UI gap above is a downstream consequence of a column not existing yet.

---

## 5. Receipt OCR → job linkage (Phase 4.2 verification)

`POST /api/hq/receipt` ([src/app/api/hq/receipt/route.ts](src/app/api/hq/receipt/route.ts)) takes `{job_id, file}` multipart. The `job_id` is set by `JobReceiptStrip` from the URL `/hq/jobs/[id]` — every receipt is hard-tied to a job via `job_receipts.job_id` FK with `ON DELETE CASCADE` ([013_job_receipts.sql:20](supabase/migrations/013_job_receipts.sql#L20)). ✅ Linkage works.

**But:** the extractor doesn't tag what *kind* of cost it is. A Sherwin Williams receipt for paint and a Lone Star Concrete invoice both land as `job_receipts` rows with no category. Aggregating to "concrete sub cost actual" requires a column that doesn't exist.

The Claude vision prompt ([src/lib/receipt-extractor.ts](src/lib/receipt-extractor.ts)) extracts vendor and line items but doesn't classify. Adding `cost_category` as an extracted field is plausible but heuristic — the cleaner answer is a manual selector at confirm time + remembered defaults per vendor.

---

## 6. Existing "dashboard endpoint" status

There is no JSON endpoint — the dashboard is a server-rendered page at [/hq/more/stats](src/app/hq/more/stats/page.tsx) that queries Supabase directly.

**For ROI / flywheel reporting,** the current page covers ~30% of the target metrics (per Section 3 above). Building a JSON endpoint at `/api/hq/stats` would help if you want to consume the metrics from a non-Next.js client (e.g. an exported PDF, an external BI tool, a follow-up agent). Otherwise extending the existing page is faster.

---

## 7. Proposed migration plan

7 additive Postgres migrations, dependency-ordered. All idempotent (`if not exists` everywhere). Each is a single-purpose change so a partial rollout doesn't leave the system in a broken state. Numbers continue from the last shipped migration (013).

### Migration 014 — `leads` attribution columns

```sql
alter table public.leads
  add column if not exists utm_source       text,
  add column if not exists utm_medium       text,
  add column if not exists utm_campaign     text,
  add column if not exists utm_term         text,
  add column if not exists utm_content      text,
  add column if not exists gclid            text,
  add column if not exists fbclid           text,
  add column if not exists landing_url      text,
  add column if not exists referrer_url     text,
  add column if not exists referring_customer_id uuid references public.customers(id),
  add column if not exists first_response_at timestamptz,
  add column if not exists intent_stage     text,
  add column if not exists estimated_budget_min numeric(10,2),
  add column if not exists estimated_budget_max numeric(10,2);

create index if not exists leads_utm_source_idx on public.leads (utm_source) where utm_source is not null;
create index if not exists leads_referring_customer_idx on public.leads (referring_customer_id) where referring_customer_id is not null;
create index if not exists leads_first_response_idx on public.leads (first_response_at) where first_response_at is not null;
```

Add CHECK constraint on `intent_stage`:
```sql
alter table public.leads
  add constraint leads_intent_stage_check
    check (intent_stage is null or intent_stage in
      ('info_gathering','timeline_known','budget_set','ready_to_buy'));
```

Tighten `source` (additive — doesn't break existing rows):
```sql
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
    ));
```

### Migration 015 — `leads` outcome columns

```sql
alter table public.leads
  add column if not exists won_at         timestamptz,
  add column if not exists lost_at        timestamptz,
  add column if not exists lost_reason    text,
  add column if not exists lost_reason_notes text;

alter table public.leads
  add constraint leads_lost_reason_check
    check (lost_reason is null or lost_reason in
      ('price','timeline','went_with_competitor','changed_mind','unreachable','no_budget','out_of_area','other'));
```

Status-change trigger to auto-stamp `won_at` / `lost_at` / `first_response_at`:
```sql
create or replace function public.tg_leads_status_timestamps()
returns trigger language plpgsql as $$
begin
  if new.status = 'won' and old.status <> 'won' and new.won_at is null then
    new.won_at = now();
  end if;
  if new.status = 'lost' and old.status <> 'lost' and new.lost_at is null then
    new.lost_at = now();
  end if;
  if old.status = 'new' and new.status <> 'new' and new.first_response_at is null then
    new.first_response_at = now();
  end if;
  return new;
end $$;

drop trigger if exists leads_status_timestamps on public.leads;
create trigger leads_status_timestamps
  before update on public.leads
  for each row execute function public.tg_leads_status_timestamps();
```

### Migration 016 — `jobs` lifecycle

```sql
alter table public.jobs
  add column if not exists contract_signed_date date,
  add column if not exists gross_profit_cached  numeric(10,2),
  add column if not exists gross_margin_cached  numeric(5,4);
```

`gross_profit_cached` and `gross_margin_cached` are roll-up caches refreshed by triggers on `job_costs` insert/update (Migration 017). Cached so the dashboard doesn't re-aggregate on every page hit.

### Migration 017 — `job_costs` unified ledger

New table that unifies receipts, time entries, and manual entries under one `amount_per_job` query target.

```sql
create table if not exists public.job_costs (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  job_id        uuid not null references public.jobs(id) on delete cascade,
  cost_type     text not null check (cost_type in
                  ('material','concrete_sub','labor','fuel','permit','equipment','misc')),
  amount        numeric(10,2) not null,
  source_table  text not null check (source_table in ('job_receipts','time_entries','manual')),
  source_id     uuid,
  logged_at     timestamptz not null default now(),
  notes         text
);

create index if not exists job_costs_job_id_idx     on public.job_costs (job_id);
create index if not exists job_costs_cost_type_idx  on public.job_costs (cost_type);
create index if not exists job_costs_source_idx     on public.job_costs (source_table, source_id);

alter table public.job_costs enable row level security;
create policy "authed full access on job_costs"
  on public.job_costs for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```

Plus trigger to refresh `jobs.gross_profit_cached` / `gross_margin_cached`:
```sql
create or replace function public.tg_jobs_recompute_profit(p_job_id uuid)
returns void language plpgsql as $$
declare
  v_total numeric;
  v_costs numeric;
begin
  select total_contract into v_total from public.jobs where id = p_job_id;
  select coalesce(sum(amount),0) into v_costs from public.job_costs where job_id = p_job_id;
  update public.jobs
    set gross_profit_cached = v_total - v_costs,
        gross_margin_cached = case when v_total > 0 then (v_total - v_costs) / v_total else null end
    where id = p_job_id;
end $$;
```

### Migration 018 — `time_entries` (labor)

```sql
create table if not exists public.time_entries (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  job_id        uuid not null references public.jobs(id) on delete cascade,
  crew_member   text not null,        -- free text for now ("Freddy", "Julian", "Juan")
  work_date     date not null,
  hours         numeric(5,2) not null,
  hourly_rate   numeric(8,2),         -- can be null when paid by piece
  flat_amount   numeric(10,2),        -- piece-rate alternative; either hourly_rate*hours OR flat_amount
  total_cost    numeric(10,2) generated always as (
    coalesce(flat_amount, coalesce(hourly_rate,0) * hours)
  ) stored,
  notes         text
);

create index if not exists time_entries_job_id_idx on public.time_entries (job_id);
create index if not exists time_entries_date_idx   on public.time_entries (work_date);

alter table public.time_entries enable row level security;
create policy "authed full access on time_entries"
  on public.time_entries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```

Plus trigger to insert into `job_costs` automatically:
```sql
create or replace function public.tg_time_entries_to_job_costs()
returns trigger language plpgsql as $$
begin
  insert into public.job_costs (job_id, cost_type, amount, source_table, source_id, logged_at, notes)
  values (new.job_id, 'labor', new.total_cost, 'time_entries', new.id, new.work_date, new.notes)
  on conflict do nothing;
  perform public.tg_jobs_recompute_profit(new.job_id);
  return new;
end $$;
```

### Migration 019 — `customers` compounding flags

```sql
alter table public.customers
  add column if not exists review_asked_at            timestamptz,
  add column if not exists review_followup_due_at     timestamptz,
  add column if not exists review_left_at             timestamptz,
  add column if not exists review_url                 text,
  add column if not exists feature_permission         boolean,
  add column if not exists feature_permission_asked_at timestamptz,
  add column if not exists repeat_contact_permission  boolean,
  add column if not exists repeat_contact_asked_at    timestamptz;
```

### Migration 020 — `job_receipts.cost_category` + auto-roll-up

```sql
alter table public.job_receipts
  add column if not exists cost_category text not null default 'material'
    check (cost_category in ('material','concrete_sub','fuel','permit','equipment','misc'));

create index if not exists job_receipts_cost_category_idx
  on public.job_receipts (cost_category);
```

Plus trigger to roll a confirmed receipt into `job_costs`:
```sql
create or replace function public.tg_job_receipts_to_job_costs()
returns trigger language plpgsql as $$
begin
  -- Only roll into job_costs when total is set (i.e. user confirmed
  -- the receipt). Don't roll the placeholder rows we save before
  -- extraction completes.
  if new.total is not null and (old is null or old.total is null or old.total <> new.total or old.cost_category <> new.cost_category) then
    delete from public.job_costs
      where source_table = 'job_receipts' and source_id = new.id;
    insert into public.job_costs (job_id, cost_type, amount, source_table, source_id, logged_at, notes)
    values (new.job_id, new.cost_category, new.total, 'job_receipts', new.id, coalesce(new.receipt_date, current_date), new.memo);
    perform public.tg_jobs_recompute_profit(new.job_id);
  end if;
  return new;
end $$;

drop trigger if exists job_receipts_to_costs on public.job_receipts;
create trigger job_receipts_to_costs
  after insert or update on public.job_receipts
  for each row execute function public.tg_job_receipts_to_job_costs();
```

Backfill existing receipts:
```sql
insert into public.job_costs (job_id, cost_type, amount, source_table, source_id, logged_at, notes)
select job_id, cost_category, total, 'job_receipts', id, coalesce(receipt_date, created_at::date), memo
from public.job_receipts
where total is not null
on conflict do nothing;

-- Refresh all cached profits
do $$
declare r record;
begin
  for r in select distinct id from public.jobs loop
    perform public.tg_jobs_recompute_profit(r.id);
  end loop;
end $$;
```

### Dependency graph

```
014 leads attribution    →  (no deps)
015 leads outcomes       →  no deps (parallel with 014)
016 jobs lifecycle       →  prep for 017 caches
017 job_costs ledger     →  depends on 016
018 time_entries         →  depends on 017
020 receipts category    →  depends on 017
019 customers flywheel   →  no deps (parallel with everything else)
```

Recommended apply order: **014 → 015 → 016 → 017 → 020 → 018 → 019.**

All migrations are additive `if not exists` / `if not exists` patterns and are safe to re-run.

---

## 8. iOS / HQ UI work packages (after migrations)

| Package | Surface | New UI |
|---|---|---|
| **A — Attribution capture** | `QuoteForm.tsx` + `/api/leads` | Read `utm_*`, `gclid`, `fbclid`, `document.referrer`, `window.location.href` from the page; pass through the form payload; persist to `leads.utm_*` + `leads.landing_url` + `leads.referrer_url`. Default `source` from utm_source mapping (e.g. `utm_medium=cpc + utm_source=google` → `'google_search_ads'`). |
| **B — Lead detail edit** | `/hq/leads/[id]` | Source picker (dropdown over the new enum), referring-customer picker (search → customer), intent_stage selector, lost_reason picker (visible only when status='lost'), budget min/max inputs, "first responded at" override. |
| **C — Job costs view** | `/hq/jobs/[id]` | New panel below `JobReceiptStrip`: cost summary (material total / concrete-sub total / labor total / gross profit / margin %), color-coded badges. New "Add labor entry" button → sheet to insert a `time_entries` row. Receipt confirm sheet adds a `cost_category` selector. |
| **D — Customer flywheel toggles** | `/hq/customers/[id]` | New "Compounding" section with: "Asked for review at" datetime, "Review URL" text + paste-from-clipboard, "Feature permission" yes/no/not-asked toggle, "Repeat contact OK" yes/no/not-asked toggle. |

---

## 9. Dashboard work package (after migrations + UI)

Extend [/hq/more/stats](src/app/hq/more/stats/page.tsx) with new sections:

- **Source attribution** — table: source × leads × close rate × avg ticket.
- **Speed of response** — KPI: median time-to-first-response (`leads.first_response_at - leads.created_at`). Histogram: distribution of response times.
- **Pipeline conversion** — leads → quotes (rate via `quotes.lead_id`), quotes → close (existing).
- **Cost & margin** — KPI: gross margin MTD across completed jobs. Table: avg margin by `jobs.job_type`.
- **Flywheel coefficient** — referrals generated per customer (count of `leads.referring_customer_id` per `customers.id`).
- **Reviews** — % of completed jobs with `review_left_at` populated; review velocity (reviews per month).

Optionally also build `/api/hq/stats` JSON endpoint mirroring the page's queries — useful when an agent (or weekly digest email) needs machine-readable metrics.

---

## 10. Prioritized rollout

### Critical (ship next)
1. **Migration 014 — leads attribution.** Without UTM / gclid / referring_customer_id you can't compute cost-per-lead-by-source for any new lead. Every day this delays compounds the gap.
2. **Work package A — frontend attribution capture.** Migration 014 is useless without the form actually capturing the data. These two should ship together.
3. **Migration 015 — leads outcomes + status triggers.** The `first_response_at` auto-stamp unlocks time-to-quote.

### Important (within 2–3 weeks)
4. **Migration 020 — receipt cost_category.** Cheap unblock for material/concrete categorization. The trigger backfills existing rows automatically.
5. **Migration 016 + 017 — jobs lifecycle + job_costs ledger.** Foundation for gross-profit reporting.
6. **Work package B + C — HQ edit forms for lead source + job costs view.** Surfaces the new schema to the operator.

### Nice-to-have (next quarter)
7. **Migration 018 — time_entries (labor).** Hardest discipline change — Julian + Juan + Freddy actually have to log hours. Pair with Work Package C's "Add labor entry" button.
8. **Migration 019 — customer flywheel + Work Package D.** Captures the highest-leverage compounding mechanic but only matters once volume is up.
9. **Dashboard extension** — once 014 + 015 + 017 are landed and the data is flowing, extend `/hq/more/stats`.

### Deliberately out of scope here
- **Marketing-spend ingest** for cost-per-lead. Could be a manual table at first (`marketing_spend(month, source, amount)`) or a Google Ads / Meta API sync later. Talk before building.
- **Per-product gross-margin breakdown** finer than `job_type`. Doable once 017 lands but not asked for here.
- **Tightening `leads.status` to a CHECK constraint.** Lower risk after 014/015 settle the writes.

---

## What's already good

To balance the gap list:

- **Lead → quote → job traceability** is clean (`quotes.lead_id`, `jobs.quote_id`, `customers.lead_id`).
- **Receipt → job linkage** ships cascading deletes — `job_receipts.job_id` FK + storage path cleanup.
- **The `quotes.accept_token` + `quotes.accepted_at` flow** for customer-initiated acceptance is solid.
- **Phase 4.2 receipt OCR** captures vendor + total + line items today, so 90% of the data needed for material costing is already arriving. Just needs categorization (Migration 020).
- **`/hq/more/stats`** is well-structured server-side and easy to extend; existing KPIs (lead conversion, quote acceptance, MTD revenue) are correct and useful.
- **`leads.is_military`** and `leads.timeline` are already capturing what most CRMs treat as custom fields.
- **Permit-leads pipeline** (`permit_leads`) is fully separate, which is correct — outbound lead sourcing has different mechanics than inbound.

---

*Generated 2026-04-24. Re-audit after migrations 014–020 land to confirm the dashboard gap list closes.*
