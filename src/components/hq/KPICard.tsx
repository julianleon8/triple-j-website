import type { ReactNode } from 'react'

type KPICardProps = {
  label: string
  value: string
  sub?: string
  accent?: 'blue' | 'indigo' | 'sky' | 'purple' | 'fuchsia' | 'green' | 'emerald' | 'amber' | 'red' | 'brand'
  children?: ReactNode
}

/**
 * Tinted accents rather than pale slabs. The -50/-200/-900 light triples this
 * used to carry have no dark counterpart, and /hq/more/stats renders ~28 of
 * these — so the whole screen was pastel cards on #0b0d0f. A 15% tint with a
 * 30% border and the hue itself as text is the same treatment the status chips
 * in src/lib/pipeline.ts use, so the two now agree.
 *
 * `value` and `label` take --text-primary from the card; only `sub` and the
 * accent border carry the hue, which keeps the number readable at every hue.
 */
const ACCENT: Record<NonNullable<KPICardProps['accent']>, string> = {
  blue:     'bg-blue-500/15 border-blue-500/30 text-blue-400',
  indigo:   'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
  sky:      'bg-sky-500/15 border-sky-500/30 text-sky-400',
  purple:   'bg-purple-500/15 border-purple-500/30 text-purple-400',
  fuchsia:  'bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-400',
  green:    'bg-green-500/15 border-green-500/30 text-green-400',
  emerald:  'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  amber:    'bg-amber-500/15 border-amber-500/30 text-amber-400',
  red:      'bg-red-500/15 border-red-500/30 text-red-400',
  // hq-gold, not (--brand-fg): an alpha modifier on an arbitrary var() colour
  // is unreliable — compiling globals.css shows bg-(--hq-sky)/15 emits no rule
  // at all. --color-hq-* are registered theme colours, so the /15 emits a real
  // color-mix. Same trap as the PR 2 status chips; verified by compiling, not
  // by eye.
  brand:    'bg-hq-gold/15 border-hq-gold/30 text-hq-gold',
}

export function KPICard({ label, value, sub, accent = 'brand', children }: KPICardProps) {
  return (
    <div className={`rounded-md border p-4 ${ACCENT[accent]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-3xl font-bold leading-none tabular-nums text-(--text-primary)">{value}</div>
          <div className="mt-1.5 text-sm font-semibold text-(--text-secondary)">{label}</div>
          {sub && <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.04em]">{sub}</div>}
        </div>
        {children && <div className="shrink-0 w-20 h-10">{children}</div>}
      </div>
    </div>
  )
}
