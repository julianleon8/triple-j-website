export const dynamic = 'force-dynamic';

import { getAdminClient } from '@/lib/supabase/admin';
import { PageHeader } from '../components/PageHeader';
import PermitLeadsTable from './components/PermitLeadsTable';

type SearchParams = Promise<{ status?: string }>;

export default async function PermitLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status } = await searchParams;

  const query = getAdminClient()
    .from('permit_leads')
    .select('*')
    .order('wheelhouse_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(500);

  const filtered = status && status !== 'all' ? query.eq('status', status) : query;

  const { data: leads } = await filtered;

  return (
    <div>
      <PageHeader
        eyebrow="Pipeline"
        title="Permit Leads"
        subtitle="Daily-scraped Central TX permits, scored against Triple J's wheelhouse. Sorted by fit score, newest first."
      />
      <PermitLeadsTable
        initialLeads={leads ?? []}
        activeStatus={status ?? 'new'}
      />
    </div>
  );
}
