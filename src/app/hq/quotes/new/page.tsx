export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { Breadcrumbs } from '../../components/Breadcrumbs'
import { PageHeader } from '../../components/PageHeader'
import QuoteBuilderForm from './components/QuoteBuilderForm'

export default async function NewQuotePage() {
  const { data: customers } = await getAdminClient()
    .from('customers')
    .select('id, name, email')
    .order('name')

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Quotes', href: '/hq/quotes' }, { label: 'New' }]} />
      <PageHeader
        eyebrow="Sales"
        title="New Quote"
        subtitle="Draft line items, set validity, then send to the customer."
      />
      <QuoteBuilderForm customers={customers ?? []} />
    </div>
  )
}
