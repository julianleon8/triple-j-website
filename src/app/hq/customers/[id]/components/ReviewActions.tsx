'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Check, Clock, RotateCcw, X } from 'lucide-react'
import { useHaptics } from '@/lib/hq/haptics'

type Props = {
  customerId: string
  state: 'never' | 'asked' | 'left'
}

export function ReviewActions({ customerId, state }: Props) {
  const router = useRouter()
  const haptics = useHaptics()
  const [pending, setPending] = useState<'asked' | 'snoozed' | 'left' | 'reset' | null>(null)
  const [pasteOpen, setPasteOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function send(action: 'asked' | 'snoozed' | 'left' | 'reset', reviewUrl?: string) {
    if (pending) return
    setPending(action)
    setError(null)
    try {
      const body: Record<string, unknown> = { action }
      if (reviewUrl) body.url = reviewUrl
      const res = await fetch(`/api/customers/${customerId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to update')
      const json = (await res.json().catch(() => ({}))) as {
        sms?: { sent: boolean; reason?: string }
      }
      // DB write succeeded; surface SMS outcome non-blockingly so Julian
      // can fall back to a manual text if Twilio is unconfigured or choked.
      if (action === 'asked' && json.sms && !json.sms.sent) {
        const reasonLabel: Record<string, string> = {
          twilio_not_configured: 'Saved — SMS skipped (Twilio not configured)',
          no_phone: 'Saved — SMS skipped (no phone on file)',
          invalid_phone: 'Saved — SMS skipped (phone not a US number)',
          not_configured: 'Saved — SMS skipped (Twilio not configured)',
          send_failed: 'Saved — SMS send failed (check Twilio console)',
        }
        setError(reasonLabel[json.sms.reason ?? ''] ?? 'Saved — SMS not sent')
      }
      haptics.success()
      setPasteOpen(false)
      setUrl('')
      router.refresh()
    } catch (err) {
      haptics.error()
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setPending(null)
    }
  }

  if (state === 'never') {
    return (
      <button
        type="button"
        onClick={() => send('asked')}
        disabled={!!pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--brand-fg) px-3 py-3 text-[15px] font-semibold text-white tap-solid disabled:opacity-50"
      >
        <Star size={16} strokeWidth={2} />
        {pending === 'asked' ? 'Saving…' : 'Ask for review'}
      </button>
    )
  }

  if (state === 'left') {
    return (
      <button
        type="button"
        onClick={() => send('reset')}
        disabled={!!pending}
        className="inline-flex items-center gap-1.5 text-[13px] text-(--text-tertiary) hover:underline disabled:opacity-50"
      >
        <RotateCcw size={12} strokeWidth={2} />
        Reset review state
      </button>
    )
  }

  // 'asked' state
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setPasteOpen(true)}
          disabled={!!pending}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-(--brand-fg) px-3 py-3 text-[14px] font-semibold text-white tap-solid disabled:opacity-50"
        >
          <Check size={16} strokeWidth={2} />
          Review left
        </button>
        <button
          type="button"
          onClick={() => send('snoozed')}
          disabled={!!pending}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-(--border-subtle) bg-(--surface-1) px-3 py-3 text-[14px] font-semibold text-(--text-primary) tap-list disabled:opacity-50"
        >
          <Clock size={16} strokeWidth={2} />
          {pending === 'snoozed' ? 'Snoozing…' : 'Snooze 7 days'}
        </button>
      </div>
      {error ? <p className="mt-2 text-center text-[12px] text-red-500">{error}</p> : null}

      {pasteOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            aria-hidden="true"
            onClick={() => setPasteOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-t-2xl bg-(--surface-1) p-5 shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-(--text-primary)">Review URL</h3>
              <button
                type="button"
                onClick={() => setPasteOpen(false)}
                className="rounded-lg p-1.5 text-(--text-tertiary) hover:bg-(--surface-2)"
                aria-label="Close"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <p className="mt-1 text-[13px] text-(--text-secondary)">
              Paste the link to their Google review (optional — skip to just mark left).
            </p>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://g.page/r/..."
              autoFocus
              className="mt-3 w-full rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-3 text-[14px] text-(--text-primary) outline-none focus:border-(--brand-fg)"
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => send('left')}
                disabled={pending === 'left'}
                className="rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-3 text-[14px] font-semibold text-(--text-primary) tap-list disabled:opacity-50"
              >
                Skip URL
              </button>
              <button
                type="button"
                onClick={() => send('left', url.trim() || undefined)}
                disabled={pending === 'left'}
                className="rounded-xl bg-(--brand-fg) px-3 py-3 text-[14px] font-semibold text-white tap-solid disabled:opacity-50"
              >
                {pending === 'left' ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
