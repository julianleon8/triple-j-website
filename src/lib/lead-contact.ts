/**
 * How to reach a lead.
 *
 * `leads.phone` is NOT NULL, so sources that carry no phone store a
 * placeholder instead: Messenger DMs write "messenger", Facebook lead ads
 * without a phone write "Not provided", and Messenger rows from before
 * 2026-04-24 hold "FB-PSID-<id>". None of those can be dialed, and a tel: or
 * sms: link built from one opens the phone app on garbage. Every place that
 * turns a lead's phone into a link goes through `dialablePhone`.
 */

/**
 * Meta Business Suite inbox. Meta's webhook carries no thread id, so this is
 * the closest link to the conversation: the newest thread sits at the top.
 */
export const MESSENGER_INBOX_URL = 'https://business.facebook.com/latest/inbox/messages'

/** The phone ready for a tel:/sms: link, or null when it is a placeholder rather than a number. */
export function dialablePhone(phone: string | null | undefined): string | null {
  if (!phone || /[a-z]/i.test(phone)) return null
  const cleaned = phone.replace(/[^\d+]/g, '')
  const digits = cleaned.replace(/\D/g, '').length
  return digits >= 10 && digits <= 15 ? cleaned : null
}

/** A lead that came in as a Facebook Messenger DM, so the reply goes back through Messenger. */
export function isMessengerLead(lead: { source?: string | null; phone?: string | null }): boolean {
  return (
    lead.source === 'facebook_messenger' ||
    lead.phone === 'messenger' ||
    (lead.phone ?? '').startsWith('FB-PSID-')
  )
}
