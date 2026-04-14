export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import QuoteBuilderForm from './components/QuoteBuilderForm'

export default async function NewQuotePage() {
  const { data: customers } = await getAdminClient()
    .from('customers')
    .select('id, name, email')
    .order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Quote</h1>
      <QuoteBuilderForm customers={customers ?? []} />
    </div>
  )
}
