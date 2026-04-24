# SEO Audit — triplejmetaltx.com

**Audit date:** 2026-04-24
**Site:** https://www.triplejmetaltx.com
**Production commit:** 005bfba (Vercel, live)
**Pages audited:** 31 live pages (out of 47 in sitemap)
**Business type detected:** Local Service — Hybrid (brick-and-mortar HQ at 3319 Tem-Bel Ln Temple TX, service-area-business across 14 cities + 8 counties in Central Texas)

---

## Overall Health Score: 73 / 100

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 72 | 15.8 |
| Content Quality | 23% | 78 | 17.9 |
| On-Page SEO | 20% | 62 | 12.4 |
| Schema / Structured Data | 10% | 78 | 7.8 |
| Performance (CWV lab) | 10% | 70 | 7.0 |
| AI Search Readiness | 10% | 88 | 8.8 |
| Images | 5% | 55 | 2.8 |
| **TOTAL** | | | **72.5** |

Solid B-range foundation. Strong local SEO + AI search posture. Dragged down by on-page execution bugs (title duplication, truncated metas, missing alt text) that are mostly trivial to fix.

---

## Executive Summary

### Top 5 Critical Issues
1. **Title brand duplication on 20 pages** — "…| Triple J Metal LLC | Triple J Metal LLC" in SERPs. Caused by layout.tsx template appending brand already present in per-page titles.
2. **Relative canonicals** — Rendered as `<link rel="canonical" href="/about"/>` instead of absolute URLs. `metadataBase` is not set in layout.tsx.
3. **27 pages with meta descriptions > 160 chars** — truncated in SERPs. 5 location pages and all 5 blog posts affected.
4. **28 pages with titles > 70 chars** — all 5 blog post titles are 120-139 chars (badly truncated).
5. **Hero image + 7 other homepage images missing alt text** — including `red-iron-frame-hero.jpg` (LCP candidate) and the marquee set.

### Top 5 Quick Wins
1. Remove "Triple J Metal LLC" from every per-page `title` metadata (template adds it). 20-file find/replace.
2. Add `metadataBase: new URL(siteUrl)` to layout.tsx metadata export.
3. Trim blog post titles to ≤65 chars (drop "| Triple J Metal LLC | Triple J Metal LLC" suffix first, then trim body).
4. Add alt text to hero + feature `<Image>` components (8 instances on homepage alone).
5. Add `sameAs` array to LocalBusiness schema (Facebook, Instagram, GBP URL when verified).

---

## 1. Technical SEO (72/100)

### ✅ Strengths

| Check | Status |
|---|---|
| HTTPS enforced | ✓ HSTS `max-age=63072000` |
| Apex → www redirect | ✓ 307 redirect (consider 301) |
| HTTP/2 | ✓ |
| robots.txt | ✓ Correctly disallows `/hq/`, `/api/`, `/login`, `/setup`, `/dashboard`, `/quotes/` |
| Sitemap | ✓ 47 URLs, lastmod present, valid XML |
| Security headers | ✓ X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| Vercel edge caching | ✓ TTFB 0.25-0.29s across pages |
| Prerender | ✓ All audited pages prerendered (`x-nextjs-prerender: 1`) |
| llms.txt | ✓ Present and comprehensive |

### ⚠️ Issues

