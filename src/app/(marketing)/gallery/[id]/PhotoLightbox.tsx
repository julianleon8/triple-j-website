'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export type LightboxPhoto = {
  id: string
  src: string
  alt: string
}

type Props = {
  photos: LightboxPhoto[]
}

/**
 * Public photo lightbox for /gallery/[id].
 *
 * iOS-style modal with prev/next + swipe + keyboard arrows + counter.
 * Renders a thumbnail grid; clicking any thumb opens the slideshow at
 * that photo. Photos array should include the cover at index 0 so the
 * cover badge surfaces and the slideshow opens on the cover when
 * triggered from the hero.
 *
 * Imperative API: parent can hold a ref and call .open(index) to trigger
 * the lightbox without rendering the grid (used by the gallery hero).
 */
export type PhotoLightboxHandle = {
  open: (index: number) => void
}

export function PhotoLightbox({ photos }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const touchStartXRef = useRef<number | null>(null)

  const open = useCallback((i: number) => {
    setIndex(i)
    setIsOpen(true)
    dialogRef.current?.showModal()
  }, [])

  const close = useCallback(() => {
    dialogRef.current?.close()
    setIsOpen(false)
  }, [])

  const next = useCallback(() => {
    setIndex((i) => (photos.length ? (i + 1) % photos.length : i))
  }, [photos.length])

  const prev = useCallback(() => {
    setIndex((i) => (photos.length ? (i - 1 + photos.length) % photos.length : i))
  }, [photos.length])

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, next, prev])

  function onTouchStart(e: React.TouchEvent) {
    touchStartXRef.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartXRef.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartXRef.current
    touchStartXRef.current = null
    if (delta < -60) next()
    else if (delta > 60) prev()
  }

  const active = photos[index]

  return (
    <>
      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => open(i)}
            className="group relative aspect-4/3 overflow-hidden rounded-xl bg-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-600"
            aria-label={`Open photo ${i + 1} of ${photos.length}: ${p.alt}`}
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
              unoptimized={p.src.startsWith('/')}
            />
            {i === 0 && (
              <span className="absolute top-2 left-2 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                Cover
              </span>
            )}
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) close()
        }}
        onClose={() => setIsOpen(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="backdrop:bg-black/85 w-screen h-screen max-w-none max-h-none m-0 p-0 bg-black"
      >
        {active && (
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              type="button"
              onClick={close}
              className="absolute right-4 z-10 h-10 w-10 rounded-full bg-white/15 text-white text-xl backdrop-blur-sm hover:bg-white/30 flex items-center justify-center"
              style={{ top: 'max(env(safe-area-inset-top), 1rem)' }}
              aria-label="Close gallery"
            >
              ×
            </button>

            {photos.length > 1 && (
              <div
                className="absolute left-1/2 -translate-x-1/2 text-[13px] font-semibold text-white/80 tabular-nums"
                style={{ top: 'max(env(safe-area-inset-top), 1.25rem)' }}
              >
                {index + 1} / {photos.length}
              </div>
            )}

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prev() }}
                  className="absolute left-3 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white text-2xl backdrop-blur-sm hover:bg-white/30 sm:flex"
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); next() }}
                  className="absolute right-3 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white text-2xl backdrop-blur-sm hover:bg-white/30 sm:flex"
                  aria-label="Next photo"
                >
                  ›
                </button>
              </>
            )}

            <Image
              key={active.src}
              src={active.src}
              alt={active.alt}
              width={1920}
              height={1280}
              sizes="100vw"
              className="max-h-[90vh] max-w-[96vw] w-auto h-auto object-contain"
              unoptimized={active.src.startsWith('/')}
              priority
            />

            {photos.length > 1 && (
              <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-white/60 sm:hidden uppercase tracking-wider">
                Swipe to browse
              </p>
            )}
          </div>
        )}
      </dialog>
    </>
  )
}
