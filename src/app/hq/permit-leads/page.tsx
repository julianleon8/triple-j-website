export const dynamic = 'force-dynamic';

import { getAdminClient } from '@/lib/supabase/admin';
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Permit Leads</h1>
        <p className="text-sm text-gray-500 mt-1">
          Daily-scraped Central TX permits, scored against Triple J's wheelhouse.
          Sorted by fit score, newest first.
        </p>
      </div>
      <PermitLeadsTable
        initialLeads={leads ?? []}
        activeStatus={status ?? 'new'}
      />
    </div>
  );
}
