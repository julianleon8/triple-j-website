# Prompt — Push pending Triple J Website work to GitHub

Paste the block below into Antigravity (Claude as the model). It's self-contained — Antigravity won't have any of our prior conversation, so the prompt carries the full context it needs.

---

## The prompt (copy from the line below)

You're working in the `triple-j-website` repo on my Mac. Your job is to commit and push every pending change to `origin/main`. GitHub auto-deploys to Vercel on push, so this is the live release. Treat it that way.

### Repo facts

- **Local path:** `/Users/julianleon/Desktop/Triple J Website`
- **Remote:** `julianleon8/triple-j-website` on GitHub
- **Branch:** `main` (push directly — authorized in `AGENTS.md`)
- **Vercel:** auto-deploys on every push to `main`. There is no staging branch.
- **Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, Supabase
- **Conventions:** read `AGENTS.md` and `Decisions.md` at the repo root before writing commit messages. They describe locked product decisions and the project's vault-discipline rule (decisions logged to `Decisions.md` in the same turn they're made — verify `Decisions.md` already reflects what's in the diff).

### What's pending

I haven't bookkept this — start with `git status` and `git diff --stat origin/main..HEAD` plus a working-tree diff to map the scope yourself. Expect: marketing-site location-page expansion (round-rock, georgetown, waco built up to the Temple-grade template), `src/lib/site.ts` and footer updates, HQ Phase 3 work (jobs, quotes, customers, QuickBooks integration, voice/audio recorder, receipt extractor, photo strip components, new Supabase migrations 012 + 013), email-template polish, and several Obsidian vault `.md` updates at the repo root.

Untracked files include new vault docs (`Stock Images Needed.md`, `HQ Phase 3 — *.md`, `docs/NAP-CONSISTENCY-AUDIT.md`), a `ship-phases-3-and-4.sh` script, and a tree of new HQ components and lib files. Add the ones that are real project artifacts. **Do not** commit `.env`, `.env.local`, anything under `.next/`, `.firecrawl/`, `.seo-audit-tmp/`, `.vercel/`, or any per-tool agent dotfolders (`.adal`, `.augment`, `.bob`, etc.) — confirm `.gitignore` covers them; if it doesn't, fix `.gitignore` first as part of this push.

### Pre-flight checks (must pass before any commit)

Run, in order:

1. `npx tsc --noEmit` — must exit 0.
2. `npx eslint --quiet src` — must exit 0. If it errors on files outside the diff scope, scope the lint to changed files only and note it in the commit message.
3. `npx next build` — must succeed end-to-end. Vercel will run this anyway; catching it locally avoids a broken deploy. If the build needs env vars that aren't on disk, document the gap in chat and stop — do **not** push a build you couldn't verify.

If any check fails, stop and report the failure with the exact error. Do not "fix" by deleting tests, suppressing errors, casting to `any`, or removing functionality. If a fix is one-line obvious (typo, missing import), make it and re-run. Anything bigger, ask first.

### Commit strategy — logical groups, not one mega-commit

Group the diff into focused commits with conventional, scannable subjects. Suggested grouping (adjust to what the diff actually shows):

