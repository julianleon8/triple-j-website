/**
 * Notify the owner — push, email, or push with email as a safety net.
 *
 * Before this, the only owner-notification path was notifyNewLead(), which is
 * welded to the new-lead moment: its own subject line, its own templates, its
 * own hot-lead emoji rules. Every cron that wants to say something to Julian
 * needed a generic version, so here it is; notifyNewLead is built on top.
 */

import type { ReactElement } from 'react'
import { getResend } from '@/lib/resend'
import { sendPush, type PushPayload } from '@/lib/push'

export type OwnerEmail = {
  subject: string
  react: ReactElement
  text: string
  /**
   * Resend tags. Always tag with email_type, plus lead_id / quote_id when the
   * message is about one — untagged sends land in email_events with null
   * foreign keys and become invisible to anything that joins on them.
   */
  tags?: { name: string; value: string }[]
  replyTo?: string
}

export type NotifyOwnerInput = {
  push: PushPayload
  email?: OwnerEmail
  /**
   * 'both' (default) sends push and email together.
   *
   * 'push-first' sends the email only if the push reached nobody. It exists
   * for the bounce watch, which must not depend on the delivery channel it is
   * monitoring — but which also must not be silent when push is the broken
   * one. sendPush is a no-op returning sent:0 when VAPID env is missing
   * (push.ts), and an owner with no registered device is equally unreachable,
   * so "reached nobody" covers both without inspecting why.
   */
  channel?: 'both' | 'push-first'
}

export type NotifyOwnerResult = {
  pushed: number
  emailed: boolean
  errors: string[]
}

const FROM = 'Triple J Metal <leads@triplejmetaltx.com>'

export async function notifyOwner({
  push,
  email,
  channel = 'both',
}: NotifyOwnerInput): Promise<NotifyOwnerResult> {
  const errors: string[] = []
  let pushed = 0
  let emailed = false

  try {
    const result = await sendPush(push)
    pushed = result.sent
  } catch (err) {
    errors.push(`push: ${err instanceof Error ? err.message : String(err)}`)
  }

  const wantEmail = email && (channel === 'both' || pushed === 0)
  if (wantEmail) {
    // OWNER_EMAIL unset once threw on `undefined.split(',')` and took down
    // every lead notification. Guarded everywhere it is read.
    const to = process.env.OWNER_EMAIL
    if (!to) {
      errors.push('email: OWNER_EMAIL is not set')
    } else {
      try {
        const sent = await getResend().emails.send({
          from: FROM,
          to: to.split(','),
          replyTo: email.replyTo,
          subject: email.subject,
          react: email.react,
          text: email.text,
          tags: email.tags,
        })
        if (sent.error) errors.push(`email: ${sent.error.message}`)
        else emailed = true
      } catch (err) {
        errors.push(`email: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  if (errors.length > 0) console.error('[notifyOwner]', push.title, errors)

  return { pushed, emailed, errors }
}
