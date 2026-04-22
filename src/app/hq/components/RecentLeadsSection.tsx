import { getAdminClient } from '@/lib/supabase/admin'
import LeadsTable from './LeadsTable'

type EmailEvent = { lead_id: string; event_type: string; occurred_at: string }

export async function RecentLeadsSection() {
  const db = getAdminClient()

  const [{ data: recentLeadsForTable }, { data: recentEmailEvents }] = await Promise.all([
    db.from('leads').select('*').order('created_at', { ascending: false }).limit(100),
    db
      .from('email_events')
      .select('lead_id, event_type, occurred_at')
      .not('lead_id', 'is', null)
      .in('event_type', ['email.opened', 'email.clicked', 'email.delivered'])
      .order('occurred_at', { ascending: false })
      .limit(500),
  ])

  const latestEventByLead: Record<string, { event_type: string; occurred_at: string }> = {}
  for (const e of (recentEmailEvents ?? []) as EmailEvent[]) {
    if (!latestEventByLead[e.lead_id]) {
      latestEventByLead[e.lead_id] = { event_type: e.event_type, occurred_at: e.occurred_at }
    }
  }

  const leads = recentLeadsForTable ?? []

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-bold text-(--text-primary)">Recent Leads</h2>
        <span className="text-xs text-(--text-tertiary)">{leads.length} shown</span>
      </div>
      <LeadsTable initialLeads={leads} emailEvents={latestEventByLead} />
    </section>
  )
}
