import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// PATCH /api/gallery/[id] — update metadata or sort_order/is_active
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const allowed = [
    'title',
    'city',
    'type',
    'tag',
    'alt_text',
    'sort_order',
    'is_active',
    'is_featured',
    'panel_color',
    'panel_color_line',
    'trim_color',
    'trim_color_line',
    'panel_profile',
    'gauge',
  ]
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await getAdminClient()
    .from('gallery_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  return NextResponse.json({ item: data })
}

// DELETE /api/gallery/[id] — remove item + Storage objects for every child photo.
// Collect storage paths from gallery_photos BEFORE the item delete; the FK
// cascade drops those rows along with the item.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: photos } = await getAdminClient()
    .from('gallery_photos')
    .select('image_url')
    .eq('gallery_item_id', id)

  const { error } = await getAdminClient()
    .from('gallery_items')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })

  const storagePaths = (photos ?? [])
    .map((p) => {
      if (!p.image_url?.includes('supabase.co/storage')) return null
      return p.image_url.split('/gallery/')[1] ?? null
    })
    .filter((path): path is string => path !== null)

  if (storagePaths.length > 0) {
    await getAdminClient().storage.from('gallery').remove(storagePaths)
  }

  return NextResponse.json({ success: true })
}
