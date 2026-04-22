'use client'

import { useState, useEffect } from 'react'

type Lead = {
  id: string
  created_at: string
  name: string
  phone: string
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

export default function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [updating, setUpdating] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
      <div className="flex flex-col gap-1 border-b border-gray-100 px-4 py-2 text-xs text-gray-400 sm:flex-row sm:items-center sm:gap-2">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-green-400 animate-pulse" />
          Live · refreshes every 30s · last updated {lastRefresh.toLocaleTimeString()}
        </span>
        <span className="text-[11px] text-gray-400 sm:ml-auto sm:text-xs md:hidden">
          Swipe the table sideways to see all columns.
        </span>
      </div>
      <table className="w-full text-sm min-w-[900px]">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
          <tr>
            {['Date', 'Name', 'Phone', 'Location', 'Service', 'Concrete', 'Timeline', 'Notes', 'Status'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
