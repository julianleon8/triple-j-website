export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { customerToRow, type CustomerForRow } from '@/lib/pipeline'
import { CustomersList } from './components/CustomersList'

export default async function CustomersPage() {
  const { data } = await getAdminClient()
    .from('customers')
    .select('id, created_at, name, phone, city')
    .order('created_at', { ascending: false })
    .limit(500)

  const rows = ((data ?? []) as CustomerForRow[]).map(customerToRow)

  return (
    <div>
      <CustomersList rows={rows} />
    </div>
  )
}
