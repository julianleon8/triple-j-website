import { buildLlmsTxt } from '@/lib/llms'
import { getSiteUrl } from '@/lib/site-url'

/** /llms.txt — see src/lib/llms.ts. Built once, then served statically. */
export const dynamic = 'force-static'

export function GET() {
  return new Response(buildLlmsTxt(getSiteUrl()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
