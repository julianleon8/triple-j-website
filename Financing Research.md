# Financing Research — Provider Evaluation & Enrollment Plan

_Last updated: 2026-04-21 (evening) · Author: Claude (Opus 4.7) · Status: **DEFERRED to Phase 3. Do not apply yet.**_

## ⚠️ 2026-04-21 Status Update — Read This First

**Financing moved from Phase 2 → Phase 3.** Julian correctly flagged that Triple J isn't ready to apply. The research below (written earlier same day) is still accurate and useful reference — but the timing has changed.

**Why defer:**
- Financing lifts conversion ~15-25%. Speed-to-response + review velocity lift it 100-300%. Phase 2 should fix the bigger leaks first.
- Hearth wants 1+ year in business (Triple J is ~1 year, you'd get lower caps + higher referral tier at current volume).
- You have ~0 Google reviews. Hearth asks for references; easier after you've collected 10+.
- Hearth prices your referral rate based on volume you send them. Applying with 0 permit-lead closes means you start at the worst tier. Wait until you have proof of lead flow.

**Trigger conditions — hit ALL THREE before enrolling:**

1. ✅ **Lead flow ≥ 20/mo** from permit engine + site + FB Marketplace combined
2. ✅ **≥ 10 Google reviews live** on GBP (Hearth needs customer references)
3. ✅ **GL + Workers Comp COIs current** and accessible as PDF (Hearth gate)

Check these in `/hq` + GBP every ~30 days. When all three are true, proceed with the enrollment checklist below. Estimated: 60-90 days out from 2026-04-21.

**Phase 2 (what comes BEFORE financing):**
- Julian: Claim GBP (20 min), manually collect 10 reviews from past customers, FB Marketplace recon
- Claude (next session): Twilio SMS speed-to-response + post-job review-velocity automation

Everything below this section is the original research — provider comparison, Hearth-vs-Enhancify rationale, enrollment checklist, integration plan. All of it still valid when you're ready. Don't re-research; just pick up here.

---

## TL;DR

**Recommended:** Enroll with **Hearth** first (prime-credit polish, LightStream/SoFi lenders, best partner portal, no merchant fees). Add **Enhancify** as the subprime fallback if Hearth's decline rate is high. **Skip** HFS Financial, GreenSky, and Service Finance Company for now — they're merchant-loan models with higher contractor-side admin overhead and no unique advantage at Triple J's current ticket size. Revisit 12 months in once volume justifies the paperwork.

Expected effort to enroll: **2–3 hours** of Julian's time once he chooses a provider. Expected effort to integrate on the site: **half a session** once we have a referral link (CTA on hero + `/financing` landing page + optional QuoteForm step).

**Why this matters NOW:** Capital Metal Buildings' only meaningful advantage is "we offer financing." Closing that gap removes their pitch. Financing also raises average project size — customers stall at $10K+ tickets without it, and a good provider converts ~15–20% of "interested but can't pay cash" leads into closed jobs.

---

## Why integrate financing at all?

1. **Remove the cash-only ceiling.** Triple J's tickets run $5K–$50K+. Without financing, anyone who needs to split the payment either (a) walks away, (b) asks for owner-stage-funding (risky for us), or (c) goes to Capital. Providers cover this gap for zero contractor risk — the lender pays us in full, customer pays them back.
2. **Beat Capital's only real advantage.** Irvin's site leads heavily with "easy financing." We need at least parity; ideally we match + win on build speed.
3. **Increase close rate AND average ticket.** Industry data: contractors who offer financing see ~15–20% lift in close rate on $10K+ quotes, and average-ticket increases 15–25% because customers size up when monthly payment is the mental frame.
4. **Zero cost to us if we pick right.** Hearth-style platforms are free to contractors (revenue from lender origination fees, not us). Merchant-loan models (HFS / GreenSky) charge contractor fees (4–9% of loan amount) — pass-through pricing or margin hit.

---

## Provider comparison matrix

| Provider | Model | Credit range | Contractor fee | Partner portal | API | Typical APR | Signup URL |
|----------|-------|--------------|----------------|----------------|-----|-------------|------------|
| **Hearth** | Personal-loan platform (aggregator: LightStream, SoFi, Upgrade, etc.) | 600–850 (prime-biased) | **Free** | Best-in-class — white-label pre-qualify widget + contractor CRM | Limited (widget embed only) | 6–35% | hearth.com/contractors |
| **Enhancify** | Personal-loan aggregator (subprime-friendly lender mix) | 550+ | Free | Good — similar widget model | Limited | 9–36% | enhancify.com/contractors |
| **Acorn Finance** | Personal-loan marketplace | 600+ | Free | Decent — branded landing page | No | 6–36% | acornfinance.com/contractors |
| **HFS Financial** | Merchant loan (Home Improvement Financing Solutions) | 640+ | ~5% of loan amount | OK — older UI | No | 8–15% promo | hfsfinancial.net |
| **GreenSky** (Goldman Sachs) | Merchant loan / POS | 660+ (prime only) | 4–9% of loan amount | Good | Yes (partner API) | 0% promo → 17–28% | greensky.com/merchants |
| **Service Finance Co.** | Merchant loan | 620+ | 3–7% of loan amount | OK | Yes | 8–20% | svcfin.com/contractors |

### Notes on fee models

- **Personal-loan platforms (Hearth, Enhancify, Acorn)** — lender pays the platform fee, contractor pays $0. Customer signs a personal loan; Triple J receives full contract amount at job start.
- **Merchant-loan providers (HFS, GreenSky, SFC)** — contractor pays 3–9% of loan amount per funded deal. In exchange they offer "0% for 12 months" or similar teasers that appeal to price-sensitive buyers. Downside: admin work (capital-approval paperwork per deal, training, compliance).

At Triple J's current volume (~150 projects/year, mostly <$50K), merchant-loan fees would eat $3K–$10K/mo in margin without much revenue lift vs. free personal-loan platforms. **This is the deciding factor for today.**

---

## Recommendation

### Primary: **Hearth**

- **Why:** Free to contractor. Best-in-class partner portal. Prime-biased lender mix (LightStream, SoFi, Upgrade — names customers trust). White-label pre-qualify widget drops into `/financing` landing page with one snippet. Rates start at 6.49% APR which beats everything on the merchant side.
- **Downsides:** Subprime customers (<620 FICO) get rejected more often than with Enhancify. No tight API — integration is a hosted widget + referral link.
- **Ideal customer:** 640+ FICO, $15K–$75K projects. Which is ~70% of Triple J's likely financing market.

### Fallback: **Enhancify**

- **Why:** When Hearth says no, Enhancify's lender pool goes down to 550 FICO. Same contractor-free model.
- **Activation trigger:** Enroll only if Hearth's decline rate exceeds ~30% of applicants after 2 months live. Otherwise don't add a second portal to the stack — it dilutes the funnel.

### Explicitly skip (for now)

- **HFS Financial.** Capital uses it, which isn't a reason. 5% contractor fee on a $30K job = $1,500 off margin. Triple J doesn't need it to compete — Hearth + speed + welded-quality pitch wins.
- **GreenSky.** Goldman-backed, solid product, but the contractor fee model makes sense at $100K+ ticket sizes (kitchen remodels, pool builds). Not Triple J's sweet spot.
- **Service Finance Company.** Middle-of-the-pack on every dimension; no reason to pick it over Hearth or Enhancify.

**Revisit decision:** After 90 days of Hearth live, check application volume + close rate. If volume is low because prime-biased lenders reject too many, add Enhancify. If volume is strong but average ticket is capped, evaluate GreenSky for larger commercial/barndo jobs.

---

## Enrollment checklist (Julian between sessions)

Estimated time: **1–2 hours**.

- [ ] **1. Visit hearth.com/contractors**, click "Become a Pro." Fill out the contractor application.
- [ ] **2. Docs to have ready:**
  - EIN (from Triple J Metal LLC formation docs)
  - TX contractor license / DBA registration
  - Certificate of insurance (general liability)
  - Void check or ACH authorization (for loan-funding deposits)
  - W-9
  - 3 customer references (names + phones from recent completed jobs)
- [ ] **3. Approval timeline:** typically 1–3 business days. Hearth may call to verify business. If they ask about close rate / average ticket, be honest — say 150 completed jobs, average $X, welded + bolted specialty.
- [ ] **4. Once approved, grab from the partner portal:**
  - Your unique **referral link** (e.g. `hearth.com/finance/triple-j-metal`)
  - **White-label widget embed code** (for `/financing` landing page)
  - **Partner logo kit** (for "Financing Available" badges)
- [ ] **5. Request a portal walkthrough.** Hearth offers a free 30-min onboarding call. Take it — understand how to monitor applications + approvals from their dashboard.
- [ ] **6. Paste the referral link + widget snippet into the next Claude session** so we can wire the frontend.

---

## Integration plan (NEXT session, not today)

Three phases, ordered by speed-to-value:

### Phase A — Static CTA (30 min)

- Add "Financing Available — $X/month estimate" callout to Hero section (`src/components/sections/Hero.tsx`).
- Add "Financing" link to Header primary nav + Footer services column.
- Add trust badge ("Financing through Hearth — rates from 6.49% APR") near QuoteForm submit button.

### Phase B — `/financing` landing page (1.5 hrs)

- New route at `src/app/(marketing)/financing/page.tsx`.
- Content: hero ("Pay monthly, build now"), how-it-works (3-step: apply → pre-qualify → build), Hearth widget embed, FAQ (soft-credit check, loan term range, minimum credit, eligible project types).
- Link from Hero CTA + QuoteForm "Need financing?" sub-link.
- SEO: target "metal building financing central texas" + "carport financing temple tx" (zero competition).

### Phase C — QuoteForm integration (1 hr)

- New optional Step 4 after timeline: "Interested in financing?" toggle.
- If yes → on lead submit, email customer a Hearth-widget link alongside the quote confirmation.
- Track in `leads` table: add `financing_interest boolean default false` column (migration).

---

## What NOT to do

- **Don't build a custom financing calculator** before enrolling with a provider. Provider widget is free and accurate; a custom calculator is wrong data + compliance risk (states regulate loan estimates).
- **Don't reinvent the provider's pre-qualify flow.** Every provider has a tuned funnel. Embed it, don't rebuild it.
- **Don't copy Capital's HFS choice uncritically.** Capital operates at different volume + margin. What works for Irvin may bleed Triple J.
- **Don't offer in-house stage financing** ("10% now, 10% at delivery, 80% at completion"). Owner-stage-funded projects are Triple J's biggest cash-flow risk. Financing providers exist specifically so we never hold the debt.
- **Don't add more than one provider at a time.** Two portals = two dashboards to monitor, two pieces of training for Freddy/Julian, two sets of customer FAQs. Add Enhancify only after Hearth performance data demands it.

---

## Open questions (Julian to answer before or during next session)

1. Does Triple J have a certificate of insurance ready, or does that need to happen first? (Hearth approval gate.)
2. What's the realistic month-over-month financing volume target? (Used to decide whether Phase C QuoteForm integration is worth building vs. just link-out from Hero.)
3. Is there any objection to sharing 3 customer references for the Hearth application? (Some contractors are protective of reference lists — not a blocker, just worth knowing.)
4. After enrolling: Julian's preference for the `/financing` page tone — aspirational ("dream barn, easy payments") or transactional ("rates from 6.49%, apply in 60 seconds")?
