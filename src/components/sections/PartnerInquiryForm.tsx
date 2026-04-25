'use client'

import { useRef, useState } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY

type CompanyType = 'manufacturer' | 'supplier' | 'dealer' | 'gc' | 'developer' | 'architect' | 'other'
type Volume = '' | 'exploring' | '1-5' | '6-20' | '20-50' | '50+'

type FormState = {
  company_name: string
  company_type: CompanyType | ''
  contact_name: string
  contact_role: string
  email: string
  phone: string
  message: string
  estimated_volume: Volume
  referral_source: string
}

const COMPANY_TYPE_OPTIONS: { value: CompanyType; label: string }[] = [
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'supplier',     label: 'Supplier' },
  { value: 'dealer',       label: 'Dealer / sales rep' },
  { value: 'gc',           label: 'Commercial GC' },
  { value: 'developer',    label: 'Property developer' },
  { value: 'architect',    label: 'Architect / designer' },
  { value: 'other',        label: 'Other' },
]

const VOLUME_OPTIONS: { value: Exclude<Volume, ''>; label: string }[] = [
  { value: 'exploring', label: 'Just exploring' },
  { value: '1-5',       label: '1–5 jobs / year' },
  { value: '6-20',      label: '6–20 jobs / year' },
  { value: '20-50',     label: '20–50 jobs / year' },
  { value: '50+',       label: '50+ jobs / year' },
]

const EMPTY: FormState = {
  company_name: '',
  company_type: '',
  contact_name: '',
  contact_role: '',
  email: '',
  phone: '',
  message: '',
  estimated_volume: '',
  referral_source: '',
}

export function PartnerInquiryForm() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'ok' | 'err'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<HCaptcha | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function submit() {
    setErrorMsg(null)
    if (!form.company_name.trim() || !form.contact_name.trim() || !form.email.trim() || !form.company_type || form.message.trim().length < 10) {
      setErrorMsg('Please fill in company name, your name, email, company type, and a short message (10+ characters).')
      return
    }
    if (HCAPTCHA_SITE_KEY && !captchaToken) {
      setErrorMsg('Please complete the captcha check below.')
      return
    }
    setStatus('submitting')
    try {
      const res = await fetch('/api/partner-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, captcha_token: captchaToken ?? undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const message = typeof data?.error === 'string' ? data.error : 'Submission failed. Please try again or call 254-346-7764.'
        setErrorMsg(message)
        setStatus('err')
        setCaptchaToken(null)
        captchaRef.current?.resetCaptcha()
        return
      }
      setStatus('ok')
      setForm(EMPTY)
      setCaptchaToken(null)
      captchaRef.current?.resetCaptcha()
    } catch {
      setErrorMsg('Network error. Please try again or call 254-346-7764.')
      setStatus('err')
      setCaptchaToken(null)
      captchaRef.current?.resetCaptcha()
    }
  }

  if (status === 'ok') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="text-3xl">🤝</div>
        <h3 className="mt-3 text-xl font-bold text-emerald-900">We got it.</h3>
        <p className="mt-2 text-sm text-emerald-800 max-w-md mx-auto">
          Julian will be in touch within one business day. If it's urgent, call{' '}
          <TrackedPhoneLink surface="partners_inquiry_success" className="font-bold underline" /> directly.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm font-semibold text-emerald-800 underline hover:text-emerald-900"
        >
          Send another inquiry
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Company name" required>
          <input
            type="text"
            value={form.company_name}
            onChange={(e) => update('company_name', e.target.value)}
            className={inputCls}
            placeholder="e.g. Capital Metal Buildings"
            autoComplete="organization"
          />
        </Field>

        <Field label="Company type" required>
          <select
            value={form.company_type}
            onChange={(e) => update('company_type', e.target.value as CompanyType | '')}
            className={inputCls}
          >
            <option value="">Select…</option>
            {COMPANY_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Your name" required>
          <input
            type="text"
            value={form.contact_name}
            onChange={(e) => update('contact_name', e.target.value)}
            className={inputCls}
            autoComplete="name"
          />
        </Field>

        <Field label="Your role / title">
          <input
            type="text"
            value={form.contact_role}
            onChange={(e) => update('contact_role', e.target.value)}
            className={inputCls}
            placeholder="e.g. Sales Manager"
            autoComplete="organization-title"
          />
        </Field>

        <Field label="Email" required>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputCls}
            autoComplete="email"
          />
        </Field>

        <Field label="Phone">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={inputCls}
            autoComplete="tel"
          />
        </Field>

        <Field label="Estimated volume in Central TX" className="sm:col-span-2">
          <select
            value={form.estimated_volume}
            onChange={(e) => update('estimated_volume', e.target.value as Volume)}
            className={inputCls}
          >
            <option value="">Select…</option>
            {VOLUME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <Field label="What kind of partnership are you looking for?" required className="sm:col-span-2">
          <textarea
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            className={`${inputCls} min-h-[140px] resize-y`}
            placeholder="Tell us what your customers usually need installed, what part of Central Texas they're in, and how you'd want a partnership to work."
          />
        </Field>

        <Field label="How did you hear about us?" className="sm:col-span-2">
          <input
            type="text"
            value={form.referral_source}
            onChange={(e) => update('referral_source', e.target.value)}
            className={inputCls}
            placeholder="Optional — Google, referral name, trade event, etc."
          />
        </Field>
      </div>

      {HCAPTCHA_SITE_KEY && (
        <div className="mt-5 flex justify-center">
          <HCaptcha
            ref={captchaRef}
            sitekey={HCAPTCHA_SITE_KEY}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
          />
        </div>
      )}

      {errorMsg && (
        <div className="mt-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          type="button"
          onClick={submit}
          disabled={status === 'submitting'}
          className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {status === 'submitting' ? 'Sending…' : 'Send Partner Inquiry'}
        </button>
        <p className="text-xs text-ink-500">
          One business-day response. Direct line:{' '}
          <TrackedPhoneLink surface="partners_inquiry_form" className="font-semibold text-brand-600 hover:underline" />.
        </p>
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400'

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-ink-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}
