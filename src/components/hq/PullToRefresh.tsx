'use client'

import { useEffect, useRef, useState } from 'react'

type PullToRefreshProps = {
  onRefresh: () => void | Promise<void>
  /** Minimum pull distance in px to trigger refresh. Default 48. */
  threshold?: number
  children: React.ReactNode
}

/**
 * iOS-style pull-to-refresh. Attaches touch listeners to window and measures
 * scroll position — only fires when the document is at scrollY === 0.
 *
 * 1:1 finger tracking (no resistance) — threshold tuned low so it feels
 * responsive. Shows spinner + "Release to refresh" label past threshold.
 */
export function PullToRefresh({ onRefresh, threshold = 48, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef<number | null>(null)
  const pullRef = useRef(0)
  const triggeredRef = useRef(false)

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 2) {
        startYRef.current = null
        return
      }
      startYRef.current = e.touches[0].clientY
      triggeredRef.current = false
      pullRef.current = 0
    }

    function onTouchMove(e: TouchEvent) {
      if (startYRef.current === null || refreshing) return
      const delta = e.touches[0].clientY - startYRef.current
      if (delta <= 0) {
        if (pullRef.current !== 0) {
          pullRef.current = 0
          setPullDistance(0)
        }
        return
      }
      // 1:1 finger tracking with a soft cap at 2x threshold so it doesn't go forever
      const capped = Math.min(delta, threshold * 2)
      pullRef.current = capped
      setPullDistance(capped)
    }

    async function onTouchEnd() {
      if (startYRef.current === null) return
      const dist = pullRef.current
      startYRef.current = null

      if (dist >= threshold && !triggeredRef.current) {
        triggeredRef.current = true
        setRefreshing(true)
        setPullDistance(threshold)
        try {
          await onRefresh()
        } finally {
          setRefreshing(false)
          pullRef.current = 0
          setPullDistance(0)
        }
      } else {
        pullRef.current = 0
        setPullDistance(0)
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [refreshing, threshold, onRefresh])

  const reached = pullDistance >= threshold
  const pct = Math.min(1, pullDistance / threshold)

  return (
    <div style={{ touchAction: 'pan-y' }}>
      {/* Spinner indicator — sits above content, follows pull */}
      <div
        className="flex items-center justify-center gap-2 overflow-hidden text-[12px] font-medium text-(--text-tertiary) sm:hidden"
        style={{
          height: refreshing ? threshold : pullDistance,
          transition: pullDistance === 0 || refreshing ? 'height 0.15s ease-out' : 'none',
        }}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-(--brand-fg) ${refreshing ? 'animate-spin' : ''}`}
          style={{
            opacity: Math.max(0.25, pct),
            transform: refreshing ? undefined : `rotate(${reached ? 180 : pct * 180}deg)`,
            transition: refreshing ? undefined : 'transform 0.08s linear',
          }}
        >
          <path d="M12 4v10M6 10l6 6 6-6" />
        </svg>
        {pullDistance > 12 && (
          <span>{refreshing ? 'Refreshing…' : reached ? 'Release to refresh' : 'Pull to refresh'}</span>
        )}
      </div>
      {children}
    </div>
  )
}
