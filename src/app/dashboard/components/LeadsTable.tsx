'use client'

import { useState } from 'react'

type Lead = {
  id: string
  created_at: string
  name: string
  phone: string
  city: string | null
  service_type: string
  structure_type: string | null
  message: string | null
  status: string
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  quoted: 'bg-purple-100 text-purple-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
}

const STATUS_OPTIONS = ['new', 'contacted', 'quoted', 'won', 'lost']

export default function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [updating, setUpdating] = useState<string | null>(null)

  const handleStatusChange = async (id: string, newStatus: string, prevStatus: string) => {
    setUpdating(id)
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))

    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!res.ok) {
      // Revert on error
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: prevStatus } : l))
    }

    setUpdating(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
          <tr>
            {['Date', 'Name', 'Phone', 'City', 'Service', 'Type', 'Message', 'Status'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                No leads yet. They&apos;ll show up here as soon as someone fills out the quote form.
              </td>
            </tr>
          )}
          {leads.map(lead => (
            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </td>
              <td className="px-4 py-3 font-semibold">{lead.name}</td>
              <td className="px-4 py-3">
                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline font-mono">
                  {lead.phone}
                </a>
              </td>
              <td className="px-4 py-3">{lead.city || '—'}</td>
              <td className="px-4 py-3 capitalize">{lead.service_type}</td>
              <td className="px-4 py-3 capitalize">{lead.structure_type || '—'}</td>
              <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{lead.message || '—'}</td>
              <td className="px-4 py-3">
                <select
                  value={lead.status}
                  disabled={updating === lead.id}
                  onChange={e => handleStatusChange(lead.id, e.target.value, lead.status)}
                  className={`px-2 py-1 rounded-full text-xs font-semibold capitalize border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 ${STATUS_STYLES[lead.status] ?? 'bg-gray-100 text-gray-600'}`}
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
