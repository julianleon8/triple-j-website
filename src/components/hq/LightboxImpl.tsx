'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export type LightboxPhoto = { src: string; alt?: string }

export type LightboxProps = {
  photos: LightboxPhoto[]
  startIndex?: number
  open: boolean
  onClose: () => void
}

/**
 * iOS-style photo viewer. Tap backdrop or X to dismiss. Left/right arrows
 * (desktop) + horizontal swipe (mobile) + keyboard arrows navigate. Locks
 * body scroll while open. Respects safe-area-inset-top for the close button.
 */
export function LightboxImpl({ photos, startIndex = 0, open, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex)

  // Sync when a different start index comes in (new photo set selected).
  // React 19 idiom: previous-value comparison via useState during render,
  // not setState inside useEffect (cascading-renders anti-pattern).
  const [prevStartIndex, setPrevStartIndex] = useState(startIndex)
  if (open && prevStartIndex !== startIndex) {
    setPrevStartIndex(startIndex)
    setIndex(startIndex)
  }

  const next = useCallback(() => {
    setIndex((i) => (photos.length ? (i + 1) % photos.length : i))
  }, [photos.length])

  const prev = useCallback(() => {
    setIndex((i) => (photos.length ? (i - 1 + photos.length) % photos.length : i))
  }, [photos.length])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, next, prev])

  const photo = photos[index]

  return (
    <AnimatePresence>
      {open && photo && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black touch-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          onClick={onClose}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose() }}
            aria-label="Close"
            className="absolute right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm active:bg-white/30"
            style={{ top: 'max(env(safe-area-inset-top), 1rem)' }}
          >
            <X size={18} strokeWidth={2} />
          </button>

          {/* Counter */}
          {photos.length > 1 && (
            <div
              className="absolute left-1/2 -translate-x-1/2 text-[13px] font-semibold text-white/80"
              style={{ top: 'max(env(safe-area-inset-top), 1rem)' }}
            >
              {index + 1} / {photos.length}
            </div>
          )}

          {/* Prev / next */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev() }}
                aria-label="Previous photo"
                className="absolute left-3 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm active:bg-white/30 sm:flex"
              >
                <ChevronLeft size={20} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next() }}
                aria-label="Next photo"
                className="absolute right-3 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm active:bg-white/30 sm:flex"
              >
                <ChevronRight size={20} strokeWidth={2} />
              </button>
            </>
          )}

          {/* Image — horizontal swipe hooks in on touch via framer-motion drag */}
          <motion.img
            key={photo.src}
            src={photo.src}
            alt={photo.alt ?? ''}
            className="max-h-[90vh] max-w-[96vw] object-contain select-none"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            drag={photos.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) next()
              else if (info.offset.x > 60) prev()
            }}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
