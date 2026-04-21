# Gallery v2 — Phased Plan

## Context

The original Phase 2c plan is one monster session. Slicing it into 5 self-contained phases so Julian can run each as a fresh Claude session and commit between them. Each phase ships independently, has a narrow review surface, and doesn't block the next one from starting cold.

**Scope cuts from original plan:**
- Wave H (insulation) → split to its own plan, not here.
- Wave G (verify) → folded into each phase's Verify section, not a phase.

**Dependency chain:** P0 anytime → P1 → P2 → P3 → P4. Skipping a phase is fine; reordering P1→P3 is not.

**Branch:** each phase pushes to its own branch off `main` (not this planning branch). Planning branch stays for the plan doc + vault durability only.

**Gotcha to pass forward:** `PANEL_COLORS` in `src/lib/colors.ts` uses capitalized `'Turnium' | 'Sheffield'`. New DB columns `panel_color_line` / `trim_color_line` should store lowercase (`'turnium' | 'sheffield'`) — helper in P2 handles the mapping.

---

## Phase 0 — Vault durability (this branch, no src/)

**Why now:** locks the plan + post-merge todos into the repo before any code work starts.

**Do:**
- Save this plan as `Gallery v2 Plan.md` at repo root.
- Append to `Session Notes.md`: a dated "Phase 2a post-merge todos" block (Twilio env vars, `NEXT_PUBLIC_GOOGLE_REVIEW_URL`, `CRON_SECRET`, apply `007_sms_events.sql`, end-to-end SMS test — all deferred until Julian has the company phone number in hand).
- Append to `Decisions.md`: one row noting `/services/colors` + `/services/pbr-vs-pbu-panels` are already live; `src/lib/colors.ts` is the canonical color source for gallery metadata.

**Files:** `Gallery v2 Plan.md` (new), `Session Notes.md`, `Decisions.md`.

**Verify:** `git diff` shows 3 vault files; no `src/` touched.

**Commit + push:** this planning branch.

---

## Phase 1 — Schema (DB only, no code)

**Why:** land the data model before any UI touches it. Reversible via a drop migration if needed.

**Do:**
- New `supabase/migrations/008_gallery_v2.sql`:
  - Additive on `gallery_items` (all nullable): `panel_color`, `panel_color_line`, `trim_color`, `trim_color_line`, `panel_profile`, `gauge`, `is_featured bool default false`.
  - New `gallery_photos` (id, gallery_item_id FK cascade, image_url, alt_text, sort_order, is_cover, created_at). Index on `(gallery_item_id, sort_order)`. Partial unique index on `gallery_item_id where is_cover`.
  - RLS: copy shape from migration `003_gallery.sql` (public SELECT, auth-only write).
  - Backfill: one `gallery_photos` row per existing `gallery_items` row, `image_url` copied over, `is_cover=true`, `sort_order=0`. Covers the 6 seed rows in `003_gallery.sql`.
- Keep `gallery_items.image_url` — removal scheduled later.

**Files:** `supabase/migrations/008_gallery_v2.sql` (new).

**Verify:** Julian applies via Supabase dashboard. Query `gallery_photos` → 6 rows, each `is_cover=true`. `/gallery` still renders unchanged (code still reads `image_url`).

**Branch:** `claude/gallery-v2-schema`.

---

## Phase 2 — Public read side

**Why:** unlock featured pin + detail pages + color line using backfilled cover photos. Works even with all metadata null.

**Do:**
- New `src/lib/gallery-colors.ts` — `describeGalleryColors({ panelColor, panelColorLine, trimColor, trimColorLine })` → `{ panel?, trim?, label }`. Resolves slugs against `PANEL_COLORS` (maps lowercase line → capitalized TS enum). `label` is `null` when neither is set.
- Modify `src/app/(marketing)/gallery/page.tsx`: query join `gallery_photos`, take cover; sort `is_featured desc, sort_order asc`; wrap each card in `<Link href="/gallery/${id}">`; render color line via helper when present.
- Modify `src/components/sections/Gallery.tsx` (homepage): same sort + cover-from-photos + `<Link>` wrap. First cell already row/col-span-2 = featured naturally.
- New `src/app/(marketing)/gallery/[id]/page.tsx` — server component, mirror structure of `services/[slug]/`. Hero = cover photo (ink-900 + brand-400 eyebrow). Body = responsive grid of remaining photos with native `<dialog>` lightbox (no new dep). Sidebar: title, city, type, tag, panel/trim colors (linked to `/services/colors#${slug}`), profile, gauge. CTA "Build one like this" → `/#quote`. `generateStaticParams` pre-renders all `is_active=true`.

