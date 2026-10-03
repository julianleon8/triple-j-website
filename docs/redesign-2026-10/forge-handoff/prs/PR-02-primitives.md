# PR 02 — Forge primitives

**Target:** `redesign/forge` · **Depends on:** 01 · **Size:** L

## Goal
Build the reusable components every page PR needs. Put them in a **new folder, `src/components/forge/`**, so the existing `src/components/ui/*` (used by HQ and un-migrated pages) stays untouched. Nothing renders them yet.

## Spec source
`forge-design-system/readme.md` § **Components** has exact values for every item below. `guidelines/components-*.html` renders them. Open them next to the reference pages.

## Components (one file each, named exports, typed props)
| Component | Notes |
|---|---|
| `ForgeButton` / `ForgeButtonLink` | Variants `white · navy · outlineDark · outlineLight · linkAccent`. Sizes `lg · md · sm · tap`. Optional `arrow` prop renders a trailing `→` (`aria-hidden`; slate inside `white`). `fullWidth`. Mirror the existing `Button.test.ts` style for the variant→class map |
| `ForgeIconButton` | 44×44, `onDark` / `onLight`, `round` (lightbox arrows) |
| `ForgeContainer` | max-width 1360px, padding-inline `clamp(20px,3vw,40px)` |
| `ForgeSection` | `tone: white · fog · navy`, `pad: default · sm · xs`. Sets `data-forge` and `data-tone` (for focus-ring color) |
| `Eyebrow` | `tone: light · dark · military`, `align: start · center` (centered = mirrored rule) |
| `SectionHeading` | eyebrow + h2 (`line1`, `line2` accent: slate on light, steel gradient on dark) + optional lede (max-width prop) |
| `PageHero` | photo variant (`scrim: page · military`) and plain-navy variant (Gallery/Contact). Breadcrumb, eyebrow, 2-line h1, lede, actions slot, optional `FactStrip` pinned bottom. min-height `clamp(560px,50vw,700px)` (military `clamp(580px,52vw,720px)`) |
| `Breadcrumb` | 13px silver, `/` steel, current white. Also emits the existing `BreadcrumbJsonLd` |
| `FactStrip` | glass `rgba(0,24,42,.78)` + `blur(6px)`, cells `auto-fit minmax(min(100%,210px),1fr)` |
| `OptionTabs` + `OptionCard` | Controlled; `role="tablist"`. The card hides its image area when there's no photo (never ship the striped placeholder) |
| `FeatureCard`, `NumberedRow` | Numbered `01` pattern; `NumberedRow` is the 44px-numeral list used on navy (light and dark tones) |
| `BuildCard` | `<a href="/gallery/[id]">` with an optional `onOpen` (lightbox) that calls `preventDefault`. Variants `compact` (17px title) and `gallery` (19px + "View →") |
| `PhotoCard` | min-height 280, scrim, title/sub/"Explore … →" |
| `SpecSheet` | rows `{k, v}` + footnote |
| `FaqAccordion` | single-open, first item open by default, `aria-expanded`/`aria-controls`. Also emits FAQ JSON-LD if the route already does |
| `RuleList` | steel 28×2 bars (tan 24×2 for military) |
| `Chip`, `ToggleChip` | neighborhood (36px), linked (navy border), county toggle (`+`/`✓`) |
| `SelectPill`, `PillGroup` | 42px; `selectedTone: navy · olive`; group = `role="radiogroup"` or `aria-pressed` buttons |
| `FieldLabel`, `TextInput`, `TextArea`, `CheckboxRow` | 46px inputs, navy focus border, `(optional)` suffix |
| `StepProgress` | "Step N of 2 · label" + 3px bar, 500ms ease-out |
| `SuccessPanel` | ✓ circle, title, body, summary rows, reset button |
| `ForgeReveal` | IntersectionObserver one-shot: opacity 0→1, translateY 16px→0, 600ms `--ease`, threshold .08. Safety timeout shows everything at 2.4s. Off under reduced motion. Optional `stagger` (90ms per child, 22px, 700ms) |
| `ForgeLightbox` | `role="dialog" aria-modal`, overlay `rgba(0,12,22,.94)`, counter, close, prev/next, caption, "Quote a build like this →" callback. Esc and ←/→. Scroll lock. Returns focus to the trigger |
| `MapBand` | iframe + navy callout |

## Rules
- Use the Tailwind Forge utilities from PR 01. For one-off values the design specifies (e.g. `text-[clamp(30px,3vw+12px,56px)]`), arbitrary values are fine. Keep them in the component, not at the call site.
- Headings: `font-forge-display` + weight 900/700 + `tracking-[.01em]`. **Never `uppercase`.**
- Every root element that renders on its own gets `data-forge`.

## Acceptance
- Unit tests for the variant/class maps (Button, Pill, Section tone).
- A temporary, non-indexed preview page that renders every component in every state, checked against the specimen cards at 390px and 1440px. **Delete it before merge**, or gate it behind `NODE_ENV !== "production"` and keep it out of `sitemap.ts`.
- axe: no critical issues on the preview page.
