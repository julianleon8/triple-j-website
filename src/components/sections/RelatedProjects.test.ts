import { beforeEach, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
const mocks = vi.hoisted(() => ({ eq: vi.fn(), result: { data: [] as unknown[], error: null as unknown } }));
vi.mock('@/lib/supabase/admin', () => ({ getAdminClient: () => ({ from: () => {
  const query = { select: () => query, eq: (...args: unknown[]) => { mocks.eq(...args); return query; }, order: () => query, limit: () => query, then: (resolve: (value: unknown) => void) => Promise.resolve(mocks.result).then(resolve) };
  return query;
} }) }));
import { RelatedProjects } from './RelatedProjects';
beforeEach(() => { vi.clearAllMocks(); mocks.result = { data: [], error: null }; });
it('does not claim HOA relevance without metadata', async () => {
  expect(await RelatedProjects({ service: 'hoa-compliant-structures' })).toBeNull();
  expect(mocks.eq).not.toHaveBeenCalled();
});
it('requires both carport type and turnkey tag', async () => {
  expect(await RelatedProjects({ service: 'turnkey-carports-with-concrete' })).toBeNull();
  expect(mocks.eq).toHaveBeenCalledWith('type', 'Carport');
  expect(mocks.eq).toHaveBeenCalledWith('tag', 'Turnkey');
  expect(mocks.eq).toHaveBeenCalledWith('is_active', true);
});
it('renders available projects with captions and working detail links', async () => {
  mocks.result.data = [{ id: 'project-id', title: 'A garage', city: 'Temple', gallery_photos: [{ image_url: '/images/metal-garage-green.jpg', alt_text: null, is_cover: true, sort_order: 0 }] }];
  const html = renderToStaticMarkup(await RelatedProjects({ service: 'metal-garages' }));
  expect(html).toContain('/gallery/project-id');
  expect(html).toContain('A garage');
  expect(html).toContain('Temple');
});
it('omits the optional section on query failure', async () => {
  mocks.result.error = { message: 'offline' };
  expect(await RelatedProjects({ service: 'barns' })).toBeNull();
});
