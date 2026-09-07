# Shared business database — audit, research and design constraints

**Date:** 2026-09-07 · **Status:** research complete, nothing built · **Scope:** Triple J, Mesa, El Mexicano

Julian's ask, verbatim: *"some sort of database I can interact with and it logs things for both
El Mexicano Grille and Triple J and Mesa, kinda like my own Jarvis business knower and the rule
warden"* — later refined with three requirements that changed the design:

1. **Exact rows.** Not an index pointing at markdown. The full text.
2. **A local model must be all-knowing in the DB.** *"Whatever I ask it delivers down to the T."*
3. **Briefs for Julian and, in future, employees.**

Requirement 2 is what makes the other two non-negotiable. A cheap local model cannot clone a repo,
so a pointer is worthless to it; and if employees read its output, every row needs to say who may
see it.

This document is the audit and the research. It builds nothing. Every number below was read from
the live systems on 2026-09-07; the commands are in the appendix.

---

## 1 · Audit: where knowledge lives today

### 1.1 The written corpus is the business

| | Live files | Live bytes | Archived files | Archived bytes |
|---|---|---|---|---|
| `triple-j-website` | 56 | 684,846 | 9 | 67,461 |
| `Mexicno-Grille` | 109 | 2,716,379 | 97 | 2,403,236 |
| **Total** | **165** | **3,401,225** | **106** | **2,470,697** |

**271 markdown files, 5.87 MB.** At the rough bytes÷4 heuristic that is **~850K tokens live** and
~618K archived. The heuristic is approximate; the order of magnitude is not.

The largest single artefacts: `docs/archive/DECISIONS-LOG-THROUGH-2026-05.md` (429 KB),
`docs/CUSTOMER-ADVERSARIAL-REVIEW-2026-08.md` (429 KB), `docs/DECISIONS-LOG.md` (382 KB),
`docs/SESSIONS-LOG.md` (366 KB), `docs/GROKBOTS.md` (122 KB), and on the Triple J side
`Decisions.md` (142 KB, 164 append-only rows) and `Session Notes.md` (91 KB, 24 entries).

### 1.2 The databases hold almost nothing

This is the finding that reframes the project. Exact counts, not estimates:

**Triple J** (`idrbgxlvvnqduvbqtaei`, 20 tables)

| Table | Rows |
|---|---|
| `permit_leads` | 79 |
| `cron_runs` | 11 |
| `leads` | 7 |
| `customers` | 3 |
| `quotes` | 1 |
| `jobs`, `job_costs`, `time_entries`, `job_receipts` | **0** |

**Mesa / El Mexicano** (`tgibqoibjexfqjwlcjzx`, 42 tables)

| Table | Rows |
|---|---|
| `location_daily_aggregates` | 1,155 |
| `daily_metrics_snapshots` | 91 |
| `locations` | 17 |
| `customers` | 14 |
| `ocr_scans` | 9 |
| `transactions` | 6 |
| `organizations`, `redemptions` | 2 each |
| `billing_accounts`, `orders` | **0** |

The entire operating history across three businesses is **7 leads, 3 Triple J customers, 1 quote,
14 loyalty members, 6 transactions and 2 redemptions.** `permit_leads` (79) is scraped prospecting
data, not customers. `billing_accounts` empty confirms
`Mexicno-Grille/docs/FINISH-LINE-TRACKER-2026-06.md` — Stripe has not gone live.

**Consequence:** a "business knower" built on metrics would return near-zero numbers for months.
Roughly 95% of what Julian actually knows is prose, not rows. **The document corpus is the product;
metrics are a thin, later layer.** Build order should follow that, not the intuition that a database
is mostly numbers.

### 1.3 Two memory systems that cannot see each other

| | Triple J | Mesa / El Mexicano |
|---|---|---|
| Shape | Obsidian vault, root `.md` files | `docs/` tree, 46 live contracts |
| Current truth | `Locked Decisions.md` (72 bullets) | 54 numbered rules in `AGENTS.md` |
| History | `Decisions.md`, append-only, 164 rows | `DECISIONS-LOG.md` + index |
| Enforcement | `scripts/check-vault.mjs` + 4 Claude Code hooks | `npm run check:docs` |
| Guarantee | Vault index completeness, cited paths exist, retired-phrase autofix | Links, references, registered counts |

