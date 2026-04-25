'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

export type EmailEventRow = {
  id: string
  event_type: string
  email_type: string | null
  to_email: string | null
  subject: string | null
  lead_id: string | null
  quote_id: string | null
  click_link: string | null
  occurred_at: string
}

type FilterKey = 'all' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained'

const FILTERS: { key: FilterKey; label: string; match: (ev: string) => boolean }[] = [
  { key: 'all',        label: 'All',        match: () => true },
  { key: 'sent',       label: 'Sent',       match: (t) => t === 'email.sent' },
  { key: 'delivered',  label: 'Delivered',  match: (t) => t === 'email.delivered' },
  { key: 'opened',     label: 'Opened',     match: (t) => t === 'email.opened' },
  { key: 'clicked',    label: 'Clicked',    match: (t) => t === 'email.clicked' },
  { key: 'bounced',    label: 'Bounced',    match: (t) => t === 'email.bounced' },
  { key: 'complained', label: 'Complained', match: (t) => t === 'email.complained' },
]

const TONE: Record<string, string> = {
  'email.sent':       'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
  'email.delivered':  'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  'email.opened':     'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  'email.clicked':    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  'email.bounced':    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  'email.complained': 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
}

function relative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const days = Math.floor(ms / 86400_000)
  if (days >= 1) return `${days}d`
  const hrs = Math.floor(ms / 3600_000)
  if (hrs >= 1)  return `${hrs}h`
  const mins = Math.floor(ms / 60_000)
  if (mins >= 1) return `${mins}m`
  return 'now'
}

function shortType(eventType: string): string {
  return eventType.replace('email.', '')
}

export function EventsTable({ rows }: { rows: EmailEventRow[] }) {
  const [filter, setFilter] = useState<FilterKey>('all')

  const filtered = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter) ?? FILTERS[0]
    return rows.filter((r) => f.match(r.event_type))
  }, [rows, filter])

  return (
    <div className="space-y-3">
      {/* Filter pills */}
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none' }}
        aria-label="Filter events"
      >
        {FILTERS.map(({ key, label, match }) => {
          const active = filter === key
          const count = rows.filter((r) => match(r.event_type)).length
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                active
                  ? 'bg-(--brand-fg) text-white'
                  : 'bg-(--surface-2) text-(--text-secondary) hover:text-(--text-primary)'
              }`}
              aria-pressed={active}
            >
              {label}
              <span className={`ml-1.5 text-[10px] ${active ? 'text-white/70' : 'text-(--text-tertiary)'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-(--border-subtle) bg-(--surface-2) p-8 text-center">
          <p className="text-sm text-(--text-secondary)">No events match this filter.</p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-(--border-subtle) bg-(--surface-2) divide-y divide-(--border-subtle)">
          {filtered.map((ev) => {
            const related = ev.lead_id
              ? { href: '/hq', label: 'lead' }
              : ev.quote_id
                ? { href: `/hq/quotes/${ev.quote_id}`, label: 'quote' }
                : null
            return (
              <li key={ev.id} className="px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TONE[ev.event_type] ?? TONE['email.sent']}`}>
                    {shortType(ev.event_type)}
                  </span>
                  <span className="text-[13px] text-(--text-secondary) truncate min-w-0 flex-1">
                    {ev.to_email ?? '—'}
                  </span>
                  <time className="shrink-0 text-[11px] text-(--text-tertiary)">{relative(ev.occurred_at)}</time>
                </div>
                {ev.subject && (
                  <p className="mt-1 text-[13px] text-(--text-primary) truncate">{ev.subject}</p>
                )}
                <div className="mt-1 flex items-center gap-2 text-[11px] text-(--text-tertiary)">
                  {ev.email_type && <span>{ev.email_type}</span>}
                  {related && (
                    <Link href={related.href} className="text-(--brand-fg) hover:underline">
                      Open {related.label} →
                    </Link>
                  )}
                  {ev.click_link && (
                    <span className="truncate">↳ {ev.click_link}</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
