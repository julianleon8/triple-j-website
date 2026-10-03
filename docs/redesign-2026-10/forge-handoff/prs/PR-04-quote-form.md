# PR 04 — Shared Quote section + 2-step Quote form

**Target:** `redesign/forge` · **Depends on:** 02 · **Size:** M
**Owner-requested:** D6 (centered). **Defaults:** D7. **Verify:** D8.

## Files
`src/components/sections/QuoteForm.tsx` (restyle; keep its logic), the new `src/components/forge/QuoteSection.tsx`, and `QuoteForm.test.ts` (update).

## Non-negotiable
**Keep the existing submit pipeline exactly as it is:**
- API payload shape to `/api/leads`
- captcha
- marketing attribution
- Google Ads conversion
- any `/thank-you` redirect
- `initialService`, `initialMilitary` and `projectReference` props

Fencing is still sent as `service_type: "other"` with scope in the notes (`fencingNotes`). This PR changes the presentation, plus three option lists and one new question.

## Reference
`reference/Triple J Site.dc.html` → `<section id="quote" data-screen-label="Quote">`. This is the **canonical centered version**. The homepage file still shows the old two-column layout; ignore that.

## QuoteSection layout
- **Section.** `id="quote"`, `data-forge`, bg fog `#f4f6f8`, border-top 1px `#e3e9ee`, padding `clamp(64px,7vw,104px) 0`. Inside the container: a flex column, centered, gap `clamp(32px,3vw,48px)`.
- **Intro.** Max-width 720px, centered text.
  - Eyebrow, centered, with mirrored rules: "Get a quote".
  - h2 (Cinzel 900 `clamp(30px,3vw+12px,56px)`/1.05): "Tell us about" / line 2 in slate: "your build."
  - Lede (16–18px slate, max 520, `text-wrap:pretty`). Context-aware:
    - Default: "Two quick steps. A real Texas crew on the other end — not a form into a black hole."
    - Service page: "Two quick steps — {service name, lowercase} is already picked. A real Texas crew on the other end, not a form into a black hole."
    - Location page: "Two quick steps — your {City} ZIP is already filled in. A real Texas crew on the other end, not a form into a black hole."
    - `/military`: "The military discount box is pre-checked on step two — verify the rest and we'll be in touch the same day with timeline and pricing."
  - Assurances (mt 24): a centered, wrapping row (gap 10px 24px, 15px navy), each with a 28×2 steel bar: "Free quote, no obligation" · "Reply within 24 hours" · "Military, first-responder & trade discounts honored".
- **Card.** `id="quote-card"`, width 100%, **max-width 760px**, radius 12, 1px silver border, white, `--shadow-lifted`, padding `clamp(20px,2vw,32px)`, `scroll-margin-top:16px`.
- **Placement.** Rendered on every Forge page **except `/contact` and `/partners`**. Anchor jumps scroll with an 84px offset.

## Form (inside the card)
**Header.** `StepProgress`: "Step 1 of 2" + "Your build" / "Step 2 of 2" + "Who to call back"; bar at 50% / 100%. mb 24.

**Step 1** (field gap 24):
1. **The build.**
   - 2-column grid, gap 12, of service chips. Each tile: radius 10, 2px border (silver; navy when selected), bg white (fog when selected), a 5:4 photo with `--scrim-chip-photo`, and a 28px navy ✓ badge top-right when selected. Label is Cinzel 700 15px; sublabel 11px uppercase `.04em` steel.
   - Order and copy (map to the form's existing `ServiceType` values):
     - Carport / RV Cover — Welded or bolted
     - Fencing & Gates — Privacy, ranch, ornamental
     - Metal Garage — Fully enclosed
     - Metal Barn — Ranch & ag
     - Lean-To / Patio — Attached or freestanding
     - Other / Custom — Tell us what you need
   - Photos: carport-gable-residential, metal-fence-ranch-wire, metal-garage-green, carport-concrete-rural, porch-cover-lean-to, red-iron-frame-hero.
2. **Construction** (hidden for fencing, as today).
   - Pills: Welded · Bolted · Not sure.
   - Helper (12px steel): "Welded is permanent; bolted can be moved later."
   - If fencing is picked, render the existing `FenceFields` here, restyled.
3. **Approximate size (optional).** Three number inputs (Width/Length/Height) in a 3-column grid, gap 10. Helper: "W × L × H in feet. Rough is fine — we measure on-site."
4. **ZIP code.**
   - Input with right padding 130px. When the ZIP resolves, show "{City} ✓" absolutely at right 14px, 13px/600 navy.
   - Resolve the city with the repo's existing lookup (`src/lib/data/zip-geo.json` or the form's current helper), not the mock's table.
