/**
 * Time-series bucket helpers for the /hq home dashboard.
 *
 * Each function returns an array of { date, value } pairs across a rolling
 * 30-day window so Recharts sparklines have something to draw even on quiet
 * days (zero-filled).
 */

export type DayBucket = { date: string; value: number }

function emptyDays(n: number): DayBucket[] {
  const out: DayBucket[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    out.push({ date: d.toISOString().slice(0, 10), value: 0 })
  }
  return out
}

function toDayKey(iso: string) {
  return iso.slice(0, 10)
}

export function bucketByDay(
  rows: { created_at: string }[],
  days = 30
): DayBucket[] {
  const buckets = emptyDays(days)
  const index = new Map(buckets.map((b, i) => [b.date, i]))
  for (const r of rows) {
    const key = toDayKey(r.created_at)
    const idx = index.get(key)
    if (idx !== undefined) buckets[idx].value += 1
  }
  return buckets
}

export function sumByDay(
  rows: { created_at: string; amount: number | null }[],
  days = 30
): DayBucket[] {
  const buckets = emptyDays(days)
  const index = new Map(buckets.map((b, i) => [b.date, i]))
  for (const r of rows) {
    const key = toDayKey(r.created_at)
    const idx = index.get(key)
    if (idx !== undefined) buckets[idx].value += Number(r.amount ?? 0)
  }
  return buckets
}
