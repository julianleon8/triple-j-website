export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { quoteToRow, type QuoteForRow } from '@/lib/pipeline'
import { countSegments } from '@/lib/hq/quote-segments'
import { QuotesList } from './components/QuotesList'

export default async function QuotesPage() {
  const { data } = await getAdminClient()
    .from('quotes')
    .select('id, created_at, quote_number, status, total, valid_until, sent_at, customers(name)')
    .order('created_at', { ascending: false })
    .limit(500)

  const quotes = (data ?? []) as unknown as QuoteForRow[]
  const rows = quotes.map(quoteToRow)

  // Counted through the same predicate the client filters with, so a segment
  // can never show a count it cannot then render.
  const counts = countSegments(quotes.map((q) => q.status))

  return (
    <div>
      <h1 className="hidden sm:block text-2xl font-bold mb-6">Quotes</h1>
      <QuotesList rows={rows} counts={counts} />
    </div>
  )
}
