# NAP Consistency Audit — Triple J Metal

**Audit date:** 2026-04-24
**Scope:** Full codebase (`src/`, `public/`, `docs/`, root vault files)
**Canonical values enforced:**

| Field | Canonical |
|---|---|
| Name (display) | `Triple J Metal` |
| Legal Name | `Triple J Metal LLC` |
| Address | `3319 Tem-Bel Ln, Temple, TX 76502` |
| Phone (display) | `254-346-7764` |
| Phone (E.164) | `+12543467764` |
| `tel:` href | `tel:+12543467764` |
| Email | `julianleon@triplejmetaltx.com` |

The single source of truth is **`src/lib/site.ts`** (`SITE` constant). Every NAP surface in production code should read from `SITE.*` rather than hardcode values.

---

## 1. Phone-variant scan (pre-audit)

Searched for all non-canonical phone formats:

| Variant | Occurrences | Outcome |
|---|---|---|
| `(254) 346-7764` | 0 | none found |
| `254.346.7764` | 0 | none found |
| `254 346 7764` | 0 | none found |
| `254-346-7764` (display) | 40+ | canonical, kept |
| `2543467764` (inside `+12543467764`) | 5 | canonical E.164, kept |
| `tel:254-346-7764` (non-E.164 href) | 3 | **fixed → `tel:+12543467764`** |
| `tel:${SITE.phone}` (non-E.164 template) | 13 | **fixed → `SITE.phoneHref`** |

The codebase was already disciplined about the display format; the problem was the `tel:` href expansion.

## 2. Address-variant scan (pre-audit)

| Variant | Occurrences | Outcome |
|---|---|---|
| `Tem Bel` (space) | 0 | none found |
| `TemBel` / `Tembel` | 0 | none found |
| `Tem-bel` (lowercase) | 0 | none found |
| `Tembel Ln` | 0 | none found |
| `3319 Tembel` | 0 | none found |
| `Tem-Bel Lane` (prose) | 3 | **fixed → `Tem-Bel Ln`** |
| `3319 Tem-Bel Ln` | 13 | canonical, kept |

## 3. Name-variant scan (pre-audit)

| Variant | Occurrences | Outcome |
|---|---|---|
| `Triple J Metal LLC` | canonical — legal | kept |
| `Triple J Metal` | canonical — short | kept |
| `Triple J Metal Buildings` (public NAP) | 1 | **fixed → `Triple J Metal`** |
| `Triple J Metal Buildings` / `…LLC` (internal LLM prompts) | 4 | **left as-is** (not public NAP; advisory below) |

---

## 4. Fixes applied

### Phone — `tel:` hrefs forced to E.164

| File | Line | Before | After |
|---|---|---|---|
| `src/emails/PartnerInquiryConfirmation.tsx` | 30 | `href="tel:254-346-7764"` | `href="tel:+12543467764"` |
| `src/components/sections/PartnerInquiryForm.tsx` | 109 | `href="tel:254-346-7764"` | `href="tel:+12543467764"` |
| `src/components/sections/PartnerInquiryForm.tsx` | 252 | `href="tel:254-346-7764"` | `href="tel:+12543467764"` |
| `src/app/(marketing)/gallery/page.tsx` | 115 | `href={`tel:${SITE.phone}`}` | `href={SITE.phoneHref}` |
| `src/app/(marketing)/gallery/[id]/page.tsx` | 153 | `href={`tel:${SITE.phone}`}` | `href={SITE.phoneHref}` |
| `src/app/(marketing)/services/[slug]/page.tsx` | 107 | `href={`tel:${SITE.phone}`}` | `href={SITE.phoneHref}` |
| `src/app/(marketing)/services/colors/page.tsx` | 90 | `href={`tel:${SITE.phone}`}` | `href={SITE.phoneHref}` |
| `src/app/(marketing)/services/hybrid-projects/page.tsx` | 80 | `href={`tel:${SITE.phone}`}` | `href={SITE.phoneHref}` |
| `src/app/(marketing)/services/pbr-vs-pbu-panels/page.tsx` | 115 | `href={`tel:${SITE.phone}`}` | `href={SITE.phoneHref}` |
| `src/app/(marketing)/service-areas/page.tsx` | 155 | `href={`tel:${SITE.phone}`}` | `href={SITE.phoneHref}` |
| `src/app/(marketing)/service-areas/page.tsx` | 273 | `href={`tel:${SITE.phone}`}` | `href={SITE.phoneHref}` |
| `src/app/(marketing)/partners/page.tsx` | 82 | `href={`tel:${SITE.phone}`}` | `href={SITE.phoneHref}` |
| `src/app/(marketing)/partners/page.tsx` | 211 | `href={`tel:${SITE.phone}`}` | `href={SITE.phoneHref}` |
| `src/app/(marketing)/partners/page.tsx` | 232 | `href={`tel:${SITE.phone}`}` | `href={SITE.phoneHref}` |
| `src/app/(marketing)/blog/page.tsx` | 128 | `href={`tel:${SITE.phone}`}` | `href={SITE.phoneHref}` |
| `src/app/(marketing)/about/page.tsx` | 221 | `href={`tel:${SITE.phone}`}` | `href={SITE.phoneHref}` |

