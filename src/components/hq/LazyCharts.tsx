'use client'

import dynamic from 'next/dynamic'

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="animate-pulse rounded bg-(--surface-3)"
      style={{ height }}
      aria-hidden="true"
    />
  )
}

export const Sparkline = dynamic(
  () => import('./Sparkline').then((m) => m.Sparkline),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={40} />,
  },
)

export const Funnel = dynamic(
  () => import('./Funnel').then((m) => m.Funnel),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={240} />,
  },
)
