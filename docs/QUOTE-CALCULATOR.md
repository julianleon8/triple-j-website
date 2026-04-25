# Quote calculator — runbook

Structured-input pricing engine for `/hq/quotes/new`. Replaces the manual line-item entry step. Inputs (building type / dimensions / doors / windows / concrete) → engine emits an itemized line-item breakdown + an internal margin estimate, both saved to the existing `quotes` + `quote_line_items` tables.

**This was shipped flagged for review** — the pricing constants are placeholders. The architecture is locked; only the numbers need updating once the 2025/2026 sheet lands.

---

## Architecture

| File | Role |
|---|---|
| [src/lib/quote-pricing.ts](../src/lib/quote-pricing.ts) | Pure logic. Types, pricing tables (PLACEHOLDER), `calculate()` engine. Server-safe — no React, no DOM. |
| [src/app/hq/quotes/new/_components/CalculatorStep.tsx](../src/app/hq/quotes/new/_components/CalculatorStep.tsx) | Client UI: structured form + live preview + flag display. Replaces the prior `ItemsStep` in the wizard. |
| [src/app/hq/quotes/new/_components/QuoteWizard.tsx](../src/app/hq/quotes/new/_components/QuoteWizard.tsx) | Wizard runs `calculate()` on every input change, derives `WizardLineItem[]` from the result, packs the full calculator state into `internal_notes` JSON on save. |
| [src/app/api/quotes/route.ts](../src/app/api/quotes/route.ts) | POST accepts `internal_notes` field (≤20 KB) for the calculator JSON blob. |
| [src/lib/twilio.ts](../src/lib/twilio.ts) | SMS client stub (mirrors CallRail pattern — no provisioning until env vars land). |
| [src/app/api/quotes/[id]/send-sms/route.ts](../src/app/api/quotes/[id]/send-sms/route.ts) | POST endpoint to ship a quote summary + accept-token deep link via Twilio. Returns 503 until configured. |

### Data flow

```
User fills calculator inputs
    │
    ▼
calculate(inputs)  ── pure ──>  CalculatorResult
    │                            ├── derivedLineItems
    │                            ├── customLineItems
    │                            ├── subtotal / finalPrice
    │                            ├── internalMaterialCost
    │                            ├── estimatedGrossMargin
    │                            └── flags
    ▼
Wizard maps result → WizardLineItem[]  → POST /api/quotes
    │                                        │
    ▼                                        ▼
internal_notes = JSON.stringify({       quotes row
  inputs, result                         + quote_line_items rows
})                                       (existing pipeline)
    │
    ▼
Redirect to /hq/quotes/[id]            ── existing detail page
                                          + QuoteEditor + Send + QBO push
```

---

## Pricing structure

Every dollar value is in [src/lib/quote-pricing.ts](../src/lib/quote-pricing.ts). Search for `TODO_PRICING` to find every placeholder.

