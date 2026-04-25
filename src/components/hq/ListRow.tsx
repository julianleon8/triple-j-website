import Link from 'next/link'
import type { PipelineBadge, PipelineKind, PipelineRow, PipelineTrailing } from '@/lib/pipeline'

/**
 * iOS Messages-style row.
 * - Leading: 40×40 circular avatar with initials on kind-colored bg
 * - 2-line: bold primary + dimmed secondary
 * - Trailing top: relative timestamp
 * - Trailing bottom: status pill / score / amount / unread dot / chevron (per kind)
 *
 * Dark-mode aware via semantic tokens. 64px min-height (Apple HIG).
 */
export function ListRow({ row }: { row: PipelineRow }) {
  const unread = isUnreadLead(row)
  return (
    <Link
      href={row.href}
      className="flex items-center gap-3 px-4 py-3 min-h-16 bg-(--surface-2) tap-list"
    >
      <Avatar row={row} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[17px] font-semibold text-(--text-primary) truncate">
            {row.primary}
          </span>
          {row.badges?.map((b, i) => <Badge key={i} badge={b} />)}
        </div>
        <p className="mt-0.5 text-[13px] text-(--text-secondary) truncate">
          {row.secondary}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[12px] text-(--text-tertiary) tabular-nums">
          {formatRelative(row.created_at)}
        </span>
        <TrailingSlot row={row} unread={unread} />
      </div>
    </Link>
  )
}

// ── Leading avatar with initials ───────────────────────────────────────────

const KIND_STYLE: Record<PipelineKind, { bg: string; fallback: string }> = {
  lead:     { bg: 'bg-blue-500',    fallback: 'L' },
  permit:   { bg: 'bg-purple-500',  fallback: 'P' },
  customer: { bg: 'bg-green-500',   fallback: 'C' },
  quote:    { bg: 'bg-amber-500',   fallback: 'Q' },
  job:      { bg: 'bg-rose-500',    fallback: 'J' },
}

function Avatar({ row }: { row: PipelineRow }) {
  const { bg, fallback } = KIND_STYLE[row.kind]
  const initials = initialsFrom(row.primary, fallback)
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-[14px] font-bold ${bg}`}>
      {initials}
    </div>
  )
}

function initialsFrom(primary: string, fallback: string): string {
  const letters = primary
    .split(/\s+/)
    .map((w) => w[0])
    .filter((c): c is string => !!c && /[A-Za-z]/.test(c))
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return letters || fallback
}

// ── Badges (small pills next to primary) ────────────────────────────────────

const BADGE_TONE: Record<PipelineBadge['tone'], string> = {
  hot:      'bg-red-500 text-white',
  asap:     'bg-amber-500 text-white',
  mil:      'bg-blue-500 text-white',
  today:    'bg-emerald-500 text-white',
  new:      'bg-sky-500 text-white',
  featured: 'bg-amber-400 text-black',
  warn:     'bg-orange-500 text-white',
}

function Badge({ badge }: { badge: PipelineBadge }) {
  return (
    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${BADGE_TONE[badge.tone]}`}>
      {badge.text}
    </span>
  )
}

// ── Trailing slot ───────────────────────────────────────────────────────────

function TrailingSlot({ row, unread }: { row: PipelineRow; unread: boolean }) {
  if (unread) return <UnreadDot />
  const trailing: PipelineTrailing | undefined = row.trailing
  if (!trailing) return <Chevron />
  switch (trailing.type) {
    case 'status':
      // For leads that aren't "new", the status pill feels loud next to the timestamp.
      // Drop it for leads; keep for other kinds (permits).
      if (row.kind === 'lead') return <Chevron />
      return (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${trailing.statusClass}`}>
          {trailing.value}
        </span>
      )
    case 'score':
      return <ScoreBadge score={trailing.value} />
    case 'amount':
      return (
        <span className="text-[15px] font-semibold text-(--text-primary) tabular-nums">
          {trailing.value}
        </span>
      )
    case 'chevron':
      return <Chevron />
  }
}

function isUnreadLead(row: PipelineRow): boolean {
  if (row.kind !== 'lead') return false
  if (!row.trailing || row.trailing.type !== 'status') return false
  return row.trailing.value === 'new'
}

function UnreadDot() {
  return <span className="h-2.5 w-2.5 rounded-full bg-(--brand-fg)" aria-label="Unread" />
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 8 ? 'bg-red-500 text-white' :
    score >= 6 ? 'bg-amber-500 text-white' :
    score >= 4 ? 'bg-yellow-400 text-black' :
                 'bg-gray-300 text-gray-700 dark:bg-white/10 dark:text-gray-300'
  return (
    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${tone}`}>
      {score}
    </div>
  )
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-(--text-tertiary)">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

// ── Relative time helper ────────────────────────────────────────────────────

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
