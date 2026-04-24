'use client'

import Link from 'next/link'
import type { ComponentType } from 'react'
import { FileText, Hammer, UserPlus } from 'lucide-react'

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

export type TimelineLead = {
  id: string
  created_at: string
  status: string
  service_type: string | null
  message: string | null
} | null

export type TimelineQuote = {
  id: string
  created_at: string
  quote_number: string
  status: string
  total: number | null
}

export type TimelineJob = {
  id: string
  created_at: string
  job_number: string
  status: string
  job_type: string | null
  scheduled_date: string | null
}

type Entry = {
  key: string
  at: string
  href: string
  icon: IconComponent
  iconBg: string
  title: string
  subtitle: string
}

export function ActivityTimeline({
  lead,
  quotes,
  jobs,
}: {
  lead: TimelineLead
  quotes: TimelineQuote[]
  jobs: TimelineJob[]
}) {
  const entries: Entry[] = []

  if (lead) {
    entries.push({
      key: `lead-${lead.id}`,
      at: lead.created_at,
      href: `/hq/leads/${lead.id}`,
      icon: UserPlus,
      iconBg: 'bg-blue-500',
      title: 'Lead received',
      subtitle: [lead.service_type?.replace(/_/g, ' '), lead.status].filter(Boolean).join(' · ') || 'Lead',
    })
  }

  for (const q of quotes) {
    entries.push({
      key: `quote-${q.id}`,
      at: q.created_at,
      href: `/hq/quotes/${q.id}`,
      icon: FileText,
      iconBg: 'bg-amber-500',
      title: `Quote #${q.quote_number}`,
      subtitle: [q.status, q.total != null ? money(q.total) : null].filter(Boolean).join(' · '),
    })
  }

  for (const j of jobs) {
    entries.push({
      key: `job-${j.id}`,
      at: j.created_at,
      href: `/hq/jobs/${j.id}`,
      icon: Hammer,
      iconBg: 'bg-rose-500',
      title: `Job #${j.job_number}`,
      subtitle: [j.status.replace(/_/g, ' '), j.job_type, j.scheduled_date ? formatDate(j.scheduled_date) : null].filter(Boolean).join(' · '),
    })
  }

  entries.sort((a, b) => (a.at < b.at ? 1 : -1))

  if (entries.length === 0) {
    return (
      <section aria-label="Activity timeline" className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-8 text-center">
        <p className="text-[14px] text-(--text-secondary)">No activity yet.</p>
      </section>
    )
  }

  return (
    <section aria-label="Activity timeline" className="space-y-2">
      <h2 className="px-1 text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
        Activity
      </h2>
      <ul className="divide-y divide-(--border-subtle) overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-2)">
        {entries.map((e) => {
          const Icon = e.icon
          return (
            <li key={e.key}>
              <Link href={e.href} className="flex items-start gap-3 px-4 py-3 active:bg-(--surface-3) transition-colors">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${e.iconBg}`}>
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-(--text-primary) truncate">{e.title}</p>
                  <p className="mt-0.5 text-[13px] text-(--text-secondary) truncate">{e.subtitle || '—'}</p>
                </div>
                <span className="shrink-0 text-[12px] text-(--text-tertiary) tabular-nums">
                  {formatRelative(e.at)}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diffMs = Date.now() - t
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function money(n: number): string {
  return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}
