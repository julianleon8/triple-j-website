# Locked Decisions — Current State

**What is true right now.** Every line cites the `Decisions.md` date that last set it.

When a decision reverses: append a row to `Decisions.md` (the ledger is append-only, never edited) **and overwrite the affected line here, in the same turn**. Those two writes are the whole protocol. If they disagree, this file is wrong and `Decisions.md` wins — the most recent row for a topic is authoritative.

Do not copy anything from this file into `AGENTS.md`. That duplication is what produced four months of silent drift.

---

## Product

- **Website claims and city-page cleanup:** Removed unsupported competitor installation/lead-time/exclusivity claims and the unverifiable Temple Steel Buildings listing. Concrete is separately priced; service pricing uses the approved steel-and-install basis. Salado, Lampasas, Holland, Taylor, Troy, Nolanville, Harker Heights and Copperas Cove now have researched local context, planning guidance, service links and a cited local source. City galleries show only active projects with matching city labels. (2026-09-26; Harker Heights and Copperas Cove 2026-10-01)

- **Steel:** 14-gauge framing is standard. The **heavy-duty upgrade** is 11-gauge columns, welded to the receivers and purlins; the rest of the frame stays 14-gauge. Never "12-gauge", never a full 11-gauge frame. (2026-10-02)

- **Fencing launch:** Metal privacy, pipe/ranch, ornamental metal fencing and gates approved. Gates have their own page, `/services/gates` (2026-10-02). Dedicated page and quote intake; project-specific price and schedule, with no invented rankings. Fencing is stored as `other` with explicit scope in lead notes. Campaign spend comes out of the paid-ad cap below. (2026-09-26)

- **Paid-ad cap and split:** **$500/month total across every paid channel.** October: $400 Google Search + $100 one-time (truck magnets, yard signs). November onward: $400 Google Search + $100 Facebook boosted post. Facebook Marketplace, the Page and groups stay free. Owner-approved; plan in `marketing/lead-plan-2026-09-29.md`. **Google Search campaign `Search | Temple Area | Oct 2026` published 2026-10-01**, ad group 1 (Carports & RV covers) only; planned budget $13/day (about $395/month). Ad text: `marketing/google-ads-campaign-build.md`. (2026-10-01)

- **Analytics:** PostHog records the public site's funnel and session replays in **its own project**, never shared with another business. Event names live in `src/lib/analytics.ts` (add, never rename); the conversion is the server-side `lead_created`. Never tracked: `/hq`, `/login`, `/setup`, `/quotes/[token]`. Never sent as a property: name, phone, email, message; replay masks all inputs. Owner browsers and preview hosts are tagged `internal_traffic`. Its alerts and the Monday numbers reach the owner as **HQ push**; email is only PostHog's backstop. Setup: `Connectors.md` → PostHog. (2026-10-03)

- **Internal linking:** every public page is linked from at least two page *bodies* (inside `<main>`; header and footer links do not count) and, apart from the legal pages, links onward. Every blog post links a service, a city and `/quote`. Related posts come from `relatedBlogPosts()` and neighbouring cities from `nearbyCities()` (derived from the `LOCATIONS` lat/lng, never a hand-kept list). After changing navigation, a page template, or `services.ts` / `locations.ts`: build, start, and run `node scripts/check-links.mjs --base <url> --strict`. (2026-10-03)

