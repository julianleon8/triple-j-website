# Perf baseline — 2026-04-25

Snapshot of the production-build bundle composition + the field metrics we'll re-measure after the perf push lands.

**Important context:** the initial planning hypothesis was that a single 1.3 MB JS chunk shipped to every visitor. **That turned out to be wrong** — that chunk is `heic2any`, and it's already gated behind `await import('heic2any')` in [src/lib/heic-convert.ts:30](../src/lib/heic-convert.ts#L30). It only loads when the user actually uploads a HEIC photo. The real first-load story is more modest, and the perf wins available are smaller than first estimated. The plan still holds — just don't expect "1.3 MB → 500 KB" headlines.

---

## Bundle composition (from `.next/static/chunks/`, 2026-04-25 build)

### Always loaded on every HQ page first-paint

| Chunk | Size | Contents (verified by symbol grep) |
|---|---|---|
| `framework-0d4f020a*.js` | 188 KB | React + ReactDOM (framework) |
| `4bd1b696-df4c0fb*.js` | 196 KB | ReactDOM client (framework) |
| `6511-0eb6f8c*.js` | 224 KB | Next.js App Router client runtime (`isJavaScriptURLString`, `extractInfoFromServerReferenceId`, server-action helpers) |
| `main-86683ae*.js` | 140 KB | App entrypoint glue (framework) |
| `polyfills-42372ed*.js` | 112 KB | Browser polyfills (framework) |
| `webpack-e970ad4*.js` | 4 KB | Webpack runtime |
| **Subtotal — framework + Next** | **864 KB** | None of this is reducible without dropping Next 16. |

### Conditionally loaded (depends on the page)

| Chunk | Size | What | Loaded on |
|---|---|---|---|
| `4188-7052048*.js` | 152 KB | Supabase JS client (`@supabase/supabase-js` + `@supabase/ssr`) | Every HQ page that uses a client component reaching the DB |
| `8559-46e0e8b*.js` | 128 KB | framer-motion (`framer`, `LayoutGroup`, `MotionConfig` symbols confirmed) | Currently every HQ page via `HqHeader` → `CreatePopover` → `VoiceRecordingOverlay` chain, plus `Sheet`/`Lightbox`/`SwipeActions`/`JurisdictionStack` on detail pages. **Phase 1 target — isolate to where it's actually used.** |

### Lazy-loaded — ONLY loads on demand

| Chunk | Size | What | Trigger |
|---|---|---|---|
| `e99863e0.28aaa12e*.js` | **1320 KB** | `heic2any` (HEIC → JPEG conversion) | `await import('heic2any')` in [heic-convert.ts:30](../src/lib/heic-convert.ts#L30). Loads only when a user picks a HEIC file in `JobPhotoStrip` or `GalleryManager`. **Already correct — leave alone.** |
| `7293-f5249e7*.js` | 304 KB | recharts | `next/dynamic` in [LazyCharts.tsx](../src/components/hq/LazyCharts.tsx). Loads only on `/hq/more/stats`. **Already correct.** |
| `3764-dde55b1*.js` | 56 KB | recharts (split chunk) | Same as above |
| `8569.3bfb300*.js` | 16 KB | recharts (split chunk) | Same as above |
| `7952-f67964f3*.js` | 20 KB | hCaptcha widget | Loaded eagerly inside `QuoteForm` + `PartnerInquiryForm` — **Phase 1 target — defer until form interaction.** |

### First-load JS estimate per surface

| Surface | First-load JS (estimate) | Comment |
|---|---|---|
| `/hq` home (Today) | ~1.0 MB | Framework (864 KB) + Supabase (152 KB) + framer-motion (128 KB via HqHeader chain) |
| `/hq/jobs/[id]` | ~1.0 MB | Same as above (HqHeader is shared) |
| `/hq/leads` | ~1.0 MB | Same |
| `/` (homepage) | ~880 KB | Framework + framer-motion (via QuoteForm) — no Supabase client |
| `/military`, `/services/*`, `/locations/*` | ~880 KB | Same as homepage |

After Phase 1 — target deltas:

| Surface | Target first-load | Delta |
|---|---|---|
| `/hq` home | ~870 KB | −130 KB (framer-motion gone via lazy-load, since HqHeader's recording overlay is rare) |
| `/hq/leads/[id]` | ~870 KB | Same; framer-motion still loads on Sheet/Lightbox interaction but not before |
| `/` homepage | ~750 KB | −130 KB (framer-motion lazy) + some hCaptcha deferral wins |

So the realistic Phase 1 win is **~130 KB shaved off every HQ + marketing first-load**. Not the headline number originally pitched, but compounds across every visitor every session.

---

## Field metrics — 7-day INP / LCP / CLS

**Action required from user**: paste the 7-day p75 numbers from Vercel Speed Insights → "Real Experience Score" page below. The CLI doesn't expose those; the dashboard does.

URL: `https://vercel.com/<org>/triple-j-website/speed-insights`

| Surface | INP (p75) | LCP (p75) | CLS (p75) | Notes |
|---|---|---|---|---|
| `/hq` (Today) | TBD | TBD | TBD | |
| `/hq/leads` | TBD | TBD | TBD | |
| `/hq/leads/[id]` | TBD | TBD | TBD | |
| `/hq/jobs/[id]` | TBD | TBD | TBD | |
| `/` (homepage) | TBD | TBD | TBD | |
| `/locations/[slug]` | TBD | TBD | TBD | |
| `/military` | TBD | TBD | TBD | |

Until those land, Phase 1's verification will rely on:
- Bundle-size delta (concrete, lab-measurable on every push).
- Local Lighthouse runs against `npm run dev` for a directional sanity check.

---

## Plan-impacting findings

1. **The 1.3 MB chunk is a non-issue for first-load.** Original "1.3 MB → 500 KB" Phase 1 target dropped — biggest available bundle win is now ~130 KB (framer-motion isolation).
2. **framer-motion bleeds onto every HQ page** via `HqHeader → CreatePopover → VoiceRecordingOverlay` import chain. This is the highest-leverage lazy-load in the plan — moves framer-motion off `/hq`, `/hq/leads`, etc. unless the user actually long-presses `+`.
3. **Supabase JS client (152 KB)** is the second-largest avoidable contributor. Would need a deeper refactor to push DB calls fully server-side; punt to a follow-up.
4. **Pagination on `/hq/leads`** still applies — server-time win, not bundle-size.
5. **`@next/bundle-analyzer` install skipped** — chunk-grep gave us what we needed without modifying `next.config.ts` and reinstalling deps.

---

## Re-measurement after each phase

`npm run build` → re-extract this same bundle table → diff against above. Each phase's commit should include the new chunk sizes in its commit body so the trajectory is visible in `git log`.

Field metrics need 24+ hours of post-deploy data to produce meaningful p75 numbers. After Phase 5, paste the new field numbers into the "Field metrics" table to compute the user-felt deltas.
