import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { transcribeAudio, OpenAIConfigError } from '@/lib/openai'
import {
  extractLeadFromTranscript,
  VoiceExtractionError,
} from '@/lib/voice-lead-extractor'
import { notifyNewLead } from '@/lib/lead-notifications'

export const dynamic = 'force-dynamic'
// 30s covers Whisper (~2s for 30s of audio) + Claude (~3s) + DB insert (~200ms)
// + a generous buffer. Vercel's serverless function max on Hobby is 10s but we
// deploy to Pro with 30s default; this matches.
export const maxDuration = 30

// Duplicated intentionally from /api/leads/route.ts — avoid touching the
// customer-facing route in this commit. Consolidate into a shared util in a
// follow-up if we grow a third caller. See Phase 4 notes.
const ZIP_CITIES: Record<string, string> = {
  '76501': 'Temple', '76502': 'Temple', '76503': 'Temple', '76504': 'Temple',
  '76508': 'Temple', '76511': 'Bartlett',
  '76513': 'Belton',
  '76522': 'Copperas Cove',
  '76527': 'Florence',
  '76534': 'Holland',
  '76541': 'Killeen', '76542': 'Killeen', '76543': 'Killeen', '76544': 'Killeen',
  '76548': 'Harker Heights',
  '76549': 'Killeen',
  '76554': 'Little River-Academy',
  '76557': 'Moody',
  '76571': 'Salado',
  '76578': 'Taylor',
  '76579': 'Troy',
}

// Reasonable caps — Whisper's own ceiling is 25 MB but a 30s voice memo at
// AAC 64 kbps is ~240 KB. A 5 MB cap lets even a 2-minute memo through without
// opening the door to abuse.
const MAX_AUDIO_BYTES = 5 * 1024 * 1024
const MIN_AUDIO_BYTES = 2 * 1024 // drop obvious accidental taps
const ALLOWED_MIME_PREFIXES = ['audio/'] as const

// Build the row we insert — mirrors the happy path in /api/leads POST so
// downstream code (notifications, HQ list, Funnel view) treats the voice lead
// identically.
function buildInsertRow(
  ext: Awaited<ReturnType<typeof extractLeadFromTranscript>>,
  transcript: string,
) {
  const zip = ext.zip?.trim() || null
  const city = ext.city?.trim() || (zip ? ZIP_CITIES[zip] ?? null : null)

  // Size line included before the transcript for parity with the form route.
  const sizeLine =
    ext.width && ext.length
      ? `${ext.width}W × ${ext.length}L${ext.height ? ` × ${ext.height}H` : ''} ft`
      : null

  // Voice memos carry two kinds of narrative text: the extractor's notes
  // (summary of non-structured details) and the raw transcript (audit trail).
  // We store BOTH in `message`, separated, so /hq/leads/[id] shows the full
  // picture and Julian can always see exactly what he said.
  const messageParts = [
    sizeLine,
    ext.notes?.trim() || null,
    `— Transcript —\n${transcript.trim()}`,
  ].filter(Boolean) as string[]

  return {
    // Name + phone are required in the DB — fall back to placeholders so we
    // never lose a memo to a missing field. Julian can edit inline.
    name:            ext.name?.trim() || 'Voice memo (no name)',
    phone:           ext.phone?.trim() || '',
    email:           ext.email?.trim() || null,
    city:            city ?? 'Not provided',
    zip:             zip,
    service_type:    ext.service_type ?? 'carport',
    structure_type:  ext.structure_type,
    timeline:        ext.timeline,
    is_military:     ext.is_military,
    message:         messageParts.join('\n\n'),
    source:          'voice_memo' as const,
  }
}

export async function POST(request: NextRequest) {
  // Auth — voice memos are owner-only. No captcha (authed users only).
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const audio = form.get('audio')
  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: 'Missing `audio` blob' }, { status: 400 })
  }
  if (audio.size < MIN_AUDIO_BYTES) {
    return NextResponse.json({ error: 'Recording too short' }, { status: 400 })
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: 'Recording too large (max 5 MB)' }, { status: 413 })
  }
  if (!ALLOWED_MIME_PREFIXES.some((p) => audio.type.startsWith(p))) {
    return NextResponse.json(
      { error: `Unsupported audio type: ${audio.type || '(none)'}` },
      { status: 415 },
    )
  }

  // 1. Transcribe ---------------------------------------------------------
  let transcript: string
  try {
    transcript = await transcribeAudio(audio, {
      language: 'en',
      prompt:
        'Triple J Metal. Central Texas. Services: carport, garage, ' +
        'barn, RV cover, lean-to patio, barndominium. Common cities: Temple, ' +
        'Belton, Killeen, Harker Heights, Copperas Cove, Waco.',
    })
  } catch (err) {
    if (err instanceof OpenAIConfigError) {
      return NextResponse.json(
        {
          error:
            'Transcription service not configured. Add OPENAI_API_KEY to your Vercel env.',
        },
        { status: 503 },
      )
    }
    console.error('voice-lead: transcribe failed', err)
    return NextResponse.json(
      { error: 'Transcription failed. Try again in a moment.' },
      { status: 502 },
    )
  }

  // 2. Extract structured fields -----------------------------------------
  let extracted: Awaited<ReturnType<typeof extractLeadFromTranscript>>
  try {
    extracted = await extractLeadFromTranscript(transcript)
  } catch (err) {
    // Extraction failure is recoverable: we still save the transcript as a
    // minimal lead so Julian doesn't lose what he said.
    console.error('voice-lead: extraction failed', err)
    const msg = err instanceof VoiceExtractionError
      ? err.message
      : 'Unknown extraction error'

    const { data: fallbackLead, error: insertErr } = await getAdminClient()
      .from('leads')
      .insert({
        name:         'Voice memo (extraction failed)',
        phone:        '',
        city:         'Not provided',
        service_type: 'carport',
        is_military:  false,
        message:      `Extraction failed — raw transcript only.\n\n— Transcript —\n${transcript}`,
        source:       'voice_memo',
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error('voice-lead: fallback insert failed', insertErr)
      return NextResponse.json(
        { error: 'Extraction failed and transcript could not be saved.' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        id: fallbackLead.id,
        transcript,
        extracted: null,
        warning: `Structured extraction failed: ${msg}. Transcript saved; please edit fields manually.`,
      },
      { status: 200 },
    )
  }

  // 3. Insert -------------------------------------------------------------
  const row = buildInsertRow(extracted, transcript)
  const { data: lead, error: insertErr } = await getAdminClient()
    .from('leads')
    .insert(row)
    .select()
    .single()

  if (insertErr) {
    console.error('voice-lead: insert failed', insertErr)
    return NextResponse.json(
      { error: 'Failed to save lead. Transcript was not lost — try again.' },
      { status: 500 },
    )
  }

  // 4. Fire owner push notification AFTER the response ships -------------
  //    Phase 3 perf: notifyNewLead (Resend email + web-push) used to be
  //    awaited synchronously, adding ~500-2000ms before the client got the
  //    new lead's id. Now we hand it to Next's `after()` so the response
  //    returns the moment the DB insert resolves; notifications run in the
  //    background. Errors are caught by Next and won't tank the response.
  const sizeLine = extracted.width && extracted.length
    ? `${extracted.width}W × ${extracted.length}L${extracted.height ? ` × ${extracted.height}H` : ''} ft`
    : null
  after(async () => {
    try {
      await notifyNewLead({ lead, sizeLine })
    } catch (err) {
      console.error('voice-lead: notify failed (non-fatal)', err)
    }
  })

  return NextResponse.json({
    id: lead.id,
    transcript,
    extracted,
  })
}

