import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ select: vi.fn(), result: { data: [] as unknown[] | null, error: null as unknown } }));
vi.mock('@/lib/supabase/admin', () => ({ getAdminClient: () => ({ from: () => {
  const query = {
    select: (columns: string) => { mocks.select(columns); return query; },
    eq: () => query, order: () => query, limit: () => query,
    then: (resolve: (value: unknown) => void) => Promise.resolve(mocks.result).then(resolve),
  };
  return query;
} }) }));
vi.mock('@/lib/site-url', () => ({ getSiteUrl: () => 'https://www.example.com' }));

import sitemap from './sitemap';

beforeEach(() => { vi.clearAllMocks(); mocks.result = { data: [], error: null }; });

it('selects only columns that exist on gallery_items', async () => {
  await sitemap();
  // Migrations 003–033 never add updated_at; selecting it fails the whole query.
  expect(mocks.select.mock.calls[0][0]).not.toMatch(/updated_at/);
});

it('lists gallery projects with absolute, cover-first image URLs', async () => {
  mocks.result = { data: [{
    id: 'p1', created_at: '2026-04-16T16:23:27Z',
    gallery_photos: [
      { image_url: 'https://cdn.example.com/b.jpg', sort_order: 0, is_cover: false },
      { image_url: '/images/a.jpg', sort_order: 1, is_cover: true },
    ],
  }], error: null };
  const entry = (await sitemap()).find((e) => e.url === 'https://www.example.com/gallery/p1');
  expect(entry?.images).toEqual(['https://www.example.com/images/a.jpg', 'https://cdn.example.com/b.jpg']);
  expect(entry?.lastModified).toEqual(new Date('2026-04-16T16:23:27Z'));
});

it('dates a project by its newest photo when photos were added later', async () => {
  mocks.result = { data: [{
    id: 'p2', created_at: '2026-04-16T16:23:27Z',
    gallery_photos: [
      { image_url: '/images/a.jpg', sort_order: 0, is_cover: true, created_at: '2026-04-16T16:30:00Z' },
      { image_url: '/images/b.jpg', sort_order: 1, is_cover: false, created_at: '2026-09-02T10:00:00Z' },
    ],
  }], error: null };
  const entry = (await sitemap()).find((e) => e.url === 'https://www.example.com/gallery/p2');
  expect(mocks.select.mock.calls[0][0]).toMatch(/gallery_photos \( [^)]*created_at/);
  expect(entry?.lastModified).toEqual(new Date('2026-09-02T10:00:00Z'));
});

it('dates a blog post no earlier than its publication or the 2026-10-03 revision', async () => {
  const { BLOG_POSTS } = await import('@/lib/blog');
  const entries = await sitemap();
  for (const post of BLOG_POSTS) {
    const entry = entries.find((e) => e.url === `https://www.example.com/blog/${post.slug}`);
    expect(new Date(entry?.lastModified as Date).getTime()).toBeGreaterThanOrEqual(new Date(post.date).getTime());
    expect(new Date(entry?.lastModified as Date).getTime()).toBeGreaterThanOrEqual(new Date('2026-10-03T00:00:00Z').getTime());
  }
});

it('still ships the static sitemap when the gallery query errors', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  mocks.result = { data: null, error: { message: 'column gallery_items.updated_at does not exist' } };
  const entries = await sitemap();
  expect(entries.some((e) => e.url === 'https://www.example.com/')).toBe(true);
  expect(entries.some((e) => e.url.includes('/gallery/'))).toBe(false);
  expect(console.warn).toHaveBeenCalled();
});
