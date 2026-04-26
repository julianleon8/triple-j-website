# SEO Online Presence Audit — 2026-04-26

One-shot Tavily reconnaissance run as part of Option A from the seo-backlinks deep-dive. Goal: figure out where Triple J Metal currently shows up online, what's missing, and what needs cleanup before the 10-week outreach plan starts.

---

## 🚨 CRITICAL — Fix this week before doing anything else

### 1. Brand fragmentation across the web

**Triple J's online presence is split across 4+ business-name variations.** This is a NAP-consistency disaster — local SEO requires identical name + address + phone across every citation. Right now Google sees these as potentially DIFFERENT businesses:

| Variation Found | Where | Status |
|---|---|---|
| **Triple J Metal** | Yelp, our own website | ✅ canonical (per `Decisions.md` + `AGENTS.md`) |
| **Triple J Metal Construction** | Yelp (DUPLICATE listing), MapQuest, Yahoo Local | ❌ retired alias — needs cleanup |
| **Triple J Metal Buildings** | Facebook (85 likes) | ❌ retired alias — needs rename |
| **Triple JJJ Metal** | The OLD website at **triplejjjmetal.com** (still live!) | ❌ retired alias — see Issue #2 |

**Action this week:**
- Yelp → consolidate the two listings (`triple-j-metal-temple` is canonical; close or redirect `triple-j-metal-construction-temple`)
- MapQuest → update https://www.mapquest.com/us/texas/triple-j-metal-construction-794014290 to "Triple J Metal" + add the new website URL
- Yahoo Local → same fix
- Facebook → rename page from "Triple J Metal Buildings" to "Triple J Metal" + update About → website URL

### 2. The OLD website at triplejjjmetal.com is still live

This is a **bigger problem than the listings.** A separate domain (**triplejjjmetal.com**) exists with the same address (3319 Tem-Bel Ln) and same phone (254-346-7764) — and it's still serving content as "Triple J Metal Construction." This means:

- Google sees TWO Triple J websites competing for the same brand searches
- Customers might land on the old site, see different (probably outdated) info
- All the SEO work we've done on triplejmetaltx.com is being diluted

**Action this week (HIGHEST PRIORITY):**
- **Best:** transfer the triplejjjmetal.com domain to point at triplejmetaltx.com via 301 redirect (preserves any link equity, kills the duplicate)
- **OK:** shut down the old site entirely, let the domain expire
- **Worst:** leave it up — Google penalizes duplicate sites

If you don't own triplejjjmetal.com, find out who does (probably someone in the family or an old web vendor). Either get it OR contact the registrar.

### 3. Yelp has TWO Triple J listings

Both have the same address (3319 Tem-Bel Ln) and same phone (254-346-7764):

- https://m.yelp.com/biz/triple-j-metal-temple — "TRIPLE J METAL - Updated April 2026" (newer)
- https://m.yelp.com/biz/triple-j-metal-construction-temple — "TRIPLE J METAL CONSTRUCTION - Updated January 2026" (older alias)

**Action:** claim both, then use Yelp's "Report duplicate listing" feature to merge them into the canonical one. Yelp will email if they need verification.

---

## 🟡 IMPORTANT — Wins to capture in the next 2 weeks

### 4. Existing citations to update (NAP-consistency cleanup)

These already exist but need to be brought in line with canonical NAP:

| Citation | URL | What to fix |
|---|---|---|
| MapQuest | https://www.mapquest.com/us/texas/triple-j-metal-construction-794014290 | Rename to "Triple J Metal", add website URL |
| Yahoo Local | https://local.yahoo.com/manufacturing-and-industrial-supplies/metal-industries/tx/temple/ | Same — rename + add website |
| Facebook | https://www.facebook.com/Triplejmetaltx (also 61579877376850) | Rename page from "Triple J Metal Buildings" → "Triple J Metal" |
| Yelp main listing | https://m.yelp.com/biz/triple-j-metal-temple | Add website URL `triplejmetaltx.com` (probably missing) |

These were citations YOU DIDN'T KNOW EXISTED. Rather than adding to your tracker as "Not Started," update the tracker to reflect them as **"Live but needs NAP cleanup"** and prioritize the fix.

### 5. New competitor discovered — add to roundup

