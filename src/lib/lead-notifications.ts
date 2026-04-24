import { Resend } from 'resend'
import LeadOwnerAlert, { leadOwnerAlertText } from '@/emails/LeadOwnerAlert'
import LeadCustomerConfirmation, { leadCustomerConfirmationText } from '@/emails/LeadCustomerConfirmation'
import { sendPushBackground } from '@/lib/push'

let _resend: Resend | null = null
function resend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
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

  const city = lead.city ?? 'Unknown'
  const serviceType = lead.service_type ?? 'inquiry'
  const submittedAt = `${new Date(lead.created_at ?? Date.now()).toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST`

  const ownerAlertProps = {
    leadId: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    city,
    zip: lead.zip,
    serviceType,
    structureType: lead.structure_type,
    sizeLine,
    needsConcreteLabel: label(lead.needs_concrete, CONCRETE_LABELS),
    currentSurfaceLabel: label(lead.current_surface, SURFACE_LABELS),
    timelineLabel: label(lead.timeline, TIMELINE_LABELS),
    timeline: lead.timeline,
    isMilitary: !!lead.is_military,
    message: lead.message?.trim() || null,
    submittedAt,
  }

  const subject = `${sourcePrefix}: ${lead.name} — ${city} — ${serviceType}${lead.is_military ? ' ⭐' : ''}${lead.timeline === 'asap' ? ' ⚡' : ''}`

  const ownerResult = await resend().emails.send({
    from: 'Triple J Metal <leads@triplejmetaltx.com>',
    to: process.env.OWNER_EMAIL!.split(','),
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

  if (lead.email) {
    const customerProps = {
      name: lead.name,
      phone: lead.phone,
      city,
      serviceType,
      isMilitary: !!lead.is_military,
      timeline: lead.timeline,
    }
    const customerResult = await resend().emails.send({
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
    body: [city, serviceType.replace('_', ' '), sizeLine].filter(Boolean).join(' · '),
    url: '/hq',
    tag: `lead-${lead.id}`,
  })
}
