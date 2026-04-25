import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import {
  extractReceiptFromImage,
  ReceiptExtractionError,
} from '@/lib/receipt-extractor'

export const dynamic = 'force-dynamic'
// Vision extraction can take ~6-10s on a busy receipt. 45s budget keeps us
// well clear of timeouts on slow LTE round-trips.
export const maxDuration = 45

const inputSchema = z.object({
  job_id: z.string().uuid(),
})

const MAX_RECEIPT_BYTES = 10 * 1024 * 1024  // 10 MB
const MIN_RECEIPT_BYTES = 8 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
])

function extFromMime(mime: string): string {
  if (mime === 'image/png')  return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif')  return 'gif'
  return 'jpg'
}

/**
 * POST /api/hq/receipt
 * Multipart: { job_id, file (image) }
 *
 * Steps:
 *   1. Auth check (owner only).
 *   2. Validate input + image bytes.
 *   3. Upload image to Supabase Storage (`gallery` bucket,
 *      `jobs/{job_id}/receipts/{ts}.{ext}` path).
 *   4. Send image to Claude Sonnet 4.6 vision for structured extraction.
 *   5. Insert job_receipts row with extracted fields + image_url +
 *      qbo_pushed_at = null. The /confirm route handles the QBO push.
 *
 * Returns: { id, extracted, image_url }.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let form: FormData
  try { form = await request.formData() } catch {
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
  if (file.size < MIN_RECEIPT_BYTES) {
    return NextResponse.json({ error: 'Photo is empty' }, { status: 400 })
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    return NextResponse.json({ error: 'Photo too large (max 10 MB)' }, { status: 413 })
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported image type: ${file.type || '(none)'}` },
      { status: 415 },
    )
  }

  const db = getAdminClient()

  // Confirm the job exists (defensive — RLS would catch it, but a
  // pretty 404 is nicer than a generic FK error after a 4MB upload).
  const { data: job, error: jobErr } = await db
    .from('jobs')
    .select('id, job_number')
    .eq('id', parsed.data.job_id)
    .single()
  if (jobErr || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // ── Upload image to storage ───────────────────────────────────────
  const ext = extFromMime(file.type)
  const path = `jobs/${job.id}/receipts/${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()
  const { data: upload, error: uploadErr } = await db
    .storage
    .from('gallery')
    .upload(path, bytes, { contentType: file.type, upsert: false })
  if (uploadErr || !upload) {
    console.error('receipt: storage upload failed', uploadErr)
    return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })
  }
  const { data: { publicUrl } } = db
    .storage
    .from('gallery')
    .getPublicUrl(upload.path)

  // ── Claude vision extraction ──────────────────────────────────────
  const mediaType =
    file.type === 'image/jpg' ? 'image/jpeg' : (file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif')
  const base64 = Buffer.from(bytes).toString('base64')

  let extracted: Awaited<ReturnType<typeof extractReceiptFromImage>>
  try {
    extracted = await extractReceiptFromImage(base64, mediaType)
  } catch (err) {
    console.error('receipt: extraction failed', err)
    // Save a placeholder receipt row so the user doesn't lose the image —
    // Phase 4.2 fallback policy mirrors the voice memo extractor.
    const { data: fallback, error: insertErr } = await db
      .from('job_receipts')
      .insert({
        job_id:                job.id,
        image_url:             publicUrl,
        image_path:            upload.path,
        extraction_confidence: 0,
        raw_transcript:
          err instanceof ReceiptExtractionError ? err.message : 'Unknown extraction error',
        line_items:            [],
      })
      .select()
      .single()
    if (insertErr || !fallback) {
      // Couldn't even save the fallback — at least don't orphan the
      // storage blob.
      await db.storage.from('gallery').remove([upload.path])
      return NextResponse.json(
        { error: 'Receipt extraction + save both failed.' },
        { status: 500 },
      )
    }
    return NextResponse.json({
      id:        fallback.id,
      image_url: publicUrl,
      extracted: null,
      warning:
        err instanceof ReceiptExtractionError
          ? err.message
          : 'Vision extraction failed; receipt saved as draft.',
    })
  }

  // ── Persist as a draft receipt row ────────────────────────────────
  const { data: row, error: insertErr } = await db
    .from('job_receipts')
    .insert({
      job_id:                job.id,
      vendor:                extracted.vendor,
      receipt_date:          extracted.date,
      subtotal:              extracted.subtotal,
      tax:                   extracted.tax,
      total:                 extracted.total,
      line_items:            extracted.line_items,
      memo:                  extracted.notes,
      extraction_confidence: extracted.confidence,
      raw_transcript:        JSON.stringify(extracted),
      image_url:             publicUrl,
      image_path:            upload.path,
    })
    .select()
    .single()
  if (insertErr || !row) {
    console.error('receipt: insert failed', insertErr)
    await db.storage.from('gallery').remove([upload.path])
    return NextResponse.json({ error: 'Failed to save receipt' }, { status: 500 })
  }

  return NextResponse.json({
    id:        row.id,
    image_url: publicUrl,
    extracted,
  })
}
