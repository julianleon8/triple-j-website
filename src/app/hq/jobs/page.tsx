export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '../components/PageHeader'
import JobsTable from './components/JobsTable'

export default async function JobsPage() {
  const { data: jobs } = await getAdminClient()
    .from('jobs')
    .select('*, customers(name)')
    .order('scheduled_date', { ascending: true })

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Jobs"
        subtitle="Scheduled, in progress, and completed builds."
      />
      <JobsTable initialJobs={jobs ?? []} />
    </div>
  )
}
