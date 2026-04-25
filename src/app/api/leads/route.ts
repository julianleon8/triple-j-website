import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { notifyNewLead } from '@/lib/lead-notifications'
import { verifyHCaptchaToken } from '@/lib/captcha'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { inferIntentStage } from '@/lib/intent-stage'

export const dynamic = 'force-dynamic'

// Simple ZIP → city lookup for Bell / Coryell counties
const ZIP_CITIES: Record<string, string> = {
  '76501': 'Temple', '76502': 'Temple', '76503': 'Temple', '76504': 'Temple',
  '76508': 'Temple', '76511': 'Bartlett',
  '76513': 'Belton',
  '76522': 'Copperas Cove',
  '76527': 'Florence',
  '76534': 'Holland',
  '76541': 'Killeen', '76542': 'Killeen', '76543': 'Killeen', '76544': 'Killeen',
  '76548': 'Harker Heights',
  '76549': 'Killeen',
  '76554': 'Little River-Academy',
  '76557': 'Moody',
  '76571': 'Salado',
  '76578': 'Taylor',
  '76579': 'Troy',
}

function cityFromZip(zip: string): string {
  return ZIP_CITIES[zip?.trim()] ?? zip ?? 'Not provided'
}

const leadSchema = z.object({
  // Step 1 — contact
  name:             z.string().min(2).max(100),
  phone:            z.string().min(10).max(20),
  email:            z.string().email().optional().or(z.literal('')),
  zip:              z.string().min(5).max(10).optional(),
  // Step 2 — project
  service_type:     z.enum(['carport', 'garage', 'barn', 'rv_cover', 'other']).default('carport'),
  structure_type:   z.enum(['welded', 'bolted', 'unsure']).optional(),
  width:            z.string().max(10).optional(),
  length:           z.string().max(10).optional(),
  height:           z.string().max(10).optional(),
  // Step 3 — qualification
  needs_concrete:   z.enum(['yes', 'already_have', 'unsure']).optional(),
  current_surface:  z.enum(['dirt', 'gravel', 'asphalt', 'concrete']).optional(),
  timeline:         z.enum(['asap', 'this_week', 'this_month', 'planning']).optional(),
  is_military:      z.boolean().default(false),
  message:          z.string().max(1000).optional(),
  // Attribution (migration 014). All optional — public form populates
  // them from URL params + window.location + document.referrer when
  // the visitor has them. landing_url + referrer_url fall back to
  // request headers if the client didn't send.
  utm_source:       z.string().max(200).optional(),
  utm_medium:       z.string().max(200).optional(),
  utm_campaign:     z.string().max(200).optional(),
  utm_term:         z.string().max(200).optional(),
  utm_content:      z.string().max(200).optional(),
  gclid:            z.string().max(200).optional(),
  fbclid:           z.string().max(200).optional(),
  landing_url:      z.string().max(2000).optional(),
  referrer_url:     z.string().max(2000).optional(),
  // hCaptcha token (validated by verifyHCaptchaToken before insert).
  // Optional in dev when HCAPTCHA_SECRET_KEY is unset.
  captcha_token:    z.string().optional(),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Cursor pagination via ?before=<iso-created-at>&limit=<n>. The /hq/leads
  // page server-renders the first 50 directly; this endpoint serves the
  // "Load older" button on the client. limit clamped to 1..100.
  const url = new URL(request.url)
  const before = url.searchParams.get('before')
  const limitRaw = parseInt(url.searchParams.get('limit') ?? '50', 10)
  const limit = Number.isFinite(limitRaw) ? Math.min(100, Math.max(1, limitRaw)) : 50

  let query = getAdminClient()
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (before) {
    query = query.lt('created_at', before)
  }

  const { data: leads, error } = await query

  if (error) return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  return NextResponse.json({ leads })
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 submissions per IP per hour. Spam deterrent only — a
    // determined attacker rotating IPs across function instances bypasses,
    // which is fine. The captcha layer below stops bots that pass this.
    const ip = getClientIp(request)
    const rl = checkRateLimit(ip, 'leads', 5, 60 * 60 * 1000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions from your IP. Please wait an hour or call 254-346-7764.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec ?? 3600) } },
      )
    }

    const body = await request.json()
    const data = leadSchema.parse(body)

    // Captcha verification — skipped in dev if HCAPTCHA_SECRET_KEY unset.
    const captcha = await verifyHCaptchaToken(data.captcha_token, ip)
    if (!captcha.success) {
      return NextResponse.json(
        { error: 'Captcha verification failed. Please try again.' },
        { status: 400 },
      )
    }

    const city = cityFromZip(data.zip ?? '')
    const sizeLine = data.width && data.length
      ? `${data.width}W × ${data.length}L${data.height ? ` × ${data.height}H` : ''} ft`
      : null

    // Header fallback: if the client didn't send referrer_url, the
    // browser's Referer header is the next-best signal.
    const referrerUrl = data.referrer_url || request.headers.get('referer') || null
    const intentStage = inferIntentStage({ timeline: data.timeline })

    // Persist to Supabase
    const { data: lead, error } = await getAdminClient()
      .from('leads')
      .insert({
        name:            data.name,
        phone:           data.phone,
        email:           data.email || null,
        city,
        zip:             data.zip || null,
        service_type:    data.service_type,
        structure_type:  data.structure_type || null,
        needs_concrete:  data.needs_concrete || null,
        current_surface: data.current_surface || null,
        timeline:        data.timeline || null,
        is_military:     data.is_military,
        message:         [sizeLine, data.message?.trim()].filter(Boolean).join('\n\n') || null,
        source:          'website_form',
        utm_source:      data.utm_source || null,
        utm_medium:      data.utm_medium || null,
        utm_campaign:    data.utm_campaign || null,
        utm_term:        data.utm_term || null,
        utm_content:     data.utm_content || null,
        gclid:           data.gclid || null,
        fbclid:          data.fbclid || null,
        landing_url:     data.landing_url || null,
        referrer_url:    referrerUrl,
        intent_stage:    intentStage,
      })
      .select()
      .single()

    if (error) throw error

    await notifyNewLead({ lead, sizeLine })

    return NextResponse.json({ success: true, id: lead.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Lead submission error:', error)
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 })
  }
}

// PATCH /api/leads/[id] is handled in /api/leads/[id]/route.ts
