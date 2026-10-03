import { beforeEach, describe, expect, it, vi } from 'vitest'

const mock = vi.hoisted(() => ({ getAlert: vi.fn(), notify: vi.fn() }))
vi.mock('@/lib/posthog-server', () => ({
  getAlert: mock.getAlert,
  POSTHOG_APP_HOST: 'https://us.posthog.com',
  POSTHOG_PROJECT_ID: 643189,
}))
vi.mock('@/lib/notify', () => ({ notifyOwner: mock.notify }))
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: () => ({ allowed: true }), getClientIp: () => 'test' }))
import { POST } from './route'

const ID = '01a0fffb-94a0-0000-fa28-57ca54fe31c2'
const post = (body: unknown) =>
  POST(new Request('https://example.com/api/webhooks/posthog', { method: 'POST', body: JSON.stringify(body) }))

beforeEach(() => {
  vi.clearAllMocks()
  mock.notify.mockResolvedValue({ pushed: 2, emailed: false, errors: [] })
  mock.getAlert.mockResolvedValue({
    id: ID, name: 'Quote submission failed', state: 'Firing', last_value: 1,
    last_notified_at: new Date().toISOString(), last_checked_at: null,
    insight: { short_id: 'Twwvx6O1', name: 'Failed quote submissions per hour' },
  })
})

describe('PostHog alert webhook', () => {
  it('pushes only, after confirming the alert with PostHog', async () => {
    const res = await post({ alert_id: ID, breaches: 'forged text is ignored' })
    expect(res.status).toBe(200)
    expect(mock.getAlert).toHaveBeenCalledWith(ID)
    const arg = mock.notify.mock.calls[0][0]
    expect(arg.email).toBeUndefined()
    expect(JSON.stringify(arg.push)).not.toContain('forged')
  })
  it('does not push for an alert PostHog says is not firing', async () => {
    mock.getAlert.mockResolvedValue({ ...(await mock.getAlert()), state: 'Not firing' })
    expect((await post({ alert_id: ID })).status).toBe(202)
    expect(mock.notify).not.toHaveBeenCalled()
  })
  it('rejects a missing or malformed alert id without calling PostHog', async () => {
    expect((await post({})).status).toBe(400)
    expect((await post({ alert_id: '../alerts' })).status).toBe(400)
    expect(mock.getAlert).not.toHaveBeenCalled()
  })
  it('answers 404 for an id PostHog does not know, 503 when not configured', async () => {
    mock.getAlert.mockRejectedValueOnce(new Error('PostHog API answered 404'))
    expect((await post({ alert_id: ID })).status).toBe(404)
    mock.getAlert.mockResolvedValueOnce(null)
    expect((await post({ alert_id: ID })).status).toBe(503)
    expect(mock.notify).not.toHaveBeenCalled()
  })
})
