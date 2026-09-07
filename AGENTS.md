<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Operating Contract

## Read order
1. **This file** — how to work here.
2. **`Locked Decisions.md`** — what is currently true about the product. Authoritative for any copy or product question.
3. **`Next Session Primer.md`** — where the last session stopped.
4. The vault file for your domain (index below).

Read `Decisions.md` only when you need the *history* of a decision — why it was made, or what it replaced. It is a 135-row append-only ledger; do not load it for orientation.

## Sources of truth — never duplicate these

Every fact has exactly one owner. Restating an owned fact anywhere else creates a second copy that silently goes stale. **This file points; it never restates.**

| Fact | Owner |
|---|---|
| NAP, nav, services, cities | `src/lib/site.ts` |
| Service-page data | `src/lib/services.ts` |
| Location-page data | `src/lib/locations.ts` |
| Design tokens | `src/app/globals.css` |
| Current product + pricing rules | `Locked Decisions.md` |
| Decision history | `Decisions.md` (append-only) |
| Connectors, env vars, deploy | `Connectors.md` |
| Prices | `dev/sales-pack-2026-04-30.md` — **never improvise a price** |

## Naming — the only business fact that lives here

- **Triple J Metal** is the public brand. **Triple J Metal LLC** is the legal name — use it only in the footer ©, schema.org `legalName`, terms, privacy, and contractual copy.
- Retired, never use in new copy: "Triple JJJ Metal Buildings", "Triple J Metal Buildings LLC".
- Triple J = **Juan** (father, investor) + **Julian** (son, tech/ops, sales) + **Jose Alfredo "Freddy"** (foreman — cuts, welds, math, runs the crew).
- Never name a specific steel supplier in the vault, in customer copy, or in AI-facing files.

## Rules

- **Vault sync.** A decision made or reversed in conversation is logged in the *same turn*: append a row to `Decisions.md` **and** overwrite the affected line in `Locked Decisions.md`. Both, or the memory is wrong. A `Stop` hook warns when the product surface changed and neither ledger was written.
- **Retired copy self-corrects.** A `PostToolUse` hook rewrites retired phrases ("48-hour build", old brand aliases) the moment they are written, and tells you it did. Claims needing judgement — the 4,000 PSI spec — are reported, never rewritten. Sweep existing files with `node scripts/check-vault.mjs --fix`.
- **Wait for the plan.** Do not touch `src/` until the user has laid out the larger picture. They prefer to spend tokens on execution, not on planning you did unasked.
- **Scraping and deep research need no per-run approval.** Run a scrape skill or a multi-step research pass whenever the task calls for it, including unattended on a schedule. Token cost is still high — report what a large run consumed, and kill a run that has stopped paying for itself. (Reversed 2026-09-06; the 2026-04-30 gate-and-ask rule no longer applies.)
- **Secrets.** Never write a real credential into any tracked file. `.env.example` documents key names with placeholder values only. `.githooks/pre-commit` and a `PreToolUse` hook both block this; do not reach for `--no-verify`.
- **Git.** Push directly to `main` (authorized). Vercel auto-deploys every push, so **`main` is production** — a bad push is live in about a minute. Repo: `julianleon8/triple-j-website`.
- **Before committing:** `npm run typecheck && npm run lint && npm run test`.
- **Memory location.** The git-tracked vault below is the only memory store. Do not write project facts to `~/.claude/.../memory/` — it is machine-local, invisible in Obsidian, and unreadable by the other agent tools used on this repo.

## Where each kind of fact gets written

| You learned… | Write to | When |
|---|---|---|
| A decision made or reversed | `Decisions.md` (append) **+** `Locked Decisions.md` (overwrite) | same turn |
| Work shipped | `Session Notes.md` (new entry at top) | end of session |
| Handoff for the next session | `Next Session Primer.md` (replace top block) | end of session |
| A business or ops fact | `Business Profile.md` / `Operational Notes.md` | same turn |
| A copy rule | `Website Copy & Messaging.md` | same turn |
| A new service or env var | `Connectors.md` | same turn as the code |
| A price change | `dev/sales-pack-2026-04-30.md` + `Locked Decisions.md` | same turn |
| NAP, a service, or a city | `src/lib/site.ts` — **only** | — |

## Vault index

| File | Read before… |
|---|---|
| `Locked Decisions.md` | **anything product-facing** — what is currently true |
| `Next Session Primer.md` | picking up work — where the last session stopped |
| `Connectors.md` | anything touching an external service, env var, or deploy |
| `Project Context.md` | strategic work; current site status |
| `Business Profile.md` | services, equipment, suppliers, contact info, capabilities |
| `Market Strategy.md` | SEO keywords, target markets, competitor framing, military targeting |
| `Website Copy & Messaging.md` | landing copy, headlines, taglines, ad angles |
| `Operational Notes.md` | timeline promises, permits, hiring/CDL claims |
| `Decisions.md` | needing the *history* of a decision |
| `Session Notes.md` | reading what shipped, session by session |
| `testimonials.md` | swapping placeholder testimonials for real reviews |
| `Link Building Tracker.md` | citation and backlink outreach |
| `Stock Images Needed.md` | sourcing photography |
| `dev/sales-pack-2026-04-30.md` | **any price or ad copy** — canonical price sheet |
| `docs/`, `seo/`, `research/` | deep dives; not read by default |
| `archive/` | never — historical only, not authoritative |

## Setup (once per machine)

```
git config core.hooksPath .githooks
```