5. **Continue →.**
   - Full-width navy lg button with `--shadow-cta`.
   - Lives in a sticky footer: `bottom: 0` desktop / `72px` mobile (above the call bar). Negative side margins equal to the card padding; padding `14px pad pad`; background `linear-gradient(to bottom, rgba(255,255,255,0), #fff 16px)`; bottom radius 12.
   - Disabled at opacity .5 until a service is picked **and** the ZIP has 5 digits.
   - On advance, scroll to `#quote-card`.

**Step 2** (gap 24):
1. **Who to call back.** Stacked inputs, gap 10: "Full name" · "Phone — we text first" · "Email (optional)".
2. **Concrete pad** (hidden for fencing).
   - Pills: Include it · Have a slab · Not sure.
   - When "Have a slab" is chosen, keep the existing `current_surface` follow-up, restyled as pills.
3. **Do you need permits?** *(new)*
   - Pills: Yes · No · Not sure.
   - Helper: "We talk through city, county and HOA requirements before anything gets scheduled."
   - Storage: append `Permits: Yes|No|Not sure` to the lead notes/message (D7). No DB migration.
4. **Timeline.**
   - Pills: ASAP · This month · Just planning (values `asap`, `this_month`, `planning`; drop `this_week` from the UI).
   - Keep the existing best-time-to-call control after it, restyled.
5. **Budget range (optional).**
   - Pills (tabular): Under $5k · $5k–$10k · $10k–$20k · $20k+ · Not sure yet.
   - Map them to `estimated_budget_min/max` as 0–5000, 5000–10000, 10000–20000, 20000–null, and none.
   - Helper: "Honest pricing, no surprises. We scope the build to what you want to spend — not the other way around."
6. **Discount (optional).**
   - `CheckboxRow` bound to `is_military`: "Military, veteran or first responder".
   - Subline: "7% off your install. ID checked at the estimate." If D8 isn't confirmed, use "Discount applied to your quote. ID checked at the estimate."
   - Checked state: border navy, bg fog.
7. **Anything else (optional).** Textarea, placeholder "HOA requirements, site access, existing anchors…".
8. **Actions** (mt 24, gap 12).
   - "← Back": outline-light, 50px tall, slate text.
   - "Send to Triple J →": navy lg, flex 1. Enabled when the name has at least 2 characters and the phone at least 10 digits.
9. **Legal** (centered):
   - "Free · no obligation · reply within 24 hours." (12px slate, mt 18)
   - "By submitting you consent to be contacted by phone or text." (11px steel, mt 6)

**Success** (only if the form stays on the page; otherwise style `/thank-you` the same way):
- `SuccessPanel` with the title "Sent to Triple J." and the body "Thanks, {first name or "neighbor"}. Julian or Juan will text **{phone}** within 24 hours — usually the same day."
- Summary rows: Build · ZIP (· City) · Budget ("Not given") · Military discount ("Yes — 7% off" / "No").
- Button: "Start another quote".

## Prefill hooks (used by the page PRs)
- `initialService`: carports → carport; metal-fencing / gates → fencing.
- `initialZip`: location page ZIP (Temple 76502, Belton 76513), applied only if the visitor hasn't typed another ZIP.
- `initialMilitary`: `/military`.
- Option cards and the lightbox call a setter that picks a service (plus `structure_type` / `needs_concrete`) and scrolls to `#quote`.

## Acceptance
- Payload snapshot test: identical keys and values to today for equivalent input, plus permits in the notes.
- The Ads conversion still fires on submit (check with the existing test or a manual GTM preview).
- Matches the reference at 390 and 1440px, including the sticky Continue above the mobile call bar.
- Keyboard-only completion works; every pill group is reachable and announced.
