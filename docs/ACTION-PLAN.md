# SEO Action Plan — triplejmetaltx.com

**Updated:** 2026-04-24
**Source:** FULL-AUDIT-REPORT.md (health score 73/100)
**Context:** Triple J's confirmed bottleneck is **lead volume**, not capacity. Every item is weighted by how much it moves real demand — not abstract score points.

---

## Critical — do this week

### A1. Fix title brand duplication (20 pages)
**Score impact:** +4 points on-page SEO. **Lead impact:** every SERP listing currently shows "| Triple J Metal LLC | Triple J Metal LLC" — reads as spam, hurts CTR.

**Where to fix (exhaustive):**
- [src/lib/locations.ts](src/lib/locations.ts) — strip trailing `| Triple J Metal LLC` from every city/county `metaTitle`
- [src/lib/services.ts](src/lib/services.ts) — same for every service page metadata
- [src/app/(marketing)/services/colors/page.tsx](src/app/(marketing)/services/colors/page.tsx)
- [src/app/(marketing)/services/pbr-vs-pbu-panels/page.tsx](src/app/(marketing)/services/pbr-vs-pbu-panels/page.tsx)
- [src/app/(marketing)/services/hybrid-projects/page.tsx](src/app/(marketing)/services/hybrid-projects/page.tsx)
- [src/app/(marketing)/services/page.tsx](src/app/(marketing)/services/page.tsx)
- [src/app/(marketing)/locations/page.tsx](src/app/(marketing)/locations/page.tsx)
- [src/app/(marketing)/service-areas/page.tsx](src/app/(marketing)/service-areas/page.tsx) (or delete per codebase-lean proposal below)
- [src/app/(marketing)/about/page.tsx](src/app/(marketing)/about/page.tsx)
- [src/app/(marketing)/contact/page.tsx](src/app/(marketing)/contact/page.tsx)
- [src/app/(marketing)/gallery/page.tsx](src/app/(marketing)/gallery/page.tsx)
- [src/app/(marketing)/partners/page.tsx](src/app/(marketing)/partners/page.tsx)
- [src/app/(marketing)/blog/page.tsx](src/app/(marketing)/blog/page.tsx)
- All 5 blog post pages (in their per-post metadata exports)

