# PR 10 — Contact (message form + map)

**Target:** `redesign/forge` · **Depends on:** 03 · **Size:** M
**Verify:** D14 (endpoint), D18 ("Emergency quotes available by phone").

## Files
`src/app/(marketing)/contact/page.tsx`, new `src/components/forge/MessageForm.tsx`, and possibly `src/app/api/leads/route.ts` (only if its schema can't take a message).

## Reference
`reference/Triple J Site.dc.html` → `#/contact`, sections `Contact · Hero | Reach us | Map`. **This page has no Quote section.** The header CTA reads "Send a Message" → `#message`.

## Sections
1. **Header** (navy band, no photo).
   - Padding: `clamp(24px,3vw,40px) 0 clamp(48px,5vw,72px)`.
   - Breadcrumb: Home / Company / Contact.
   - Content (max 800, mt `clamp(32px,4vw,56px)`):
     - Eyebrow "Contact us".
     - h1 "Get in touch." / gradient "We call back same day."
     - Lede: "A question about your project, or ready for a quote? Call us directly or send a message. A real person from our Temple crew picks up — or calls you back the same day."
2. **Reach us** (white, padding `clamp(56px,6vw,96px) 0`). Split.
   - **Left.** Eyebrow "Reach us directly". Contact rows (mt 24, top border plus hairline `#e3e9ee` between rows, padding 22px 0, gap 16; linked rows hover to bg fog). Each row has a 44px icon tile (radius 8), a micro-label (11/700/.2em slate), a value and a subline (14px slate):

     | Row | Icon tile | Micro-label | Value | Subline |
     |---|---|---|---|---|
     | Phone (`tel:`) | navy tile, white phone | PHONE · ENGLISH & ESPAÑOL | Cinzel 900 `clamp(26px,1.4vw+16px,34px)` tabular "254-346-7764" | "Same-day callback" |
     | Hours | mist tile, navy clock | HOURS | 17/600 "Mon–Sat · 8am–6pm" (`SITE.hours`) | "Emergency quotes available by phone" (D18, verify or drop) |
     | Shop | mist tile, pin | SHOP | 17/600 `SITE.addressOneLine` | "Serving all of Central Texas" |
     | Email (`mailto:`) | mist tile, mail | EMAIL | 17/600 `SITE.email`, `overflow-wrap:anywhere` | — |

   - **Service-area panel** (mt 28, radius 12, silver border, fog, padding 20):
     - Label "Service area".
     - Chips (mt 12, gap 8, 34px pills, 13px): "Temple →" and "Belton →" are linked (1px navy border, 600, hover bg mist). The other cities are plain silver-bordered slate chips, from `SERVICE_CITIES` plus Salado and Lampasas as in the mock.
     - Note (mt 12, 13px slate): "Within ~90 minutes of Temple. Call to confirm your area."
   - **Right: message card.** `id="message"`, radius 12, silver border, white, `--shadow-lifted`, padding `clamp(20px,2vw,32px)`, `scroll-margin-top 16`.
     - h2 "Send a message" (Cinzel 900 `clamp(24px,1vw+16px,30px)`); sub (14px slate, mt 8): "Goes straight to Julian's phone. No black hole."
     - Fields (mt 24, gap 22):
       1. What's this about? — pills: New build · A question · Existing project · Partnership (default New build).
       2. Full name + Phone — grid `minmax(min(100%,200px),1fr)`, gap 10.
       3. Two pill groups side by side (grid 200px, gap 22): **Best way to reach you** (Call · Text · Email, default Call) and **Language** (English · Español, default English).
       4. Message (optional) — textarea min-height 110, placeholder "What are you thinking about building?".
       5. Navy lg full-width "Send to Triple J →", enabled when the name has at least 2 characters and the phone at least 10 digits.
       6. Footnote (12px slate, centered, mt −8): "Prefer a full quote? Use the 2-step quote form." The link goes to `/quote`.
     - Success panel:
       - Title: "Got it, {first}."
       - Body: "{Julian or Juan will reach you | Juan or Freddy will reach you in Spanish} {by phone | by text | by email} at **{phone}** — same day during business hours."
       - Button: "Send another message".
3. **Map** (fog, padding `clamp(48px,5vw,80px) 0`).
   - Frame: radius 12, silver border, mist bg, height `clamp(320px,36vw,460px)`.
   - Lazy Google Maps embed: `https://www.google.com/maps?q=3319+Tem-Bel+Ln,+Temple,+TX+76502&output=embed`, titled "Triple J Metal — 3319 Tem-Bel Ln, Temple, TX 76502".
   - Callout, absolute at left/bottom 16: navy, radius 10, padding 16/18, `--shadow-float-dark`, max-width `calc(100% - 32px)`:
     - "TRIPLE J SHOP · HQ" (11/700/.2em `#9fb0c0`)
     - "3319 Tem-Bel Ln, Temple" (Cinzel 700 18)
     - "Get directions →" (14/600 silver, hover white): `https://www.google.com/maps/dir/?api=1&destination=3319+Tem-Bel+Ln,+Temple,+TX+76502`, new tab, `rel="noopener"`.

## Submission (D14)
1. Read the zod schema in `src/app/api/leads/route.ts`.
2. Post `{ name, phone, source: "contact", message }`. `message` is the composed text: "Topic: … · Reach by: … · Language: … — {text}". Mark `zip` / `service_type` as not applicable, per what the schema allows.
3. Keep captcha and attribution the way `QuoteForm` does it.
4. If the schema can't accept a lead without a ZIP or service, **stop and propose a minimal schema change in the PR description.** Don't silently loosen validation.
5. Fire the same conversion event as `QuoteForm` only if the owner wants message submits counted as conversions (ask).

## Acceptance
- Matches the reference at 390 and 1440px.
- A test submission lands in HQ leads with the composed message.
- The map iframe is lazy-loaded and has a title.
