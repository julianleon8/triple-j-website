'use client'

import { useState, useEffect } from 'react'

type Lead = {
  id: string
  created_at: string
  name: string
  phone: string
  email: string | null
  city: string | null
  zip: string | null
  service_type: string
  structure_type: string | null
  needs_concrete: string | null
  timeline: string | null
  is_military: boolean | null
  message: string | null
  status: string
}

const STATUS_STYLES: Record<string, string> = {
  new:       'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  quoted:    'bg-purple-100 text-purple-700',
  won:       'bg-green-100 text-green-700',
  lost:      'bg-red-100 text-red-700',
}

const STATUS_OPTIONS = ['new', 'contacted', 'quoted', 'won', 'lost']

const CONCRETE_LABELS: Record<string, string> = {
  yes:          '✅ Need pad',
  already_have: '🏗️ Has slab',
  unsure:       '❓ Unsure',
}

const TIMELINE_LABELS: Record<string, string> = {
  asap:       '⚡ ASAP',
  this_week:  '📅 This week',
  this_month: '📆 This month',
  planning:   '🗓️ Planning',
}

type EmailEvent = { event_type: string; occurred_at: string }

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.round(ms / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

function emailIndicator(event?: EmailEvent) {
  if (!event) return null
  const t = event.event_type
  if (t === 'email.clicked')   return { emoji: '🔗', label: 'Clicked',   color: 'text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400' }
  if (t === 'email.opened')    return { emoji: '📬', label: 'Opened',    color: 'text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' }
  if (t === 'email.delivered') return { emoji: '📨', label: 'Delivered', color: 'text-gray-600 bg-gray-50 dark:bg-white/5 dark:text-gray-400' }
  return null
}

function formatService(lead: Lead): string {
  return lead.service_type.replace('_', ' ')
}

export default function LeadsTable({
  initialLeads,
  emailEvents = {},
}: {
  initialLeads: Lead[]
  emailEvents?: Record<string, EmailEvent>
}) {
  const [leads, setLeads] = useState(initialLeads)
  const [updating, setUpdating] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [converting, setConverting] = useState<string | null>(null)
  const [convertedIds, setConvertedIds] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const poll = setInterval(async () => {
      const res = await fetch('/api/leads')
      if (res.ok) {
        const { leads: fresh } = await res.json()
        setLeads(fresh)
        setLastRefresh(new Date())
      }
    }, 30_000)
    return () => clearInterval(poll)
  }, [])

  const handleStatusChange = async (id: string, newStatus: string, prevStatus: string) => {
    setUpdating(id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))

    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!res.ok) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: prevStatus } : l))
    }

    setUpdating(null)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setLeads(prev => prev.filter(l => l.id !== id))
    }
    setDeleting(null)
    setConfirmDeleteId(null)
  }

  const handleConvert = async (lead: Lead) => {
    setConverting(lead.id)
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    lead.name,
        phone:   lead.phone,
        email:   lead.email || undefined,
        city:    lead.city || undefined,
        zip:     lead.zip || undefined,
        notes:   lead.message || undefined,
        lead_id: lead.id,
      }),
    })
    if (res.ok) {
      setConvertedIds(prev => new Set(prev).add(lead.id))
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'quoted' } : l))
    }
    setConverting(null)
  }

  return (
    <div className="rounded-xl border border-(--border-subtle) bg-(--surface-2) shadow-sm">
      {/* Live refresh status bar */}
      <div className="flex items-center gap-2 border-b border-(--border-subtle) px-4 py-2 text-xs text-(--text-tertiary)">
        <span className="h-2 w-2 shrink-0 rounded-full bg-green-400 animate-pulse" />
        <span>Live · refreshes every 30s{mounted && ` · ${lastRefresh.toLocaleTimeString()}`}</span>
      </div>

      {/* Empty state */}
      {leads.length === 0 && (
        <div className="px-4 py-12 text-center text-sm text-(--text-tertiary)">
          No leads yet. They&apos;ll show up here when the quote form is submitted.
        </div>
      )}

      {/* Mobile cards (hidden md:+) */}
      <ul className="divide-y divide-(--border-subtle) md:hidden">
        {leads.map(lead => {
          const ev = mounted ? emailIndicator(emailEvents[lead.id]) : null
          return (
            <li key={lead.id} className="px-4 py-3">
              {/* Row 1: name + time */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[17px] font-semibold text-(--text-primary) truncate">
                      {lead.name}
                    </span>
                    {lead.is_military && (
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                        ⭐ MIL/FR
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[13px] text-(--text-secondary)">
                    {lead.city || '—'}{lead.zip ? ` · ${lead.zip}` : ''}
                  </div>
                </div>
                <time className="shrink-0 text-[11px] text-(--text-tertiary)">
                  {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </time>
              </div>

              {/* Row 2: service + concrete + timeline chips */}
              <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] text-(--text-secondary)">
                <span className="capitalize">{formatService(lead)}</span>
                {lead.structure_type && <span className="text-(--text-tertiary) capitalize">· {lead.structure_type}</span>}
                {lead.needs_concrete && (
                  <span>· {CONCRETE_LABELS[lead.needs_concrete] ?? lead.needs_concrete}</span>
                )}
                {lead.timeline && (
                  <span>· {TIMELINE_LABELS[lead.timeline] ?? lead.timeline}</span>
                )}
              </div>

              {/* Row 3: message (if any) */}
              {lead.message && (
                <p className="mt-2 text-[13px] text-(--text-secondary) line-clamp-2">
                  {lead.message}
                </p>
              )}

              {/* Row 4: email engagement pill (if any) */}
              {ev && (
                <div className={`mt-2 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${ev.color}`}>
                  <span>{ev.emoji}</span>
                  <span>{ev.label} {relativeTime(emailEvents[lead.id].occurred_at)}</span>
                </div>
              )}

              {/* Row 5: phone (big tap target) + status */}
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={`tel:${lead.phone}`}
                  className="flex-1 min-h-11 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 text-white text-[15px] font-semibold px-3 py-2 active:scale-95 transition-transform"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.33 1.9.63 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.3 1.85.51 2.81.63A2 2 0 0122 16.92z" />
                  </svg>
                  {lead.phone}
                </a>
                <select
                  aria-label={`Lead status for ${lead.name}`}
                  value={lead.status}
                  disabled={updating === lead.id}
                  onChange={e => handleStatusChange(lead.id, e.target.value, lead.status)}
                  className={`min-h-11 rounded-lg px-3 text-xs font-semibold capitalize border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 ${STATUS_STYLES[lead.status] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s} className="bg-white text-gray-800 capitalize">{s}</option>
                  ))}
                </select>
              </div>

              {/* Row 6: convert / delete */}
              <div className="mt-2 flex gap-2">
                {convertedIds.has(lead.id) ? (
                  <span className="px-2 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded">
                    ✓ Customer
                  </span>
                ) : (
                  <button
                    onClick={() => handleConvert(lead)}
                    disabled={converting === lead.id}
                    className="flex-1 min-h-11 rounded-lg bg-(--surface-3) text-(--brand-fg) text-[13px] font-semibold active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {converting === lead.id ? 'Converting…' : '→ Make Customer'}
                  </button>
                )}
                {confirmDeleteId === lead.id ? (
                  <>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      disabled={deleting === lead.id}
                      className="min-h-11 px-3 rounded-lg bg-red-600 text-white text-[13px] font-semibold disabled:opacity-50"
                    >
                      {deleting === lead.id ? '…' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={deleting === lead.id}
                      className="min-h-11 px-3 rounded-lg bg-(--surface-3) text-(--text-secondary) text-[13px] font-semibold"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(lead.id)}
                    aria-label={`Delete lead from ${lead.name}`}
                    className="min-h-11 px-3 rounded-lg text-(--text-tertiary) hover:text-red-600 text-[13px] font-semibold"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {/* Desktop table (hidden below md:) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-(--surface-3) text-(--text-secondary) uppercase text-xs border-b border-(--border-subtle)">
            <tr>
              {['Date', 'Name', 'Phone', 'Location', 'Service', 'Concrete', 'Timeline', 'Notes', 'Status', ''].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border-subtle) text-(--text-primary)">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-(--surface-3) transition-colors">
                <td className="px-4 py-3 text-(--text-tertiary) whitespace-nowrap">
                  {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-semibold">{lead.name}</div>
                  {lead.is_military && (
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">⭐ MIL/FR</span>
                  )}
                  {mounted && (() => {
                    const ind = emailIndicator(emailEvents[lead.id])
                    if (!ind) return null
                    return (
                      <div className={`mt-1 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${ind.color}`}>
                        <span>{ind.emoji}</span>
                        <span>{ind.label} {relativeTime(emailEvents[lead.id].occurred_at)}</span>
                      </div>
                    )
                  })()}
                </td>
                <td className="px-4 py-3">
                  <a href={`tel:${lead.phone}`} className="text-(--brand-fg) hover:underline font-mono whitespace-nowrap">
                    {lead.phone}
                  </a>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>{lead.city || '—'}</div>
                  {lead.zip && <div className="text-xs text-(--text-tertiary)">{lead.zip}</div>}
                </td>
                <td className="px-4 py-3 capitalize whitespace-nowrap">
                  {formatService(lead)}
                  {lead.structure_type && (
                    <div className="text-xs text-(--text-tertiary) capitalize">{lead.structure_type}</div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {lead.needs_concrete ? CONCRETE_LABELS[lead.needs_concrete] ?? lead.needs_concrete : '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {lead.timeline ? TIMELINE_LABELS[lead.timeline] ?? lead.timeline : '—'}
                </td>
                <td className="px-4 py-3 text-(--text-secondary) max-w-[180px] truncate">{lead.message || '—'}</td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Lead status for ${lead.name}`}
                    value={lead.status}
                    disabled={updating === lead.id}
                    onChange={e => handleStatusChange(lead.id, e.target.value, lead.status)}
                    className={`px-2 py-1 rounded-full text-xs font-semibold capitalize border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 ${STATUS_STYLES[lead.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s} className="bg-white text-gray-800 capitalize">{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-1 items-center">
                    {convertedIds.has(lead.id) ? (
                      <span className="px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded">
                        ✓ Customer
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConvert(lead)}
                        disabled={converting === lead.id}
                        className="px-2 py-1 text-xs font-semibold text-(--brand-fg) bg-(--surface-3) hover:opacity-80 rounded transition-colors disabled:opacity-50"
                      >
                        {converting === lead.id ? '...' : '→ Customer'}
                      </button>
                    )}
                    {confirmDeleteId === lead.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          disabled={deleting === lead.id}
                          className="px-2 py-1 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleting === lead.id ? '...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={deleting === lead.id}
                          className="px-2 py-1 text-xs font-semibold rounded bg-(--surface-3) text-(--text-secondary) hover:opacity-80"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(lead.id)}
                        aria-label={`Delete lead from ${lead.name}`}
                        className="px-2 py-1 text-xs font-semibold text-(--text-tertiary) hover:text-red-600 rounded transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
