import { getAdminClient } from '@/lib/supabase/admin'
import { EventsTable, type EmailEventRow } from './EventsTable'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Logs' }

export default async function LogsPage() {
  const { data: events } = await getAdminClient()
    .from('email_events')
    .select('id, event_type, email_type, to_email, subject, lead_id, quote_id, click_link, occurred_at')
    .order('occurred_at', { ascending: false })
    .limit(100)

  const rows: EmailEventRow[] = (events ?? []) as EmailEventRow[]

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <p className="text-sm text-(--text-secondary)">
        Last 100 email events from Resend webhooks — delivery, opens, clicks, bounces, complaints.
      </p>
      <EventsTable rows={rows} />
    </div>
  )
}
