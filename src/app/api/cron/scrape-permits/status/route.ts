import { NextResponse } from 'next/server';
import { checkOwner } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * The latest scrape-permits run, straight from cron_runs.
 *
 * /hq/permit-leads polls this every few seconds while a manual run is open.
 * The trigger itself (POST ../scrape-permits) returns 202 immediately, so this
 * is the only way the page learns how the run ended — and it works whether or
 * not the tab that pressed the button is still around.
 */
export async function GET() {
  const { denied } = await checkOwner();
  if (denied) return denied;

  const { data, error } = await getAdminClient()
    .from('cron_runs')
    .select('started_at, finished_at, ok, yield, notified, error, detail')
    .eq('job', 'scrape-permits')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ run: data ?? null });
}
