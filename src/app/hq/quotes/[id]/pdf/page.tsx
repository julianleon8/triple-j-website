export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { QuotePdfViewer } from '../components/QuotePdfViewer'

/**
 * The quote PDF, inside HQ.
 *
 * The PDF button used to open /api/quotes/[id]/pdf in a new tab. In the
 * installed app that replaced the whole screen with a bare PDF — no back
 * button, no tab bar, nothing to tap but the document — and the only way out
 * was force-quitting the app. Here the header, the back link and the tab bar
 * stay put around the document.
 */
export default async function QuotePdfPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = getAdminClient()

  const { data: quote, error } = await db
    .from('quotes')
    .select('id, quote_number')
    .eq('id', id)
    .single<{ id: string; quote_number: string }>()

  if (error || !quote) notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link
        href={`/hq/quotes/${quote.id}`}
        className="inline-flex items-center gap-1 py-1 text-[15px] font-medium text-(--brand-fg)"
      >
        <ArrowLeft size={18} strokeWidth={2} /> Back to quote
      </Link>

      <QuotePdfViewer src={`/api/quotes/${quote.id}/pdf`} quoteNumber={quote.quote_number} />
    </div>
  )
}
