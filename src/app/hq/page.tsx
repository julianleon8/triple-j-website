export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { NextActionCard } from './components/NextActionCard'
import { NeedsAttentionFeed } from './components/NeedsAttentionFeed'
import { CompactKPIStrip } from './components/CompactKPIStrip'
import { CardSkeleton, RowSkeleton } from '@/components/hq/Skeleton'

type SearchParams = Promise<{ tab?: string; type?: string }>

export default async function TodayPage({ searchParams }: { searchParams: SearchParams }) {
  const { tab } = await searchParams

  // Phase 1 stub: saved bookmarks of /hq?tab=funnel should now land on /hq/leads (Phase 2).
  if (tab === 'funnel') redirect('/hq/leads')

  return (
    <div className="space-y-5">
      {/* Skeleton heights tuned to real content (CLS reduction):
          - NextActionCard renders ~h-48 with eyebrow + title + 2 buttons
          - CompactKPIStrip is a 4-up grid with ~h-20 cells, NOT the
            generic h-16 StripSkeleton (which was causing a small CLS jump
            when the real strip resolved taller). */}
      <Suspense fallback={<CardSkeleton height="h-48" />}>
        <NextActionCard />
      </Suspense>

      <Suspense fallback={<RowSkeleton n={4} />}>
        <NeedsAttentionFeed />
      </Suspense>

      <Suspense fallback={<CardSkeleton height="h-24" radius="rounded-2xl" />}>
        <CompactKPIStrip />
      </Suspense>
    </div>
  )
}