**16 phone fixes total.** Every public-facing `tel:` href now emits `tel:+12543467764` (E.164) for correct mobile click-to-call.

### Address — prose `Lane` → `Ln`

| File | Line | Before | After |
|---|---|---|---|
| `src/lib/locations.ts` | 254 | `"…shop sits on Tem-Bel Lane in Temple…"` | `"…shop sits on Tem-Bel Ln in Temple…"` |
| `src/lib/locations.ts` | 288 | `"…Tem-Bel Lane, our crew lives across town…"` | `"…Tem-Bel Ln, our crew lives across town…"` |
| `src/lib/locations.ts` | 318 | `"…all on Tem-Bel Lane in Temple…"` | `"…all on Tem-Bel Ln in Temple…"` |

### Name — public NAP block

| File | Line | Before | After |
|---|---|---|---|
| `src/components/sections/ServiceAreas.tsx` | 170 | `"Triple J Metal Buildings · 3319 Tem-Bel Ln"` | `"Triple J Metal · 3319 Tem-Bel Ln"` |

### Email — hardcoded → `SITE.email`

| File | Line | Before | After |
|---|---|---|---|
| `src/app/(marketing)/partners/page.tsx` | 238 | `href="mailto:julianleon@triplejmetaltx.com"` | `href={`mailto:${SITE.email}`}` |
| `src/app/(marketing)/partners/page.tsx` | 241 | `julianleon@triplejmetaltx.com` (literal) | `{SITE.email}` |

---

## 5. Surfaces verified clean (already canonical, no changes needed)

### Source of truth — `src/lib/site.ts`

```ts
export const SITE = {
  name: "Triple J Metal LLC",
  shortName: "Triple J Metal",
  phone: "254-346-7764",
  phoneHref: "tel:+12543467764",
  email: "julianleon@triplejmetaltx.com",
  address: {
    street: "3319 Tem-Bel Ln",
    city: "Temple",
    state: "TX",
    zip: "76502",
  },
  …
} as const;
```

All three components of NAP match canonical. The `phoneHref` is E.164 as required.

### Site chrome (Header, Footer, MobileCallBar, PreFooterCta)

- **`src/components/site/Footer.tsx`** — NAP block renders `SITE.address.street`, `city`, `state`, `zip`; phone link uses `SITE.phoneHref`; display uses `SITE.phone`. ✅
- **`src/components/site/Header.tsx`** — top bar and desktop header both use `SITE.phoneHref` / `SITE.phone`. Mobile drawer call button uses `SITE.phoneHref`. ✅
- **`src/components/site/MobileCallBar.tsx`** — sticky bottom call button uses `SITE.phoneHref`. ✅

The Footer is the single footer for every marketing route (via `src/app/(marketing)/layout.tsx`), so **every marketing page shows identical NAP** sourced from `SITE`.

### schema.org `LocalBusiness` markup

| File | `name` | `telephone` | `address` | Status |
|---|---|---|---|---|
| `src/components/seo/OrganizationJsonLd.tsx` (site-wide) | `SITE.name` | `SITE.phone` | `SITE.address.*` + `PostalAddress` | ✅ matching |
| `src/app/(marketing)/contact/page.tsx` (page-level) | `SITE.name` | `SITE.phone` | `SITE.address.*` + `PostalAddress` | ✅ matching |
| `src/app/(marketing)/about/page.tsx` (page-level) | `SITE.name` | `SITE.phone` | `SITE.address.*` + `PostalAddress` | ✅ matching |
| `src/app/(marketing)/locations/[slug]/page.tsx` (per city) | `${SITE.name} — ${loc.name} TX` | `SITE.phone` | `SITE.address.*` + `PostalAddress` | ✅ matching |
| `src/app/(marketing)/services/[slug]/page.tsx` (per service) | `SITE.name` | `SITE.phone` | `SITE.address.*` + `PostalAddress` | ✅ matching |

All five LocalBusiness JSON-LD emitters read from `SITE`. Every crawl path sees the same telephone, address, and name.

### Contact page (`src/app/(marketing)/contact/page.tsx`)

Phone block, address block, and email block all render from `SITE.*`. `mailto:` uses `mailto:${SITE.email}`. Map iframe title includes canonical address. ✅

### About page (`src/app/(marketing)/about/page.tsx`)

Emits page-level LocalBusiness JSON-LD sourced from `SITE` and a hero CTA pointing at `SITE.phoneHref` (after fix). ✅

### Locations pages

- `src/app/(marketing)/locations/page.tsx` — uses literal `tel:+12543467764` href + `254-346-7764` display. ✅
- `src/app/(marketing)/locations/[slug]/page.tsx` — emits per-city LocalBusiness JSON-LD with `telephone: SITE.phone`, `SITE.address.*`, and CTA `href={SITE.phoneHref}`. ✅

### Email templates (`src/emails/*`)

