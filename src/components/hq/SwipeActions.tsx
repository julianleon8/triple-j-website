'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useRef, useState } from 'react'
import { useHaptics } from '@/lib/hq/haptics'

export type SwipeActionTone = 'positive' | 'destructive' | 'neutral' | 'warn'

export type SwipeAction = {
  label: string
  tone: SwipeActionTone
  /** Returns true if the action removed the row (hides the row); false to keep visible. */
  exec: () => Promise<boolean>
}

type SwipeActionsProps = {
  /** Action revealed on right-swipe (from left edge). Typically positive — "Mark Contacted", "Send". */
  leading?: SwipeAction
  /** Action revealed on left-swipe (from right edge). Typically destructive — "Delete". */
  trailing?: SwipeAction
  /** Haptic fired after exec() resolves (does not fire on throw). */
  hapticOnCommit?: 'success' | 'warn' | 'error'
  children: React.ReactNode
}

const REVEAL = 96 // px — button reveal width per side
const SNAP_THRESHOLD = 40

const TONE_STYLE: Record<SwipeActionTone, string> = {
  positive:    'bg-emerald-500 text-white',
  destructive: 'bg-red-500 text-white',
  neutral:     'bg-blue-500 text-white',
  warn:        'bg-amber-500 text-white',
}

/**
 * iOS-style swipe-to-reveal action buttons around any row.
 *
 * - Swipe right (from left edge) reveals `leading` action
 * - Swipe left (from right edge) reveals `trailing` action
 * - Release past SNAP_THRESHOLD snaps to reveal; otherwise springs back
 * - Tap revealed action → calls exec(); removes row if exec() returns true
 * - Tapping the row surface while revealed just closes the sheet (no nav)
 */
export function SwipeActions({ leading, trailing, hapticOnCommit, children }: SwipeActionsProps) {
  const x = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState(false)
  const [busy, setBusy] = useState<'leading' | 'trailing' | null>(null)
  const haptics = useHaptics()

  // Visually scale each action panel so only one side reveals at a time
  const leadingOpacity = useTransform(x, [0, REVEAL], [0, 1])
  const trailingOpacity = useTransform(x, [-REVEAL, 0], [1, 0])

  function snapTo(target: number) {
    animate(x, target, { type: 'spring', damping: 30, stiffness: 320 })
  }

  async function run(which: 'leading' | 'trailing') {
    const action = which === 'leading' ? leading : trailing
    if (!action || busy) return
    setBusy(which)
    try {
      const removed = await action.exec()
      if (hapticOnCommit) haptics[hapticOnCommit]()
      if (removed) {
        // animate out
        await animate(x, which === 'leading' ? 600 : -600, { duration: 0.2 })
        setHidden(true)
      } else {
        snapTo(0)
      }
    } catch {
      snapTo(0)
    } finally {
      setBusy(null)
    }
  }

  if (hidden) return null

  return (
    <div ref={containerRef} className="relative overflow-hidden touch-pan-y">
      {/* Leading action (revealed when row is dragged right) */}
      {leading && (
        <motion.button
          type="button"
          onClick={() => run('leading')}
          style={{ opacity: leadingOpacity }}
          className={`absolute inset-y-0 left-0 flex w-24 items-center justify-center text-[13px] font-semibold ${TONE_STYLE[leading.tone]}`}
        >
          {busy === 'leading' ? '…' : leading.label}
        </motion.button>
      )}

      {/* Trailing action (revealed when row is dragged left) */}
      {trailing && (
        <motion.button
          type="button"
          onClick={() => run('trailing')}
          style={{ opacity: trailingOpacity }}
          className={`absolute inset-y-0 right-0 flex w-24 items-center justify-center text-[13px] font-semibold ${TONE_STYLE[trailing.tone]}`}
        >
          {busy === 'trailing' ? '…' : trailing.label}
        </motion.button>
      )}

      {/* The row itself — draggable */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: trailing ? -REVEAL : 0, right: leading ? REVEAL : 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (leading && info.offset.x > SNAP_THRESHOLD)      snapTo(REVEAL)
          else if (trailing && info.offset.x < -SNAP_THRESHOLD) snapTo(-REVEAL)
          else                                                   snapTo(0)
        }}
        className="relative bg-(--surface-2)"
      >
        {children}
      </motion.div>
    </div>
  )
}
