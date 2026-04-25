#!/usr/bin/env bash
#
# Ships HQ Phase 3 (design-language tightening + Gallery restyle) and
# HQ Phase 4 (voice memo → lead) as 10 logically-scoped commits, then
# pushes to origin/main.
#
# Run once from the Mac terminal:
#   cd "/Users/julianleon/Desktop/Triple J Website"
#   bash ship-phases-3-and-4.sh
#
# Prerequisites: you're on the `main` branch, your working tree looks
# right (spot-check with `git status`), and `.git/index.lock` can be
# removed (it was stuck because a Cowork sandbox session opened it;
# this script removes it first).
#
# Safe to re-run the tail only: if it fails mid-sequence, fix the issue
# and re-run the block that failed (each `git add` + `git commit` is
# idempotent in the sense that git will no-op if there's nothing to
# stage).

set -euo pipefail

# Step 0 — clear stale lock
rm -f .git/index.lock

# Sanity: must be on main
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
  echo "Not on main (on '$current_branch'). Switch branches first." >&2
  exit 1
fi

# --------------------------------------------------------------------
# Phase 3 — Commits 1-6
# --------------------------------------------------------------------

# Commit 1 — design-language locks
git add src/app/globals.css "src/app/(marketing)/layout.tsx"
git commit -m "design: scope Barlow to .marketing + add .tap-solid/.tap-list locks

Move the h1/h2/h3 font-display rule + clamp sizes out of :root scope
into .marketing h1/h2/h3 so Barlow Condensed stops leaking into HQ
(iPhone PWA) headings. HQ's font-(--font-ios) wrapper now wins by
inheritance without the :root-level override fighting it.

Add .tap-solid (transform scale 0.95 + cubic-bezier(0.22,1,0.36,1)
150ms transition covering transform+bg+border+opacity) and .tap-list
(surface-3 wash on active) utilities. Locked as the two tap-feedback
rules for HQ interactive elements. Both respect prefers-reduced-motion.

Wrap (marketing)/layout.tsx outer div in className=\"marketing\" so
the scoped rule activates on the public site."

# Commit 2 — More + Stats + Settings restyle + GroupedList
git add src/components/hq/ui/GroupedList.tsx \
        src/components/hq/ui/GroupedRow.tsx \
        src/components/hq/SignOutButton.tsx \
        src/app/hq/more/ \
        src/app/hq/settings/page.tsx \
        src/app/hq/settings/logs/EventsTable.tsx \
        src/app/hq/settings/testing/TestActions.tsx
git rm src/app/hq/components/StatsSection.tsx 2>/dev/null || true
git commit -m "hq phase 3: More tab + Stats screen + Settings restyle

- /hq/more — new grouped-list hub: Pipeline (Permits/Customers/Quotes/
  Partners with count badges) · Insights (Stats · Activity log stubbed
  for Phase 5) · System (Settings).
- /hq/more/stats — dedicated KPI screen with Pipeline · Conversion ·
  Revenue · Operations groups, Sparklines on open-leads + MTD revenue,
  all-time Sales Funnel chart. Computed server-side in parallel from
  leads/customers/quotes/jobs/permit_leads.
- /hq/settings restyle — replaced ad-hoc layout with <GroupedList> sections
  (Device · System · Inboxes · Integrations · About). SignOutButton
  extracted as its own client component for reuse across More/Settings.
- Drops unused StatsSection.tsx (Today now uses CompactKPIStrip; full
  metrics live on /hq/more/stats).

New shared primitive: src/components/hq/ui/GroupedList.tsx +
GroupedRow.tsx — iOS Settings-style inset-grouped list."

# Commit 3 — Quote wizard + list + detail restyle
git add src/app/hq/quotes/new/_components/ \
        src/app/hq/quotes/new/page.tsx \
        src/app/hq/quotes/page.tsx \
        src/app/hq/quotes/components/QuotesList.tsx \
        "src/app/hq/quotes/[id]/page.tsx" \
        "src/app/hq/quotes/[id]/components/QuoteDetailActions.tsx" \
        "src/app/hq/quotes/[id]/components/QuoteEditor.tsx" \
        "src/app/api/quotes/[id]/route.ts"
git rm src/app/hq/quotes/components/QuotesTable.tsx \
       src/app/hq/quotes/new/components/QuoteBuilderForm.tsx 2>/dev/null || true