- **Timeline:** "**same-week**", never say "48-hour build". 48 hrs = materials arrival, not build time. Saying otherwise is misleading. (2026-04-15)
- **Frame:** "**welded or bolted**" everywhere. Triple J does both. Never "custom welded" alone. (2026-04-15)
- **Concrete spec:** **3,000 PSI is standard. 4,000 PSI is on request only** — never promised as the default. (2026-05-01 — **REVERSES** the 2026-04-15 lock that made 4,000 PSI a headline differentiator.) Confirmed by Julian 2026-09-06 and now true of the shipped site: all 22 occurrences rewritten, and `scripts/check-vault.mjs` enforces it with no exceptions.
- **Services** include lean-to patios and house additions alongside carports, garages, barns, RV/boat covers, equipment covers, metal porches, ranch structures. **Barndominiums are paused until 2027** (see On hold). (2026-09-29)
- **Tagline:** "Built right, built fast, built by Triple J." (2026-04-15). **Homepage hero headline is exactly "Built right. Built fast. Built by Triple J."**, and the line "Built by Triple J." takes the accent colour. "Your land. Your plans. Our steel." is retired. The hero is **centred** (left-aligned as the fallback), and "Built by Triple J." is a **brushed-steel gradient** (silver to slate). The hero buttons are a white **"Get a Free Quote →"** that scrolls to the homepage quote form and an outline **"See Our Builds"** that scrolls to the builds strip (2026-10-02, **REVERSES** the three-shortcut "Start Your Free Quote" block). **The whole hero is visible at load**: no pinned scroll reveal; the only hero motion is the slow photo zoom as it scrolls away plus the ticker (2026-10-02). The proof strip becomes a slow **Latest builds ticker** of real active gallery projects (title and city from `gallery_items`, never invented), and it respects reduced motion. The eyebrow is "Family-owned · Temple, Texas" and the subhead is the one sentence "Carports, garages, barns and patios, welded or bolted on your property by our own Central Texas crew." (the earlier two-sentence wording is retired). The **hero photo is the Rogers 23×35 carport with gutters** (gallery file `items/f548bede-4068-4f8a-9f45-541bec33c5c4/1790436675921.jpg`), cropped 50% 50% on desktop and 40% 50% on phone; the Mexicano Grille frame was rejected as too wide on mobile. The reference mockups are in `docs/redesign-2026-10/`. (2026-10-01)
- **Marketing headline face: Cinzel Black (900)**, chosen because it matches the lion logo's "TRIPLE J" lettering. It replaces Barlow Condensed on the public site, OG cards, customer emails and the quote PDF (built 2026-10-02 on the preview branch; `main` still ships Barlow until the merge). Barlow stays loaded for HQ only. Body stays Inter. **The redesign scope includes HQ, the customer emails and the quote PDF**: all of them move to Cinzel headlines and the navy/slate palette. HQ headings drop `uppercase` (Cinzel's lowercase are already small caps), and HQ body stays the iOS system stack. Emails need a serif fallback, and the PDF registers Cinzel as a font file. (2026-10-01) **Shipped for emails and the PDF (2026-10-02):** `BrandLayout` is navy with a steel rule and a "Triple J Metal" wordmark in `Cinzel, Georgia, serif` (Gmail shows Georgia); the exported `BRAND_COLOR`/`INK_900` now hold navy, so every template follows; grey neutrals map to Forge slate/mist/fog. The quote PDF registers the og-fonts Cinzel WOFFs for the wordmark and grand total (`src/lib/quote-pdf.test.ts` renders it). HQ is still to do.
- **Fonts (shipped today; replaced by Cinzel on the site and in HQ when the 2026-10 redesign ships):** Barlow Condensed (headlines) + Inter (body). Geist removed. **Barlow Condensed is the HQ heading face too** — uppercase, 600/700, applied per heading as `font-display` beside an explicit `text-[Npx]`, never as a bare `.hq-ui h1/h2/h3` rule (that rule would be unlayered and would outrank the very sizes the screens set). Inter remains the marketing body face. (2026-09-07 — **REVERSES** the 2026-04-24 "Barlow is scoped to marketing only, not HQ" lock, which the "Shop floor" direction depends on.) HQ body text is the iOS system stack, applied as `font-(family-name:--font-ios)` — the `family-name:` prefix is required, because Tailwind v4 reads the bare `font-()` shorthand as font-weight and that silently left HQ on Inter from the day the class was written. (fix 2026-09-07)
- **Brand colour (redesign in progress, 2026-10-01):** the logo's navy `#00182a` and slate `#546678`/`#788a9c` with silver highlights replace royal blue `#1e6bd6` (**REVERSES** 2026-04-14). **No red accent** anywhere: not on buttons, tags, rules or hover states. Scope: public site, customer emails, quote PDF and HQ, so the shared tokens are rewritten globally. Public site, OG cards, emails and PDF are navy (2026-10-02, preview branch); the `brand-*` tokens in `globals.css` still hold the old blue because HQ uses them — HQ is its own design pass. **One exception:** the service-page "Related" link buttons are `#1e6bd6` (hover `#1851b5`), owner-requested (2026-10-02).
- **Light/dark (2026-10-01, redesign):** the public site **alternates light sections with full-width navy `#00182a` bands**; the hero is navy. Homepage bands: **Hero navy, Builds light, Services navy, Quote form light, Footer navy.** (**REVERSES** the 2026-09-07 "public site stays light".)
- **Homepage order (2026-10-01, redesign):** **Hero, Builds, Services, Quote.** How it works and Service areas leave the homepage; How it works stays on `/quote`, and service areas live on `/locations` and in the footer. The homepage keeps the **inline `#quote` form**, and its quote buttons scroll to it.
- **Trust before reviews (2026-10-01, redesign):** show 3–5 **real customer quotes collected with permission** (first name, project, city), sourced from customers whose jobs are in the gallery. The owner collects them into `testimonials.md`; until then nothing is shown, never placeholders. Each quote appears **with its build**: on the job's card in the homepage Builds section and on its `/gallery/[id]` page; there is no separate reviews band.
- **Motion (2026-10-02, Forge):** subtle, as the Forge package specifies: one curve `cubic-bezier(.22,1,.36,1)`, sections fade and rise 16px once as they enter, the header turns solid over the homepage hero and hides on scroll-down, the Latest builds ticker, the homepage hero photo's slow zoom. No pinned scroll reveal (owner, 2026-10-02), no counters, no hover lifts (build cards gain a border and shadow only). Everything stops under `prefers-reduced-motion`.
- **Redesign process (2026-10-02):** the **Forge design package** in `docs/redesign-2026-10/forge-handoff/` is the reference for the whole public site: design system, HTML references for every page, and a 14-PR build plan. For look and copy it wins wherever its § Deltas table marks an item resolved; these lines record the owner's picks. It **REVERSES** the 2026-10-01 plan to design the rest of the site in Figma.
- **Redesign references (2026-10-01):** none. The owner rejected all 9 proposed reference sites; the hero mockup and the logged decisions are the reference.
- **Redesign review (2026-10-01):** built on a branch and reviewed on a **Vercel preview link** on the owner's phone; nothing merges to `main` until approved. No `src/` change until the owner has laid out the whole site plan.
- **Header (2026-10-02, Forge):** lion mark + "Triple J Metal" in Cinzel (never the "Metal Buildings" `logo-full.jpg`). Nav **Services ▾ · Gallery · About · Partners · Contact**: Services opens a mega menu (Carports, Metal Fencing, Gates; Temple, Belton; a Fort Cavazos card), and the mobile menu carries the same groups (**REVERSES** the 2026-10-01 five plain links). Phone number from 1180px; white "Get a Free Quote" button that scrolls to the page's own quote section, or `/quote` where there is none ("Send a Message" on `/contact`, "Partner Inquiry" on `/partners`). Blog stays in the footer; the top thin bar is removed. 84px tall (72px under 900px). Transparent over the homepage hero, solid navy once scrolled.
- **Footer texture (2026-10-02, Forge):** a **PBR wall panel**, drawn as an SVG tile (`.forge-pbr` in `globals.css`): 12" pitch, a trapezoid major rib lit from the left, two stiffener ribs per pan, under the footer scrim, on every page. **REVERSES** the D10 brushed-steel default. No texture PNGs ship.
- **Service-card prices (2026-10-01, redesign):** homepage cards keep "From $X" (steel + install floors from the sales pack); `/quote` stays price-free.
- **Design:** the **Forge** system (2026-10-02, `docs/redesign-2026-10/forge-handoff/`) on every public page, OG card, customer email and the quote PDF — on the preview branch until merged. Portfolio right after a simplified hero; the Juan/Julian/Freddy introduction on About only; real jobsite imagery until a real crew portrait is supplied. HQ is not yet Forge (its own design pass).
- **Trust facts:** Zero Subcontractors · Welded or Bolted · Same-Week · Temple TX — the approved short trust facts, used in Forge hero fact strips. The pre-Forge `TrustBar` component was deleted with the Forge rebuild (2026-10-02).
- **Testimonials:** real reviews only — the six invented "Verified Project" quotes were removed 2026-09-07, and the pre-Forge marquee component (with its empty `REVIEWS`) was deleted 2026-10-02; no page renders testimonials now. When 3+ real reviews with permission are in `testimonials.md`, a Forge testimonial block is designed and placed (the `/military` Hablamos español band has a slot for one). Never show a `rating` or stars without a real review behind it.
- **Lead form:** two steps: project + ZIP, then contact + details. **Forge (2026-10-02):** one centered quote section (card max 760px) on every Forge page except `/contact` and `/partners`; timeline ASAP / This month / Just planning; budget Under $5k / $5k–$10k / $10k–$20k / $20k+ / Not sure yet; "Do you need permits?" (Yes / No / Not sure) appended to the lead notes; submit pipeline unchanged. Offer Lean-To / Patio and Other / Custom; homepage shortcuts preselect the build. Lean-To maps to the existing `other` lead category with its label preserved in notes. One component with a `chrome` prop — `chrome={false}` renders the card alone for `/quote` and the host page must supply the dark ground it is styled against. `best_time_to_call` is part of the field set on every instance. Implemented; approved for publication 2026-09-07. **`/contact` and `/partners` (2026-10-02):** `/contact` sends a short message instead (topic, reply channel, language; an Email field appears when Email is picked) to `/api/leads` as `service_type: 'other'` with no ZIP, and its success panel fires the same Google Ads lead conversion as `/thank-you` (parity with the old `/contact` quote form). `/partners` posts to `/api/partner-inquiries`; email is required because the API requires it, and counties and volume ride in the message.
- **`/quote` is the dedicated quote landing page** — an ad target, a short link, and the header CTA destination on pages without their own quote section (2026-10-02). It **coexists** with the inline `#quote` sections; those are not removed and only the Header CTAs repoint. Indexed at sitemap priority 0.9 with its own OG card. Prefills from `?service`, `?city`/`?zip` and `?project`, dropping anything unrecognised, and sends `source: 'quote_page'`. `/free-quote`, `/estimate`, `/services/lean-to-patios` and `/services/house-additions` redirect there. (2026-09-07)
- **Response promise:** `/quote` and `/thank-you?from=quote` say **"Same day, guaranteed within 24 hours."** Both figures in one line, so no downstream surface contradicts it. Everywhere else keeps "within 24 hours"; nothing may say "most replies". (2026-09-07) **Known exception (2026-10-02):** `/contact` ("We call back same day", "Same-day callback") has said same day since before Forge and the design keeps it — owner to confirm it or bring it to "within 24 hours". `/military` timeline step 1 reads "Callback within 24 hours". The customer confirmation email's inbox preview says "today" only for ASAP leads, else "within 24 hours", matching its body. The 404's quote link goes to `/quote` with "we call you back within 24 hours". Plain `/thank-you` says "within 24 hours" with no "usually the same day" tail, and its first next step matches whichever promise the visitor came from.
- **Phone on the quote page:** `/quote` shows a tracked tap-to-call CTA at equal weight beside the form. A deliberate carve-out from the 2026-04-23 "phone hidden inside the form" rule, which still governs the fourteen inline forms. (2026-09-07)
- **Military / first-responder discount is a checkbox on the form**, not an eyebrow line only. The shipped code is authoritative; this ends the conflict with the 2026-04-23 design note. (2026-09-07) **`/military` (Forge, 2026-10-02):** olive/tan accents, no camo or `data-theme`; the "See what 7% means" calculator uses the sales-pack bases (carport $3,000, garage $5,500, barn $6,500) and prefills the form with the build and the box checked. Distance is stated only as "30 min from Killeen" (HQ → Killeen, `locations.ts`); no per-city drive times to the main gate; catchment tiles show the county. No testimonial until a real one exists.
- **Permits are advisory only** — "Building permits? We'll talk you through it." Never promise to pull, file, or guarantee one. (2026-09-07)
- **`/quote` carries no prices, no deposit or payment language, and no stars or reviews.** (2026-09-07)
- **Campaign attribution:** preserve the first marketing landing and campaign parameters for the browser-tab session across navigation and reloads; use memory if session storage is blocked. (2026-09-06)
- **HQ is forced dark, always.** `.hq-ui`, applied to the wrapper in `src/app/hq/layout.tsx`, remaps the
  semantic tokens for that subtree to the "Shop floor" direction — page `#0b0d0f`, card `#14181c`, raised
  `#1b2126`, ink `#f2f4f5`. HQ does **not** follow `prefers-color-scheme`; the marketing site still does.
  `dark:` is redefined in `src/app/globals.css` to mean "inside `.hq-ui`" rather than "the OS is dark", so
  the ~144 existing `dark:` utilities fire unconditionally in HQ with no file edits. **Only custom
  properties may go in the `.hq-ui` block** — hand-written rules in that file are emitted unlayered and
  would outrank every Tailwind utility inside HQ; `color-scheme: dark` is the one documented exception.
  (2026-09-07)
