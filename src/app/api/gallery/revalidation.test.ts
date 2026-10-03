import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// Every HQ write that changes what the public gallery shows must mark those
// pages stale — and a write that failed or was refused must not.

type Result = { data?: unknown; error?: unknown }
const mock = vi.hoisted(() => ({
  revalidate: vi.fn(),
  denied: null as Response | null,
  // Keyed `${table}.${verb}` — the first of select/insert/update/delete called.
  results: {} as Record<string, Result>,
}))

vi.mock('@/lib/gallery-revalidate', () => ({ revalidateGallery: mock.revalidate }))
vi.mock('@/lib/auth', () => ({ requireOwner: async () => mock.denied, getOwner: async () => ({ id: 'owner' }) }))
vi.mock('@/lib/supabase/admin', () => ({
  getAdminClient: () => ({
    from: (table: string) => {
      let verb = ''
      const result = () => Promise.resolve({ data: null, error: null, ...mock.results[`${table}.${verb}`] })
      const query: Record<string, unknown> = {
        single: result,
        maybeSingle: result,
        then: (resolve: (r: Result) => unknown, reject: (e: unknown) => unknown) => result().then(resolve, reject),
      }
      for (const v of ['select', 'insert', 'update', 'delete']) query[v] = () => { verb ||= v; return query }
      for (const m of ['eq', 'order', 'limit']) query[m] = () => query
      return query
    },
    storage: {
      from: () => ({
        upload: async (path: string) => ({ data: { path }, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `https://x.supabase.co/storage/v1/object/public/gallery/${path}` } }),
        remove: async () => ({ data: null, error: null }),
      }),
    },
  }),
}))

import * as items from './route'
import * as item from './[id]/route'
import * as itemPhotos from './[id]/photos/route'
import * as photo from './photos/[photoId]/route'
import * as jobPhoto from '../hq/job-photo/route'

const ITEM = '2b1c8a4e-3f0d-4f7e-9a51-6f3e2d1c0b9a'
const JOB = '9d8e7f6a-5b4c-4d3e-8f2a-1b0c9d8e7f6a'

const json = (body: unknown, method = 'PATCH') =>
  new NextRequest('https://example.com/api', { method, body: JSON.stringify(body) })
const form = (fields: Record<string, string | Blob>) => {
  const data = new FormData()
  for (const [k, v] of Object.entries(fields)) data.append(k, v)
  return new NextRequest('https://example.com/api', { method: 'POST', body: data })
}
const image = (bytes = 16 * 1024) => new File([new Uint8Array(bytes)], 'build.jpg', { type: 'image/jpeg' })
const params = <T,>(p: T) => ({ params: Promise.resolve(p) })

beforeEach(() => {
  vi.clearAllMocks()
  mock.denied = null
  mock.results = {}
})

describe('POST /api/gallery', () => {
  it('revalidates the new item once both rows land', async () => {
    mock.results['gallery_items.insert'] = { data: { id: ITEM } }
    mock.results['gallery_photos.insert'] = { data: { id: 'cover' } }
    expect((await items.POST(form({ file: image(), title: 'Temple carport' }))).status).toBe(201)
    expect(mock.revalidate).toHaveBeenCalledWith(ITEM)
  })
  it('does not revalidate when the insert is rolled back', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mock.results['gallery_items.insert'] = { data: { id: ITEM } }
    mock.results['gallery_photos.insert'] = { error: { message: 'boom' } }
    expect((await items.POST(form({ file: image(), title: 'Temple carport' }))).status).toBe(500)
    expect(mock.revalidate).not.toHaveBeenCalled()
  })
  it('does not revalidate for a non-owner', async () => {
    mock.denied = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    expect((await items.POST(form({ file: image(), title: 'x' }))).status).toBe(401)
    expect(mock.revalidate).not.toHaveBeenCalled()
  })
})

