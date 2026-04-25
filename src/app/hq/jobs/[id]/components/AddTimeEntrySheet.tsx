'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useHaptics } from '@/lib/hq/haptics'

const DEFAULT_CREW = ['Freddy', 'Julian', 'Juan'] as const

type RateMode = 'hourly' | 'flat'

type Props = {
  jobId: string
  children: ReactNode
}

function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function AddTimeEntrySheet({ jobId, children }: Props) {
  const router = useRouter()
  const haptics = useHaptics()
  const [open, setOpen] = useState(false)
  const [crew, setCrew] = useState<string>(DEFAULT_CREW[0])
  const [customCrew, setCustomCrew] = useState('')
  const [workDate, setWorkDate] = useState(todayIso())
  const [hours, setHours] = useState('')
  const [mode, setMode] = useState<RateMode>('hourly')
  const [rate, setRate] = useState('')
  const [flat, setFlat] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setCrew(DEFAULT_CREW[0])
    setCustomCrew('')
    setWorkDate(todayIso())
    setHours('')
    setMode('hourly')
    setRate('')
    setFlat('')
    setNotes('')
    setError(null)
  }

  async function save() {
    const finalCrew = crew === '_custom' ? customCrew.trim() : crew
    if (!finalCrew) {
      setError('Crew member is required')
      return
    }
    const h = Number(hours)
    if (!Number.isFinite(h) || h < 0) {
      setError('Hours must be 0 or more')
      return
    }
    const payload: Record<string, unknown> = {
      job_id: jobId,
      crew_member: finalCrew,
      work_date: workDate,
      hours: h,
    }
    if (mode === 'hourly') {
      const r = Number(rate)
      if (!Number.isFinite(r) || r <= 0 || h <= 0) {
        setError('Hourly rate × hours must be > 0')
        return
      }
      payload.hourly_rate = r
    } else {
      const f = Number(flat)
      if (!Number.isFinite(f) || f <= 0) {
        setError('Flat amount must be > 0')
        return
      }
      payload.flat_amount = f
    }
    if (notes.trim()) payload.notes = notes.trim()

    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/hq/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(typeof body?.error === 'string' ? body.error : 'Failed to save')
      }
      haptics.success()
      reset()
      setOpen(false)
      router.refresh()
    } catch (err) {
      haptics.error()
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="contents">
        {children}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-time-title"
            className="relative w-full max-w-md rounded-t-2xl bg-(--surface-1) p-5 shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 id="add-time-title" className="text-[18px] font-bold text-(--text-primary)">
                Add time entry
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-(--text-tertiary) hover:bg-(--surface-2)"
                aria-label="Close"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <label className="mt-4 block">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                Crew member
              </span>
              <select
                value={crew}
                onChange={(e) => setCrew(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-3 text-[15px] text-(--text-primary) outline-none focus:border-(--brand-fg)"
              >
                {DEFAULT_CREW.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="_custom">+ Add new…</option>
              </select>
            </label>

            {crew === '_custom' ? (
              <input
                type="text"
                value={customCrew}
                onChange={(e) => setCustomCrew(e.target.value)}
                placeholder="Crew member name"
                className="mt-2 w-full rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-3 text-[15px] text-(--text-primary) outline-none focus:border-(--brand-fg)"
              />
            ) : null}

            <div className="mt-3 grid grid-cols-2 gap-2">
              <label>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                  Date
                </span>
                <input
                  type="date"
                  value={workDate}
                  onChange={(e) => setWorkDate(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-3 text-[15px] text-(--text-primary) outline-none focus:border-(--brand-fg)"
                />
              </label>
              <label>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                  Hours
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.25"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="8"
                  className="mt-1.5 block w-full rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-3 text-[15px] text-(--text-primary) outline-none focus:border-(--brand-fg)"
                />
              </label>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-(--surface-2) p-1">
              <button
                type="button"
                onClick={() => setMode('hourly')}
                className={`rounded-lg px-3 py-2 text-[13px] font-semibold ${
                  mode === 'hourly'
                    ? 'bg-(--surface-1) text-(--text-primary) shadow-sm'
                    : 'text-(--text-secondary)'
                }`}
              >
                Hourly
              </button>
              <button
                type="button"
                onClick={() => setMode('flat')}
                className={`rounded-lg px-3 py-2 text-[13px] font-semibold ${
                  mode === 'flat'
                    ? 'bg-(--surface-1) text-(--text-primary) shadow-sm'
                    : 'text-(--text-secondary)'
                }`}
              >
                Flat
              </button>
            </div>

            {mode === 'hourly' ? (
              <label className="mt-3 block">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                  Hourly rate
                </span>
                <div className="mt-1.5 flex items-center rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 focus-within:border-(--brand-fg)">
                  <span className="text-[15px] text-(--text-tertiary)">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="35.00"
                    className="w-full bg-transparent px-2 py-3 text-[15px] text-(--text-primary) outline-none"
                  />
                  <span className="text-[13px] text-(--text-tertiary)">/h</span>
                </div>
              </label>
            ) : (
              <label className="mt-3 block">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                  Flat amount
                </span>
                <div className="mt-1.5 flex items-center rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 focus-within:border-(--brand-fg)">
                  <span className="text-[15px] text-(--text-tertiary)">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={flat}
                    onChange={(e) => setFlat(e.target.value)}
                    placeholder="280.00"
                    className="w-full bg-transparent px-2 py-3 text-[15px] text-(--text-primary) outline-none"
                  />
                </div>
              </label>
            )}

            <label className="mt-3 block">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                Notes <span className="font-normal normal-case tracking-normal text-(--text-tertiary)">(optional)</span>
              </span>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Welding frame · prep concrete pad…"
                className="mt-1.5 w-full rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-2.5 text-[14px] text-(--text-primary) outline-none focus:border-(--brand-fg)"
              />
            </label>

            {error ? (
              <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-[13px] text-red-600 dark:text-red-300">
                {error}
              </p>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-3 text-[14px] font-semibold text-(--text-primary) tap-list"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-(--brand-fg) px-3 py-3 text-[14px] font-semibold text-white tap-solid disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
