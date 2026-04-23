// Client-only helpers for preparing photo uploads from the dashboard.
//
// iPhones produce HEIC/HEIF by default; the Supabase Storage bucket is fine
// taking those bytes, but the browsers served to the public site can't render
// them. Convert to JPEG before upload. We also cap the longest edge at
// MAX_EDGE so we're not pushing 8 MB portrait shots straight off the camera.
//
// Reliability notes for iOS PWA (the primary upload surface):
//   - Every step is wrapped in a hard timeout. heic2any can hang silently in
//     iOS standalone-mode WebViews under memory pressure; createImageBitmap
//     can also never resolve on Safari for unusual HEIC variants. Without
//     timeouts the await sits forever and the upload spinner gets stuck.
//   - heic2any is loaded once and cached at module scope (was per-file).
//   - MAX_EDGE = 2000 (was 2400) — still high enough for retina display
//     downscaling, ~30-40% less memory + body bytes.

const MAX_EDGE = 2000
const JPEG_QUALITY = 0.85

// Per-step timeouts. The whole pipeline is also bounded by NORMALIZE_TIMEOUT
// in normalizeUploadFile.
const HEIC_DECODE_TIMEOUT_MS = 25_000
const BITMAP_TIMEOUT_MS = 5_000
const NORMALIZE_TIMEOUT_MS = 30_000

// Cache the heic2any module across files. Per-file `await import('heic2any')`
// is wasteful and was triggering occasional iOS slowness with large batches.
let _heic2any: typeof import('heic2any').default | null = null
async function getHeic2Any(): Promise<typeof import('heic2any').default> {
  if (_heic2any) return _heic2any
  const mod = await import('heic2any')
  _heic2any = mod.default
  return _heic2any
}

export function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  return (
    type === 'image/heic' ||
    type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  )
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`))
    }, ms)
    promise.then(
      (value) => { clearTimeout(timer); resolve(value) },
      (err) => { clearTimeout(timer); reject(err) },
    )
  })
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = await getHeic2Any()
  const result = await withTimeout(
    heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: JPEG_QUALITY,
    }) as Promise<Blob | Blob[]>,
    HEIC_DECODE_TIMEOUT_MS,
    'HEIC decode',
  )
  const blob = Array.isArray(result) ? result[0] : result
  const newName = file.name.replace(/\.(heic|heif)$/i, '') + '.jpg'
  return new File([blob], newName, { type: 'image/jpeg' })
}

async function downscaleIfLarge(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  let bitmap: ImageBitmap
  try {
    // createImageBitmap can hang on Safari for malformed/unusual sources.
    // Bound it so the whole pipeline can't sit forever on this step.
    bitmap = await withTimeout(
      createImageBitmap(file),
      BITMAP_TIMEOUT_MS,
      'Image decode',
    )
  } catch {
    // Bitmap decode failed or timed out — fall back to the converted bytes
    // unchanged. Better to upload a slightly bigger file than to hang.
    return file
  }
  try {
    const longestEdge = Math.max(bitmap.width, bitmap.height)
    if (longestEdge <= MAX_EDGE) return file
    const scale = MAX_EDGE / longestEdge
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    )
    if (!blob) return file
    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], newName, { type: 'image/jpeg' })
  } finally {
    bitmap.close?.()
  }
}

// Convert HEIC/HEIF to JPEG, then downscale if larger than MAX_EDGE.
// The whole pipeline is bounded by NORMALIZE_TIMEOUT_MS so a stuck file
// surfaces a clean error instead of an infinite spinner.
export async function normalizeUploadFile(file: File): Promise<File> {
  return withTimeout(
    (async () => {
      let working = file
      if (isHeicFile(file)) {
        try {
          working = await convertHeicToJpeg(file)
        } catch (err) {
          const reason = err instanceof Error ? err.message : 'unknown error'
          // Most common iOS cause: photo only exists in iCloud and the picker
          // returned a placeholder before the blob finished downloading.
          throw new Error(
            `Couldn't convert "${file.name}" to JPEG (${reason}). If it's an iCloud photo, wait for it to finish downloading and try again, or use the iOS share-sheet "Save as JPEG" option.`,
          )
        }
      }
      return downscaleIfLarge(working)
    })(),
    NORMALIZE_TIMEOUT_MS,
    `Photo "${file.name}"`,
  )
}
