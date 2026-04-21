export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '../components/PageHeader'
import CustomersTable from './components/CustomersTable'

export default async function CustomersPage() {
  const { data: customers } = await getAdminClient()
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        eyebrow="Relationships"
        title="Customers"
        subtitle="Everyone we've earned — past, present, and pipeline."
      />
      <CustomersTable initialCustomers={customers ?? []} />
    </div>
  )
}
