'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, FileDown, MessageSquare, Send, Undo2 } from 'lucide-react'
import { useHaptics } from '@/lib/hq/haptics'

type Props = {
  id: string
  status: string
  customerHasEmail: boolean
  customerHasPhone: boolean
}

export function QuoteDetailActions({ id, status, customerHasEmail, customerHasPhone }: Props) {
  const router = useRouter()
  const haptics = useHaptics()
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function send() {
    if (pending) return
    setPending('send')
    setError(null)
    const res = await fetch(`/api/quotes/${id}/send`, { method: 'POST' })
    setPending(null)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(typeof body.error === 'string' ? body.error : 'Send failed')
      haptics.error()
      return
    }
    haptics.success()
    router.refresh()
  }

  async function sendSms() {
    if (pending) return
    setPending('sms')
    setError(null)
    const res = await fetch(`/api/quotes/${id}/send-sms`, { method: 'POST' })
    setPending(null)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(typeof body.error === 'string' ? body.error : 'SMS failed')
      haptics.error()
      return
    }
    haptics.success()
    router.refresh()
  }

  async function markAccepted() {
    if (pending) return
    setPending('accept')
    setError(null)
    const res = await fetch(`/api/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    })
    setPending(null)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(typeof body.error === 'string' ? body.error : 'Failed to mark accepted')
      haptics.error()
      return
    }
    haptics.success()
    router.refresh()
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {status === 'draft' && (
        <>
          <ActionButton
            label={pending === 'send' ? 'Sending…' : 'Send email'}
            icon={Send}
            tone="primary"
            onClick={send}
            disabled={pending !== null || !customerHasEmail}
            title={!customerHasEmail ? 'Customer has no email on file' : undefined}
          />
          <ActionButton
            label={pending === 'sms' ? 'Sending…' : 'Send SMS'}
            icon={MessageSquare}
            tone="secondary"
            onClick={sendSms}
            disabled={pending !== null || !customerHasPhone}
            title={!customerHasPhone ? 'Customer has no phone on file' : 'Sends quote summary + accept link via Twilio'}
          />
        </>
      )}
      {status === 'sent' && (
        <>
          <ActionButton
            label={pending === 'send' ? 'Resending…' : 'Resend email'}
            icon={Send}
            tone="secondary"
            onClick={send}
            disabled={pending !== null || !customerHasEmail}
          />
          <ActionButton
            label={pending === 'sms' ? 'Sending…' : 'Send SMS'}
            icon={MessageSquare}
            tone="secondary"
            onClick={sendSms}
            disabled={pending !== null || !customerHasPhone}
            title={!customerHasPhone ? 'Customer has no phone on file' : undefined}
          />
          <ActionButton
            label={pending === 'accept' ? 'Updating…' : 'Mark accepted'}
            icon={CheckCircle2}
            tone="positive"
            onClick={markAccepted}
            disabled={pending !== null}
          />
        </>
      )}
      {status === 'accepted' && (
        <div className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-[14px] font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={16} strokeWidth={2} /> Accepted
          {/* Future: when Jobs table links back, surface "Open job" here. */}
        </div>
      )}
      {status === 'declined' && (
        <ActionButton
          label={pending === 'send' ? 'Resending…' : 'Resend for review'}
          icon={Undo2}
          tone="secondary"
          onClick={send}
          disabled={pending !== null || !customerHasEmail}
        />
      )}

      {/* PDF — opens the real PDF in a new tab; browser saves with the
          server-suggested filename. Generated via @react-pdf/renderer in
          the /api/quotes/[id]/pdf route. */}
      <a
        href={`/api/quotes/${id}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-3 text-[14px] font-semibold text-(--text-primary) tap-list hover:bg-(--surface-3)"
      >
        <FileDown size={16} strokeWidth={2} /> PDF
      </a>

      {error && (
        <p className="col-span-2 text-[13px] text-red-500">{error}</p>
      )}
    </div>
  )
}

type ActionButtonProps = {
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  tone: 'primary' | 'secondary' | 'positive'
  onClick: () => void
  disabled?: boolean
  title?: string
}

function ActionButton({ label, icon: Icon, tone, onClick, disabled, title }: ActionButtonProps) {
  const toneClass =
    tone === 'primary'
      ? 'bg-(--brand-fg) text-white'
      : tone === 'positive'
      ? 'bg-emerald-600 text-white'
      : 'border border-(--border-subtle) bg-(--surface-2) text-(--text-primary) hover:bg-(--surface-3)'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[14px] font-semibold tap-solid disabled:opacity-50 ${toneClass}`}
    >
      <Icon size={16} strokeWidth={2} /> {label}
    </button>
  )
}
