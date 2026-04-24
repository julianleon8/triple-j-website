export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { PipelineList } from '@/components/hq/PipelineList'
import { jobToRow, type JobForRow } from '@/lib/pipeline'

export default async function JobsPage() {
  const { data } = await getAdminClient()
    .from('jobs')
    .select('id, created_at, job_number, status, job_type, city, scheduled_date, total_contract, balance_due, customers(name)')
    .order('scheduled_date', { ascending: true, nullsFirst: false })
    .limit(500)

  const rows = ((data ?? []) as unknown as JobForRow[]).map(jobToRow)

  return (
    <div>
      <h1 className="hidden text-2xl font-bold mb-6 sm:block">Jobs</h1>
      <PipelineList rows={rows} hideFilters />
    </div>
  )
}
