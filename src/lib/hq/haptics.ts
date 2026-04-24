'use client'

import { useCallback } from 'react'

const DISABLED_KEY = 'hq_haptics_disabled'

function isDisabled(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(DISABLED_KEY) === '1'
  } catch {
    return false
  }
}

function vibrate(pattern: number | number[]): void {
  if (typeof navigator === 'undefined') return
  if (typeof navigator.vibrate !== 'function') return
  if (isDisabled()) return
  try {
    navigator.vibrate(pattern)
  } catch {
    // ignore — some browsers throw when focus is lost
  }
}

/**
 * Subtle, strategic haptic feedback.
 * Fires via the Vibration API (Android / iOS PWA both support it on user gesture).
 * Respects the `hq_haptics_disabled` localStorage flag — surfaced by Settings in Phase 3.
 */
export function useHaptics() {
  const tap = useCallback(() => vibrate(10), [])
  const success = useCallback(() => vibrate(20), [])
  const warn = useCallback(() => vibrate([25, 50, 25]), [])
  const error = useCallback(() => vibrate([50, 100, 50]), [])
  return { tap, success, warn, error }
}
