'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { OfflineBadge } from '@/components/hq/OfflineBadge'
import { CreatePopover } from '@/components/hq/CreatePopover'
import {
  VoiceRecordingOverlay,
  type VoiceOverlayPhase,
} from '@/components/hq/VoiceRecordingOverlay'
import {
  createAudioRecorder,
  isMediaRecorderSupported,
  type AudioRecorder,
} from '@/lib/hq/audio-recorder'
import { useHaptics } from '@/lib/hq/haptics'

// How long the user must hold the + button before we flip from
// "short press opens popover" into "long press arms voice memo".
// 500ms matches iOS system long-press.
const LONG_PRESS_MS = 500

// Guard rail so accidental ~40ms taps don't toggle the popover.
const MIN_MEANINGFUL_RELEASE_MS = 60

function titleFor(pathname: string, tab: string | null): string {
  if (pathname === '/hq') return tab === 'funnel' ? 'Funnel' : 'Today'
  // Detail routes (singular) — checked before list-prefix matches.
  if (/^\/hq\/leads\/[^/]+$/.test(pathname))     return 'Lead'
  if (/^\/hq\/jobs\/[^/]+$/.test(pathname))      return 'Job'
  if (/^\/hq\/customers\/[^/]+$/.test(pathname)) return 'Customer'
  if (pathname.startsWith('/hq/leads'))                  return 'Leads'
  if (pathname.startsWith('/hq/permit-leads'))           return 'Permits'
  if (pathname.startsWith('/hq/customers'))              return 'Customers'
  if (pathname.startsWith('/hq/quotes'))                 return 'Quotes'
  if (pathname.startsWith('/hq/jobs'))                   return 'Jobs'
  if (pathname.startsWith('/hq/gallery'))                return 'Gallery'
  if (pathname === '/hq/more/stats')                     return 'Stats'
  if (pathname.startsWith('/hq/more'))                   return 'More'
  if (pathname.startsWith('/hq/settings/notifications')) return 'Notifications'
  if (pathname.startsWith('/hq/settings/testing'))       return 'Testing'
  if (pathname.startsWith('/hq/settings/logs'))          return 'Logs'
  if (pathname.startsWith('/hq/settings/quickbooks'))    return 'QuickBooks'
  if (pathname.startsWith('/hq/settings'))               return 'Settings'
  return 'Triple J'
}

/**
 * iOS-style large-title header for HQ.
 * - Large 28px title at scroll=0, collapses to compact 17px on scroll.
 * - Plus button: short press → CreatePopover, hold ≥500ms → voice memo.
 * - Avatar → /hq/settings.
 *
 * Voice memo flow (Phase 4):
 *   pointerdown                → arm long-press timer
 *   release < LONG_PRESS_MS    → toggle popover
 *   long-press timer fires     → show overlay + start MediaRecorder
 *   release during recording   → stop + upload → transcribe → navigate
 *   overlay X or Escape        → cancel + discard
 */
