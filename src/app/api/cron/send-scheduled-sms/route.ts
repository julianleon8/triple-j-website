import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendSms } from '@/lib/twilio'
import { renderTemplate, type SmsTemplate } from '@/lib/sms-templates'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

type ScheduledRow = {
  id: string
  template: string
  variables: Record<string, unknown> | null
  to_phone: string
  lead_id: string | null
  customer_id: string | null
  job_id: string | null
}

async function drain() {
  const db = getAdminClient()
  const nowIso = new Date().toISOString()

  const { data, error } = await db
    .from('scheduled_sms')
    .select('id, template, variables, to_phone, lead_id, customer_id, job_id')
    .eq('status', 'pending')
    .lte('send_at', nowIso)
    .order('send_at', { ascending: true })
    .limit(50)

  if (error) return { ok: false, error: error.message }

  const rows = (data ?? []) as ScheduledRow[]
  let sent = 0
  let failed = 0

  for (const row of rows) {
    try {
      const body = renderTemplate(row.template as SmsTemplate, row.variables ?? {})
      const res = await sendSms(row.to_phone, body, {
        tags: {
          leadId: row.lead_id ?? undefined,
          customerId: row.customer_id ?? undefined,
          jobId: row.job_id ?? undefined,
          template: row.template,
        },
      })
      await db
        .from('scheduled_sms')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sms_event_id: res.eventId,
          last_error: null,
        })
        .eq('id', row.id)
      sent += 1
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await db
        .from('scheduled_sms')
        .update({ status: 'failed', last_error: msg })
        .eq('id', row.id)
      failed += 1
      console.error('[send-scheduled-sms] row failed:', row.id, msg)
    }
  }

  return { ok: true, considered: rows.length, sent, failed }
}

export async function GET(request: NextRequest) {
  // Dual auth: Bearer CRON_SECRET for Vercel Cron, Supabase cookie for manual /hq runs.
  const auth = request.headers.get('authorization')
  if (auth && auth === `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(await drain())
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json(await drain())
}

export async function POST(request: NextRequest) {
  return GET(request)
}
