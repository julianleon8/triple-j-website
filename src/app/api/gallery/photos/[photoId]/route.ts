import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// PATCH /api/gallery/photos/[photoId] — update sort_order, is_cover, or alt_text
//
// Setting is_cover=true triggers a sequential swap: unset the current cover
// on the parent item first (partial-unique index on gallery_item_id where
// is_cover=true would otherwise reject the insert), then set this photo.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { photoId } = await params
  const body = await request.json().catch(() => ({}))

  const allowed = ['sort_order', 'is_cover', 'alt_text']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  // If promoting to cover, unset the current cover on the same item first
  if (updates.is_cover === true) {
    const { data: photo } = await getAdminClient()
      .from('gallery_photos')
      .select('gallery_item_id')
      .eq('id', photoId)
      .maybeSingle()
    if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

    await getAdminClient()
      .from('gallery_photos')
      .update({ is_cover: false })
      .eq('gallery_item_id', photo.gallery_item_id)
      .eq('is_cover', true)
  }

  const { data, error } = await getAdminClient()
    .from('gallery_photos')
    .update(updates)
    .eq('id', photoId)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  return NextResponse.json({ photo: data })
}

// DELETE /api/gallery/photos/[photoId] — remove photo row + storage object.
// If the deleted photo was the cover, auto-promote the next-sorted photo.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { photoId } = await params

  const { data: photo } = await getAdminClient()
    .from('gallery_photos')
    .select('id, gallery_item_id, image_url, is_cover')
    .eq('id', photoId)
    .maybeSingle()
  if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

  const { error } = await getAdminClient()
    .from('gallery_photos')
    .delete()
    .eq('id', photoId)
  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })

  if (photo.image_url?.includes('supabase.co/storage')) {
    const storagePath = photo.image_url.split('/gallery/')[1]
    if (storagePath) {
      await getAdminClient().storage.from('gallery').remove([storagePath])
    }
  }

  // Auto-promote next-sorted photo to cover if this was the cover
  if (photo.is_cover) {
    const { data: next } = await getAdminClient()
      .from('gallery_photos')
      .select('id')
      .eq('gallery_item_id', photo.gallery_item_id)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (next) {
      await getAdminClient()
        .from('gallery_photos')
        .update({ is_cover: true })
        .eq('id', next.id)
    }
  }

  return NextResponse.json({ success: true })
}
