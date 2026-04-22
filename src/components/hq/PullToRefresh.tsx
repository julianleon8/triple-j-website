'use client'

import { useEffect, useRef, useState } from 'react'

type PullToRefreshProps = {
  onRefresh: () => void | Promise<void>
  /** Minimum pull distance in px to trigger refresh. Default 72. */
  threshold?: number
  children: React.ReactNode
}

/**
 * iOS-style pull-to-refresh. Attaches touch listeners to window and measures
 * scroll position — only fires when the document is at scrollY === 0.
 *
 * Visual: a spinner sits at the top (negative margin) and animates in as
 * the user pulls past the threshold.
 */
export function PullToRefresh({ onRefresh, threshold = 72, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef<number | null>(null)
  const triggeredRef = useRef(false)

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 0) {
        startYRef.current = null
        return
      }
      startYRef.current = e.touches[0].clientY
      triggeredRef.current = false
    }

    function onTouchMove(e: TouchEvent) {
      if (startYRef.current === null || refreshing) return
      const delta = e.touches[0].clientY - startYRef.current
      if (delta <= 0) {
        setPullDistance(0)
        return
      }
      // Resist past threshold
      const resisted = delta < threshold ? delta : threshold + (delta - threshold) * 0.35
      setPullDistance(resisted)
    }

    async function onTouchEnd() {
      if (startYRef.current === null) return
      const dist = pullDistance
      startYRef.current = null

      if (dist >= threshold && !triggeredRef.current) {
        triggeredRef.current = true
        setRefreshing(true)
        setPullDistance(threshold)
        try {
          await onRefresh()
        } finally {
          setRefreshing(false)
          setPullDistance(0)
        }
      } else {
        setPullDistance(0)
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [pullDistance, refreshing, threshold, onRefresh])

  const pct = Math.min(1, pullDistance / threshold)

  return (
    <div style={{ touchAction: 'pan-y' }}>
      {/* Spinner indicator — sits above content, follows pull */}
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-100 ease-out sm:hidden"
        style={{ height: refreshing ? threshold : pullDistance }}
        aria-hidden="true"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-(--brand-fg) ${refreshing ? 'animate-spin' : ''}`}
          style={{
            opacity: pct,
            transform: `rotate(${pct * 360}deg)`,
          }}
        >
          <path d="M21 12a9 9 0 11-6.22-8.56" />
        </svg>
      </div>
      {children}
    </div>
  )
}
