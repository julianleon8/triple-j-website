# Pre-restart branches — set for deletion 2026-09-30

Historical only, not authoritative. `main` was restarted from a fresh root on 2026-09-06; these 14 branches
came from the history before that and shared no commits with it. All 203 of their commits were audited on
2026-09-30 (`Decisions.md`, that date): two lost fixes were ported to `main`, and everything else was already
on `main`, moved into `archive/` or `research/`, rebuilt, reverted on purpose, or stale. The owner then asked
for the branches to be deleted. This session's GitHub access refused both archive tags and the deletion
(HTTP 403), so the owner deletes them on GitHub's Branches page, and the only unshipped work the owner may
still want is kept here as patches.

## Kept as patches

These pre-date today's code and will not apply cleanly; read them for intent and rebuild on `main`.

| Patch | From | What it is | Status |
|---|---|---|---|
| `rollup-door-pricing-d7d9497.patch` | `claude/quote-rollup-door-pricing-jB54p`, 2026-05-06 | Roll-up door prices from Freddy and Juan's handwritten sheet: 8×8 $1,000 · 10×10 $1,900 · 12×12 $1,800 · 14×14 $2,200 · 16×16 $2,600 | Conflicts with the $800 flat price in `dev/sales-pack-2026-04-30.md`; owner to confirm (`Locked Decisions.md` → Outstanding) |
| `fix-sms-35fcf82.patch` | `claude/fix-sms-gIPzp`, 2026-04-25 | Twilio text to a new lead within minutes, plus a review request | Never shipped; owner to decide |
| `twilio-auto-reply-bbd845a.patch` | `claude/setup-new-project-wA6jt`, 2026-04-21 | Earlier version: Twilio auto-reply and a 24-hour review request, with an `sms_events` table and a cron | Never shipped; owner to decide |

## All 14 branches

The tip commit identifies each branch in any clone that still has it.

| Branch | Tip | Last commit | Verdict |
|---|---|---|---|
| `claude/add-force-delete-function-1NZTP` | `4c62743` | 2026-04-27 force-delete via long-press | Was on the old main line; HQ rebuilt since |
| `claude/app-description-adjectives-LdbrO` | `1809dc5` | 2026-05-04 App Description note | Stale: repeats retired claims (Stripe, the old concrete spec) |
| `claude/diagnose-upload-failure-gSsdu` | `d70d94b` | 2026-04-26 push-subscription dedupe | Present on `main` |
| `claude/fix-quickbooks-integration-blOxA` | `c156037` | 2026-04-25 QuickBooks redirect | Present on `main`, `QBO_ENVIRONMENT` documented |
| `claude/fix-sms-gIPzp` | `35fcf82` | 2026-04-25 SMS speed-to-response + review ask | Patch kept |
| `claude/gallery-v2-phased-plan-JiZYc` | `15b6c29` | 2026-04-21 Gallery v2 plan | Gallery rebuilt (migrations 008, 009, 012) |
| `claude/gallery-v2-planning-9dNRJ` | `e425567` | 2026-04-21 Gallery v2 phases | Gallery rebuilt |
| `claude/gallery-v2-schema` | `2009d53` | 2026-04-21 `008_gallery_v2.sql` | Superseded by `008_gallery_photos.sql`; never apply |
| `claude/plan-next-release-H6mEP` | `4a39819` | 2026-04-30 local Claude settings | Machine-local settings |
| `claude/quote-form-android-fix-O4rFO` | `b5dd6f8` | 2026-05-11 Android `#quote` taps | **Ported** to `main` 2026-09-30 |
| `claude/quote-rollup-door-pricing-jB54p` | `d7d9497` | 2026-05-06 roll-up door prices | Patch kept |
| `claude/redesign-iphone-pwa-app-5V1Cn` | `a9672d3` | 2026-04-24 HQ redesign plan docs | Plans executed in April; HQ rebuilt again in September |
| `claude/setup-new-project-wA6jt` | `9f45c23` | 2026-04-21 Phase 2a waves A–C | Dashboard and legal pages rebuilt; Twilio wave kept as a patch |
| `claude/upload-competition-photos-zjhRQ` | `2512484` | 2026-04-20 Marketplace competitor scan | Findings live in `research/competitors/roster-2026-09.md` |

The Messenger reply fix (`f49da87`, 2026-04-24) sat on the old main line shared by nine of these branches;
it was also **ported** to `main` on 2026-09-30.
