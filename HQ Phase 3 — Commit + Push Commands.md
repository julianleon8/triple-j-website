# HQ Phase 3 — Commit + Push Commands

_Generated 2026-04-24. The sandbox can't clear `.git/index.lock` (host-owned file). Run these in your Mac terminal from the repo root to clear the lock, stage, commit as a clean 5-commit sequence, and push to `main`._

## Step 0 — clear the stale index lock (one line)

```sh
rm -f .git/index.lock
```

## Step 1 — verify the tree is clean

```sh
git status
```

You should see ~48 files modified + a handful of untracked (`src/app/hq/more/`, `src/app/hq/quotes/new/_components/`, new `GroupedList/Row.tsx`, `Lightbox.tsx`, `SignOutButton.tsx`, `QuoteDetailActions.tsx`, `QuotesList.tsx`, and three new markdown briefs in root).

## Step 2 — commits in order

Copy-paste each block as one multi-line command. Every file is listed explicitly so no stray `git add -A` picks up the `_archive/*.canvas` files that have read-lock issues.

### Commit 1 — design-language locks

```sh
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
```

### Commit 2 — HQ Phase 3 new chrome (More + Stats + Settings restyle + GroupedList)

```sh
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
GroupedRow.tsx — iOS Settings-style inset-grouped list. Props support
optional Lucide icon (tinted tile), label, sublabel, badge (with tone
system), trailing value, and chevron. Renders as <Link> when href is
provided, <button> when onClick is provided, disabled variant dims
and removes the chevron."
```

### Commit 3 — HQ Phase 3 Quote wizard + list + detail restyle

```sh
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
```

### Commit 4 — sweep brand token + icon stroke + tap feedback across Phases 1-3

```sh
git add src/app/hq/components/CompactKPIStrip.tsx \
        src/app/hq/components/HqChrome.tsx \
        src/app/hq/components/HqHeader.tsx \
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
```

### Commit 5 — gallery restyle (semantic-token sweep + lightbox ease lock)

```sh
git add src/app/hq/gallery/components/GalleryManager.tsx \
        src/components/hq/Lightbox.tsx
git commit -m "hq gallery: semantic-token sweep + lightbox ease lock

GalleryManager.tsx (1433 lines) was still dashboard-era styling —
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
[0.22, 1, 0.36, 1] on both the backdrop fade and the image slide —
motion language stays single-curve throughout HQ.

Deferred to Phase 3.1: Lucide-ify the up/down/x ascii controls,
convert upload form to <GroupedList> sections, iOS-native project grid
layout. Today's pass delivers the P0 win: dark-mode parity +
consistent tokens + locked motion."
```

### Commit 6 — vault

```sh
git add Decisions.md "Session Notes.md" "Next Session Primer.md" \
        "HQ Phase 3 — Reworked Brief.md" \
        "HQ Phase 3 — Commit + Push Commands.md"
git commit -m "vault: HQ Phase 3 — 5 Decisions + Session Notes + Primer

- 5 Decisions.md rows (2026-04-24): typography scope, tap-feedback
  split, interactive brand token, Lucide stroke weight, Gallery
  restyle scope.
- Session Notes 2026-04-24 entry: full commit-by-commit breakdown.
- Next Session Primer 'What shipped' header flipped to 2026-04-24.
- Reworked Brief + this Commit Commands doc preserved at root as
  session artifacts."
```

## Phase 4 commits (voice memo → lead) — run AFTER Commits 1-6 above

### Commit 7 — OpenAI env var

```sh
git add .env.example
git commit -m "env: OPENAI_API_KEY for Phase 4 voice-memo pipeline

Whisper transcribes the audio blob and Claude Sonnet 4.6 extracts
structured lead fields. ~\$0.006/min via whisper-1, budget \$0.30/mo
at ~100 memos. If blank, /api/hq/voice-lead returns 503 with setup
instructions. ANTHROPIC_API_KEY is already in use silently by
permit-extractor.ts and doesn't need a .env.example row."
```

### Commit 8 — Server: /api/hq/voice-lead endpoint

```sh
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
  audio/* mime). No /api/leads rate limit — authed user only.
- Flow: transcribe -> extract -> buildInsertRow() -> leads insert with
  source='voice_memo' -> notifyNewLead() (non-fatal).
- Fallback-on-failure: if extraction fails, still insert a lead with
  raw transcript (name='Voice memo (extraction failed)') so the memo
  is never lost. Returns 200 + warning field; client navigates anyway.
- Returns {id, transcript, extracted}.

No Supabase migration — leads.source is free text (FB webhook already
inserts 'facebook_lead_ads' / 'facebook_messenger' without issue)."
```

### Commit 9 — Client: hold-to-record UX

```sh
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
  error / transcribing. Uses tap-solid and brand-aware semantic tokens."
```

### Commit 10 — Vault (Phase 4)

```sh
git add Decisions.md "Session Notes.md" "Next Session Primer.md" \
        "HQ Phase 3 — Commit + Push Commands.md"
git commit -m "vault: HQ Phase 4 — voice memo -> lead

- 5 Decisions.md rows (2026-04-24): scope (voice only), Claude-no-audio
  plan revision, hold-to-record entry point, fallback-on-failure
  policy, no source migration needed.
- Session Notes 2026-04-24 (late) entry with file-by-file breakdown.
- Next Session Primer 'What shipped' block updated.
- Commit commands doc extended with Phase 4 (this file)."
```

## Step 3 — push (after all commits)

```sh
git push origin main
```

Vercel auto-deploys on push. Watch the deploy at vercel.com or via
the MCP (`list_deployments` for the `triple-j-website` project).

## Step 4 — verify live

On your phone (dark mode on):
- `/hq` — headings should read in iOS stack, not the heavy condensed face.
- `/hq/more` — grouped list, chevrons, badges.
- `/hq/more/stats` — Pipeline/Conversion/Revenue/Operations groups + funnel chart.
- `/hq/quotes/new` — 4-step wizard, step progress bar, slide transitions.
- `/hq/gallery` — all dark-mode surfaces, no white cards.
- Tap a solid button — scale-95 feel. Tap a list row — surface wash. Consistent across the app.

## Step 5 — Phase 4 env + test

Before testing voice memo, add the OpenAI key:

```sh
vercel env add OPENAI_API_KEY production --sensitive
# Paste your key from platform.openai.com → API keys
```

Confirm Anthropic is already set (silently used by permit-extractor.ts):

```sh
vercel env ls production | grep -i anthropic
```

If it isn't, add it:

```sh
vercel env add ANTHROPIC_API_KEY production --sensitive
```

Redeploy or wait for the next push (Vercel picks up env on new builds).

Then on your iPhone 16 Pro, open the HQ PWA, and:
- **Hold the + button 0.5s+.** Overlay appears. First time, iOS asks for mic permission → tap Allow.
- Say something like: "Hey this is John Smith, 254-555-1234, I need a 30 by 50 carport in Killeen, as soon as possible."
- **Release.** Overlay flips to "Transcribing…" for ~3 seconds, then "Lead created", then you land on `/hq/leads/[id]`.
- Verify the fields look right (name = "John Smith", phone, service = "carport", width/length = "30"/"50", timeline = "asap", city ≈ "Killeen"). Transcript is in the message field for audit.
- Test a deliberately gibberish memo → should still land on a lead with transcript preserved + "extraction failed" banner in the message field. Edit fields inline.
- Test a very short press (<0.5s) on `+` → CreatePopover should open normally (unchanged behavior).
