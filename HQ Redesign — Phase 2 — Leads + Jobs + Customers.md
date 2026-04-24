# HQ Redesign — Phase 2 — Leads + Jobs + Customers

_One of 5 phased plans for the full HQ iPhone PWA redesign. Depends on Phase 1 being shipped (foundation + chrome + Today). Sibling plans: Phase 1 (Foundation + Chrome + Today), Phase 3 (Quotes + Gallery + More + Stats), Phase 4 (Voice + Camera + Receipt OCR), Phase 5 (Twilio SMS + Offline Queue + Push Categories)._

_Branch: `claude/redesign-iphone-pwa-app-5V1Cn` (push to main authorized; Vercel auto-deploys)._

---

## Read first
- `CLAUDE.md` + `AGENTS.md`
- `HQ Redesign — Phase 1 — Foundation + Chrome + Today.md` (design language + shared primitives already in place)
- `Decisions.md` for the 2026-04-24 design-intake row (will be logged after Phase 1 ships)

## Context
Phase 1 shipped the foundation + Today screen. This phase redesigns the three core pipeline screens — **Leads**, **Jobs**, **Customers** — plus the entity detail pages for each. These are the screens Julian opens 20+ times a day, so small UX gains compound. All work inside the already-locked iOS-native design language (SF Pro + Lucide + brand-blue + system-follow dark mode).

Locked design direction for this phase (from 35-question intake):
- Leads view: **inbox-style list** (like Mail) — newest first
- Segmented control filter: New · Hot · All · Done (iOS native pill-group, single-select)
- Lead age urgency: **red banner** on rows ≥12hr untouched ("COLD — 14hr no reply")
- Swipe gestures: right = **Call** (opens `tel:`), left = **Action drawer** (Mark Contacted · Send Quote · Delete)
- Lead detail hero: name + status + **big Call + SMS buttons** (SMS opens `sms:` until Phase 5 Twilio lands)
- Customer detail: **single activity timeline** (leads + quotes + jobs + notes merged chronologically)
- Job detail hero: **static Google Maps of the job address** with pin (tap = deep-link directions)
- Floating-label outlined inputs (shared across app from this phase forward)
- Native iOS wheel picker via HTML5 `<input type="date">` for job schedule + quote valid-until

## Scope (this phase)
1. **Leads tab** — new route `/hq/leads`, inbox list + segmented control + COLD banner + new swipe gestures.
2. **Lead detail** — new route `/hq/leads/[id]`, hero card + Call/SMS + full info scroll + convert-to-customer.
3. **Jobs tab** — restyle `/hq/jobs`, same iOS list pattern.
4. **Job detail** — restyle `/hq/jobs/[id]` (or add if missing), map hero + progress timeline.
5. **Customers tab** — restyle `/hq/customers` list.
6. **Customer detail** — new/rebuilt `/hq/customers/[id]`, activity timeline.
7. **Shared `<Input />` component** — floating-label outlined. Used from this phase onward.

## File-level changes

### New files
- `src/components/hq/ui/Input.tsx` — floating-label outlined. Props: `label`, `hint`, `error`, standard `<input>` attrs. Floating label animates up on focus or filled state. Dark-mode aware (tokens). Used by forms in all later phases.
- `src/components/hq/ui/SegmentedControl.tsx` — iOS native-style pill-group. Props: `value`, `onChange`, `options: {key, label, count?}[]`. Single-select. Used on Leads + future screens.
- `src/components/hq/ColdBanner.tsx` — thin red banner that overlays a row when `lead.created_at` is >12h and `status === 'new'`. One-liner text ("COLD — 14hr no reply").
- `src/components/hq/MessagesRow.tsx` — Messages-style row variant of `ListRow`: circular avatar (initials on colored bg seeded from name), name bold, 2-line preview (service + city + message snippet), timestamp top-right, unread blue dot if `status === 'new'`. Red left-edge bar when cold. Use for Leads + Customers lists.
- `src/components/hq/ActionDrawer.tsx` — left-swipe reveals a bottom-sheet action drawer (reuses `Sheet.tsx`). Props: `actions: {label, icon, tone, onPick}[]`. Haptic warn on destructive.
- `src/app/hq/leads/page.tsx` — new Leads tab. Server-fetches leads, renders `<SegmentedControl>` (New/Hot/All/Done) + `<MessagesRow>` list with swipe actions.
- `src/app/hq/leads/[id]/page.tsx` — Lead detail. Server component. Hero (name + status pill + service + city) + big `[Call] [SMS]` buttons + details card + message card + timeline (status history from `updated_at`) + "Convert to Customer" action.
- `src/app/hq/jobs/[id]/page.tsx` — Job detail. If exists: rebuild. Hero: static Google Maps image (geocode `job.address + city`) with pin, tap → `maps:` / `https://maps.google.com`. Status chip overlay + progress stepper (Scheduled → In Progress → Completed). Next-step card + customer + quote link + photos strip (pulls `gallery_items` where `job_id = X` — see Phase 4 for camera pipeline).
- `src/app/hq/customers/[id]/page.tsx` — Customer detail with activity timeline.
- `src/app/hq/customers/_components/ActivityTimeline.tsx` — client component. Merges `leads.where(customer_id)`, `quotes.where(customer_id)`, `jobs.where(customer_id)`, `customer_notes` (Phase 5 table) into a single chronological list with entity-typed icons. Tap any row → drills into that entity page.

