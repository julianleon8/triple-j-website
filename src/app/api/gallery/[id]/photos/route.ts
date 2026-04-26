import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/gallery/[id]/photos — list photos for a gallery item, sorted
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { data, error } = await getAdminClient()
    .from('gallery_photos')
    .select('*')
    .eq('gallery_item_id', id)
    .order('is_cover', { ascending: false })
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
  return NextResponse.json({ photos: data })
}

// POST /api/gallery/[id]/photos — upload a new photo for this item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Guard: confirm item exists
  const { data: item } = await getAdminClient()
    .from('gallery_items')
    .select('id, alt_text')
    .eq('id', id)
    .maybeSingle()
  if (!item) return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const alt_text =
    (formData.get('alt_text') as string | null)?.trim() || item.alt_text || ''
  if (!file) return NextResponse.json({ error: 'File is required' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `items/${id}/${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { data: uploadData, error: uploadError } = await getAdminClient()
    .storage
    .from('gallery')
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error('[gallery photos POST] storage upload failed', { path, contentType: file.type, size: bytes.byteLength, uploadError })
    return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 })
  }

  const { data: { publicUrl } } = getAdminClient()
    .storage
    .from('gallery')
    .getPublicUrl(uploadData.path)

  // Place at end of this item's photo order
  const { data: maxRow } = await getAdminClient()
    .from('gallery_photos')
    .select('sort_order')
    .eq('gallery_item_id', id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const sort_order = (maxRow?.sort_order ?? 0) + 1

  const { data: photo, error } = await getAdminClient()
    .from('gallery_photos')
    .insert({
      gallery_item_id: id,
      image_url: publicUrl,
      alt_text,
      sort_order,
      is_cover: false,
    })
    .select()
    .single()

  if (error || !photo) {
    console.error('[gallery photos POST] gallery_photos insert failed', { itemId: id, error })
    await getAdminClient().storage.from('gallery').remove([uploadData.path])
    return NextResponse.json({ error: `Photo record insert failed: ${error?.message ?? 'unknown'}` }, { status: 500 })
  }

  return NextResponse.json({ photo }, { status: 201 })
}
