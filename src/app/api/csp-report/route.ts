import { parseCspReports } from '@/lib/csp-report'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * POST /api/csp-report — target of the Report-Only CSP's `report-uri`.
 * Logs one `[csp]` line per violation to the Vercel runtime logs; nothing is
 * stored. Read them back before enforcing the policy (see next.config.ts).
 */
export async function POST(request: Request) {
  const rl = checkRateLimit(getClientIp(request), 'csp-report', 30, 10 * 60 * 1000)
  if (!rl.allowed) return new Response(null, { status: 204 })

  const text = await request.text()
  if (text.length > 16_000) return new Response(null, { status: 413 })

  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return new Response(null, { status: 400 })
  }
  for (const v of parseCspReports(body)) {
    console.warn(`[csp] ${v.directive} blocked ${v.blocked || '(inline)'} on ${v.page}`)
  }
  return new Response(null, { status: 204 })
}