### Modified files
- `src/lib/pipeline.ts` — add `isCold(row)` helper: true when `kind==='lead' && status==='new' && age > 12h`. Extend `urgencyScore` to weight cold leads higher.
- `src/components/hq/PipelineList.tsx` — add optional `variant?: 'messages' | 'default'` prop. Default keeps current ListRow; `'messages'` swaps in MessagesRow + removes filter-pill row (Leads tab uses SegmentedControl instead).
- `src/components/hq/SwipeActions.tsx` — add `hapticOnCommit: 'success' | 'warn' | 'error'` prop; fires via `useHaptics()` (from Phase 1).
- `src/app/hq/page.tsx` — Today's Needs Attention feed switches to `variant="messages"`.
- `src/app/hq/customers/page.tsx` — restyle list to MessagesRow + swipe-to-call.
- `src/app/hq/jobs/page.tsx` — restyle list. No segmented control (single status view); status lives as trailing pill.
- `src/app/hq/components/HqHeader.tsx` — `titleFor()` adds entries for `/hq/leads`, `/hq/leads/[id]` (falls back to customer name or "Lead"), `/hq/jobs/[id]` (falls back to job number), `/hq/customers/[id]` (falls back to customer name).
- `src/app/api/leads/[id]/route.ts` — ensure PATCH supports the swipe-action status writes (already does; verify). Add a GET if the detail page server-renders via `fetch()` (or use `getAdminClient()` directly — prefer the latter to skip a round trip).

### Database
- No new tables this phase. All data comes from existing `leads`, `customers`, `quotes`, `jobs` schemas (see audit).
- Verify `customers` table has the rows needed to render timeline joins (it does per audit).

## Reused utilities (from audit)
- `src/components/hq/SwipeActions.tsx` — framer-motion swipe. Extend with haptic prop; keep gesture engine.
- `src/components/hq/Sheet.tsx` — ActionDrawer sits inside this.
- `src/components/hq/PullToRefresh.tsx` — wraps each list.
- `src/components/hq/ListRow.tsx` — stays the default variant for Jobs/Permits/Quotes lists; MessagesRow is a new sibling for Leads + Customers.
- `src/lib/pipeline.ts` — helper extensions only.
- `src/app/api/leads/[id]/route.ts` — PATCH is the Contacted/status writer. Already exists.
- `src/lib/hq/haptics.ts` (from Phase 1) — `success()` on Call swipe, `warn()` on Delete confirm, `tap()` on SegmentedControl change.

### Google Maps static image
- Use Google Static Maps API: `https://maps.googleapis.com/maps/api/staticmap?center={address}&zoom=16&size=800x400&markers=color:red|{address}&key={KEY}`.
- Add `GOOGLE_MAPS_STATIC_KEY` to Vercel env. Gate with `NEXT_PUBLIC_GOOGLE_MAPS_STATIC_KEY` only if client-rendering (prefer server `<Image src={url}>`).
- Fallback: if env missing, render a typography-only "job address" card with the same CTA button. No ugly broken image.

## Verification
1. `/hq/leads` renders an inbox: messages-style rows, newest first, SegmentedControl (New/Hot/All/Done) with live counts.
2. Rows ≥12h old + status=new show the red COLD banner with age text.
3. Swipe right on a lead row → iPhone dials the number (`tel:` link triggers). Haptic success fires.
4. Swipe left on a lead row → ActionDrawer slides up with Contacted · Send Quote · Delete. Destructive gets warn haptic.
5. Tap a lead row → `/hq/leads/[id]`. Hero shows name + status + Call + SMS buttons. Call button works; SMS opens Messages app (Phase 5 will redirect to in-app threads).
6. `/hq/jobs/[id]` — Google Maps static image loads with pin on the address. Tap → native Maps deep-link opens directions. Missing env key falls back gracefully.
7. `/hq/customers/[id]` — activity timeline mixes entities chronologically. Tap any entry drills into that entity.
8. All forms (existing customer edit etc.) render with the new floating-label Input.
9. `npm run typecheck && npm run build` pass. Dark mode verified on iPhone.

## Commit + deploy
Suggested commits: `leads: inbox + segmented + cold banner + swipe actions` → `leads: detail page with call/sms hero` → `jobs: map hero on detail` → `customers: activity timeline` → `ui: floating-label Input component`. Push to `main`.
