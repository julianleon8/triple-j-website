/**
 * Client-side image prep for HQ uploads.
 *
 * iPhone photos come in two inconvenient shapes:
 *   1. Rotated via EXIF orientation (portrait shots arrive sideways without
 *      the right hint).
 *   2. Oversized (48MP HEIC shots are multi-MB and slow to upload over LTE).
 *
 * `prepareImage` fixes both:
 *   - Uses `createImageBitmap({ imageOrientation: 'from-image' })` to read
 *     EXIF and auto-orient during decode (Safari 14.5+, Chrome 80+).
 *   - Draws to a canvas clamped to 2048px on the long edge.
 *   - Exports JPEG 85%.
 *
 * On any failure (unknown format, browser without ImageBitmap, out of memory)
 * the original File is returned unchanged. Never block the upload on
 * optimization — the user's photo always makes it to the server.
 */

const MAX_LONG_EDGE = 2048
const JPEG_QUALITY = 0.85
const OUTPUT_MIME = 'image/jpeg'

export type PreparedImage = {
  blob: Blob
  /** Suggested filename, with the correct extension for the output mime. */
  filename: string
  width: number
  height: number
  /** True when we ran the decode/resize pipeline; false when we fell back to
   *  the raw file (e.g. Safari couldn't decode HEIC). */
  optimized: boolean
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  const safeName = sanitizeFilename(file.name || 'photo.jpg')

  if (typeof createImageBitmap !== 'function') {
    return {
      blob: file,
      filename: safeName,
      width: 0,
      height: 0,
      optimized: false,
    }
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, {
      // Auto-orient per EXIF. Without this, portrait iPhone photos arrive
      // rotated 90° / 180° even though the preview in Photos looked right.
      imageOrientation: 'from-image',
    })
  } catch {
    return {
      blob: file,
      filename: safeName,
      width: 0,
      height: 0,
      optimized: false,
    }
  }

  const { width: srcW, height: srcH } = bitmap
  const scale = Math.min(1, MAX_LONG_EDGE / Math.max(srcW, srcH))
  const outW = Math.max(1, Math.round(srcW * scale))
  const outH = Math.max(1, Math.round(srcH * scale))

  // Prefer OffscreenCanvas when available (doesn't attach to DOM, faster on
  // modern iOS). Fall back to a detached <canvas> element otherwise.
  let blob: Blob | null = null
  try {
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(outW, outH)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('2D context unavailable')
      ctx.drawImage(bitmap, 0, 0, outW, outH)
      blob = await canvas.convertToBlob({
        type: OUTPUT_MIME,
        quality: JPEG_QUALITY,
      })
    } else if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('2D context unavailable')
      ctx.drawImage(bitmap, 0, 0, outW, outH)
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, OUTPUT_MIME, JPEG_QUALITY),
      )
    }
  } catch {
    // Fall through to the fallback below.
  } finally {
    bitmap.close?.()
  }

  if (!blob || blob.size === 0) {
    return {
      blob: file,
      filename: safeName,
      width: 0,
      height: 0,
      optimized: false,
    }
  }

  // If the optimized blob is larger than the source — rare, but possible on
  // already-compressed inputs — use the original.
  if (blob.size > file.size) {
    return {
      blob: file,
      filename: safeName,
      width: srcW,
      height: srcH,
      optimized: false,
    }
  }

  return {
    blob,
    filename: replaceExtension(safeName, 'jpg'),
    width: outW,
    height: outH,
    optimized: true,
  }
}

function sanitizeFilename(name: string): string {
  // Drop path-ish characters; iPhone photos come in with lowercase ASCII
  // already but be defensive.
  return name.replace(/[/\\]/g, '_').replace(/[^\w.\- ]/g, '').slice(0, 120) || 'photo.jpg'
}

function replaceExtension(name: string, ext: string): string {
  if (!name.includes('.')) return `${name}.${ext}`
  return name.replace(/\.[^.]+$/, `.${ext}`)
}
