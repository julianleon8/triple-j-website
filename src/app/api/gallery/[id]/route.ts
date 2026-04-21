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

// DELETE /api/gallery/[id] — remove from DB and Storage
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Fetch image_url so we can remove from Storage if applicable
  const { data: item } = await getAdminClient()
    .from('gallery_items')
    .select('image_url')
    .eq('id', id)
    .single()

  const { error } = await getAdminClient()
    .from('gallery_items')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })

  // Remove from Supabase Storage if it's a storage URL
  if (item?.image_url?.includes('supabase.co/storage')) {
    const storagePath = item.image_url.split('/gallery/')[1]
    if (storagePath) {
      await getAdminClient().storage.from('gallery').remove([storagePath])
    }
  }

  return NextResponse.json({ success: true })
}
