/**
 * OpenAI Whisper client — minimal fetch-based wrapper.
 * Used by /api/hq/voice-lead to transcribe short owner voice memos (<60s)
 * recorded on the iPhone PWA. No SDK dependency: Whisper is a single endpoint
 * and adding the full `openai` package for one call is wasteful.
 *
 * Cost: ~$0.006/min via whisper-1. At 100 memos/month × 30s avg ≈ $0.30/mo.
 */

const WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions'
const WHISPER_MODEL = 'whisper-1'
// Whisper API limit is 25 MB. iOS audio/mp4 at ~64kbps for 60s ≈ 480 KB,
// so we're nowhere near the ceiling even for long memos. Still worth a guard.
const MAX_BYTES = 25 * 1024 * 1024

export type TranscribeOptions = {
  /** ISO 639-1 code (e.g. 'en', 'es'). Omit for auto-detect — recommended. */
  language?: string
  /** Optional prior-context string fed to Whisper as `prompt` for domain
   *  vocabulary. Example: "Triple J Metal. Carport, barn, RV cover." */
  prompt?: string
}

export async function transcribeAudio(
  audio: Blob | File,
  opts: TranscribeOptions = {},
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new OpenAIConfigError('OPENAI_API_KEY is not set')
  }
  if (audio.size > MAX_BYTES) {
    throw new OpenAIRequestError(
      `Audio file too large: ${audio.size} bytes (Whisper limit is 25 MB)`,
    )
  }

  const form = new FormData()
  // File-name extension hints Whisper's format sniffer. iOS MediaRecorder
  // produces audio/mp4, webm/opus on other browsers. Either works — we use
  // the blob's type if present, fall back to mp4.
  const ext = extFromMime(audio.type) ?? 'mp4'
  form.append('file', audio, `memo.${ext}`)
  form.append('model', WHISPER_MODEL)
  form.append('response_format', 'json')
  if (opts.language) form.append('language', opts.language)
  if (opts.prompt) form.append('prompt', opts.prompt)

  const res = await fetch(WHISPER_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  })

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '')
    throw new OpenAIRequestError(
      `Whisper ${res.status}: ${bodyText.slice(0, 500)}`,
    )
  }

  const data = (await res.json()) as { text?: string }
  const transcript = (data.text ?? '').trim()
  if (!transcript) {
    throw new OpenAIRequestError('Whisper returned an empty transcript')
  }
  return transcript
}

function extFromMime(mime: string): string | null {
  if (!mime) return null
  if (mime.startsWith('audio/mp4') || mime === 'audio/aac')   return 'mp4'
  if (mime.startsWith('audio/webm'))                          return 'webm'
  if (mime.startsWith('audio/ogg'))                           return 'ogg'
  if (mime.startsWith('audio/wav'))                           return 'wav'
  if (mime.startsWith('audio/mpeg') || mime === 'audio/mp3')  return 'mp3'
  if (mime.startsWith('audio/x-m4a'))                         return 'm4a'
  return null
}

export class OpenAIConfigError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'OpenAIConfigError'
  }
}

export class OpenAIRequestError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'OpenAIRequestError'
  }
}
