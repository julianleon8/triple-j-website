import { referenceNotes } from "@/lib/project-reference"
import { getSiteUrl } from "@/lib/site-url"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOwner } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'
import { notifyNewLead } from '@/lib/lead-notifications'
import { verifyHCaptchaToken } from '@/lib/captcha'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { inferIntentStage } from '@/lib/intent-stage'
import { SITE } from '@/lib/site'
import { cityFromZip } from '@/lib/locations'

export const dynamic = 'force-dynamic'

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
  best_time_to_call: z.enum(['morning', 'afternoon', 'evening']).optional(),
  is_military:      z.boolean().default(false),
  message:          z.string().max(1000).optional(),
  // Estimated budget (migration 014). Range from a public-form pill.
  estimated_budget_min: z.number().nonnegative().optional(),
  estimated_budget_max: z.number().nonnegative().optional(),
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
  reference_project_id: z.string().uuid().optional(),
  captcha_token:    z.string().optional(),
  // Which public funnel this came from. This route is unauthenticated by
  // design, so the value is client-supplied — but it is a closed enum, not a
  // free string. leads.source is CHECK-constrained (029); a free string would
  // turn a typo into a constraint violation surfacing as a 500, losing the
  // lead. Here a bad value is a 400 before anything is written.
  //
  // Every other leads.source value (facebook_lead_ads, voice_memo, …) is set
  // server-side by its own ingest path and is deliberately not accepted here.
  // Spoofing this is uninteresting: anyone who can POST already controls name,
  // phone, message and every utm_* field.
  source:           z.enum(['website_form', 'quote_page']).default('website_form'),
})

export async function GET(request: NextRequest) {
  const denied = await requireOwner()
  if (denied) return denied

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
        { error: `Too many submissions from your IP. Please wait an hour or call ${SITE.phone}.` },
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

    // null (not the raw ZIP) when unrecognised — a ZIP stored in the city
    // column poisons every city-level report. Display handles the fallback.
    const city = cityFromZip(data.zip)
    const sizeLine = data.width && data.length
      ? `${data.width}W × ${data.length}L${data.height ? ` × ${data.height}H` : ''} ft`
      : null

    // Header fallback: if the client didn't send referrer_url, the
    // browser's Referer header is the next-best signal.
    const referrerUrl = data.referrer_url || request.headers.get('referer') || null
    const intentStage = inferIntentStage({
      timeline: data.timeline,
      estimated_budget_min: data.estimated_budget_min ?? null,
    })

    let projectNotes: string | undefined
    if (data.reference_project_id) {
      const { data: project, error: referenceError } = await getAdminClient()
        .from('gallery_items')
        .select('id,title,city,type,panel_color,panel_color_line,trim_color,trim_color_line')
        .eq('id', data.reference_project_id)
        .eq('is_active', true)
        .maybeSingle()
      if (referenceError) {
        return NextResponse.json({ error: 'Could not load your project reference. Please try again.' }, { status: 503 })
      }
      if (project) projectNotes = referenceNotes({
        ...project, city: project.city || 'Central Texas',
        panelColor: project.panel_color, panelColorLine: project.panel_color_line,
        trimColor: project.trim_color, trimColorLine: project.trim_color_line,
      }, getSiteUrl())
    }

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
        best_time_to_call: data.best_time_to_call || null,
        is_military:     data.is_military,
        message:         [sizeLine, projectNotes, projectNotes && data.message?.trim() ? `Customer notes:\n${data.message.trim()}` : data.message?.trim()].filter(Boolean).join('\n\n') || null,
        source:          data.source,
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
        estimated_budget_min: data.estimated_budget_min ?? null,
        estimated_budget_max: data.estimated_budget_max ?? null,
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
