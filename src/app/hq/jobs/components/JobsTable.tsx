'use client'

import { useState } from 'react'

type Job = {
  id: string
  job_number: string
  status: string
  job_type: string
  city: string | null
  scheduled_date: string | null
  balance_due: number
  customers: { name: string } | null
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  on_hold: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_OPTIONS = ['scheduled', 'in_progress', 'completed', 'on_hold', 'cancelled']

export default function JobsTable({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState(initialJobs)
  const [updating, setUpdating] = useState<string | null>(null)

  const handleStatusChange = async (id: string, newStatus: string, prevStatus: string) => {
    setUpdating(id)
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus } : j))

    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!res.ok) {
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: prevStatus } : j))
    }

    setUpdating(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
          <tr>
            {['Job #', 'Customer', 'Status', 'Type', 'City', 'Scheduled', 'Balance Due'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {jobs.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                No jobs yet. Jobs are created automatically when a customer accepts a quote.
              </td>
            </tr>
          )}
          {jobs.map(job => (
            <tr key={job.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{job.job_number}</td>
              <td className="px-4 py-3 font-semibold">{job.customers?.name ?? '—'}</td>
              <td className="px-4 py-3">
                <select
                  value={job.status}
                  disabled={updating === job.id}
                  onChange={e => handleStatusChange(job.id, e.target.value, job.status)}
                  className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 ${STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s} className="bg-white text-gray-800">{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 capitalize">{job.job_type}</td>
              <td className="px-4 py-3">{job.city || '—'}</td>
              <td className="px-4 py-3 text-gray-500">
                {job.scheduled_date
                  ? new Date(job.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'}
              </td>
              <td className="px-4 py-3 font-semibold">
                {job.balance_due > 0
                  ? <span className="text-red-600">${job.balance_due.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  : <span className="text-green-600">Paid</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
