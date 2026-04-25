'use client'

import { useState } from 'react'
import type { PartnerInquiry } from '../page'

const STATUS_OPTIONS: PartnerInquiry['status'][] = ['new', 'contacted', 'engaged', 'declined']

const STATUS_TONE: Record<PartnerInquiry['status'], string> = {
  new:       'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  contacted: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  engaged:   'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  declined:  'bg-(--surface-3) text-(--text-tertiary)',
}

const COMPANY_TYPE_LABELS: Record<string, string> = {
  manufacturer: 'Manufacturer',
  supplier:     'Supplier',
  dealer:       'Dealer',
  gc:           'GC',
  developer:    'Developer',
  architect:    'Architect',
  other:        'Other',
}

const COMPANY_TYPE_TONE: Record<string, string> = {
  manufacturer: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  supplier:     'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
  dealer:       'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  gc:           'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  developer:    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  architect:    'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-200',
  other:        'bg-(--surface-3) text-(--text-secondary)',
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

export function PartnerInquiriesTable({ initialInquiries }: { initialInquiries: PartnerInquiry[] }) {
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function patchInquiry(id: string, patch: Partial<Pick<PartnerInquiry, 'status' | 'notes'>>) {
    setBusyId(id)
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
    const res = await fetch(`/api/partner-inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) {
      // revert on failure — simplest path is to refetch, but for now leave optimistic state
      console.error('Failed to update partner inquiry', await res.text().catch(() => ''))
    }
    setBusyId(null)
  }

  async function deleteInquiry(id: string) {
    if (!confirm('Delete this inquiry? This cannot be undone.')) return
    setBusyId(id)
    const res = await fetch(`/api/partner-inquiries/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setInquiries((prev) => prev.filter((i) => i.id !== id))
      if (expandedId === id) setExpandedId(null)
    }
    setBusyId(null)
  }

  if (inquiries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-(--border-subtle) bg-(--surface-2) px-6 py-16 text-center">
        <div className="text-2xl">🤝</div>
        <p className="mt-3 text-sm font-semibold text-(--text-primary)">No partner inquiries yet.</p>
        <p className="mt-2 text-xs text-(--text-tertiary)">
          Inquiries from suppliers, manufacturers, GCs, and dealers come in via{' '}
          <a href="/partners" className="underline text-(--brand-fg)">/partners</a> and land here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {inquiries.map((inq) => {
        const isOpen = expandedId === inq.id
        const typeLabel = COMPANY_TYPE_LABELS[inq.company_type] ?? inq.company_type
        const typeTone = COMPANY_TYPE_TONE[inq.company_type] ?? COMPANY_TYPE_TONE.other
        return (
          <div
            key={inq.id}
            className="rounded-xl border border-(--border-subtle) bg-(--surface-2) overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setExpandedId(isOpen ? null : inq.id)}
              className="w-full text-left px-4 py-3 tap-list"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-(--text-primary) text-[15px] truncate">
                      {inq.company_name}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeTone}`}>
                      {typeLabel}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[13px] text-(--text-secondary) truncate">
                    {inq.contact_name}{inq.contact_role ? ` — ${inq.contact_role}` : ''}
                  </div>
                  <div className="mt-0.5 text-[12px] text-(--text-tertiary)">
                    {relativeTime(inq.created_at)}
                    {inq.estimated_volume && <span> · {inq.estimated_volume}</span>}
                  </div>
                </div>
                <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_TONE[inq.status]}`}>
                  {inq.status}
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-(--border-subtle) px-4 py-4 space-y-4 bg-(--surface-1)">
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`mailto:${inq.email}`}
                    className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-(--brand-fg) text-white text-[13px] font-semibold hover:bg-(--brand-fg-hover)"
                  >
                    Email {inq.email}
                  </a>
                  {inq.phone && (
                    <a
                      href={`tel:${inq.phone}`}
                      className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-(--surface-3) text-(--text-primary) text-[13px] font-semibold hover:bg-(--surface-2)"
                    >
                      Call {inq.phone}
                    </a>
                  )}
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-(--text-tertiary) mb-1">
                    What they want
                  </div>
                  <div className="text-[14px] text-(--text-primary) whitespace-pre-wrap">
                    {inq.message}
                  </div>
                </div>

                {inq.referral_source && (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-(--text-tertiary) mb-1">
                      How they heard
                    </div>
                    <div className="text-[13px] text-(--text-secondary)">{inq.referral_source}</div>
                  </div>
                )}

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-(--text-tertiary) mb-1">
                    Status
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={busyId === inq.id}
                        onClick={() => patchInquiry(inq.id, { status: s })}
                        className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 ${
                          inq.status === s
                            ? STATUS_TONE[s]
                            : 'bg-(--surface-3) text-(--text-tertiary) hover:bg-(--surface-2)'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-(--text-tertiary) mb-1 block">
                    Notes (private)
                  </label>
                  <textarea
                    defaultValue={inq.notes ?? ''}
                    onBlur={(e) => {
                      const v = e.target.value
                      if (v !== (inq.notes ?? '')) patchInquiry(inq.id, { notes: v })
                    }}
                    placeholder="Internal notes — not visible to the partner."
                    className="w-full min-h-[80px] rounded-lg border border-(--border-subtle) bg-(--surface-2) px-3 py-2 text-[13px] text-(--text-primary) placeholder-(--text-tertiary) focus:outline-none focus:ring-2 focus:ring-brand-400 resize-y"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => deleteInquiry(inq.id)}
                    disabled={busyId === inq.id}
                    className="text-[12px] font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                  >
                    Delete inquiry
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
