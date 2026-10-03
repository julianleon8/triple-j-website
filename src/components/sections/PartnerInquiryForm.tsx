'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type HCaptcha from '@hcaptcha/react-hcaptcha'

import { ToggleChip } from '@/components/forge/Chip'
import { FieldLabel, PillGroup, SuccessPanel, TextArea, TextInput } from '@/components/forge/form'
import type { Locale } from '@/i18n/config'
import { PARTNER_FORM } from '@/i18n/copy/forms'
import { useLocale } from '@/i18n/use-locale'
import { capture } from '@/lib/analytics'
import { SITE } from '@/lib/site'

// Lazy-load hCaptcha — splits the 20 KB widget into its own chunk that
// only fetches when this form mounts (i.e. the user is on /partners).
// Mirrors the pattern in QuoteForm.tsx — ref-forwarding type is restored
// via the cast since next/dynamic erases the ref slot from props.
const HCaptchaWidget = dynamic(
  () => import('@hcaptcha/react-hcaptcha').then((m) => m.default),
  { ssr: false, loading: () => null },
) as unknown as typeof import('@hcaptcha/react-hcaptcha').default

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY

type CompanyType = 'supplier' | 'manufacturer' | 'dealer' | 'gc' | 'other'

// Labels: PARTNER_FORM[locale].companyTypes.
const COMPANY_TYPES: CompanyType[] = ['supplier', 'manufacturer', 'dealer', 'gc', 'other']

export const COUNTIES = ['Bell', 'McLennan', 'Coryell', 'Williamson', 'Lampasas', 'Falls', 'Milam', 'Burnet'] as const
const VOLUMES = ['1–2 jobs / mo', '3–5 jobs / mo', '6+ jobs / mo', 'Project by project'] as const

export type PartnerInput = {
  company_type: CompanyType | ''
  company_name: string
  contact_name: string
  phone: string
  email: string
  counties: string[]
  volume: string
  notes: string
}

/**
 * The /api/partner-inquiries body. The schema has no columns for counties or
 * volume, so both ride in `message` (which must be 10+ characters) — the
 * owner alert and HQ Partners show it as written.
 */
export function buildPartnerPayload(p: PartnerInput, captchaToken: string | null, language: Locale = 'en') {
  const head = [
    `Counties: ${p.counties.length ? p.counties.join(', ') : 'none picked'}`,
    p.volume ? `Volume: ${p.volume}` : '',
  ].filter(Boolean).join(' · ')
  return {
    company_name: p.company_name.trim(),
    company_type: p.company_type || 'other',
    contact_name: p.contact_name.trim(),
    email: p.email.trim(),
    phone: p.phone.trim(),
    message: [head, p.notes.trim()].filter(Boolean).join('\n\n').slice(0, 2000),
    captcha_token: captchaToken ?? undefined,
    language,
  }
}

/** The design allows phone or email; the API requires an email, so email it is. */
export function canSendPartner(p: PartnerInput): boolean {
  return p.company_name.trim().length >= 2 && p.contact_name.trim().length >= 2 && /\S+@\S+/.test(p.email)
}

export function countyLine(counties: string[], locale: Locale = 'en'): string {
  const t = PARTNER_FORM[locale]
  if (!counties.length) return t.centralTexas
  return t.county(counties.join(', '), counties.length > 1)
}

const EMPTY: PartnerInput = {
  company_type: '',
  company_name: '',
  contact_name: '',
  phone: '',
  email: '',
  counties: ['Bell'],
  volume: '',
  notes: '',
}

