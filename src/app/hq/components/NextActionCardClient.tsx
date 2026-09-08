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
      className="relative overflow-hidden rounded-md border border-(--border-subtle) bg-(--surface-2) p-4 pl-5"
    >
      {/* 5px status accent, not a tinted card — the same absolutely positioned
          bar the cold-lead rows use. */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[5px] bg-hq-red"
      />

      <div className="flex items-start justify-between gap-3">
        <span className="font-display text-[13px] font-bold uppercase tracking-[0.08em] text-hq-red">
          Call next
          <span className="ml-2 font-mono text-[11px] tracking-[0.04em]">{reason}</span>
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 font-mono text-[11px] uppercase tracking-[0.04em] text-(--text-tertiary) underline-offset-4 hover:underline"
        >
          Dismiss
        </button>
      </div>

      <h2 className="mt-2 truncate font-display text-[32px] font-bold uppercase leading-none tracking-[0.02em] text-(--text-primary)">
        {row.primary}
      </h2>
      <p className="mt-1.5 truncate text-[14px] text-(--text-secondary)">{row.secondary}</p>

      <div className="mt-4 flex items-center gap-2">
        {callHref ? (
          <a
            href={callHref}
            onClick={tap}
            className="inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-md bg-(--brand-fg) text-[17px] font-bold uppercase tracking-[0.04em] text-(--text-on-brand) tap-solid"
          >
            <Phone size={17} strokeWidth={2.2} /> Call
          </a>
        ) : null}
        <Link
          href={row.href}
          onClick={tap}
          aria-label={`Open ${row.primary}`}
          className="inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-md border border-(--border-strong) text-(--link-fg) tap-solid"
        >
          <ArrowRight size={20} strokeWidth={2.2} />
        </Link>
      </div>
    </section>
  )
}

function EmptyState() {
  return (
    <section
      aria-label="Next action"
      className="rounded-md border border-(--border-subtle) bg-(--surface-2) p-5 text-center"
    >
      <p className="font-display text-[19px] font-bold uppercase tracking-[0.04em] text-(--text-primary)">
        You&apos;re caught up
      </p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.04em] text-(--text-tertiary)">
        Nothing urgent right now
      </p>
    </section>
  )
}

function rowKey(row: PipelineRow): string {
  return `${row.kind}:${row.id}`
}
