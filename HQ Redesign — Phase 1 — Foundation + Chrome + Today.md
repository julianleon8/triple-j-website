# HQ Redesign — Phase 1 — Foundation + Chrome + Today

_One of 5 phased plans for the full HQ iPhone PWA redesign. Open this in its own long-form Claude session. Sibling plans: Phase 2 (Leads + Jobs + Customers), Phase 3 (Quotes + Gallery + More + Stats), Phase 4 (Voice + Camera + Receipt OCR), Phase 5 (Twilio SMS + Offline Queue + Push Categories)._

_Branch: `claude/redesign-iphone-pwa-app-5V1Cn` (push to main authorized; Vercel auto-deploys)._

---

## Read first
- `CLAUDE.md` + `AGENTS.md` (project rules, "this is NOT the Next.js you know")
- `Next Session Primer.md` (current state of the world)
- `Decisions.md` rows 2026-04-23 (magazine redesign, dark-mode flip, design tokens already flip)

## Context
Julian just redesigned the public marketing site into a "magazine" editorial language (Barlow Condensed + red eyebrow pills + brand-blue accents + dark editorial spreads). The HQ iPhone PWA at `/hq/*` is still running pre-redesign chrome — works fine, but doesn't feel like a 2026 pro iPhone app. This phase is the visual + chrome foundation that every subsequent redesign phase sits on top of. Behavior stays mostly unchanged; this phase is about how the app *feels* on iPhone.

Locked design direction (35-question AskUserQuestion intake, 2026-04-24):
- Color mode: follow iOS `prefers-color-scheme` (keeps 2026-04-23 decision)
- Visual language: **iOS-native** (NOT the magazine language from marketing). SF Pro Display + system materials + Lucide icons. Marketing site keeps Barlow; the app is a tool, not a brochure.
- Accent: brand blue `#1e6bd6` light / `#4d8dff` dark (current)
- Bottom tabs: **5 tabs** — Today · Leads · Jobs · Gallery · More
- Drop center FAB. Put `+` top-right on each screen as an iOS-style popover menu.
- Header: iOS large-title that collapses to 17px on scroll (already works — keep)
- Avatar top-right → navigates to `/hq/settings` full screen (drop the dropdown)
- Today screen: Next Action hero card + unified "Needs Attention" feed + compact KPI strip (full Stats moves to More in Phase 3)
- Row style: iOS Messages (circular avatar + name + preview + timestamp + unread dot)
- Input style: floating-label outlined inputs (deferred to Phase 2 when forms start)
- Haptics: subtle + strategic (Vibration API on swipe commits, long-press, successful save)
- Icons: Lucide-React (replace the hand-rolled inline SVGs)

## Scope (this phase)
1. **Font + icon foundation** inside the `/hq` scope only — marketing keeps Barlow + Inter.
2. **Chrome rewrite** — `HqChrome`, `BottomTabBar`, `HqHeader`: 5 tabs, no FAB, avatar → settings, `+` popover.
3. **Today screen** — `/hq` page redesigned: Next Action hero + Needs Attention feed + compact KPI strip + Messages-style rows.
4. **Haptics hook** — shared primitive used in Phase 2+ swipe actions.
5. **Popover `+` menu component** — replaces the `CreateActionSheet` bottom sheet.

## File-level changes

### New files
- `src/lib/hq/haptics.ts` — `useHaptics()` hook wrapping `navigator.vibrate`. Exports `tap()` (10ms), `success()` (20ms), `warn()` (25+50+25 pattern), `error()` (50+100+50), respects a `hq_haptics_disabled` localStorage flag for later Settings toggle.
- `src/components/hq/CreatePopover.tsx` — anchored popover (no framer-motion; pure CSS transform + click-outside). Action rows: New Lead · New Customer · New Quote · New Job · (Camera — stub for Phase 4). Lucide icons + haptic tap on open.
- `src/app/hq/components/NextActionCard.tsx` — server component. Queries the top-priority action across `leads`, `permit_leads`, `quotes`, `jobs` using a single scored query (reuse `buildPipeline` in `src/lib/pipeline.ts`). Renders big card: eyebrow (reason) + title (name/subject) + subtitle (value/city) + two buttons: primary (Call/Open) + secondary (Dismiss until refresh). iOS blue tint on dark surface.
- `src/app/hq/components/NeedsAttentionFeed.tsx` — server component. Unified urgency-sorted feed (NEW leads, HOT permits, ASAP leads, quotes expiring ≤48h, quotes sent + no response ≥72h, jobs scheduled today, jobs no-photo ≥7d). Reuses `PipelineList` + `ListRow` with a new urgency-weighted sort. Pull-to-refresh via existing `PullToRefresh`.
- `src/app/hq/components/CompactKPIStrip.tsx` — server component. 4 tiny tiles at bottom of Today: Revenue MTD · Leads this week · Win rate · Avg ticket. Tap → `/hq/more/stats` (built in Phase 3). Reuses `KPICard` with a dense variant.