export function PartnerInquiryForm() {
  const locale = useLocale()
  const t = PARTNER_FORM[locale]
  const [p, setP] = useState<PartnerInput>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'ok' | 'err'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<HCaptcha | null>(null)

  const set = <K extends keyof PartnerInput>(k: K, v: PartnerInput[K]) => setP((cur) => ({ ...cur, [k]: v }))
  const toggleCounty = (c: string) =>
    setP((cur) => ({ ...cur, counties: cur.counties.includes(c) ? cur.counties.filter((x) => x !== c) : [...cur.counties, c] }))

  async function submit() {
    setErrorMsg(null)
    if (!canSendPartner(p)) return
    if (HCAPTCHA_SITE_KEY && !captchaToken) {
      setErrorMsg(t.captcha)
      setStatus('err')
      return
    }
    setStatus('submitting')
    try {
      const res = await fetch('/api/partner-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPartnerPayload(p, captchaToken, locale)),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(typeof data?.error === 'string' && locale === 'en' ? data.error : t.failed(SITE.phone))
        setStatus('err')
      } else {
        capture('partner_inquiry_submitted', { company_type: p.company_type || undefined })
        setStatus('ok')
      }
    } catch {
      setErrorMsg(t.network(SITE.phone))
      setStatus('err')
    }
    setCaptchaToken(null)
    captchaRef.current?.resetCaptcha()
  }

  const card =
    'rounded-[12px] border border-forge-silver bg-white p-[clamp(20px,2vw,32px)] text-forge-navy shadow-[var(--shadow-lifted)]'

  if (status === 'ok') {
    const first = p.contact_name.trim().split(/\s+/)[0] ?? ''
    return (
      <div className={card}>
        <SuccessPanel title={t.received} resetLabel={t.edit} onReset={() => setStatus('idle')}>
          {t.thanks(first, countyLine(p.counties, locale))}
        </SuccessPanel>
      </div>
    )
  }

  return (
    <div className={card}>
      <div className="flex flex-col gap-[22px]">
        <PillGroup
          label={t.youAre}
          options={COMPANY_TYPES.map((v) => ({ v, label: t.companyTypes[v] }))}
          value={p.company_type}
          onChange={(v) => set('company_type', v)}
        />
        <div>
          <FieldLabel as="p">{t.companyContact}</FieldLabel>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-2.5">
            <TextInput placeholder={t.company} aria-label={t.company} autoComplete="organization" value={p.company_name} onChange={(e) => set('company_name', e.target.value)} />
            <TextInput placeholder={t.yourName} aria-label={t.yourName} autoComplete="name" value={p.contact_name} onChange={(e) => set('contact_name', e.target.value)} />
            <TextInput type="tel" placeholder={t.phone} aria-label={t.phone} autoComplete="tel" value={p.phone} onChange={(e) => set('phone', e.target.value)} />
            <TextInput type="email" placeholder={t.email} aria-label={t.email} autoComplete="email" value={p.email} onChange={(e) => set('email', e.target.value)} />
          </div>
        </div>
        <div>
          <FieldLabel as="p">{t.counties}</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {COUNTIES.map((c) => (
              <ToggleChip key={c} selected={p.counties.includes(c)} onToggle={() => toggleCounty(c)}>
                {c}
              </ToggleChip>
            ))}
          </div>
        </div>
        <PillGroup
          label={t.volume}
          optional
          allowDeselect
          options={VOLUMES.map((v) => ({ v, label: t.volumes[v] }))}
          value={p.volume}
          onChange={(v) => set('volume', v)}
        />
        <div>
          <FieldLabel htmlFor="partner-notes" optional>
            {t.notes}
          </FieldLabel>
          <TextArea
            id="partner-notes"
            rows={3}
            maxLength={1500}
            placeholder={t.notesPlaceholder}
            value={p.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>
        {HCAPTCHA_SITE_KEY ? (
          <div className="flex justify-center">
            <HCaptchaWidget
              ref={captchaRef}
              sitekey={HCAPTCHA_SITE_KEY}
              theme="light"
              languageOverride={locale}
              onVerify={(t) => setCaptchaToken(t)}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />
          </div>
        ) : null}
        {errorMsg ? (
          <div role="alert" className="rounded-[8px] border border-forge-navy bg-forge-fog px-4 py-3 text-[14px] font-semibold">
            {errorMsg}
          </div>
        ) : null}
        <button
          type="button"
          onClick={submit}
          disabled={status === 'submitting' || !canSendPartner(p)}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-forge-navy px-[26px] py-[15px] text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-forge-navy-raised disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'submitting' ? t.sending : t.send} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}
