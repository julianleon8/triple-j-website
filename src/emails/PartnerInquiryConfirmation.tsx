import { Heading, Text } from '@react-email/components'
import BrandLayout from './BrandLayout'
import { napSignature } from './nap'
import { SITE } from '@/lib/site'
import type { Locale } from '@/i18n/config'
import { EMAILS } from '@/i18n/copy/emails'

interface PartnerInquiryConfirmationProps {
  contactName: string
  companyName: string
  /** The page the inquiry came from: /es/socios inquiries get Spanish. */
  locale?: Locale
}

export function partnerInquiryConfirmationSubject(locale: Locale = 'en'): string {
  return EMAILS[locale].partnerConfirm.subject
}

export default function PartnerInquiryConfirmation(props: PartnerInquiryConfirmationProps) {
  const { contactName, companyName, locale = 'en' } = props
  const t = EMAILS[locale].partnerConfirm

  return (
    <BrandLayout locale={locale} preview={t.preview(contactName, companyName)}>
      <Heading as="h2" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px', color: '#00182a' }}>
        {t.thanks(contactName)}
      </Heading>

      <Text style={{ margin: '0 0 12px' }}>
        {t.received} <strong>{companyName}</strong>.
      </Text>

      <Text style={{ margin: '0 0 12px' }}>{t.reachOut}</Text>

      <Text style={{ margin: '0 0 20px' }}>
        {t.skip}{' '}
        <a href={SITE.phoneHref} style={{ color: '#00182a', fontWeight: 700 }}>{SITE.phone}</a>{' '}
        {t.or}{' '}
        <a href={SITE.emailHref} style={{ color: '#00182a', fontWeight: 700 }}>{SITE.email}</a>.
      </Text>

      <Text style={{ margin: '20px 0 0', color: '#33475a' }}>
        {t.signature}
      </Text>
    </BrandLayout>
  )
}

export function partnerInquiryConfirmationText(props: PartnerInquiryConfirmationProps): string {
  const t = EMAILS[props.locale ?? 'en'].partnerConfirm
  return [
    t.thanks(props.contactName),
    ``,
    `${t.received} ${props.companyName}.`,
    ``,
    t.reachOut,
    ``,
    `${t.skip} ${SITE.phone} ${t.or} ${SITE.email}.`,
    ``,
    t.signature,
    ``,
    `—`,
    napSignature(),
  ].join('\n')
}
