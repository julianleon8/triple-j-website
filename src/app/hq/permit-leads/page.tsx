export const dynamic = 'force-dynamic';

import { getAdminClient } from '@/lib/supabase/admin';
import { ChartContainer } from '@/components/hq/ChartContainer';
import { JurisdictionStack } from '@/components/hq/JurisdictionStack';
import PermitLeadsTable from './components/PermitLeadsTable';
import type { ScrapeRunRow } from '@/lib/jobs/scrape-permits';

type SearchParams = Promise<{ status?: string; class?: string }>;

const LEAD_CLASSES = new Set(['accessory', 'new_home', 'commercial']);

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
  const { status, class: rawClass } = await searchParams;
  const leadClass = rawClass && LEAD_CLASSES.has(rawClass) ? rawClass : 'all';
  const db = getAdminClient();

  let listQuery = db
    .from('permit_leads')
    .select('*')
    .order('wheelhouse_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(500);

  if (status && status !== 'all') listQuery = listQuery.eq('status', status);
  if (leadClass !== 'all') listQuery = listQuery.eq('lead_class', leadClass);
  const filtered = listQuery;

  const [{ data: leads }, { data: forChart }, { data: lastRun }] = await Promise.all([
    filtered,
    db
      .from('permit_leads')
      .select('jurisdiction, status')
      .in('status', ['new', 'called', 'qualified']),
    // The latest run, so the page can say what happened without a tab having
    // waited on the request.
    db
      .from('cron_runs')
      .select('started_at, finished_at, ok, yield, notified, error, detail')
      .eq('job', 'scrape-permits')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const chartData = aggregateByJurisdiction((forChart ?? []) as CountRow[]);

  return (
    <div>
      <div className="hidden sm:block mb-6">
        <h1 className="text-2xl font-bold">Permit Leads</h1>
        <p className="text-sm text-(--text-secondary) mt-1">
          City of Temple weekly building-permit reports, read daily. Accessory work to call on,
          new homes to market to later, small commercial. Sorted by fit score, newest first.
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
        activeClass={leadClass}
        lastRun={(lastRun ?? null) as ScrapeRunRow | null}
      />
    </div>
  );
}
