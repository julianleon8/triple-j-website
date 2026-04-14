export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import CustomersTable from './components/CustomersTable'

export default async function CustomersPage() {
  const { data: customers } = await getAdminClient()
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <CustomersTable initialCustomers={customers ?? []} />
    </div>
  )
}