export function HqHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const haptics = useHaptics()

  const [scrolled, setScrolled] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [isRefreshing, startRefreshTransition] = useTransition()

  const onRefresh = useCallback(() => {
    haptics.warn()
    startRefreshTransition(() => {
      router.refresh()
    })
  }, [haptics, router])

  const [overlayPhase, setOverlayPhase] = useState<VoiceOverlayPhase | null>(null)
  const [level, setLevel] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [overlayError, setOverlayError] = useState<string | null>(null)

  const plusRef = useRef<HTMLButtonElement>(null)
  const recorderRef = useRef<AudioRecorder | null>(null)
  const pressStartRef = useRef<number>(0)
  const longPressTimerRef = useRef<number | null>(null)
  const isRecordingRef = useRef(false)
  const tickRef = useRef<number | null>(null)

  const title = titleFor(pathname, searchParams.get('tab'))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setCreateOpen(false)
  }, [pathname, searchParams])

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const stopElapsedTick = useCallback(() => {
    if (tickRef.current != null) {
      cancelAnimationFrame(tickRef.current)
      tickRef.current = null
    }
  }, [])

  const cancelRecording = useCallback(() => {
    clearLongPressTimer()
    stopElapsedTick()
    recorderRef.current?.cancel()
    recorderRef.current = null
    isRecordingRef.current = false
    setOverlayPhase(null)
    setOverlayError(null)
    setLevel(0)
    setElapsedMs(0)
  }, [clearLongPressTimer, stopElapsedTick])

  const uploadAndCreate = useCallback(
    async (blob: Blob) => {
      setOverlayPhase('transcribing')
      setLevel(0)

      const form = new FormData()
      const ext = blob.type.includes('webm') ? 'webm' : 'mp4'
      form.append('audio', blob, `memo.${ext}`)

      try {
        const res = await fetch('/api/hq/voice-lead', {
          method: 'POST',
          body: form,
        })
        const body = (await res.json().catch(() => ({}))) as {
          id?: string
          error?: string
          warning?: string
        }
        if (!res.ok) {
          throw new Error(body.error || `Upload failed (${res.status})`)
        }
        haptics.success()
        setOverlayPhase('success')
        // Brief pause so the success check registers visually, then route.
        window.setTimeout(() => {
          setOverlayPhase(null)
          if (body.id) router.push(`/hq/leads/${body.id}`)
          else router.push('/hq/leads')
          router.refresh()
        }, 700)
      } catch (err) {
        haptics.error()
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setOverlayError(msg)
        setOverlayPhase('error')
      }
    },
    [haptics, router],
  )

  const finalizeRecording = useCallback(async () => {
    if (!isRecordingRef.current) return
    isRecordingRef.current = false
    stopElapsedTick()
    const rec = recorderRef.current
    if (!rec) {
      setOverlayPhase(null)
      return
    }
    try {
      const blob = await rec.stop()
      recorderRef.current = null
      await uploadAndCreate(blob)
    } catch (err) {
      recorderRef.current = null
      const msg = err instanceof Error ? err.message : String(err)
      if (/too short/i.test(msg)) {
        // Treat under-minDuration releases as a cancel, no error pill.
        setOverlayPhase(null)
        setOverlayError(null)
        return
      }
      haptics.error()
      setOverlayError(msg)
      setOverlayPhase('error')
    }
  }, [haptics, stopElapsedTick, uploadAndCreate])

  const armRecording = useCallback(async () => {
    if (!isMediaRecorderSupported()) {
      // Silent fallback: open the popover. Desktop browsers without mic
      // still get a usable + button.
      setCreateOpen((o) => !o)
      return
    }
    haptics.warn()
    setOverlayPhase('requesting')
    setOverlayError(null)

    const rec = createAudioRecorder({
      onLevel: (l) => setLevel(l),
      onStateChange: (s) => {
        if (s === 'recording') {
          isRecordingRef.current = true
          setOverlayPhase('recording')
          // Elapsed-time tick — rAF throttled to ~10fps for battery.
          let last = 0
          const tick = (ts: number) => {
            if (ts - last > 100) {
              last = ts
              setElapsedMs(rec.elapsedMs())
            }
            tickRef.current = requestAnimationFrame(tick)
          }
          tickRef.current = requestAnimationFrame(tick)
        }
      },
      onError: (err) => {
        setOverlayError(err.message)
        setOverlayPhase('error')
      },
      minDurationMs: 400,
    })
    recorderRef.current = rec
    try {
      await rec.start()
    } catch {
      // onError already surfaced the error via overlay state.
      recorderRef.current = null
    }
  }, [haptics])

  // ── Pointer handlers on the + button ───────────────────────────────────
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      // Don't arm when the popover is already open — this is a close-tap.
      if (createOpen) return
      pressStartRef.current = performance.now()
      try { e.currentTarget.setPointerCapture?.(e.pointerId) } catch {}
      clearLongPressTimer()
      longPressTimerRef.current = window.setTimeout(() => {
        longPressTimerRef.current = null
        armRecording()
      }, LONG_PRESS_MS)
    },
    [createOpen, armRecording, clearLongPressTimer],
  )

  const onPointerUp = useCallback(() => {
    const heldMs = performance.now() - pressStartRef.current

    // Long-press window never fired → tap.
    if (longPressTimerRef.current != null) {
      clearLongPressTimer()
      if (heldMs >= MIN_MEANINGFUL_RELEASE_MS) {
        setCreateOpen((o) => !o)
      }
      return
    }

    // Long-press fired but mic hasn't confirmed recording yet. Cancel.
    if (overlayPhase === 'requesting') {
      cancelRecording()
      return
    }

    // Recording → send.
    if (isRecordingRef.current) {
      finalizeRecording()
    }
  }, [clearLongPressTimer, overlayPhase, cancelRecording, finalizeRecording])

  const onPointerCancel = useCallback(() => {
    // iOS fires pointercancel if a system alert or similar interrupts.
    // During recording, treat as release-to-send; otherwise drop.
    if (longPressTimerRef.current != null) {
      clearLongPressTimer()
      return
    }
    if (isRecordingRef.current) {
      finalizeRecording()
    } else {
      cancelRecording()
    }
  }, [clearLongPressTimer, cancelRecording, finalizeRecording])

  useEffect(() => {
    return () => {
      clearLongPressTimer()
      stopElapsedTick()
      recorderRef.current?.cancel()
    }
  }, [clearLongPressTimer, stopElapsedTick])

  const overlayDismiss = useCallback(() => {
    setOverlayPhase(null)
    setOverlayError(null)
    setLevel(0)
    setElapsedMs(0)
  }, [])

  return (
    <header
      className="sticky top-0 z-30 border-b border-(--border-subtle) bg-(--surface-1)/85 backdrop-blur-md sm:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <h1
            className={`font-(--font-ios) font-bold text-(--text-primary) tracking-tight transition-all ${
              scrolled ? 'text-[17px]' : 'text-[28px]'
            }`}
          >
            {title}
          </h1>
          <OfflineBadge />
        </div>
        <div className="relative flex items-center gap-1.5">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex h-9 w-9 items-center justify-center rounded-full text-(--text-primary) bg-(--surface-2) border border-(--border-subtle) tap-solid disabled:opacity-50"
            aria-label="Refresh page"
          >
            <RefreshCw size={17} strokeWidth={2.3} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            ref={plusRef}
            type="button"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onContextMenu={(e) => e.preventDefault()}
            className="flex h-9 w-9 items-center justify-center rounded-full text-(--text-primary) bg-(--surface-2) border border-(--border-subtle) tap-solid select-none"
            aria-haspopup="menu"
            aria-expanded={createOpen}
            aria-label="Create new · hold to record voice memo"
            style={{ WebkitTouchCallout: 'none' }}
          >
            <Plus size={20} strokeWidth={2.3} />
          </button>
          <button
            type="button"
            onClick={() => router.push('/hq/settings')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-(--brand-fg) text-white text-sm font-bold tap-solid"
            aria-label="Settings"
          >
            JL
          </button>
          <CreatePopover
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            anchorRef={plusRef}
          />
        </div>
      </div>

      {overlayPhase && (
        <VoiceRecordingOverlay
          phase={overlayPhase}
          level={level}
          elapsedMs={elapsedMs}
          error={overlayError}
          onCancel={cancelRecording}
          onDismiss={overlayDismiss}
        />
      )}
    </header>
  )
}
