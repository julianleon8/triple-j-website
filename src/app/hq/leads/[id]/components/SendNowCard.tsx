'use client'

import { useRouter } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { useHaptics } from '@/lib/hq/haptics'

/**
 * The one-tap "thanks, quote coming" text, and the first thing on the screen
 * after a capture — this is where hanging up leads.
 *
 * It hands off to the device SMS composer rather than sending through Twilio:
 * it costs nothing, needs no delivery webhooks, works with no signal, and
 * arrives from Julian's own number rather than a service number the customer
 * has never seen.
 *
 * The honest limitation: an `sms:` link returns nothing, so the app cannot know
 * whether the message was actually sent, and there is no message-log table
 * anywhere in the schema. So tapping optimistically marks the lead contacted —
 * migration 015's trigger stamps `first_response_at` off that status — and the
 * Activity list then shows "Contacted" from real data. It deliberately does NOT
 * claim a text was sent, because nothing here can verify that.
 */
export function SendNowCard({
  leadId,
  phone,
  message,
}: {
  leadId: string
  phone: string
  message: string
}) {
  const router = useRouter()
  const haptics = useHaptics()

  // iOS wants `&body=` after the number. `?body=` is the RFC 5724 form and is
  // what Android expects; iOS has historically only honoured the ampersand,
  // and this is an iPhone-first app.
  const href = `sms:${phone.replace(/[^\d+]/g, '')}&body=${encodeURIComponent(message)}`

  function onSend() {
    haptics.success()
    // Fire-and-forget: the SMS composer is already opening, and a failed PATCH
    // must not block or surface an error over the top of it.
    void fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'contacted' }),
    })
      .then(() => router.refresh())
      .catch(() => {})
  }

  return (
    <section
      aria-labelledby="send-now-heading"
      className="rounded-md border-[1.5px] border-(--brand-fg) bg-(--surface-2) p-4"
    >
      <h2
        id="send-now-heading"
        className="font-display text-[14px] font-bold uppercase tracking-[0.08em] text-(--brand-fg)"
      >
        Send now · one tap
      </h2>

      <p className="mt-2 text-[15px] leading-snug text-(--text-primary)">{message}</p>

      <a
        href={href}
        onClick={onSend}
        className="tap-solid mt-3 flex h-[52px] items-center justify-center gap-2 rounded-md bg-(--brand-fg) text-[17px] font-bold uppercase tracking-[0.04em] text-(--text-on-brand)"
      >
        <MessageSquare size={18} strokeWidth={2.4} aria-hidden />
        Send text
      </a>
    </section>
  )
}