**Temple Steel Buildings** (https://templesteelbuildingsintx.com) — Brice Evans, 15 years welding experience. Local Bell County competitor not on Julian's original Yelp list. This validates that local welded-metal-building demand exists in Temple specifically.

**Action:** add to `src/lib/competitors.ts` LOCAL_ROUNDUP_SLUGS so the `/best-metal-carport-builders-temple-tx` page lists them too. (One additional entry to the data file — small change.)

---

## 🟢 STRATEGIC — Insights for the broader plan

### 6. Confirmed: Get Carports is targeting your home market

`getcarports.com/locations/texas/metal-carports-belton-tx` — they have a dedicated Belton TX page. Same for Killeen (Viking Steel). **The alternatives pages we shipped 2026-04-26 are exactly the right counter-move.** Get Carports is investing real SEO budget on Bell County, and we now have `/alternatives/get-carports` ranking against it.

### 7. Top organic competitors for "metal building contractor Temple TX"

Who actually shows up in top 10 today (this is who we need to beat):

1. **HomeAdvisor** — Decker Do Right Welding & Fabrication
2. **Absolute Steel TX** (absolutesteeltx.com) — strong national kit dealer with TX focus
3. **Dayton Barns** (daytonbarns.com) — appears multiple times for "carport [city] TX" — could be a future alternatives page
4. **American Metal Buildings** (americanmetalbuildings.com) — national kit
5. **Metal Buildings Texas** (metalbuildingstexas.us) — Texas-focused with phone in the listing
6. **Get Carports** (already covered)
7. **Yelp** roundup
8. **BBB** metal building contractors directory
9. **Rough Country Carports** (Bell County local — already in roundup)

**Two new alternatives-page candidates to consider:**
- `/alternatives/dayton-barns` — they target the same long-tail "[carport] [TX city]" pages we do
- `/alternatives/absolute-steel` — their TX-focus makes them a more direct competitor than the national-only kits

### 8. BBB has a Metal Building Contractors directory you're not on

https://www.bbb.org/us/tx/temple/category/metal-building-contractors — when you complete the BBB Accreditation step (Week 3 of the tracker), make sure your category includes "Metal Building Contractors" so you show up here.

### 9. Where you currently DON'T appear (confirmed gaps)

These tracker items are confirmed-not-started (no listing found):
- ❌ Angi (no listing — was on the tracker)
- ❌ Nextdoor business page (no listing)
- ❌ HomeAdvisor (Decker takes the slot, not Triple J)
- ❌ Apple Business Connect (no listing — was on the tracker)
- ❌ Bing Places (no listing — was on the tracker)

The Week 1-2 tracker items are correct — those gaps are real.

### 10. Reviews status

**Zero customer reviews surfaced anywhere.** Yelp listing exists but no reviews. This is the single biggest local-SEO weakness right now — reviews are the #1 GBP ranking factor.

**Action:** Week 9's customer-review push from the tracker should move UP to **Week 1-2**. Get even 3-5 Google reviews ASAP. The other tracker items mean less if you have 0 reviews backing them.

---

## Recommended adjustments to the Link Building Tracker

Based on these findings, four edits to `Link Building Tracker.md`:

1. **Move Week 9 customer-review push → Week 1** (highest leverage of anything on the tracker)
2. **Add new Week 1 row: "Resolve brand fragmentation"** — sub-tasks for Yelp consolidation, MapQuest rename, Yahoo Local rename, Facebook rename
3. **Add new Week 1 row: "Sunset triplejjjmetal.com"** — 301 redirect or shut down
4. **Add Temple Steel Buildings + (optionally) Dayton Barns + Absolute Steel TX to the competitors data file** so they appear in the local roundup / future alternatives pages

Should I make those tracker edits in a follow-up commit? (1-line change to add the rows, 1-line change to the competitors data file.)

---

## Methodology + caveats

- **9 Tavily search queries** (1 errored on oversized response; the other 8 returned solid data)
- **No GSC data** (no API auth) — these results show what Tavily / Google's crawlers see, not your actual ranking positions
- **No backlink count** (no Moz/DataForSEO/Ahrefs auth) — we know mentions exist but not their authority
- **Spot-check coverage, not exhaustive** — there may be other listings I missed. The 4-source list above is the high-signal stuff.
- **Cost:** ~$0.50-1.50 in Tavily credits for this run

## What this audit did NOT cover (gaps to close)

- **GSC indexation status** — need GSC OAuth for the seo-google skill to pull this
- **Real backlink profile** — need Moz API key (free) at minimum for the seo-backlinks skill to work
- **Speed Insights deltas** — Vercel data lags 24-48h, will surface in the May 1 monthly check-in
- **Map pack rankings** — needs DataForSEO or manual incognito searches in the target cities
