'use client'

import { Mic, X, Sparkles, AlertCircle, Check } from 'lucide-react'

/**
 * Overlay shown during and after a hold-to-record voice memo.
 * Purely presentational — state is owned by the calling component
 * (HqHeader in this build). Respects dark mode via semantic tokens.
 */

export type VoiceOverlayPhase =
  | 'requesting'    // waiting on mic permission
  | 'recording'     // actively capturing audio; user still holding
  | 'transcribing'  // audio uploaded, awaiting Whisper + Claude response
  | 'success'       // lead created — briefly shown before we navigate
  | 'error'

export type VoiceRecordingOverlayProps = {
  phase: VoiceOverlayPhase
  /** 0..1 normalised RMS level from the audio recorder. */
  level?: number
  /** Elapsed ms in the current recording. */
  elapsedMs?: number
  /** Error message when phase === 'error'. */
  error?: string | null
  onCancel: () => void
  onDismiss?: () => void
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const mm = Math.floor(totalSeconds / 60)
  const ss = totalSeconds % 60
  return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
}

export function VoiceRecordingOverlay({
  phase,
  level = 0,
  elapsedMs = 0,
  error,
  onCancel,
  onDismiss,
}: VoiceRecordingOverlayProps) {
  const isDismissable =
    phase === 'error' || phase === 'success' || phase === 'transcribing'
  const backdropClick = isDismissable ? onDismiss : onCancel

  // Mic halo scales with RMS level — tight visual feedback that the mic
  // is picking up speech. Clamp to 1.0..1.35 so it breathes rather than
  // pulses violently.
  const micScale = 1 + Math.min(level, 1) * 0.35

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voice memo"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[voiceFadeIn_120ms_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) backdropClick?.()
      }}
    >
      <div
        className="relative w-[min(92vw,22rem)] rounded-3xl border border-(--border-subtle) bg-(--surface-2) px-6 pb-7 pt-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {phase === 'recording' && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel recording"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-(--surface-3) text-(--text-secondary) tap-solid"
          >
            <X size={16} strokeWidth={2} />
          </button>
        )}

        {/* Mic puck */}
        <div className="flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center">
            {phase === 'recording' && (
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-red-500/25 transition-transform"
                style={{ transform: `scale(${micScale})` }}
              />
            )}
            <div
              className={`relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg ${
                phase === 'recording'
                  ? 'bg-red-500 text-white'
                  : phase === 'error'
                  ? 'bg-red-500 text-white'
                  : phase === 'success'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-(--brand-fg) text-white'
              }`}
            >
              {phase === 'success' ? (
                <Check size={28} strokeWidth={2} />
              ) : phase === 'error' ? (
                <AlertCircle size={28} strokeWidth={2} />
              ) : phase === 'transcribing' ? (
                <Sparkles size={28} strokeWidth={2} className="animate-pulse" />
              ) : (
                <Mic size={28} strokeWidth={2} />
              )}
            </div>
          </div>
        </div>

        {/* Label + timer */}
        <div className="mt-4 text-center">
          <p
            className="text-[17px] font-semibold text-(--text-primary)"
            aria-live="polite"
          >
            {phase === 'requesting' && 'Requesting microphone…'}
            {phase === 'recording' && 'Recording'}
            {phase === 'transcribing' && 'Transcribing…'}
            {phase === 'success' && 'Lead created'}
            {phase === 'error' && 'Something went wrong'}
          </p>
          {phase === 'recording' && (
            <p className="mt-1 font-mono text-[28px] font-semibold tabular-nums tracking-tight text-(--text-primary)">
              {formatElapsed(elapsedMs)}
            </p>
          )}
          {phase === 'transcribing' && (
            <p className="mt-1 text-[13px] text-(--text-secondary)">
              Whisper + Claude. ~3 seconds.
            </p>
          )}
          {phase === 'requesting' && (
            <p className="mt-2 text-[13px] text-(--text-secondary)">
              Tap <span className="font-semibold">Allow</span> in the iOS prompt.
            </p>
          )}
          {phase === 'error' && error && (
            <p className="mt-2 text-[13px] text-red-500 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Level meter — only meaningful while recording */}
        {phase === 'recording' && (
          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-(--surface-3)">
            <div
              className="h-full rounded-full bg-red-500 transition-[width] duration-100"
              style={{ width: `${Math.round(Math.min(level, 1) * 100)}%` }}
            />
          </div>
        )}

        {/* Footer hints / actions */}
        <div className="mt-5 text-center">
          {phase === 'recording' && (
            <p className="text-[13px] text-(--text-tertiary)">
              Release to send. Tap <span className="font-semibold">✕</span> to cancel.
            </p>
          )}
          {phase === 'error' && (
            <button
              type="button"
              onClick={onDismiss ?? onCancel}
              className="mt-2 inline-flex items-center justify-center rounded-xl border border-(--border-subtle) bg-(--surface-3) px-4 py-2 text-[14px] font-semibold text-(--text-primary) tap-solid"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes voiceFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  )
}