- **Two interactive tokens in HQ, not one:** `--brand-fg` is the gold action colour `#f5a524`, and text on
  it is `--text-on-brand` `#0b0d0f` — **never `text-white`**, which lands at ~1.9:1. `--link-fg` is the blue
  used for links, back affordances and secondary buttons. Outside HQ `--link-fg` is simply `--brand-fg`, so
  nothing changes there. Lucide `strokeWidth={2}` is still the HQ default. (2026-09-07 — **REVERSES** the
  2026-04-24 single-brand-token rule.)
- **Steel color names:** no vendor-specific color names in customer copy. (2026-04-26)
- **`/service-areas` is dead** — 301 → `/locations`. (2026-04-26)
- **County location pages are dead** — all eight 301 → their strongest member city, or `/locations` where
  there is none. Removed from `LOCATIONS`, so they are out of the sitemap and the routing table.
  `/locations` lists counties as plain text derived from `LOCATIONS[slug].county`. (2026-09-07)
- **No `FAQPage` markup** — Google retired the FAQ rich result 2026-05-07. Visible Q&A stays; the JSON-LD
  does not. (2026-09-07)
- **Every route family renders its own OG card** via `src/lib/og-card.tsx` + `opengraph-image.tsx`; the
  homepage renders the photo brand card (`renderBrandCard`). `/og-default.jpg` is the fallback, not the
  default — a `force-static` route rendering that same brand card as JPEG, never a hand-made file in
  `public/`. Every card uses the site's own **Cinzel** (700/900) + Inter from `src/lib/og-fonts` — Forge since 2026-10-02: navy ground, a faded strip of PBR panel on the right, sentence-case Cinzel headline with the steel-gradient second line; `/military` swaps in olive and tan and repeats its h1. Barlow left the cards. **Every public
  page shares an image:** a page that sets its own `openGraph` must name `images` or ship an `opengraph-image`
  beside it — Next drops the parent's images otherwise — and `src/app/og-coverage.test.ts` fails the build if
  one does not. Card text is the page's own H1 and description, never new claims; gallery project pages share
  their own cover photo. (2026-09-28)
