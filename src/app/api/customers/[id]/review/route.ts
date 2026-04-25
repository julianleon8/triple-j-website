import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendSms, isTwilioConfigured, toE164 } from '@/lib/twilio'

export const dynamic = 'force-dynamic'

const SNOOZE_DAYS = 7

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('asked') }),
  z.object({ action: z.literal('snoozed') }),
  z.object({ action: z.literal('left'), url: z.string().url().max(2000).optional() }),
  z.object({ action: z.literal('reset') }),
])

/**
 * POST /api/customers/[id]/review
 *
 * Drives the customer-flywheel review-ask flow (migration 019).
 *   - asked   → stamp review_asked_at = now, review_followup_due_at = +7d,
 *               and (Phase 2.B) ship the review-ask SMS via Twilio.
 *   - snoozed → bump review_followup_due_at by another 7d
 *   - left    → stamp review_left_at = now, persist optional review_url,
 *               clear review_followup_due_at
 *   - reset   → clear all four fields (in case Julian asked the wrong customer)
 *
 * SMS is fire-and-forget — DB stamp lands even if Twilio fails, so the
 * follow-up calendar is never blocked. The SMS outcome is returned in
 * the response so HQ UI can surface the failure with a toast.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const json = await request.json().catch(() => ({}))
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const now = new Date()
  const due = new Date(now.getTime() + SNOOZE_DAYS * 86400 * 1000)
  const update: Record<string, unknown> = { updated_at: now.toISOString() }

  if (parsed.data.action === 'asked') {
    update.review_asked_at = now.toISOString()
    update.review_followup_due_at = due.toISOString()
  } else if (parsed.data.action === 'snoozed') {
    update.review_followup_due_at = due.toISOString()
  } else if (parsed.data.action === 'left') {
    update.review_left_at = now.toISOString()
    update.review_followup_due_at = null
    if (parsed.data.url) update.review_url = parsed.data.url
  } else {
    update.review_asked_at = null
    update.review_followup_due_at = null
    update.review_left_at = null
    update.review_url = null
  }

  const { error } = await getAdminClient()
    .from('customers')
    .update(update)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }

  // Phase 2.B — review-ask SMS. Only on the 'asked' transition; snooze/left/reset
  // are HQ-side state changes that don't message the customer.
  let sms: { sent: boolean; reason?: string } | undefined
  if (parsed.data.action === 'asked') {
    sms = await sendReviewAskSms(id)
  }

  return NextResponse.json({ success: true, ...(sms ? { sms } : {}) })
}

/**
 * Sends the review-ask SMS to the customer. Returns a small status object
 * for the response payload — never throws. Swallowing failures is intentional:
 * the DB ask-stamp is the source of truth for the follow-up cron, and a
 * Twilio outage shouldn't block Julian from advancing the customer state.
 */
async function sendReviewAskSms(customerId: string): Promise<{ sent: boolean; reason?: string }> {
  if (!isTwilioConfigured()) {
    return { sent: false, reason: 'twilio_not_configured' }
  }

  const { data: customer } = await getAdminClient()
    .from('customers')
    .select('name, phone')
    .eq('id', customerId)
    .single<{ name: string; phone: string | null }>()

  if (!customer?.phone) return { sent: false, reason: 'no_phone' }
  const e164 = toE164(customer.phone)
  if (!e164) return { sent: false, reason: 'invalid_phone' }

  const firstName = customer.name.split(/\s+/)[0] || customer.name
  const reviewUrl = process.env.GOOGLE_REVIEW_URL?.trim()
  const linkLine = reviewUrl
    ? `Quick favor — would you leave a Google review? ${reviewUrl}`
    : `Quick favor — would you leave a Google review? Search "Triple J Metal Temple TX" on Google.`
  const body =
    `Triple J Metal: thanks for choosing us, ${firstName}! ` +
    `${linkLine} Means the world. Reply STOP to opt out.`

  const result = await sendSms({ to: e164, body })
  if (!result.ok) {
    console.error(`[reviewAsk] customer ${customerId} SMS failed:`, result.message)
    return { sent: false, reason: result.reason }
  }
  return { sent: true }
}
