import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mock = vi.hoisted(() => ({ lookup: vi.fn(), insert: vi.fn(), notify: vi.fn(), eq: vi.fn(), captcha: vi.fn(), rate: vi.fn(), track: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/supabase/admin', () => ({ getAdminClient: () => ({ from: (table: string) => {
  if (table === 'gallery_items') {
    const query = { select: () => query, eq: (...args: unknown[]) => { mock.eq(...args); return query; }, maybeSingle: mock.lookup };
    return query;
  }
  return { insert: (data: unknown) => { mock.insert(data); return { select: () => ({ single: async () => ({ data: { ...(data as object), id: 'new-lead' }, error: null }) }) }; } };
} }) }));
vi.mock('@/lib/lead-notifications', () => ({ notifyNewLead: mock.notify }));
vi.mock('@/lib/captcha', () => ({ verifyHCaptchaToken: mock.captcha }));
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: mock.rate, getClientIp: () => 'test' }));
vi.mock('@/lib/posthog-server', () => ({ trackLeadCreated: mock.track }));
import { POST } from './route';

const id = '162e4b86-b8d7-4bbb-b828-bc23f90d256d';
const request = (extra = {}) => new NextRequest('https://example.com/api/leads', { method: 'POST', body: JSON.stringify({ name: 'Test Person', phone: '2545550100', zip: '76502', service_type: 'garage', message: 'Please make it taller.', ...extra }) });

beforeEach(() => {
  vi.clearAllMocks();
  mock.rate.mockReturnValue({ allowed: true });
  mock.captcha.mockResolvedValue({ success: true });
  mock.lookup.mockResolvedValue({ data: { id, title: 'Verified garage', city: 'Temple', type: 'Garage' }, error: null });
  mock.notify.mockResolvedValue(undefined);
});

describe('lead project handoff', () => {
  it('saves canonical reference and customer notes and passes them to notifications', async () => {
    const response = await POST(request({ reference_project_id: id, reference_title: 'Untrusted title', utm_source: 'test-campaign' }));
    expect(response.status).toBe(200);
    expect(mock.eq).toHaveBeenCalledWith('is_active', true);
    const saved = mock.insert.mock.calls[0][0];
    expect(saved.message).toContain('Verified garage');
    expect(saved.message).toContain(`/gallery/${id}`);
    expect(saved.message).toContain('Customer notes:\nPlease make it taller.');
    expect(saved.message).not.toContain('Untrusted title');
    expect(saved.utm_source).toBe('test-campaign');
    expect(mock.notify.mock.calls[0][0].lead.message).toBe(saved.message);
  });
  it('accepts a removed or inactive reference without attaching it', async () => {
    mock.lookup.mockResolvedValue({ data: null, error: null });
    expect((await POST(request({ reference_project_id: id }))).status).toBe(200);
    expect(mock.insert.mock.calls[0][0].message).not.toContain('Project inspiration');
  });
  it('returns a retryable response without saving or notifying on lookup failure', async () => {
    mock.lookup.mockResolvedValue({ data: null, error: { message: 'unavailable' } });
    expect((await POST(request({ reference_project_id: id }))).status).toBe(503);
    expect(mock.insert).not.toHaveBeenCalled();
    expect(mock.notify).not.toHaveBeenCalled();
  });
  it('rejects malformed IDs and preserves ordinary inquiries without lookup', async () => {
    expect((await POST(request({ reference_project_id: 'bad-id' }))).status).toBe(400);
    expect((await POST(request())).status).toBe(200);
    expect(mock.lookup).not.toHaveBeenCalled();
  });
  it('does not look up or save projects when captcha fails', async () => {
    mock.captcha.mockResolvedValue({ success: false });
    expect((await POST(request({ reference_project_id: id }))).status).toBe(400);
    expect(mock.lookup).not.toHaveBeenCalled();
    expect(mock.insert).not.toHaveBeenCalled();
  });
});

describe('lead funnel source', () => {
  it('defaults to website_form when the client sends nothing', async () => {
    expect((await POST(request())).status).toBe(200);
    expect(mock.insert.mock.calls[0][0].source).toBe('website_form');
  });
  it('records a quote_page submission against its own funnel', async () => {
    expect((await POST(request({ source: 'quote_page' }))).status).toBe(200);
    expect(mock.insert.mock.calls[0][0].source).toBe('quote_page');
  });
  it('rejects a source the public form has no business sending', async () => {
    // These are real leads.source values, but every one of them is set
    // server-side by its own ingest path. Rejecting here means the DB CHECK
    // constraint is unreachable from this route, so a bad value can never
    // become a 500 that loses the lead.
    for (const source of ['facebook_lead_ads', 'voice_memo', 'referral', 'hq_test']) {
      vi.clearAllMocks();
      mock.rate.mockReturnValue({ allowed: true });
      mock.captcha.mockResolvedValue({ success: true });
      expect((await POST(request({ source }))).status).toBe(400);
      expect(mock.insert).not.toHaveBeenCalled();
      expect(mock.notify).not.toHaveBeenCalled();
    }
  });
});

describe('best time to call', () => {
  it('saves the window and passes it to the owner alert', async () => {
    expect((await POST(request({ best_time_to_call: 'evening' }))).status).toBe(200);
    expect(mock.insert.mock.calls[0][0].best_time_to_call).toBe('evening');
    expect(mock.notify.mock.calls[0][0].lead.best_time_to_call).toBe('evening');
  });
  it('stores null rather than an empty string when unanswered', async () => {
    expect((await POST(request())).status).toBe(200);
    expect(mock.insert.mock.calls[0][0].best_time_to_call).toBeNull();
  });
  it('rejects a window outside the three the column allows', async () => {
    expect((await POST(request({ best_time_to_call: 'midnight' }))).status).toBe(400);
    expect(mock.insert).not.toHaveBeenCalled();
  });
});

