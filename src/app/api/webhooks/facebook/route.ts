import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { getAdminClient } from '@/lib/supabase/admin'
import { notifyNewLead, type LeadRecord } from '@/lib/lead-notifications'

export const dynamic = 'force-dynamic'

// Meta Graph API version. Bump here when upgrading.
const GRAPH_API = 'https://graph.facebook.com/v21.0'

// ────────────────────────────────────────────────────────────────────────
// Signature verification
// Meta signs POST bodies with HMAC-SHA256(raw_body, META_APP_SECRET).
// Header: X-Hub-Signature-256: sha256=<hex>
// ────────────────────────────────────────────────────────────────────────
function verifySignature(secret: string, header: string, rawBody: string): boolean {
  if (!header?.startsWith('sha256=')) return false
  const provided = header.slice('sha256='.length)
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  if (provided.length !== expected.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

// ────────────────────────────────────────────────────────────────────────
// GET — Meta subscription verification handshake
// Meta sends ?hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=<str>
// We echo the challenge back as plaintext when the token matches.
// ────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const expected = process.env.META_VERIFY_TOKEN
  if (!expected) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ────────────────────────────────────────────────────────────────────────
// POST — event receiver
// ────────────────────────────────────────────────────────────────────────
interface MetaFieldData { name: string; values: string[] }
interface MetaLeadResponse { id: string; created_time: string; field_data: MetaFieldData[] }

interface MetaWebhookPayload {
  object: string
  entry: Array<{
    id: string
    time: number
    changes?: Array<{
      field: string
      value: { leadgen_id?: string; form_id?: string; page_id?: string; created_time?: number }
    }>
    messaging?: Array<{
      sender: { id: string }
      recipient: { id: string }
      timestamp: number
      message?: { mid?: string; text?: string; is_echo?: boolean }
    }>
  }>
}

export async function POST(request: NextRequest) {
  const appSecret = process.env.META_APP_SECRET
  if (!appSecret) {
    console.error('[FB webhook] META_APP_SECRET is not set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256') ?? ''
  if (!verifySignature(appSecret, signature, rawBody)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: MetaWebhookPayload
  try {
    payload = JSON.parse(rawBody) as MetaWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (payload.object !== 'page') {
    // Only subscribed to page events; silently ack anything else.
    return NextResponse.json({ ok: true })
  }

  // Process entries sequentially. Swallow per-entry errors so one bad entry
  // doesn't cause Meta to resend the whole batch.
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field === 'leadgen' && change.value?.leadgen_id) {
        try {
          await handleLeadgen(change.value.leadgen_id)
        } catch (err) {
          console.error('[FB webhook] leadgen failed:', change.value.leadgen_id, err)
        }
      }
    }
    for (const msg of entry.messaging ?? []) {
      if (msg.message?.text && !msg.message.is_echo) {
        try {
          await handleMessenger(msg.sender.id, msg.message.text)
        } catch (err) {
          console.error('[FB webhook] messenger failed:', msg.sender.id, err)
        }
      }
    }
  }

  return NextResponse.json({ ok: true })
}

// ────────────────────────────────────────────────────────────────────────
// Lead Ads handler
// ────────────────────────────────────────────────────────────────────────
async function handleLeadgen(leadgenId: string) {
  const token = process.env.META_PAGE_ACCESS_TOKEN
  if (!token) throw new Error('META_PAGE_ACCESS_TOKEN missing')

  const res = await fetch(`${GRAPH_API}/${leadgenId}?access_token=${encodeURIComponent(token)}`)
  if (!res.ok) throw new Error(`Graph API ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as MetaLeadResponse

  const fields = Object.fromEntries(data.field_data.map((f) => [f.name.toLowerCase(), f.values[0] ?? null]))

  // Meta's standard field names. Custom questions keep their raw name.
  const name = fields['full_name'] ?? fields['name'] ?? 'Facebook Lead'
  const phone = fields['phone_number'] ?? fields['phone'] ?? ''
  const email = fields['email'] ?? null
  const zip = fields['zip_code'] ?? fields['post_code'] ?? fields['zip'] ?? null
  const city = fields['city'] ?? null
  const rawServiceType = (fields['service_type'] ?? fields['service'] ?? '').toLowerCase()
  const service_type = normalizeServiceType(rawServiceType)

  // Everything else — including custom-question answers — into message.
  const known = new Set(['full_name', 'name', 'phone_number', 'phone', 'email', 'zip_code', 'post_code', 'zip', 'city', 'service_type', 'service'])
  const extras = data.field_data
    .filter((f) => !known.has(f.name.toLowerCase()))
    .map((f) => `${f.name}: ${f.values.join(', ')}`)
    .join('\n')

  const leadgenMarker = `FB-Lead-${leadgenId}`
  const message = [leadgenMarker, extras].filter(Boolean).join('\n\n')

  const { data: lead, error } = await getAdminClient()
    .from('leads')
    .insert({
      name,
      phone: phone || 'Not provided',
      email,
      city,
      zip,
      service_type,
      message,
      source: 'facebook_lead_ads',
    })
    .select()
    .single()

  if (error) throw error
  await notifyNewLead({ lead: lead as LeadRecord })
}

// ────────────────────────────────────────────────────────────────────────
// Messenger DM handler
// ────────────────────────────────────────────────────────────────────────
async function handleMessenger(senderId: string, text: string) {
  const token = process.env.META_PAGE_ACCESS_TOKEN

  // Try to resolve the sender's name via Graph API. Requires pages_messaging
  // with Advanced Access (granted after App Review) to work for any user.
  // Before review: works for page admins/developers/testers; 403/400 for
  // everyone else. Falls back gracefully.
  let name = 'Facebook Messenger'
  if (!token) {
    console.error('[FB webhook] name lookup skipped — META_PAGE_ACCESS_TOKEN not set')
  } else {
    try {
      const url = `${GRAPH_API}/${senderId}?fields=first_name,last_name&access_token=${encodeURIComponent(token)}`
      const res = await fetch(url)
      if (!res.ok) {
        const body = await res.text()
        console.error(`[FB webhook] name lookup HTTP ${res.status} for PSID ${senderId.slice(-6)}: ${body.slice(0, 300)}`)
      } else {
        const profile = (await res.json()) as { first_name?: string; last_name?: string }
        const full = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim()
        if (full) {
          name = full
        } else {
          console.error(`[FB webhook] name lookup returned empty profile for PSID ${senderId.slice(-6)}: ${JSON.stringify(profile)}`)
        }
      }
    } catch (err) {
      console.error(`[FB webhook] name lookup threw for PSID ${senderId.slice(-6)}:`, err)
    }
  }

  const { data: lead, error } = await getAdminClient()
    .from('leads')
    .insert({
      name,
      // Messenger doesn't give us a phone. HQ's LeadsTable renders a
      // "Reply on Messenger" button when source === 'facebook_messenger'
      // instead of a tel: link, so this is just a sentinel that satisfies
      // the NOT NULL constraint on leads.phone.
      phone: 'messenger',
      email: null,
      message: text.trim(),
      service_type: 'other',
      source: 'facebook_messenger',
    })
    .select()
    .single()

  if (error) throw error
  await notifyNewLead({ lead: lead as LeadRecord })
}

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────
function normalizeServiceType(raw: string): string {
  if (!raw) return 'carport'
  const r = raw.toLowerCase()
  if (r.includes('carport')) return 'carport'
  if (r.includes('garage'))  return 'garage'
  if (r.includes('barn'))    return 'barn'
  if (r.includes('rv') || r.includes('boat')) return 'rv_cover'
  return 'other'
}
