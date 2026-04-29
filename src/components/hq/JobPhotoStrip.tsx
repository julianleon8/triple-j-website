'use client'

import Image from 'next/image'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Camera, Loader2, AlertCircle } from 'lucide-react'
import { Lightbox, prefetchLightbox, type LightboxPhoto } from '@/components/hq/Lightbox'
import { prepareImage } from '@/lib/hq/image-prep'
import { useHaptics } from '@/lib/hq/haptics'

/**
 * Camera-first strip for /hq/jobs/[id]. Capture mode uses iOS's native
 * rear-camera shortcut via `<input capture="environment">`; multi-select
 * is enabled so Julian can shoot a quick burst then release. Photos are
 * prepped client-side (EXIF auto-orient + resize to 2048px + JPEG 85%)
 * before upload, keeping the wire small on LTE.
 */

export type JobPhotoStripPhoto = {
  id: string
  image_url: string
  alt_text: string | null
  is_cover: boolean
  sort_order: number
  gallery_item_id: string
  created_at?: string | null
}

type UploadItem = {
  localId: string
  name: string
  status: 'prepping' | 'uploading' | 'done' | 'failed'
  error?: string
}

type Props = {
  jobId: string
  photos: JobPhotoStripPhoto[]
  /** Extra info surfaced in the header. */
  photoCount?: number
}

export function JobPhotoStrip({ jobId, photos: initialPhotos, photoCount }: Props) {
  const haptics = useHaptics()
  const inputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<JobPhotoStripPhoto[]>(() =>
    [...initialPhotos].sort(sortPhotos),
  )
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const lightboxPhotos = useMemo<LightboxPhoto[]>(
    () =>
      photos.map((p) => ({
        src: p.image_url,
        alt: p.alt_text ?? '',
      })),
    [photos],
  )

  const hasPhotos = photos.length > 0
  const busy = uploads.some((u) => u.status === 'prepping' || u.status === 'uploading')

  const onPick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const onFiles = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      // Reset input so picking the same file twice still fires onChange.
      e.target.value = ''
      if (files.length === 0) return

      haptics.tap()

      // Kick off each upload in parallel with a shared progress-tracking
      // state. Bursts of 3-5 photos are the common case; iPhone LTE can
      // handle the concurrency fine.
      for (const file of files) {
        const localId = crypto.randomUUID()
        setUploads((prev) => [...prev, { localId, name: file.name, status: 'prepping' }])

        ;(async () => {
          try {
            const prepared = await prepareImage(file)
            setUploads((prev) =>
              prev.map((u) =>
                u.localId === localId ? { ...u, status: 'uploading' } : u,
              ),
            )

            const form = new FormData()
            form.append('job_id', jobId)
            form.append(
              'file',
              new File([prepared.blob], prepared.filename, {
                type: prepared.blob.type || 'image/jpeg',
              }),
            )

            const res = await fetch('/api/hq/job-photo', {
              method: 'POST',
              body: form,
            })
            const body = (await res.json().catch(() => ({}))) as {
              photo?: JobPhotoStripPhoto
              error?: string
            }
            if (!res.ok || !body.photo) {
              throw new Error(body.error || `Upload failed (${res.status})`)
            }

            haptics.success()
            setPhotos((prev) => [...prev, body.photo!].sort(sortPhotos))
            setUploads((prev) =>
              prev.map((u) =>
                u.localId === localId ? { ...u, status: 'done' } : u,
              ),
            )
            // Clear "done" rows after a short delay so the strip doesn't
            // accumulate success chrome.
            window.setTimeout(() => {
              setUploads((prev) => prev.filter((u) => u.localId !== localId))
            }, 1200)
          } catch (err) {
            haptics.error()
            const msg = err instanceof Error ? err.message : 'Upload failed'
            setUploads((prev) =>
              prev.map((u) =>
                u.localId === localId ? { ...u, status: 'failed', error: msg } : u,
              ),
            )
          }
        })()
      }
    },
    [haptics, jobId],
  )

  const dismissUpload = useCallback((localId: string) => {
    setUploads((prev) => prev.filter((u) => u.localId !== localId))
  }, [])

  return (
    <section
      aria-label="Job photos"
      className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
            Photos
          </h2>
          <p className="mt-0.5 text-[12px] text-(--text-tertiary)">
            {hasPhotos
              ? `${photoCount ?? photos.length} on this job · hidden from public gallery`
              : 'No photos yet. Snap a progress shot.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onPick}
          disabled={busy && uploads.length >= 6}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-(--brand-fg) px-3.5 py-2 text-[13px] font-semibold text-white tap-solid disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={14} strokeWidth={2} className="animate-spin" />
          ) : (
            <Camera size={14} strokeWidth={2} />
          )}
          {busy ? 'Uploading…' : 'Camera'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={onFiles}
          aria-label="Upload job photos"
        />
      </div>

      {/* Upload chips — live feedback for in-flight + failed items */}
      {uploads.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-live="polite">
          {uploads.map((u) => (
            <li
              key={u.localId}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                u.status === 'failed'
                  ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                  : u.status === 'done'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-(--surface-3) text-(--text-secondary)'
              }`}
            >
              {u.status === 'failed' ? (
                <AlertCircle size={12} strokeWidth={2} />
              ) : u.status === 'done' ? (
                <span aria-hidden="true">✓</span>
              ) : (
                <Loader2 size={12} strokeWidth={2} className="animate-spin" />
              )}
              <span className="max-w-[8rem] truncate">
                {u.status === 'failed' ? u.error ?? 'Upload failed' : u.name}
              </span>
              {u.status === 'failed' && (
                <button
                  type="button"
                  onClick={() => dismissUpload(u.localId)}
                  aria-label="Dismiss"
                  className="ml-1 opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Horizontal strip of thumbnails */}
      {hasPhotos && (
        <div className="mt-3 -mx-4 overflow-x-auto pb-1">
          <ul className="flex gap-2 px-4">
            {photos.map((p, i) => (
              <li key={p.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  onPointerEnter={prefetchLightbox}
                  onFocus={prefetchLightbox}
                  className="relative block h-24 w-24 overflow-hidden rounded-xl border border-(--border-subtle) bg-(--surface-3) tap-solid"
                  aria-label={`Photo ${i + 1}`}
                >
                  <Image
                    src={p.image_url}
                    alt={p.alt_text ?? ''}
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized={p.image_url.startsWith('/')}
                  />
                  {p.is_cover && (
                    <span className="absolute bottom-1 left-1 rounded-full bg-amber-500 px-1.5 text-[9px] font-bold uppercase tracking-wider text-white">
                      Cover
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Lightbox
        photos={lightboxPhotos}
        startIndex={lightboxIndex ?? 0}
        open={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      />
    </section>
  )
}

function sortPhotos(a: JobPhotoStripPhoto, b: JobPhotoStripPhoto): number {
  if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1
  return a.sort_order - b.sort_order
}
