'use client';

import { Fragment, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  lead_class: string | null;
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
  newestUploadedAt?: string | null;
  reports?: ScrapeReport[];
  candidatesConsidered?: string[];
};

export default function PermitLeadsTable({
  initialLeads,
  activeStatus,
  activeClass,
}: {
  initialLeads: PermitLead[];
  activeStatus: string;
  activeClass: string;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<string | null>(null);
  const [scrapeDetail, setScrapeDetail] = useState<Record<string, ScrapeJurisdictionResult> | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const runScrape = async () => {
    setScraping(true);
    setScrapeResult(null);
    setScrapeDetail(null);
    try {
      const res = await fetch('/api/cron/scrape-permits', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setScrapeResult(`Error: ${data.error ?? 'Scrape failed'}`);
      } else {
        // The per-jurisdiction breakdown lives under `detail` since the route
        // adopted the shared cron envelope (cron_runs records `detail` as-is).
        const summary = (data.detail?.summary ?? {}) as Record<string, ScrapeJurisdictionResult>;
        const all = Object.values(summary);
        const inserted = all.reduce((n, s) => n + s.inserted, 0);
        const updated = all.reduce((n, s) => n + (s.updated ?? 0), 0);
        const reports = all.reduce((n, s) => n + (s.reportsProcessed ?? 0), 0);
        const withErrors = all.filter((s) => s.errors.length > 0).length;
        const errMsg = withErrors > 0 ? ` · ${withErrors} with errors` : '';
        setScrapeResult(
          reports === 0 && withErrors === 0
            ? 'Nothing new — every listed report has already been read'
            : `${reports} report${reports === 1 ? '' : 's'} read · ${inserted} new permit${inserted === 1 ? '' : 's'}` +
                (updated > 0 ? ` · ${updated} updated` : '') +
                errMsg,
        );
        setScrapeDetail(summary);
        setDetailOpen(withErrors > 0);
        startTransition(() => router.refresh());
      }
    } catch (err) {
      setScrapeResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setScraping(false);
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

  const navigate = (status: string, cls: string) => {
    const params = new URLSearchParams();
    if (status !== 'new') params.set('status', status);
    if (cls !== 'all') params.set('class', cls);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/hq/permit-leads?${qs}` : '/hq/permit-leads');
    });
  };

  const detailHasErrors =
    scrapeDetail !== null && Object.values(scrapeDetail).some((s) => s.errors.length > 0);

  return (
    <div className="space-y-4">
      {/* Filters + manual scrape */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => navigate(f.key, activeClass)}
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
              onClick={() => navigate(activeStatus, f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                activeClass === f.key
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {scrapeResult && (
            <span className={`text-xs ${scrapeResult.startsWith('Error') ? 'text-red-600' : 'text-green-700'}`}>
              {scrapeResult}
            </span>
          )}
          <button
            onClick={runScrape}
            disabled={scraping}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
          >
            {scraping ? 'Scraping…' : 'Run Scrape Now'}
          </button>
        </div>
      </div>

      {scrapeDetail && (
        <div
          className={`border rounded-xl overflow-hidden ${
            detailHasErrors ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <button
            type="button"
            onClick={() => setDetailOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className={`text-sm font-semibold ${detailHasErrors ? 'text-amber-900' : 'text-gray-800'}`}>
              Scrape details
              {detailHasErrors &&
                ` — ${Object.values(scrapeDetail).filter(s => s.errors.length > 0).length} jurisdiction(s) with errors`}
            </span>
            <span className={`text-xs ${detailHasErrors ? 'text-amber-700' : 'text-gray-500'}`}>
              {detailOpen ? 'Hide' : 'Show'}
            </span>
          </button>
          {detailOpen && (
            <div className="px-4 pb-4 space-y-3">
              {Object.entries(scrapeDetail).map(([jur, s]) => (
                <div key={jur} className="bg-white border border-gray-200 rounded-lg p-3 text-xs">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="font-bold text-gray-800">{JURISDICTION_LABELS[jur] ?? jur}</span>
                    <span className="text-gray-500">
                      {s.reportsListed ?? 0} listed · {s.reportsProcessed ?? 0} read · {s.inserted} new ·{' '}
                      {s.updated ?? 0} updated · {s.skipped} skipped · {s.errors.length} error(s)
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
      )}

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
                  No permit leads yet. Press <strong className="text-gray-600">Run Scrape Now</strong> — the City of
                  Temple posts a new weekly report most Fridays, and each run reads up to three unseen reports.
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
                        {CLASS_LABELS[lead.lead_class] ?? lead.lead_class}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                    <div className="text-[11px] text-gray-400 mt-0.5">
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
                  <td className="px-4 py-3 text-gray-600 max-w-[240px] truncate">
                    {lead.permit_type ?? '—'}
                    {lead.description && (
                      <div className="text-xs text-gray-400 truncate">{lead.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="truncate">{lead.owner_name ?? '—'}</div>
                    {lead.applicant_name && (
                      <div className="text-xs text-gray-400 truncate">{lead.applicant_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                    {lead.contractor_name ?? '—'}
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