**C1 — Relative canonicals (HIGH)**
Every per-page canonical renders relative: `<link rel="canonical" href="/about"/>` instead of `https://www.triplejmetaltx.com/about`.
- **Root cause:** [src/app/layout.tsx:44](src/app/layout.tsx#L44) sets `canonical: siteUrl` (absolute) but no `metadataBase`. Per-page `alternates: { canonical: '/slug' }` strings pass through as literal relative paths.
- **Fix:** Add `metadataBase: new URL(siteUrl)` to the layout metadata export. Next.js will then resolve all relative URLs (canonical, og:url, og:image) against it.

**C2 — CSP is Report-Only**
`content-security-policy-report-only` instead of `content-security-policy`. Not enforced — XSS vectors still exploitable, just reported.
- **Fix:** Once report stream is validated, promote to enforced CSP. With `'unsafe-inline' 'unsafe-eval'` in script-src this is mostly cosmetic for now; tighten script-src with nonces before enforcing.

**C3 — No image sitemap**
`/sitemap-images.xml` returns 404. Internal memory says "image sitemap" was shipped in commit 3656e97 but the route is not resolving publicly.
- **Fix:** Verify the image sitemap route file is actually linked or add `<image:image>` entries directly into the main sitemap.

**C4 — 307 instead of 301 for apex→www**
Not technically wrong (307 preserves method and is a valid redirect), but 301 is the idiomatic permanent-host redirect. Search engines treat both similarly, but link equity transfer is cleaner with 301.

**C5 — No security.txt / .well-known/security.txt**
Low priority. Industry convention for security contact.

**C6 — No llms-full.txt** (low)
`llms.txt` exists and is excellent; `llms-full.txt` (longer version with full page content) is the emerging companion convention. Nice-to-have for Perplexity / ChatGPT grounding depth.

---

## 2. Content Quality (78/100)

### ✅ Strengths

| Metric | Value |
|---|---|
| Homepage word count | 1,710 words |
| Blog post avg word count | 1,375 words (range 1,279-1,445) |
| Service page avg word count | 904 words (range 708-1,098) |
| H1 per page | Exactly 1 on every page ✓ |
| llms.txt E-E-A-T posture | Excellent — names owners, founding year, service area, pricing ranges, bilingual, hours |

### ⚠️ Issues

**C7 — Location pages on the thin side (MEDIUM)**
| Page | Words |
|---|---|
| /locations/mclennan-county | 469 |
| /locations/harker-heights | 550 |
| /locations/bell-county | 562 |
| /locations/killeen | 636 |
| /locations/temple | 654 |
| /locations/belton | 681 |

Local SEO best practice for city pages is 800-1,200 words with unique local signals (neighborhoods, landmarks, city-specific permit notes, case studies). Internal memory already notes: "3 cities personalized (Killeen/Temple/Belton) — 11 remaining render via legacy fallbacks". Personalize the remaining 11 and deepen the 3 that are done.

**C8 — /services listing and /blog listing lean (LOW)**
| Page | Words |
|---|---|
| /services | 408 |
| /blog | 496 |

Both are hub pages, so shorter is acceptable — but each could benefit from a 200-word intro paragraph that actually ranks for category-level queries.

**C9 — Blog posts missing visible author bylines (E-E-A-T)**
BlogPosting schema includes author info but the rendered page does not show "By Julian Leon / Jose Alfredo Leon" or similar. Adding visible author + "About the author" snippets boosts E-E-A-T significantly for local-contractor content.

**C10 — No visible publish/updated date on blog posts**
Check rendering — if BlogPosting datePublished is only in schema, add a visible "Published 2026-XX-XX · Updated 2026-XX-XX" line.

---

## 3. On-Page SEO (62/100) — biggest drag on score

### ⚠️ Critical issues

**C11 — Title brand duplicated on 20 pages (CRITICAL)**

Live SERPs will show this for 20 pages:

> `Metal Carports Temple TX | HQ · 3319 Tem-Bel Ln | Triple J Metal LLC | Triple J Metal LLC`

**Root cause:** [src/app/layout.tsx:40-42](src/app/layout.tsx#L40-L42)
```ts
title: {
  default: `${SITE.name} | Metal Carports & Buildings in Central Texas`,
  template: `%s | ${SITE.name}`,
}
```
Template appends `| Triple J Metal LLC`. Per-page metadata like `title: 'Metal Carports Temple TX | HQ · 3319 Tem-Bel Ln | Triple J Metal LLC'` (in [src/lib/locations.ts](src/lib/locations.ts) and service page metadata exports) also ends in the brand, causing doubling.

Affected pages (20 total): about, blog, all 5 blog posts, contact, gallery, locations (hub), 5 location subpages (belton/harker-heights/killeen/temple/bell-county/mclennan-county), service-areas, services (hub, and 4 subpages: barns, colors, metal-garages, pbr-vs-pbu-panels).

**Fix:** Remove trailing `| Triple J Metal LLC` from every per-page `title` string (~15 code sites). Keep the template.

**C12 — 28 pages exceed 70 chars in title**

All 5 blog post titles are 120-139 chars — Google truncates at ~580-600px (~60-65 chars for most). Example:

> `Blackland Prairie Soil and Metal Building Foundations: What Central Texas Homeowners Need to Know | Triple J Metal LLC | Triple J Metal LLC` (139 chars)

After fixing C11 (remove duplicate brand) these drop to ~115 chars — still too long. Need substantive trimming of body copy.

**C13 — 27 pages exceed 165 chars in meta description**

Google truncates at ~155-160 chars mobile / 165 desktop. Several at 220-236 chars.

Examples:
| Page | Desc length |
|---|---|
| /locations/temple | 236 |
| /locations/belton | 235 |
| /locations/bell-county | 220 |
| /services/colors | 215 |
| /services/hybrid-projects | 210 |
| /partners | 208 |

**Fix:** Trim each to ≤155 chars. Front-load the value prop + call to action. Drop trailing phone numbers (they appear in schema + content; meta desc is already crowded).

**C14 — H1 whitespace collapse (likely cosmetic, verify)**

When extracted as text, several homepage/location H1s collapse to no-space joins:

- Home: `Built right.Built fast.Built acrossCentral Texas.`
- /services: `Six things we build.Built whole, by us.`
- /locations/temple: `Built in Temple.Built where we live.`
- /locations/killeen: `Built in Killeen.Built for Fort Cavazos.`

Visually these render as stacked lines (styled via block-level spans or `<br>`). For most search engines text extraction respects DOM element boundaries, so this is unlikely to hurt rankings. But worth sanity-checking: open one in view-source and make sure adjacent spans have actual whitespace between them.

---

## 4. Schema / Structured Data (78/100)

### ✅ Strengths

Per-page schema coverage:

| Schema type | Coverage |
|---|---|
| LocalBusiness (with full NAP + geo + hours + areaServed array) | Every page |
| FAQPage | 6 service pages (carports, turnkey-carports, metal-garages, barns, rv-covers, hoa-compliant-structures, pbr-vs-pbu-panels) |
| BlogPosting | All 5 blog posts |
| BreadcrumbList | 6 core service pages + 6 location pages audited |
| ItemList | /locations |
| ImageGallery + ImageObject | /gallery |

LocalBusiness is solid: `@id`, name, legalName, alternateName, description, url, logo, image, telephone, email, priceRange, foundingDate, full PostalAddress, GeoCoordinates (31.0982, -97.3428), OpeningHoursSpecification (Mon-Sat 8:00-18:00), areaServed array with every city.

### ⚠️ Issues

**C15 — `sameAs` missing on LocalBusiness (HIGH once GBP verified)**

No social/profile links in schema. This is the single best signal to connect the website entity with the GBP profile once Google approves verification. Add:

```ts
sameAs: [
  "https://www.facebook.com/...",  // Triple J FB page
  "https://www.instagram.com/...", // if active
  "https://g.page/...",            // GBP URL once live
]
```

**C16 — Breadcrumb gaps (MEDIUM)**

Missing BreadcrumbList on:
- /services (hub)
- /services/colors
- /services/hybrid-projects
- /services/pbr-vs-pbu-panels
- All 5 blog posts + /blog (hub)
- /about, /contact, /gallery, /partners, /locations (hub), /service-areas

Breadcrumbs are one of the cheapest rich-result wins in Google. Add site-wide via a layout-level helper.

**C17 — No Organization schema separate from LocalBusiness (LOW)**

LocalBusiness is the correct primary type for a local contractor. Adding a linked Organization with `@id` and `sameAs` can help disambiguate the legal entity from the physical location — a nice-to-have at this scale.

**C18 — No HowTo schema on service pages (LOW — GEO opportunity)**

Service pages describe the install process (site prep → concrete → frame → panels → trim). Marking up as HowTo creates answer-engine citability for queries like "how is a metal carport installed in Texas."

---

## 5. Local SEO (strong foundation)

### ✅ Strengths

- NAP (name/address/phone) is identical everywhere — 254-346-7764 appears on every page; `3319 Tem-Bel Ln` appears on contact/temple pages (6-12x per page).
- LocalBusiness schema is the most complete I see on small-contractor sites — full areaServed array, GeoCoordinates, bilingual signal in llms.txt.
- llms.txt lists bilingual phone routing (press 1 English / 2 Spanish) — strong local differentiator.
- Service area explicitly bounded (90-min drive from Temple, no out-of-state) — helps local relevance.
- 14 city pages + 8 county pages = 22 location surfaces. Internal linking from homepage includes /locations/temple, /locations/belton, /locations/killeen.
- Fort Cavazos military targeting on Killeen + Harker Heights pages.

### ⚠️ Gaps

**C19 — GBP not verified yet (BLOCKER for map pack)**
Verification video submitted 2026-04-22, still pending (per internal ops snapshot). Without a verified GBP:
- Zero presence in Maps / Local Pack
- Zero reviews → no AggregateRating schema possible
- Biggest single lever for the confirmed lead-volume bottleneck

**C20 — Location pages inconsistent personalization**
3 of 14 cities have personalized copy (Killeen, Temple, Belton). 11 use legacy fallbacks. Each unpersonalized city page loses ranking potential for city-specific queries.

**C21 — No review schema (fair — zero reviews)**
Once GBP goes live and ≥5 reviews land, add AggregateRating to LocalBusiness schema.

**C22 — No service-area shape in schema**
Could add `areaServed` as a GeoShape (polygon) or GeoCircle (radius) instead of/in addition to the City array. More precise for SAB signal.

**C23 — /service-areas and /locations duplicate purpose**
Both exist. /service-areas (286 lines, hardcoded CITIES array, footer-only link per nav cleanup 2026-04-17) overlaps with /locations (80 lines, data-driven from LOCATIONS). Risks keyword cannibalization.

---

## 6. AI Search Readiness (88/100 — strongest category)

### ✅ Strengths

**llms.txt is enterprise-grade.** 150+ line structured doc covering:
- Differentiators (same-week, welded OR bolted, turnkey single-contract, 4,000 PSI concrete, bilingual)
- Services (every offering with method notes)
- Service area (with county breakdown + drive-time bound)
- Fort Cavazos military section
- Pricing ranges (carports $4-18k, garages $15-60k, barns $25-120k)
- 8 FAQs with Q/A format (these are goldmine for AI citations)
- Contact info + key page URLs
- "Notes for AI systems" footer directing to /services + /locations + /blog for source material

**AI crawler access** — all major bots return HTTP 200:
| Bot | Status |
|---|---|
| GPTBot | 200 ✓ |
| PerplexityBot | 200 ✓ |
| ClaudeBot | 200 ✓ |
| Google-Extended | 200 ✓ |
| CCBot | 200 ✓ |
| anthropic-ai | 200 ✓ |
| ChatGPT-User | 200 ✓ |

**FAQ schema on 6 service pages** — directly consumed by Google AI Overviews.

### ⚠️ Gaps

**C24 — No llms-full.txt** — emerging convention for longer-form content dumps Perplexity and others use for grounding.

**C25 — No FAQ schema on blog posts** — blog content is naturally Q&A; add FAQPage blocks for each H2-as-question pattern.

**C26 — No HowTo schema on service pages** — already mentioned. Install process steps are naturally HowTo-shaped.

**C27 — No Speakable schema on blog posts** — for voice-assistant citations. Low priority.

---

## 7. Images (55/100 — biggest lift needed)

### Findings

| Page | Total img | No alt |
|---|---|---|
| Home | 20 | 8 (40%) |
| /services/colors | 47 | 7 (15%) |
| /about | 8 | 7 (88%) |
| Every service subpage | 8 | 7 (88%) |
| Every blog post | 8 | 7 (88%) |
| /gallery | 14 | 7 (50%) |
| /locations/\* | ~13 | 2-3 (15-25%) |

**Homepage no-alt detail (critical — includes hero + features):**
- `red-iron-frame-hero.jpg` (the hero — LCP candidate) — NO ALT
- `logo-lion.png`
- `carport-gable-residential.jpg` (×2 — marquee duplicate)
- `metal-garage-green.jpg`
- `double-carport-install.jpg`
- `porch-cover-lean-to.jpg`

### ⚠️ Issues

**C28 — Hero image missing alt (CRITICAL for accessibility + image SEO)**
The LCP image on the homepage has no alt text. Adding descriptive alt helps Google Images rankings and screen-reader accessibility.

**C29 — Feature/marquee images missing alt** — same issue across featured services imagery.

**C30 — Consistent 7-no-alt pattern on service + blog pages** — suggests a shared component (likely the "featured image" row or marquee in the template) that renders `<img>` without an alt prop. Fix once at the component level to cascade.

**C31 — No WebP/AVIF in source HTML** — references show 2,653 `.jpg` and 482 `.png`. Next.js Image component serves optimized formats via content negotiation when using the `/_next/image?url=…` handler, so real browsers get AVIF/WebP. Verify via DevTools network tab to confirm Vercel's image optimization is working; if not, the fix is to use `<Image>` component everywhere.

---

## 8. Performance (lab indicators only — no field data)

### Edge CDN health

| Page | Size | TTFB |
|---|---|---|
| / | 219 KB | 0.29 s |
| /services/colors | 227 KB | 0.28 s |
| /locations/temple | 130 KB | 0.27 s |
| /services | 111 KB | 0.25 s |
| /blog/welded-vs-bolted | 113 KB | 0.26 s |

TTFB is uniformly in the 0.25-0.29s range — Vercel edge cache working. `x-vercel-cache: HIT` on homepage.

### ⚠️ Concerns

**C32 — 219KB homepage HTML is heavy** — most is inline RSC serialization (`__next_f.push([...])` blocks). Not critical but worth checking if route-level chunk splitting can reduce it.

**C33 — 4 fonts preloaded** — Barlow Condensed + Inter, likely 2 weights each. Acceptable but each preload is an upfront cost. Consider font-display: swap + fewer weights.

**C34 — No real field data** — CrUX, GSC, or PageSpeed Insights data not available in sandbox. Run `npm run lighthouse https://www.triplejmetaltx.com` or wait for CrUX field data to populate (needs real-user traffic).

**C35 — No preconnect to external resources** — low priority; most assets are same-origin.

---

## Crawl Findings (sitemap vs. live status)

47 URLs in sitemap — 31 audited, all returned HTTP 200. Remaining 16 are additional /locations/\* city pages (nolanville, salado, waco, georgetown, round-rock, lampasas, holland, taylor, troy, copperas-cove) and county pages (coryell-county, williamson-county, lampasas-county, falls-county, milam-county, burnet-county).

No broken links detected on audited pages.

---

## Data Sources Used

- Live page fetches via `curl` + Python HTML parsing (31 pages)
- `robots.txt`, `/sitemap.xml`, `/llms.txt` (all live)
- Source code review: `src/app/layout.tsx`, `src/lib/locations.ts`, `src/lib/site.ts`
- AI crawler User-Agent response codes (7 bots)
- Internal project memory (GBP status, bottleneck, feature state)

### Data Sources NOT Used (out of scope in sandbox)
- Google Search Console, PageSpeed Insights, CrUX field data (not authenticated)
- DataForSEO MCP (not installed)
- Moz / Ahrefs / SEMrush backlinks (no API credentials)
- Firecrawl (attempted approval but no key needed — inline crawl sufficed)
- Playwright / real browser screenshots (requires local browser install)
- NotebookLM (explicit skip per CLAUDE.md)

---

## Appendix: Issue Index

| # | Category | Priority | Issue |
|---|---|---|---|
| C1 | Technical | HIGH | Relative canonicals (no metadataBase) |
| C2 | Technical | MEDIUM | CSP Report-Only (not enforced) |
| C3 | Technical | MEDIUM | Image sitemap 404 |
| C4 | Technical | LOW | 307 vs 301 apex→www |
| C5 | Technical | LOW | No security.txt |
| C6 | Technical | LOW | No llms-full.txt |
| C7 | Content | MEDIUM | Location pages thin (469-681 words) |
| C8 | Content | LOW | /services + /blog hub pages lean |
| C9 | Content | MEDIUM | Blog posts missing visible author bylines |
| C10 | Content | LOW | Blog posts need visible publish/update dates |
| C11 | On-page | **CRITICAL** | Title brand duplicated on 20 pages |
| C12 | On-page | HIGH | 28 pages with titles > 70 chars |
| C13 | On-page | HIGH | 27 pages with meta desc > 165 chars |
| C14 | On-page | LOW | H1 whitespace collapse (verify cosmetic only) |
| C15 | Schema | HIGH | No `sameAs` on LocalBusiness |
| C16 | Schema | MEDIUM | BreadcrumbList missing on ~15 pages |
| C17 | Schema | LOW | No separate Organization schema |
| C18 | Schema | LOW | No HowTo on service pages |
| C19 | Local | **CRITICAL** | GBP not yet verified (ops-level blocker) |
| C20 | Local | HIGH | 11 of 14 city pages use legacy fallbacks |
| C21 | Local | LOW | No review schema (fair until reviews exist) |
| C22 | Local | LOW | No GeoShape / GeoCircle for service area |
| C23 | Local | MEDIUM | /service-areas and /locations duplicate |
| C24 | GEO | LOW | No llms-full.txt |
| C25 | GEO | MEDIUM | No FAQ schema on blog posts |
| C26 | GEO | LOW | No HowTo schema |
| C27 | GEO | LOW | No Speakable schema |
| C28 | Images | **CRITICAL** | Hero `red-iron-frame-hero.jpg` missing alt |
| C29 | Images | HIGH | Feature/marquee images missing alt |
| C30 | Images | HIGH | 7-no-alt pattern across service + blog pages |
| C31 | Images | MEDIUM | Verify WebP/AVIF delivery via DevTools |
| C32 | Perf | LOW | Homepage HTML 219KB |
| C33 | Perf | LOW | 4 fonts preloaded |
| C34 | Perf | MEDIUM | No field data (need CrUX / GSC / PageSpeed) |
| C35 | Perf | LOW | No preconnect to external resources |
