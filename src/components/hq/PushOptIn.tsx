'use client'

import { useEffect, useState } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

// Serialize a base64url string into an ArrayBuffer for the subscribe call.
function urlBase64ToBuffer(base64: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const buffer = new ArrayBuffer(raw.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i)
  return buffer
}

type UiState = 'idle' | 'unsupported' | 'denied' | 'subscribed' | 'working'

function isSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * iOS PWA push opt-in card.
 *
 * Hidden by default. Shows only when:
 *   - Browser supports push
 *   - VAPID public key is configured at build time
 *   - User hasn't already subscribed AND hasn't been permanently denied
 *
 * On iOS Safari, push ONLY works inside an installed PWA (not mobile Safari).
 * The InstallPrompt banner from B3 nudges the user to install first.
 */
export function PushOptIn() {
  const [state, setState] = useState<UiState>('idle')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    if (!isSupported() || !VAPID_PUBLIC_KEY) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }

    // Check current subscription status
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        setSubscription(sub)
        setState('subscribed')
      }
    })
  }, [])

  async function enable() {
    if (!VAPID_PUBLIC_KEY) return
    setState('working')
    try {
      // iOS requires requestPermission() at user-gesture time and returns
      // 'granted' / 'denied' / 'default'.
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setState(perm === 'denied' ? 'denied' : 'idle')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToBuffer(VAPID_PUBLIC_KEY),
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      if (!res.ok) throw new Error(`subscribe failed: ${res.status}`)

      setSubscription(sub)
      setState('subscribed')
    } catch (err) {
      console.error('[push] enable failed', err)
      setState('idle')
    }
  }

  async function sendTest() {
    setTestResult(null)
    setTesting(true)
    try {
      const res = await fetch('/api/push/test', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setTestResult(data.error ?? `Failed (${res.status})`)
      } else if (data.sent === 0) {
        setTestResult('No subscriptions reached — check Vercel logs')
      } else {
        setTestResult(`Sent to ${data.sent} device${data.sent === 1 ? '' : 's'}`)
      }
    } catch (err) {
      setTestResult(err instanceof Error ? err.message : 'Network error')
    } finally {
      setTesting(false)
      setTimeout(() => setTestResult(null), 6000)
    }
  }

  async function disable() {
    if (!subscription) return
    setState('working')
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
      await subscription.unsubscribe()
      setSubscription(null)
      setState('idle')
    } catch (err) {
      console.error('[push] disable failed', err)
      setState('subscribed')
    }
  }

  // Nothing to show when the environment doesn't support push
  if (state === 'unsupported') return null

  if (state === 'subscribed') {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <BellIcon filled />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold text-(--text-primary)">Notifications on</h3>
            <p className="mt-0.5 text-[13px] text-(--text-secondary)">
              You&apos;ll get pinged for new leads, hot permits, and accepted quotes.
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={sendTest}
            disabled={testing}
            className="flex-1 min-h-10 px-3 rounded-lg text-[13px] font-semibold bg-(--surface-2) text-(--text-primary) hover:bg-(--surface-3) disabled:opacity-50 transition-colors"
          >
            {testing ? 'Sending…' : 'Send test push'}
          </button>
          <button
            type="button"
            onClick={disable}
            className="min-h-10 px-3 rounded-lg text-[13px] font-semibold text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-3) transition-colors"
          >
            Turn off
          </button>
        </div>
        {testResult && (
          <p className="mt-2 text-[12px] text-(--text-tertiary)">{testResult}</p>
        )}
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className="rounded-xl border border-(--border-subtle) bg-(--surface-2) p-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--surface-3) text-(--text-tertiary)">
          <BellIcon />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-(--text-primary)">Notifications blocked</h3>
          <p className="mt-0.5 text-[13px] text-(--text-secondary)">
            Re-enable in iOS Settings → Notifications → Triple J to get pinged for new leads.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-brand-500/40 bg-(--brand-fg)/5 p-4 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--brand-fg) text-white">
        <BellIcon />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-semibold text-(--text-primary)">Get pinged for new leads</h3>
        <p className="mt-0.5 text-[13px] text-(--text-secondary)">
          Hot leads, accepted quotes, high-score permits — straight to your phone.
        </p>
      </div>
      <button
        type="button"
        onClick={enable}
        disabled={state === 'working'}
        className="shrink-0 min-h-10 px-4 rounded-lg text-[13px] font-semibold bg-(--brand-fg) text-white hover:bg-(--brand-fg-hover) disabled:opacity-60 transition-colors"
      >
        {state === 'working' ? '…' : 'Enable'}
      </button>
    </div>
  )
}

function BellIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 22a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22zm7-5v-4a7 7 0 00-5-6.7V5a2 2 0 00-4 0v1.3A7 7 0 005 13v4l-2 2v1h18v-1l-2-2z" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}
