export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PhoneCall } from 'lucide-react'
import { NextActionCard } from './components/NextActionCard'
import { DraftsToFinish } from './components/DraftsToFinish'
import { QuotesWaiting } from './components/QuotesWaiting'
import { CardSkeleton, RowSkeleton } from '@/components/hq/Skeleton'

type SearchParams = Promise<{ tab?: string; type?: string }>

/**
 * Today is cut to the two jobs it actually has: the one call to make next, and
 * the quotes waiting on an answer.
 *
 * Gone from here on purpose — revenue / win-rate / avg-ticket moved to
 * /hq/more/stats, where they already existed in fuller form, and the
 * "Needs attention" feed was dropped because the call-next card *is* the most
 * urgent thing; a list under it just restated the same ranking.
 */
export default async function TodayPage({ searchParams }: { searchParams: SearchParams }) {
  const { tab } = await searchParams

  // Saved bookmarks of /hq?tab=funnel land on the leads inbox.
  if (tab === 'funnel') redirect('/hq/leads')

  return (
    <div className="space-y-4">
      {/* The whole point of the redesign: entering a lead while the caller is
          still on the phone is one tap from the first screen. */}
      <Link
        href="/hq/capture"
        className="tap-solid flex min-h-[60px] items-center justify-center gap-2.5 rounded-md bg-(--brand-fg) px-4 font-display text-[22px] font-bold uppercase tracking-[0.04em] text-(--text-on-brand)"
      >
        <PhoneCall size={20} strokeWidth={2.4} aria-hidden />
        Capture a call
      </Link>

      {/* Skeleton heights track real content to keep CLS down. The card is a
          5px-barred block with a 32px name and a 50px action row; the quotes
          list is 66px rows. Retune these if either changes. */}
      <Suspense fallback={<CardSkeleton height="h-40" />}>
        <NextActionCard />
      </Suspense>

      <Suspense fallback={null}>
        <DraftsToFinish />
      </Suspense>

      <Suspense fallback={<RowSkeleton n={3} />}>
        <QuotesWaiting />
      </Suspense>
    </div>
  )
}
