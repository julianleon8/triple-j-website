'use client'

import { useState } from 'react'

type Tone = 'success' | 'error' | 'idle'
type CardState = { tone: Tone; msg: string } | null

type ActionCardProps = {
  title: string
  description: string
  primaryLabel: string
  onPrimary: () => Promise<string>
  primaryTone?: 'brand' | 'amber' | 'red'
  extra?: React.ReactNode
}

function ActionCard({ title, description, primaryLabel, onPrimary, primaryTone = 'brand', extra }: ActionCardProps) {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<CardState>(null)

  async function handle() {
    if (busy) return
    setBusy(true)
    setResult(null)
    try {
      const msg = await onPrimary()
      setResult({ tone: 'success', msg })
    } catch (err) {
      setResult({ tone: 'error', msg: err instanceof Error ? err.message : 'Failed' })
    } finally {
      setBusy(false)
      setTimeout(() => setResult(null), 10_000)
    }
  }

  const primaryClass = {
    brand: 'bg-(--brand-fg) hover:bg-(--brand-fg-hover) text-white',
    amber: 'bg-amber-500 hover:bg-amber-400 text-black',
    red:   'bg-red-600 hover:bg-red-700 text-white',
  }[primaryTone]

  return (
    <div className="rounded-xl border border-(--border-subtle) bg-(--surface-2) p-4 space-y-3">
      <div>
        <h3 className="text-[15px] font-semibold text-(--text-primary)">{title}</h3>
        <p className="mt-0.5 text-[13px] text-(--text-secondary)">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handle}
          disabled={busy}
          className={`min-h-10 px-4 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50 ${primaryClass}`}
        >
          {busy ? '…' : primaryLabel}
        </button>
        {extra}
      </div>
      {result && (
        <p
          className={`text-[12px] ${
            result.tone === 'success'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {result.msg}
        </p>
      )}
    </div>
  )
}

export function TestActions() {
  const [lastLeadId, setLastLeadId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function deleteLastLead() {
    if (!lastLeadId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/leads/${lastLeadId}`, { method: 'DELETE' })
      if (res.ok) setLastLeadId(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <ActionCard
        title="Send test push"
        description="Sends a sample notification to every registered device."
        primaryLabel="Send test push"
        onPrimary={async () => {
          const res = await fetch('/api/push/test', { method: 'POST' })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(data.error ?? `Failed (${res.status})`)
          if (data.vapid === false) throw new Error('VAPID keys not configured')
          if (data.sent === 0) return 'No subscriptions to reach. Enable notifications on this device first.'
          return `Sent to ${data.sent} device${data.sent === 1 ? '' : 's'}${data.pruned > 0 ? ` · pruned ${data.pruned}` : ''}`
        }}
      />

      <ActionCard
        title="Create test lead"
        description="Inserts a marker lead with timeline=asap so it triggers the ⚡ HOT lead push."
        primaryLabel="Create test lead"
        primaryTone="amber"
        onPrimary={async () => {
          const res = await fetch('/api/test/lead', { method: 'POST' })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(data.error ?? `Failed (${res.status})`)
          setLastLeadId(data.id)
          return `Created lead "${data.name}" — push fired in background.`
        }}
        extra={
          lastLeadId && (
            <button
              type="button"
              onClick={deleteLastLead}
              disabled={deleting}
              className="min-h-10 px-3 rounded-lg text-[13px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
            >
              {deleting ? '…' : 'Delete last test lead'}
            </button>
          )
        }
      />

      <ActionCard
        title="Run permit scraper"
        description="Scrapes every enabled jurisdiction now (normally runs daily at 14:00 UTC)."
        primaryLabel="Run scrape"
        onPrimary={async () => {
          const res = await fetch('/api/cron/scrape-permits', { method: 'POST' })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(data.error ?? `Failed (${res.status})`)
          const summary = data.summary ?? {}
          const parts: string[] = []
          let totalInserted = 0
          for (const [j, s] of Object.entries(summary as Record<string, { inserted: number; errors: string[] }>)) {
            totalInserted += s.inserted
            if (s.inserted > 0) parts.push(`${j.replace(/_/g, ' ')}: +${s.inserted}`)
            else if (s.errors?.length) parts.push(`${j.replace(/_/g, ' ')}: error`)
          }
          return `${totalInserted} new permit${totalInserted === 1 ? '' : 's'}${parts.length ? ' — ' + parts.join(', ') : ''}`
        }}
      />
    </div>
  )
}
