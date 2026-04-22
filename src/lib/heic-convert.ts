// Client-only helpers for preparing photo uploads from the dashboard.
//
// iPhones produce HEIC/HEIF by default; the Supabase Storage bucket is fine
// taking those bytes, but the browsers served to the public site can't render
// them. Convert to JPEG before upload. We also cap the longest edge at
// MAX_EDGE so we're not pushing 10 MB portrait shots straight off the camera.

const MAX_EDGE = 2400
const JPEG_QUALITY = 0.85

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

async function convertHeicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import('heic2any')
  const result = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: JPEG_QUALITY,
  })
  const blob = Array.isArray(result) ? result[0] : result
  const newName = file.name.replace(/\.(heic|heif)$/i, '') + '.jpg'
  return new File([blob], newName, { type: 'image/jpeg' })
}

async function downscaleIfLarge(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
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
// HEIC conversion is the hard failure path — surfaces a human-readable
// error the UI can pin next to the failing file. Downscale is best-effort:
// if canvas/bitmap decode fails, we fall back to the converted bytes.
export async function normalizeUploadFile(file: File): Promise<File> {
  let working = file
  if (isHeicFile(file)) {
    try {
      working = await convertHeicToJpeg(file)
    } catch {
      throw new Error(
        "Couldn't convert this HEIC. Email the photo to yourself to force JPEG, or use the iOS share-sheet 'Save as JPEG' option.",
      )
    }
  }
  return downscaleIfLarge(working)
}
