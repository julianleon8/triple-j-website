'use client';

import { Fragment, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  runState,
  PERMIT_CATEGORIES,
  CATEGORY_LABELS,
  TAG_LABELS,
  type LeadClass,
  type PermitCategory,
  type PermitTag,
  type ScrapeRunRow,
} from '@/lib/jobs/scrape-permits';
import type { BuilderSummary } from '../page';

type PermitLead = {
  id: string;
  created_at: string;
  jurisdiction: string;
  source_url: string;
  source_report_date: string | null;
  permit_number: string | null;
  permit_type: string | null;
  job_type_code: string | null;
  job_status: string | null;
  owner_name: string | null;
  applicant_name: string | null;
  contractor_name: string | null;
  contractor_company: string | null;
  contractor_key: string | null;
  lead_class: string | null;
  category: string | null;
  tags: string[] | null;
  sqft: number | null;
  dimensions: string | null;
  height_ft: number | null;
  material: string | null;
  applied_at: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  description: string | null;
  valuation: number | null;
  wheelhouse_score: number | null;
  wheelhouse_reasons: string[] | null;
  status: string;
  notes: string | null;
  called_at: string | null;
  raw_source_text: string | null;
};

const JURISDICTION_LABELS: Record<string, string> = {
  temple: 'Temple',
  bell_county: 'Bell Co.',
  harker_heights: 'Harker Hts.',
  killeen: 'Killeen',
  copperas_cove: 'Copperas Cove',
  waco: 'Waco',
  mclennan_county: 'McLennan Co.',
  belton_pz: 'Belton P&Z',
};

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  called: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  junk: 'bg-gray-100 text-gray-500',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS = ['new', 'called', 'qualified', 'junk', 'won', 'lost'];

const STATUS_FILTERS = [
  { key: 'new', label: 'New' },
  { key: 'called', label: 'Called' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'won', label: 'Won' },
  { key: 'all', label: 'All' },
];

const CLASS_FILTERS = [
  { key: 'all', label: 'All types' },
  { key: 'accessory', label: 'Accessory' },
  { key: 'new_home', label: 'New homes' },
  { key: 'commercial', label: 'Commercial' },
];

const CLASS_LABELS: Record<string, string> = {
  accessory: 'Accessory',
  new_home: 'New home',
  commercial: 'Commercial',
};

const CLASS_STYLES: Record<string, string> = {
  accessory: 'bg-emerald-100 text-emerald-700',
  new_home: 'bg-sky-100 text-sky-700',
  commercial: 'bg-violet-100 text-violet-700',
};

const TAG_STYLES: Partial<Record<PermitTag, string>> = {
  metal: 'bg-slate-800 text-white',
  slab: 'bg-stone-200 text-stone-800',
  no_contractor: 'bg-amber-100 text-amber-800',
  engineer_applicant: 'bg-amber-100 text-amber-800',
  prefab_kit: 'bg-gray-100 text-gray-600',
  issued: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
  in_review: 'bg-yellow-100 text-yellow-700',
  applied: 'bg-blue-100 text-blue-700',
};

/** How often the page asks the server about an open run. */
const POLL_MS = 5_000;

/** "Load all history" asks for the ceiling; the run's time budget decides how many actually fit. */
const BACKFILL_MAX_REPORTS = 20;
const BACKFILL_FLAG = 'permits.backfill';

function readBackfillFlag(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(BACKFILL_FLAG) === '1';
  } catch {
    return false;
  }
}

function writeBackfillFlag(on: boolean): void {
  try {
    if (on) window.localStorage.setItem(BACKFILL_FLAG, '1');
    else window.localStorage.removeItem(BACKFILL_FLAG);
  } catch {
    // storage blocked — the toggle still works for this page load
  }
}

/** "30x40 · 1,200 sq ft · 12 ft · metal" — whatever the row gave. */
function measurementsLine(l: { dimensions: string | null; sqft: number | null; height_ft: number | null; material: string | null }): string | null {
  const parts: string[] = [];
  if (l.dimensions) parts.push(l.dimensions);
  if (l.sqft) parts.push(`${l.sqft.toLocaleString('en-US')} sq ft`);
  if (l.height_ft) parts.push(`${l.height_ft} ft tall`);
  if (l.material) parts.push(l.material);
  return parts.length ? parts.join(' · ') : null;
}

