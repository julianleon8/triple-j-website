# PR 00 — Vault sync + heavy-duty upgrade correction

**Target:** `main` (a factual fix that ships independently of the redesign) · **Depends on:** — · **Size:** S

## Goal
Correct the steel-upgrade claim on the live site, and record in the vault the decisions this redesign package relies on.

## Before you start
Confirm the exact spec with the owner/Freddy: **the heavy-duty upgrade is 11-gauge columns, welded to the receivers and purlins. The rest of the frame stays 14-gauge.** It is *not* a full 11-gauge frame and *not* 12-gauge.

## Changes
1. **`src/lib/services.ts`.** Replace every 12-gauge claim. Known lines on `claude/focused-gates-iu172r` (grep again on `main`):
   - ~L104: "…Standard framing is 14-gauge; a 12-gauge upgrade is available where appropriate." → "…Standard framing is 14-gauge; a heavy-duty upgrade with 11-gauge columns is available where appropriate."
   - ~L262–264 and ~L450–452: the title `'12-Gauge Storm Upgrade'` → `'Heavy-Duty Upgrade'`. Rewrite the bodies around this fact: "11-gauge columns, welded to the receivers and purlins". No other new claims.
   - ~L311: "14-gauge or 12-gauge red iron steel, welded on-site…" → "14-gauge red iron steel with an optional 11-gauge heavy-duty column upgrade, welded on-site…"
2. **Grep the whole repo** for `12-gauge|12 gauge|storm upgrade` (case-insensitive). That includes `Locked Decisions.md`, `Website Copy & Messaging.md`, `Business Profile.md`, `dev/sales-pack-2026-04-30.md`, `src/emails/**`, `src/lib/quote-pdf.tsx`, `src/lib/quote-pricing.ts` and HQ calculator files. Fix the copy. **If a price or line item depends on 12-gauge, stop and ask the owner. Don't change pricing.**
3. **`scripts/check-vault.mjs`.** Add "12-gauge storm upgrade" to the retired-phrase list so the hook self-corrects in future.
4. **Vault rows** (`Decisions.md` append, plus the matching `Locked Decisions.md` overwrite), dated 2026-10-02:
   - D1 heavy-duty upgrade spec.
   - D16: the Forge design package (`docs/redesign-2026-10/forge-handoff/`) is the reference for the rest of the site. It supersedes "owner designs the rest in Figma".
   - D5 Related-link blue exception (only if the owner confirms).
   - D6 centered quote section.
   - Any other § Deltas row the owner has resolved by the time this PR is cut.
5. **Commit this handoff** to `docs/redesign-2026-10/forge-handoff/`. Include everything **except** `reference/assets/`: those files duplicate `public/images/`, and the two `.dc.html` files only need them to render offline.

## Acceptance
- `grep -ri "12-gauge\|storm upgrade" src/ *.md dev/` returns nothing customer-facing.
- `node scripts/check-vault.mjs` passes. `npm run typecheck && npm run lint && npm run test` pass.
- Both ledgers are updated in the same commit.

## Out of scope
Any visual change.
