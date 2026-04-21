import type { ReactNode } from 'react'

type KPICardProps = {
  label: string
  value: string
  sub?: string
  accent?: 'blue' | 'indigo' | 'sky' | 'purple' | 'fuchsia' | 'green' | 'emerald' | 'amber' | 'red' | 'brand'
  children?: ReactNode
}

const ACCENT: Record<NonNullable<KPICardProps['accent']>, string> = {
  blue:     'bg-blue-50 border-blue-200 text-blue-900',
  indigo:   'bg-indigo-50 border-indigo-200 text-indigo-900',
  sky:      'bg-sky-50 border-sky-200 text-sky-900',
  purple:   'bg-purple-50 border-purple-200 text-purple-900',
  fuchsia:  'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900',
  green:    'bg-green-50 border-green-200 text-green-900',
  emerald:  'bg-emerald-50 border-emerald-200 text-emerald-900',
  amber:    'bg-amber-50 border-amber-200 text-amber-900',
  red:      'bg-red-50 border-red-200 text-red-900',
  brand:    'bg-brand-50 border-brand-200 text-brand-900',
}

export function KPICard({ label, value, sub, accent = 'brand', children }: KPICardProps) {
  return (
    <div className={`rounded-xl border p-4 ${ACCENT[accent]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-3xl font-bold leading-none">{value}</div>
          <div className="text-sm font-semibold mt-1.5">{label}</div>
          {sub && <div className="text-xs opacity-70 mt-0.5">{sub}</div>}
        </div>
        {children && <div className="shrink-0 w-20 h-10">{children}</div>}
      </div>
    </div>
  )
}
