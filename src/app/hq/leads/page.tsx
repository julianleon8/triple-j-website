export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { leadToRow, type LeadForRow } from '@/lib/pipeline'
import { LeadsInbox } from './components/LeadsInbox'

type LeadRecord = LeadForRow & {
  email?: string | null
  message?: string | null
}

const PAGE_SIZE = 50

export default async function LeadsPage() {
  const admin = getAdminClient()

  // Phase 3 perf: fetch only the 50 newest leads with all display columns
  // (the inbox renders these). For segment counts (the New/Hot/All/Done
  // chips), run a parallel lightweight query that pulls only the `status`
  // column across the whole table — much cheaper than the original 500-row
  // select-all and stays accurate. Migration 021's status index makes the
  // counts query index-only.
  const [{ data: rowsRaw }, { data: statusRaw }] = await Promise.all([
    admin
      .from('leads')
      .select(
        'id, created_at, name, phone, email, city, zip, service_type, structure_type, timeline, is_military, status, message',
      )
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE),
    admin.from('leads').select('status'),
  ])

  const leads = (rowsRaw ?? []) as LeadRecord[]
  const rows = leads.map(leadToRow)
  const allStatus = (statusRaw ?? []) as { status: string }[]

  const counts = {
    new:  allStatus.filter((l) => l.status === 'new').length,
    hot:  allStatus.filter((l) => l.status === 'contacted' || l.status === 'quoted').length,
    all:  allStatus.length,
    done: allStatus.filter((l) => l.status === 'won' || l.status === 'lost').length,
  }

  return <LeadsInbox rows={rows} counts={counts} pageSize={PAGE_SIZE} totalAll={counts.all} />
}
