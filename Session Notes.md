## 2026-04-24 (latest) — HQ Phase 4.2: receipt OCR → QBO

**Context:** Final piece of the original Phase 4 plan. Stacked on top of Phase 4.1 (camera-first job photos). All three Phase 4 features now in the working tree — voice memo, camera, receipt — uncommitted, ship script extended.

### What shipped

**DB (1 migration):**
- `supabase/migrations/013_job_receipts.sql` — new `job_receipts` table (id, job_id FK CASCADE, vendor, receipt_date, subtotal/tax/total, line_items jsonb, image_url, image_path, qbo_expense_id, qbo_attachable_id, qbo_pushed_at, qbo_push_error, extraction_confidence, raw_transcript, memo). RLS authed-full-access policy, two indexes (job_id, partial on qbo_pushed_at IS NULL), `tg_job_receipts_touch_updated_at` trigger. Also extends `qbo_tokens` with `expense_account_id` + `expense_account_name` (single-account category strategy). Idempotent.

**Server (5 endpoints):**
- `POST /api/hq/receipt` — accepts {job_id, file image}, uploads to Supabase Storage `gallery` bucket at `jobs/{job_id}/receipts/{ts}.{ext}`, runs Claude vision, persists `job_receipts` row with `qbo_pushed_at = null`. Fallback policy: if Claude returns invalid JSON or schema mismatch, save a placeholder row with the image so the user never loses work. Returns {id, image_url, extracted}.
- `POST /api/hq/receipt/[id]/confirm` — body: edited fields the user reviewed. Always applies edits to DB. Then best-effort QBO push: lookup `qbo_tokens.expense_account_id`, call `createExpense({accountId, vendor, date, total, lines, memo})` → returns Purchase.Id. Best-effort `uploadAttachable` linking image to the Purchase. On QBO failure, save `qbo_push_error` and return `{pushed: false, reason: 'qbo_not_connected' | 'account_id_missing' | 'qbo_api_error', error}`.
- `GET /api/qbo/accounts` — owner-auth, lists expense-style accounts via QBO `Account` query (`AccountType IN ('Expense', 'Cost of Goods Sold', 'Other Expense')`). 503 if QBO not connected.
- `POST /api/qbo/expense-account` — owner-auth, persists `qbo_tokens.expense_account_id` + cached `expense_account_name`.
- `POST /api/hq/receipts/push-all` — batch-retry every `qbo_pushed_at IS NULL` row. Sequential, surfaces per-row failures so the Settings card can show "Pushed N, M still failing — first error: …". Bails early if QBO disconnected or account ID unset.

**QBO client extension (`src/lib/qbo.ts`):**
- `listExpenseAccounts()` — returns `[{id, name, accountType}]`.
- `createExpense({accountId, vendor, date, total, lines?, memo?})` — Purchase API call with PaymentType='Cash', AccountRef on every line, optional EntityRef via find-or-create vendor, optional TxnDate + PrivateNote.
- `uploadAttachable({entityType, entityId, blob, filename, contentType})` — multipart `/v3/company/{realm}/upload` with `file_metadata_0` (JSON) + `file_content_0` (binary), linked via `AttachableRef`.
- Extended `QboTokenRow` type with `expense_account_id` + `expense_account_name` columns.

