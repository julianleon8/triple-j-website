import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { parseColorValue } from '@/lib/gallery-colors'

export const dynamic = 'force-dynamic'

// GET /api/gallery — public, returns active items ordered by sort_order
export async function GET() {
  const { data, error } = await getAdminClient()
    .from('gallery_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
  return NextResponse.json({ items: data })
}

// POST /api/gallery — authenticated, uploads image + inserts DB row
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const title = (formData.get('title') as string | null)?.trim()
  const city = (formData.get('city') as string | null)?.trim() || 'Central Texas'
  const type = (formData.get('type') as string | null)?.trim() || 'Carport'
  const tag = (formData.get('tag') as string | null)?.trim() || 'Welded'
  const alt_text = (formData.get('alt_text') as string | null)?.trim() || ''
  const panelColorRaw = (formData.get('panel_color') as string | null)?.trim() || ''
  const trimColorRaw = (formData.get('trim_color') as string | null)?.trim() || ''
  const panelProfileRaw = (formData.get('panel_profile') as string | null)?.trim() || ''
  const gaugeRaw = (formData.get('gauge') as string | null)?.trim() || ''
  const is_featured = formData.get('is_featured') === 'true'

  if (!file || !title) {
    return NextResponse.json({ error: 'File and title are required' }, { status: 400 })
  }

  // Upload to Supabase Storage bucket "gallery"
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { data: uploadData, error: uploadError } = await getAdminClient()
    .storage
    .from('gallery')
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error('[gallery POST] storage upload failed', { path, contentType: file.type, size: bytes.byteLength, uploadError })
    return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 })
  }

  const { data: { publicUrl } } = getAdminClient()
    .storage
    .from('gallery')
    .getPublicUrl(uploadData.path)

  // Place at end of sort order
  const { data: maxRow } = await getAdminClient()
    .from('gallery_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sort_order = (maxRow?.sort_order ?? 0) + 1

  const panel = parseColorValue(panelColorRaw)
  const trim = parseColorValue(trimColorRaw)

  const { data: item, error } = await getAdminClient()
    .from('gallery_items')
    .insert({
      title,
      city,
      type,
      tag,
      alt_text,
      sort_order,
      is_featured,
      panel_color: panel?.color ?? null,
      panel_color_line: panel?.line ?? null,
      trim_color: trim?.color ?? null,
      trim_color_line: trim?.line ?? null,
      panel_profile: panelProfileRaw || null,
      gauge: gaugeRaw || null,
    })
    .select()
    .single()

  if (error || !item) {
    console.error('[gallery POST] gallery_items insert failed', { error })
    return NextResponse.json({ error: `Database insert failed: ${error?.message ?? 'unknown'}` }, { status: 500 })
  }

  // Create the initial cover photo row in gallery_photos
  const { data: coverPhoto, error: photoError } = await getAdminClient()
    .from('gallery_photos')
    .insert({
      gallery_item_id: item.id,
      image_url: publicUrl,
      alt_text,
      sort_order: 0,
      is_cover: true,
    })
    .select()
    .single()

  if (photoError) {
    console.error('[gallery POST] gallery_photos insert failed', { itemId: item.id, photoError })
    // Roll back the item insert so we don't leave an orphan
    await getAdminClient().from('gallery_items').delete().eq('id', item.id)
    await getAdminClient().storage.from('gallery').remove([uploadData.path])
    return NextResponse.json({ error: `Photo record insert failed: ${photoError.message}` }, { status: 500 })
  }

  return NextResponse.json({ item: { ...item, gallery_photos: [coverPhoto] } }, { status: 201 })
}
