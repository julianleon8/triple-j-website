export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { Breadcrumbs } from '../../components/Breadcrumbs'
import { PageHeader } from '../../components/PageHeader'
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
      <Breadcrumbs items={[{ label: 'Quotes', href: '/hq/quotes' }, { label: quote.quote_number }]} />
      <PageHeader
        eyebrow="Sales"
        title={`Quote ${quote.quote_number}`}
        subtitle={quote.customers?.name ? `For ${quote.customers.name}` : undefined}
      />
      <QuoteEditor quote={quote} customers={customers ?? []} />
    </div>
  )
}
