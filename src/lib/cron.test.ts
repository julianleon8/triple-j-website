import { describe, it, expect } from 'vitest'
import { computeStreaks, type CronRunRow } from './cron'

// Rows arrive newest-first, the order the cron_runs query returns them in.
const run = (over: Partial<CronRunRow> = {}): CronRunRow => ({
  started_at: '2026-09-06T14:00:00.000Z',
  ok: true,
  yield: 1,
  ...over,
})

describe('computeStreaks', () => {
  it('reports nothing for a job that has never run', () => {
    expect(computeStreaks([])).toEqual({
      lastSuccessAt: null,
      consecutiveZeroYield: 0,
      consecutiveFailures: 0,
    })
  })

  it('takes lastSuccessAt from the newest successful run', () => {
    const { lastSuccessAt } = computeStreaks([
      run({ started_at: '2026-09-06T14:00:00.000Z' }),
      run({ started_at: '2026-09-05T14:00:00.000Z' }),
    ])
    expect(lastSuccessAt).toEqual(new Date('2026-09-06T14:00:00.000Z'))
  })

  it('skips in-flight rows', () => {
    // withCronRun opens the current run's row before calling the job, so the
    // job always sees one ok:null row — its own. It must not count.
    const { lastSuccessAt, consecutiveFailures } = computeStreaks([
      run({ ok: null, yield: 0 }),
      run({ started_at: '2026-09-05T14:00:00.000Z' }),
    ])
    expect(lastSuccessAt).toEqual(new Date('2026-09-05T14:00:00.000Z'))
    expect(consecutiveFailures).toBe(0)
  })

  it('counts consecutive zero-yield successes', () => {
    const { consecutiveZeroYield } = computeStreaks([
      run({ yield: 0 }),
      run({ yield: 0 }),
      run({ yield: 0 }),
      run({ yield: 5 }),
    ])
    expect(consecutiveZeroYield).toBe(3)
  })

  it('stops the zero-yield streak at the first productive run', () => {
    const { consecutiveZeroYield } = computeStreaks([
      run({ yield: 3 }),
      run({ yield: 0 }),
      run({ yield: 0 }),
    ])
    expect(consecutiveZeroYield).toBe(0)
  })

  it('does not let a failed run reset the zero-yield streak', () => {
    // A run that failed never got to produce a yield, so it is not evidence
    // either way. An outage in the middle of a dry spell must not make the
    // scraper look healthy again.
    const { consecutiveZeroYield } = computeStreaks([
      run({ yield: 0 }),
      run({ ok: false, yield: 0 }),
      run({ yield: 0 }),
      run({ yield: 9 }),
    ])
    expect(consecutiveZeroYield).toBe(2)
  })

  it('counts consecutive failures from the newest run back', () => {
    const { consecutiveFailures } = computeStreaks([
      run({ ok: false }),
      run({ ok: false }),
      run({ ok: true }),
      run({ ok: false }),
    ])
    expect(consecutiveFailures).toBe(2)
  })

  it('reports no failure streak when the newest run succeeded', () => {
    const { consecutiveFailures } = computeStreaks([
      run({ ok: true }),
      run({ ok: false }),
      run({ ok: false }),
    ])
    expect(consecutiveFailures).toBe(0)
  })

  it('still reports lastSuccessAt while a job is failing', () => {
    const { lastSuccessAt, consecutiveFailures } = computeStreaks([
      run({ ok: false }),
      run({ ok: false }),
      run({ ok: true, started_at: '2026-09-01T14:00:00.000Z' }),
    ])
    expect(consecutiveFailures).toBe(2)
    expect(lastSuccessAt).toEqual(new Date('2026-09-01T14:00:00.000Z'))
  })
})
