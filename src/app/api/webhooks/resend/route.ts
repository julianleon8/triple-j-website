import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Resend uses Svix for webhook signing.
// Verify: HMAC-SHA256(`${svix_id}.${svix_timestamp}.${body}`, base64-decoded secret)
function verifySignature(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  signatureHeader: string,
  body: string
): boolean {
  if (!svixId || !svixTimestamp || !signatureHeader) return false

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const signed = `${svixId}.${svixTimestamp}.${body}`
  const expected = crypto.createHmac('sha256', secretBytes).update(signed).digest('base64')

  // Header is space-separated "v1,<sig> v1,<sig2>" — accept if any matches
  for (const part of signatureHeader.split(' ')) {
    const [, sig] = part.split(',')
    if (!sig) continue
    if (sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return true
    }
  }
  return false
}

interface ResendTag { name: string; value: string }

interface ResendWebhookPayload {
  type: string
  created_at: string
  data: {
    email_id: string
    to?: string[] | string
    subject?: string
    tags?: ResendTag[] | Record<string, string>
    click?: { link?: string }
  }
}

function tagValue(tags: ResendTag[] | Record<string, string> | undefined, name: string): string | null {
  if (!tags) return null
  if (Array.isArray(tags)) return tags.find((t) => t.name === name)?.value ?? null
  return tags[name] ?? null
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    console.error('[Resend webhook] RESEND_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const body = await request.text()
  const ok = verifySignature(
    secret,
    request.headers.get('svix-id') ?? '',
    request.headers.get('svix-timestamp') ?? '',
    request.headers.get('svix-signature') ?? '',
    body
  )
  if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  let payload: ResendWebhookPayload
  try {
    payload = JSON.parse(body) as ResendWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, created_at, data } = payload
  const toEmail = Array.isArray(data.to) ? data.to[0] : data.to ?? null
  const leadId = tagValue(data.tags, 'lead_id')
  const quoteId = tagValue(data.tags, 'quote_id')
  const emailType = tagValue(data.tags, 'email_type')

  const { error } = await getAdminClient().from('email_events').insert({
    resend_id: data.email_id,
    event_type: type,
    email_type: emailType,
    to_email: toEmail,
    subject: data.subject ?? null,
    lead_id: leadId,
    quote_id: quoteId,
    click_link: data.click?.link ?? null,
    occurred_at: created_at,
    raw: payload,
  })

  if (error) {
    console.error('[Resend webhook] insert failed:', error)
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
