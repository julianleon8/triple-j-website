import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
// Image uploads can hit 10-15s on LTE with a 2MB blob. 30s gives headroom
// without spending a full Vercel function budget.
export const maxDuration = 30

// Map the jobs.job_type enum to gallery_items.type. gallery_items.type is
// free text but the front-end expects a small set (Carport / Garage / Barn /
// RV Cover / Lean-To / Porch Cover / Hybrid / Other).
const JOB_TYPE_TO_GALLERY_TYPE: Record<string, string> = {
  carport: 'Carport',
  garage:  'Garage',
  barn:    'Barn',
  fence:   'Other',
  other:   'Other',
}

// Map jobs.structure_type to gallery_items.tag.
const STRUCTURE_TO_TAG: Record<string, string> = {
  welded: 'Welded',
  bolted: 'Bolted',
}

// Accept the common iPhone + Android camera outputs. File prep on the client
// normalises to JPEG but we accept PNG/HEIC/WEBP for direct upload too.
const MAX_PHOTO_BYTES = 10 * 1024 * 1024   // 10 MB — image-prep shrinks to well under this
const MIN_PHOTO_BYTES = 8 * 1024            // drop obvious empty uploads

const inputSchema = z.object({
  job_id: z.string().uuid(),
})

function extFromMime(mime: string): string {
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg'
  if (mime === 'image/png')  return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/heic' || mime === 'image/heif') return 'heic'
  return 'jpg'
}

export async function POST(request: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Parse form ────────────────────────────────────────────────────────
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const jobIdRaw = form.get('job_id')
  const file = form.get('file')
  const parsed = inputSchema.safeParse({ job_id: jobIdRaw })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid job_id' }, { status: 400 })
  }
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Missing `file` image' }, { status: 400 })
  }
  if (file.size < MIN_PHOTO_BYTES) {
    return NextResponse.json({ error: 'Photo is empty' }, { status: 400 })
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: 'Photo too large (max 10 MB)' }, { status: 413 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type || '(none)'}` },
      { status: 415 },
    )
  }

  const db = getAdminClient()

  // ── Fetch job ─────────────────────────────────────────────────────────
  const { data: job, error: jobErr } = await db
    .from('jobs')
    .select('id, job_number, job_type, structure_type, city, customer_id, customers(name)')
    .eq('id', parsed.data.job_id)
    .single<{
      id: string
      job_number: string
      job_type: string | null
      structure_type: string | null
      city: string | null
      customer_id: string
      customers: { name: string } | null
    }>()
  if (jobErr || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // ── Upload to Supabase Storage ────────────────────────────────────────
  const ext = extFromMime(file.type)
  const path = `jobs/${job.id}/${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()
  const { data: upload, error: uploadErr } = await db
    .storage
    .from('gallery')
    .upload(path, bytes, { contentType: file.type, upsert: false })
  if (uploadErr || !upload) {
    console.error('job-photo: upload failed', uploadErr)
    return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })
  }
  const { data: { publicUrl } } = db
    .storage
    .from('gallery')
    .getPublicUrl(upload.path)

  // ── Find or create the gallery_item that bundles this job's photos ────
  const { data: existingItem } = await db
    .from('gallery_items')
    .select('id, title')
    .eq('job_id', job.id)
    .limit(1)
    .maybeSingle()

  let galleryItemId: string
  let createdNewItem = false

  if (existingItem) {
    galleryItemId = existingItem.id
  } else {
    const galleryType =
      (job.job_type && JOB_TYPE_TO_GALLERY_TYPE[job.job_type]) ?? 'Other'
    const galleryTag =
      (job.structure_type && STRUCTURE_TO_TAG[job.structure_type]) ?? 'Welded'
    const customerName = job.customers?.name?.trim() ?? null
    const title = customerName
      ? `${customerName} — Job ${job.job_number}`
      : `Job ${job.job_number}`

    // Place at end of sort_order like /api/gallery does, so any future
    // visibility toggle respects insert order.
    const { data: maxRow } = await db
      .from('gallery_items')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle<{ sort_order: number }>()
    const sort_order = (maxRow?.sort_order ?? 0) + 1

    const { data: item, error: itemErr } = await db
      .from('gallery_items')
      .insert({
        title,
        city:        job.city ?? 'Central Texas',
        type:        galleryType,
        tag:         galleryTag,
        alt_text:    title,
        sort_order,
        // Job-captured photos stay PRIVATE by default. Existing RLS policy
        // "Public read active" filters them out of the public /gallery.
        is_active:   false,
        is_featured: false,
        job_id:      job.id,
      })
      .select('id, title')
      .single()
    if (itemErr || !item) {
      console.error('job-photo: item insert failed', itemErr)
      // Roll back the storage upload so we don't orphan the blob.
      await db.storage.from('gallery').remove([upload.path])
      return NextResponse.json({ error: 'Gallery item insert failed' }, { status: 500 })
    }
    galleryItemId = item.id
    createdNewItem = true
  }

  // ── Append photo row ──────────────────────────────────────────────────
  // The first photo of a fresh gallery_item becomes the cover. Subsequent
  // photos on an existing item leave the cover as-is (Julian can re-assign
  // cover via /hq/gallery if he wants).
  const { data: maxSort } = await db
    .from('gallery_photos')
    .select('sort_order')
    .eq('gallery_item_id', galleryItemId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>()
  const nextSort = (maxSort?.sort_order ?? -1) + 1

  const { data: photo, error: photoErr } = await db
    .from('gallery_photos')
    .insert({
      gallery_item_id: galleryItemId,
      image_url:       publicUrl,
      alt_text:        null,
      sort_order:      nextSort,
      is_cover:        createdNewItem && nextSort === 0,
    })
    .select()
    .single()
  if (photoErr || !photo) {
    console.error('job-photo: photo insert failed', photoErr)
    // If we just created the gallery_item and the photo insert failed, roll
    // back the item + storage blob so the DB stays clean.
    if (createdNewItem) {
      await db.from('gallery_items').delete().eq('id', galleryItemId)
    }
    await db.storage.from('gallery').remove([upload.path])
    return NextResponse.json({ error: 'Photo record insert failed' }, { status: 500 })
  }

  return NextResponse.json({
    gallery_item_id: galleryItemId,
    created_item:    createdNewItem,
    photo,
  })
}
