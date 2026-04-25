export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { QuoteWizard } from './_components/QuoteWizard'

export default async function NewQuotePage() {
  const { data: customers } = await getAdminClient()
    .from('customers')
    .select('id, name, email')
    .order('name')

  return (
    <div>
      <h1 className="hidden sm:block text-2xl font-bold mb-6">New Quote</h1>
      <QuoteWizard customers={customers ?? []} />
    </div>
  )
}
