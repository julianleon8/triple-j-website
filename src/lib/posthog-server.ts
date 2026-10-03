import { after } from 'next/server'
import { PostHog } from 'posthog-node'

import { LEAD_CREATED_EVENT } from '@/lib/analytics'

/** Ingestion host for server-side events. The browser goes through the
 *  /ingest proxy instead; a server has no ad blocker to get around. */
const POSTHOG_HOST = 'https://us.i.posthog.com'

type LeadCreated = {
  leadId: string
  /** The browser's PostHog distinct ID, when the form sent one. Without it
   *  (PostHog blocked or not yet loaded) the lead ID stands in. */
  distinctId?: string
  sessionId?: string
  properties: Record<string, string | number | boolean | null | undefined>
}

/**
 * Send `lead_created` to PostHog after the response has gone out, so it never
 * slows a form submit or fails one. No-op without NEXT_PUBLIC_POSTHOG_KEY,
 * which also keeps it out of unit tests: `after()` needs a request scope.
 *
 * A short-lived client per call, flushed with shutdown(): a serverless
 * function can be frozen the moment the response is sent, so nothing may be
 * left sitting in a batch queue.
 */
export function trackLeadCreated({ leadId, distinctId, sessionId, properties }: LeadCreated): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return

  after(async () => {
    const client = new PostHog(key, { host: POSTHOG_HOST, flushAt: 1, flushInterval: 0 })
    try {
      client.capture({
        distinctId: distinctId || leadId,
        event: LEAD_CREATED_EVENT,
        properties: {
          ...properties,
          lead_id: leadId,
          ...(sessionId ? { $session_id: sessionId } : {}),
        },
        // The function runs in a Vercel region, not where the visitor is.
        disableGeoip: true,
      })
      await client.shutdown()
    } catch (error) {
      console.warn('[posthog] lead_created not sent:', error)
    }
  })
}
