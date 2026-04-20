export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import JobsTable from './components/JobsTable'

export default async function JobsPage() {
  const { data: jobs } = await getAdminClient()
    .from('jobs')
    .select('*, customers(name)')
    .order('scheduled_date', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Jobs</h1>
      <JobsTable initialJobs={jobs ?? []} />
    </div>
  )
}
