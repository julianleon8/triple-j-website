# HQ Redesign — Phase 3 — Reworked Brief

_Rewritten 2026-04-24 after the post-scaffolding review. Supersedes the original Phase 3 plan from commit `a9672d3`. Dependencies: Phases 1 + 2 already shipped on `main` (commits `10223a7`, `187f1f7`). Phase 3 scaffolding already in the working tree — this session ships the **design-language tightening pass + Gallery restyle** on top._

---

## Read first
- `CLAUDE.md` + `AGENTS.md` (project rules, vault discipline)
- `src/app/globals.css` (design tokens, motion language)
- `src/app/hq/components/{HqHeader,BottomTabBar}.tsx` (locked iOS chrome patterns)
- `src/components/hq/ui/{Input,SegmentedControl,GroupedList,GroupedRow}.tsx`
- Uncommitted Phase 3 tree: `src/app/hq/more/`, `src/app/hq/more/stats/`, updated `quotes/`, new `Lightbox.tsx`, new QuoteWizard under `quotes/new/_components/`

## Context
An earlier pass scaffolded the full Phase 3 surface (More hub, Stats screen, Gallery Lightbox, 4-step Quote wizard, quote list/detail restyle, Settings grouped-list restyle) but the design language drifted. This session locks the language, cleans the drift across existing code, then finishes the one thing that actually wasn't done: the Gallery restyle.

Top outcome: **clean daily-driver feel** — phone app feels tight and iOS-native from Today → Leads → Jobs → Customers → More.

## Locked design-language calls (2026-04-24)

1. **Typography scope** — `h1, h2, h3` Barlow Condensed rule in `globals.css` moves from `:root` into a `.marketing` scope. HQ layout stops inheriting the display face automatically; headings render in the iOS stack by default. Marketing layout wraps its tree in `<div className="marketing">` (or equivalent — easiest is a class on the `(marketing)` route group `<body>` replacement).
2. **Tap-feedback split** — two locked utilities in `globals.css`:
   - `.tap-solid` = `active:scale-95 transition-transform duration-150` → solid buttons (Send, Save, CTA tiles, filter New button).
   - `.tap-list` = `active:bg-[var(--surface-3)] transition-colors duration-150` → list rows, grouped rows, cards.
   - Destructive actions may keep `active:scale-95` + color shift.
3. **Brand token** — all HQ interactive brand usage uses `bg-(--brand-fg)` / `text-(--brand-fg)` / `border-(--brand-fg)`. Raw `brand-600` reserved for marketing. Phase 1+2 drift gets swept in the same pass.
4. **Icon weight** — Lucide `strokeWidth={2}` as the HQ default. `strokeWidth={2.3}` reserved for active-state (BottomTabBar pressed, HqHeader `aria-current`). Remove every ad-hoc `2.2 / 2.4`.

## Scope (this phase, in commit order)

### Commit 1 — Design-language locks (~30 lines of CSS)
- `src/app/globals.css`
  - Move `h1, h2, h3 { font-family: var(--font-display) ... }` block into `.marketing h1, .marketing h2, .marketing h3` so it only applies under marketing.
  - Add `.tap-solid` and `.tap-list` utilities (with `prefers-reduced-motion` guard).
  - Confirm HQ heading reset: add `h1, h2, h3 { font-family: inherit; font-weight: inherit; letter-spacing: 0; }` base reset so HQ gets iOS stack from `body`.
- `src/app/(marketing)/layout.tsx` — wrap children in `<div className="marketing">` (or add class to the existing top wrapper). Verify Barlow still loads on the public site.
- No HQ screen changes in this commit. Verification: visit `/` (Barlow still present) + `/hq` (Barlow gone from NextActionCard / MessagesRow headings).

