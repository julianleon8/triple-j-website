import { Heading, Text, Section, Row, Column, Link } from '@react-email/components'
import BrandLayout, { BRAND_COLOR } from './BrandLayout'

interface QuoteAcceptedOwnerAlertProps {
  quoteNumber: string
  customerName: string
  customerPhone?: string | null
  customerEmail?: string | null
  total: number
  action: 'accepted' | 'declined'
  acceptedAt: string
  jobNumber?: string | null
}

export default function QuoteAcceptedOwnerAlert(props: QuoteAcceptedOwnerAlertProps) {
  const { quoteNumber, customerName, customerPhone, customerEmail, total, action, acceptedAt, jobNumber } = props
  const isAccepted = action === 'accepted'
  const badgeColor = isAccepted ? '#16a34a' : '#dc2626'
  const badgeLabel = isAccepted ? '💰 ACCEPTED' : '❌ DECLINED'
  const totalStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(total)

  const rows: [string, React.ReactNode][] = [
    ['Quote', quoteNumber],
    ['Customer', customerName],
  ]
  if (customerPhone) {
    rows.push(['Phone', <Link key="p" href={`tel:${customerPhone}`} style={{ color: BRAND_COLOR, fontWeight: 700 }}>{customerPhone}</Link>])
  }
  if (customerEmail) rows.push(['Email', customerEmail])
  rows.push(['Total', totalStr])
  if (jobNumber) rows.push(['Job', jobNumber])

  return (
    <BrandLayout preview={`${isAccepted ? 'ACCEPTED' : 'DECLINED'}: Quote ${quoteNumber} — ${totalStr}`}>
      <Text style={{ margin: '0 0 10px' }}>
        <span style={{
          background: badgeColor,
          color: '#fff',
          padding: '4px 10px',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.3,
        }}>
          {badgeLabel}
        </span>
      </Text>

      <Heading as="h2" style={{ fontSize: 22, fontWeight: 700, margin: '6px 0 4px', color: '#111827' }}>
        {isAccepted ? `${totalStr} accepted` : `Quote declined`}
      </Heading>
      <Text style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
        {customerName} · {acceptedAt}
      </Text>

      <Section style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        {rows.map(([label, value], i) => (
          <Row key={label} style={{ background: i % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
            <Column style={{ padding: '10px 14px', fontWeight: 600, fontSize: 13, color: '#374151', width: 110, verticalAlign: 'top' }}>
              {label}
            </Column>
            <Column style={{ padding: '10px 14px', fontSize: 13, color: '#111827' }}>
              {value}
            </Column>
          </Row>
        ))}
      </Section>

      {isAccepted && (
        <Text style={{ margin: '18px 0 0', fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
          Auto-created a job record. A draft invoice is being pushed to QuickBooks.
          {' '}Call the customer to schedule the build.
        </Text>
      )}
    </BrandLayout>
  )
}

export function quoteAcceptedOwnerAlertText(props: QuoteAcceptedOwnerAlertProps): string {
  const totalStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(props.total)
  const isAccepted = props.action === 'accepted'
  const lines = [
    `${isAccepted ? 'ACCEPTED' : 'DECLINED'}: Quote ${props.quoteNumber} — ${totalStr}`,
    ``,
    `Customer: ${props.customerName}`,
  ]
  if (props.customerPhone) lines.push(`Phone: ${props.customerPhone}`)
  if (props.customerEmail) lines.push(`Email: ${props.customerEmail}`)
  lines.push(`Total: ${totalStr}`)
  if (props.jobNumber) lines.push(`Job: ${props.jobNumber}`)
  lines.push(``)
  lines.push(`When: ${props.acceptedAt}`)
  if (isAccepted) {
    lines.push(``)
    lines.push(`Auto-created a job record. Draft invoice pushed to QuickBooks.`)
    lines.push(`Call the customer to schedule the build.`)
  }
  lines.push(``)
  lines.push(`—`)
  lines.push(`Triple J Metal · 3319 Tem-Bel Ln, Temple, TX 76502 · 254-346-7764`)
  return lines.join('\n')
}
