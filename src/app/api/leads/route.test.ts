import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mock = vi.hoisted(() => ({ lookup: vi.fn(), insert: vi.fn(), notify: vi.fn(), eq: vi.fn(), captcha: vi.fn(), rate: vi.fn() }));
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