describe('PATCH /api/gallery/[id]', () => {
  it('revalidates on publish and on unpublish', async () => {
    for (const is_active of [true, false]) {
      mock.results['gallery_items.update'] = { data: { id: ITEM, is_active } }
      expect((await item.PATCH(json({ is_active }), params({ id: ITEM }))).status).toBe(200)
    }
    expect(mock.revalidate).toHaveBeenCalledTimes(2)
    expect(mock.revalidate).toHaveBeenCalledWith(ITEM)
  })
  it('does not revalidate a missing item or an empty update', async () => {
    expect((await item.PATCH(json({ title: 'x' }), params({ id: ITEM }))).status).toBe(404)
    expect((await item.PATCH(json({ nope: 1 }), params({ id: ITEM }))).status).toBe(400)
    expect(mock.revalidate).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/gallery/[id]', () => {
  it('revalidates after the delete', async () => {
    mock.results['gallery_photos.select'] = { data: [] }
    expect((await item.DELETE(json({}, 'DELETE'), params({ id: ITEM }))).status).toBe(200)
    expect(mock.revalidate).toHaveBeenCalledWith(ITEM)
  })
  it('does not revalidate a failed delete', async () => {
    mock.results['gallery_items.delete'] = { error: { message: 'fk' } }
    expect((await item.DELETE(json({}, 'DELETE'), params({ id: ITEM }))).status).toBe(500)
    expect(mock.revalidate).not.toHaveBeenCalled()
  })
})

describe('POST /api/gallery/[id]/photos', () => {
  it('revalidates the parent item', async () => {
    mock.results['gallery_items.select'] = { data: { id: ITEM, alt_text: '' } }
    mock.results['gallery_photos.insert'] = { data: { id: 'p2' } }
    expect((await itemPhotos.POST(form({ file: image() }), params({ id: ITEM }))).status).toBe(201)
    expect(mock.revalidate).toHaveBeenCalledWith(ITEM)
  })
  it('does not revalidate when the item is gone', async () => {
    expect((await itemPhotos.POST(form({ file: image() }), params({ id: ITEM }))).status).toBe(404)
    expect(mock.revalidate).not.toHaveBeenCalled()
  })
})

describe('/api/gallery/photos/[photoId]', () => {
  it('PATCH revalidates the parent item', async () => {
    mock.results['gallery_photos.select'] = { data: { gallery_item_id: ITEM } }
    mock.results['gallery_photos.update'] = { data: { id: 'p1', gallery_item_id: ITEM } }
    expect((await photo.PATCH(json({ is_cover: true }), params({ photoId: 'p1' }))).status).toBe(200)
    expect(mock.revalidate).toHaveBeenCalledWith(ITEM)
  })
  it('DELETE revalidates the parent item', async () => {
    mock.results['gallery_photos.select'] = { data: { id: 'p1', gallery_item_id: ITEM, image_url: '/x.jpg', is_cover: false } }
    expect((await photo.DELETE(json({}, 'DELETE'), params({ photoId: 'p1' }))).status).toBe(200)
    expect(mock.revalidate).toHaveBeenCalledWith(ITEM)
  })
  it('does not revalidate a missing photo', async () => {
    expect((await photo.DELETE(json({}, 'DELETE'), params({ photoId: 'p1' }))).status).toBe(404)
    expect((await photo.PATCH(json({ alt_text: 'x' }), params({ photoId: 'p1' }))).status).toBe(404)
    expect(mock.revalidate).not.toHaveBeenCalled()
  })
})

describe('POST /api/hq/job-photo', () => {
  beforeEach(() => {
    mock.results['jobs.select'] = { data: { id: JOB, job_number: 'J-1', job_type: 'carport', structure_type: 'welded', city: 'Temple', customer_id: 'c', customers: null } }
    mock.results['gallery_photos.insert'] = { data: { id: 'p9' } }
  })
  it('revalidates when the job is already published', async () => {
    mock.results['gallery_items.select'] = { data: { id: ITEM, title: 'Job J-1', is_active: true } }
    expect((await jobPhoto.POST(form({ job_id: JOB, file: image() }))).status).toBe(200)
    expect(mock.revalidate).toHaveBeenCalledWith(ITEM)
  })
  it('stays quiet for private jobsite photos', async () => {
    mock.results['gallery_items.select'] = { data: { id: ITEM, title: 'Job J-1', is_active: false } }
    expect((await jobPhoto.POST(form({ job_id: JOB, file: image() }))).status).toBe(200)
    mock.results['gallery_items.select'] = { data: null }
    mock.results['gallery_items.insert'] = { data: { id: ITEM, title: 'Job J-1' } }
    expect((await jobPhoto.POST(form({ job_id: JOB, file: image() }))).status).toBe(200)
    expect(mock.revalidate).not.toHaveBeenCalled()
  })
})
