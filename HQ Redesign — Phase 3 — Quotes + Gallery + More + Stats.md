# HQ Redesign — Phase 3 — Quotes + Gallery + More + Stats

_One of 5 phased plans for the full HQ iPhone PWA redesign. Depends on Phases 1 + 2. Sibling plans: Phase 1 (Foundation + Chrome + Today), Phase 2 (Leads + Jobs + Customers), Phase 4 (Voice + Camera + Receipt OCR), Phase 5 (Twilio SMS + Offline Queue + Push Categories)._

_Branch: `claude/redesign-iphone-pwa-app-5V1Cn` (push to main authorized; Vercel auto-deploys)._

---

## Read first
- `CLAUDE.md` + `AGENTS.md`
- `HQ Redesign — Phase 1` (design language) + `Phase 2` (shared primitives: `<Input/>`, `<SegmentedControl/>`, `<MessagesRow/>`, activity timeline pattern)
- Existing quote builder code under `src/app/hq/quotes/` + `src/app/hq/quotes/new/` + `src/app/hq/quotes/[id]/`

## Context
Phases 1 + 2 shipped the core daily-use screens. This phase rebuilds the last three areas: the **4-step quote builder** (the single longest form in the app), the **Gallery** (restyled only), and a new **More** tab that holds the overflow nav (Permits · Customers · Quotes · Partners · Settings · Stats). Stats gets its own dedicated screen with charts — this is where the full KPI breakdown lives (Today only shows the compact strip from Phase 1).

Locked design direction for this phase:
- Quote builder: **4-step iOS flow** — Customer → Items → Totals → Review/Send. Progress dots at top. Back button left, Next button right (or "Send" on step 4).
- Native iOS wheel pickers via HTML5 `<input type="date">` for valid-until.
- Gallery: restyled to iOS-native grid (no behavior change; upload pipeline stays the same).
- More tab: iOS Settings-style grouped rows with icons.
- Stats screen: Recharts + Sparklines + Funnel (all already in deps), organized in 4 groups (Pipeline · Conversion · Revenue · Operations).

## Scope (this phase)
1. **Quote builder `/hq/quotes/new`** — rebuild as a 4-step flow.
2. **Quote detail `/hq/quotes/[id]`** — restyled to match Job detail pattern (hero card + status + action buttons).
3. **Gallery `/hq/gallery`** — restyled grid + lightbox.
4. **More tab `/hq/more`** — new route. iOS Settings-style grouped rows.
5. **Stats screen `/hq/more/stats`** — new route. Full KPI breakdown + charts.
6. **Settings hub `/hq/settings`** — restyle to match More design (grouped rows).

## File-level changes

### New files
- `src/app/hq/more/page.tsx` — the More tab. 3 groups:
  - **Pipeline**: Permits · Customers · Quotes · Partners (each links to existing screens)
  - **Insights**: Stats · Activity log
  - **System**: Settings · Sign out
  Each row: Lucide icon + label + chevron + optional count badge (e.g. Permits "12 hot"). Uses iOS grouped-inset pattern.
- `src/app/hq/more/stats/page.tsx` — Stats screen. Groups:
  - **Pipeline** (4 KPI cards + lead-funnel chart — reuse `Funnel.tsx`)
  - **Conversion** (win rate sparkline + quote-to-job conversion sparkline)
  - **Revenue** (MTD bar chart + avg ticket + balance due)
  - **Operations** (jobs in progress + scheduled this week + gallery-coverage % + stale-lead count)
  Reuses `KPICard`, `Sparkline`, `Funnel`, `ChartContainer`. Server-renders data in parallel (pattern from current `StatsSection.tsx`).
- `src/app/hq/quotes/new/_components/QuoteWizard.tsx` — client component, 4-step state machine:
  - Step 1 **Customer**: pick existing (search-filterable `<Input/>` with typeahead) OR "+ Create new" (opens a sub-form using Phase 2 `<Input/>` components).
  - Step 2 **Items**: line-item editor. Pick from `quote_templates` seeded list OR add custom line. Each line: description + qty + unit price. Running subtotal at bottom.
  - Step 3 **Totals**: review subtotal + tax (editable, default 0.0825 TX) + total. Optional internal note + valid-until (native date picker).
  - Step 4 **Review/Send**: preview of the quote email. "Save as draft" OR "Send now". Send posts to existing `/api/quotes` + `/api/quotes/[id]/send`.
  Progress: 4 dots + slim progress bar (25% / 50% / 75% / 100%). Slide animation between steps (reuse the `.step-slide-in` keyframe already in `globals.css` from QuoteForm on the marketing site).