### Commit 2 — HQ typography + brand-token sweep
- Audit every HQ screen for heading explicitness — where an `<h1>` / `<h2>` had relied on globals, confirm it now reads clean in iOS stack. Add `font-(--font-ios)` only where a component wants to force it (e.g. HqHeader large title already does).
- Grep-replace `bg-brand-600` → `bg-(--brand-fg)` and `text-brand-600` → `text-(--brand-fg)` inside `src/app/hq/` and `src/components/hq/`. Spot-check hovers/pressed states still have enough contrast in dark.
- Sweep Lucide `strokeWidth={2.2|2.3|2.4}` → `{2}` across `/hq` except BottomTabBar active (`2.3`) and HqHeader Plus button (keep `2.3` — it's a CTA affordance). Commit message captures the rule for future reference.

### Commit 3 — Tap-feedback migration
- Apply `.tap-solid` / `.tap-list` classnames to:
  - `QuoteWizard.tsx` Next/Back/Save/Send buttons
  - `QuoteDetailActions.tsx` primary buttons
  - `QuotesList.tsx` "+ New" pill
  - `GroupedRow.tsx` `<Link>` and `<button>` bodies
  - `HqHeader.tsx` Plus + avatar buttons
  - `MessagesRow.tsx` + `ListRow.tsx` row wrappers
  - `CreatePopover.tsx` buttons
- Remove one-off `active:scale-[0.99]`. Leave explicit `active:scale-95` + destructive `active:bg-red-500/20` on Trash buttons (QuoteWizard ItemsStep trash is a good example).

### Commit 4 — Gallery restyle (the real work)
- Rewrite `src/app/hq/gallery/components/GalleryManager.tsx` — keep upload/CRUD logic (HEIC conversion, folder drop, color picker, cover selection, reorder, delete). Rebuild the view layer:
  - **Project grid** — 2-col on `iPhone SE` width, 3-col default iPhone, 4-col `sm` and up. Each tile: square aspect, cover image, overlay gradient bottom, project title + city in small caps. Tap → inline expand showing the photo strip + metadata editor inside a `<GroupedList>` (reuse Phase 3 primitive).
  - **Upload sheet** — restyled as `<GroupedList>` groups: "Cover Photo" (file picker), "Details" (Title/City/Type/Tag/Panel/Gauge), "Colors" (panel + trim pickers), "Alt Text + Featured". Inputs swap to the shared `<Input />`. Cover-photo file picker uses the iOS-standard file input styling (black bg, brand-fg label).
  - **Photo editor** (per-project) — rebuild the list of photos as a 3-col grid with drag-to-reorder + per-photo menu (set cover, delete, replace alt). No `bg-white`, `text-gray-*`, `border-gray-*` left — all semantic tokens.
  - **Lightbox** — keep `Lightbox.tsx` but swap framer-motion's default ease to `cubic-bezier(0.22, 1, 0.36, 1)` via `transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}`. Consider dropping framer-motion entirely for a lighter CSS implementation — evaluate during the commit.
- Verify upload pipeline still works on iPhone 16 Pro Safari (file picker, HEIC convert, multi-select, reorder). Run the iOS multi-select bundling flow from commit `0228b7a`.

### Commit 5 — Decisions.md row
One row per locked call (typography scope, tap-feedback split, brand token, icon weight, gallery full restyle). Update `Session Notes.md` entry for 2026-04-24. Update `Next Session Primer.md`'s "What shipped" with a 4-5 line Phase 3 summary. Push to `main`.

## Out of scope (explicit)
- Voice / Camera / Receipt OCR (Phase 4)
- Twilio SMS threading / offline lead queue (Phase 5)
- QuoteWizard further redesign — scaffolding is good, tightening only
- New routes beyond what's already scaffolded (no `/hq/more/activity-log`, etc.)

## Verification
1. `/` + `/services` + `/locations/killeen` — Barlow Condensed still rendering on all magazine headings.
2. `/hq` + `/hq/leads` + `/hq/jobs` + `/hq/more` + `/hq/more/stats` + `/hq/quotes` + `/hq/quotes/new` + `/hq/settings` + `/hq/gallery` — every heading in iOS stack, every interactive brand in `--brand-fg`, every Lucide at stroke 2 except active-tab chrome.
3. Tap every solid button (Next, Send, + New, Save) — same scale-95 feedback. Tap every list row / grouped row / message row — same surface-3 wash feedback. No jitter drift.
4. Gallery: create a project from scratch on iPhone 16 Pro, reorder photos, open Lightbox, swipe through, close. Dark mode flip preserved throughout.
5. `npm run typecheck && npm run build` green. Commit directly to `main`; Vercel auto-deploy verifies.

## Commit sequence (again, in order)
1. `design: scope Barlow to marketing + add .tap-solid/.tap-list locks`
2. `hq: sweep typography + brand token + icon stroke drift across Phases 1-3`
3. `hq: apply locked tap-feedback utilities`
4. `hq gallery: full iOS-native restyle + lightbox ease fix`
5. `vault: Phase 3 Decisions.md rows + Session Notes update`
