export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import QuoteEditor from './components/QuoteEditor'

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = getAdminClient()

  const { data: quote, error } = await db
    .from('quotes')
    .select('*, customers(id, name, email), quote_line_items(*)')
    .eq('id', id)
    .single()

  if (error || !quote) notFound()

  const { data: customers } = await db
    .from('customers')
    .select('id, name, email')
    .order('name')

  return (
    <div>
      <h1 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">Quote {quote.quote_number}</h1>
      <QuoteEditor quote={quote} customers={customers ?? []} />
    </div>
  )
}
