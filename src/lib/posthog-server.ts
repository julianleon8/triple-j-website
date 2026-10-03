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

/* ─── PostHog API (read-only, server) ────────────────────────────────────── */

/** The Triple J org's "Website" project. Not a secret: it is in every app URL. */
export const POSTHOG_PROJECT_ID = 643189
export const POSTHOG_APP_HOST = 'https://us.posthog.com'
export const POSTHOG_DASHBOARD_URL = `${POSTHOG_APP_HOST}/project/${POSTHOG_PROJECT_ID}/dashboard/2165121`

/**
 * GET/POST against the PostHog API with the personal API key. Returns null
 * when POSTHOG_PERSONAL_API_KEY is unset, so callers can report "not
 * configured" instead of failing. The key needs only `alert:read` and
 * `query:read`, scoped to this one project.
 */
async function posthogApi<T>(path: string, init?: { method: 'POST'; body: unknown }): Promise<T | null> {
  const key = process.env.POSTHOG_PERSONAL_API_KEY
  if (!key) return null
  const res = await fetch(`${POSTHOG_APP_HOST}/api/projects/${POSTHOG_PROJECT_ID}${path}`, {
    method: init?.method ?? 'GET',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: init ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(20_000),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`PostHog API ${path} answered ${res.status}`)
  return (await res.json()) as T
}

export type PostHogAlert = {
  id: string
  name: string
  state: string
  last_value: number | null
  last_notified_at: string | null
  last_checked_at: string | null
  insight: { short_id: string; name: string | null } | null
}

/** The alert as PostHog has it now. Null when the API key is not configured. */
export function getAlert(alertId: string): Promise<PostHogAlert | null> {
  return posthogApi<PostHogAlert>(`/alerts/${encodeURIComponent(alertId)}/`)
}

/** Run one HogQL query; rows come back as arrays in `columns` order. */
export async function runHogQL(query: string): Promise<{ columns: string[]; results: unknown[][] } | null> {
  return posthogApi<{ columns: string[]; results: unknown[][] }>('/query/', {
    method: 'POST',
    body: { query: { kind: 'HogQLQuery', query }, name: 'triple-j-app' },
  })
}
