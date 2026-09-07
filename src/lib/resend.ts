/**
 * Lazily-initialized Resend client.
 *
 * This singleton was copy-pasted verbatim in three files
 * (lead-notifications.ts, quotes/[id]/send/route.ts, quotes/[id]/accept/route.ts).
 * Lazy because RESEND_API_KEY is not present at build time.
 */

import { Resend } from 'resend'

let client: Resend | null = null

export function getResend(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}
