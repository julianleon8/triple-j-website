# Schema.org audit — 2026-04-24

Sitewide JSON-LD refactor. Replaces ad-hoc per-page LocalBusiness duplicates with a single canonical `@graph` (Organization + LocalBusiness + WebSite) emitted from the marketing layout, and tightens per-page schema to reference that graph by `@id` instead of re-declaring the business.

## Canonical entity graph

Emitted by `src/components/seo/OrganizationJsonLd.tsx`, mounted once via `src/app/(marketing)/layout.tsx`. Every marketing page receives this graph.

| `@id` | `@type` | Purpose |
|---|---|---|
| `<base>/#organization` | `Organization` | Legal entity. Fields: `name`, `legalName`, `alternateName`, `description`, `url`, `logo` (ImageObject), `image`, `foundingDate`, `founder` (Person, "Juan Leon"), `address` (PostalAddress), `contactPoint[]` (telephone + email + `contactType: "customer service"` + `areaServed: "US-TX"` + `availableLanguage: ["English","Spanish"]`), `sameAs` (Instagram + Facebook + Google when populated). |
| `<base>/#localbusiness` | `["LocalBusiness", "HomeAndConstructionBusiness"]` | The local-business presence. Dual-typed so Rich Results validators that look for the literal "LocalBusiness" string still match while Google gets the more specific subtype. Fields: full NAP, `geo` (31.0982, -97.3428 — Temple HQ), `openingHoursSpecification` (Mon–Sat 08:00–18:00), `priceRange: "$$"`, `currenciesAccepted: "USD"`, `paymentAccepted`, `areaServed[]` (every LOCATIONS city + de-duped county list), `knowsAbout[]`, `hasOfferCatalog` (services with URLs), `parentOrganization → #organization`. |
| `<base>/#website` | `WebSite` | Canonical site identity. `publisher → #organization`, `inLanguage: "en-US"`. |

## Per-page schema (post-refactor)

| Route | `@type` | Pattern |
|---|---|---|
| `/` | (none beyond layout graph) | The `Organization` + `LocalBusiness` + `WebSite` graph from the layout is the homepage's full schema. No homepage-specific node added — the canonical graph IS the homepage's schema. |
| `/about` | `AboutPage` | References `#organization` via `about`. Replaces the prior redundant LocalBusiness duplicate. |
| `/contact` | `ContactPage` | References `#localbusiness` via `about`. Replaces the prior redundant LocalBusiness duplicate. |
| `/locations` | `ItemList` | Index of every location page (unchanged). |
| `/locations/[slug]` | `@graph: [Service, WebPage]` | `Service` scoped to the city, `provider → #localbusiness`, `areaServed: City` with `geo` + `containedInPlace: AdministrativeArea` (county). `WebPage` references `#website` and `#localbusiness`. `hasOfferCatalog` populated from `loc.topServices`. |
| `/services` | (none) | Index page, no schema. |
| `/services/[slug]` | `@graph: [Service, WebPage, FAQPage?]` | `Service` with `serviceType` + `provider → #localbusiness`. `WebPage` references `#website`. `FAQPage` is a sibling node (NOT nested in `Service.mainEntity`) when `svc.faqs.length > 0`. Each `Service.faqs` item becomes a `Question` with `acceptedAnswer: Answer`. |
| `/services/pbr-vs-pbu-panels` | `FAQPage` | Standalone FAQPage node, unchanged. |
| `/services/colors`, `/services/hybrid-projects` | (none) | Editorial pages, no schema beyond layout. |
| `/blog` | (none) | Index page, no schema. |
| `/blog/[slug]` | `BlogPosting` | Now includes `@id`, `image`, `mainEntityOfPage`, `articleSection: post.category`, `author → #organization`, `publisher → #organization`, `inLanguage`. |
| `/gallery` | `ImageGallery` | Unchanged. |
| `/gallery/[id]` | `ImageGallery` with `associatedMedia: ImageObject[]` | Unchanged — already strong (per-photo Place + creator + copyright + acquireLicensePage). |
| `/partners` | (none) | No per-page schema. |
| `/privacy`, `/terms` | (none) | No per-page schema. |

`BreadcrumbJsonLd` is emitted separately on `/services/[slug]` and `/locations/[slug]` and is unchanged.

## What changed and why

