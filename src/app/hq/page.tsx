export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { NextActionCard } from './components/NextActionCard'
import { NeedsAttentionFeed } from './components/NeedsAttentionFeed'
import { CompactKPIStrip } from './components/CompactKPIStrip'

type SearchParams = Promise<{ tab?: string; type?: string }>

export default async function TodayPage({ searchParams }: { searchParams: SearchParams }) {
  const { tab } = await searchParams

  // Phase 1 stub: saved bookmarks of /hq?tab=funnel should now land on /hq/leads (Phase 2).
  if (tab === 'funnel') redirect('/hq/leads')

  return (
    <div className="space-y-5">
      <Suspense fallback={<NextActionFallback />}>
        <NextActionCard />
      </Suspense>

      <Suspense fallback={<FeedFallback />}>
        <NeedsAttentionFeed />
      </Suspense>

      <Suspense fallback={<KPIStripFallback />}>
        <CompactKPIStrip />
      </Suspense>
    </div>
  )
}

function NextActionFallback() {
  return (
    <div
      aria-hidden="true"
      className="h-40 rounded-3xl border border-(--border-subtle) bg-(--surface-2) animate-pulse"
    />
  )
}

function FeedFallback() {
  return (
    <section aria-hidden="true" className="space-y-2">
      <div className="h-4 w-28 rounded-full bg-(--surface-2) animate-pulse" />
      <div className="space-y-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-(--surface-2) animate-pulse" />
        ))}
      </div>
    </section>
  )
}

function KPIStripFallback() {
  return (
    <div
      aria-hidden="true"
      className="h-16 rounded-2xl border border-(--border-subtle) bg-(--surface-2) animate-pulse"
    />
  )
}
