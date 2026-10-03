import { Heading, Text, Section, Link } from '@react-email/components'
import BrandLayout, { BRAND_COLOR, DISPLAY_FONT, INK_900 } from './BrandLayout'
import { napSignature } from './nap'
import { SITE } from '@/lib/site'
import type { Locale } from '@/i18n/config'
import { EMAILS, serviceWord } from '@/i18n/copy/emails'

interface LeadCustomerConfirmationProps {
  name: string
  phone: string
  city: string
  serviceType: string
  isMilitary: boolean
  timeline?: string | null
  /** The lead's preferred_language: the Spanish site's leads get Spanish. */
  locale?: Locale
}

export function leadCustomerConfirmationSubject(locale: Locale = 'en'): string {
  return EMAILS[locale].leadConfirm.subject
}

export default function LeadCustomerConfirmation(props: LeadCustomerConfirmationProps) {
  const { name, phone, city, serviceType, isMilitary, timeline, locale = 'en' } = props
  const t = EMAILS[locale].leadConfirm
  const service = serviceWord(serviceType, locale)
  const isHot = timeline === 'asap'
  const [gotA, gotService, gotB, gotCity, gotC] = t.gotIt(service, city)
  const [nextA, nextB] = t.next(isHot)

  return (
    // The preview follows the body's promise (response lock): "today" only for ASAP.
    <BrandLayout locale={locale} preview={t.preview(name, service, isHot)}>
      {/* ── Eyebrow ──────────────────────────────────────────────── */}
      <Text style={eyebrow}>{t.eyebrow}</Text>

      {/* ── Big magazine headline ────────────────────────────────── */}
      <Heading as="h1" style={headline}>
        {t.thanks(name)}
      </Heading>
      <Text style={subhead}>
        {gotA}<strong style={{ color: INK_900 }}>{gotService}</strong>{gotB}<strong style={{ color: INK_900 }}>{gotCity}</strong>{gotC}
      </Text>

      {/* ── The promise — what happens next ──────────────────────── */}
      <Section style={promiseCard}>
        <Text style={promiseLabel}>{t.nextLabel}</Text>
        <Text style={promiseText}>
          {nextA}{' '}
          <strong style={{ color: INK_900 }}>{phone}</strong>{' '}
          {nextB}
        </Text>
      </Section>

      {/* ── Conditional flags — military / ASAP ──────────────────── */}
      {isMilitary && (
        <Section style={{ ...flagCard, background: '#f6f3e8', borderLeftColor: '#4b5320' }}>
          <Text style={{ ...flagText, color: '#3a4119' }}>
            ⭐ <strong>{t.military[0]}</strong> {t.military[1]}
          </Text>
        </Section>
      )}
      {isHot && (
        <Section style={{ ...flagCard, background: '#f4f6f8', borderLeftColor: BRAND_COLOR }}>
          <Text style={{ ...flagText, color: INK_900 }}>
            ⚡ <strong>{t.hot[0]}</strong> {t.hot[1]}
          </Text>
        </Section>
      )}

      {/* ── Soft urgency — call us if you can't wait ─────────────── */}
      <Section style={{ margin: '24px 0 0' }}>
        <Text style={callNowText}>{t.cantWait}</Text>
        <Link href={SITE.phoneHref} style={callNowButton}>
          📞 {SITE.phone}
        </Link>
      </Section>

      {/* ── Family signature ─────────────────────────────────────── */}
      <Text style={signature}>
        {t.signature}
        <br />
        <span style={signatureSub}>{t.signatureSub}</span>
      </Text>
    </BrandLayout>
  )
}

export function leadCustomerConfirmationText(props: LeadCustomerConfirmationProps): string {
  const locale = props.locale ?? 'en'
  const t = EMAILS[locale].leadConfirm
  const isHot = props.timeline === 'asap'
  const [nextA, nextB] = t.next(isHot)
  const lines = [
    t.eyebrow,
    ``,
    t.thanks(props.name),
    ``,
    t.gotIt(serviceWord(props.serviceType, locale), props.city).join(''),
    ``,
    t.nextLabel,
    `${nextA} ${props.phone} ${nextB}`,
  ]
  if (props.isMilitary) {
    lines.push(``)
    lines.push(`⭐ ${t.military[0]} ${t.military[1]}`)
  }
  if (isHot) {
    lines.push(``)
    lines.push(`⚡ ${t.hot[0]} ${t.hot[1]}`)
  }
  lines.push(``)
  lines.push(`${t.cantWaitPlain} ${SITE.phone}`)
  lines.push(``)
  lines.push(t.signature)
  lines.push(t.signatureSub)
  lines.push(``)
  lines.push(`—`)
  lines.push(napSignature())
  lines.push(EMAILS[locale].layout.taglinePlain)
  return lines.join('\n')
}

/* ── Styles ────────────────────────────────────────────────────── */

const eyebrow = {
  color: BRAND_COLOR,
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  margin: '0 0 6px',
}

const headline = {
  color: INK_900,
  fontFamily: DISPLAY_FONT,
  fontSize: '30px',
  fontWeight: 900,
  letterSpacing: '0.01em',
  lineHeight: 1.1,
  margin: '0 0 8px',
}

const subhead = {
  color: '#33475a',
  fontSize: '16px',
  margin: '0 0 24px',
  lineHeight: 1.5,
}

const promiseCard = {
  background: '#f4f6f8',
  border: '1px solid #e3e9ee',
  borderRadius: 10,
  padding: '18px 20px',
  margin: '0 0 16px',
}

const promiseLabel = {
  color: '#546678',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
}

const promiseText = {
  color: '#33475a',
  fontSize: '14px',
  lineHeight: 1.6,
  margin: 0,
}

const flagCard = {
  borderLeft: '4px solid',
  borderRadius: 6,
  padding: '12px 16px',
  margin: '0 0 12px',
}

const flagText = {
  fontSize: '13px',
  margin: 0,
  lineHeight: 1.5,
}

const callNowText = {
  color: '#546678',
  fontSize: '13px',
  margin: '0 0 8px',
}

const callNowButton = {
  display: 'inline-block',
  background: INK_900,
  color: '#ffffff',
  padding: '12px 22px',
  borderRadius: 8,
  fontSize: '16px',
  fontWeight: 700,
  textDecoration: 'none',
  letterSpacing: '0.01em',
}

const signature = {
  color: INK_900,
  fontSize: '15px',
  fontWeight: 700,
  margin: '28px 0 0',
  lineHeight: 1.4,
}

const signatureSub = {
  color: '#546678',
  fontSize: '12px',
  fontWeight: 400,
}