Neither mechanism can see the other repo. There is no artefact anywhere that answers a
cross-business question. Both codebases independently evolved the same rule — Triple J: *"Every
fact has exactly one owner. Restating an owned fact anywhere else creates a second copy that
silently goes stale."* Mesa: *"One policy has one authoritative home."* Any shared database has to
survive that rule rather than violate it (§3.1).

### 1.4 The grokbot layer writes to chat

Six asynchronous bots (Squad Orchestrator, Mesa Competitive Analyst, Repo Knowledge Bank, Mesa Ops
Monitor, El Mexicano Local Signal, Mesa Platform Watch) run on their own boxes with their own
browsers and terminals. Their output lands in a group channel and DMs, and reaches the repo only
when Julian pastes a transcript and a session folds it into `docs/GROKBOTS.md` — which carries
**10 open items** waiting on exactly that. This is the single largest source of knowledge that
currently has **no durable home at all**.

### 1.5 Facts nothing owns

- Anything cross-business (a pricing philosophy that spans Triple J and Mesa).
- Bot findings, pre-fold.
- Metric history — `daily_metrics_snapshots` exists for Mesa only, and stops at Mesa's boundary.
- Legal identity, which is actively confused: **three** distinct entities exist — Triple J Metal
  LLC, Mexicano Grille Software LLC (the app vendor), Taqueria El Mexicano Grille & Bar (the
  restaurants' DBA) — and `tenant_branding.legal_operator_name` for the Mexicano org is set to the
  *vendor* LLC, a live defect already documented in
  `Mexicno-Grille/docs/CUSTOMER-ADVERSARIAL-REVIEW-2026-08.md`.

---

## 2 · Research: what "delivers down to the T" actually requires

House rule from `Mexicno-Grille/docs/EXTERNAL-HANDOFF-OPPORTUNITIES.md` applies —
one source per claim, with a read date, or the word *unverified*.

### 2.1 The corpus does not fit in a prompt

~850K live tokens against a local model's practical working context. Retrieval is not an
optimisation here, it is the only option. **Storage completeness ≠ answer quality.** A model can
have every byte and still answer wrong if retrieval hands it the wrong chunk.

> *"For RAG, retrieval quality often matters more than raw model size — a good embedding model plus
> clean chunking plus a smaller LLM can beat a giant model with poor retrieval."*
> (read 2026-09-07: [LMSA — best local models for RAG 2026](https://lmsa.app/blog/the-ultimate-guide-to-finding-the-best-local-models-for-rag-in-2026/))

### 2.2 Hybrid retrieval, fused by rank

Keyword (BM25/Postgres FTS) and dense vector search fail on opposite query types and are fused by
Reciprocal Rank Fusion, which operates on *ranks* rather than scores and so sidesteps score
normalisation. Measured: hybrid lifts recall@10 from ~78% to ~91%; a cross-encoder reranker adds a
further 15–40% Hit@1; two-stage hybrid + rerank beat hybrid-RRF alone by +17.4% Recall@5
(read 2026-09-07: [Hybrid Search: BM25, Vector & Reranking Reference 2026](https://www.digitalapplied.com/blog/hybrid-search-bm25-vector-reranking-reference-2026),
[Hybrid Search for RAG 2026](https://denser.ai/blog/hybrid-search-for-rag/)).

Query shape should steer the weighting: identifiers and quoted strings lean keyword, conceptual
questions lean vector. A single static weight hurts both.

### 2.3 The text-to-SQL trap — the most important finding

The intuitive design for a "business knower" is to let the model write SQL. **Do not.** Execution
accuracy on realistic schemas (read 2026-09-07: [AIMultiple — Text-to-SQL LLM accuracy](https://aimultiple.com/text-to-sql),
[SQuaD-SQL, arXiv 2607.08161](https://arxiv.org/pdf/2607.08161)):

| Model | Execution accuracy |
|---|---|
| Qwen-1.5B | 33.4 – 35.6% |
| Phi-3-mini | 41.3 – 42.5% |
| Qwen-2.5B | 43.4 – 45.6% |
| GPT-4o (BIRD) | ~52.5% overall — 56% simple, 35% moderate, 41% hard |

Frontier models score 54–68% on BIRD/Spider 2.0 against real enterprise schemas. Mesa alone has 42
tables. A small local model writing SQL against 62 tables would be **wrong about money roughly half
the time**, silently and fluently. The published recommendation is a semantic layer for
accuracy-critical work, text-to-SQL only for ad hoc exploration
(read 2026-09-07: [dbt — Semantic Layer vs Text-to-SQL 2026](https://docs.getdbt.com/blog/semantic-layer-vs-text-to-sql-2026)).

**Design consequence: the model must never compute a number it can look up.** Pre-computed metric
rows and canonical fact rows, with the definition stored in words beside the value. That is a
semantic layer, and it is the only way "down to the T" survives contact with a 3B-active model.

### 2.4 Local model and hardware reality

The 2026 sweet spot for local RAG is **Qwen3-30B-A3B** — Mixture-of-Experts, ~3B parameters active
per token, so it runs at 3B speed while needing all 30B of expert weights resident. At Q4 that is
**~17 GB VRAM, comfortable on a 24 GB card**; a used RTX 3090 24 GB reaches ~60 tok/s, and a new
4090/5090 runs Q4–Q6 at $1,500–2,500. Easier alternatives: Gemma 3 27B (16 GB), Phi-4 14B (8 GB).
For embeddings, `nomic-embed-text` is the standard low-footprint choice
(read 2026-09-07: [Spheron — Run Qwen3 locally](https://www.spheron.network/blog/run-qwen3-locally-gpu-requirements-2026/),
[Will It Run AI — Qwen3 GPU requirements](https://willitrunai.com/blog/qwen-3-gpu-requirements),
[SitePoint — Best local LLM models 2026](https://www.sitepoint.com/best-local-llm-models-2026/)).

`nomic-embed-text` emits **768 dimensions** — that fixes the vector column width, and it must be
chosen before anything is embedded, not after.

---

## 3 · What the audit and research jointly constrain

Each of these is forced by a finding above, not a preference.

### 3.1 Copying is mandatory, so it must be verifiable

Requirement 1 (exact rows) directly contradicts both repos' one-owner rule (§1.3). The resolution is
not to refuse to copy but to make every copy checkable: each mirrored row stores the **hash of the
exact source block**, and a sync check fails loudly when the markdown moves. Rows are then either
`synced` (markdown owns it, hash mandatory, never hand-edited) or `native` (born in the DB, nothing
else has a copy). Drift becomes detectable rather than silent — the only property that survives a
164-row append-only ledger.

### 3.2 Three retrieval paths, chosen by question shape

| Question | Path | Why |
|---|---|---|
| "What does a 20×20 carport cost?" | **Exact fact lookup** | §2.3 — never let the model derive a price |
| "How many leads last month?" | **Pre-computed metric row** | §2.3 — never let the model write SQL |
| "How do we handle a receipt that won't scan?" | **Hybrid retrieval + rerank** | §2.2 — genuinely fuzzy |

Prices carry their qualifier ("steel + install only, bolted, before tax") in the same row; a price
quoted without it is wrong. Superseded prices are retained with effective dates, because quotes
given before the 2026-05-02 raise are still honoured at the old rate.

### 3.3 Audience is a column, not a convention

Requirement 3 puts model output in front of employees. The vault already encodes audience rules in
prose — *"never publish per-sqft concrete pricing"*, *"never name a specific steel supplier"* — and
those must survive into any brief. An ordered clearance (`public` < `staff` < `owner`) on every
content row means a crew brief physically cannot retrieve a margin. Retrofitting this after briefs
ship is a rewrite.

### 3.4 Coverage must be measurable

"All-knowing" is only a meaningful claim if the gaps are visible. A registry of every file that
*must* be mirrored, with last-synced state, turns it from an assumption into a report.

### 3.5 Isolation by grant, and portability by construction

Julian chose to host this as a schema inside the existing Triple J project rather than a fourth
$10/month Supabase project. That schema therefore shares a database with `public.leads` and
`public.customers`. The mitigation is scoped PostgreSQL roles with rights inside the new schema and
**none in `public`** — which is stronger than project separation would have been with a shared
service key, since a grokbot credential on a shared box then cannot read a customer phone number
even by accident.

Because the endgame is self-hosting, the schema must stay plain PostgreSQL: no Supabase-only
features, no PostgREST dependency, so `pg_dump --schema=…` lifts it onto Julian's own box. One
concrete instance already found: an unguarded `revoke … from anon` fails on a bare server, because
`anon` is Supabase's role, not PostgreSQL's.

### 3.6 Push, never pull

Each app pushes its own aggregates. Nothing reaches across into another database. Customer rows
stay in the database that owns them, and the shared schema stays PII-free — which is what makes
§3.5's blast radius argument true rather than aspirational.

---

## 4 · Feasibility check already performed

A draft schema (`dev/business-os-schema.draft.sql` — deliberately **not** in `supabase/migrations/`,
so it cannot be applied by accident) was exercised against a throwaway PostgreSQL 16 cluster to test
whether §3.1–3.3 hold. Eight checks pass: the provenance constraint rejects a `synced` row with no
hash and a `native` row claiming one; a `staff` reader is correctly denied an owner-only pricing
rule via both the unified view and the search function; a price resolves by exact key with its
qualifier attached; the coverage report distinguishes missing from current; and the writer role can
insert a journal entry but cannot `UPDATE` it, cannot `DELETE` it, and cannot read `public.leads`.

**Caveats:** local PostgreSQL is 16.13, Supabase runs 17.6; `pgvector` was unavailable locally so
the vector path degraded to keyword-only as designed, and is **not yet tested where it matters**.
Nothing has been applied to any live database, and nothing is committed to `main`.

---

## 5 · Open decisions

1. **Archive scope.** Do the 106 archived files (618K tokens) enter the corpus? They record what was
   true *then*; a model that cannot tell them from current truth will confidently quote a reversed
   decision. Recommendation: mirror them, mark them archival, exclude from default retrieval.
2. **Reranker.** §2.2 shows a cross-encoder is worth 15–40% Hit@1. That is a second model to host.
   Worth deciding before the hardware is bought, not after.
3. **Embedding dimension is a one-way door.** 768 (`nomic-embed-text`) is the default assumption.
4. **Grokbot write path.** Credentials on shared boxes — a scoped, append-only role, rotated how
   often, and issued by whom?
5. **Employee briefs.** Which employees, on what cadence, delivered through what channel? Triple J
   crew (Freddy) and restaurant staff have very different needs, and rule 18 in `Mexicno-Grille`
   already governs one notification channel per event.

---

## Appendix · Evidence

Read 2026-09-07. Reproducible.

- Corpus sizes — `find <repo> -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*"`,
  split on `-path "*archive*"`.
- Row counts — `select count(*)` per table against both projects via the Supabase MCP. Note
  `pg_class.reltuples` reports `-1` for never-analysed tables; every count above is an exact
  `count(*)`, not an estimate.
- Rule counts — 54 numbered rules in `Mexicno-Grille/AGENTS.md`; 72 bullets in
  `triple-j-website/Locked Decisions.md`; 164 rows in `Decisions.md`.
- Legal names — `src/lib/site.ts:19`; `Mexicno-Grille/docs/BRAND-KIT.md:267`; legal pages cited in
  `CUSTOMER-ADVERSARIAL-REVIEW-2026-08.md`.
- Supabase org is on the **pro** plan; a fourth project would cost **$10/month** — the alternative
  Julian declined in favour of a schema in the existing Triple J project.
- Web sources are cited inline with read dates, per §2.
