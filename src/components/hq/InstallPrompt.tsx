'use client'

import { useEffect, useState } from 'react'

type Platform = 'ios' | 'android' | 'desktop' | 'unknown'

const STORAGE_KEY = 'hq_install_dismissed_at'
const VISIT_KEY   = 'hq_visit_count'

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua)
  if (isIOS) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}

function isInstalled(): boolean {
  if (typeof window === 'undefined') return false
  // iOS Safari PWA
  const iosStandalone = 'standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone
  // Android / desktop PWA
  const displayModeStandalone = window.matchMedia?.('(display-mode: standalone)').matches
  return Boolean(iosStandalone || displayModeStandalone)
}

/**
 * iOS install banner. Shows after the 3rd visit on iOS Safari when the app
 * is NOT already installed as a PWA. Dismissible; reappears after 7 days.
 *
 * Android path is stubbed out with `beforeinstallprompt` support — can wire
 * later once Android users actually exist.
 */
export function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState<Platform>('unknown')

  useEffect(() => {
    const p = detectPlatform()
    setPlatform(p)

    if (isInstalled()) return

    // Dismissed within the last 7 days?
    const dismissed = Number(localStorage.getItem(STORAGE_KEY) ?? '0')
    if (dismissed && Date.now() - dismissed < 7 * 24 * 60 * 60 * 1000) return

    // Increment visit count
    const count = Number(localStorage.getItem(VISIT_KEY) ?? '0') + 1
    localStorage.setItem(VISIT_KEY, String(count))

    // Show on 3rd+ visit (iOS) or 2nd+ visit (Android)
    if (p === 'ios' && count >= 3) setShow(true)
    if (p === 'android' && count >= 2) setShow(true)
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    setShow(false)
  }

  if (!show || platform === 'desktop' || platform === 'unknown') return null

  return (
    <div
      className="fixed inset-x-3 z-40 rounded-2xl border border-(--border-subtle) bg-(--surface-2)/95 backdrop-blur-md p-4 shadow-xl sm:hidden"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 84px)' }}
      role="dialog"
      aria-label="Install Triple J HQ"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white text-[15px] font-bold">
          T
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-(--text-primary)">
            Install Triple J HQ
          </h3>
          <p className="mt-0.5 text-[13px] text-(--text-secondary)">
            {platform === 'ios'
              ? <>Tap <ShareIcon /> below, then <strong>Add to Home Screen</strong>. Works offline after.</>
              : <>Add this app to your home screen for faster access and offline mode.</>}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0 -mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-(--text-tertiary) hover:text-(--text-primary) hover:bg-(--surface-3)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function ShareIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block -mt-0.5 align-middle text-(--brand-fg)"
    >
      <path d="M12 2v14M8 6l4-4 4 4" />
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
    </svg>
  )
}
