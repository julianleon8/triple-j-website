import twilio from 'twilio'

import { getAdminClient } from '@/lib/supabase/admin'

type SendTags = {
  leadId?: string
  customerId?: string
  jobId?: string
  template?: string
}

type SmsResult = { twilioSid?: string; status: string; eventId: string | null }

let cached: ReturnType<typeof twilio> | null = null

function client() {
  if (cached) return cached
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) {
    throw new Error('Twilio credentials missing (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN)')
  }
  cached = twilio(sid, token)
  return cached
}

export async function sendSms(
  to: string,
  body: string,
  { tags = {} }: { tags?: SendTags } = {}
): Promise<SmsResult> {
  const from = process.env.TWILIO_FROM
  if (!from) throw new Error('TWILIO_FROM env var missing')

  const db = getAdminClient()

  let twilioSid: string | undefined
  let status: string = 'queued'
  let errorMessage: string | null = null

  try {
    const msg = await client().messages.create({ to, from, body })
    twilioSid = msg.sid
    status = msg.status
  } catch (err) {
    status = 'failed'
    errorMessage = err instanceof Error ? err.message : String(err)
  }

  const { data: event } = await db
    .from('sms_events')
    .insert({
      twilio_sid: twilioSid ?? null,
      status,
      to_phone: to,
      body,
      template: tags.template ?? null,
      lead_id: tags.leadId ?? null,
      customer_id: tags.customerId ?? null,
      job_id: tags.jobId ?? null,
      raw: errorMessage ? { error: errorMessage } : null,
    })
    .select('id')
    .single()

  if (errorMessage) {
    throw new Error(`[Twilio] ${errorMessage}`)
  }

  return { twilioSid, status, eventId: event?.id ?? null }
}
