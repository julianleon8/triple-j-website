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

export default function PermitLeadsTable({
  initialLeads,
  activeStatus,
}: {
  initialLeads: PermitLead[];
  activeStatus: string;
}) {
  type ScrapeJurisdictionResult = {
    inserted: number;
    skipped: number;
    errors: string[];
    pdfUrl?: string;
    candidatesConsidered?: string[];
  };

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
        const summary = data.summary as Record<string, ScrapeJurisdictionResult>;
        const total = Object.values(summary).reduce((sum, s) => sum + s.inserted, 0);
        const sources = Object.keys(summary).length;
        const errors = Object.entries(summary).filter(([, s]) => s.errors.length > 0);
        const errMsg = errors.length > 0 ? ` · ${errors.length} with errors` : '';
        setScrapeResult(`Scraped ${total} new permits across ${sources} jurisdictions${errMsg}`);
        setScrapeDetail(summary);
        setDetailOpen(errors.length > 0);
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

  const changeStatusFilter = (key: string) => {
    startTransition(() => {
      const next = key === 'new' ? '/hq/permit-leads' : `/hq/permit-leads?status=${key}`;
      router.push(next);
    });
  };

  return (
    <div className="space-y-4">
      {/* Status filter pills + manual scrape */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => changeStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeStatus === f.key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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

      {scrapeDetail && Object.entries(scrapeDetail).some(([, s]) => s.errors.length > 0) && (
        <div className="border border-amber-300 bg-amber-50 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setDetailOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold text-amber-900">
              Scrape details — {Object.values(scrapeDetail).filter(s => s.errors.length > 0).length} jurisdiction(s) with errors
            </span>
            <span className="text-amber-700 text-xs">{detailOpen ? 'Hide' : 'Show'}</span>
          </button>
          {detailOpen && (
            <div className="px-4 pb-4 space-y-3">
              {Object.entries(scrapeDetail).map(([jur, s]) => (
                <div key={jur} className="bg-white border border-amber-200 rounded-lg p-3 text-xs">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="font-bold text-gray-800">{JURISDICTION_LABELS[jur] ?? jur}</span>
                    <span className="text-gray-500">
                      {s.inserted} inserted · {s.skipped} skipped · {s.errors.length} error(s)
                    </span>
                  </div>
                  {s.errors.length > 0 && (
                    <div className="text-red-700 mb-2">
                      {s.errors.map((e, i) => <div key={i}>• {e}</div>)}
                    </div>
                  )}
                  {s.pdfUrl && (
                    <div className="mb-1">
                      <span className="text-gray-500">Chosen PDF: </span>
                      <a href={s.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{s.pdfUrl}</a>
                    </div>
                  )}
                  {s.candidatesConsidered && s.candidatesConsidered.length > 0 && (
                    <details>
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                        Candidates considered ({s.candidatesConsidered.length})
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
        <table className="w-full text-sm min-w-[1100px]">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
            <tr>
              {['Score', 'Jurisdiction', 'Date', 'Address', 'Type', 'Value', 'Permit #', 'Status', 'Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  No permit leads yet. Run the cron to populate:
                  <br />
                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/scrape-permits
                  </code>
                </td>
              </tr>
            )}
            {leads.map(lead => (
              <Fragment key={lead.id}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${scoreColor(lead.wheelhouse_score)}`}
                    >
                      {lead.wheelhouse_score ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {JURISDICTION_LABELS[lead.jurisdiction] ?? lead.jurisdiction}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {lead.source_report_date
                      ? new Date(lead.source_report_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : new Date(lead.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
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
                  <td className="px-4 py-3 text-gray-600 max-w-[220px] truncate">
                    {lead.permit_type ?? '—'}
                    {lead.description && (
                      <div className="text-xs text-gray-400 truncate">{lead.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{formatValuation(lead.valuation)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {lead.permit_number ?? '—'}
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
                    <td colSpan={9} className="px-6 py-5 border-t border-gray-100">
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