| Constant | What it controls |
|---|---|
| `BASE_RATE_PER_SQFT` | Per-square-foot base by `buildingType × roofStyle × columnTier`. Customer-facing price BEFORE margin buffer. |
| `MATERIAL_COST_RATIO` | Internal material-cost ratio per category (frame / roof / wall / door / window / concrete / addon / surcharge). Triple J's actual material spend ≈ this × the customer-facing line. |
| `HEIGHT_SURCHARGE_STARTS_AT_FT` | 12 (confirmed). |
| `HEIGHT_SURCHARGE_PER_FT` | $400 (confirmed). |
| `ROLLUP_DOOR_PRICE` | Per-size price map (9×8, 10×10, 12×12, 14×14, 16×14). |
| `WALKTHROUGH_DOOR_PRICE` | Single number. |
| `WINDOW_PRICE` | Single number. |
| `WALL_PER_LINEAR_FT` | Per linear foot of wall, multiplied by height. |
| `CONCRETE_PER_SQFT_4IN` | Per-sqft at 4" thickness; thickness is linearly scaled. |
| `TIER_MAX_SPAN` | Span thresholds for column-tier auto-suggest (default: 6" ≤ 30', 8" ≤ 40', 10" beyond). |

### When the 2025/2026 sheet lands

1. Open [src/lib/quote-pricing.ts](../src/lib/quote-pricing.ts).
2. Replace the values inside the constants above. Types stay, structure stays.
3. Push to `main`. Vercel auto-deploys. Calculator emits real prices within ~30s.

That's the complete code change — no migrations, no UI edits, no API edits. The shape of `BASE_RATE_PER_SQFT` is the contract: `buildingType × roofStyle × columnTier`. If the real sheet doesn't decompose that way, restructure the matrix here and update the engine's lookup at line ~210 of `quote-pricing.ts`.

---

## What the calculator captures (in `internal_notes`)

The wizard packs this JSON blob into `quotes.internal_notes` on save:

```jsonc
{
  "kind": "calculator",
  "version": 1,
  "inputs": {
    "buildingType": "garage",
    "roofStyle": "gabled",
    "width": 30,
    "length": 40,
    "height": 14,
    "columnTier": "auto",
    "centerPost": true,
    "walls": [{ "length": 40, "height": 14 }, { "length": 30, "height": 14 }],
    "rollupDoors": [{ "size": "10x10", "count": 2 }],
    "walkthroughDoors": 1,
    "windows": 2,
    "concretePad": { "width": 30, "length": 40, "thicknessInches": 4 },
    "customAddons": [],
    "marginBuffer": 0.15
  },
  "result": {
    "internalMaterialCost": 12450.00,
    "marginBufferPct": 0.15,
    "bufferAmount": 4537.50,
    "finalPrice": 34787.50,
    "estimatedGrossMargin": 22337.50,
    "estimatedMarkupRatio": 2.79,
    "flags": [
      { "level": "info", "message": "Height 14' triggers +$400/ft surcharge." }
    ],
    "suggestedColumnTier": "8_inch"
  }
}
```

This is intentionally non-customer-facing — `notes` is the customer field, `internal_notes` is for HQ.

**Future migration** (per [docs/DATA-MODEL-AUDIT-2026-04-24.md](DATA-MODEL-AUDIT-2026-04-24.md)) will normalize this blob into proper columns on `quotes`. The `version: 1` field lets a future migration recognize and migrate the JSON shape.

---

## Edge cases the engine handles

| Trigger | Behavior |
|---|---|
| Height > 12' | Adds a surcharge line item (+$400/ft over 12'). Emits an `info` flag. |
| Manual column tier ≠ auto-suggested tier | Renders both — uses the manual choice but emits a `warning` flag noting the engine would have suggested otherwise. |
| Span > 30' AND no center post | Emits a `review` flag — won't block the quote, but surfaces "confirm structural design" before sending. |
| Width or length not a multiple of 5 between 12 and 60 | Emits a `review` flag — "custom dimensions, manual price-confirmation with manufacturer recommended". |
| Custom add-ons | Pass through verbatim with the user-supplied price. Margin buffer is NOT applied to customer-priced add-ons. |
| Center post on a span > 24' | Adds a $250 placeholder credit ("column downsize"). |

Flags are non-blocking — they surface in the live preview but never prevent saving. Julian still has the final say.

---

## Send via SMS — Twilio wiring

Skeleton mirrors the CallRail pattern from [docs/CALL-TRACKING.md](CALL-TRACKING.md). Endpoint is live; provisioning is TBD.

### When a Twilio account ships

1. Buy a number in the Twilio console.
2. Add to Vercel Production env (and `.env.local` for dev):
   ```
   TWILIO_ACCOUNT_SID=AC...........
   TWILIO_AUTH_TOKEN=...
   TWILIO_FROM_NUMBER=+12545550199
   ```
3. Done. `POST /api/quotes/[id]/send-sms` starts shipping. No code changes required.

### What the SMS says

```
Triple J Metal — Quote JJM-2026-042 for Maria Garcia: $34,788.
Review + accept: https://www.triplejmetaltx.com/quotes/<token>.
Reply STOP to opt out.
```