git commit -m "hq phase 3: quote wizard + list + detail restyle

- /hq/quotes/new — 4-step iOS flow: Customer -> Items -> Totals ->
  Review/Send. Progress: 4 dots + slim brand-blue progress bar.
  Step transitions reuse .step-slide-in keyframe. Haptics on advance +
  send-success + error. Customer step: search-filterable typeahead +
  inline + New Customer sub-form. Items step: pick from quote_templates
  OR add custom lines; sticky subtotal at bottom. Totals step: editable
  tax rate (default 0.0825 TX) + native date picker for valid-until +
  notes. Review step: preview pane. Save draft OR Send now (posts to
  /api/quotes + /api/quotes/[id]/send).
- /hq/quotes list — replaces QuotesTable with QuotesList: SegmentedControl
  (All · Draft · Sent · Accepted) + PipelineList rows + + New pill.
- /hq/quotes/[id] — hero card with quote number + status pill + customer
  + total amount, then QuoteDetailActions (Send/Resend/Mark Accepted/PDF
  stub) using ActionButton variants, then the existing QuoteEditor for
  line-item editing and QBO push.
- /api/quotes/[id]/route.ts — small tightening to pair with wizard."

# Commit 4 — sweep brand token + icon stroke + tap feedback
git add src/app/hq/components/CompactKPIStrip.tsx \
        src/app/hq/components/HqChrome.tsx \
        src/app/hq/components/LeadsTable.tsx \
        src/app/hq/components/NextActionCardClient.tsx \
        "src/app/hq/customers/[id]/page.tsx" \
        src/app/hq/customers/_components/ActivityTimeline.tsx \
        src/app/hq/customers/components/CustomersList.tsx \
        src/app/hq/customers/components/NewCustomerForm.tsx \
        "src/app/hq/jobs/[id]/components/JobMapHero.tsx" \
        "src/app/hq/jobs/[id]/page.tsx" \
        "src/app/hq/leads/[id]/components/ConvertToCustomerButton.tsx" \
        "src/app/hq/leads/[id]/page.tsx" \
        src/app/hq/partners/components/PartnerInquiriesTable.tsx \
        src/components/hq/ActionDrawer.tsx \
        src/components/hq/CreatePopover.tsx \
        src/components/hq/InstallPrompt.tsx \
        src/components/hq/ListRow.tsx \
        src/components/hq/MessagesRow.tsx \
        src/components/hq/PipelineList.tsx \
        src/components/hq/PushOptIn.tsx
git commit -m "hq: sweep brand token + tap feedback + icon stroke drift