**Approach:** grep the codebase for the literal string `| Triple J Metal LLC` and remove the trailing occurrence. Keep [src/app/layout.tsx:42](src/app/layout.tsx#L42) `template: '%s | Triple J Metal LLC'` untouched — it does the job correctly on its own.

**Verify:** `curl -s https://www.triplejmetaltx.com/about | grep -oE '<title[^>]*>[^<]*</title>'` should show exactly one brand mention after redeploy.

### A2. Add `metadataBase` so canonicals resolve absolute
**Score impact:** +2 technical. **Lead impact:** hardens canonical signal against edge-case crawlers and duplicate-content risk.

**Fix:** [src/app/layout.tsx](src/app/layout.tsx) — add `metadataBase: new URL(siteUrl)` at the top of the `metadata` export.

```ts
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),  // ← add this
  title: { default: ..., template: ... },
  alternates: { canonical: '/' },   // now resolves to siteUrl/
  ...
}
```

All per-page `alternates: { canonical: '/slug' }` will then render as absolute URLs. Same fix transparently improves `og:image` resolution.

**Verify:** `curl -s https://www.triplejmetaltx.com/about | grep canonical` should return `href="https://www.triplejmetaltx.com/about"`.

### A3. Add alt text to the homepage hero + features
**Score impact:** +8 images. **Lead impact:** accessibility + image search; the hero is likely LCP so Google cares about semantics.

**Homepage images needing alt:**
- `red-iron-frame-hero.jpg` → `"Red iron welded frame going up on a Central Texas metal building site"`
- `logo-lion.png` → `"Triple J Metal LLC logo"` (or `alt=""` if purely decorative next to the wordmark)
- `carport-gable-residential.jpg` → `"Gable-roof residential metal carport installed in Bell County"`
- `metal-garage-green.jpg` → `"Green-panel custom metal garage built by Triple J"`
- `double-carport-install.jpg` → `"Double-bay metal carport install in Central Texas"`
- `porch-cover-lean-to.jpg` → `"Lean-to metal porch cover attached to a residential home"`

Fix in the component(s) that render these — likely [src/components/sections/Hero.tsx](src/components/sections/Hero.tsx), [src/components/sections/Services.tsx](src/components/sections/Services.tsx), and the marquee/testimonials components. If any `<Image>` is truly decorative, use `alt=""` explicitly.

### A4. Fix the shared 7-no-alt pattern across service + blog pages
**Score impact:** +5 images.

87% no-alt rate across service and blog pages — same 7 images per page — strongly suggests one shared component renders images without an alt prop. Likely culprits: the PreFooterCta image strip, the "you may also like" card row, or the FeaturedImage component used in the blog template.

**Diagnosis:** `grep -rn '<Image' src/components/sections/ src/app/\(marketing\)/blog/` and verify every `<Image>` has an `alt` prop. Fix at the component level — changes cascade.

### A5. Trim meta descriptions (27 pages over 165 chars)
**Score impact:** +3 on-page. **Lead impact:** SERP truncation currently cuts key CTA ("Call 254-…") on mobile.

**Target:** ≤155 chars on every non-legal page. Front-load the city + service + differentiator, trailing sentence gets the CTA.

**Worst offenders:**
- /locations/temple: 236 → trim to ~150
- /locations/belton: 235 → trim to ~150
- /locations/bell-county, /partners, /services/colors, /services/hybrid-projects, /home: all 208-225

Edit in [src/lib/locations.ts](src/lib/locations.ts), [src/lib/services.ts](src/lib/services.ts), and per-page metadata.

### A6. Trim titles (28 pages over 70 chars, blog posts 120-139 chars)
**Score impact:** +3 on-page.

After A1 fix (remove duplicate brand), most titles drop to 85-115 chars — still too long for most. Target ≤60 chars.

Example trims:
- Current: `Bell County Metal Building Permit Guide 2025: Temple, Belton & Killeen Requirements`
- Target: `Bell County Metal Building Permit Guide 2025`

- Current: `Blackland Prairie Soil and Metal Building Foundations: What Central Texas Homeowners Need to Know`
- Target: `Blackland Prairie Soil & Metal Building Foundations`

The template appends `| Triple J Metal LLC` (19 chars + separator) — leaves ~40 chars for the body.

---

## High — do this month

### A7. Add `sameAs` to LocalBusiness schema
**Blocked on:** Need Facebook + Instagram page URLs. Once GBP verifies, add GBP URL too.

```ts
// In src/lib/schema.ts or wherever LocalBusiness is assembled
sameAs: [
  "https://www.facebook.com/triplejmetaltx",     // confirm exact slug
  "https://www.instagram.com/triplejmetaltx",    // if active
  // "https://g.page/triplejmetaltx",             // add after GBP verifies
]
```

This is the single best schema-level signal linking the site entity to external profiles — critical for Knowledge Panel eligibility once GBP is live.

### A8. GBP verification follow-up (not a code task)
**Status:** Video submitted 2026-04-22, pending Google review (typically 5-14 days).

**Action:** if no response by 2026-05-06 (14-day mark), escalate via GBP support chat. Absolute priority — without GBP there's no Maps / Local Pack presence.

**Post-verification checklist:**
- Populate GBP categories: primary `Metal building contractor`, secondary `Contractor`, `Carport service`
- Upload 30+ photos (fleet, completed builds, crew at work) — per local SEO research, 30-100 photos is the baseline for Central TX contractor credibility
- Post the first GBP update (new project or seasonal message)
- Add GBP URL to schema `sameAs` (A7)
- Start review outreach — text Google review link to the 50+ past clients

### A9. Personalize the 11 remaining city pages
**Score impact:** +5 content + local. **Lead impact:** each city page is a direct ranking surface for `metal carports [city]` queries. Currently 11 of 14 fall back to a legacy template.

**Cities to personalize** (in order of probable lead value):
1. Harker Heights — already has military discount, needs landmarks/neighborhoods
2. Copperas Cove — Fort Cavazos-adjacent, barn demand
3. Waco — McLennan County flagship
4. Georgetown — fastest-growing city, premium market
5. Round Rock — same
6. Salado — luxury subdivisions
7. Holland, Troy, Taylor, Nolanville, Lampasas — round out the footprint

**Template fields to fill** (per existing schema): `customHeadline`, `distanceFromTemple`, `habla` flag, `landmarks[]`, `neighborhoods[]`, `topServices[]`, `whyLocalBullets[]`, `callouts[]`.

Target word count per page: 800-1,200 words.

### A10. Add BreadcrumbList schema site-wide
**Score impact:** +3 schema.

Missing on ~15 pages (blog + hub pages + a few service pages). Add a `Breadcrumbs` component that auto-generates from the URL path + page title, and include it in the default layouts for `/services/*`, `/locations/*`, `/blog/*`, and hub pages.

### A11. Add FAQ schema to blog posts
**Score impact:** +2 schema + 3 GEO.

Each blog post already uses Q&A structure in the body. Wrap the existing Q&A as FAQPage schema in the per-post metadata. Directly citable by Google AI Overviews and Perplexity.

### A12. Fix image sitemap 404
**Score impact:** +2 technical.

[src/app/sitemap.ts:20](src/app/sitemap.ts) references `/sitemap-images.xml` — but the route is not resolving. Either:
- Create `src/app/sitemap-images.ts` with the `MetadataRoute.Sitemap` export
- OR fold image entries into the main sitemap using the `images` array on each URL entry

### A13. Resolve /service-areas vs /locations duplication
**Score impact:** +1 local.

Per earlier codebase-lean proposal: delete [src/app/(marketing)/service-areas/](src/app/(marketing)/service-areas/), remove its Footer link + sitemap entry. /locations is the data-driven successor.

**Alt path (if keeping /service-areas for existing SEO):** set `alternates: { canonical: '/locations' }` on /service-areas and 301 redirect it.

### A14. Add visible author bylines + publish dates to blog posts
**Score impact:** +3 content (E-E-A-T).

Blog posts have BlogPosting schema with author info but no visible byline. Add a small block below each H1:

```
By Julian Leon
Published 2026-04-17 · Updated 2026-04-24
```

Link the author name to an `/about#team` anchor or a dedicated `/authors/julian-leon` stub page (bonus E-E-A-T).

---

## Medium — do this quarter

### A15. Write the remaining blog posts (research already done)
5 posts shipped. The `research_keyword_gaps.md` insights already list direct post briefs. Candidates:
- "Turnkey vs. Hire-Your-Own-Concrete: the real cost math for Central TX carports"
- "What $500 per month BAH buys near Fort Cavazos in 2026"
- "Holland, TX permit guide: what a metal building requires outside Bell County"

Cadence: 1 post every 3 weeks while lead volume is the bottleneck.

### A16. Add HowTo schema to /services/carports install process
**Score impact:** +2 GEO.

"How is a metal carport installed in Texas" is a natural AI-search query. Mark up the install steps (site prep → concrete pour → cure → frame → panels → trim) as HowTo with duration + tools.

### A17. Promote CSP from Report-Only to enforced
Requires: validate the report stream has no false positives in prod for ~1 week. Tighten script-src directives (remove `'unsafe-inline'` with nonces) before enforcing.

### A18. Change apex→www redirect from 307 to 301
Handled in Vercel project settings or [next.config.ts](next.config.ts) redirects. Pure hygiene.

### A19. Add llms-full.txt
Longer companion to llms.txt with full page content dumps. Let Perplexity/ChatGPT ground deeper.

### A20. Audit WebP/AVIF delivery
Open DevTools Network tab on `/gallery` and confirm `/_next/image?url=…` responses have `content-type: image/avif` (or webp fallback). If they're still `image/jpeg`, something is wrong with Vercel image optimization config.

---

## Lead-volume lens — what actually moves demand

Per ops snapshot 2026-04-23, visibility is the constraint. In order of probable impact on getting the next 10 leads:

1. **GBP verification** (A8) — biggest single lever; not a code task
2. **Title/meta fixes** (A1, A5, A6) — improves CTR on existing impressions
3. **Personalize the 11 city pages** (A9) — unlocks 11 new ranking surfaces
4. **sameAs + GBP schema wiring** (A7) post-verification — Knowledge Panel eligibility
5. **Breadcrumbs + FAQ on blogs** (A10, A11) — rich-result visibility

SEO code fixes compound with GBP verification. Do A1-A6 this week so the site is clean when GBP goes live and first reviews start landing.

---

## Next audit

Recommend a follow-up audit **6 weeks out** (2026-06-05) or **after GBP verifies**, whichever comes first. Key questions for the next pass:
- Have titles/metas re-indexed cleanly?
- Is GBP live? Review count? Map pack position for "metal carports Temple TX"?
- Has Triple J's CrUX data populated yet? (needs ~1,000 real-user sessions)
- Are any of the 11 new city pages ranking in local 3-pack?

---

## Data sources

- `FULL-AUDIT-REPORT.md` (companion doc, full findings)
- `.seo-audit-tmp/` (31 live HTML fetches, preserved for re-run)
- Internal vault: `project_triple_j_ops_snapshot.md`, `project_triple_j_context.md`
