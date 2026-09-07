import { describe, it, expect, vi, afterEach } from 'vitest'
import { checkRateLimit, getClientIp } from './rate-limit'

// The module holds one process-wide LRU, so every test uses a unique routeKey
// to get a clean bucket rather than reaching in to reset shared state.
let n = 0
const key = () => `test-${n++}`

afterEach(() => vi.useRealTimers())

describe('checkRateLimit', () => {
  it('allows up to the limit, then blocks', () => {
    const k = key()
    expect(checkRateLimit('1.1.1.1', k, 3, 60_000)).toMatchObject({ allowed: true, remaining: 2 })
    expect(checkRateLimit('1.1.1.1', k, 3, 60_000)).toMatchObject({ allowed: true, remaining: 1 })
    expect(checkRateLimit('1.1.1.1', k, 3, 60_000)).toMatchObject({ allowed: true, remaining: 0 })

    const blocked = checkRateLimit('1.1.1.1', k, 3, 60_000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.retryAfterSec).toBeGreaterThan(0)
  })

  it('keeps separate buckets per IP', () => {
    const k = key()
    checkRateLimit('1.1.1.1', k, 1, 60_000)
    expect(checkRateLimit('1.1.1.1', k, 1, 60_000).allowed).toBe(false)
    // A different IP is unaffected by the first one exhausting its bucket.
    expect(checkRateLimit('2.2.2.2', k, 1, 60_000).allowed).toBe(true)
  })

  it('keeps separate buckets per route', () => {
    const a = key()
    const b = key()
    checkRateLimit('1.1.1.1', a, 1, 60_000)
    expect(checkRateLimit('1.1.1.1', a, 1, 60_000).allowed).toBe(false)
    expect(checkRateLimit('1.1.1.1', b, 1, 60_000).allowed).toBe(true)
  })

  it('opens a fresh window once windowMs has elapsed', () => {
    vi.useFakeTimers()
    const k = key()
    checkRateLimit('1.1.1.1', k, 1, 60_000)
    expect(checkRateLimit('1.1.1.1', k, 1, 60_000).allowed).toBe(false)

    vi.advanceTimersByTime(60_001)
    expect(checkRateLimit('1.1.1.1', k, 1, 60_000)).toMatchObject({ allowed: true, remaining: 0 })
  })

  it('buckets all null/undefined IPs together as "unknown"', () => {
    const k = key()
    expect(checkRateLimit(null, k, 2, 60_000).allowed).toBe(true)
    expect(checkRateLimit(undefined, k, 2, 60_000).allowed).toBe(true)
    // Both calls landed in the same bucket, so the limit is now exhausted.
    expect(checkRateLimit(null, k, 2, 60_000).allowed).toBe(false)
  })

  it('reports retryAfterSec counting down within the window', () => {
    vi.useFakeTimers()
    const k = key()
    checkRateLimit('1.1.1.1', k, 1, 60_000)
    vi.advanceTimersByTime(50_000)
    expect(checkRateLimit('1.1.1.1', k, 1, 60_000).retryAfterSec).toBe(10)
  })
})

describe('getClientIp', () => {
  const req = (headers: Record<string, string>) => new Request('https://x.test', { headers })

  it('takes the first entry of x-forwarded-for', () => {
    expect(getClientIp(req({ 'x-forwarded-for': '203.0.113.5, 70.41.3.18' }))).toBe('203.0.113.5')
  })

  it('trims whitespace', () => {
    expect(getClientIp(req({ 'x-forwarded-for': '  203.0.113.5 , 70.41.3.18' }))).toBe('203.0.113.5')
  })

  it('falls back to x-real-ip', () => {
    expect(getClientIp(req({ 'x-real-ip': '198.51.100.7' }))).toBe('198.51.100.7')
  })

  it('returns "unknown" when neither header is present', () => {
    expect(getClientIp(req({}))).toBe('unknown')
  })
})