1. **`marketing: expand round-rock, georgetown, waco location pages to Temple-grade template`** — `src/lib/locations.ts`, `src/lib/site.ts` (footer SERVICE_CITIES), `src/app/(marketing)/locations/page.tsx`, `Stock Images Needed.md`. Body: list the three new pages, mention cross-links added to temple/belton/killeen, note that the route handler renders these automatically via `[slug]`.
2. **`hq: phase 3 — jobs, quotes builder, customers, QuickBooks integration`** — everything under `src/app/hq/`, `src/components/hq/`, `src/lib/hq/`, `src/app/api/hq/`, `src/app/api/qbo/`, `src/lib/qbo.ts`, related Supabase migrations (`012_gallery_items_job_id.sql`, `013_job_receipts.sql`). Body: bullet the major capabilities added.
3. **`hq: voice + receipt + photo capture infrastructure`** — `src/lib/openai.ts`, `src/lib/voice-lead-extractor.ts`, `src/lib/receipt-extractor.ts`, `src/lib/hq/audio-recorder.ts`, `src/lib/hq/image-prep.ts`, `src/components/hq/VoiceRecordingOverlay.tsx`, `JobPhotoStrip.tsx`, `JobReceiptStrip.tsx`, `Lightbox.tsx`. (If these are tightly coupled to the Phase 3 commit, fold them in instead.)
4. **`marketing: site-wide polish — services, blog, layout, emails, headers, footer`** — the remaining `src/app/(marketing)/**`, `src/components/site/**`, `src/components/sections/**`, `src/emails/**`, `src/components/seo/**`, `src/app/globals.css`, `src/app/manifest.ts`, `public/llms.txt`. Use a body that calls out the meaningful copy/UX changes — read each diff to write it accurately.
5. **`docs: vault sync — Decisions, Business Profile, Session Notes, Project Context, AGENTS, Next Session Primer`** — the root `.md` files plus `docs/NAP-CONSISTENCY-AUDIT.md`, `HQ Phase 3 — *.md`, `Stock Images Needed.md` *(if not already in commit 1)*, `ship-phases-3-and-4.sh`. Vault discipline per `AGENTS.md`: confirm `Decisions.md` and `Session Notes.md` reflect the code changes before committing.

If a chunk doesn't fit any of the above cleanly, make a sixth commit rather than forcing it. Do **not** combine unrelated work behind a single subject line.

**Commit-message format:**
- Subject: imperative, ≤72 chars, conventional prefix (`marketing:`, `hq:`, `docs:`, `chore:`, `fix:`, `infra:`).
- Body: bullet list of *what* changed and *why*, written so a stranger reading `git log` six months from now can reconstruct the decision.
- No emoji. No "🤖 Generated with..." footer. No "Co-Authored-By: Claude" line. Plain commits.

### Safety rules

- **Never `git push --force`.** If the remote has commits I haven't pulled, stop and tell me.
- **Never amend or reset commits that are already pushed.**
- **Never edit `.env*` files** beyond what `.env.example` already shows. If new env vars were introduced, add their *names only* to `.env.example` and note them in the commit message so I can set them in Vercel.
- **Don't bypass git hooks** with `--no-verify`. If a hook fails, surface the failure.
- **Don't run destructive git operations** (`git clean -fdx`, `git reset --hard`, branch deletes, tag rewrites) without confirming with me first.

### Push + verify

After all commits land cleanly:

1. `git push origin main`
2. Capture the resulting commit SHAs.
3. Tell me the Vercel deployment URL pattern (`https://triple-j-website-<hash>.vercel.app` or the production domain) and remind me to watch the deploy.
4. If a post-push CI job exists, link it.

### Output to me

A short report:
- One bullet per commit (subject + SHA).
- The pre-flight check results (typecheck / lint / build — pass or fail).
- Anything you skipped, ignored, or flagged for follow-up.
- Any env-var, migration, or manual step I need to handle in Vercel/Supabase before the deploy is healthy.

Begin.

---

## What I'd customize before you paste

- If you only want **one** commit instead of the logical-groups split, replace the "Commit strategy" section with: *"Make a single commit with subject `release: ship pending marketing + HQ phase 3 work` and a body that lists each major change as a bullet."*
- If your `.gitignore` is already clean and you're confident about untracked files, drop the long don't-commit list — it's defensive padding.
- If you're running this from inside Antigravity's terminal mode and want it to stop and ask before each commit instead of running through, add: *"After staging each group, show me the file list and wait for my OK before running `git commit`."*
- Want a dry run? Add a final line: *"Do not actually commit or push. Show me the staged diff plan and proposed commit messages, then stop."*
