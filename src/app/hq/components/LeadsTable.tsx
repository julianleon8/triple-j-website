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
  contacted: 'bg-amber-100 text-amber-700',
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
type SmsEvent = { status: string; occurred_at: string }

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
  if (t === 'email.clicked') return { emoji: '🔗', label: 'Clicked', color: 'text-green-700 bg-green-50' }
  if (t === 'email.opened')  return { emoji: '📬', label: 'Opened',  color: 'text-blue-700 bg-blue-50' }
  if (t === 'email.delivered') return { emoji: '📨', label: 'Delivered', color: 'text-gray-600 bg-gray-50' }
  return null
}

function smsIndicator(event?: SmsEvent) {
  if (!event) return null
  const s = event.status
  if (s === 'delivered') return { emoji: '📱', label: 'Delivered', color: 'text-green-700 bg-green-50' }
  if (s === 'sent' || s === 'queued') return { emoji: '📱', label: 'Sent', color: 'text-blue-700 bg-blue-50' }
  if (s === 'failed' || s === 'undelivered') return { emoji: '📱', label: 'Failed', color: 'text-red-700 bg-red-50' }
  return { emoji: '📱', label: s, color: 'text-gray-600 bg-gray-50' }
}

export default function LeadsTable({
  initialLeads,
  emailEvents = {},
  smsEvents = {},
}: {
  initialLeads: Lead[]
  emailEvents?: Record<string, EmailEvent>
  smsEvents?: Record<string, SmsEvent>
}) {
  const [leads, setLeads] = useState(initialLeads)
  const [updating, setUpdating] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [converting, setConverting] = useState<string | null>(null)
  const [convertedIds, setConvertedIds] = useState<Set<string>>(new Set())
  // Gate time-dependent pills behind post-mount render so server and client
  // HTML match exactly (React #418 fires otherwise because Date.now() differs
  // between the SSR pass and hydration).
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
      <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 text-xs text-gray-400">
        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        Live · refreshes every 30s{mounted && ` · last updated ${lastRefresh.toLocaleTimeString()}`}
      </div>
      <table className="w-full text-sm min-w-[900px]">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
          <tr>
            {['Date', 'Name', 'Phone', 'Location', 'Service', 'Concrete', 'Timeline', 'Notes', 'Status', ''].map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.length === 0 && (
            <tr>
              <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                No leads yet. They&apos;ll show up here when the quote form is submitted.
              </td>
            </tr>
          )}
          {leads.map(lead => (
            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="font-semibold">{lead.name}</div>
                {lead.is_military && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">⭐ MIL/FR</span>
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
                {mounted && (() => {
                  const ind = smsIndicator(smsEvents[lead.id])
                  if (!ind) return null
                  return (
                    <div className={`mt-1 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${ind.color}`}>
                      <span>{ind.emoji}</span>
                      <span>{ind.label} {relativeTime(smsEvents[lead.id].occurred_at)}</span>
                    </div>
                  )
                })()}
              </td>
              <td className="px-4 py-3">
                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline font-mono whitespace-nowrap">
                  {lead.phone}
                </a>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div>{lead.city || '—'}</div>
                {lead.zip && <div className="text-xs text-gray-400">{lead.zip}</div>}
              </td>
              <td className="px-4 py-3 capitalize whitespace-nowrap">
                {lead.service_type.replace('_', ' ')}
                {lead.structure_type && (
                  <div className="text-xs text-gray-400 capitalize">{lead.structure_type}</div>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                {lead.needs_concrete ? CONCRETE_LABELS[lead.needs_concrete] ?? lead.needs_concrete : '—'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                {lead.timeline ? TIMELINE_LABELS[lead.timeline] ?? lead.timeline : '—'}
              </td>
              <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{lead.message || '—'}</td>
              <td className="px-4 py-3">
                <select
                  aria-label={`Lead status for ${lead.name}`}
                  value={lead.status}
                  disabled={updating === lead.id}
                  onChange={e => handleStatusChange(lead.id, e.target.value, lead.status)}
                  className={`px-2 py-1 rounded-full text-xs font-semibold capitalize border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 ${STATUS_STYLES[lead.status] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s} className="bg-white text-gray-800 capitalize">{s}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex gap-1 items-center">
                  {convertedIds.has(lead.id) ? (
                    <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-50 rounded">
                      ✓ Customer
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConvert(lead)}
                      disabled={converting === lead.id}
                      className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
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
                        className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(lead.id)}
                      aria-label={`Delete lead from ${lead.name}`}
                      className="px-2 py-1 text-xs font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
  )
}
