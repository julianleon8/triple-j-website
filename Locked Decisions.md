# Locked Decisions — Current State

**What is true right now.** Every line cites the `Decisions.md` date that last set it.

When a decision reverses: append a row to `Decisions.md` (the ledger is append-only, never edited) **and overwrite the affected line here, in the same turn**. Those two writes are the whole protocol. If they disagree, this file is wrong and `Decisions.md` wins — the most recent row for a topic is authoritative.

Do not copy anything from this file into `AGENTS.md`. That duplication is what produced four months of silent drift.

---

## Product

- **Timeline:** "**same-week**", never "48-hour build". 48 hrs = materials arrival, not build time. Saying otherwise is misleading. (2026-04-15)
- **Frame:** "**welded or bolted**" everywhere. Triple J does both. Never "custom welded" alone. (2026-04-15)
- **Concrete spec:** **3,000 PSI is standard. 4,000 PSI is on request only** — never promised as the default. (2026-05-01 — **REVERSES** the 2026-04-15 lock that made 4,000 PSI a headline differentiator)
- **Services** include lean-to patios and house additions alongside carports, garages, barns, RV/boat covers, equipment covers, metal porches, ranch structures, barndominiums.
- **Tagline:** "Built right, built fast, built by Triple J." (2026-04-15)
- **Fonts:** Barlow Condensed (headlines) + Inter (body). Geist removed. Barlow is scoped to marketing only — not HQ. (2026-04-24)
- **Design:** WolfSteel-inspired. No dark mode on the public site.
- **TrustBar stats:** Zero Subcontractors · Welded or Bolted · Same-Week · Temple TX.
- **Testimonials:** auto-scroll marquee, CSS `@keyframes`, pause-on-hover, `'use client'`.
- **Lead form:** multi-step — ZIP → service + type + dimensions → concrete + timeline + military.
- **Interactive brand token in HQ** is `--brand-fg`; Lucide `strokeWidth={2}` is the HQ default. (2026-04-24)
- **Steel color names:** no vendor-specific color names in customer copy. (2026-04-26)
- **`/service-areas` is dead** — 301 → `/locations`. (2026-04-26)

## Pricing

- **Public pricing is ALLOWED** on the website, ads, blog, `llms.txt`, and email. (2026-04-30 — **REVERSES** the earlier no-public-pricing rule)
  - Carve-out: Facebook **group** posts stay quote-based, not price-led.
- **Sheet prices are steel + install ONLY.** Concrete is always a separately-priced add-on. Never attach a sheet price to the word "turnkey". (2026-05-02)
- **"Turnkey" is a real offering** — site prep + concrete + structure on a single contract. Use the word freely when **no specific price is attached to it**. Stripping it entirely was an over-correction and was reverted. (2026-05-02)
- **Welded = bolted total × 1.10.** Replaces the old flat +$600 surcharge, which overcharged small builds and undercharged large ones. Quotes given before 2026-05-02 are honored at +$600. (2026-05-02)
- **Never publish per-sqft concrete pricing.** Internal/competitive intel — quote it by DM or call only. (2026-05-02)
- **2026 price raise:** +13–15% across the board, effective 2026-05-01. (2026-04-30)
- **Anchors** (steel + install, bolted, before tax): 20×20 carport **$3,000** · 25×25 carport **$4,000** · 30×30 garage **$5,500** · 20×40 RV/boat cover **$6,500** · 40×100 commercial/ranch **$29,500**. Walls $70/LF of perimeter.
- **Canonical price sheet:** `dev/sales-pack-2026-04-30.md`. **Do not improvise prices.** If a figure isn't in the sheet, ask.

## Positioning

- **Supplier-agnostic.** Never name a specific steel supplier in the vault, in customer copy, or in AI-facing files. Multi-source by design; purchase orders and invoices are the system of record. (2026-04-23)
- **Zero subcontractors** — owner-operated welders only.
- **Bilingual team** — Juan and Freddy in Spanish, Julian in English. Spanish-language listing variants are live in the sales pack.

## On hold / descoped

- **Stripe — descoped.** Listed as "phase 4" since 2026-04-13 but never had a dependency, an env var, or a line of code. QuickBooks is the money rail. Revisit only if customer card payment is actually requested. (2026-09-06)
- **ClickUp CRM** — on hold; revisit after live leads validate volume.
- **Native iOS app** — deferred; invest in PWA performance instead. (2026-04-25)
- **Migrations 014–020** from the data-model audit — proposed, **not applied**. (2026-04-25)
- **CSS-only `SwipeActions`** — deferred. (2026-04-25)

---

## Outstanding

Known gaps between what is locked above and what is actually shipped. `scripts/check-vault.mjs`
reports these on every run. Delete an entry the moment it is closed.

- **13 live pages still promise 4,000 PSI concrete as the default** (found 2026-09-06).
  `src/lib/locations.ts` (7 occurrences), `src/lib/services.ts` (5), `src/lib/competitors.ts` (1),
  plus the Blackland Prairie soil blog post. The 2026-05-01 reversal made 4,000 PSI on-request only,
  but the customer-facing copy was never updated — it is live on the public site today.
  Rewriting it is a copy decision for the owner, not a mechanical find-and-replace, because several
  of these tie the spec to specific soil claims. **Needs a decision.**
