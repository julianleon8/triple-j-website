import { describe, expect, it } from 'vitest'

import { ALERT_FRESH_MS, alertPush } from './posthog-alert'
import { buildWeeklyPush, parseWeeklyRow } from './weekly-ads'

const NOW = new Date('2026-10-05T15:00:00.000Z')
const PROJECT = 'https://us.posthog.com/project/643189'

const alert = (over = {}) => ({
  id: '01a0fffb-94a0-0000-fa28-57ca54fe31c2',
  name: 'Quote submission failed',
  state: 'Firing',
  last_value: 2,
  last_notified_at: new Date(NOW.getTime() - 60_000).toISOString(),
  last_checked_at: null,
  insight: { short_id: 'Twwvx6O1', name: 'Failed quote submissions per hour' },
  ...over,
})

describe('alertPush', () => {
  it('pushes a fresh firing alert, linked to its chart', () => {
    const push = alertPush(alert(), NOW, PROJECT)
    expect(push).toEqual({
      title: '⚠️ Quote submission failed',
      body: 'Failed quote submissions per hour: 2. Tap to open the chart.',
      url: `${PROJECT}/insights/Twwvx6O1`,
      tag: 'posthog-alert-01a0fffb-94a0-0000-fa28-57ca54fe31c2',
    })
  })
  it('stays silent for an alert PostHog does not say is firing', () => {
    expect(alertPush(alert({ state: 'Not firing' }), NOW, PROJECT)).toBeNull()
  })
  it('stays silent when the firing is stale, so a replayed request cannot re-push it', () => {
    const old = new Date(NOW.getTime() - ALERT_FRESH_MS - 1000).toISOString()
    expect(alertPush(alert({ last_notified_at: old }), NOW, PROJECT)).toBeNull()
    expect(alertPush(alert({ last_notified_at: null }), NOW, PROJECT)).toBeNull()
  })
  it('never builds a link from an unexpected insight id', () => {
    const push = alertPush(alert({ insight: { short_id: '../../evil', name: 'x' } }), NOW, PROJECT)
    expect(push?.url).toBe(PROJECT)
  })
})

describe('weekly ads push', () => {
  const columns = ['leads', 'leads_prev', 'leads_paid', 'calls', 'calls_prev', 'visitors', 'failed']

  it('reads the HogQL row by column name', () => {
    expect(parseWeeklyRow(columns, [3, 1, 2, 7, 7, 140, 0])).toEqual({
      leads: 3, leads_prev: 1, leads_paid: 2, calls: 7, calls_prev: 7, visitors: 140, failed: 0,
    })
    expect(parseWeeklyRow(columns, undefined).leads).toBe(0)
  })
  it('summarises the week and what moved', () => {
    const push = buildWeeklyPush(parseWeeklyRow(columns, [3, 1, 2, 7, 7, 140, 0]), 'https://dash')
    expect(push.title).toBe('📈 Website last week')
    expect(push.body).toBe('3 leads (2 from Google Ads) · 7 call taps · 140 visitors. Leads up from 1 the week before.')
    expect(push.url).toBe('https://dash')
  })
  it('names failed sends and handles singulars and a quiet week', () => {
    const push = buildWeeklyPush(parseWeeklyRow(columns, [1, 1, 0, 0, 2, 1, 1]), 'https://dash')
    expect(push.body).toBe('1 lead · 0 call taps · 1 visitor · 1 failed quote send. Call taps down from 2 the week before.')
  })
})
