import LeadOwnerAlert, { leadOwnerAlertText } from '@/emails/LeadOwnerAlert'
import LeadCustomerConfirmation, { leadCustomerConfirmationText } from '@/emails/LeadCustomerConfirmation'
import { sendPushBackground } from '@/lib/push'
import { getResend } from '@/lib/resend'
import { formatCityOrZip } from '@/lib/locations'
import { zipInfo, formatDistance, formatLeadLocation } from '@/lib/zip'

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
// When the customer said they can pick up — distinct from TIMELINE_LABELS,
// which is when the job needs doing. An ASAP job from someone who only answers
// after 5pm is still an evening callback.
const BEST_TIME_LABELS: Record<string, string> = {
  morning: 'Morning (before noon)',
  afternoon: 'Afternoon (12–5)',
  evening: 'Evening (after 5)',
}
const TIMELINE_LABELS: Record<string, string> = {
  asap: 'ASAP — this week if possible',
  this_week: 'This week',
  this_month: 'This month',
  planning: 'Just planning ahead',
}

function label(value: string | null | undefined, map: Record<string, string>): string | null {
  if (!value) return null
  return map[value] ?? value
}

export interface LeadRecord {
  id: string
  name: string
  phone: string
  email: string | null
  city: string | null
  zip: string | null
  service_type: string | null
  structure_type: string | null
  needs_concrete: string | null
  current_surface: string | null
  timeline: string | null
  best_time_to_call: string | null
  is_military: boolean | null
  message: string | null
  source: string | null
  created_at?: string
}

export interface NotifyNewLeadInput {
  lead: LeadRecord
  /** Pre-built "20W × 30L × 10H ft" line. Displayed as its own field in the
   * owner-alert email even though it also lives in lead.message. Omit when
   * the source didn't capture dimensions (e.g. Messenger DMs). */
  sizeLine?: string | null
}

/**
 * Sends the new-lead owner alert email + (if email present) customer
 * confirmation + a background push notification to HQ devices.
 *
 * Shared across:
 *  - POST /api/leads (website QuoteForm)
 *  - POST /api/webhooks/facebook (FB Lead Ads + Messenger DMs)
 */
export async function notifyNewLead({ lead, sizeLine = null }: NotifyNewLeadInput) {
  const sourcePrefix =
    lead.source === 'facebook_lead_ads'  ? '📘 FB Ad Lead' :
    lead.source === 'facebook_messenger' ? '💬 FB DM' :
    '🔔 New Lead'

  // formatCityOrZip keeps an unrecognised ZIP legible as "ZIP 76577" rather
  // than a bare number — the subject line is the only thing Julian sees
  // before deciding whether a lead is real.
  const city = formatCityOrZip(lead.city, lead.zip)
  const serviceType = lead.service_type ?? 'inquiry'

  // Geography for the ZIP, when we have it. Owner-facing surfaces only — the
  // customer confirmation below deliberately keeps the plain city, because
  // "your carport request for Belton · 9.9 mi · out of area" is an internal
  // triage note, not something a customer should ever read about themselves.
  const geo = zipInfo(lead.zip)
  const distance = geo ? formatDistance(geo) : null
  const distanceLine = distance
    ? `${distance} from shop${geo!.band === 'outside' ? ' · out of area' : ''}`
    : null
  // "Amarillo · 344 mi · out of area", not "ZIP 79101". An out-of-area lead
  // stores a null city by design (locked 2026-09-07), so `city` above falls
  // back to the bare ZIP for exactly the leads where naming the place matters
  // most. formatLeadLocation fills that name in from the ZIP without touching
  // what gets persisted.
  const locationLine = formatLeadLocation(lead.city, lead.zip)
  const submittedAt = `${new Date(lead.created_at ?? Date.now()).toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST`

  const ownerAlertProps = {
    leadId: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    city,
    zip: lead.zip,
    state: geo?.state ?? null,
    distanceLine,
    serviceType,
    structureType: lead.structure_type,
    sizeLine,
    needsConcreteLabel: label(lead.needs_concrete, CONCRETE_LABELS),
    currentSurfaceLabel: label(lead.current_surface, SURFACE_LABELS),
    timelineLabel: label(lead.timeline, TIMELINE_LABELS),
    timeline: lead.timeline,
    bestTimeLabel: label(lead.best_time_to_call, BEST_TIME_LABELS),
    isMilitary: !!lead.is_military,
    message: lead.message?.trim() || null,
    submittedAt,
  }

  const subject = `${sourcePrefix}: ${lead.name} — ${locationLine} — ${serviceType}${lead.is_military ? ' ⭐' : ''}${lead.timeline === 'asap' ? ' ⚡' : ''}`

  // OWNER_EMAIL unset used to throw here (`undefined!.split`), taking down every
  // lead notification with a TypeError rather than a legible error. Guarded the
  // same way as src/app/api/quotes/[id]/accept/route.ts. The lead is already
  // persisted by this point, so a missing recipient must not fail the request.
  if (process.env.OWNER_EMAIL) {
    const ownerResult = await getResend().emails.send({
      from: 'Triple J Metal <leads@triplejmetaltx.com>',
      to: process.env.OWNER_EMAIL.split(','),
      replyTo: lead.email || undefined,
      subject,
      react: LeadOwnerAlert(ownerAlertProps),
      text: leadOwnerAlertText(ownerAlertProps),
      tags: [
        { name: 'lead_id', value: lead.id },
        { name: 'email_type', value: 'lead_owner_alert' },
      ],
    })
    if (ownerResult.error) {
      console.error('[notifyNewLead] owner alert Resend error:', ownerResult.error)
    }
  } else {
    console.error('[notifyNewLead] OWNER_EMAIL is not set — no owner alert sent for lead', lead.id)
  }

  if (lead.email) {
    const customerProps = {
      name: lead.name,
      phone: lead.phone,
      city,
      serviceType,
      isMilitary: !!lead.is_military,
      timeline: lead.timeline,
    }
    const customerResult = await getResend().emails.send({
      from: 'Triple J Metal <no-reply@triplejmetaltx.com>',
      replyTo: 'julianleon@triplejmetaltx.com',
      to: lead.email,
      subject: 'We got your quote request — Triple J Metal',
      react: LeadCustomerConfirmation(customerProps),
      text: leadCustomerConfirmationText(customerProps),
      tags: [
        { name: 'lead_id', value: lead.id },
        { name: 'email_type', value: 'lead_customer_confirmation' },
      ],
    })
    if (customerResult.error) {
      console.error('[notifyNewLead] customer confirm Resend error:', customerResult.error)
    }
  }

  const isHot = lead.timeline === 'asap'
  const pushIcon =
    lead.source === 'facebook_lead_ads'  ? '📘' :
    lead.source === 'facebook_messenger' ? '💬' :
    (isHot ? '⚡' : '🔔')
  sendPushBackground({
    title: `${pushIcon} ${isHot ? 'HOT lead' : 'New lead'}: ${lead.name}`,
    body: [locationLine, serviceType.replace('_', ' '), sizeLine].filter(Boolean).join(' · '),
    url: '/hq',
    tag: `lead-${lead.id}`,
  })
}
