import { Heading, Text, Section, Row, Column, Link } from '@react-email/components'
import BrandLayout, { BRAND_COLOR } from './BrandLayout'

interface PartnerInquiryOwnerAlertProps {
  inquiryId: string
  companyName: string
  companyType: string
  contactName: string
  contactRole?: string | null
  email: string
  phone?: string | null
  message: string
  estimatedVolume?: string | null
  referralSource?: string | null
  submittedAt: string
}

export default function PartnerInquiryOwnerAlert(props: PartnerInquiryOwnerAlertProps) {
  const {
    inquiryId,
    companyName,
    companyType,
    contactName,
    contactRole,
    email,
    phone,
    message,
    estimatedVolume,
    referralSource,
    submittedAt,
  } = props

  const rows: [string, React.ReactNode][] = [
    ['Company', companyName],
    ['Type', companyType],
    ['Contact', `${contactName}${contactRole ? ` — ${contactRole}` : ''}`],
    ['Email', <Link key="e" href={`mailto:${email}`} style={{ color: BRAND_COLOR, fontWeight: 700 }}>{email}</Link>],
  ]
  if (phone) {
    rows.push(['Phone', <Link key="p" href={`tel:${phone}`} style={{ color: BRAND_COLOR, fontWeight: 700 }}>{phone}</Link>])
  }
  if (estimatedVolume) rows.push(['Estimated volume', estimatedVolume])
  if (referralSource) rows.push(['How they heard', referralSource])
  rows.push(['What they want', message])

  return (
    <BrandLayout preview={`Partner inquiry — ${companyName} (${companyType})`}>
      <Heading as="h2" style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#111827' }}>
        🤝 Partner inquiry
      </Heading>
      <Text style={{ fontSize: 12, color: '#6b7280', margin: '0 0 16px' }}>
        <span style={{
          background: BRAND_COLOR,
          color: '#fff',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 700,
          marginRight: 8,
        }}>
          B2B
        </span>
        {submittedAt}
      </Text>

      <Section style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        {rows.map(([label, value], i) => (
          <Row key={label} style={{ background: i % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
            <Column style={{ padding: '10px 14px', fontWeight: 600, fontSize: 13, color: '#374151', width: 150, verticalAlign: 'top' }}>
              {label}
            </Column>
            <Column style={{ padding: '10px 14px', fontSize: 13, color: '#111827', whiteSpace: 'pre-wrap' }}>
              {value}
            </Column>
          </Row>
        ))}
      </Section>

      <Text style={{ color: '#9ca3af', fontSize: 11, margin: '20px 0 0' }}>
        Inquiry ID: {inquiryId}
      </Text>
    </BrandLayout>
  )
}

export function partnerInquiryOwnerAlertText(props: PartnerInquiryOwnerAlertProps): string {
  const lines = [
    `PARTNER INQUIRY — Triple J Metal`,
    ``,
    `Company: ${props.companyName}`,
    `Type: ${props.companyType}`,
    `Contact: ${props.contactName}${props.contactRole ? ` — ${props.contactRole}` : ''}`,
    `Email: ${props.email}`,
  ]
  if (props.phone) lines.push(`Phone: ${props.phone}`)
  if (props.estimatedVolume) lines.push(`Estimated volume: ${props.estimatedVolume}`)
  if (props.referralSource) lines.push(`How they heard: ${props.referralSource}`)
  lines.push(``, `What they want:`, props.message)
  lines.push(``, `Inquiry ID: ${props.inquiryId}`)
  lines.push(``, `Submitted: ${props.submittedAt}`)
  lines.push(``, `—`)
  lines.push(`Triple J Metal LLC · 3319 Tem-Bel Ln, Temple, TX 76502 · 254-346-7764`)
  return lines.join('\n')
}