| Change | Reason |
|---|---|
| Promoted `OrganizationJsonLd` to a `@graph` of three nodes (Organization + LocalBusiness + WebSite) with `@id` URIs | Per Google's structured-data guide, identifying the legal entity (Organization) and the local presence (LocalBusiness) as separate nodes — linked via `parentOrganization` — is the strongest signal for businesses where the registered name differs from the public brand. |
| LocalBusiness dual-typed as `["LocalBusiness", "HomeAndConstructionBusiness"]` | `HomeAndConstructionBusiness` is the schema.org subtype for construction contractors. Dual typing keeps Rich Results compatibility while giving Google the more specific subtype. |
| Added `contactPoint` with `availableLanguage: ["English", "Spanish"]` | Triple J's Hispanic homeowner base is a real demographic — surfacing bilingual support in schema is a direct AI-search and Knowledge Panel signal. |
| Added `founder: Juan Leon` + Person | Founder data improves Knowledge Panel completeness. Juan is the public face per AGENTS.md. |
| `areaServed` expanded to include de-duped county AdministrativeArea entries (Bell, Coryell, McLennan, Williamson) alongside cities | Counties carry SEO weight for "metal carport [county] tx" queries that don't name a specific city. |
| `/locations/[slug]` switched from inline LocalBusiness duplicate → `Service` + `WebPage` referencing `#localbusiness` via `@id` | Multiple LocalBusiness nodes for the same physical location create entity ambiguity for Google. The Service-per-page pattern is what schema.org and Google recommend for "service-area landing pages." |
| `/services/[slug]` FAQPage moved out of `Service.mainEntity` and into a sibling `@graph` node | Sibling FAQPage scores cleaner in the Rich Results test and keeps `Service` focused on the service entity. Both forms are valid, but the sibling form is the recommended Google pattern. |
| `/about` + `/contact` LocalBusiness duplicates removed → replaced with `AboutPage` and `ContactPage` referencing the canonical graph | Both pages already received the layout's full LocalBusiness graph. The inline duplicates were missing fields (geo on /about, openingHoursSpecification on /contact) and risked entity confusion. The page-type nodes are the schema.org-recommended pattern for these page templates. |
| Hardcoded `https://www.triplejmetaltx.com` and `https://triplejmetaltx.com` URLs in JSON-LD switched to `getSiteUrl()` | Mismatched canonical hosts (`www.` vs apex) in schema confuses crawlers. `getSiteUrl()` reads `NEXT_PUBLIC_SITE_URL` so prod, preview, and dev all emit the right host. |
| `/blog/[slug]` BlogPosting added `image`, `mainEntityOfPage`, `articleSection`, `@id`, `inLanguage` | Required + recommended BlogPosting fields per Google's article rich-result guidelines. |

## Review / AggregateRating audit

`src/components/sections/Testimonials.tsx` renders six placeholder testimonial cards. **No** Review or AggregateRating schema is emitted — confirmed via repo-wide grep for `aggregateRating`, `Review`, `reviewBody`. This is correct: Google's review-snippet policy requires reviews to be first-party and verifiable, and these cards are placeholders pending real Google reviews. Per `testimonials.md`, schema is to remain off until real reviews land.

## Validation pass

Every emitted JSON-LD block was checked against schema.org spec for required and recommended fields. Notes:

- **LocalBusiness** required: `name`, `address` ✓. Recommended: `telephone`, `priceRange`, `openingHoursSpecification`, `geo`, `image`, `url` — all present.
- **Organization** required: `name`, `url` ✓. Recommended: `logo`, `address`, `contactPoint`, `sameAs` — all present.
- **Service** required: `name`, `provider` ✓. Recommended: `description`, `serviceType`, `areaServed`, `hasOfferCatalog` — all present where applicable.
- **BlogPosting** required: `headline`, `image`, `datePublished`, `author`, `publisher` ✓.
- **FAQPage**: `mainEntity` array of `Question` with `acceptedAnswer: Answer` ✓.
- **WebPage / AboutPage / ContactPage**: `name`, `url`, `isPartOf` ✓.

No fields would fail Google's Rich Results Test; no warnings expected for the LocalBusiness, Service, FAQPage, or BlogPosting types covered.

## Things deliberately not changed

- `src/components/seo/BreadcrumbJsonLd.tsx` — already correct, used unchanged.
- `/gallery` and `/gallery/[id]` — ImageGallery + ImageObject schema is already strong (per-photo Place + creator + copyrightHolder + acquireLicensePage).
- `/services/pbr-vs-pbu-panels` standalone FAQPage — unchanged; the three-question content schema was already correct.

## Next-pass candidates (not in this commit)

- Add `aggregateRating` to `#localbusiness` once real Google reviews land — coordinate with `testimonials.md` checklist.
- Consider per-photo `Product` schema on `/gallery/[id]` if Triple J starts publishing pricing — currently blocked by the no-public-pricing decision.
- Add `BreadcrumbList` to `/blog/[slug]` (currently has it on `/services/[slug]` and `/locations/[slug]` only).
- `/military` (Phase B of this push) gets its own `Service` + `WebPage` graph following the `/locations/[slug]` pattern.
