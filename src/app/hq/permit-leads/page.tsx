export const dynamic = 'force-dynamic';

import { getAdminClient } from '@/lib/supabase/admin';
import { ChartContainer } from '@/components/hq/ChartContainer';
import { JurisdictionStack } from '@/components/hq/JurisdictionStack';
import PermitLeadsTable from './components/PermitLeadsTable';
import {
  ALL_CATEGORIES,
  ALL_TAGS,
  LEAD_CLASSES,
  type ScrapeRunRow,
} from '@/lib/jobs/scrape-permits';

type SearchParams = Promise<{ status?: string; class?: string; category?: string; tag?: string }>;

type CountRow = { jurisdiction: string | null; status: string };
type StackRow = { jurisdiction: string; new: number; called: number; qualified: number };

type BuilderRow = {
  contractor_key: string | null;
  contractor_company: string | null;
  contractor_name: string | null;
  lead_class: string | null;
};

export type BuilderSummary = { key: string; name: string; newHomes: number; other: number };

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

/** Top contractors by permit count, grouped on the normalised key, named by their most common spelling. */
function aggregateBuilders(rows: BuilderRow[], limit = 8): BuilderSummary[] {
  const map = new Map<string, { names: Map<string, number>; newHomes: number; other: number }>();
  for (const r of rows) {
    if (!r.contractor_key) continue;
    const entry = map.get(r.contractor_key) ?? { names: new Map(), newHomes: 0, other: 0 };
    const name = r.contractor_company ?? r.contractor_name ?? r.contractor_key;
    entry.names.set(name, (entry.names.get(name) ?? 0) + 1);
    if (r.lead_class === 'new_home') entry.newHomes += 1;
    else entry.other += 1;
    map.set(r.contractor_key, entry);
  }
  return Array.from(map.entries())
    .map(([key, e]) => ({
      key,
      name: Array.from(e.names.entries()).sort((a, b) => b[1] - a[1])[0][0],
      newHomes: e.newHomes,
      other: e.other,
    }))
    .sort((a, b) => (b.newHomes + b.other) - (a.newHomes + a.other))
    .slice(0, limit);
}

export default async function PermitLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status, class: rawClass, category: rawCategory, tag: rawTag } = await searchParams;
  const leadClass = rawClass && (LEAD_CLASSES as readonly string[]).includes(rawClass) ? rawClass : 'all';
  const category = rawCategory && (ALL_CATEGORIES as readonly string[]).includes(rawCategory) ? rawCategory : 'all';
  const tag = rawTag && (ALL_TAGS as readonly string[]).includes(rawTag) ? rawTag : null;
  const db = getAdminClient();

  let listQuery = db
    .from('permit_leads')
    .select('*')
    .order('wheelhouse_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(500);

  if (status && status !== 'all') listQuery = listQuery.eq('status', status);
  if (leadClass !== 'all') listQuery = listQuery.eq('lead_class', leadClass);
  if (category !== 'all') listQuery = listQuery.eq('category', category);
  if (tag) listQuery = listQuery.contains('tags', [tag]);

  const [{ data: leads }, { data: forChart }, { data: lastRun }, { data: builders }] = await Promise.all([
    listQuery,
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
    db
      .from('permit_leads')
      .select('contractor_key, contractor_company, contractor_name, lead_class')
      .not('contractor_key', 'is', null),
  ]);

  const chartData = aggregateByJurisdiction((forChart ?? []) as CountRow[]);
  const topBuilders = aggregateBuilders((builders ?? []) as BuilderRow[]);

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
        activeCategory={category}
        activeTag={tag}
        lastRun={(lastRun ?? null) as ScrapeRunRow | null}
        topBuilders={topBuilders}
      />
    </div>
  );
}