All email footers render `Triple J Metal LLC · 3319 Tem-Bel Ln, Temple, TX 76502 · 254-346-7764` (identical canonical string) across `QuoteEmail`, `LeadOwnerAlert`, `LeadCustomerConfirmation`, `QuoteAcceptedOwnerAlert`, `PartnerInquiryConfirmation`, `PartnerInquiryOwnerAlert`. `BrandLayout.tsx` uses `tel:+12543467764` (E.164) and `3319 Tem-Bel Ln, Temple, TX 76502`. ✅

### Static content (`public/llms.txt`)

Phone: `254-346-7764`. Address: `3319 Tem-Bel Ln, Temple, TX 76502`. ✅

### Vault / docs (`AGENTS.md`, `Business Profile.md`, `Project Context.md`, `seo/SEO-STRATEGY.md`)

All list the canonical phone and address. ✅

---

## 6. Advisory — not public NAP, left unchanged

The string `"Triple J Metal Buildings"` (or `"…LLC"`) appears in four internal LLM system prompts:

| File | Usage |
|---|---|
| `src/lib/permit-extractor.ts:190` | Lead-extraction prompt context |
| `src/lib/receipt-extractor.ts:38` | Receipt-parsing prompt context |
| `src/lib/voice-lead-extractor.ts:34` | Voice-memo parsing prompt context |
| `src/app/api/hq/voice-lead/route.ts:123` | Backend voice context string |

These strings are sent to LLMs to help them interpret business context; they are **never rendered to users, never indexed by search engines, and do not appear in NAP citations**. They do not affect local SEO, Google Business Profile, or structured data.

`AGENTS.md` also uses `Triple J Metal Buildings LLC (Triple JJJ Metal Buildings)` as the registered business label in the project vault. If the company has rebranded its public name to `Triple J Metal LLC`, you may want to update these internal prompts for consistency — but this is a separate decision from NAP enforcement.

**Recommendation:** leave these four strings unless the registered business name has actually changed with the Texas Secretary of State. If the public NAP is now `Triple J Metal LLC` but the filed LLC is still `Triple J Metal Buildings LLC`, the internal prompts should match the filed legal name.

---

## 7. Final verification

Post-fix greps across `src/`:

| Check | Command (conceptual) | Result |
|---|---|---|
| No `(254)…` variants | `\(254\)` | 0 matches |
| No `254.346.7764` | literal | 0 matches |
| No `254 346 7764` | literal | 0 matches |
| No bare `tel:254` | `tel:254` | 0 matches |
| No `tel:${SITE.phone}` templates | literal | 0 matches |
| No `Tem-Bel Lane` | literal | 0 matches |
| No `Tembel` / `TemBel` / `Tem Bel` | regex | 0 matches |
| No public `Triple J Metal Buildings` (outside internal LLM prompts) | literal | 0 matches |

All canonical surfaces pass:

| Surface | Phone | Address | Name | Email |
|---|---|---|---|---|
| `SITE` constant | ✅ | ✅ | ✅ | ✅ |
| Footer (every marketing page) | ✅ | ✅ | ✅ | — |
| Header | ✅ | — | ✅ | — |
| MobileCallBar | ✅ | — | — | — |
| Contact page | ✅ | ✅ | ✅ | ✅ |
| About page | ✅ | ✅ | ✅ | — |
| Locations index | ✅ | — | ✅ | — |
| Per-city locations | ✅ | ✅ | ✅ | — |
| Per-service pages | ✅ | ✅ | ✅ | — |
| Services index | ✅ | — | ✅ | — |
| Blog index | ✅ | — | ✅ | — |
| Partners | ✅ | — | ✅ | ✅ |
| Gallery index / detail | ✅ | — | ✅ | — |
| Quote-accept page | ✅ | — | ✅ | — |
| Email templates | ✅ | ✅ | ✅ | ✅ |
| `OrganizationJsonLd` | ✅ | ✅ | ✅ | ✅ |
| Page-level LocalBusiness JSON-LD | ✅ | ✅ | ✅ | — |
| `public/llms.txt` | ✅ | ✅ | ✅ | — |

**Every public NAP surface now displays an identical canonical string, every `tel:` href uses E.164, and every `mailto:` goes to the canonical email.**

---

## 8. Guard rails for future edits

To prevent NAP drift from creeping back in:

1. **Never hardcode the phone in a `tel:` href.** Use `SITE.phoneHref`. A `tel:${SITE.phone}` template will emit `tel:254-346-7764` (not E.164) — avoid it.
2. **Never hardcode the email in `mailto:`.** Use `` `mailto:${SITE.email}` ``.
3. **Never hardcode the address.** Use `SITE.address.street`, `SITE.address.city`, etc.
4. Adding a new page? The footer already handles NAP for the whole marketing group via `(marketing)/layout.tsx`. Page-level LocalBusiness JSON-LD (if added) should spread from `SITE`.
5. If the phone number ever changes, edit **only** `src/lib/site.ts` — `phone` and `phoneHref` — and the whole site follows. The three email-template hardcoded footers (`"Triple J Metal LLC · 3319 Tem-Bel Ln, Temple, TX 76502 · 254-346-7764"` literals in `src/emails/*`) are the only remaining non-SITE-sourced NAP strings and would also need updating.
