# PR 01 — Forge foundations (no visual change)

**Target:** `redesign/forge` · **Depends on:** — · **Size:** S

## Goal
Load Cinzel, register the Forge tokens and utilities, and make the legacy unlayered CSS step aside for anything marked `data-forge`. **No page should look different after this PR.**

## Read first
`forge-design-system/integration/tailwind-v4-globals-snippet.css` (sections 1–5) and `src/app/globals.css`.

## Changes
1. **`src/app/layout.tsx`**
   - `import { Barlow_Condensed, Cinzel, Inter } from "next/font/google"`.
   - `const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["700", "900"], display: "swap" })`. Use **swap**, not `optional` (Next Session Primer).
   - Add `"700"` to Inter's weights (Forge micro-labels are Inter 700).
   - Add `${cinzel.variable}` to `<html className>`. Keep Barlow; PR 13 removes it.
2. **`src/app/globals.css`**
   - Paste snippet §1 (raw tokens) after the existing `:root` block.
   - Paste §2 into the existing `@theme inline { … }`.
   - Paste §3 (helpers) and §5 (scoped focus/selection) after the base reset.
   - **Edit the existing rules in place** as in §4. Do not duplicate them:
     - Scope `.marketing h1/h2/h3` (font-family, letter-spacing, line-height, weight and the three clamp sizes) with `:not(:where([data-forge], [data-forge] *))`.
     - Scope `p { line-height: 1.6 }` with `:not(:where([data-forge] *))`.
3. Utilities now exist and should compile:
   - Colors: `bg-forge-navy`, `text-forge-slate`, `border-forge-silver`, `bg-forge-fog`, `text-forge-steel`…
   - Type: `font-forge-display`.
   - Shape and motion: `rounded-forge-card`, `ease-forge`.

## Why §4 matters
Hand-written rules in `globals.css` are emitted **unlayered**. Unlayered rules beat every Tailwind utility no matter the specificity. Without §4, every Forge `<h1>`/`<h2>`/`<h3>` renders in Barlow 800 at the legacy clamp sizes, and every Forge `<p>` is stuck at line-height 1.6.

## Acceptance
- Visual diff (screenshots at 390px and 1440px) of `/`, `/services/carports`, `/military`, `/contact` and an `/hq` screen: identical before and after.
- A throwaway `<h2 data-forge className="font-forge-display text-[56px]">` renders in Cinzel at 56px. Remove it before merging.
- typecheck, lint, test and check-vault all pass.

## Out of scope
Changing `--font-display`, the `brand-*` tokens, `themeColor`, or anything in HQ. All of that is PR 13.
