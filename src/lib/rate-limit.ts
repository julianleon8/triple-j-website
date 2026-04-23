/**
 * Per-IP rate limiter for public API routes (form submissions, etc).
 *
 * In-memory LRU keyed by `${routeKey}:${ip}`. Scoped to a single warm Vercel
 * function instance — state resets when the instance is recycled. That's
 * intentional: this is a spam deterrent, not a DDoS shield. A determined
 * attacker rotating IPs across function instances bypasses it; real spam
 * bots overwhelmingly come from a single IP and will hit the limit.
 *
 * For real distributed rate limiting, migrate to Vercel KV or Upstash Redis.
 * Not worth the cost at current scale.
 */

import { LRUCache } from 'lru-cache'

type BucketEntry = {
  /** Timestamp (ms) of the first request in the current window. */
  firstSeen: number
  /** Number of requests counted in the current window. */
  count: number
}

// 10,000 distinct (routeKey:IP) buckets. Small footprint, enough room for
// realistic traffic. LRU evicts the least-recently-used bucket when full.
const cache = new LRUCache<string, BucketEntry>({
  max: 10_000,
  // ttl is set per-entry when we first create it, so don't set a global ttl
  // here. We want sliding-window-per-bucket, not a global expiration.
})

export type RateLimitResult = {
  allowed: boolean
  /** Remaining submissions in the current window. */
  remaining: number
  /** Seconds until the window resets (only set when !allowed). */
  retryAfterSec?: number
}

/**
 * Check + increment the counter for a given (routeKey, ip) pair.
 *
 * @param ip         IP address — pulled from `x-forwarded-for` header
 * @param routeKey   e.g. 'leads' or 'partner-inquiries' — separates buckets
 * @param limit      max requests allowed in the window
 * @param windowMs   window duration in ms (e.g. 60*60*1000 for 1 hour)
 */
export function checkRateLimit(
  ip: string | null | undefined,
  routeKey: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const key = `${routeKey}:${ip ?? 'unknown'}`
  const now = Date.now()
  const existing = cache.get(key)

  if (!existing || now - existing.firstSeen > windowMs) {
    // Fresh window.
    cache.set(key, { firstSeen: now, count: 1 })
    return { allowed: true, remaining: limit - 1 }
  }

  if (existing.count >= limit) {
    const elapsed = now - existing.firstSeen
    const retryAfterSec = Math.ceil((windowMs - elapsed) / 1000)
    return { allowed: false, remaining: 0, retryAfterSec }
  }

  existing.count++
  cache.set(key, existing)
  return { allowed: true, remaining: limit - existing.count }
}

/**
 * Extract the client IP from a Next.js request. Vercel sets x-forwarded-for
 * on every request; the first value in the comma-separated list is the
 * originating client.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}
