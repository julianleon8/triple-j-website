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
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {empty ? (
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </div>
  )
}