function scoreColor(score: number | null): string {
  if (score === null) return 'bg-gray-100 text-gray-400';
  if (score >= 7) return 'bg-green-100 text-green-700';
  if (score >= 4) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-500';
}

function formatValuation(v: number | null): string {
  if (v === null || v === 0) return '—';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${v}`;
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function categoryLabel(c: string | null): string | null {
  return c ? (CATEGORY_LABELS[c as PermitCategory] ?? c) : null;
}

function tagLabel(t: string): string {
  return TAG_LABELS[t as PermitTag] ?? t;
}

type ScrapeReport = {
  label: string;
  url: string;
  permits: number;
  kept: number;
  leads: number;
  inserted: number;
  updated: number;
  errors: string[];
};

type ScrapeJurisdictionResult = {
  inserted: number;
  updated?: number;
  skipped: number;
  errors: string[];
  reportsListed?: number;
  reportsProcessed?: number;
  deferred?: number;
  relabeled?: number;
  newestUploadedAt?: string | null;
  reports?: ScrapeReport[];
  candidatesConsidered?: string[];
};

type RunDetail = { summary?: Record<string, ScrapeJurisdictionResult> } | null;

function summaryOf(run: ScrapeRunRow | null): Record<string, ScrapeJurisdictionResult> | null {
  const detail = run?.detail as RunDetail | undefined;
  return detail?.summary ?? null;
}

function optimisticRun(startedAt: string): ScrapeRunRow {
  return { started_at: startedAt, finished_at: null, ok: null, yield: 0, notified: 0, error: null, detail: null };
}

type Filters = { status: string; cls: string; category: string; tag: string | null };

export default function PermitLeadsTable({
  initialLeads,
  activeStatus,
  activeClass,
  activeCategory,
  activeTag,
  lastRun,
  topBuilders,
}: {
  initialLeads: PermitLead[];
  activeStatus: string;
  activeClass: string;
  activeCategory: string;
  activeTag: string | null;
  lastRun: ScrapeRunRow | null;
  topBuilders: BuilderSummary[];
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [run, setRun] = useState<ScrapeRunRow | null>(lastRun);
  const [starting, setStarting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [backfill, setBackfill] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  // router.refresh() re-renders the server component with fresh props; without
  // these the table would keep showing the rows it mounted with.
  useEffect(() => setLeads(initialLeads), [initialLeads]);
  useEffect(() => setRun(lastRun), [lastRun]);
  // The backfill flag lives in localStorage so leaving and coming back
  // continues the chain rather than forgetting it.
  useEffect(() => setBackfill(readBackfillFlag()), []);

  const state = runState(run, new Date(now));

  // While a run is open, ask the server how it is going. This is what makes
  // leaving the tab harmless: the job lives on the server and cron_runs is the
  // record; the page merely reads it, and reads it again on the way back.
  useEffect(() => {
    if (state !== 'running') return;
    const id = setInterval(async () => {
      setNow(Date.now());
      try {
        const res = await fetch('/api/cron/scrape-permits/status', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { run: ScrapeRunRow | null };
        if (!data.run) return;
        setRun(data.run);
        if (data.run.finished_at) {
          setNotice(null);
          startTransition(() => router.refresh());
        }
      } catch {
        // transient — try again next tick
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [state, router]);

  const startScrape = async (opts: { backfill?: boolean } = {}) => {
    setStarting(true);
    setNotice(null);
    try {
      const res = await fetch('/api/cron/scrape-permits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts.backfill ? { maxReports: BACKFILL_MAX_REPORTS } : {}),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; startedAt?: string };
      if (res.status === 202) {
        setRun(optimisticRun(new Date().toISOString()));
        setNow(Date.now());
        setNotice(
          opts.backfill
            ? 'Loading history. Runs chain on the server until every report is read — you can leave this page.'
            : 'Started. It runs on the server for up to five minutes — you can leave this page; the result is recorded here either way.',
        );
      } else if (res.status === 409) {
        setRun((r) => r ?? optimisticRun(data.startedAt ?? new Date().toISOString()));
        setNow(Date.now());
        setNotice('A run is already in progress.');
      } else {
        setNotice(`Error: ${data.error ?? `HTTP ${res.status}`}`);
      }
    } catch (err) {
      setNotice(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setStarting(false);
    }
  };

  const patch = async (
    id: string,
    update: { status?: string; notes?: string; mark_called?: boolean }
  ) => {
    setUpdating(id);
    const prev = leads;
    // Optimistic apply
    setLeads(ls =>
      ls.map(l =>
        l.id === id
          ? {
              ...l,
              ...(update.status !== undefined && { status: update.status }),
              ...(update.notes !== undefined && { notes: update.notes }),
              ...(update.mark_called && {
                called_at: new Date().toISOString(),
                status: update.status ?? 'called',
              }),
            }
          : l
      )
    );

    const res = await fetch(`/api/permit-leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });

    if (!res.ok) {
      setLeads(prev);
    }
    setUpdating(null);
  };

  const current: Filters = { status: activeStatus, cls: activeClass, category: activeCategory, tag: activeTag };

  const navigate = (next: Partial<Filters>) => {
    const f = { ...current, ...next };
    const params = new URLSearchParams();
    if (f.status !== 'new') params.set('status', f.status);
    if (f.cls !== 'all') params.set('class', f.cls);
    if (f.category !== 'all') params.set('category', f.category);
    if (f.tag) params.set('tag', f.tag);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/hq/permit-leads?${qs}` : '/hq/permit-leads');
    });
  };

  // Category options follow the class filter; "All types" lists every class.
  const categoryGroups = (activeClass === 'all'
    ? (Object.keys(PERMIT_CATEGORIES) as LeadClass[])
    : [activeClass as LeadClass]
  ).map((cls) => ({ cls, categories: PERMIT_CATEGORIES[cls] as readonly PermitCategory[] }));

  // What is on screen, by category — the quick read the owner asked for.
  const categoryCounts = new Map<string, number>();
  let unlabeled = 0;
  for (const l of leads) {
    if (!l.category) { unlabeled += 1; continue; }
    categoryCounts.set(l.category, (categoryCounts.get(l.category) ?? 0) + 1);
  }
  const categoryStrip = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1]);

  const summary = summaryOf(run);
  const totals = summary
    ? Object.values(summary).reduce(
        (acc, s) => ({
          read: acc.read + (s.reportsProcessed ?? 0),
          inserted: acc.inserted + s.inserted,
          updated: acc.updated + (s.updated ?? 0),
          deferred: acc.deferred + (s.deferred ?? 0),
          relabeled: acc.relabeled + (s.relabeled ?? 0),
          errors: acc.errors + s.errors.length,
        }),
        { read: 0, inserted: 0, updated: 0, deferred: 0, relabeled: 0, errors: 0 },
      )
    : null;

  // Backfill chains runs: when one finishes with reports still deferred, start
  // the next. It stops on its own when a run reads everything it was offered.
  const deferredNow = totals?.deferred ?? 0;
  const runFinishedAt = run?.finished_at ?? null;
  useEffect(() => {
    if (!backfill || state !== 'ok' || starting) return;
    if (deferredNow > 0) {
      void startScrape({ backfill: true });
    } else {
      setBackfill(false);
      writeBackfillFlag(false);
      setNotice('History loaded — every listed report has been read.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backfill, state, runFinishedAt, deferredNow]);

  const toggleBackfill = () => {
    if (backfill) {
      setBackfill(false);
      writeBackfillFlag(false);
      setNotice('Stopped loading history; the current run finishes on its own.');
      return;
    }
    setBackfill(true);
    writeBackfillFlag(true);
    if (state !== 'running') void startScrape({ backfill: true });
  };

  const runTone =
    state === 'running' ? 'border-amber-300 bg-amber-50 text-amber-900'
    : state === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : state === 'failed' || state === 'cut_off' ? 'border-red-200 bg-red-50 text-red-900'
    : 'border-gray-200 bg-gray-50 text-gray-700';

  return (
    <div className="space-y-4">
      {/* Filters + manual scrape */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => navigate({ status: f.key })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeStatus === f.key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="hidden sm:inline-block w-px h-5 bg-gray-200 mx-1" aria-hidden="true" />
          {CLASS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => navigate({ cls: f.key, category: 'all' })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                activeClass === f.key
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
          <select
            aria-label="Category"
            value={activeCategory}
            onChange={(e) => navigate({ category: e.target.value })}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-600"
          >
            <option value="all">All categories</option>
            {categoryGroups.map((g) => (
              <optgroup key={g.cls} label={CLASS_LABELS[g.cls] ?? g.cls}>
                {g.categories.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {activeTag && (
            <button
              onClick={() => navigate({ tag: null })}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-black text-white"
              title="Clear this label filter"
            >
              {tagLabel(activeTag)} ×
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleBackfill}
            disabled={starting && !backfill}
            className={`text-xs font-bold px-4 py-2 rounded-lg border transition ${
              backfill
                ? 'border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="Reads every report the City has posted, several per run, run after run, until none are left. Leaving this page does not stop it."
          >
            {backfill ? 'Stop loading history' : 'Load all history'}
          </button>
          <button
            onClick={() => startScrape()}
            disabled={starting || state === 'running'}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
            title="Starts a run on the server. Leaving this page does not stop it."
          >
            {state === 'running' ? 'Running…' : starting ? 'Starting…' : 'Run Scrape Now'}
          </button>
        </div>
      </div>

      {/* Last run — read from the server's ledger, so it survives leaving the tab */}
      <div className={`border rounded-xl overflow-hidden ${runTone}`}>
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div className="text-sm">
            {state === null && <span>No scrape has run yet.</span>}
            {state === 'running' && run && (
              <span>
                <strong>Running</strong> since{' '}
                <time dateTime={run.started_at} suppressHydrationWarning>{formatClock(run.started_at)}</time>
                {' '}· reading Temple reports on the server. Safe to leave this page.
              </span>
            )}
            {state === 'cut_off' && run && (
              <span>
                The run started{' '}
                <time dateTime={run.started_at} suppressHydrationWarning>{formatClock(run.started_at)}</time>
                {' '}never finished — cut off at the platform&apos;s five-minute limit. Anything it stored is in the
                table; unread reports are picked up by the next run.
              </span>
            )}
            {state === 'ok' && run && totals && (
              <span>
                <strong>Last run</strong>{' '}
                <time dateTime={run.started_at} suppressHydrationWarning>{formatClock(run.started_at)}</time>
                {' '}· {totals.read} report{totals.read === 1 ? '' : 's'} read · {totals.inserted} new permit
                {totals.inserted === 1 ? '' : 's'}
                {totals.updated > 0 ? ` · ${totals.updated} updated` : ''}
                {totals.relabeled > 0 ? ` · ${totals.relabeled} labelled` : ''}
                {totals.deferred > 0 ? ` · ${totals.deferred} left for next run` : ''}
                {totals.errors > 0 ? ` · ${totals.errors} error${totals.errors === 1 ? '' : 's'}` : ''}
                {totals.read === 0 && totals.errors === 0 && totals.relabeled === 0 ? ' · nothing new to read' : ''}
              </span>
            )}
            {state === 'failed' && run && (
              <span>
                <strong>Last run</strong>{' '}
                <time dateTime={run.started_at} suppressHydrationWarning>{formatClock(run.started_at)}</time>
                {' '}failed{run.error ? `: ${run.error}` : ''}
              </span>
            )}
            {notice && (
              <div className={`mt-1 text-xs ${notice.startsWith('Error') ? 'text-red-700' : 'opacity-80'}`}>{notice}</div>
            )}
          </div>
          {summary && (
            <button
              type="button"
              onClick={() => setDetailOpen(o => !o)}
              className="text-xs whitespace-nowrap opacity-80 hover:opacity-100"
            >
              {detailOpen ? 'Hide details' : 'Details'}
            </button>
          )}
        </div>

        {detailOpen && summary && (
          <div className="px-4 pb-4 space-y-3">
            {Object.entries(summary).map(([jur, s]) => (
              <div key={jur} className="bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-700">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="font-bold text-gray-800">{JURISDICTION_LABELS[jur] ?? jur}</span>
                  <span className="text-gray-500">
                    {s.reportsListed ?? 0} listed · {s.reportsProcessed ?? 0} read · {s.inserted} new ·{' '}
                    {s.updated ?? 0} updated · {s.skipped} skipped · {s.errors.length} error(s)
                    {s.relabeled ? ` · ${s.relabeled} labelled` : ''}
                    {s.deferred ? ` · ${s.deferred} left for next run` : ''}
                  </span>
                </div>
                {s.newestUploadedAt && (
                  <div className="text-gray-500 mb-1">
                    Newest report uploaded {formatDay(s.newestUploadedAt)}
                  </div>
                )}
                {s.errors.length > 0 && (
                  <div className="text-red-700 mb-2">
                    {s.errors.map((e, i) => <div key={i}>• {e}</div>)}
                  </div>
                )}
                {s.reports && s.reports.length > 0 && (
                  <ul className="space-y-0.5 text-gray-600 mb-1">
                    {s.reports.map((r) => (
                      <li key={r.url}>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {r.label}
                        </a>
                        {' '}— {r.permits} permits · {r.kept} sent to Claude · {r.leads} stored · {r.inserted} new
                      </li>
                    ))}
                  </ul>
                )}
                {s.candidatesConsidered && s.candidatesConsidered.length > 0 && (
                  <details>
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                      Reports listed on the page ({s.reportsListed ?? s.candidatesConsidered.length})
                    </summary>
                    <ul className="mt-1 space-y-0.5 text-gray-600">
                      {s.candidatesConsidered.slice(0, 10).map((h, i) => (
                        <li key={i} className="break-all">• {h}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* What is on screen, by category + who is building */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 px-4 py-3">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">By category</h2>
            <span className="text-xs text-gray-400">
              {leads.length} permit{leads.length === 1 ? '' : 's'} shown
              {unlabeled > 0 ? ` · ${unlabeled} not yet labelled` : ''}
            </span>
          </div>
          {categoryStrip.length === 0 ? (
            <p className="text-xs text-gray-400">Nothing labelled in this view yet. Labels arrive with the next scrape run.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categoryStrip.map(([c, n]) => (
                <button
                  key={c}
                  onClick={() => navigate({ category: activeCategory === c ? 'all' : c })}
                  className={`px-2.5 py-1 rounded-full text-xs border transition ${
                    activeCategory === c
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {categoryLabel(c)} <span className="font-semibold">{n}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Builders, all time</h2>
          {topBuilders.length === 0 ? (
            <p className="text-xs text-gray-400">No contractors named yet.</p>
          ) : (
            <ol className="text-sm space-y-1">
              {topBuilders.map((b) => (
                <li key={b.key} className="flex items-baseline justify-between gap-2">
                  <span className="truncate">{b.name}</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {b.newHomes > 0 ? `${b.newHomes} home${b.newHomes === 1 ? '' : 's'}` : ''}
                    {b.newHomes > 0 && b.other > 0 ? ' · ' : ''}
                    {b.other > 0 ? `${b.other} other` : ''}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[1300px]">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
            <tr>
              {['Score', 'Type', 'Date', 'Address', 'Work', 'Owner', 'Contractor', 'Permit #', 'Status', 'Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                  No permit leads match. Press <strong className="text-gray-600">Run Scrape Now</strong> — the City of
                  Temple posts a new weekly report most Fridays, and each run reads a few unseen reports.
                </td>
              </tr>
            )}
            {leads.map(lead => (
              <Fragment key={lead.id}>
                <tr
                  id={lead.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors scroll-mt-24"
                  onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${scoreColor(lead.wheelhouse_score)}`}
                    >
                      {lead.wheelhouse_score ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {lead.lead_class ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${CLASS_STYLES[lead.lead_class] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {categoryLabel(lead.category) ?? CLASS_LABELS[lead.lead_class] ?? lead.lead_class}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {lead.category ? CLASS_LABELS[lead.lead_class ?? ''] ?? '' : ''}
                      {lead.category ? ' · ' : ''}
                      {JURISDICTION_LABELS[lead.jurisdiction] ?? lead.jurisdiction}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {formatDay(lead.source_report_date ?? lead.created_at)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-semibold">{lead.address ?? '—'}</div>
                    {lead.city && (
                      <div className="text-xs text-gray-400">
                        {lead.city}
                        {lead.zip ? `, ${lead.zip}` : ''}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[260px]">
                    <div className="truncate">{lead.permit_type ?? '—'}</div>
                    {lead.description && (
                      <div className="text-xs text-gray-400 truncate">{lead.description}</div>
                    )}
                    {measurementsLine(lead) && (
                      <div className="text-xs text-gray-600 truncate">{measurementsLine(lead)}</div>
                    )}
                    {lead.tags && lead.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1" onClick={e => e.stopPropagation()}>
                        {lead.tags.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => navigate({ tag: activeTag === t ? null : t })}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold leading-tight ${TAG_STYLES[t as PermitTag] ?? 'bg-gray-100 text-gray-600'} ${activeTag === t ? 'ring-2 ring-black' : ''}`}
                            title={`Filter by ${tagLabel(t)}`}
                          >
                            {tagLabel(t)}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="truncate">{lead.owner_name ?? '—'}</div>
                    {lead.applicant_name && (
                      <div className="text-xs text-gray-400 truncate">{lead.applicant_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                    {lead.contractor_company ?? lead.contractor_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {lead.permit_number ?? '—'}
                    {lead.job_status && (
                      <div className="font-sans text-[11px] text-gray-400 mt-0.5">{lead.job_status}</div>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <select
                      aria-label={`Status for ${lead.address ?? lead.id}`}
                      value={lead.status}
                      disabled={updating === lead.id}
                      onChange={e => patch(lead.id, { status: e.target.value })}
                      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 ${STATUS_STYLES[lead.status] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s} className="bg-white text-gray-800 capitalize">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => patch(lead.id, { mark_called: true })}
                      disabled={updating === lead.id || lead.called_at !== null}
                      className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-gray-200 disabled:text-gray-400 text-white px-3 py-1.5 rounded-lg transition"
                    >
                      {lead.called_at ? 'Called ✓' : 'Mark called'}
                    </button>
                  </td>
                </tr>
                {expanded === lead.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={10} className="px-6 py-5 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Why this score
                          </h3>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {(lead.wheelhouse_reasons ?? []).map((r, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-gray-400">•</span>
                                <span>{r}</span>
                              </li>
                            ))}
                            {(lead.wheelhouse_reasons ?? []).length === 0 && (
                              <li className="text-gray-400 italic">No reasoning recorded.</li>
                            )}
                          </ul>

                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2">
                            Permit
                          </h3>
                          <dl className="text-sm text-gray-700 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                            <dt className="text-gray-400">Category</dt>
                            <dd>{categoryLabel(lead.category) ?? 'Not yet labelled'}</dd>
                            <dt className="text-gray-400">Labels</dt>
                            <dd>{lead.tags && lead.tags.length > 0 ? lead.tags.map(tagLabel).join(', ') : '—'}</dd>
                            <dt className="text-gray-400">Size</dt>
                            <dd>{measurementsLine(lead) ?? '—'}</dd>
                            <dt className="text-gray-400">Applied</dt>
                            <dd>{lead.applied_at ? formatDay(lead.applied_at) : '—'}</dd>
                            <dt className="text-gray-400">Code</dt>
                            <dd>{lead.job_type_code ?? '—'}</dd>
                            <dt className="text-gray-400">Municipal status</dt>
                            <dd>{lead.job_status ?? '—'}</dd>
                            <dt className="text-gray-400">Applicant</dt>
                            <dd>{lead.applicant_name ?? '—'}</dd>
                            <dt className="text-gray-400">Contractor</dt>
                            <dd>{lead.contractor_name ?? '—'}</dd>
                            <dt className="text-gray-400">Valuation</dt>
                            <dd>{formatValuation(lead.valuation)}</dd>
                          </dl>

                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2">
                            Source
                          </h3>
                          <Link
                            href={lead.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline break-all"
                          >
                            {lead.source_url}
                          </Link>
                        </div>

                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Notes
                          </h3>
                          <NotesEditor
                            initial={lead.notes ?? ''}
                            disabled={updating === lead.id}
                            onSave={notes => patch(lead.id, { notes })}
                          />

                          {lead.raw_source_text && (
                            <details className="mt-4">
                              <summary className="text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                                Raw source text
                              </summary>
                              <pre className="mt-2 text-xs text-gray-600 bg-white p-3 rounded border border-gray-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                                {lead.raw_source_text}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotesEditor({
  initial,
  disabled,
  onSave,
}: {
  initial: string;
  disabled: boolean;
  onSave: (notes: string) => void;
}) {
  const [val, setVal] = useState(initial);
  const dirty = val !== initial;

  return (
    <div className="space-y-2">
      <textarea
        value={val}
        onChange={e => setVal(e.target.value)}
        rows={3}
        placeholder="Call notes, owner phone, next step…"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
      />
      <button
        type="button"
        disabled={!dirty || disabled}
        onClick={() => onSave(val)}
        className="text-xs font-semibold bg-gray-800 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white px-3 py-1.5 rounded-lg transition"
      >
        Save notes
      </button>
    </div>
  );
}
