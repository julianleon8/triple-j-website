import type { ReactNode } from 'react'

type ChartContainerProps = {
  title: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
  empty?: boolean
  emptyMessage?: string
}

export function ChartContainer({
  title,
  subtitle,
  children,
  action,
  empty = false,
  emptyMessage = 'Not enough data yet.',
}: ChartContainerProps) {
  return (
    <div className="rounded-xl border border-(--border-subtle) bg-(--surface-2) p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-(--text-primary)">{title}</h3>
          {subtitle && <p className="text-xs text-(--text-secondary) mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {empty ? (
        <div className="h-48 flex items-center justify-center text-sm text-(--text-tertiary)">
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </div>
  )
}
