export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { NextActionCard } from './components/NextActionCard'
import { NeedsAttentionFeed } from './components/NeedsAttentionFeed'
import { CompactKPIStrip } from './components/CompactKPIStrip'
import { CardSkeleton, RowSkeleton, StripSkeleton } from '@/components/hq/Skeleton'

type SearchParams = Promise<{ tab?: string; type?: string }>

export default async function TodayPage({ searchParams }: { searchParams: SearchParams }) {
  const { tab } = await searchParams

  // Phase 1 stub: saved bookmarks of /hq?tab=funnel should now land on /hq/leads (Phase 2).
  if (tab === 'funnel') redirect('/hq/leads')

  return (
    <div className="space-y-5">
      <Suspense fallback={<CardSkeleton height="h-40" />}>
        <NextActionCard />
      </Suspense>

      <Suspense fallback={<RowSkeleton n={4} />}>
        <NeedsAttentionFeed />
      </Suspense>

      <Suspense fallback={<StripSkeleton />}>
        <CompactKPIStrip />
      </Suspense>
    </div>
  )
}
