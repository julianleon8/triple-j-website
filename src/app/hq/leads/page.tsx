export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { leadToRow, type LeadForRow } from '@/lib/pipeline'
import { LeadsInbox } from './components/LeadsInbox'

type LeadRecord = LeadForRow & {
  email?: string | null
  message?: string | null
}

export default async function LeadsPage() {
  const { data } = await getAdminClient()
    .from('leads')
    .select('id, created_at, name, phone, email, city, zip, service_type, structure_type, timeline, is_military, status, message')
    .order('created_at', { ascending: false })
    .limit(500)

  const leads = (data ?? []) as LeadRecord[]
  const rows = leads.map(leadToRow)

  const counts = {
    new:  leads.filter((l) => l.status === 'new').length,
    hot:  leads.filter((l) => l.status === 'contacted' || l.status === 'quoted').length,
    all:  leads.length,
    done: leads.filter((l) => l.status === 'won' || l.status === 'lost').length,
  }

  return <LeadsInbox rows={rows} counts={counts} />
}
