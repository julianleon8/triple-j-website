export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import CustomersTable from './components/CustomersTable'

export default async function CustomersPage() {
  const { data: customers } = await getAdminClient()
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <CustomersTable initialCustomers={customers ?? []} />
    </div>
  )
}
