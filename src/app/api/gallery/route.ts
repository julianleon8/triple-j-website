import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

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
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 })
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

  const { data, error } = await getAdminClient()
    .from('gallery_items')
    .insert({ title, city, type, tag, alt_text, image_url: publicUrl, sort_order })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Database insert failed' }, { status: 500 })
  return NextResponse.json({ item: data }, { status: 201 })
}