**Files:** `src/lib/gallery-colors.ts` (new), `src/app/(marketing)/gallery/page.tsx`, `src/components/sections/Gallery.tsx`, `src/app/(marketing)/gallery/[id]/page.tsx` (new).

**Verify:** `npx tsc --noEmit` (tolerate 4 pre-existing PageProps errors). `/gallery` — 6 seeds render, no color line, cards link to `/gallery/[id]`. Detail page shows cover + empty grid + sidebar without color/profile. Homepage hero cell = first-sorted item.

**Branch:** `claude/gallery-v2-public`.

---

## Phase 3 — Dashboard editor + write APIs

**Why:** give Julian the tools to add photos + tag colors + pin featured.

**Do:**
- Modify `src/app/hq/gallery/components/GalleryManager.tsx`: inline Edit panel per card (metadata form: title, city, type, tag, panel color 2-level select [line → color from `PANEL_COLORS`], trim color same, panel profile radio, gauge radio, featured toggle, alt_text). Photo strip: thumbnails + existing up/down arrow pattern for reorder + star-icon set-cover + per-photo delete + "Upload more photos" input. Feature/Unfeature toggle + N-photos badge on each card.
- Modify `src/app/api/gallery/route.ts` POST — accept new metadata; create initial `gallery_photos` cover row from the uploaded file.
- Modify `src/app/api/gallery/[id]/route.ts` PATCH — accept new metadata fields.
- New `src/app/api/gallery/[id]/photos/route.ts` — GET list, POST upload (multipart → Supabase Storage → `gallery_photos` insert).
- New `src/app/api/gallery/photos/[photoId]/route.ts` — PATCH (`sort_order`, `is_cover`), DELETE.
- Storage: reuse the existing `gallery` bucket. No new bucket.

**Files:** `src/app/hq/gallery/components/GalleryManager.tsx`, `src/app/api/gallery/route.ts`, `src/app/api/gallery/[id]/route.ts`, `src/app/api/gallery/[id]/photos/route.ts` (new), `src/app/api/gallery/photos/[photoId]/route.ts` (new).

**Verify:** upload a project, add a second photo, reorder, set cover, toggle featured, tag panel color Hunter Green. Switch to `/gallery` → card shows "Hunter Green panels" line; featured card pinned first; homepage hero cell reflects it.

**Branch:** `claude/gallery-v2-editor`.

---

## Phase 4 — iOS HEIC upload

**Why:** Julian uploads from iPhone. HEIC → JPEG conversion + multi-select + downsize. Depends on P3 photo endpoint.

**Do:**
- `npm install heic2any`.
- Modify upload input in `GalleryManager.tsx`: `accept="image/*,.heic,.heif"`, `multiple`. On change, per file: if HEIC/HEIF, dynamic `import('heic2any')` → convert to JPEG quality 0.85, rewrap as File. Optional canvas downsize cap at 2400px wide. Pass to existing `POST /api/gallery/[id]/photos`. Per-file spinner + success/failure pill.
- Graceful failure: show "Couldn't convert this HEIC — email the photo to yourself to force JPEG, or use iOS share-sheet Save as JPEG." No silent drop.

**Files:** `package.json`, `src/app/hq/gallery/components/GalleryManager.tsx`.

**Verify:** from iPhone (or a `.heic` fixture), select 3 photos of mixed formats → all land as JPEGs in Supabase Storage. Corrupt HEIC shows the failure pill, doesn't block the rest.

**Branch:** `claude/gallery-v2-heic`.

---

## Out of scope

- Wave H (insulation) — separate plan.
- Color filter UI on `/gallery?color=...` — deferred until enough rows are tagged.
- "See builds in this color" reverse link from `/services/colors` — depends on the filter.
- Per-color landing pages `/gallery/colors/[slug]` — SEO play, deferred.
- Dropping `gallery_items.image_url` — cleanup pass after P3 is stable.
- Phase 2b public-site visual overhaul — still blocked on inspiration screenshots.