- `src/components/hq/ui/GroupedList.tsx` — iOS-style grouped list. Props: `groups: {title, rows: GroupedRow[]}[]`. Used on More + Settings.
- `src/components/hq/ui/GroupedRow.tsx` — single row: icon + label + optional badge + optional trailing-value + chevron.

### Modified files
- `src/app/hq/components/BottomTabBar.tsx` — "More" tab link `href` changes from `#` (stubbed in Phase 1) to `/hq/more`.
- `src/app/hq/quotes/new/page.tsx` — rewrite as `<QuoteWizard />` host page.
- `src/app/hq/quotes/[id]/page.tsx` — restyle to hero card (quote# + status + customer) + line items list + action buttons (Send · Resend · Mark Accepted · PDF).
- `src/app/hq/quotes/page.tsx` — restyle list (default ListRow variant — Quotes don't warrant Messages style; status + amount matter more than avatars).
- `src/app/hq/gallery/page.tsx` — restyle grid: 3-col on small, 4-col on medium, with tap-to-open lightbox. Keep upload/CRUD logic.
- `src/app/hq/settings/page.tsx` — rewrite to use `<GroupedList>`. Keep the sub-screens (notifications, testing, logs, quickbooks) — just rewrap the index.
- `src/app/hq/components/HqHeader.tsx` — `titleFor()` adds `/hq/more`, `/hq/more/stats`.
- `src/app/hq/permit-leads/page.tsx`, `src/app/hq/partners/page.tsx` — minor restyle to match the iOS-native language (Input swaps, SegmentedControl where applicable, MessagesRow for the permit list since rows have enough narrative content).

### Database
- No new tables. Existing `quotes` + `quote_line_items` + `quote_templates` schemas cover the builder (per audit).

## Reused utilities (from audit + Phase 2)
- `src/components/hq/KPICard.tsx` — dense variant on Today (Phase 1), normal variant on Stats.
- `src/components/hq/Sparkline.tsx`, `Funnel.tsx`, `ChartContainer.tsx`, `LazyCharts.tsx` — Stats screen.
- `src/components/hq/ui/Input.tsx` (Phase 2) — quote builder typeahead + all inline forms.
- `src/components/hq/ui/SegmentedControl.tsx` (Phase 2) — Quotes list status filter (All / Draft / Sent / Accepted).
- `src/lib/hq/haptics.ts` (Phase 1) — step transitions get `tap()`, send-quote success gets `success()`.
- `src/app/api/quotes/*` — existing. `POST /api/quotes`, `PATCH /api/quotes/[id]`, `POST /api/quotes/[id]/send`, `POST /api/quotes/[id]/pdf` — verify each works with the new flow before refactoring.
- `src/lib/qbo.ts` — Phase 4 will use this for receipt pushes; not touched here.

## Verification
1. `/hq/more` renders the grouped list. Every row navigates.
2. `/hq/more/stats` renders all KPI groups + 3 charts (funnel, sparkline, bar). Numbers match Supabase when spot-checked.
3. `/hq/quotes/new`:
   - Step 1: customer typeahead finds existing customers; "+ New" creates one and forwards to Step 2.
   - Step 2: add 3+ line items, one from template + two custom. Subtotal updates live.
   - Step 3: tax + valid-until render; native date wheel picker opens on iPhone.
   - Step 4: preview is readable. "Send now" posts to `/api/quotes/[id]/send`, haptic success fires, redirects to `/hq/quotes/[id]`.
4. `/hq/quotes/[id]` — hero card shows status pill, amount, customer name. Action buttons route correctly.
5. `/hq/gallery` — grid layout clean on iPhone 13+/16 Pro widths. Upload still works. Lightbox opens on tap.
6. `/hq/settings` renders as grouped list; all sub-screens still reachable. Sign-out still works.
7. Dark mode flip verified on all new screens.
8. `npm run typecheck && npm run build` pass.

## Commit + deploy
Suggested commits: `more: grouped tab + stats screen` → `quotes: 4-step wizard builder` → `quotes: detail + list restyle` → `gallery: ios grid + lightbox` → `settings: grouped list restyle`. Push to `main`.
