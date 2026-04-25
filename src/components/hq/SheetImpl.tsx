'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'

export type SheetProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  /** Snap point as a fraction of viewport height. Default 0.9 (90%). */
  snap?: number
}

/**
 * iOS-style slide-up modal sheet.
 * - Backdrop tap dismisses
 * - Drag handle: drag down past 100px or with velocity > 500 to dismiss
 * - Body scroll locked while open
 * - Respects safe-area-inset-bottom (home indicator)
 */
export function SheetImpl({ open, onClose, title, children, snap = 0.9 }: SheetProps) {
  const dragControls = useDragControls()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-(--surface-2) text-(--text-primary) shadow-2xl"
            style={{ maxHeight: `${snap * 100}vh`, paddingBottom: 'env(safe-area-inset-bottom)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) onClose()
            }}
          >
            {/* Drag handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex cursor-grab justify-center pt-2.5 pb-1 active:cursor-grabbing touch-none"
            >
              <div className="h-1 w-10 rounded-full bg-(--border-strong)" />
            </div>

            {title && (
              <div className="px-5 pb-3 pt-1 text-center text-base font-semibold">
                {title}
              </div>
            )}

            <div className="overflow-y-auto px-5 pb-5" style={{ maxHeight: `calc(${snap * 100}vh - 4rem)` }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
