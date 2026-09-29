/**
 * One Messenger conversation is one lead.
 *
 * Meta delivers every Page message as its own webhook event, and the handler
 * used to insert a lead for each one — a six-message chat filed six leads and
 * sent six alerts. The sender's page-scoped ID (PSID) now opens the lead's
 * `message` as a marker, the same way `FB-Lead-<id>` tags Lead Ads rows, and
 * later messages from that sender append to the open lead instead of creating
 * another. No migration: `leads` has no external-ID column, and the marker is
 * enough to find the row.
 *
 * A closed lead (won or lost) is not reopened — someone who writes again after
 * that is a new inquiry and gets a new lead and a new alert.
 */

/** Statuses after which a new message starts a new lead. Mirrors the open/closed
 *  split in `/hq/more/stats`. */
export const CLOSED_LEAD_STATUSES = ['won', 'lost'] as const

/** Past this length follow-ups stop being copied in; the full thread lives in
 *  the Page inbox. Keeps a long chat from turning the lead card into a transcript. */
export const MAX_MESSENGER_MESSAGE_CHARS = 4000

export function messengerMarker(psid: string): string {
  return `FB-Messenger-${psid}`
}

/** The `message` of a brand-new Messenger lead: marker, then the first text. */
export function firstMessengerMessage(psid: string, text: string): string {
  return `${messengerMarker(psid)}\n\n${text.trim()}`
}

/**
 * The open lead's `message` with a follow-up appended, or `null` when there is
 * nothing to write — an empty text, or the lead already at the length cap.
 */
export function appendMessengerText(existing: string | null, text: string): string | null {
  const next = text.trim()
  if (!next) return null
  const base = existing ?? ''
  if (base.length >= MAX_MESSENGER_MESSAGE_CHARS) return null
  const combined = base ? `${base}\n\n${next}` : next
  return combined.length > MAX_MESSENGER_MESSAGE_CHARS
    ? combined.slice(0, MAX_MESSENGER_MESSAGE_CHARS)
    : combined
}
