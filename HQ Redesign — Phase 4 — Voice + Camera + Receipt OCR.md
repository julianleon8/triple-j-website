# HQ Redesign — Phase 4 — Voice + Camera + Receipt OCR

_One of 5 phased plans for the full HQ iPhone PWA redesign. Depends on Phases 1–3 (design foundation, screens, inputs, haptics). Sibling plans: Phases 1–3 (design), Phase 5 (Twilio SMS + Offline Queue + Push Categories)._

_Branch: `claude/redesign-iphone-pwa-app-5V1Cn` (push to main authorized; Vercel auto-deploys)._

---

## Read first
- `CLAUDE.md` + `AGENTS.md` (this is NOT the Next.js you know — read relevant node_modules/next/dist/docs/ guides before touching App Router patterns)
- `claude-api` skill (triggered here: we're adding Anthropic SDK calls for audio transcription + vision. Follow its prompt-caching + model guidance.)
- Phases 1–3 plans (design language + shared primitives)
- `src/lib/permit-extractor.ts` — existing Anthropic SDK pattern in this repo (permit PDFs). Model to match for prompt style.

## Context
Phases 1–3 made HQ feel like a 2026 iPhone app. This phase adds the **three Anthropic-API-powered field superpowers** that turn it into a real operating tool for Julian + eventually Freddy:

1. **Voice memo → lead** — hold `+` top-right, speak, release → Claude transcribes + extracts lead fields + creates the lead.
2. **Camera-first job logging** — big Camera button on Job detail → photo → auto-tags to job + geo + timestamp → uploads to `gallery_items` → logs a progress entry.
3. **Receipt OCR → QuickBooks** — on a job, tap Receipt → photo of receipt → Claude vision extracts vendor + amount + line items → user confirms → posts to QBO as Expense, attaches image, tags to the job's material cost so real margins show in HQ automatically.

All three use the Anthropic API. Costs: voice memo ~$0.01–0.05 per memo, receipt OCR ~$0.02 per receipt, camera logging is Supabase-only (no API). Model: Sonnet 4.6 (`claude-sonnet-4-6`) for all three — good cost/quality balance for short audio + single-image vision.

## Scope (this phase)
1. **Voice memo capture + transcription** — client MediaRecorder → upload → server-side Anthropic audio transcription → structured lead extraction → insert.
2. **Camera-first job logging** — Camera button on Job detail → iOS `<input type="file" accept="image/*" capture="environment">` → pre-process (EXIF rotate + compression) → Supabase Storage → `gallery_items` + `job_photos_log` (new table).
3. **Receipt OCR + QBO push** — Receipt button on Job detail → photo → vision extraction → confirmation sheet → POST to `qbo_tokens`-authenticated QBO Expense → attach image.

## File-level changes

### New files
- `src/lib/hq/audio-recorder.ts` — small client wrapper around `MediaRecorder` with `start()` / `stop()` / `onData(blob)` / visual level meter hook for hold-UI.
- `src/lib/hq/image-prep.ts` — client-side: read file → `createImageBitmap` → rotate by EXIF → resize (max 2048px long edge) → compress to JPEG 85%. Used by camera + receipt pipelines.
- `src/components/hq/HoldToRecordButton.tsx` — the `+` button in the header gains a long-press state. Hold 500ms → recording indicator replaces the popover trigger → release → uploads. Haptic `tap` on start, `success` on release, `error` on short press (user intent was popover). Inside the popover menu, the original "+ Create…" options still live.
- `src/app/api/hq/voice-lead/route.ts` — POST endpoint. Accepts `multipart/form-data` audio. Calls Anthropic (document input type for audio — see `claude-api` skill for current patterns) with a system prompt: "Extract a metal-building lead from this voicemail. Return JSON: `{name, phone, email?, zip, city?, service_type, structure_type, timeline, message}`. Fill only what's said; leave others null." Validates with Zod (reuse `/api/leads` schema). Inserts into `leads` with `source='voice_memo'`.
- `src/app/api/hq/job-photo/route.ts` — POST. Accepts image + `job_id`. Inserts into `gallery_items` (`job_id`, `image_url` after Supabase Storage upload) and `job_photos_log` (new table: `id, job_id, uploaded_at, uploaded_by, lat?, lng?, phase?`). Returns the new row.
- `src/app/api/hq/receipt/route.ts` — POST. Accepts image + optional `job_id`. Calls Anthropic vision with a structured-output prompt: "Extract from this receipt. Return JSON: `{vendor, date (ISO), subtotal, tax, total, line_items: [{description, qty?, unit_price?, total}], confidence: number}`." Does NOT post to QBO yet — returns extracted fields for the user to confirm in the app.
- `src/app/api/hq/receipt/confirm/route.ts` — POST. Accepts `{job_id, receipt_id, extracted_data}`. Inserts into `job_receipts` (new table). Calls QBO Expense create via `src/lib/qbo.ts` (extend for the Expense endpoint). Attaches image as Attachable. Returns QBO expense id + success.
- `src/app/hq/jobs/[id]/_components/CameraStrip.tsx` — client component on the Job detail page. Three buttons: **Photo** · **Receipt** · **Note** (note stub is Phase 5 notes table). Each opens the respective capture pipeline. Shows recent uploads as a horizontal strip.
- `supabase/migrations/012_job_photos_log.sql` — new table `job_photos_log` + RLS.
- `supabase/migrations/013_job_receipts.sql` — new table `job_receipts` + RLS.
- `supabase/migrations/014_leads_source_voice_memo.sql` — extend `leads.source` enum to include `'voice_memo'`.

### Modified files
- `src/components/hq/CreatePopover.tsx` (Phase 1) — merge `HoldToRecordButton` logic into the `+` button state machine. Short press = popover. Long press (500ms) = voice memo capture.
- `src/app/hq/jobs/[id]/page.tsx` (Phase 2) — include `<CameraStrip />` above the photos grid.
- `src/lib/qbo.ts` — extend with `createExpense({vendor, amount, date, lines, jobRef?, imageUrl?})` and attachable upload helper. Use existing token refresh logic.
- `src/app/hq/settings/quickbooks/page.tsx` — add connection-health section: last Expense push + count. Already has the re-auth link.
- `.env.example` — already has `ANTHROPIC_API_KEY`; no new vars needed unless we add a separate Voice model id.

### Database schema additions
```sql
-- 012_job_photos_log.sql
create table public.job_photos_log (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  gallery_item_id uuid references public.gallery_items(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid references auth.users(id),
  phase text,           -- 'foundation' | 'framing' | 'panels' | 'complete' | null
  lat double precision, -- optional geo
  lng double precision,
  notes text
);
alter table public.job_photos_log enable row level security;
create policy "authed full access" on public.job_photos_log for all using (auth.role() = 'authenticated');

-- 013_job_receipts.sql
create table public.job_receipts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  vendor text,
  receipt_date date,
  subtotal numeric(10,2),
  tax numeric(10,2),
  total numeric(10,2),
  line_items jsonb default '[]',
  image_url text,
  qbo_expense_id text,
  qbo_pushed_at timestamptz,
  extraction_confidence numeric(3,2)
);
alter table public.job_receipts enable row level security;
create policy "authed full access" on public.job_receipts for all using (auth.role() = 'authenticated');

-- 014_leads_source_voice_memo.sql
-- Add 'voice_memo' to the source check constraint
alter table public.leads drop constraint if exists leads_source_check;
alter table public.leads add constraint leads_source_check
  check (source in ('website_form','phone','referral','google','voice_memo','fb_messenger','fb_lead_ad'));
```

## Anthropic API patterns (follow the `claude-api` skill)
- **Model**: `claude-sonnet-4-6` for voice + vision.
- **Prompt caching**: cache the system prompt for each of the three endpoints (extraction schema + examples) since it's identical across calls. ~70% cost reduction after first call.
- **Structured output**: use JSON mode / schema enforcement. Validate with Zod on receipt before DB insert — hallucination is real, especially on low-light receipts.
- **Confidence threshold**: if `confidence < 0.7`, show a "Re-take photo?" warning but let the user proceed.
- **Error handling**: all three endpoints return `{ok: false, error, code}` on fail. Client surfaces toast + keeps the photo in local state so the user can retry without re-shooting.

## Reused utilities (from audit + prior phases)
- `src/lib/supabase/admin.ts` — getAdminClient for inserts (bypasses RLS for service-role writes).
- `src/lib/supabase/storage.ts` (create or reuse existing gallery upload path) — image storage.
- `src/lib/qbo.ts` — extend, don't rewrite. OAuth + token refresh already works (audit confirmed).
- `src/components/hq/Sheet.tsx` — receipt-confirmation UI slides up as a sheet with the extracted fields editable before confirming.
- `src/components/hq/ui/Input.tsx` (Phase 2) — the confirmation form uses these.
- `src/lib/hq/haptics.ts` (Phase 1) — `success()` on upload, `warn()` on low-confidence OCR, `error()` on failure.

## Verification
1. Hold `+` button 1s → recording pill appears with level meter. Release → lead appears in `/hq/leads` within ~3s with populated fields. Test a memo like "Hey this is John Smith, 254-555-1234, I need a 30 by 50 carport in Killeen, as soon as possible."
2. On a job, tap Camera → iOS sheet offers Photo Library / Take Photo. Shot appears in the strip within 5s. Verify `gallery_items` + `job_photos_log` both populated.
3. On a job, tap Receipt → shoot a physical Lowe's / MetalMax receipt → confirmation sheet shows vendor + amount + line items. Confidence badge visible. Edit a line, confirm → appears in QBO under Expenses with image attached. Verify `job_receipts.qbo_expense_id` populated.
4. Low-confidence case: snap a blurry receipt. App shows warning + lets user retake without losing the photo.
5. Offline: all three actions queue the photo/audio in IndexedDB if offline (Phase 5 provides this). For now, surface a clear "No signal — try again later" toast.
6. QBO disconnected: receipt confirmation stores the receipt in `job_receipts` with `qbo_expense_id=null`. Settings page shows the unqueued count.
7. `npm run typecheck && npm run build` pass. Dark-mode verified.

## Anthropic cost sanity check
- Voice memo: ~30s audio, ~$0.02/call. Budget 100 memos/mo = $2.
- Receipt OCR: ~$0.02/image. Budget 200 receipts/mo = $4.
- Total: ~$6/mo at expected volume. Low.

## Commit + deploy
Suggested commits: `db: job_photos_log + job_receipts + voice_memo source` → `hq: hold-to-record voice memo → lead (anthropic audio)` → `hq: camera-first job photos` → `hq: receipt OCR + QBO expense push`. Push to `main`.