- **`/llms.txt` and `/llms-full.txt` are generated** by `src/lib/llms.ts` from `SITE`, `SERVICES`, `LOCATIONS` and `BLOG_POSTS` — never a hand-kept file in `public/`, which the vault checker cannot see. Its Key facts list may only restate lines from this file. (2026-10-01)
- **Search snippets:** titles ≤60 characters including the ` | Triple J Metal` suffix the template adds; descriptions ≤155. `src/lib/meta-lengths.test.ts` enforces it for data-driven pages. (2026-10-01)
- **Bylines:** comparison and alternatives pages say "Reviewed by Juan Luis Leon" with the title **Owner** — Freddy is the foreman. Blog posts credit "the Triple J Metal crew"; name a person only once the owner says who writes or reviews them. (2026-10-01)
- **CSP stays Report-Only** until about a week of `[csp]` lines from `/api/csp-report` (Vercel runtime logs) has been reviewed. (2026-10-01)
- **No `AggregateRating` or `Review` JSON-LD anywhere** — and none may be added while the GBP is unverified.
  Google treats reviews an entity controls about itself as ineligible regardless. (2026-09-07)
- **A link to an in-page section (`#quote`, `/#quote`) is a plain `<a>`, never `<Link>`.** `ForgeButtonLink`
  does this for any href containing `#` (and tel/mailto/sms/http) via `isPlainAnchor`. Android in-app browsers (Messenger, Marketplace) swallow `<Link>`'s
  router-driven scroll, so the tap does nothing; a Marketplace lead hit it on 2026-05-11. The closed mobile
  drawer is `invisible pointer-events-none`, and decorative hero overlays are `pointer-events-none`, so
  neither can eat a tap. `src/components/forge/styles.test.ts` guards it (the legacy `ButtonLink` and its test were deleted 2026-10-02). (2026-09-30)

## Project inquiries

- **The `leads.source` allowlist is owned by the database CHECK** (`leads_source_check`, migration 029). The public `POST /api/leads` accepts only `website_form | quote_page` from a client, as a closed zod enum — a bad value is a 400, never a constraint violation surfacing as a 500 and a lost lead. Every other source value is set server-side by its own ingest path. (2026-09-07)

- **HQ navigation has exactly one owner:** `src/app/hq/nav.ts` — `HQ_TABS`, `HQ_DESKTOP_NAV` derived from
  it, and `titleForPath()`. There were three lists with two different active-match rules and a title map that
  had no entry for calendar, calculator, activity or partners; never add a fourth. Bottom tabs are
  **Today · Leads · Capture · Jobs · More**; **Gallery moved into the More hub** to make room for Capture and
  is still in the desktop nav. The tab grid is sized from `HQ_TABS.length` via an inline style, because an
  interpolated `grid-cols-${n}` is a class Tailwind never generates. (2026-09-07)
