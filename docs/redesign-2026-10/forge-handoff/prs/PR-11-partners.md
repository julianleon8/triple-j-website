# PR 11 — Partners

**Target:** `redesign/forge` · **Depends on:** 03 · **Size:** M
**Verify:** D18 ("2 in-house welders · Julian + Freddy").

## Files
`src/app/(marketing)/partners/page.tsx`, `src/components/sections/PartnerInquiryForm.tsx` (restyle; keep its `fetch('/api/partner-inquiries')` pipeline).

## Reference
`reference/Triple J Site.dc.html` → `#/partners`, sections `Partners · Hero | Offer | Featured | Inquiry`. **This page has no Quote section.** The header CTA reads "Partner Inquiry" → `#inquire`.

## Sections
1. **Hero** (photo `/images/double-carport-install.jpg`, `--scrim-hero-page`, content max 820).
   - Breadcrumb: Home / Company / Partners.
   - Eyebrow: "For suppliers, manufacturers & GCs".
   - h1: "Your Central Texas" / gradient "install crew."
   - Lede (max 640): verbatim from the reference.
   - Buttons: white lg "Send a Partner Inquiry →" (scrolls to `#inquire`) and outline "Call 254-346-7764".
   - `FactStrip`:

     | Label | Value | Subline |
     |---|---|---|
     | Welders | 2 in-house | Julian + Freddy (D18) |
     | Track record | 150+ projects | Across Central Texas |
     | Mobilization | Same-week | On approval |
     | HQ | Temple, TX | Full Central TX coverage |

2. **What we offer partners** (white).
   - Eyebrow; h2 "The install crew you'd build if you could." (balance); lede (max 640) verbatim.
   - Grid (mt 44) `minmax(min(100%,420px),1fr)`, gap 16, of 4 cards. Each card: fog bg, radius 12, silver border, padding 26/26/28; number Cinzel 700 14 steel; title Cinzel 700 21 (mt 12); body 15/1.65 slate (mt 10).
   - Card titles (bodies verbatim from the reference):
     1. Photo-documented installs
     2. Welded + bolted construction
     3. No subcontractors
     4. Bilingual on every job
3. **Featured builds** (fog).
   - Eyebrow "Featured builds"; h2 "The work, documented."; link "Full gallery →".
   - Grid `auto-fill minmax(min(100%,300px),1fr)`, gap 16, of 6 compact `BuildCard`s with the lightbox. Use the 6 most recent active items, or a curated list if the gallery has a featured flag.
4. **Inquiry** (`id="inquire"`, white). Split.
   - **Left.**
     - Eyebrow "Inquire"; h2 "Tell us about" / slate "your business."
     - Lede: "A few quick fields. Julian reads every one personally and reaches back within one business day."
     - Navy box (mt 28, radius 12, padding 22/24):
       - "Rather skip the form?" (Cinzel 700 19)
       - Sub (14px, 75% white): "Call or email Julian directly — the same person who reads the responses."
       - Buttons (mt 16, gap 10): white tap button "254-346-7764" (tabular) and an outline tap button "Email Julian" (`mailto:`).
   - **Right: form card** (`--shadow-lifted`). Fields, gap 22:
     1. You are a… — pills: Supplier · Manufacturer · Dealer · General contractor · Other.
     2. Company & contact — 4 inputs in a grid `minmax(min(100%,200px),1fr)`, gap 10: Company · Your name · Phone · Email.
     3. Counties you need covered — `ToggleChip`s (38px pills, `+` / `✓`): Bell (preselected), McLennan, Coryell, Williamson, Lampasas, Falls, Milam, Burnet.
     4. Typical volume (optional) — pills: 1–2 jobs / mo · 3–5 jobs / mo · 6+ jobs / mo · Project by project.
     5. Anything else (optional) — textarea, placeholder "Product lines, typical building sizes, timelines…".
     6. Navy lg full "Send Partner Inquiry →". Enabled when the company and name each have at least 2 characters **and** there's either a phone with at least 10 digits or an email containing `@`.
   - **Success:**
     - Title: "Inquiry received."
     - Body: "Thanks, {first}. Julian will reach back within one business day about installs in {Bell, Coryell} {County | counties}." With no counties picked, it says "Central Texas".
     - Button: "Edit inquiry". It returns to the filled form.

## Submission
Map the fields onto the existing `/api/partner-inquiries` payload. Anything the schema lacks (counties, volume) goes into its notes/message field. Keep the confirmation and owner-alert emails.

## Acceptance
- Matches the reference at 390 and 1440px.
- A test inquiry arrives in HQ Partners and triggers both emails.
