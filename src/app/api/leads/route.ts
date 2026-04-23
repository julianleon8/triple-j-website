import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import LeadOwnerAlert, { leadOwnerAlertText } from '@/emails/LeadOwnerAlert'
import LeadCustomerConfirmation, { leadCustomerConfirmationText } from '@/emails/LeadCustomerConfirmation'
import { sendPushBackground } from '@/lib/push'
import { verifyHCaptchaToken } from '@/lib/captcha'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Lazy-init so build-time static analysis doesn't require the key
let _resend: Resend | null = null
function resend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

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

function label(value: string | undefined, map: Record<string, string>, fallback = '—'): string {
  if (!value) return fallback
  return map[value] ?? value
}

const CONCRETE_LABELS: Record<string, string> = {
  yes: 'Yes — include concrete pad',
  already_have: 'Already have a slab',
  unsure: 'Not sure yet',
}
const SURFACE_LABELS: Record<string, string> = {
  dirt: 'Dirt / bare ground',
  gravel: 'Gravel',
  asphalt: 'Asphalt',
  concrete: 'Existing concrete',
}
const TIMELINE_LABELS: Record<string, string> = {
  asap: 'ASAP — under 48 hours',
  this_week: 'This week',
  this_month: 'This month',
  planning: 'Just planning ahead',
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
  // hCaptcha token (validated by verifyHCaptchaToken before insert).
  // Optional in dev when HCAPTCHA_SECRET_KEY is unset.
  captcha_token:    z.string().optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: leads, error } = await getAdminClient()
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

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
      })
      .select()
      .single()

    if (error) throw error

    // ── Owner alert ──────────────────────────────────────────────────────
    const submittedAt = `${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST`
    const ownerAlertProps = {
      leadId: lead.id,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      city,
      zip: data.zip || null,
      serviceType: data.service_type,
      structureType: data.structure_type || null,
      sizeLine,
      needsConcreteLabel: data.needs_concrete ? label(data.needs_concrete, CONCRETE_LABELS) : null,
      currentSurfaceLabel: data.current_surface ? label(data.current_surface, SURFACE_LABELS) : null,
      timelineLabel: data.timeline ? label(data.timeline, TIMELINE_LABELS) : null,
      timeline: data.timeline || null,
      isMilitary: data.is_military,
      message: data.message?.trim() || null,
      submittedAt,
    }

    await resend().emails.send({
      from: 'Triple J Metal <leads@triplejmetaltx.com>',
      to: process.env.OWNER_EMAIL!.split(','),
      replyTo: data.email || undefined,
      subject: `🔔 New Lead: ${data.name} — ${city} — ${data.service_type}${data.is_military ? ' ⭐' : ''}${data.timeline === 'asap' ? ' ⚡' : ''}`,
      react: LeadOwnerAlert(ownerAlertProps),
      text: leadOwnerAlertText(ownerAlertProps),
      tags: [
        { name: 'lead_id', value: lead.id },
        { name: 'email_type', value: 'lead_owner_alert' },
      ],
    })

    // ── Customer confirmation ─────────────────────────────────────────────
    if (data.email) {
      const customerProps = {
        name: data.name,
        phone: data.phone,
        city,
        serviceType: data.service_type,
        isMilitary: data.is_military,
        timeline: data.timeline || null,
      }
      await resend().emails.send({
        from: 'Triple J Metal <no-reply@triplejmetaltx.com>',
        replyTo: 'julianleon@triplejmetaltx.com',
        to: data.email,
        subject: 'We got your quote request — Triple J Metal',
        react: LeadCustomerConfirmation(customerProps),
        text: leadCustomerConfirmationText(customerProps),
        tags: [
          { name: 'lead_id', value: lead.id },
          { name: 'email_type', value: 'lead_customer_confirmation' },
        ],
      })
    }

    // ── Push notification to owner devices ────────────────────────────────
    const isHot = data.timeline === 'asap'
    sendPushBackground({
      title: isHot
        ? `⚡ HOT lead: ${data.name}`
        : `🔔 New lead: ${data.name}`,
      body: [city, data.service_type.replace('_', ' '), sizeLine].filter(Boolean).join(' · '),
      url: '/hq',
      tag: `lead-${lead.id}`,
    })

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
