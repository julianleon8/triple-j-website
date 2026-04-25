'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

type Row = {
  id: string
  crew_member: string
  work_date: string
  hours: number
  hourly_rate: number | null
  flat_amount: number | null
  total_cost: number
  notes: string | null
}

export function TimeEntryRow({ row }: { row: Row }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (deleting) return
    if (!confirm('Delete this time entry?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/hq/time-entries?id=${row.id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  const rateLine = row.flat_amount != null
    ? `Flat $${row.flat_amount}`
    : row.hourly_rate != null
      ? `${row.hours}h × $${row.hourly_rate}/h`
      : `${row.hours}h`

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl bg-(--surface-1) px-3 py-2">
      <div className="min-w-0">
        <div className="truncate text-[13px] text-(--text-primary)">
          {formatDate(row.work_date)} · {rateLine}
        </div>
        {row.notes ? (
          <div className="truncate text-[11px] text-(--text-tertiary)">{row.notes}</div>
        ) : null}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[14px] font-semibold tabular-nums text-(--text-primary)">
          ${Number(row.total_cost).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg p-1.5 text-(--text-tertiary) hover:bg-(--surface-2) hover:text-red-500 disabled:opacity-50"
          aria-label="Delete time entry"
        >
          <Trash2 size={14} strokeWidth={2} />
        </button>
      </div>
    </li>
  )
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
