'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Phone, ArrowRight } from 'lucide-react'
import type { PipelineRow } from '@/lib/pipeline'
import { useHaptics } from '@/lib/hq/haptics'

const DISMISSED_KEY = 'hq_next_action_dismissed'

function loadDismissed(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.sessionStorage.getItem(DISMISSED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveDismissed(set: Set<string>) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]))
  } catch {
    // sessionStorage may be unavailable in private mode — ignore
  }
}

export type NextActionPayload = {
  row: PipelineRow
  reason: string
  callHref: string | null
}

export function NextActionCardClient({ payload }: { payload: NextActionPayload | null }) {
  const { tap, success } = useHaptics()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setDismissed(loadDismissed())
    setHydrated(true)
  }, [])

  if (!payload) return <EmptyState />

  const { row, reason, callHref } = payload
  const isDismissed = hydrated && dismissed.has(rowKey(row))
  if (isDismissed) return <EmptyState />

  function onDismiss() {
    success()
    setDismissed((prev) => {
      const next = new Set(prev)
      next.add(rowKey(row))
      saveDismissed(next)
      return next
    })
  }

  return (
    <section
      aria-label="Next action"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1851b5] to-[#0d2f5c] p-5 text-white shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white/95">
          {reason}
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[12px] font-semibold text-white/70 active:text-white/100 underline-offset-4 hover:underline"
        >
          Dismiss
        </button>
      </div>
      <h2 className="mt-3 text-[22px] font-bold leading-tight tracking-tight truncate">
        {row.primary}
      </h2>
      <p className="mt-1 text-[14px] text-white/80 truncate">{row.secondary}</p>
      <div className="mt-4 flex items-center gap-2">
        {callHref ? (
          <a
            href={callHref}
            onClick={tap}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-2.5 text-[15px] font-bold text-[#12407a] tap-solid"
          >
            <Phone size={16} strokeWidth={2} /> Call
          </a>
        ) : null}
        <Link
          href={row.href}
          onClick={tap}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white/15 py-2.5 text-[15px] font-bold text-white tap-solid"
        >
          Open <ArrowRight size={16} strokeWidth={2} />
        </Link>
      </div>
    </section>
  )
}

function EmptyState() {
  return (
    <section
      aria-label="Next action"
      className="rounded-3xl border border-(--border-subtle) bg-(--surface-2) p-5 text-center"
    >
      <p className="text-[17px] font-semibold text-(--text-primary)">You're caught up.</p>
      <p className="mt-1 text-[13px] text-(--text-secondary)">
        Nothing urgent right now. New activity will show up here.
      </p>
    </section>
  )
}

function rowKey(row: PipelineRow): string {
  return `${row.kind}:${row.id}`
}
