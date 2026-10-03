import { Heading, Text } from '@react-email/components'
import BrandLayout from './BrandLayout'
import { napSignature } from './nap'
import { SITE } from '@/lib/site'

interface PartnerInquiryConfirmationProps {
  contactName: string
  companyName: string
}

export default function PartnerInquiryConfirmation(props: PartnerInquiryConfirmationProps) {
  const { contactName, companyName } = props

  return (
    <BrandLayout preview={`Thanks ${contactName} — we got your partner inquiry from ${companyName}`}>
      <Heading as="h2" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px', color: '#00182a' }}>
        Thanks, {contactName}!
      </Heading>

      <Text style={{ margin: '0 0 12px' }}>
        We received your partner inquiry from <strong>{companyName}</strong>.
      </Text>

      <Text style={{ margin: '0 0 12px' }}>
        One of the owners will reach out personally within one business day to talk through how a partnership
        could work — what kind of jobs you typically refer, where in Central Texas they tend to
        land, and what your customers care about most. No sales script.
      </Text>

      <Text style={{ margin: '0 0 20px' }}>
        If you want to skip the wait, you can reach us directly at{' '}
        <a href={SITE.phoneHref} style={{ color: '#00182a', fontWeight: 700 }}>{SITE.phone}</a>{' '}
        or{' '}
        <a href={SITE.emailHref} style={{ color: '#00182a', fontWeight: 700 }}>{SITE.email}</a>.
      </Text>

      <Text style={{ margin: '20px 0 0', color: '#33475a' }}>
        — The Triple J Metal crew
      </Text>
    </BrandLayout>
  )
}

export function partnerInquiryConfirmationText(props: PartnerInquiryConfirmationProps): string {
  return [
    `Thanks, ${props.contactName}!`,
    ``,
    `We received your partner inquiry from ${props.companyName}.`,
    ``,
    `One of the owners will reach out personally within one business day to talk through how a partnership could work — what kind of jobs you typically refer, where in Central Texas they tend to land, and what your customers care about most. No sales script.`,
    ``,
    `If you want to skip the wait, you can reach us directly at ${SITE.phone} or ${SITE.email}.`,
    ``,
    `— The Triple J Metal crew`,
    ``,
    `—`,
    napSignature(),
  ].join('\n')
}