describe('lead_created analytics event', () => {
  it('joins the browser session and carries no identifying fields', async () => {
    const response = await POST(request({
      email: 'test@example.com',
      utm_source: 'google',
      gclid: 'abc',
      posthog_distinct_id: 'anon-123',
      posthog_session_id: 'session-456',
    }));
    expect(response.status).toBe(200);
    expect(mock.track).toHaveBeenCalledTimes(1);
    const sent = mock.track.mock.calls[0][0];
    expect(sent).toMatchObject({ leadId: 'new-lead', distinctId: 'anon-123', sessionId: 'session-456' });
    expect(sent.properties).toMatchObject({ service_type: 'garage', utm_source: 'google', has_gclid: true, has_email: true });
    const serialized = JSON.stringify(sent);
    for (const pii of ['Test Person', '2545550100', 'test@example.com', 'Please make it taller.']) {
      expect(serialized).not.toContain(pii);
    }
    expect(mock.insert.mock.calls[0][0]).not.toHaveProperty('posthog_distinct_id');
    expect(sent.properties.internal_traffic).toBeUndefined();
  });
  it('marks a lead sent from the owner\'s browser as internal traffic', async () => {
    expect((await POST(request({ posthog_internal: true }))).status).toBe(200);
    expect(mock.track.mock.calls[0][0].properties.internal_traffic).toBe(true);
  });
  it('is not sent when the lead is rejected', async () => {
    mock.captcha.mockResolvedValue({ success: false });
    expect((await POST(request())).status).toBe(400);
    expect(mock.track).not.toHaveBeenCalled();
  });
});

describe('3D builder leads', () => {
  const garage = {
    v: 1, use: 'garage', width: 30, length: 30, height: 10, roof: 'gable', frame: 'welded', heavyDuty: true,
    walls: { front: 'enclosed', back: 'enclosed', left: 'enclosed', right: 'enclosed' },
    openings: [{ id: 'd1', spec: 'r10x10', wall: 'front', x: 10 }],
    leanTos: [], colors: { roof: 'Charcoal', walls: 'Light-Stone', trim: 'Charcoal', wainscot: null }, concrete: 'yes',
  };

  it('saves the design and takes the build facts from it, not the browser', async () => {
    const response = await POST(request({ source: 'builder', design: garage, service_type: 'carport', width: '99', message: 'Gate on the north side' }));
    expect(response.status).toBe(200);
    const saved = mock.insert.mock.calls[0][0];
    expect(saved).toMatchObject({ source: 'builder', service_type: 'garage', structure_type: 'welded', needs_concrete: 'yes', design: garage });
    expect(saved.message).toContain('Designed in the 3D builder:');
    expect(saved.message).toContain('heavy-duty upgrade (11-gauge columns)');
    expect(saved.message).toMatch(/Open the design in 3D: https?:\/\/\S+\/build#d=[\w-]+/);
    expect(saved.message).toContain('Customer notes:\nGate on the north side');
    expect(mock.notify.mock.calls[0][0].sizeLine).toBe('30W × 30L × 10H ft');
    expect(mock.track.mock.calls[0][0].properties).toMatchObject({ source: 'builder', service_type: 'garage' });
  });

  it('fills in the add-ons as none on a design sent without them', async () => {
    expect((await POST(request({ source: 'builder', design: garage }))).status).toBe(200);
    const saved = mock.insert.mock.calls[0][0];
    expect(saved.design).toMatchObject({ storage: null, gutters: false, insulation: false });
    expect(saved.message).toContain('Storage room: None');
  });

  it('takes a storage room, gutters, insulation and a front lean-to, and words them for the owner', async () => {
    const design = {
      ...garage,
      openings: [{ id: 'd1', spec: 'walk', wall: 'front', x: 13 }],
      leanTos: [{ side: 'front', depth: 8, walls: 'open' }],
      storage: { end: 'back', depth: 10 },
      gutters: true,
      insulation: true,
    };
    const response = await POST(request({ source: 'builder', design }));
    expect(response.status).toBe(200);
    const saved = mock.insert.mock.calls[0][0];
    expect(saved.design).toMatchObject({ storage: { end: 'back', depth: 10 }, gutters: true, insulation: true });
    expect(saved.message).toContain('Storage room: 10 ft deep at the back, closed in, with a walk door');
    expect(saved.message).toContain('Gutters: K-style, with downspouts');
    expect(saved.message).toContain('Insulation: Fiberglass, on the roof and the closed walls');
    expect(saved.message).toContain('Lean-tos: Front: 8 ft deep, open');
  });

  it('refuses a storage room that leaves too little of the building', async () => {
    const response = await POST(request({ source: 'builder', design: { ...garage, storage: { end: 'front', depth: 26 } } }));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/leaves less than 6 ft of the building/);
    expect(mock.insert).not.toHaveBeenCalled();
  });

  it('requires a design from the builder, and refuses one from anywhere else', async () => {
    expect((await POST(request({ source: 'builder' }))).status).toBe(400);
    expect((await POST(request({ source: 'quote_page', design: garage }))).status).toBe(400);
    expect(mock.insert).not.toHaveBeenCalled();
  });

  it('refuses a design that breaks a builder rule', async () => {
    const doorOnOpenWall = { ...garage, walls: { ...garage.walls, front: 'open' } };
    const response = await POST(request({ source: 'builder', design: doorOnOpenWall }));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/needs the front wall enclosed/);
    expect(mock.insert).not.toHaveBeenCalled();
  });

  it('leaves ordinary leads without a design column', async () => {
    expect((await POST(request())).status).toBe(200);
    expect(mock.insert.mock.calls[0][0]).not.toHaveProperty('design');
  });
});