- **The one-tap lead reply is an `sms:` link, never a Twilio send.** `/hq/leads/[id]` leads with
  "Send now · one tap" for a `new` lead with a phone: *"Thanks for the call — quote coming today.
  — Julian, Triple J Metal"*, opened in the device composer so it arrives from Julian's own number
  at no per-message cost and with no signal required. Because an `sms:` link confirms nothing and
  **there is no message-log table**, tapping optimistically sets `status: 'contacted'` (migration
  015's trigger stamps `first_response_at`) and the timeline shows "Contacted" — it must never
  claim a text was sent. Blank-field definitions live in `missingCaptureFields()` in
  `src/lib/hq/capture-draft.ts` and are shared with the capture checklist. Note `needs_concrete` is
  a string enum (`yes` / `already_have` / `unsure`), not a boolean. (2026-09-08)
- **A lead's phone becomes a `tel:` or `sms:` link only through `dialablePhone()`** (`src/lib/lead-contact.ts`).
  `leads.phone` is NOT NULL, so phoneless sources store placeholders ("messenger", "Not provided",
  pre-April "FB-PSID-…") that must never be dialed. A Messenger lead (`isMessengerLead()`) gets
  **Reply on Messenger**, linking to the Meta Business Suite inbox, on its HQ screen and in the owner alert;
  Meta's webhook carries no thread id, so the inbox is the closest link. (2026-09-30)

- **Today holds four blocks and nothing else:** Capture a call (full-width gold, → `/hq/capture`),
  the call-next card, "N drafts to finish", and quotes waiting on an answer. Revenue, win rate and
  avg ticket live on `/hq/more/stats` — they were already there, so the strip was deleted rather
  than moved. **"Needs attention" is gone**; the call-next card is the most urgent thing, and the
  feed restated the same ranking from a second, differently-limited copy of the same query. The
  drafts row is **not** a statistic and must not move to Stats: a draft scores 0 in `urgencyScore`,
  so that row is the only way back to an unfinished capture. (2026-09-08)

- **Quote building is not in HQ.** `/hq/quotes` is a read-only tracking list — segments **Out · Won ·
  Lost · All**, with `draft` in All only, because a draft is now a legacy row rather than work in
  progress. `/hq/quotes/new` returns `notFound()`; its wizard components stay on disk and keep
  type-checking, so this is **hidden, not deleted**. The reason is `src/lib/quote-pricing.ts` and its
  nine `TODO_PRICING` placeholders: the math is not trusted to produce a number worth sending. The
  quote detail screen renders line items and totals read-only; the QuickBooks push survives as its own
  component. `/hq/calculator` keeps the estimator and owns `CalculatorStep` outright — it was the only
  thing outside the wizard directory reaching into it. Segment membership lives in
  `src/lib/hq/quote-segments.ts` and nothing may re-derive it. (2026-09-08)

- **Contrast inside HQ is verified by rendered ancestry, never by a single-line grep.** The PR 1 sweep
  matched `bg-(--brand-fg)` and `text-white` in one string, so two files shipped white-on-gold at
  ~1.25:1. Two rules follow. **Never white on gold or amber** — `--hq-on-gold` is `#0b0d0f`, and
  `text-black` is correct on `amber-400/500`. **Every form control sets its own `bg-` and text colour**,
  because Tailwind preflight puts `color: inherit; background-color: transparent` on inputs, selects and
  textareas while `HqChrome` sets near-white ink on the whole subtree — a bare control on a light card
  is invisible, and an open `<select>` is invisible even over a dark one. Recharts takes colours as raw
  strings and never sees the theme: chart styling lives in `src/components/hq/chart-theme.ts`.
  **When verifying compiled CSS, assert on the exact escaped selector and confirm the expected
  value is present** — a hand-written checker that reports "missing" is unproven until it can find
  a known-good control. Two confident false conclusions in this project came from the verifier, not
  the code. Alpha modifiers on arbitrary `var()` colours (`bg-(--brand-fg)/15`) **do** work.
  (2026-09-08)

- **Capture's promise is "nothing to lose", and localStorage is what keeps it** — not the network. Every
  keystroke writes to `localStorage` **synchronously, before the request**, including the focused field and
  caret offset; iOS gives no `beforeunload` when it tears down a PWA for an incoming call, so
  `visibilitychange` is not enough. Autosave debounces 400ms and sends the **whole field set, never a
  delta** — over LTE a dropped PATCH would otherwise strand that value on the server while the phone shows
  it saved. Feedback is the "Saved Xs ago" line only: no toasts, no spinners, no Save button. The service
  worker routes every non-GET through `NetworkOnly`, so offline the line reads **"Saved on this phone"**
  rather than claiming a save that did not happen. (2026-09-07)
- **Duplicate detection is inline, never a modal.** On ten digits, leads and customers are matched on the
  last ten digits with both sides normalised in code — stored numbers are not normalised, so the column
  cannot be trusted. A customer outranks a lead in the list. "New anyway" sets `dup_ack`. A lookup that
  fails must never block typing. (2026-09-07)
- **A lead is a draft while `name` or `service_type` is NULL** — nothing else. `leads.is_draft` is a
  generated stored column (migration 033) and `isDraftLead()` in `src/lib/hq/capture-draft.ts` is its
  TypeScript mirror; the test pins the two against one fixture table so they cannot drift. **Size is
  deliberately NOT part of the predicate**, though the design named it: dimensions are optional on the
  public form, so including them would file most of the inbound web funnel as a draft. That exclusion is
  also why `POST /api/leads` needed no change. `leads.name` and `leads.phone` are nullable as of 033, and
  `service_type` lost its `'carport'` default — with the default in place an omitted column becomes a real
  value and `is_draft` can never be true. Drafts sort first in the Leads inbox New segment, never appear in
  Hot or Done, and score 0 in `urgencyScore`. (2026-09-07)
- **Draftness is carried on the row, never inferred from what it renders.** `PipelineRow.isDraft` comes
  from the generated column, with `isDraftLead()` as the fallback for select lists that did not ask for it.
  This matters because `matchesSegment()` drops a row whose trailing is not a status out of **every**
  segment including `all` — so reading draftness off the status pill would make drafts vanish from the
  inbox the next time the pill treatment changed. Drafts match **New and All only**, sort first
  **client-side** (server-side ordering would break `loadOlder()`, whose cursor is the last row's
  `created_at`), and the "N to finish" counts come from the whole-table scan, not the 50 rows on screen.
  (2026-09-07)
- **Capture writes through its own owner-only route**, `POST /api/hq/leads` (phone alone is enough),
  modelled on `/api/hq/voice-lead`. `POST /api/leads` stays exactly as it is — it is the public endpoint
  with hCaptcha and a 5/IP/hour limit, and loosening its required fields would open a nameless-lead spam
  hole into the CRM. `source` is `'phone'`, already in the validated allowlist; no new source value.
  (2026-09-07)
- **One Messenger sender, one open lead.** A Page message from a sender with an open (not won/lost) `facebook_messenger` lead appends to it and sends no second alert; the sender's PSID leads the `message` as `FB-Messenger-<psid>`. Owner: `src/lib/messenger-lead.ts`. (2026-09-29)
- **Voice memos are drafts, not fake customers.** The `'Voice memo (no name)'` / `phone: ''` /
  `'carport'` placeholders are gone; a memo that yields no name writes real NULLs and surfaces in the
  inbox with a FINISH action. (2026-09-07)
- **Project handoff:** use the existing project-page quote form, prefill building type only, and show a removable project-reference card. Reference removal preserves user edits. Resolve submitted reference IDs server-side against active projects, and append canonical reference details to existing lead notes for HQ and owner email; no migration. (2026-09-07)
- **Related projects:** show up to three active photographed matches on standard service pages, featured first. Turnkey requires Carport + Turnkey tag. HOA has no matching section without verified metadata. The existing Hybrid gallery moves above descriptive content. Approved for publication before property-photo work. (2026-09-07)
- **Gallery freshness:** an HQ gallery edit, including publishing a job to the Latest builds ticker, is live on the public site at the next page view, with no deploy. Every route that writes `gallery_items` or `gallery_photos` calls `revalidateGallery()` after a successful write, and `GALLERY_PATHS` in `src/lib/gallery-revalidate.ts` is the one list of public pages that show gallery data. Pages stay statically cached: use on-demand revalidation, never `force-dynamic`, to keep them fresh. The hourly `revalidate = 3600` on `/`, `/gallery/[id]`, `/services/[slug]` and `/locations/[slug]` is only the backstop for edits made straight in Supabase, which no route sees; those take up to an hour. A page that newly renders gallery data, such as a new `getBuilds()` caller, must be added to `GALLERY_PATHS` (a test fails until it is). A dynamic route must be given with its `(marketing)` group, or the call silently does nothing. (2026-10-03)

## Pricing

- **Public pricing is ALLOWED** on the website, ads, blog, `llms.txt`, and email. (2026-04-30 — **REVERSES** the earlier no-public-pricing rule)
  - Carve-out: Facebook **group** posts stay quote-based, not price-led.
- **Sheet prices are steel + install ONLY.** Concrete is always a separately-priced add-on. Never attach a sheet price to the word "turnkey". (2026-05-02)
- **"Turnkey" is a real offering, and one of three** — every structure is sold **welded, bolted, or turnkey**,
  and turnkey means site prep + concrete + installation on a single contract. Use the word freely where turnkey
  is the thing on offer and **no specific price is attached to it** — never as a blanket label on every service
  or card: "Built Turnkey." on all seven service OG cards was removed at owner direction. When copy mentions
  concrete in general, say **"concrete available"** — never "concrete included" or "turnkey with concrete" as a
  blanket. Stripping the word entirely was an over-correction and was reverted. (2026-09-28; refines 2026-05-02)
- **Welded = bolted total × 1.10.** Replaces the old flat +$600 surcharge, which overcharged small builds and undercharged large ones. Quotes given before 2026-05-02 are honored at +$600. (2026-05-02)
- **No standing promotion.** The free colored-panel upgrade expired 2026-05-15 and was removed from all sales-pack copy at owner direction; do not reintroduce a free upgrade or deadline offer without the owner. (2026-09-29)
- **Never publish per-sqft concrete pricing.** Internal/competitive intel — quote it by DM or call only. (2026-05-02)
- **2026 price raise:** +13–15% across the board, effective 2026-05-01. (2026-04-30)
- **Anchors** (steel + install, bolted, before tax): 20×20 carport **$3,000** · 25×25 carport **$4,000** · 30×30 garage **$5,500** · 20×40 RV/boat cover **$6,500** · 40×100 commercial/ranch **$29,500**. Walls $70/LF of perimeter.
- **Canonical price sheet:** `dev/sales-pack-2026-04-30.md`. **Do not improvise prices.** If a figure isn't in the sheet, ask.

## Positioning

- **Supplier-agnostic.** Never name a specific steel supplier in the vault, in customer copy, or in AI-facing files. Multi-source by design; purchase orders and invoices are the system of record. (2026-04-23)
- **Zero subcontractors** — owner-operated welders only.
- **Bilingual team** — Juan and Freddy in Spanish, Julian in English. Spanish-language listing variants are live in the sales pack. **Not an uncontested differentiator:** Polo's Carports (Waco) runs a full English/Español site and serves Temple, Belton, and Killeen. State it as a Triple J strength, never as something competitors lack. (2026-09-06)
- **Welded or bolted** is a differentiator **against national kit dealers only.** At least four local operators weld — Central Texas Metal Buildings, Polo's, Laneways, and Hill Country Mobile Welding (which covers Georgetown and Round Rock). Do not claim local competitors cannot weld. (2026-09-06)
- **Competitor lead times are 2–8 weeks**, not "4–16". Verified Sept 2026: Get Carports 4–8, Dayton 4–8, Mayberry 4–6, Cardinal 2–4. Same-week still wins; use the defensible number. (2026-09-06)
- **Canonical competitor roster:** `research/competitors/roster-2026-09.md`. `src/lib/competitors.ts` is the publishable subset, not a second source of truth. (2026-09-06)
- **Keyword research runs through `scripts/serp-steal.mjs`.** Google's top 10 and map pack as seen from each city come from a SERP API (DataForSEO or Serper, key held locally, never in Vercel); Claude says what each ranking page is and whether a strong local page could outrank it; code decides the bucket. **Sonnet 5.5 reads and classifies the web pages; Opus 5.5 judges each search** (`--page-model` / `--judge-model` override; about $12 of Claude per full run). A SERP API key is approved for this tool; the provider is not chosen yet. Reports land in `research/keywords/`; the raw cache in `.serp-cache/` is never committed. **Runs monthly** on the 1st at 5:52 am Central as a scheduled Claude session ("Triple J keyword openings — monthly"), not a GitHub Action (Actions is billing-blocked on the account). Each run sends an Excel workbook and publishes a dashboard; the reports are not committed. (2026-09-30 — model split **REVERSES** the same-day "Opus first run, Sonnet after" reading)

## Lead Engine

- **`temple` is the only enabled permit source** (2026-09-07 — **REVERSES** the same-day lock that made `bell_county` the only one). The City of Temple weekly building-permit report is static HTML, per-permit, weekly and current; the "JS-hydrated accordion" note that kept it off was wrong. `bell_county` is off for three independent reasons: scanned PDFs with no text layer, a page stale since the 2026-04-21 meeting, and court agendas are not building permits. `harker_heights` (Cloudflare 403) and the CivicPlus/Granicus sources still need headless work — re-enable them together, not before.
- **Resolve PDF hrefs against the page's `<base href>`, never the index URL.** Revize emits root-relative hrefs with no leading slash; resolving against the index URL doubles the path and 404s. `baseHrefOf()` / `resolvePdfUrl()` in `src/lib/jobs/scrape-permits.ts`. (2026-09-07)
- **The `?t=` cache-buster is the recency signal.** It is the publisher's upload timestamp; Temple's filenames ("Aug 21-27.pdf") carry no parseable date. `PDF_HREF_PATTERN` captures it as group 2 and `listReports()` sorts on it. (2026-09-07)
- **One shared `PDF_HREF_PATTERN`** in `src/lib/permit-sources.ts`. Never inline a per-source copy again — seven copies of a subtly wrong regex is how the scraper yielded zero from day one. Report-vs-noise is decided by each source's `pathFilter` / `exclude` against the **full path**, not the filename. (2026-09-07)
- **Three lead classes, stored side by side:** `accessory` (call on it), `new_home` (future secondary-structure prospect + the builder list), `commercial` (< $500K). Trades are dropped by job-type code before Claude sees a row (`KEEP_CODES` / `DROP_CODES`). A permit re-sighted in a later report updates only `job_status`, `source_url`, `source_report_date`; the owner's `status`, `notes` and `called_*` are never overwritten. (2026-09-07)
- **`permit_reports` is the processed-document ledger** (migration 031); `cron_runs` records runs, not documents. Backfill drains 3 reports per run, **2026 reports only** — `REPORT_FLOOR = '2026-01-01'` in `src/lib/jobs/scrape-permits.ts`: nothing uploaded before it is fetched, and a report whose print date (latest date stamp in its text) is before it is recorded with zero leads and never sent to Claude (2026-10-01; the 693 rows already read from 2025 reports were deleted the same day); a manual POST may carry `{ maxReports }` up to 20. Dedup key is a full `unique (jurisdiction, permit_number)` — the code suffix is part of the number because Temple reuses the sequence across codes. (2026-09-07)
- **The scraper returning HTTP 200 does not mean it worked.** Zero-yield with a clean status is its normal failure mode — and over a weekly source it is also its normal *success* six days in seven. Check `permit_reports.uploaded_at`, not the yield streak; the stall alarm fires after 14 quiet days, on Mondays only. (2026-09-07)
- **Owner names from permit reports are public record, HQ-only, never rendered publicly.** Consistent with the 2026-04-21 publish-the-narrative, hoard-the-leads split. (2026-09-07)
- **Claude's extraction output is a forced tool call, never free-text JSON.** The first live run got a ```json fence plus an array truncated at the 8k output cap — unparseable, so two reports were recorded with zero leads. A tool call cannot be fenced; truncation is detected via `stop_reason` and the batch is halved. Batches are 15 rows (`ROWS_PER_CALL`) against a 16k cap. (2026-09-07)
- **The Lead Engine vocabulary lives in `src/lib/jobs/scrape-permits.ts` and nowhere else:** `PERMIT_CATEGORIES` (20 categories under the three classes), `CLAUDE_TAGS` + `STATUS_TAGS`, `MATERIALS`. Claude picks from it, code enforces it (`normalizeCategory`, `mergeTags`, `normalizeMaterial`), HQ renders it. Deliberately no CHECK constraint — a new value is a code change, not a migration. Rows with `labeled_at IS NULL` are relabelled from stored `raw_source_text`, 45 per run, without refetching a PDF; class and score are never re-judged by that pass. (2026-09-07)
- **Measured facts are columns, not prose:** `sqft`, `dimensions` (WxL), `height_ft`, `material`, `applied_at` (the City's date stamp). Builders are grouped on `contractor_key` (`contractorKey()` — lower-case, no punctuation, no LLC/LTD/INC) and named by their most common spelling; Claude supplies `contractor_company` with the person stripped. (2026-09-07)
- **"Load all history" chains detached runs from the page** — a localStorage flag, `maxReports: 20` per POST, the next run starts when one finishes with reports still deferred — until nothing is left. The 240s budget decides how many reports each run actually reads. (2026-09-07)
- **A manual scrape is detached from the browser.** `POST /api/cron/scrape-permits` answers **202** at once and does the work in `after()`; **409** while a run is already open. The page shows the latest `cron_runs` row and polls `/api/cron/scrape-permits/status` every 5s while one is open. A tab is never what keeps a job alive — leaving it changed nothing on 2026-09-07 except what the owner could see. The Vercel Cron `GET` stays synchronous. (2026-09-07)
- **A run stops starting new reports after 240s** (`REPORT_TIME_BUDGET_MS`) so it is never killed at the 300s `maxDuration`. A killed run leaves `cron_runs.ok IS NULL` forever — the 2026-09-07 18:49 UTC row is exactly that, not a live problem. Unstarted reports wait for the next run and show as "left for next run" in the HQ panel. (2026-09-07)

## HQ access

- **"Is this the owner?" has exactly one definition:** `isOwnerEmail()` in `src/lib/owner.ts`, read from
  `OWNER_EMAIL`. It is enforced by `src/proxy.ts` (pages), by `requireOwner()` / `checkOwner()` /
  `getOwner()` in `src/lib/auth.ts` (**every** route under `src/app/api`), and by `cronAuth()`'s session
  branch. Never re-check `auth.getUser()` in a route — "signed in" is not "authorized", and that gap is
  what this replaced. Deny is **401** when nobody is signed in, **403** when signed in but not an owner.
  (2026-09-07)
- **An unset `OWNER_EMAIL` deliberately admits any authenticated user.** A missing env var must not lock
  the owner out of a live business tool; disabled signups and RLS are the real control. `owner.test.ts`
  pins this — if it fails, the trade-off changed. (2026-09-07)
- **A background and a text colour are set together, or neither is set.** `globals.css` opts the document
  into `color-scheme: light dark`, so a bare `bg-white` with no `text-*` renders near-white-on-white in OS
  dark mode — that is exactly how `/login` and `/setup` became unusable. Outside `(marketing)` (which locks
  `colorScheme: "light"`) every surface pairs `--surface-*` with `--text-*`. `src/app/(auth)/layout.tsx`
  owns that pairing for the auth pages; put new auth screens inside that group rather than restyling them.
  (2026-09-07)
- **Public endpoints carry no session check and must not gain one:** `POST /api/leads` and
  `POST /api/partner-inquiries` (hCaptcha + rate limit), `POST /api/quotes/[id]/accept` (bearer is the
  `accept_token`), `GET /api/gallery`, `/api/setup` (`SETUP_KEY`), and both webhooks (HMAC). (2026-09-07)
- **HQ never navigates to a raw file** (PDF, blob URL, download link). In the installed app there is no
  browser chrome, so a bare file strands the user with no way back. Files open in an HQ page that keeps the
  header, a back link and the tab bar; the quote PDF's is `/hq/quotes/[id]/pdf` (pdf.js). Sharing goes through
  `navigator.share`; a plain download is offered only outside the installed app or where there is no share
  sheet. (2026-10-01)

## HQ automation

- **Scheduled jobs record every run** to `public.cron_runs` via `withCronRun()` in `src/lib/cron.ts`. That ledger is the only source of "when did this last run / has it gone quiet". Job registry and schedules: `Connectors.md`. (2026-09-07)
- **Nudge cadence: at most ONE push per entity, ever** — `leads.nudged_at`, `quotes.stall_nudged_at`. The push says "you haven't seen this yet"; `NeedsAttentionFeed` stays the durable list. Do not add a re-nag interval. (2026-09-07)
- **The weekday morning brief is a digest, not a nudge.** One email at 7 AM Central, Monday–Friday, to the Triple J inbox and Julian's, listing every lead still `new` (oldest first) until someone works it, plus what came in since the last brief. The one-push-per-lead rule above is unchanged; the brief never pushes. Owner: `src/lib/jobs/morning-brief.ts`. (2026-09-29)
- **Quote staleness is measured from `sent_at`**, never `created_at`. `QUOTE_STALL_HOURS = 72`, beside `COLD_THRESHOLD_HOURS = 12`. Unknown `sent_at` means never stale. (2026-09-07)
- **ZIP geography is a layer *under* the service-area map, never a replacement.** `src/lib/zip.ts` +
  `src/lib/data/zip-geo.json` (4,188 ZIPs across TX/OK/LA/NM/AR, U.S. Census public domain, regenerated by
  `scripts/build-zip-data.mjs`) answers "where is this ZIP and how far is it". `cityFromZip()` remains the
  **only** thing that may populate `leads.city`. Distance is **straight-line, not drive time** —
  `driveMinutes` is a reserved seam and is null everywhere. "Out of area" is shown only past the `outside`
  band (>60 mi), never merely because a ZIP is absent from the curated list. Bearings are computed but
  **not displayed** until `SHOP_ORIGIN` is a surveyed shop coordinate rather than Temple's city point.
  (2026-09-07)
- **ZIP -> city has one owner:** `ZIP_TO_CITY` / `cityFromZip()` in `src/lib/locations.ts`, built from `LOCATIONS`. Never hand-maintain a second map in a route. An unrecognised ZIP resolves to **NULL**, never to the ZIP itself -- `leads.city` is a city name or NULL. Display uses `formatCityOrZip()` ("ZIP 76577"). County surfaces (`name === county`) are excluded from the map -- they carry a city's ZIP (`bell-county` holds Belton's 76513), so including them files Belton leads under "Bell County". Any remaining duplicate ZIP throws at module load. (2026-09-07)

## On hold / descoped

- **Barndominium builds — paused until 2027.** Ads exclude barndominium searches (barndominium, barndominiums, barndo and barndos are negative keywords). The barns page still mentions barndominium projects through GCs (`src/lib/services.ts`); that copy is unchanged pending the owner's call. (2026-09-29)
- **Stripe — descoped.** Listed as "phase 4" since 2026-04-13 but never had a dependency, an env var, or a line of code. QuickBooks is the money rail. Revisit only if customer card payment is actually requested. (2026-09-06)
- **ClickUp CRM** — on hold; revisit after live leads validate volume.
- **Native iOS app** — deferred; invest in PWA performance instead. (2026-04-25)
- ~~Migrations 014–020 proposed, not applied~~ — **wrong, corrected 2026-09-06.** All 24 migrations are applied. Verified against `supabase_migrations.schema_migrations`, which is the authoritative record; the vault never was. Run `node scripts/check-migrations.mjs` rather than trusting any file, including this one.
- **CSS-only `SwipeActions`** — deferred. (2026-04-25)

---

## Outstanding

Known gaps between what is locked above and what is actually shipped. `scripts/check-vault.mjs`
reports these on every run. Delete an entry the moment it is closed.

- **Roll-up door prices conflict; owner to confirm.** `dev/sales-pack-2026-04-30.md` says $800 per roll-up
  door. A 2026-05-06 pre-restart branch, never merged (set for deletion 2026-09-30; its change is kept as
  `archive/pre-restart-branches/rollup-door-pricing-d7d9497.patch`), recorded Freddy and Juan's handwritten sheet: 8×8 $1,000 · 10×10 $1,900 · 12×12 $1,800 ·
  14×14 $2,200 · 16×16 $2,600. `src/lib/quote-pricing.ts` still carries older placeholder sizes. No price
  was changed. (2026-09-30)
- **Automatic texting to leads and customers was built but never shipped; owner to decide.** Two
  pre-restart branches built a Twilio auto-reply to new leads and a post-job review request; the branches are set
  for deletion and the work is kept as patches in `archive/pre-restart-branches/`. Neither is on `main`, and the one-tap reply rule above sends
  from Julian's own phone instead. Automated business texting in the US also needs A2P 10DLC registration.
  (2026-09-30)

- **The keyword tool has not run on live data yet.** It needs `ANTHROPIC_API_KEY` plus `DATAFORSEO_LOGIN`/`DATAFORSEO_PASSWORD` or `SERPER_API_KEY` wherever it runs. It was verified against real dealer pages and a stand-in for the Claude API only. (2026-09-30)
- **Google Business Profile verification remains unresolved.** Owner reported on 2026-09-26 that Google keeps removing the profile. Cause has not been diagnosed. Profile verification/reinstatement remains owner follow-up; do not mark verified or add a Google review URL until confirmed.
