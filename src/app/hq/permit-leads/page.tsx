export const dynamic = 'force-dynamic';

import { getAdminClient } from '@/lib/supabase/admin';
import { ChartContainer } from '@/components/hq/ChartContainer';
import { JurisdictionStack } from '@/components/hq/JurisdictionStack';
import PermitLeadsTable from './components/PermitLeadsTable';

type SearchParams = Promise<{ status?: string }>;

type CountRow = { jurisdiction: string | null; status: string };
type StackRow = { jurisdiction: string; new: number; called: number; qualified: number };

function aggregateByJurisdiction(rows: CountRow[]): StackRow[] {
  const map = new Map<string, StackRow>();
  for (const r of rows) {
    const key = r.jurisdiction?.trim() || 'Unknown';
    const entry = map.get(key) ?? { jurisdiction: key, new: 0, called: 0, qualified: 0 };
    if (r.status === 'new')       entry.new       += 1;
    if (r.status === 'called')    entry.called    += 1;
    if (r.status === 'qualified') entry.qualified += 1;
    map.set(key, entry);
  }
  return Array.from(map.values())
    .filter(r => r.new + r.called + r.qualified > 0)
    .sort((a, b) => (b.new + b.called + b.qualified) - (a.new + a.called + a.qualified))
    .slice(0, 10);
}

export default async function PermitLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status } = await searchParams;
  const db = getAdminClient();

  const listQuery = db
    .from('permit_leads')
    .select('*')
    .order('wheelhouse_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(500);

  const filtered = status && status !== 'all' ? listQuery.eq('status', status) : listQuery;

  const [{ data: leads }, { data: forChart }] = await Promise.all([
    filtered,
    db
      .from('permit_leads')
      .select('jurisdiction, status')
      .in('status', ['new', 'called', 'qualified']),
  ]);

  const chartData = aggregateByJurisdiction((forChart ?? []) as CountRow[]);

  return (
    <div>
      <div className="hidden sm:block mb-6">
        <h1 className="text-2xl font-bold">Permit Leads</h1>
        <p className="text-sm text-(--text-secondary) mt-1">
          Daily-scraped Central TX permits, scored against Triple J&apos;s wheelhouse.
          Sorted by fit score, newest first.
        </p>
      </div>

      <div className="mb-8">
        <ChartContainer
          title="Active permits by jurisdiction"
          subtitle="Top 10 cities · new · called · qualified"
          empty={chartData.length === 0}
          emptyMessage="No active permits yet. Charts populate once the scraper runs."
        >
          <JurisdictionStack data={chartData} />
        </ChartContainer>
      </div>

      <PermitLeadsTable
        initialLeads={leads ?? []}
        activeStatus={status ?? 'new'}
      />
    </div>
  );
}