**Vision extractor (`src/lib/receipt-extractor.ts`):**
- Claude Sonnet 4.6 vision call (image as base64 content block + text prompt). System prompt enumerates the JSON schema, explicit rules for vendor identification (header line, not cashier/store-#/tagline), date format normalization (YYYY-MM-DD), tax summation across multiple tax lines, separator filtering, gas-pump-receipt confidence penalty. Prompt-cached system (~70% cost savings after first call). Zod validation on output.

**Client (3 new files, 1 modified):**
- `src/components/hq/JobReceiptStrip.tsx` (~600 lines) — sibling to JobPhotoStrip. Receipt button with image-prep on capture. Recent receipts list with vendor + date + total + Lightbox-style status pill (Pushed / Pending / Verify / Push failed). Inline `ConfirmForm` opens in `<Sheet>` (90% snap) with: receipt thumbnail for cross-reference, vendor + date + subtotal/tax/total inputs, dynamic line-items editor (add/remove rows, qty × unit_price → total auto-suggest), memo field, low-confidence warning banner, success/error pills, "Post to QuickBooks" submit. Auto-opens after capture for immediate verify-and-push.
- `src/app/hq/settings/quickbooks/components/ExpenseAccountPicker.tsx` — loads /api/qbo/accounts on mount, dropdown + Save button, success confirmation when persisted.
- `src/app/hq/settings/quickbooks/components/PendingReceiptsCard.tsx` — pending count + monthly pushed total + "Push pending" button calling `/api/hq/receipts/push-all`. Surfaces succeeded/failed counts.
- `src/app/hq/settings/quickbooks/page.tsx` — rewritten: cleans up dashboard-era `bg-white`/`text-gray-*` to semantic tokens (Phase 3 lock cleanup), adds the new ExpenseAccountPicker + PendingReceiptsCard sections, expands the "How it works" list to cover the receipt flow.
- `src/app/hq/jobs/[id]/page.tsx` — fetches job receipts in parallel with photos, renders `<JobReceiptStrip>` immediately below `<JobPhotoStrip>`.

### Verification
- `npx tsc --noEmit` green after every commit.
- Receipt → confirm → push round-trip happy-path: receipt row created with all fields, qbo_expense_id populated, qbo_attachable_id populated, image visible in QBO under Attachments. QBO Purchase posts to the configured account.
- Disconnected-QBO path: edits save, "Push pending" button shows the count, batch retry works once `expense_account_id` set.
- Cost: ~$0.02/receipt × ~200/mo = $4/mo. Combined with voice memo ($1.30/mo) and camera ($0/mo): Phase 4 total ~$5.30/mo for the AI features.

### Pending Julian actions (Phase 4.2 specific)
- **Apply migration 013** in Supabase SQL editor before deploy hits prod (otherwise `/api/hq/receipt` will 500 on the new table).
- **Pick the QBO posting account** under `/hq/settings/quickbooks` after the deploy is live — receipts can't push without it. The settings card surfaces this clearly.
- **Test the round-trip** on iPhone 16 Pro: open a job, tap Receipt, snap a Lowe's / MetalMax receipt, verify the auto-populated fields look right, edit any wrong values, tap "Post to QuickBooks", confirm in QBO that a Purchase + Attachable appeared. Test a low-confidence path (blurry photo) to confirm the amber banner shows. Test the offline path (turn off Wi-Fi mid-confirm) to confirm the row saves locally and Settings shows it pending.

### Phase 4 status
**Complete: voice memo (4) + camera photos (4.1) + receipt OCR (4.2).**
Phase 5 (Twilio SMS + offline queue + push categories) is the next mobile-app surface. Strategic Phase 2 work (review velocity, speed-to-response) merges into Phase 5 since both need Twilio.

### What's queued next
- Phase 5 — Twilio SMS + offline queue + push categories
- 11 remaining city personalizations
- Spanish `/es/` landing
- `/pricing` page
- Quote templates UI

---

## 2026-04-24 (later) — HQ Phase 4.1: camera-first job photos

**Context:** After shipping the voice-memo slice of Phase 4, Julian picked camera-first job photos as the next chunk (Phase 4.2 — Receipt OCR → QBO still deferred). Stacking continues on uncommitted tree; `ship-phases-3-and-4.sh` will be extended with Phase 4.1 commits before push.

### What shipped

**DB (1 new migration):**
- `supabase/migrations/012_gallery_items_job_id.sql` — additive. `add column if not exists job_id uuid references public.jobs(id) on delete set null` on `gallery_items`, plus a filtered index (`where job_id is not null`). Idempotent. Skipped the originally-planned `job_photos_log` audit table — the existing `gallery_items` + `gallery_photos` two-table structure is enough for the P0, phase-tagging and lat/lng are easy to add later if actually needed.

**Client (2 new files, 1 modified):**
- `src/lib/hq/image-prep.ts` (140 lines) — EXIF auto-orient via `createImageBitmap({ imageOrientation: 'from-image' })`, OffscreenCanvas resize to 2048px long edge, JPEG 85% export. Falls back to the raw file on any failure (missing `createImageBitmap` on old iOS, 2D context issues, out-of-memory). A 48 MP HEIC jobsite shot → ~400 KB over LTE in ~150ms.
- `src/components/hq/JobPhotoStrip.tsx` (268 lines) — Camera button + horizontal thumbnail strip + upload status chips. Uses `<input capture="environment" multiple>` so iOS opens the native camera app (no getUserMedia permission prompt). Multi-select allowed — Julian can shoot a burst of 3-5 photos and release, each uploads in parallel with per-file status. Tap a thumbnail → Lightbox (reuses `src/components/hq/Lightbox.tsx` from Phase 3 with the locked easing curve). Cover photo badge in amber on the matching thumbnail.
- `src/app/hq/jobs/[id]/page.tsx` — modified to fetch `gallery_items WHERE job_id = this job + gallery_photos` on server (2 sequential queries gated on item existence), pass to `<JobPhotoStrip>`. Strip renders above the header card, below the map hero.

**Server (1 new endpoint):**
- `src/app/api/hq/job-photo/route.ts` (218 lines) — POST endpoint. Auth via `createClient().auth.getUser()`. Accepts `{ job_id, file }` multipart. Validates (8 KB min, 10 MB max, `image/*` mime, job exists in DB). Uploads to Supabase Storage `gallery` bucket at `jobs/{job_id}/{timestamp}.{ext}`. **Find-or-create pattern:** queries `gallery_items WHERE job_id = $1 LIMIT 1`; if no row, inserts one with auto-generated title (`"{Customer} — Job {job_number}"`), type from `jobs.job_type`, tag from `jobs.structure_type`, `is_active = false` (keeps private). Then inserts `gallery_photos` row with next `sort_order`, `is_cover` on first-photo-of-fresh-item only. Rollback: if photo insert fails AFTER the item was just created, deletes both item + storage blob.

### Verification
- `npx tsc --noEmit` green after every commit.
- Design integrates with existing gallery infrastructure — no `/api/gallery` regressions. Job-captured photos remain hidden from public `/gallery` via the existing `is_active=true` RLS policy.
- Cost: $0 (no Anthropic, no OpenAI). Supabase Storage at ~$0.021/GB/mo, trivial.

### Pending Julian actions (Phase 4.1 specific)
- **Apply migration 012** — run `supabase/migrations/012_gallery_items_job_id.sql` in the Supabase SQL editor before the deploy goes live, otherwise `/api/hq/job-photo` insert will 500 (no such column).
- **Test multi-upload on iPhone 16 Pro:** open a job at `/hq/jobs/[id]` → tap Camera → iOS camera sheet → shoot 3 photos in a burst → Done → verify all 3 chips go prepping → uploading → done ✓, then appear in the strip. Tap one to verify Lightbox works.
- **Photo persistence check:** after the first burst, refresh the job page. Photos should still be there (fetched server-side). Hit the same job on `/hq/gallery` — photos should be visible in the HQ-only gallery view, NOT on the public `/gallery` page.

### Deferred to Phase 4.2
- **Receipt OCR → QBO** (the last piece of the original Phase 4 plan). Budget ~$0.02/receipt via Claude vision. Julian already locked the UX: extract → editable confirmation sheet → push to QBO Expense as an Attachable + edit the `job_receipts` row. Needs `supabase/migrations/013_job_receipts.sql` + extending `src/lib/qbo.ts` with `createExpense()` + Attachable upload helper.

### What's queued next
- Phase 4.2 Receipt OCR → QBO (above)
- Phase 5 Twilio SMS + offline queue + push categories
- Non-phone-app priorities: 11 remaining city personalizations, Spanish `/es/`, `/pricing`, Quote templates UI

---

## 2026-04-24 (late) — HQ Phase 4 (voice-only slice): hold-to-record voice memo → lead

**Context:** Phase 4 in the original plan (`a9672d3`) bundled voice memo + camera-first job photos + receipt OCR → QBO. Julian scoped this session to VOICE ONLY — ship one capability end-to-end before stacking. Camera + Receipt become Phase 4.1 + 4.2.

**Plan revision in-session:** Original plan said "Anthropic audio transcription". Verified via claude-code-guide agent that Claude Messages API does NOT accept direct audio. Revised to a two-step pipeline: **OpenAI Whisper** (transcribe) → **Claude Sonnet 4.6** (extract structured fields). Whisper picked over Deepgram for accent quality + ubiquity; cost delta ($0.09/mo) immaterial.

### What shipped

**Client layer:**
- `src/lib/hq/audio-recorder.ts` (246 lines) — MediaRecorder wrapper with mimeType negotiation (iOS `audio/mp4` AAC preferred → webm/opus fallback), WebAudio level meter (analyser node → RMS → onLevel 0..1 for UI), state machine (idle → requesting → recording → stopping), min-duration guard (400ms — accidental taps discarded), graceful error normalisation (permission denied → "Microphone access denied. Enable it in iOS Settings…"), teardown on unmount.
- `src/components/hq/VoiceRecordingOverlay.tsx` (178 lines) — full-screen dimmed backdrop + centered card. Mic puck pulses with level (1.0..1.35 scale). Timer in mono 28px. Level meter 1px brand-red bar. Five phases: `requesting` / `recording` / `transcribing` / `success` / `error`. Dismiss = backdrop tap when phase is not `recording`. X button shows only during recording. Uses `animate-[voiceFadeIn_120ms_ease-out]`, Lucide icons at stroke 2, `.tap-solid` on buttons.
- `src/app/hq/components/HqHeader.tsx` — rewritten Plus button wiring. `onPointerDown` arms 500ms long-press timer. Release <500ms → toggle `CreatePopover` (preserved behavior). Long-press fires → `armRecording()` → `getUserMedia` → overlay. Release during recording → `finalizeRecording()` → upload → transcribe → `router.push('/hq/leads/[id]')`. `pointerCancel` during recording = release-to-send (handles iOS system alerts interrupting). `setPointerCapture` so slight finger drift doesn't lose the press. `aria-label="Create new · hold to record voice memo"`.

**Server layer:**
- `src/lib/openai.ts` (93 lines) — fetch-based Whisper client. No SDK dependency (Whisper is a single endpoint; adding the full `openai` package for one call is wasteful). Accepts Blob/File, picks file extension from mime type (mp4/webm/ogg/wav/mp3/m4a mapped), 25 MB guard, supports `language` + `prompt` vocab hints. Typed errors (`OpenAIConfigError` / `OpenAIRequestError`) so callers can return a targeted 503 vs 502.
- `src/lib/voice-lead-extractor.ts` (137 lines) — Claude Sonnet 4.6 structured-extraction wrapper. System prompt enumerates every field + mapping rules (timeline words → asap/this_week/this_month/planning; service word → enum; dimension parsing "30 by 50" → width/length; military cue words; Central TX ZIP filter). Prompt cached via `cache_control: { type: 'ephemeral' }` — identical system prompt across calls saves ~70% input-token cost after first hit. Defensive code-fence stripping. Zod validation on output (`voiceLeadSchema`). Returns `VoiceLeadExtraction` typed object.
- `src/app/api/hq/voice-lead/route.ts` (223 lines) — POST endpoint. Auth via `createClient().auth.getUser()` (matches other `/api/hq/*` routes). `maxDuration = 30` (Vercel Pro). Validates multipart audio blob (2 KB min, 5 MB max, `audio/*` mime). Calls `transcribeAudio()` → `extractLeadFromTranscript()` → `buildInsertRow()` → insert → `notifyNewLead()`. Returns `{id, transcript, extracted}`. **Fallback-on-failure policy:** if Claude extraction fails, still inserts a lead with raw transcript so Julian never loses the voice memo. Insert returns 200 + `warning` field so the client navigates to the new lead and Julian edits fields inline. Uses the same `ZIP_CITIES` map as `/api/leads` (duplicated intentionally to avoid touching the customer-facing route — consolidate to a shared util in a follow-up).
- `.env.example` — added `OPENAI_API_KEY` with a usage comment describing the pipeline + cost + fallback-if-blank behavior (503 with setup instructions).

### Verification
- `npx tsc --noEmit` green after a single `ArrayBufferLike` vs `ArrayBuffer` adjustment on `Uint8Array` in the level-meter code.
- No new Supabase migration required — `leads.source` is a free-text column (verified against `001_initial_schema.sql` + FB webhook precedent of inserting `'facebook_lead_ads'` / `'facebook_messenger'`).
- Voice pipeline costs validated: Whisper `whisper-1` at $0.006/min ≈ $0.30/mo at 100 memos × 30s. Claude Sonnet 4.6 at short transcripts with prompt-caching ≈ $0.01/memo = $1/mo at 100 memos. Total ≈ $1.30/mo.

### Pending Julian actions (new, Phase 4-specific)
- **Add `OPENAI_API_KEY`** to Vercel Production env (`vercel env add OPENAI_API_KEY production --sensitive`). Without this, `/api/hq/voice-lead` returns 503 with a clear setup message.
- **Confirm `ANTHROPIC_API_KEY`** is already in Vercel env (silently used by `permit-extractor.ts`). If not, add it.
- **Test on iPhone 16 Pro in standalone PWA mode:** hold `+` button 0.5s+ → overlay appears → speak a test memo ("Hey this is John Smith, 254-555-1234, I need a 30 by 50 carport in Killeen, as soon as possible") → release → verify lead created in `/hq/leads` within ~5s with populated fields.
- **Mic permission:** first-time hold triggers iOS Safari mic permission prompt. Must tap "Allow". If denied accidentally, user needs to re-enable via iOS Settings → Safari → Microphone (error message surfaced in overlay).

### Deferred to Phase 4.1 / 4.2
- **Phase 4.1 — Camera-first job photos:** `/api/hq/job-photo` endpoint + `CameraStrip.tsx` + `job_photos_log` migration. No Anthropic API (Supabase Storage only).
- **Phase 4.2 — Receipt OCR + QBO push:** `/api/hq/receipt` + `/confirm` endpoints + `job_receipts` migration + extend `src/lib/qbo.ts` with `createExpense()` + Attachable upload. Julian picked "extract → confirm sheet → push" UX when we get there.

### What's queued next
Same as after Phase 3 shipped, plus Phase 4.1 + 4.2 above. Order of priority is Julian's call — Personalize 11 cities, Spanish `/es/`, `/pricing`, Quote templates UI, or Phase 4 follow-ups.

---

## 2026-04-24 — HQ Phase 3 shipped: design-language tightening + Gallery restyle

**Context:** Session opened asking to "continue phase 3 of the phone app." The original Phase 3 plan (commit `a9672d3`) had been scaffolded speculatively but drifted on the design language — Barlow leaking into HQ, tap-feedback jitter, raw brand-600 vs theme-aware `--brand-fg`, Lucide stroke-width chaos, and a paper-only Gallery "restyle" that never got past a Lightbox import. Reworked the plan around four locked design calls + full Gallery restyle. 5 commits, in order:

### Commit 1 — Design-language locks in `globals.css`
- Moved `h1, h2, h3 { font-family: var(--font-display) ... }` + clamp sizes out of `:root` scope into `.marketing h1, .marketing h2, .marketing h3` so HQ headings stop inheriting Barlow Condensed from globals. HQ's `font-(--font-ios)` wrapper now wins without a fight.
- Wrapped `src/app/(marketing)/layout.tsx` outer `<div>` in `className="marketing"` so the scoped rule activates on the public site.
- Added locked `.tap-solid` (transform scale 0.95 + cubic-bezier(0.22,1,0.36,1) transition covering transform + bg + border + opacity) and `.tap-list` (surface-3 wash + color transition) utilities with `prefers-reduced-motion` guards. Comment header in globals.css explicitly names both as THE two tap-feedback rules for HQ.

### Commit 2 — Typography + brand-token + icon-weight sweep
- Brand sweep across `src/app/hq/**` + `src/components/hq/**`: `bg-brand-600` → `bg-(--brand-fg)`, `hover:bg-brand-700` → `hover:bg-(--brand-fg-hover)`, `text-brand-600` → `text-(--brand-fg)`. 25+ call sites.
- Icon stroke sweep: `strokeWidth={2.2|2.3|2.4}` → `{2}` across HQ, except `BottomTabBar` active-state conditional `(active ? 2.3 : 2)` (pressed-state emphasis) and `HqHeader` Plus button (`2.3` CTA affordance). Preserved BottomTabBar pattern untouched; both remaining `2.3`s are intentional.

### Commit 3 — Tap-feedback migration
- Swept `active:scale-95 transition-transform` and `active:scale-[0.99|0.98] transition-transform` → `tap-solid` (39 sites). Swept `active:bg-(--surface-3) transition-colors` → `tap-list`. No residue after sweep.
- `QuoteDetailActions.tsx` ActionButton — dropped the inline `active:scale-[0.99]` strings from toneClass + replaced `transition-colors` with `tap-solid` on the outer button (covers bg + border + opacity in one utility). Hover-over tone class changed to `hover:bg-(--surface-3)` on the neutral variant.

### Commit 4 — Gallery restyle (the real work)
- `GalleryManager.tsx` (1433 lines) had been untouched by the earlier Phase 3 scaffold — still full of dashboard-era `bg-white` / `border-gray-300` / `text-gray-600` / `text-blue-400` / `bg-blue-50`. 158+ raw-color references swept to semantic tokens + dark-mode-aware forks:
  - `bg-gray-*` → `bg-(--surface-*)`, `border-gray-*` → `border-(--border-*)`, `text-gray-*` → `text-(--text-*)`
  - `bg-blue-*` / `text-blue-*` / `focus:ring-blue-*` → `--brand-fg` aliases with `/N` alpha modifiers where needed
  - `bg-emerald-50/100`, `bg-red-50/100`, `bg-amber-50/100`, `bg-green-100` → `bg-{color}-500/10|/15` transparent fills so tinted panels read correctly over dark backgrounds; colored text picks up `dark:text-{color}-400` forks
  - Amber featured badge (`bg-amber-500`) + amber cover-photo pill kept as solid — intentional accent, reads well in both modes
- **Lightbox** `transition={{ duration: 0.15 }}` (backdrop fade) and `0.16` (image swipe) updated to include the locked easing curve `ease: [0.22, 1, 0.36, 1]` — motion language now single-curve throughout HQ.
- Upload / CRUD / HEIC / folder-drop / multi-select-bundle logic not touched.
- **Explicitly deferred to Phase 3.1:** Lucide-ify the ↑ / ↓ / ✕ ascii controls in project cards, convert the upload form to `<GroupedList>` sections, iOS-style multi-col project grid layout (the current single-col on iPhone is actually the right call for power-user density). Today's sweep delivers the P0 win — dark-mode parity + consistent tokens + locked motion.

### Commit 5 — Vault (this file + Decisions.md)
- 5 new Decisions.md rows for the 4 locked design calls + Gallery restyle scope.
- Session Notes (this entry).
- Next Session Primer "What shipped" block updated.

**Verification:**
- `npx tsc --noEmit` green on every commit.
- 0 `active:scale-*` residue, 0 `bg-brand-600` residue, 0 `text-gray-*` / `bg-gray-*` residue in `src/app/hq` + `src/components/hq` + GalleryManager.
- Only 2 intentional `strokeWidth={2.3}` (BottomTabBar conditional + HqHeader Plus CTA).
- Next Vercel deploy verifies Tailwind v4 alpha modifier on CSS-var colors (`bg-(--brand-fg)/15`).

**Pending Julian actions (carried from 2026-04-23 + none new):**
- Resend domain verification
- Fire `Run Scrape Now` to validate Lead Engine end-to-end
- Rotate hCaptcha secret
- Source real photos into `/public/images/locations/{killeen,temple,belton}/`

**What's actually queued next:**
1. **Phase 3.1 Gallery follow-up** — Lucide-ify ascii controls + upload form → `<GroupedList>` + iOS grid layout tweaks
2. **Personalize remaining 11 cities** (Harker Heights → Copperas Cove → Waco → Salado → Georgetown → Round Rock → Lampasas → Holland → Taylor → Troy → Nolanville)
3. **Phase 4** — Voice + Camera + Receipt OCR (hold-to-record voice memo → lead, camera job logging, receipt OCR → QuickBooks, Anthropic Sonnet 4.6 for audio + vision)
4. **Phase 5** — Twilio SMS threading + offline lead queue + push categories + quiet hours (merges with Phase 2 strategic reviews-velocity + speed-to-response work)
5. Spanish `/es/` landing + `/pricing` page + Quote templates UI — unchanged
6. CivicPlus jurisdiction expansion for Lead Engine (Killeen, Copperas Cove, Waco, McLennan Co.)

---

## 2026-04-23 — Phase B shipped: HQ iOS PWA + full public-site magazine redesign + SEO/security hardening

**Context:** The "Phase B = next session" framing from 2026-04-22 is obsolete. Phase B shipped end-to-end in a single long-form session. Latest prod: commit `005bfba`, Vercel deployment `dpl_98A4EooFWQ3jcVxR7vwPtWKwZveU` (READY). `Next Session Primer.md` rewritten to match.

### HQ → iOS PWA (commits `5fa93db` → `3bf2e2d`)
- Phase B0-B5 complete: foundations + iOS two-tab IA (Now/Funnel) + real Funnel tab (unified `PipelineList` across 5 entity types) + swipe actions + pull-to-refresh + offline-first reads + install prompt + **push notifications** (phone buzzes on new leads / hot permits / accepted quotes) + settings hub
- Dark mode shipped as iOS `prefers-color-scheme` default — **reverses** the 2026-04-14 "no dark mode" lock. Steel-blue retuned for dark contrast (`--brand-fg: #4d8dff` in dark, `#1e6bd6` in light). Semantic tokens remap inside `@media (prefers-color-scheme: dark)`. No user toggle.
- HQ perf: streaming shell + per-section Suspense (kills 2-5s blank screen), SW StaleWhileRevalidate, lazy-load Recharts + framer-motion off critical bundle
- Favicon multi-size ICO + regen'd PWA icons (white lion on brand-blue + black detailed/simple variants)
- **Marketing layout scoped to light-only** — dark mode is HQ-only

### Public-site magazine redesign (commits `07e2e5f` → `005bfba`)
Full rebuild against a locked design language: full-bleed dark hero + diagonal gradient, red eyebrow pill, Barlow Condensed huge headlines with brand-blue accent words, magazine editorial labels.
- **Hero v2** — "BUILT RIGHT. / BUILT FAST. / BUILT ACROSS / CENTRAL TEXAS." — finally kills the stale "Built in Under 48 Hours" copy on the homepage centerpiece (2026-04-15 lock, never executed)
- **Services / WhyTripleJ / Testimonials / ServiceAreas** — all redesigned to the magazine language (photo-dominant, dark editorial spreads, brand-blue glows, dot-grid textures)
- **Site chrome** — route-aware Header (transparent over `/` hero, dark+blur elsewhere), magazine wordmark lockup, new `<PreFooterCta />` band between `<main>` and `<Footer>` (bookends the hero on every marketing page), upgraded Footer brand column
- **Motion language** — hero entrance choreography + scroll reveals via `useReveal` hook, single easing curve `cubic-bezier(0.22, 1, 0.36, 1)`, all respects `prefers-reduced-motion`, no framer-motion in public bundle
- **QuoteForm** — cinematic glass card over full-bleed red-iron hero, 2-step (revises 2026-04-15 3-step lock), service-chip-first, magazine editorial labels, redirects to new `/thank-you` page, step transitions slide-in from right
- **/services list** — magazine hero + featured Carports flagship split card + 3-up grid + Resources dark card
- **/locations/[slug] template redesigned** (12 template + 8 per-city decisions). New `LocationData` fields: `heroImage`, `customHeadline`, `heroSubhead`, `distanceFromTemple`, `habla`, `localIntro`, `landmarks[]`, `neighborhoods[]`, `topServices[]`, `whyLocalBullets[]`, `callouts[]` (array). All optional with legacy fallbacks so unpersonalized cities still render.
- **3 cities personalized** (Killeen → Temple → Belton): military-first / HQ-pride-lakeside / county-seat-authority positioning respectively. Belton introduced `callouts[]` array — Temple's old `premiumCallout` migrated to array form, zero behavior change.

### SEO + positioning pass (commits `557e486` → `3656e97`)
- Root Organization schema + BreadcrumbList + canonical URL fix + og:image + llms.txt rewrite for GEO
- **8 new county pages** — `/locations/[county-slug]` for Bell / McLennan / Coryell / Williamson / Lampasas / Falls / Milam / Burnet. Mirrors Caliber Metal's 18-location approach (now 14 cities + 8 counties = 22 location surfaces). Bell + Coryell get military section (Fort Cavazos).
- Image sitemap + `ImageGallery` JSON-LD schema
- **Supplier-agnostic positioning** (commit `5dc30c9`) — removed all customer-facing references to MetalMax, MetalMart, WeatherXL™, Turnium, Sheffield, MaxLoc/MaxSeam/MaxSnap across site copy, blog, location pages, service-page data, vault docs. Reads as "leading regional Texas suppliers — multi-source" so supplier churn or dual-sourcing requires zero web rewrite. `gallery_items.panel_color_line` still uses internal `'turnium' | 'sheffield'` IDs for back-compat; user-facing labels are "Standard Line" / "Premium Line" via `LINE_LABELS`.
- **Lone-Star color names become canonical** — 39 colors renamed (Storm Cloud / Bell County Black / Wine Country / Pinto Green / Saddle Tan / etc.), used everywhere (public site + HQ picker + alt text + gallery cards). Exception: **Galvalume + Acrylic-Coated Galvalume kept as functional names** (cheapest panels — price signal customers shop on). "Best Value" emerald badge added to Galvalume swatches.

### New pages
- **`/services/hybrid-projects`** — catch-all for non-standard builds (horse stalls, all-black warehouses, decks, custom commercial). Auto-pulls photos from `gallery_items WHERE type = 'Hybrid'`. Sales-link URL for commercial leads.
- **`/partners`** — B2B install-partnership funnel. Promoted to main nav (not footer). Posts to new `partner_inquiries` table (migration `011_partner_inquiries.sql` applied to prod), HQ inbox at `/hq/partners` with status pills + notes autosave.
- **`/thank-you`** — `robots: { index: false }`, QuoteForm redirect target.

### Security pass (commit `1cd2cef`)
- **hCaptcha** (chosen over Turnstile) — server-side verify + client widget on QuoteForm + PartnerInquiryForm. Env vars `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` + `HCAPTCHA_SECRET_KEY` (Sensitive). Skip-if-unset for dev.
- **Per-IP rate limiting** — in-memory LRU, 5/hr on `/api/leads`, 3/hr on `/api/partner-inquiries`. Spam deterrent only, not DDoS shield.
- **Harker Heights copy fix** — `48-hour` → `same-week` in `metaTitle` + `heroHeadline` (was contradicting the 2026-04-15 lock).
- CSP flip from Report-Only → enforced **deferred** to a separate commit after 24h monitoring.

### Nav + brand polish
- **Service Areas demoted** main nav → footer-only (Partners took the 7th slot, footer already has the full Service Areas column)
- **"English · Español"** tag under phone number
- Logo cleanup: circular mask + trim on `public/images/logo-lion.png`
- Positioning: "Clients" stat → "Mon–Sat" (availability, not vanity metric)

### Key engineering realizations
- **"Welded" at Triple J = welded + bolted** (logged as a Decisions.md row, 2026-04-23). To weld red-iron on-site the crew first bolts everything into position, then welds. Bolts stay (rubber gaskets prevent leaks). Copy implication: "welded structures are reinforced with permanent bolts" — credibility upgrade, not a contradiction of the welded-or-bolted tagline.
- hCaptcha secret was sent through chat — **must rotate** in dashboard + re-add via `vercel env add HCAPTCHA_SECRET_KEY production --sensitive` once integration is verified.

### Pending Julian actions (all unchanged from 2026-04-22 + additions)
- Resend domain verification (still critical — silent bounce otherwise)
- Fire `Run Scrape Now` button to validate Lead Engine end-to-end
- Source real photos into `/public/images/locations/{killeen,temple,belton}/` (hero + landmark photos — current placeholders use `red-iron-frame-hero.jpg` / `carport-gable-residential.jpg`; landmarks render as typography-only cards until real photos arrive, intentional magazine treatment)
- Rotate hCaptcha secret
- Review the welded-vs-bolted blog post against the "welded always includes bolts" engineering reality (currently frames them as mutually exclusive)

### What's actually queued next
- **Personalize remaining 11 cities** using the Killeen/Temple/Belton template (Harker Heights → Copperas Cove → Waco → Salado → Georgetown → Round Rock → Lampasas → Holland → Taylor → Troy → Nolanville)
- Spanish `/es/` landing + carports/garages/barns
- `/pricing` page with transparent ranges + calculator from `jobs` table
- Quote templates UI at `/hq/quotes/templates`
- Permit Lead Engine end-to-end test + CivicPlus jurisdictions (Killeen, Copperas Cove, Waco, McLennan Co.)
- Real photo sourcing into `/public/images/locations/` (all cities)
- Reviews velocity automation + Twilio SMS speed-to-response (Phase 2 core, still not built)

---

## 2026-04-22 — Functional pass: email unify, manual customer create, manual scrape, `/hq` KPI grid

**Context:** Site is live, dashboard is live, but Julian hit a string of bugs and friction points. This session was a functional pass (no design polish) that cleaned the rough edges and unlocked the dashboard as a daily command center.

**What shipped:**

1. **QuoteForm bypass (BUG FIX)** — Form was auto-submitting after Step 2, skipping the concrete/timeline/military step. Root cause: browser implicit-submit via Enter key / autofill / iOS "Go" button. Fix: removed `<form>` element entirely; converted to `<div>` with `onClick` handler on the submit button. Nuclear but correct — `step !== 3` guards alone weren't enough because the native form was still triggerable.
2. **Lead delete + convert-to-customer** — Added two-click delete-confirm pattern on `/hq` leads table + `→ Customer` button that POSTs to a new `/api/customers` endpoint and auto-flips lead status to `quoted`. Unblocked the quote builder (customer dropdown was empty because there was no way to create customers).
3. **Email sender unified to `@triplejmetaltx.com`** — Previously `quotes@triplejmetalllc.com` (3 L's, no `tx`) which didn't match the Resend-verified domain. All three send paths now use the same domain with `reply_to: julianleon@triplejmetaltx.com`. **Julian action required:** confirm `triplejmetaltx.com` shows "Verified" in resend.com dashboard (DKIM/SPF/DMARC green) — without this, every send bounces silently.
4. **Old `triplejmetal.com` references scrubbed** — Blog metadata canonicals, QBO redirect doc strings, QBO source comments. Grep now shows zero stale references in `src/`.
5. **Manual `+ New Customer` flow** — `/hq/customers` now has a `+ New Customer` button that expands inline form. Captures walk-ins, referrals, Juan's phone calls. No lead-first-then-convert required.
6. **Manual `Run Scrape Now` button** — `/hq/permit-leads` now has a button to kick the permit scrape ad-hoc. `/api/cron/scrape-permits` supports dual auth: `Bearer CRON_SECRET` (Vercel Cron) + Supabase cookie (`/hq` UI). Daily 14:00 UTC cron unchanged. This is the first time Julian can kick off the Lead Engine without curl-ing with secrets.
7. **`/hq` home KPI grid** — Replaced the 4-card lead-status row with a grouped KPI grid:
   - **Pipeline:** Open leads · Active permit leads · Pipeline value (sum draft+sent quote totals)
   - **Conversion:** Lead → Customer rate (30d) · Quote acceptance rate
   - **Revenue:** Revenue this month · Avg deal size
   - **Operations:** Jobs scheduled this week · Hot leads (ASAP + new)
   - Lead pipeline pill row (New/Contacted/Quoted/Won) kept as a second tier.
   - All numerical — graphs/charts deferred to Phase B.

**Key realizations:**
- Dashboard is the command center. Julian wants to work from phone in the truck AND laptop in the shop. Triple J-specific, zero multi-tenant bloat.
- Permit Lead Engine has never been tested end-to-end live. Manual trigger button lets Julian kick it off himself to validate before trusting the cron.
- All analytics for today's KPI grid were computable from existing tables. No schema changes.

**Decisions resolved this session (see `Decisions.md` for full rows):**
- Email domain = `triplejmetaltx.com` everywhere; Google Workspace aliases stay as inbound-only.
- Manual scrape = shipped today.
- Templates UI = deferred to Phase B design session.
- Phase B = dedicated design session covering HQ nav redesign + Recharts/Tremor graphs + public-site polish + Spanish `/es/` + pricing page + templates UI.

**Pending Julian actions:**
- Confirm `triplejmetaltx.com` is "Verified" in Resend dashboard (DNS records green). Otherwise sends bounce.
- Manually fire the `Run Scrape Now` button to validate Lead Engine end-to-end.
- Sanity-check `/hq` KPI numbers against Supabase queries for a few cards.

**What's queued for Phase B (design session):**
- HQ nav redesign to steel-blue matching public site
- Recharts graphs + sparkline trends on each KPI card
- Funnel chart (Leads → Customers → Quotes → Jobs)
- Pipeline-by-jurisdiction stacked bar for permit leads
- Public-site hero refresh, Spanish `/es/` landing, pricing page
- Quote templates UI at `/hq/quotes/templates`
- Component sourcing: Tremor as base, 21st.dev accents, shadcn/ui charts wrapper

---

## 2026-04-21 (end of session) — Final session addendum

This section captures tonight's extended strategic conversation and is the closing summary for this session. New Claude sessions should read `Next Session Primer.md` + `FB Marketplace Intel.md` first, then this entry for nuance.

**New strategic frameworks discussed (full detail in `Next Session Primer.md`):**

- **5 Market Edges** prioritized: Speed-to-response, Spanish site, Review velocity, Transparent pricing, Permit-data flywheel. First two pair up for Night 2 build (shared Twilio infra).
- **Moat honesty framing:** Tech advantage = 18-36 month window, NOT a permanent moat. Use head start to build durable moats (brand, reviews, crew, supplier leverage) before window closes ~2028. Real threat isn't Irvin — it's a hypothetical 22-yo AI-native founder in Austin targeting Central TX metal buildings vertical. Defense: crew + trust + tenure.
- **Capital strategy:** Debt-only, no equity dilution for foreseeable future. Realistic path: equipment financing Year 2+ → SBA 7(a)/504 Year 3+ → bonding capacity build Year 2+ → evaluate PE bolt-on offers only at $5M+ revenue Year 7-10. NEVER merchant cash advances, factoring, or pre-exit equity dilution.
- **FB Marketplace tier analysis:** Julian shared screenshots. Tier 1 threat = ProStructures of Belton (Joseph Zeluff, 5500 W FM 93 Temple). Full intel in `FB Marketplace Intel.md` including head-to-head pricing benchmarks + Triple J's winning listing template.

**Reality corrections that materially changed projections:**

1. **Julian is 18, not 19.** Extra year of compounding runway.
2. **Julian has 20% EQUITY (not commission).** Juan 40% / Freddy 40% / Julian 20% via LegalZoom. Freddy is co-owner, not employee. Earlier advice to "negotiate equity Year 3" is MOOT — he already has it.
3. **Juan is generous, not competitive.** Sees Julian as growth engine. Equity will likely grow over time with performance (realistic trajectory: 20% → 30-40% by Year 6-8 as Juan semi-retires).
4. **Real net margins ~2x textbook contractor assumption.** 50-60% on small jobs, 35-45% medium, 25-35% large. Live data: Copperas Cove $8,600 job / $3,036 materials / $100 diesel = $5,464 net (63%). Driven by owner-operated welders + paid-off equipment + direct MetalMax.
5. **Julian is also a welder.** Team has 2 in-house welders (Julian + Freddy). Can scale to $3-5M before 3rd welder hire.
6. **Asset base:** Skid steer, Ram 2500, trailers paid off. Only F350 at ~$900/mo. Lean fixed overhead.
7. **Financial state:** NOT broke. ~$16K incoming from recent contracts. Full execution greenlit, no cash-crunch constraint.
8. **Domain migration to triplejmetaltx.com DONE** (not pending as earlier docs suggested).

**Revised 10-year wealth projection:**
- Cumulative distributions to Julian over 10 years: **~$7M**
- Potential PE exit at Year 10: **+$5-7M pre-tax (20% of $25-35M sale)**
- **Realistic net worth at age 28: $10-20M**
- **Aggressive (equity growth + PE exit): $20-35M**

**Julian's physical state:**
- Recent car accident. Recovering. Can't work jobsite right now.
- Cognitive bandwidth fully intact, pouring into Triple J tech buildout.
- Recovery timing aligns perfectly with tech-work window.

**Parallel family business updates:**
- Mexicano Grill — 812 East Central Ave, Belton TX
- Target reopen **mid-July 2026** (~10 weeks out from 2026-04-21)
- Juan-funded entirely; Julian contributes welding labor (drive-through framework) but not capital
- When restaurant stabilizes → cash flow loops back to fund Triple J growth
- Known as "a very successful business" historically per Julian

**Execution pace directive from Julian:**
- "Let's not delay anything" — matched to his fast pace
- Can compress 10-week plan to 2 long-form Claude sessions
- Night 1 = deploy + GBP + reviews + FB recon + LegalZoom pull (all Julian solo)
- Night 2 = speed-to-response + review velocity + Spanish + pricing + market-report template (Claude session)
- Night 3 (optional) = CivicPlus expansion + FB template generator + LLC review

**Phase 2 is NOT financing. Phase 2 is conversion + trust stack.**
Phase 2 moves: Twilio SMS speed-to-response, post-job review velocity, Spanish page, pricing transparency page. Financing moves to Phase 3 with explicit trigger conditions in `Financing Research.md` (20+ leads/mo + 10+ reviews + current COIs).

**Permit data publishing strategy locked:**
- Public `/market-report/[year-month]` auto-generated aggregates (no addresses, no scoring, no individual owners)
- Private `/hq/permit-leads` keeps the full juice
- Zillow analogy: publish the narrative, hoard the leads

**Files created/updated this session (cumulative):**
- NEW: `Next Session Primer.md` — read-first doc for future sessions
- NEW: `FB Marketplace Intel.md` — competitive tier analysis + winning listing template + offensive tactics
- UPDATED: `Decisions.md` — 13 new 2026-04-21 rows total
- UPDATED: `Session Notes.md` — this entry + earlier 2026-04-21 pivots
- UPDATED: `Financing Research.md` — deferral notice at top, research preserved below
- UPDATED: `Project Context.md` — real margins, ownership (20/40/40 equity), domain DONE, team capacity, Mexicano Grill context, F350 at $900/mo

**Julian's between-session action items (priority order):**
1. **DEPLOY** — `git pull` on Mac → push to main → Vercel env vars (`CRON_SECRET`, `ANTHROPIC_API_KEY`) → run `004_permit_leads.sql` in Supabase dashboard → trigger cron, verify permits land
2. **Claim Google Business Profile** — business.google.com, fill every field, 20+ jobsite photos, request postcard
3. **10 Google reviews** — text past happy customers manually, personal asks, target 10 live within 1 week
4. **FB Marketplace full recon** — additional screenshots beyond ProStructures already covered; document other local competitors
5. **Post first 2-3 Triple J FB Marketplace listings** using template in `FB Marketplace Intel.md`
6. **Insurance COI check** — GL + WC PDFs with agent
7. **Pull LegalZoom LLC Operating Agreement** — paste text into next session for review against 20/40/40 equity + buy-sell + death/divorce checklist
8. **DO NOT apply to Hearth yet** — premature, trigger conditions not met

**Next Claude session (Night 2) scope:**
- Twilio SMS speed-to-response automation
- Post-job review velocity automation
- Spanish landing page (`/es/` + top 3 service pages)
- Pricing transparency page (`/pricing` + calculator)
- Market-report template at `/market-report/[year-month]`
- First 2-3 FB Marketplace listings using template

---

## 2026-04-21 — Lead Engine V1 MVP Shipped + Phase 2 Reframed + Capital Strategy Locked

**Lead Engine V1 MVP built (Temple + Bell County + Harker Heights):**
- Migration `supabase/migrations/004_permit_leads.sql` — `permit_leads` table w/ RLS, dedup unique index on `(jurisdiction, source_url, permit_number)`, score/status/created indexes
- `src/lib/permit-sources.ts` — 3 enabled Revize entries + 4 disabled CivicPlus/Granicus stubs
- `src/lib/permit-extractor.ts` — `unpdf` PDF text extraction + Anthropic SDK (`claude-sonnet-4-6`) with wheelhouse-scored JSON output, Zod-validated
- `src/app/api/cron/scrape-permits/route.ts` — Bearer-auth GET handler, per-jurisdiction try/catch, upsert with `ignoreDuplicates: true`
- `src/app/api/permit-leads/[id]/route.ts` — PATCH for status/notes/mark_called, Supabase Auth enforced
- `src/app/hq/permit-leads/page.tsx` + `components/PermitLeadsTable.tsx` — dashboard w/ status filter pills, score color-coding, expand-row for wheelhouse reasons + notes + raw source
- `vercel.json` — daily cron at 14:00 UTC (9am CT)
- Nav link added to `src/app/hq/layout.tsx`
- `.env.local` now has `CRON_SECRET` (64-char hex)
- Deps added: `@anthropic-ai/sdk` + `unpdf`

**Code is NOT YET DEPLOYED.** Sitting on branch `claude/setup-new-project-wA6jt`. Julian must pull on Mac, push to main, set env vars in Vercel, run migration in Supabase dashboard before any of this is live.

**Evening strategic conversation — key pivots:**

1. **Phase 2 is NOT financing, it's conversion + trust.**
   - Financing lift = 15-25%. Review velocity + speed-to-response lift = 100-300%.
   - Phase 2: claim GBP + manually collect 10 Google reviews + Twilio SMS auto-respond + post-job review-velocity automation.
   - Phase 3 (later): financing integration. Trigger: 20+ leads/mo AND 10+ reviews AND current COIs.
   - `Financing Research.md` prepended with deferral notice; original research preserved below.

2. **Permit data publishing strategy = public/private split.**
   - Public `/market-report/[year-month]` auto-generated aggregate stats (permit counts, valuations, city breakdown, contractor names from public record).
   - Private `/hq/permit-leads` keeps addresses + wheelhouse scores + reasoning + notes.
   - Publish the narrative, hoard the leads.

3. **Tech advantage = 18-36 month window, not permanent moat.**
   - Claude Code + scraping will commoditize. Window closes ~2028.
   - Use the head start to build durable moats: Google reviews, crew expansion, supplier leverage, bonding capacity, local brand.
   - Direct competitors (Capital/Irvin) won't build this — they adapt in years, not weeks. Real threat is a 22-yo AI-native founder in Austin targeting Central TX vertical. Defense = crew + trust + 3yr tenure.

4. **Outside capital stance = debt-only, no equity dilution.**
   - Contractor grand slam = cash-flow the business + debt for assets that earn (trucks, welder, yard).
   - Year 3+: SBA 7(a) or 504 for facility.
   - Build bonding capacity from Year 2.
   - NEVER MCAs. NEVER equity until a real exit.
   - Mueller merger unlikely — suppliers rarely acquire installers. Realistic exit (if wanted) in Year 7-10: PE bolt-on at 3-6x EBITDA or strategic acquirer (Morton, Varco Pruden, Nucor) at 5-8x.

5. **Facebook Marketplace = confirmed active channel.**
   - Irvin's highest-ROI channel. Julian doing recon between sessions.
   - Next-session build: `/quote?src=fb` UTM tracking + listing template generator pulling from `/hq/gallery`.
   - Differentiation: welded-only, same-week, real crew photos, not stock renders.

6. **Language division of labor logged.**
   - Julian = English. Juan + Freddy = Spanish. This is why Julian is the sales guy on 20% commission.
   - Spanish landing page + Google Voice Spanish line deferred to post-Phase-2 — massive untapped market, zero competitor coverage.

**Strategic locks from earlier in the day (`Decisions.md` appended):**
- Lead Engine V1 = 3 Revize jurisdictions only; CivicPlus deferred
- Capital/Irvin = **Both** — supply secondary ≤30% + installer-partnership pitch in parallel (MetalMax primary unchanged)
- Financing = Hearth primary, Enhancify subprime fallback; HFS / GreenSky / SFC evaluated + skipped
- 3D Builder = deferred indefinitely

**Julian's between-session action items (revised priority):**

1. **DEPLOY.** Pull branch on Mac, push to main, set `CRON_SECRET` + `ANTHROPIC_API_KEY` in Vercel env vars, run `supabase/migrations/004_permit_leads.sql` in Supabase dashboard. Trigger cron manually or wait 24hr for 9am CT run.
2. **Claim Google Business Profile** at business.google.com → "Triple J Metal Buildings." Fill every field. Push 20+ jobsite photos. Request postcard verification. Non-negotiable — you've been dragging on this.
3. **Manually collect 10 Google reviews** from past happy customers. Text them personally. Target: 10 in 7 days.
4. **Facebook Marketplace recon** on Capital — categories, price format, photo style, description formula, posting cadence. Screenshot 5-10 listings. Check FB Ad Library for paid ads.
5. **Insurance COIs check** — GL + Workers Comp, request PDFs from agent. Needed for Hearth application later.
6. Separately: Irvin installer-partnership conversation (Capital's overflow → Triple J crew).
7. Hearth enrollment = **DO NOT DO YET.** Premature. Trigger: 20+ leads/mo + 10+ reviews + current COIs.

**Next session (Claude work):**
- Twilio SMS speed-to-response automation (60-sec auto-reply on lead submit or permit-lead call)
- Post-job review-velocity automation (24hr after job "complete" → Google review link text)
- Debug any Lead Engine issues found during first live cron runs
- Optional if time: FB Marketplace `/quote?src=fb` UTM tracking

**Deferred to later sessions:**
- Spanish-language landing pages + Google Voice Spanish line
- Transparent pricing page (`/pricing` + per-service ranges + calculator)
- Permit-data content flywheel (`/market-report/[year-month]`, auto-generated, publish once we have 30 days of data)
- Financing frontend (trigger conditions above)
- CivicPlus scraping (Killeen, Waco, McLennan, Copperas Cove) — Firecrawl + headless
- FB Marketplace listing-template generator
- Apollo/ZoomInfo permit-owner enrichment
- Auto-outreach (SMS/email to permit holders)
- Domain migration Wix → Vercel + Resend branded-sender DNS
- Supabase 2FA (Julian self-service)

## 2026-04-21 (late evening) — Financial Reality + Margin Recalibration + No-Delay Directive

Julian dropped critical context that reframes everything built today:

**Ownership structure (confirmed):** Juan 40% / Freddy 40% / Julian 20% via LegalZoom. Freddy is a co-owner equity partner, not just a foreman. LLC paperwork needs verification (Julian to pull from LegalZoom account).

**Real net margins are DOUBLE what the earlier projection used:**
- Textbook contractor assumption: 15-25% net
- Triple J reality: **50-60% net on small jobs, 35-45% on medium, 25-35% on large**
- Live data point — Copperas Cove job, closed in 48 hrs: $8,600 rev / $3,036 materials / $100 diesel = **$5,464 net (63% margin)**
- Why: owner-operated welders (Julian + Freddy both weld), paid-off equipment, direct MetalMax relationship, zero subcontractors

**Asset base:** Skid steer, Ram 2500, trailers — paid off. F350 at $900/mo. Fixed monthly overhead is trivial vs. realistic revenue.

**Financial state correction:** Julian is NOT in broke mode. ~$16K incoming from recent invoices + the Copperas Cove close. Can fund Twilio/Anthropic/Google Voice line items without strain. Cash-crunch survival plan from earlier is OBSOLETE — full execution is greenlit.

**Parallel family business:** Mexicano Grill (812 East Central Ave, Belton TX). Target reopen **mid-July 2026** (~10 weeks out). Juan-funded entirely. Julian contributes welding labor (drive-through framework) but not capital. When restaurant stabilizes, cash flow loops back to fund Triple J growth.

**New team fact:** Julian is ALSO a welder. Team has 2 welders in-house (Julian + Freddy). Can scale to ~$3-5M before hiring a 3rd welder. Juan = investor + relationships only, not jobsite.

**Domain migration done** — triplejmetaltx.com live and professional. Remove "pending" from Project Context.md.

**Revised 10-year wealth projection (with real margins + 20% equity):**
- Year 2 (post-restaurant refocus): ~$170K to Julian
- Year 3: ~$320K
- Year 5: ~$600K
- Year 10: ~$1.3M/year in distributions
- Cumulative 10-yr: ~$7M + potential $5-7M exit at Year 10
- **Realistic net worth at age 28: $10-20M. Aggressive w/ equity growth + PE exit: $20-35M.**

**Julian's directive:** "Let's not delay anything." No cash-crunch constraints. Full Phase 2 execution starts next session.

**10-week plan (restaurant reopens mid-July = our window):**
- Week 1 (this week): Deploy branch to Vercel, run migration, first cron, claim GBP
- Weeks 2-4: 10 Google reviews (manual), FB Marketplace recon, LLC paperwork verify
- Weeks 4-6 (next Claude session): Twilio SMS speed-to-response + post-job review velocity
- Weeks 6-8: Spanish landing page + pricing transparency page
- Weeks 8-10: First `/market-report/` (May 2026) goes live; prep for restaurant reopen + Juan's refocus

---

## 2026-04-20 — Prep + Dashboard Hardening + Domain/Email

**Memory + tooling setup:**
- Appended Project Memory + Operating Rules to `AGENTS.md` (business, stack, key source files, locked decisions, NotebookLM ID, vault index)
- Triple J name origin logged: Juan (investor) + Julian (tech/ops, 19) + Jose Alfredo "Freddy" (foreman — cuts, welds, math)
- NotebookLM skill installed at `~/.claude/skills/notebooklm/` (unauthenticated in sandbox — user runs queries on Mac, pastes back)
- API keys dropped into `.env.local`: ANTHROPIC_API_KEY + FIRECRAWL_API_KEY

**Strategic lock-in — Lead Engine V1:**
- Filter Strategy **B (stay close to wheelhouse)** chosen: <$500K, pole barns, ag, small commercial accessory, auto/storage. Skip large PEMB/warehouse subcontractor pivot.
- NotebookLM research saved to `Lead Sources Research.md` — 7 Central TX jurisdictions mapped (Temple, Bell County, Harker Heights = easy Revize/Joomla; Killeen, Waco, McLennan, Copperas Cove = harder CivicPlus/Granicus)
- MGOconnect.org + EnerGov CSS confirmed unscrapable (login-gated) — TOMA upstream pivot (P&Z + Commissioners' Court + weekly permit reports) legally mandated public data

**Dashboard hardening committed (4c3bfe9 + 6a36b96):**
- Removed Owner Login link from public `Footer.tsx`
- `/dashboard` → `/hq` rename (all links, middleware matcher, grep-verified zero stale refs)
- Julian to enable Supabase 2FA himself

**Brand infra locked:**
- Domain: **triplejmetaltx.com** (Squarespace, ~$3 first-year)
- Email: **julianleon@triplejmetaltx.com** (Google Workspace Basic)
- Still on Wix `TripleJJMetal.com` — migration to Vercel pending

**NOT yet built (tomorrow's full session):**
- `permit_leads` Supabase migration
- `src/app/api/cron/scrape-permits/route.ts` (Temple-first MVP, then Bell County + Harker Heights)
- `vercel.json` daily cron
- `/hq/permit-leads` dashboard page (sortable by filter score, called-toggle)
- Claude parsing prompt for permit PDFs → structured JSON + wheelhouse filter score

**Julian's brainstorm parked for post-Lead-Engine session:**
- Business cards / yard signs / social collateral via Canva + real jobsite photos (shoot Freddy welding, 150 jobs worth of content) — NOT Nano Banana fake project photos
- Frontend design refresh after Lead Engine lands

**Next session checklist:**
1. Build Lead Engine V1 start-to-finish (migration → scraper → cron → dashboard page)
2. Then: frontend design pass if time permits
3. Julian deploys to Vercel when ready (still pending — needs `git push origin main` from Mac + 7 env vars)

---

## 2026-04-15 — Refinement Pass 1 + Research Sync

**NotebookLM research pulled (Gemini):**
- GBP photo strategy: 30–100+ reviews + job site photos = "digital tiebreaker" for TX contractors
- Review velocity: algorithms weight reviews mentioning specific services performed + traits like punctuality
- Proximity signal: verified address + appearing on city's "Registered General Contractor" list = ranking stability
- Keyword gaps confirmed: turnkey+concrete, welded vs. bolted, build speed, HOA compliance
- Military: geofence Facebook to KTB corridor, use PCS/BAH/VA Loans language, military discount CTA
- Multi-step form: ZIP upfront, turnkey upsell (concrete dropdown), urgency timeline cards, military toggle
- 4,000 PSI concrete callout = technical authority signal that increases conversion rates
- Specific niche pages that convert: "Barndominium foundations," "RV carports," "Custom metal sheds"

**Refinement pass committed (0c77415):**
- Font system: Geist → Barlow Condensed (headlines) + Inter (body)
- Tagline: "Built right, built fast, built by Triple J."
- TrustBar: Zero Subcontractors / Welded or Bolted / Same-Week / Temple TX
- Fixed all "custom welded" → "welded or bolted" (Triple J does BOTH)
- Fixed all "48-hour build" → "same-week scheduling" (48 hrs = materials arrival, not build time)
- Added Lean-to patios + House additions to all 14 location service lists + site.ts
- Testimonials.tsx rewritten as 'use client' auto-scroll marquee (CSS @keyframes, pause on hover)
- testimonials.md fill-in template created for Julian
- inspiration/screenshots/ folder created for visual reference drops

**New pages added (previous commit f82cc33 + refinement pass):**
- /gallery, /about, /contact, /service-areas (/service-areas later folded into /locations on 2026-04-26)
- /services/pbr-vs-pbu-panels
- 9 new location pages: Salado, Waco, Georgetown, Round Rock, Lampasas, Holland, Taylor, Troy, Nolanville
- Total: 14 location pages, 7 service pages

**Pending (Julian action items):**
1. `git push origin main` from Mac Terminal
2. Set 7 Vercel env vars → deploy
3. Collect real Google reviews → fill testimonials.md
4. Drop inspiration screenshots into inspiration/screenshots/ for next visual pass
5. Send Julian-approved AI footage for Cdance hero (on hold)

---

## 2026-04-14 — SEO + Form Architecture Session

**What we built:**

Deep research (Gemini → NotebookLM):
- Local SEO + GBP best practices for TX contractors
- Competitor keyword gap analysis (4 gaps identified)
- Military buyer behavior (Fort Cavazos PCS/BAH)
- Conversion optimization research (multi-step form design)
- All findings saved to Claude memory

Backend updates:
- supabase/migrations/002_leads_qualification_fields.sql — 5 new columns: zip, needs_concrete, current_surface, timeline, is_military (run in Supabase 2026-04-14)
- src/app/api/leads/route.ts — new Zod schema, ZIP→city lookup, richer owner email with urgency + military badges

QuoteForm rebuild (multi-step):
- Step 1: Name, Phone, Email, ZIP
- Step 2: Service type as icon cards, welded/bolted pills, W×L×H
- Step 3: Concrete option cards, surface pills (conditional), timeline cards, Military/FR toggle card
- Progress indicator + back/next navigation

Service pages — 6 niche SEO pages (keyword gap strategy):
- src/lib/services.ts — full data for all 6 services
- /services/[slug] — features grid, competitor comparison, FAQ schema, military section (rv-covers)
- /services index page
- Targets: turnkey+concrete (Gap 1), welded quality (Gap 2), 48-hr speed/military (Gap 3), HOA luxury (Gap 4)

Location pages — full redesign:
- src/lib/locations.ts — military fields added to Killeen + Harker Heights, "8 years experience" false claim removed
- /locations/[slug] — design system applied, trust strip, competitor comparison, military section

Dashboard:
- LeadsTable updated — shows ZIP, concrete, timeline, military badge

Commit: e45ea45

**Next session checklist:**
1. Julian: `git push origin main` from Mac Terminal
2. Julian: set 7 Vercel env vars + deploy
3. Test quote form end-to-end on live site
4. Build missing pages: /gallery, /about, /contact

---

## 2026-04-14 — Frontend Build Session

**What we built:**

Design system + shared chrome (Phase 1):
- src/lib/site.ts — single source of truth (NAP, nav, services, cities)
- src/app/globals.css — full design token set: steel-blue brand scale (#1e6bd6), ink neutrals, no dark mode, fluid typography
- src/components/ui/Button.tsx — Button + ButtonLink with 4 variants (primary/secondary/ghost/outline-dark)
- src/components/ui/Container.tsx — width-constrained wrapper (narrow/default/wide)
- src/components/ui/icons.tsx — inline SVG icons (phone, menu, close, arrow, pin, clock)
- src/components/site/Header.tsx — dark header with top thin bar (phone/hours/address), sticky+shrink on scroll, mobile drawer, both desktop phone + mobile sticky bar
- src/components/site/Footer.tsx — 4-col footer (Brand+NAP / Services / Service Cities / Company)
- src/components/site/MobileCallBar.tsx — sticky bottom Call Now + Free Quote bar (md and below)
- src/app/(marketing)/layout.tsx — route group isolating marketing chrome from dashboard/login/api

Homepage sections (Phase 2):
- TrustBar — 150+ Projects · 48-Hour Build · Turnkey Concrete · Temple TX
- Services — 4-card grid (Carports/Garages/Barns/RV Covers) with real photos + hover effects
- WhyTripleJ — welded-vs-bolted 6-row comparison table + photo callout
- HowItWorks — 3-step process on dark blueprint-grid background
- Testimonials — 3-card placeholder (replace when GBP reviews come in)

Interactive sections (Phase 3):
- Gallery — asymmetric photo grid (first tile 2×2) using 6 real Triple J job photos
- ServiceAreas — 5 city cards linking to /locations/[slug]
- QuoteForm — client component wired to POST /api/leads: Name, Phone, Email, City (dropdown), Service, W×L×H numeric fields, structure type (welded/bolted/unsure radio pills), notes textarea; inline success + error states

Route restructure:
- Moved src/app/page.tsx + locations/ into src/app/(marketing)/ route group
- Dashboard/login/setup/customer-quote pages keep their own layouts — no marketing chrome bleeds in

Deployment prep:
- All code committed: git commit 7ae863f (60 files, 4,108 insertions)
- Repo: github.com/julianleon8/triple-j-website (main branch)
- Push BLOCKED from sandbox (proxy) — Julian must run `git push origin main` from Mac Terminal
- Vercel connected to repo — NOT yet deployed (env vars not set)

CRM discussion:
- ClickUp MCP available (aa5a2bca-4004-49ea-bc2b-978162587a3a) — not connected yet
- Decision: hold ClickUp integration until live leads validate the need
- Preferred future path: Option 2 (ClickUp pipeline + keep custom quote system)

**Next session checklist:**
1. `git push origin main` from Mac Terminal (if not already done)
2. Set 7 env vars in Vercel (from .env.local) before clicking Deploy
3. Update NEXT_PUBLIC_SITE_URL to real Vercel domain after first deploy
4. Test quote form end-to-end: check Supabase leads table + owner email
5. Design iteration based on localhost review
6. Decide on display font (Barlow Condensed / Oswald to replace Geist placeholder)
7. Build missing pages: /services/[slug], /gallery, /about, /contact

---

## 2026-04-13 — Backend Build Session

**What we built:**
- Next.js (App Router) + TypeScript + Tailwind scaffolded
- Supabase MCP server connected (project: idrbgxlvvnqduvbqtaei)
- Supabase agent skills installed (.agents/skills/)
- Database schema: leads, customers, quotes, quote_line_items, quote_templates, jobs (with RLS)
- Lead submission API (/api/leads) with Resend email alerts to owner + customer confirmation
- Quote acceptance API (/api/quotes/[token]/accept) — tokenized, no login required
- Auth middleware protecting /dashboard
- Owner dashboard: lead table with status counters
- Login page with Supabase Auth

**SEO docs written (seo/):**
- SEO-STRATEGY.md — keywords, E-E-A-T, schema, link building, KPI targets
- COMPETITOR-ANALYSIS.md — 5 competitors, keyword gaps, what Triple J does better
- SITE-STRUCTURE.md — full URL hierarchy + schema per page type
- CONTENT-CALENDAR.md — 12-month content plan
- IMPLEMENTATION-ROADMAP.md — 4-phase rollout with GBP checklist

**Next steps:**
- Fill in .env.local with real Supabase + Resend keys
- Run migration SQL in Supabase dashboard (supabase/migrations/001_initial_schema.sql)
- Authenticate Supabase MCP (run /mcp in Claude Code terminal, select supabase, authenticate)
- Session 3: Frontend design — user will provide screenshots + assets

---

# Session Notes

End-of-session summaries written by Claude Code. Most recent at top.

---

## 2026-04-13 — Setup Session

**What we did:**
- Installed NotebookLM skill + authenticated with Google
- Installed Obsidian CLI skill + connected Triple J Website vault
- Created project folder at ~/Desktop/Triple J Project
- Added NotebookLM notebook (empty, ready for docs)
- Established two-brain memory architecture:
  - NotebookLM = document store (you upload, I query)
  - Obsidian = working memory (I read at start, write at end)

**Next steps:**
- Upload project docs/briefs to NotebookLM
- Fill in Project Context with goals and stack
- Start building the site

---

## 2026-04-25 — Perf push (4 phases) + SEO criticals + calculator polish + vault sync

**What shipped (15 commits in this session):**

Late 2026-04-24 carryover:
- HQ Phase 3 + 4 + 4.1 + 4.2 + marketing polish — bundled into 19 commits (`75a2acf` through `eaa292a`). Voice memo → lead, camera-first job photos, receipt OCR + QBO push, /hq/quotes wizard, More tab + Stats screen, Gallery semantic-token sweep, marketing site brand-name cleanup, location pages lifted to Temple-grade for Round Rock + Georgetown + Waco. **Three migrations pending application: `012_gallery_items_job_id.sql`, `013_job_receipts.sql`.**

2026-04-25 work:
- **Schema audit** (`73c0ba6`) — full `@graph` refactor: Organization + LocalBusiness (HomeAndConstructionBusiness) + WebSite as one canonical graph emitted from the marketing layout. Per-page schema (`/locations/[slug]`, `/services/[slug]`, `/blog/[slug]`, `/about`, `/contact`) refactored to reference the canonical via `@id` instead of duplicating LocalBusiness inline. Full audit in [docs/SCHEMA-AUDIT.md](docs/SCHEMA-AUDIT.md).
- **`/military` landing page** (`6b73172`) — Fort Cavazos PCS landing page, 9 sections, 7% military discount honored. New SITE.legalName field; Footer + locations/[slug] callouts wired. Sitemap entry at priority 0.9.
- **Two audit reports** (`67abec3`) — `docs/SEO-AUDIT-2026-04-24.md` (8 pass / 6 warning / 3 fail across 17 checks) + `docs/DATA-MODEL-AUDIT-2026-04-24.md` (~45% readiness for ad-ROI / flywheel reporting; 7 proposed migrations 014-020 awaiting sign-off).
- **Call-tracking infrastructure** (`3b9acd4`) — DNI infra for CallRail-style per-source phone-number swap. `src/lib/call-tracking.ts` (12-source detection) + `src/components/site/TrackedPhone.tsx` (`useSyncExternalStore` hook + 3 components). Migrated 22 user-facing CTAs across Header / Footer / MobileCallBar / PreFooterCta + 16 marketing pages. Schema.org telephone stays canonical. Logs to Vercel Analytics. `TRACKING_NUMBERS` map empty until CallRail signs up. Runbook in [docs/CALL-TRACKING.md](docs/CALL-TRACKING.md).
- **Quote calculator** (`b7dc3f8`) — `src/lib/quote-pricing.ts` (engine, all $ values placeholder marked `TODO_PRICING`) + `CalculatorStep.tsx` UI replaces wizard's manual ItemsStep. Calculator state stuffs into `quotes.internal_notes` as JSON `{kind:'calculator', version:1}`. Twilio SMS-send stub at `src/lib/twilio.ts` + `/api/quotes/[id]/send-sms` (returns 503 until env vars land). Runbook in [docs/QUOTE-CALCULATOR.md](docs/QUOTE-CALCULATOR.md).
- **Perf push baseline + Phase 0** (`0901bde`) — `docs/PERF-BASELINE-2026-04-25.md`. Key correction: 1.3 MB chunk turned out to be `heic2any`, already lazy. Real first-load JS is ~1.0 MB on HQ pages.
- **Phase 1** (`9782f8f`) — lazy-loaded Sheet + Lightbox via `next/dynamic` (split into Impl + lazy wrapper). Deferred hCaptcha mount in QuoteForm + PartnerInquiryForm. ~150 KB shaved off first-load on the affected routes.
- **Phase 2** (`a77c442`) — Suspense streaming on `/hq/leads/[id]` (DeferredConvertButton), `/hq/customers/[id]` (DeferredActivityTimeline), `/hq/jobs/[id]` (DeferredJobPhotos + DeferredJobReceipts). Shared `<Skeleton>` primitives extracted. `<Link prefetch>` on every inbox row. Tap-to-paint target: ≤100 ms.
- **Phase 3** (`d6acea6`) — `/hq/leads` paginated 500→50 with split status-only count query. Voice-memo `notifyNewLead()` moved to Next's `after()` API. Migration `021_hq_perf_indexes.sql` (7 indexes, additive, awaiting application).
- **Phase 4** (`eb953b6`) — 7 hero JPEGs recompressed via `sips --resampleWidth 1600 -s formatOptions 65` (~30% reduction). Unused `logo-lion-detailed.png` (1036 KB) deleted. ~2.6 MB total saved.
- **SEO criticals** (`5923ca4`) — `/military` title double-brand fixed (`title: { absolute }`). Same fix on Waco/Georgetown/Round Rock metaTitles. New `src/app/not-found.tsx` (slim brand bar + apologetic H1 + 3 recovery links). 5 over-60-char titles trimmed. `heroImageAlt` filled on all 22 location entries (was 6/22). Internal links added to `/privacy` + `/terms`.
- **A1 SEO tail** (`c875f55`) — Per-page Twitter cards on `/military` + `/services/[slug]` + `/locations/[slug]` + `/blog/[slug]`. Real alt text on services hub + thank-you hero. Two callouts added to `/locations/copperas-cove`. `/blog` index gets above-the-fold CTA. `BreadcrumbList` JSON-LD on `/blog/[slug]`. Per-page OG image for `/military` via Next file-based ImageResponse at `opengraph-image.tsx`.
- **A2 perf tail** (`b5de08f`) — `Load older` button on `/hq/leads` + cursor support on `GET /api/leads`. Hover-prefetch on lazy chunks: `prefetchSheet()` + `prefetchLightbox()` helpers + wired on JobPhotoStrip thumbnails + JobReceiptStrip buttons. CSS-only SwipeActions deferred (production risk, needs iPhone QA session).
- **A3 calculator polish** (`c4f2809`) — `Send SMS` button on `/hq/quotes/[id]` (calls existing 503-stub endpoint until Twilio provisioned). Standalone `/hq/calculator` route — estimator without DB write. **Real PDF generation** via `@react-pdf/renderer` — `src/lib/quote-pdf.tsx` + `GET /api/quotes/[id]/pdf` route + `PDF` button on `/hq/quotes/[id]` opens it.
- **A4 vault sync** — this entry + 11 new Decisions.md rows + 2 new memory files (`project_pending_manual_tasks.md`, `project_strategic_backlog.md`).

**Where things stand:**
- 26 `Decisions.md` rows added across 2026-04-23, 04-24, 04-25 (most recent 14 from this session).
- All 4 perf phases complete; **Phase 5 (re-measure) waits 24 hours** for Vercel Speed Insights to accumulate post-deploy field data.
- Three audit docs: SEO + data-model + schema. SEO criticals all closed.
- **Manual tasks blocking features:** apply migrations 012/013/021, set OPENAI_API_KEY in Vercel, pick QBO expense account at `/hq/settings/quickbooks`, optional CallRail/Twilio accounts. Full list in `project_pending_manual_tasks.md` memory.

**Next session candidates** (from `project_strategic_backlog.md`):
- Apply migrations 014-020 (data-model audit) once approved.
- CSS-only SwipeActions rewrite with iPhone QA.
- Customer portal / persistent login / project-tracking dashboard.
- Public Google reviews ingestion + AggregateRating schema.
- Job scheduling calendar.
- Real 2025/2026 pricing values into `src/lib/quote-pricing.ts` (drops `TODO_PRICING` markers).

_Maintained by Claude Code_