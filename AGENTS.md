<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Memory

This repo doubles as an Obsidian vault. The `.md` files at the root are the working source of truth. Read the relevant one before changes that touch its domain.

### Business
- **Triple J Metal Buildings LLC** (Triple JJJ Metal Buildings)
- **Owners:** Juan Luis Leon (father) + Julian Leon Alvarez (son, 19, daily ops)
- **Address:** 3319 Tem-Bel Ln, Temple, TX 76502 · **Phone:** 254-346-7764
- Founded 2025 · 150+ projects · 50+ clients
- Central Texas (Temple base; serves Belton, Killeen, Harker Heights, Copperas Cove, Waco, Salado, Georgetown, Round Rock, Lampasas, Holland, Taylor, Troy, Nolanville)
- Suppliers: MetalMax (Waco, primary) + MetalMart
- Services: welded **or** bolted carports, garages, barns, RV/boat covers, equipment covers, metal porches, lean-to patios, house additions, ranch structures, barndominiums

### Stack
- Next.js 16.2.3 (App Router) + React 19.2.4 + TypeScript + Tailwind v4
- Supabase (Auth + Postgres + RLS) via `@supabase/ssr`
- Resend (lead/customer email)
- Stripe (future, phase 4)
- Vercel (connected, **not yet deployed** — Julian must `git push origin main` from his Mac and set 7 env vars)
- MCP server: Supabase only (`.mcp.json`)
- Repo: `julianleon8/triple-j-website` (sandbox cannot push — proxy blocks outbound git)

### Key source files (single sources of truth)
- `src/lib/site.ts` — NAP, nav, services, cities. **Edit here first** for site-wide constants.
- `src/lib/services.ts` — service-page data (6 niche pages)
- `src/lib/locations.ts` — location-page data (14 cities, military fields on Killeen + Harker Heights)
- `src/app/globals.css` — design tokens (brand `#1e6bd6` steel blue, ink neutrals, fluid type, no dark mode)
- `src/components/site/{Header,Footer,MobileCallBar}.tsx` — public chrome (only inside `(marketing)` route group)
- `src/components/sections/QuoteForm.tsx` — multi-step lead form → POST `/api/leads`
- `src/app/api/leads/route.ts` — Zod validation, ZIP→city lookup, Supabase insert, Resend emails
- `src/app/dashboard/` — owner dashboard (Supabase Auth protected); built by Sonnet — customers, jobs, gallery, quotes, leads
- `src/app/(marketing)/` — public site route group (isolated from dashboard/login/api)

### Locked product decisions (from `Decisions.md`)
- **"Same-week"**, never "48-hour build" — 48 hrs = materials arrival, not build time. Misleading.
- **"Welded or bolted"** everywhere — Triple J does both. Never say only "custom welded".
- Services include **Lean-to Patios + House Additions** (real offerings; were missing).
- **Testimonials = auto-scroll marquee** (CSS `@keyframes`, pause-on-hover) — `'use client'`.
- **Multi-step lead form**: ZIP → service+type+dimensions → concrete+timeline+military.
- **Tagline (locked):** "Built right, built fast, built by Triple J."
- **Fonts:** Barlow Condensed (headlines) + Inter (body). Geist removed.
- **TrustBar stats:** Zero Subcontractors / Welded or Bolted / Same-Week / Temple TX.
- **4,000 PSI concrete** (not standard 3,000 PSI) — technical authority callout on service/location pages.
- **Design:** WolfSteel-inspired, no dark mode.
- **ClickUp CRM:** on hold — revisit after live leads validate volume.
- **Dashboard auth flow:** not built yet — on hold until Vercel is live.

### External memory systems
- **Obsidian vault** = repo root (this file + the 8 vault `.md` files below). Working memory. Update in same turn when decisions are made.
- **NotebookLM notebook**: `https://notebooklm.google.com/notebook/f4aaf762-3ede-45b9-a1ad-b9d8a6319207` (notebook id `f4aaf762-3ede-45b9-a1ad-b9d8a6319207`). Use the `notebooklm` skill (installed at `~/.claude/skills/notebooklm/`) for source-grounded answers.

### Vault index (read before editing the noted domain)
| File | Read before… |
|------|--------------|
| `Project Context.md` | Anything strategic; gives current site status + stack + key files |
| `Business Profile.md` | Changing services, equipment, suppliers, contact info, capabilities |
| `Market Strategy.md` | SEO keyword choices, target market changes, pricing copy, competitor framing, military targeting |
| `Operational Notes.md` | Promising timelines (BBB complaints noted), permit-handling claims, hiring/CDL claims, revenue-gap features (e.g. dump trailer load board) |
| `Website Copy & Messaging.md` | Editing landing-page copy, headlines, taglines, ad angles, niche page priorities |
| `Decisions.md` | Reverting anything; checking whether a phrase/feature is locked |
| `Session Notes.md` | Picking up where a previous session left off |
| `testimonials.md` | Swapping placeholder Testimonials cards for real Google reviews |

**Note:** `Project Context.md`'s "Key differentiators" section still lists "48-hour build time" — that's stale. The locked decision (2026-04-15) is "same-week". Treat `Decisions.md` as authoritative when the two conflict.

## Operating Rules

- **Firecrawl / scrape skills** — never run a `firecrawl-search` (or any scrape skill) without explicit per-run user approval. Token cost is high. Always ask first, even if `.claude/settings.local.json` permits the call.
- **NotebookLM** — the `notebooklm` skill is installed at `~/.claude/skills/notebooklm/` but **not authenticated in this sandbox** (no display for Google login). Workflow: when a task would benefit from a NotebookLM query (deep research, source-grounded citations, anything where hallucination risk is real), **tell the user first** and let them run the query on their authenticated Mac and paste the answer back. Do not attempt to authenticate or query NotebookLM from this sandbox.
- **Deep research / citations** — same rule: ask before spending tokens on multi-step research. The user prefers to spend tokens on execution, not planning.
- **Code changes** — wait for the user's larger plan before touching `src/`. The user prefers to lay out the bigger picture first.
- **Vault discipline** — when a decision is made or reversed in conversation, log it to `Decisions.md` in the same turn. Memory must stay in sync with reality.
- **Git push** — sandbox proxy blocks outbound git push. Julian runs `git push origin main` from his Mac.