### Modified files
- `src/app/layout.tsx` — no font changes (marketing still uses Inter + Barlow).
- `src/app/hq/layout.tsx` — **add** `font-(--font-ios)` on the wrapper so `/hq/*` renders in SF Pro Display + system stack. Marketing layout untouched.
- `src/app/globals.css` — add one new token: `--urgent-bg: #dc2626` (light) / `#ef4444` (dark) for the COLD banner Phase 2 will use; add `--haptic-duration` custom prop for ref. No changes to existing tokens (audit confirmed they already flip correctly for dark mode).
- `src/app/hq/components/HqChrome.tsx` — keep skeleton. Change desktop `NAV` to match the new 5-tab IA: Today · Leads · Jobs · Gallery · More. Drop the desktop dropdown items that now live in `/hq/more`.
- `src/app/hq/components/BottomTabBar.tsx` — rewrite. Remove center FAB + CreateActionSheet lazy import. 5 equal tabs with Lucide icons: `Home` (Today) · `Inbox` (Leads) · `Hammer` (Jobs) · `Images` (Gallery) · `MoreHorizontal` (More). Active = `--brand-fg` text, inactive = `--text-tertiary`.
- `src/app/hq/components/HqHeader.tsx` — three changes: (1) avatar button `onClick` → `router.push('/hq/settings')` instead of toggling the dropdown. Remove menu state + MenuItem component. (2) Add `+` button left of the avatar (Lucide `Plus`), opens `CreatePopover`. (3) Swap `font-(--font-ios)` for SF Pro Display explicit stack (already matches audit).
- `src/app/hq/page.tsx` — rewrite Today. Tab-at-funnel case is removed (Funnel becomes `/hq/leads` in Phase 2; this phase stubs a redirect from `?tab=funnel` → `/hq/leads`). Renders: `<NextActionCard />` → `<NeedsAttentionFeed />` → `<CompactKPIStrip />`.
- `src/app/hq/components/CreateActionSheet.tsx` — **DELETE** (superseded by `CreatePopover`).
- `package.json` — add `lucide-react` (tree-shakable; ~1KB per imported icon).

### Not touched this phase
- Lead detail, Jobs, Customers, Quotes, Gallery, More tab, Stats screen → Phase 2–3
- Voice memo, camera, receipt OCR, Twilio SMS, offline queue, push categories → Phase 4–5
- Marketing site → fully locked, do not touch

## Reused utilities (from audit)
- `src/lib/pipeline.ts` — `buildPipeline`, `PipelineRow`, status class maps. Extend with `urgencyScore(row: PipelineRow)` for Needs Attention sort. Don't rewrite the shape.
- `src/components/hq/PipelineList.tsx` — reuse filter+list mechanics; NeedsAttentionFeed wraps it with a pre-filtered row set and no filter pills.
- `src/components/hq/ListRow.tsx` — restyle the internals to iOS Messages (circular avatar with initials on colored bg + 2-line preview + timestamp top-right). Keep 3-zone layout + 64px min-height (Apple HIG).
- `src/components/hq/PullToRefresh.tsx` — keep as-is. Wraps NeedsAttentionFeed.
- `src/components/hq/SwipeActions.tsx` — keep the gesture engine. Phase 2 will wire the new Call + Action-drawer gestures.
- `src/components/hq/Sheet.tsx` — keep. Phase 2+ use it for the Action drawer.
- `src/components/hq/InstallPrompt.tsx`, `ServiceWorkerRegistrar.tsx`, `OfflineBadge.tsx`, `PushOptIn.tsx` — no change this phase.
- Design tokens in `src/app/globals.css` lines 1–149 — already dark-mode-flip correctly (audit confirmed). Build on top.

## Commands (when executing)
```bash
npm install lucide-react
npm run dev           # verify /hq renders in SF Pro + new 5-tab bar
npm run typecheck
npm run build         # catch any missed import
```

## Verification
1. Desktop Chrome + iPhone Safari PWA: open `/hq` — SF Pro renders, marketing `/` still renders Barlow + Inter. (If you see Barlow inside `/hq`, the layout font swap didn't take.)
2. Bottom tab bar shows 5 tabs with Lucide icons. Tapping each navigates without full reload (transitions via `router.push`).
3. No center FAB. `+` appears top-right of every `/hq/*` screen. Tap → popover with 4 actions + camera stub. Tap outside → closes. Haptic tap fires on open.
4. Avatar top-right → lands on `/hq/settings`. Back arrow returns.
5. Today screen renders Next Action card at top, Needs Attention feed mid, KPI strip at bottom. Pull-to-refresh works. Scrolling collapses the large title to compact.
6. Dark-mode flip: toggle iPhone to dark → all HQ surfaces flip (already works via tokens). Toggle back to light → flips back.
7. `npm run build` passes with no new warnings.
8. After deploy: Lighthouse PWA audit score ≥ 90. No new bundle-size regression (Lucide icons tree-shake).

## Commit + deploy
One clean commit per atomic change, or a single "Phase 1: HQ foundation + chrome + Today" commit if the changes land together. Push to `main` — Vercel auto-deploys.