The accept link uses the existing `quotes.accept_token` flow at `/quotes/[token]` — same customer-facing acceptance page used by the email send route.

### What's not built

- A "Send SMS" button on `/hq/quotes/[id]`. The endpoint exists; UI to call it doesn't yet. Easy follow-up — copy the existing `QuoteDetailActions` Send button + point at `/api/quotes/[id]/send-sms`.
- STOP/HELP keyword handling. Twilio's default behavior is fine for an opt-out; if you need custom replies, add a `/api/webhooks/twilio` route.

---

## What's deliberately NOT built (yet)

- **PDF generation.** Customer-facing accept page at `/quotes/[token]` is already a clean printable layout — `Cmd+P → Save as PDF` works. A real PDF library (e.g. `@react-pdf/renderer`) is a 200-line install if true PDF attachments to email/SMS are needed.
- **A "Convert to quote" button** on a standalone calculator page. Today the calculator only lives inside `/hq/quotes/new` (the requested integration). If a fast estimator-without-customer-bind is wanted, that's a `/hq/calculator` route as a follow-up.
- **Tax-rate input on the calculator.** The wizard's existing `TotalsStep` keeps the tax field; the calculator passes its `finalPrice` as the subtotal that tax is calculated against. Tax behavior is unchanged from the existing flow.
- **Real labor cost in `estimatedGrossMargin`.** Per the data-model audit (Migration 018 — `time_entries`), labor isn't tracked yet. Gross margin shown is `finalPrice − materialCost` only. Once 018 lands, the calculator can include a labor estimate.
- **Receipt-driven cost-ratio calibration.** `MATERIAL_COST_RATIO` is a guess until receipts are categorized (Migration 020). When that data lands, the ratios should be recomputed from `job_costs` historical averages by category.

---

## Testing without real prices

Because every base rate is a placeholder, the numbers in the preview will be artificial. To exercise the engine:

1. `npm run dev` → open `/hq/quotes/new`.
2. Pick a customer in step 1.
3. In step 2 (Calculator), enter dimensions like `30×40×14`.
4. Verify:
   - The "Height surcharge" line appears and shows `(14' total, +2' over standard)`.
   - The "Estimated material cost" in the preview's collapsible internal section is non-zero.
   - Setting `width: 32` triggers the "custom dimensions" review flag.
   - Setting `width: 50` with center post off triggers the "no center post" review flag AND the column tier auto-suggests `10"`.
   - Toggling margin buffer 10% / 15% / 20% changes the buffer dollar amount + final price live.
5. Step 3 (Totals) shows the calculated `finalPrice` as the subtotal.
6. Step 4 (Review) → Save draft → redirects to `/hq/quotes/[id]` where the line items + the existing `QuoteEditor` are usable as before.

Inspect `quotes.internal_notes` in Supabase to confirm the JSON blob persisted correctly.

---

## File map

| Need to change… | Edit this |
|---|---|
| Replace placeholder pricing with the 2025/2026 sheet | `BASE_RATE_PER_SQFT` + door / window / wall / concrete constants in [src/lib/quote-pricing.ts](../src/lib/quote-pricing.ts) |
| Add a new building type (e.g. `breezeway`) | `BuildingType` union + `BASE_RATE_PER_SQFT[<new>]` table in [quote-pricing.ts](../src/lib/quote-pricing.ts), `BUILDING_TYPES` chip array in [CalculatorStep.tsx](../src/app/hq/quotes/new/_components/CalculatorStep.tsx) |
| Add a new roll-up door size | `RollupSize` union + `ROLLUP_DOOR_PRICE` map + `ROLLUP_SIZES` array in CalculatorStep |
| Change material-cost ratios per category | `MATERIAL_COST_RATIO` in quote-pricing.ts |
| Adjust column-tier auto-suggest thresholds | `TIER_MAX_SPAN` in quote-pricing.ts |
| Wire Twilio | Three env vars (above). Zero code changes. |

---

*Last updated 2026-04-25. Update when the 2025/2026 pricing sheet lands and the `TODO_PRICING` markers come out of `quote-pricing.ts`.*
