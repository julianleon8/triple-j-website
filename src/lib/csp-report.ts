/**
 * Parses CSP violation reports into one short log line each.
 *
 * The Content-Security-Policy is still Report-Only. Enforcing it (SEO action
 * plan A17) needs a week of real violations to review first, and until
 * 2026-10-01 the header named no report endpoint, so browsers sent nothing.
 * Reports arrive in two shapes: the legacy `report-uri` body
 * (`{"csp-report": {...}}`) and the Reporting API array
 * (`[{type: "csp-violation", body: {...}}]`).
 */

type Violation = { directive: string; blocked: string; page: string }

const str = (v: unknown) => (typeof v === 'string' ? v : '')

/** Drops the query string and fragment so no form prefill or token is logged. */
const bare = (url: string) => url.split(/[?#]/)[0]

export function parseCspReports(body: unknown): Violation[] {
  const raw: Record<string, unknown>[] = []
  if (Array.isArray(body)) {
    for (const r of body) {
      if (r && typeof r === 'object' && (r as { type?: unknown }).type === 'csp-violation') {
        const b = (r as { body?: unknown }).body
        if (b && typeof b === 'object') raw.push(b as Record<string, unknown>)
      }
    }
  } else if (body && typeof body === 'object' && 'csp-report' in body) {
    const r = (body as Record<string, unknown>)['csp-report']
    if (r && typeof r === 'object') raw.push(r as Record<string, unknown>)
  }
  return raw.slice(0, 20).map((r) => ({
    directive: str(r['effective-directive'] ?? r.effectiveDirective ?? r['violated-directive']).slice(0, 60),
    blocked: bare(str(r['blocked-uri'] ?? r.blockedURL)).slice(0, 200),
    page: bare(str(r['document-uri'] ?? r.documentURL)).slice(0, 200),
  }))
}