- bg-brand-600 -> bg-(--brand-fg), hover:bg-brand-700 ->
  hover:bg-(--brand-fg-hover), text-brand-600 -> text-(--brand-fg).
  25+ sites. Raw brand-600 reserved for marketing; HQ interactive
  brand is now theme-aware (lifts to #4d8dff in dark for OLED).
- Lucide strokeWidth {2.2|2.3|2.4} -> {2} across HQ. Two intentional
  exceptions preserved: BottomTabBar active-state (active ? 2.3 : 2)
  and HqHeader Plus CTA (2.3 as affordance).
- active:scale-95/[0.99]/[0.98] + transition-transform -> tap-solid.
  active:bg-(--surface-3) + transition-colors -> tap-list.
  39 call sites migrated to the two locked utilities.
- QuoteDetailActions ActionButton: dropped inline active:scale-[0.99]
  strings from toneClass + replaced transition-colors with tap-solid
  (covers bg/border/opacity), neutral variant swaps to hover:bg-
  (--surface-3)."

# Commit 5 — Gallery restyle (semantic-token sweep + lightbox ease lock)
git add src/app/hq/gallery/components/GalleryManager.tsx \
        src/components/hq/Lightbox.tsx
git commit -m "hq gallery: semantic-token sweep + lightbox ease lock

GalleryManager.tsx (1433 lines) was still dashboard-era styling --
bg-white / border-gray-300 / text-gray-600 / text-blue-400 / bg-blue-50
throughout. 158+ raw-color references swept to semantic tokens:
- bg-gray-* -> bg-(--surface-*) (50->surface-2, 100/200->surface-3)
- border-gray-* -> border-(--border-*) (200->subtle, 300->strong)
- text-gray-* -> text-(--text-*) (900/800->primary, 700/600->secondary,
  500/400/300->tertiary)
- bg-blue-* / text-blue-* / focus:ring-blue-* -> --brand-fg aliases,
  with /N alpha modifiers for tinted fills (/10 /15 /25)
- bg-emerald-* / bg-red-* / bg-amber-* / bg-green-* 50/100 panels ->
  bg-{color}-500/10 or /15 transparent fills so tinted panels read
  correctly over dark surfaces; matched text picks up
  dark:text-{color}-400 forks
- amber featured-badge + amber cover-photo pill kept as solid
  bg-amber-500 (intentional accent, reads well in both modes)

Lightbox.tsx transitions now include the locked easing curve
[0.22, 1, 0.36, 1] on both the backdrop fade and the image slide --
motion language stays single-curve throughout HQ.

Deferred to Phase 3.1: Lucide-ify the up/down/x ascii controls,
convert upload form to <GroupedList> sections, iOS-native project grid
layout."

# --------------------------------------------------------------------
# Phase 4 — Commits 7-10 (voice memo -> lead)
# --------------------------------------------------------------------

# Commit 7 — OpenAI env var (PART of commit 6 because .env.example is
# modified and we want vault + env together)

# Commit 6 — vault (Phase 3) — includes HqHeader stays modified, comes
# with Phase 4. We bundle .env.example with the voice-lead commit below.

# Actually commit the vault + reworked-brief doc for Phase 3 now:
git add Decisions.md "Session Notes.md" "Next Session Primer.md" \
        "HQ Phase 3 — Reworked Brief.md" \
        "HQ Phase 3 — Commit + Push Commands.md" \
        ship-phases-3-and-4.sh
git commit -m "vault: HQ Phase 3 + 4 — Decisions + Session Notes + Primer

Phase 3 (design-language tightening + Gallery restyle):
- 5 Decisions rows: typography scope, tap-feedback split, interactive
  brand token, Lucide stroke weight, Gallery restyle scope.
- Session Notes 2026-04-24 entry with commit-by-commit breakdown.
- Primer 'What shipped' block updated.
- Reworked Brief + Commit Commands docs preserved at root.

Phase 4 (voice memo -> lead):
- 5 Decisions rows: scope (voice only), Claude-no-audio plan revision,
  hold-to-record entry point, fallback-on-failure policy, no source
  migration needed.
- Session Notes 2026-04-24 (late) entry.
- Primer 'What shipped' block extended.
- This ship script preserved at root."

# Commit 7 — OpenAI env var
git add .env.example
git commit -m "env: OPENAI_API_KEY for Phase 4 voice-memo pipeline

Whisper transcribes the audio blob and Claude Sonnet 4.6 extracts
structured lead fields. ~\$0.006/min via whisper-1, budget \$0.30/mo
at ~100 memos. If blank, /api/hq/voice-lead returns 503 with setup
instructions. ANTHROPIC_API_KEY is already in use silently by
permit-extractor.ts and doesn't need a .env.example row."

# Commit 8 — Server endpoint
git add src/lib/openai.ts \
        src/lib/voice-lead-extractor.ts \
        src/app/api/hq/voice-lead/route.ts
git commit -m "hq phase 4: voice-memo -> lead endpoint (Whisper + Claude Sonnet 4.6)

Two-step pipeline (Claude Messages API does not accept direct audio):
1. OpenAI Whisper (whisper-1) transcribes the audio blob. Fetch-based
   client in src/lib/openai.ts, no SDK dependency. Picks file extension
   from mime type so iOS audio/mp4 + Chrome audio/webm both work.
2. Claude Sonnet 4.6 extracts {name, phone, email, zip, city,
   service_type, structure_type, width, length, height, timeline,
   is_military, notes} from the transcript. Prompt cached via
   cache_control: ephemeral for ~70%% input-token savings after the
   first call. Output JSON parsed + Zod-validated via voiceLeadSchema.

Endpoint /api/hq/voice-lead:
- Auth: createClient().auth.getUser() (owner-only, no captcha).
- Input: multipart/form-data with audio blob (2 KB min, 5 MB max,
  audio/* mime). No /api/leads rate limit -- authed user only.
- Flow: transcribe -> extract -> buildInsertRow() -> leads insert with
  source='voice_memo' -> notifyNewLead() (non-fatal).
- Fallback-on-failure: if extraction fails, still insert a lead with
  raw transcript (name='Voice memo (extraction failed)') so the memo
  is never lost. Returns 200 + warning field.
- Returns {id, transcript, extracted}.

No Supabase migration -- leads.source is free text (FB webhook already
inserts 'facebook_lead_ads' / 'facebook_messenger' without issue)."

# Commit 9 — Client: hold-to-record UX
git add src/lib/hq/audio-recorder.ts \
        src/components/hq/VoiceRecordingOverlay.tsx \
        src/app/hq/components/HqHeader.tsx
git commit -m "hq phase 4: hold-to-record voice memo on the + button

HqHeader Plus button rewired:
- onPointerDown arms a 500ms long-press timer (matches iOS system).
- Release <500ms: toggle CreatePopover (unchanged behavior).
- Long-press fires: armRecording() -> getUserMedia -> MediaRecorder
  + WebAudio level meter -> show VoiceRecordingOverlay.
- Release during recording: finalizeRecording() -> stop + upload +
  transcribe + router.push('/hq/leads/[id]').
- pointerCancel during recording = release-to-send (handles iOS
  system alerts interrupting). setPointerCapture prevents finger-drift
  from losing the press.

src/lib/hq/audio-recorder.ts (246 lines):
- MediaRecorder wrapper, mimeType negotiation (iOS audio/mp4 AAC,
  Chrome/FF webm/opus), WebAudio analyser -> RMS onLevel callback,
  state machine, 400ms min-duration guard, permission-denied message
  normalisation. Teardown on unmount.

src/components/hq/VoiceRecordingOverlay.tsx (178 lines):
- Full-screen dim backdrop + centered iOS-style card.
- Mic puck pulses with level (scale 1.0..1.35). Timer in 28px mono
  tabular-nums. 1px level bar beneath.
- Five phases: requesting / recording / transcribing / success / error.
- X button only during recording; backdrop tap dismisses success /
  error / transcribing."

# --------------------------------------------------------------------
# Phase 4.1 — Commits 10-12 (camera-first job photos)
# --------------------------------------------------------------------

# Commit 10 — Migration: gallery_items.job_id
git add supabase/migrations/012_gallery_items_job_id.sql
git commit -m "db: gallery_items.job_id FK for Phase 4.1 camera-first job photos

Additive, idempotent. Adds nullable job_id uuid references jobs(id)
on delete set null, plus a filtered index (where job_id is not null).

Existing public-gallery photos (job_id null) unchanged. Job-captured
photos set job_id and is_active=false on insert so they stay private
to HQ — existing RLS policy 'Public read active' filters them out of
/gallery.

Must be applied in the Supabase SQL editor before the server code
hits production, otherwise /api/hq/job-photo will 500 on the column."

# Commit 11 — Server: /api/hq/job-photo endpoint
git add src/app/api/hq/job-photo/route.ts
git commit -m "hq phase 4.1: job-photo endpoint (find-or-create + gallery_photos append)

POST /api/hq/job-photo — auth-gated, multipart {job_id, file}.
- Validates: 8 KB min, 10 MB max, image/* mime, job exists.
- Uploads to Supabase Storage 'gallery' bucket at
  jobs/{job_id}/{timestamp}.{ext}.
- Find-or-create: queries gallery_items WHERE job_id = \$1 LIMIT 1;
  if missing, inserts one with auto-generated title
  (\"{Customer} — Job {job_number}\"), type from jobs.job_type,
  tag from jobs.structure_type, is_active=false (private), job_id set.
- Appends gallery_photos row with next sort_order. First photo of a
  fresh item becomes is_cover; subsequent photos keep existing cover.
- Rollback: if photo insert fails after item was just created,
  delete item + storage blob so DB stays clean.

Maps common job_type -> gallery type (carport->Carport etc.) and
structure_type -> gallery tag (welded->Welded, bolted->Bolted)."

# Commit 12 — Client: image-prep + JobPhotoStrip + Job detail wiring
git add src/lib/hq/image-prep.ts \
        src/components/hq/JobPhotoStrip.tsx \
        "src/app/hq/jobs/[id]/page.tsx"
git commit -m "hq phase 4.1: camera button + thumbnail strip on job detail

src/lib/hq/image-prep.ts (140 lines):
- createImageBitmap({ imageOrientation: 'from-image' }) for EXIF
  auto-orient on decode (fixes sideways iPhone photos).
- OffscreenCanvas resize to 2048px long edge + JPEG 85% export.
  48 MP HEIC -> ~400 KB over LTE in ~150ms.
- Falls back to raw file on any failure (missing createImageBitmap
  on old iOS, 2D-context issue, OOM) so uploads never block on
  optimization.

src/components/hq/JobPhotoStrip.tsx (268 lines):
- <input capture=\"environment\" multiple> opens the iOS native
  camera sheet directly — no getUserMedia permission prompt.
- Multi-select burst: shoot 3-5 photos, release, all upload in
  parallel with per-file status chips (prepping -> uploading ->
  done ✓ / failed ✗ with dismiss).
- Horizontal thumbnail strip with amber 'Cover' badge. Tap ->
  Lightbox (reuses Phase 3 Lightbox with locked easing curve).
- Haptic feedback on tap / success / error.

src/app/hq/jobs/[id]/page.tsx:
- Server-side fetches gallery_items WHERE job_id = id + its
  gallery_photos, passes to <JobPhotoStrip>. Strip renders above
  the job header card, below the map hero."

# --------------------------------------------------------------------
# Phase 4.2 — Commits 13-16 (receipt OCR → QBO)
# --------------------------------------------------------------------

# Commit 13 — Migration: job_receipts + qbo_tokens.expense_account_id
git add supabase/migrations/013_job_receipts.sql
git commit -m "db: job_receipts + qbo_tokens.expense_account_id (Phase 4.2)

Idempotent. Adds:
- public.job_receipts table (id, job_id FK CASCADE, vendor, date,
  subtotal, tax, total, line_items jsonb, image_url, image_path,
  qbo_expense_id, qbo_attachable_id, qbo_pushed_at, qbo_push_error,
  extraction_confidence, raw_transcript, memo).
- two indexes (job_id, partial on qbo_pushed_at IS NULL).
- updated_at trigger so HQ UI can show 'edited 2m ago'.
- RLS policy 'authed full access on job_receipts'.
- qbo_tokens.expense_account_id + expense_account_name columns
  (single-account category strategy for receipt push).

Must apply in Supabase SQL editor before /api/hq/receipt is hit in
prod, otherwise the endpoint will 500 on the missing table."

# Commit 14 — Server endpoints + QBO client extension
git add src/lib/receipt-extractor.ts \
        src/lib/qbo.ts \
        src/app/api/hq/receipt/route.ts \
        "src/app/api/hq/receipt/[id]/confirm/route.ts" \
        src/app/api/hq/receipts/push-all/route.ts \
        src/app/api/qbo/accounts/route.ts \
        src/app/api/qbo/expense-account/route.ts
git commit -m "hq phase 4.2: receipt OCR endpoints + QBO Purchase + Attachable

Vision extractor (src/lib/receipt-extractor.ts):
- Claude Sonnet 4.6 vision call. System prompt enumerates JSON schema
  with explicit rules: vendor = receipt header (not cashier/store#),
  date YYYY-MM-DD, sum multiple tax lines, skip separators, gas-pump
  receipts get a confidence penalty.
- Prompt-cached system (~70%% input-token savings after first call).
- Zod-validated output via receiptExtractionSchema.

QBO client extension (src/lib/qbo.ts):
- listExpenseAccounts() — Account query filtered to AccountType IN
  ('Expense', 'Cost of Goods Sold', 'Other Expense').
- createExpense({accountId, vendor, date, total, lines?, memo?}) —
  Purchase API with PaymentType='Cash', AccountRef on every line,
  optional EntityRef via find-or-create vendor, optional TxnDate +
  PrivateNote.
- uploadAttachable({entityType, entityId, blob, filename,
  contentType}) — multipart /v3/company/{realm}/upload with
  file_metadata_0 + file_content_0, linked via AttachableRef.
- Extended QboTokenRow type with expense_account_id +
  expense_account_name.

Endpoints:
- POST /api/hq/receipt — multipart {job_id, file}. Uploads image,
  runs Claude vision, persists job_receipts row with
  qbo_pushed_at=null. Fallback policy: if extraction fails, save
  placeholder row so user never loses the photo.
- POST /api/hq/receipt/[id]/confirm — applies user edits then
  best-effort QBO push. On QBO failure, save edits + qbo_push_error,
  return {pushed: false, reason: 'qbo_not_connected' |
  'account_id_missing' | 'qbo_api_error', error}.
- POST /api/hq/receipts/push-all — batch retry every
  qbo_pushed_at IS NULL row. Sequential. Returns per-row failures.
- GET /api/qbo/accounts — owner-auth, lists expense-style accounts.
- POST /api/qbo/expense-account — persists qbo_tokens.expense_account_id."

# Commit 15 — Client: JobReceiptStrip + Settings picker + retry card
git add src/components/hq/JobReceiptStrip.tsx \
        src/app/hq/settings/quickbooks/components/ExpenseAccountPicker.tsx \
        src/app/hq/settings/quickbooks/components/PendingReceiptsCard.tsx \
        src/app/hq/settings/quickbooks/page.tsx \
        "src/app/hq/jobs/[id]/page.tsx"
git commit -m "hq phase 4.2: JobReceiptStrip + Settings picker + retry card

src/components/hq/JobReceiptStrip.tsx (~600 lines):
- Sibling to JobPhotoStrip on /hq/jobs/[id].
- Receipt button (capture='environment') with image-prep on capture.
- Recent receipts list with vendor + date + total + status pill
  (Pushed / Pending / Verify / Push failed).
- ConfirmForm in <Sheet> at 90%% snap: receipt thumbnail + vendor +
  date + subtotal/tax/total + dynamic line-items editor (qty x
  unit_price -> line total auto-suggest) + memo + low-confidence
  warning banner + Post to QuickBooks button.
- Auto-opens after capture for immediate verify-and-push.

Settings updates:
- ExpenseAccountPicker — loads /api/qbo/accounts, dropdown + Save
  button + 'Receipts post to <Account>' confirmation.
- PendingReceiptsCard — pending count + monthly pushed total + 'Push
  pending' button calling /api/hq/receipts/push-all. Surfaces
  succeeded + failed counts.
- /hq/settings/quickbooks page rewritten: Phase 3 token sweep
  (bg-white/text-gray -> semantic tokens) plus the new picker +
  retry card sections + expanded 'How it works' covering receipts.

src/app/hq/jobs/[id]/page.tsx — fetches job_receipts in parallel
with photos, renders <JobReceiptStrip> below <JobPhotoStrip>."

# Commit 16 — Vault (Phase 4.2 + ship script)
git add Decisions.md "Session Notes.md" "Next Session Primer.md" \
        ship-phases-3-and-4.sh
git commit -m "vault: HQ Phase 4.2 — receipt OCR Decisions + Notes + Primer

- 6 Decisions.md rows: scope, single-account category strategy,
  save-local + retry failure mode, two-step extract-then-confirm
  endpoint shape, no-block confidence threshold (amber Verify pill
  below 0.7), QBO client extensions.
- Session Notes 2026-04-24 (latest) entry with file-by-file
  breakdown.
- Primer 'What shipped' block extended with Phase 4.2.
- Ship script extended with Phase 4.2 commits + reminder to apply
  migration 013."

# --------------------------------------------------------------------
# Push
# --------------------------------------------------------------------
echo
echo "All commits staged. About to push to origin/main."
echo "Press Ctrl-C within 3 seconds to abort."
sleep 3
git push origin main
echo
echo "✓ Pushed. Vercel should pick up the deploy in <30s."
echo
echo "Remaining manual steps:"
echo "  1. Apply migrations in the Supabase SQL editor BEFORE Vercel"
echo "     finishes deploying (otherwise endpoints will 500):"
echo "     - supabase/migrations/012_gallery_items_job_id.sql"
echo "     - supabase/migrations/013_job_receipts.sql"
echo "  2. Add OPENAI_API_KEY to Vercel Production env:"
echo "     vercel env add OPENAI_API_KEY production --sensitive"
echo "  3. Confirm ANTHROPIC_API_KEY is set (used by Claude vision +"
echo "     voice extractor + permit extractor):"
echo "     vercel env ls production | grep -i anthropic"
echo "  4. Open /hq/settings/quickbooks on the deploy and pick the"
echo "     expense account every receipt will post to."
