export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { quoteToRow, type QuoteForRow } from '@/lib/pipeline'
import { QuotesList } from './components/QuotesList'

export default async function QuotesPage() {
  const { data } = await getAdminClient()
    .from('quotes')
    .select('id, created_at, quote_number, status, total, valid_until, customers(name)')
    .order('created_at', { ascending: false })
    .limit(500)

  const quotes = (data ?? []) as unknown as QuoteForRow[]
  const rows = quotes.map(quoteToRow)

  const counts = {
    all:      quotes.length,
    draft:    quotes.filter((q) => q.status === 'draft').length,
    sent:     quotes.filter((q) => q.status === 'sent').length,
    accepted: quotes.filter((q) => q.status === 'accepted').length,
  }

  return (
    <div>
      <h1 className="hidden sm:block text-2xl font-bold mb-6">Quotes</h1>
      <QuotesList rows={rows} counts={counts} />
    </div>
  )
}
