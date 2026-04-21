// Outbound SMS templates. Every template ends with "Reply STOP to opt out."
// to stay TCPA-compliant. Tune copy post-merge — Julian owns the voice.

export const SMS_TEMPLATES = {
  lead_auto_reply: 'lead_auto_reply',
  review_request: 'review_request',
} as const

export type SmsTemplate = (typeof SMS_TEMPLATES)[keyof typeof SMS_TEMPLATES]

export function leadAutoReply(params: { name: string; service?: string | null }) {
  const firstName = (params.name ?? '').trim().split(/\s+/)[0] || 'there'
  const service = (params.service ?? '').replace(/_/g, ' ').trim()
  const serviceClause = service ? `your ${service} request` : 'your inquiry'
  return (
    `Hi ${firstName} — Julian with Triple J Metal. Got ${serviceClause}. ` +
    `I'll call you shortly. Reply STOP to opt out.`
  )
}

export function reviewRequest(params: { customerName: string }) {
  const firstName = (params.customerName ?? '').trim().split(/\s+/)[0] || 'there'
  const reviewUrl = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL
  const link = reviewUrl ? ` ${reviewUrl}` : ''
  return (
    `Hi ${firstName}, Julian with Triple J. Hope you love the new build. ` +
    `If you have 30 seconds, a Google review means the world:${link}. ` +
    `Reply STOP to opt out.`
  )
}

export function renderTemplate(template: SmsTemplate, variables: Record<string, unknown>): string {
  switch (template) {
    case 'lead_auto_reply':
      return leadAutoReply({
        name: String(variables.name ?? ''),
        service: variables.service as string | null | undefined,
      })
    case 'review_request':
      return reviewRequest({
        customerName: String(variables.customerName ?? ''),
      })
  }
}
