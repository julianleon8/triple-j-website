# PR 13 — Retire Barlow + royal blue on the public surface (scope note)

**Target:** `main`, after `redesign/forge` is merged · **Depends on:** 00–12 · **Size:** L

> This PR was **not designed** in this package. It lists the cleanup and the remaining surfaces that `Locked Decisions.md` puts in redesign scope. Split it further if needed.

## 13a · Marketing cleanup (do this first)
- Remove the legacy `.marketing h1/h2/h3` rules and the scoped `p` rule from `globals.css`. Once every marketing route is Forge, the `data-forge` escapes become moot.
- Point `--font-display` at Cinzel for marketing. Drop `Barlow_Condensed` from `layout.tsx` **only after** 13b–13d no longer need it (OG cards and HQ use it too).
- Delete legacy classes once a grep shows no references: `quote-glow`, `hero-glow`, `hero-gradient`, `hero-scrim`, `hero-bottom-fade`, `hero-chip-overlay`, `bg-grid-decoration`, `bg-dot-grid`, `bg-kenburns`, `bg-mil-camo`, `[data-theme='military']`, `.reveal`/`.hero-anim` (if unused).
- Restyle the remaining un-migrated marketing routes in Forge, without new design: blog index and posts, alternatives, best-metal-carport-builders-temple-tx, services index/colors/hybrid/pbr-vs-pbu, locations index, quote, thank-you, privacy, terms, not-found. Use the PR 02 primitives and the Forge section rhythm.
- `layout.tsx` viewport `themeColor` (light): `#1e6bd6` → `#00182a`.
- Global `::selection` and `:focus-visible` → Forge values.

## 13b · OG cards
`src/lib/og-card.tsx` + `src/lib/og-fonts/`:
- Add `cinzel-latin-900-normal.woff` and `cinzel-latin-700-normal.woff` (from @fontsource/cinzel).
- Swap the colors to navy / steel gradient.
- Update `og-coverage.test.ts` if it asserts fonts.

## 13c · Customer emails + quote PDF
- `src/emails/BrandLayout.tsx` and `PartnerInquiryConfirmation.tsx`: navy/slate palette. The headline font stack is `Cinzel, Georgia, serif`, because Gmail ignores web fonts (Next Session Primer).
- `src/lib/quote-pdf.tsx`: register the Cinzel font file and switch to navy/slate.

## 13d · HQ (needs its own design pass)
`Locked Decisions.md` says HQ moves to Cinzel headings (no `uppercase`) and the navy/slate palette. HQ currently runs the "Shop floor" 2b direction: gold primary, sky links, forced dark.
- **Do not** just alias `brand-*` onto navy: on HQ's `#0b0d0f` ground that kills contrast.
- Raise it with the owner as a separate design task.
