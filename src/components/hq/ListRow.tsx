import Link from 'next/link'
import type { PipelineBadge, PipelineKind, PipelineRow, PipelineTrailing } from '@/lib/pipeline'

/**
 * iOS-style 3-zone list row.
 * - Leading: 40x40 colored circle + kind glyph
 * - Content: bold primary (17px) + secondary (15px) stacked
 * - Trailing: status pill / score badge / amount / chevron
 *
 * Dark-mode aware via semantic tokens (--surface-2, --text-primary, etc.).
 * 64px min-height (Apple HIG).
 */
export function ListRow({ row }: { row: PipelineRow }) {
  return (
    <Link
      href={row.href}
      className="flex items-center gap-3 px-4 py-3 min-h-16 bg-(--surface-2) active:bg-(--surface-3) transition-colors"
    >
      <LeadingGlyph kind={row.kind} />
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
      <TrailingSlot trailing={row.trailing} />
    </Link>
  )
}

// ── Leading circle ──────────────────────────────────────────────────────────

const KIND_STYLE: Record<PipelineKind, { bg: string; label: string }> = {
  lead:     { bg: 'bg-blue-500',    label: 'L' },
  permit:   { bg: 'bg-purple-500',  label: 'P' },
  customer: { bg: 'bg-green-500',   label: 'C' },
  quote:    { bg: 'bg-amber-500',   label: 'Q' },
  job:      { bg: 'bg-rose-500',    label: 'J' },
}

function LeadingGlyph({ kind }: { kind: PipelineKind }) {
  const { bg, label } = KIND_STYLE[kind]
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-[15px] font-bold ${bg}`}>
      {label}
    </div>
  )
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

function TrailingSlot({ trailing }: { trailing?: PipelineTrailing }) {
  if (!trailing) return <Chevron />
  switch (trailing.type) {
    case 'status':
      return (
        <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${trailing.statusClass}`}>
          {trailing.value}
        </span>
      )
    case 'score':
      return <ScoreBadge score={trailing.value} />
    case 'amount':
      return (
        <div className="flex flex-col items-end">
          <span className="text-[15px] font-semibold text-(--text-primary) tabular-nums">
            {trailing.value}
          </span>
          {trailing.sub && (
            <span className={`mt-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize ${trailing.statusClass ?? ''}`}>
              {trailing.sub}
            </span>
          )}
        </div>
      )
    case 'chevron':
      return <Chevron />
  }
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 8 ? 'bg-red-500 text-white' :
    score >= 6 ? 'bg-amber-500 text-white' :
    score >= 4 ? 'bg-yellow-400 text-black' :
                 'bg-gray-300 text-gray-700 dark:bg-white/10 dark:text-gray-300'
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${tone}`}>
      {score}
    </div>
  )
}

function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-(--text-tertiary)">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}
