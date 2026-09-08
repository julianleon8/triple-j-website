import Link from 'next/link'
import { Pencil } from 'lucide-react'
import type { PipelineRow } from '@/lib/pipeline'
import { isCold } from '@/lib/pipeline'
import { ColdBanner } from './ColdBanner'

/**
 * iOS Messages-style row — circular initials avatar, bold primary, 2-line
 * secondary preview, relative timestamp, unread dot for new leads. Shows a
 * red left-edge bar + ColdBanner above the row when the row is a cold lead.
 *
 * Used by the Leads tab, Customers tab, and Today's Needs Attention feed.
 */
export function MessagesRow({ row }: { row: PipelineRow }) {
  const draft = row.isDraft === true
  const cold = !draft && isCold(row)
  const unread = isUnreadLead(row)
  const avatarBg = AVATAR_COLORS[hashPick(row.primary || row.id)]
  const initials = initialsFrom(row.primary)

  return (
    <div>
      {cold && <ColdBanner ageHours={hoursSince(row.created_at)} />}
      <Link
        href={row.href}
        prefetch
        className={`relative flex items-start gap-3 px-4 py-3 min-h-16 tap-list ${
          draft ? 'bg-(--surface-3)' : 'bg-(--surface-2)'
        }`}
      >
        {cold && (
          <span aria-hidden="true" className="absolute left-0 top-0 h-full w-1 bg-(--urgent-bg)" />
        )}
        {draft && (
          <span aria-hidden="true" className="absolute left-0 top-0 h-full w-1 bg-(--brand-fg)" />
        )}
        {draft ? (
          // A dashed tile instead of initials. This also sidesteps the null-name
          // path entirely: initialsFrom() never sees a row without a name.
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-(--hq-hairline) text-(--brand-fg)">
            <Pencil size={16} strokeWidth={2.2} aria-hidden="true" />
          </div>
        ) : (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white text-[14px] font-bold ${avatarBg}`}>
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[17px] font-semibold text-(--text-primary) truncate">
              {row.primary}
            </span>
            {row.badges?.map((b, i) => (
              <span key={i} className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${BADGE_TONE[b.tone]}`}>
                {b.text}
              </span>
            ))}
          </div>
          {draft ? (
            <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-(--text-secondary)">
              {row.meta?.phone ? 'Draft · phone + notes' : 'Draft · needs a phone'}
            </p>
          ) : (
            <p className="mt-0.5 text-[13px] text-(--text-secondary) line-clamp-2">
              {row.secondary}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {draft ? (
            <span className="rounded-sm bg-(--brand-fg) px-3 py-1.5 font-display text-[15px] font-bold uppercase tracking-[0.06em] text-(--text-on-brand)">
              Finish
            </span>
          ) : null}
          <span className="text-[12px] text-(--text-tertiary) tabular-nums">
            {formatRelative(row.created_at)}
          </span>
          {!draft && unread && (
            <span className="h-2.5 w-2.5 rounded-full bg-(--brand-fg)" aria-label="Unread" />
          )}
        </div>
      </Link>
    </div>
  )
}

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-teal-500',
  'bg-fuchsia-500',
] as const

const BADGE_TONE: Record<string, string> = {
  hot:      'bg-red-500 text-white',
  // White on amber-500 is ~2.1:1. `featured` below already had this right.
  asap:     'bg-amber-500 text-black',
  mil:      'bg-blue-500 text-white',
  today:    'bg-emerald-500 text-white',
  new:      'bg-sky-500 text-white',
  featured: 'bg-amber-400 text-black',
  warn:     'bg-orange-500 text-white',
}

function hashPick(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h) % AVATAR_COLORS.length
}

function initialsFrom(primary: string): string {
  const letters = primary
    .split(/\s+/)
    .map((w) => w[0])
    .filter((c): c is string => !!c && /[A-Za-z]/.test(c))
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return letters || '•'
}

function hoursSince(iso: string): number {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return 0
  return Math.max(0, (Date.now() - t) / 3_600_000)
}

function isUnreadLead(row: PipelineRow): boolean {
  if (row.kind !== 'lead') return false
  if (!row.trailing || row.trailing.type !== 'status') return false
  return row.trailing.value === 'new'
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
