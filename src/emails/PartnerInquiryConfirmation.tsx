import { Heading, Text } from '@react-email/components'
import BrandLayout from './BrandLayout'

interface PartnerInquiryConfirmationProps {
  contactName: string
  companyName: string
}

export default function PartnerInquiryConfirmation(props: PartnerInquiryConfirmationProps) {
  const { contactName, companyName } = props

  return (
    <BrandLayout preview={`Thanks ${contactName} — we got your partner inquiry from ${companyName}`}>
      <Heading as="h2" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px', color: '#111827' }}>
        Thanks, {contactName}!
      </Heading>

      <Text style={{ margin: '0 0 12px' }}>
        We received your partner inquiry from <strong>{companyName}</strong>.
      </Text>

      <Text style={{ margin: '0 0 12px' }}>
        Julian will reach out personally within one business day to talk through how a partnership
        could work — what kind of jobs you typically refer, where in Central Texas they tend to
        land, and what your customers care about most. No sales script.
      </Text>

      <Text style={{ margin: '0 0 20px' }}>
        If you want to skip the wait, you can reach Julian directly at{' '}
        <a href="tel:254-346-7764" style={{ color: '#1e6bd6', fontWeight: 700 }}>254-346-7764</a>{' '}
        or{' '}
        <a href="mailto:julianleon@triplejmetaltx.com" style={{ color: '#1e6bd6', fontWeight: 700 }}>julianleon@triplejmetaltx.com</a>.
      </Text>

      <Text style={{ margin: '20px 0 0', color: '#374151' }}>
        — Julian, Triple J Metal LLC
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
    `Julian will reach out personally within one business day to talk through how a partnership could work — what kind of jobs you typically refer, where in Central Texas they tend to land, and what your customers care about most. No sales script.`,
    ``,
    `If you want to skip the wait, you can reach Julian directly at 254-346-7764 or julianleon@triplejmetaltx.com.`,
    ``,
    `— Julian, Triple J Metal LLC`,
    ``,
    `—`,
    `Triple J Metal LLC · 3319 Tem-Bel Ln, Temple, TX 76502 · 254-346-7764`,
  ].join('\n')
}
