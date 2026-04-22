'use client'

import { useEffect, useState } from 'react'

/**
 * Tiny pill that appears when the browser goes offline.
 * Sits inline — parent decides where it lives. Hidden when online.
 */
export function OfflineBadge() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    function sync() {
      setOffline(typeof navigator !== 'undefined' && !navigator.onLine)
    }
    sync()
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])

  if (!offline) return null

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[11px] font-semibold">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Offline
    </span>
  )
}
