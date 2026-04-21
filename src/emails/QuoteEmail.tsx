import {
  Section,
  Row,
  Column,
  Heading,
  Text,
  Button,
} from '@react-email/components'
import BrandLayout, { BRAND_COLOR } from './BrandLayout'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

interface QuoteEmailProps {
  customerName: string
  quoteNumber: string
  lineItems: LineItem[]
  subtotal: number
  taxAmount: number
  total: number
  validUntil: string
  notes?: string
  acceptUrl: string
}

export default function QuoteEmail({
  customerName,
  quoteNumber,
  lineItems,
  subtotal,
  taxAmount,
  total,
  validUntil,
  notes,
  acceptUrl,
}: QuoteEmailProps) {
  return (
    <BrandLayout preview={`Your quote ${quoteNumber} from Triple J Metal — ${customerName}`}>
      <Heading as="h2" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>
        Quote {quoteNumber}
      </Heading>
      <Text style={{ color: '#374151', margin: '0 0 20px' }}>
        Hi {customerName}, here is your quote from Triple J Metal LLC. Review the details below and
        click the button to accept or decline.
      </Text>

      <Section style={{ border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
        <Row style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <Column style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', width: '55%' }}>Description</Column>
          <Column style={{ padding: '10px 8px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'center', width: '15%' }}>Qty</Column>
          <Column style={{ padding: '10px 8px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right', width: '15%' }}>Unit</Column>
          <Column style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right', width: '15%' }}>Total</Column>
        </Row>
        {lineItems.map((item, i) => (
          <Row key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <Column style={{ padding: '10px 16px', fontSize: 14, color: '#111827' }}>{item.description}</Column>
            <Column style={{ padding: '10px 8px', fontSize: 14, color: '#374151', textAlign: 'center' }}>{item.quantity}</Column>
            <Column style={{ padding: '10px 8px', fontSize: 14, color: '#374151', textAlign: 'right' }}>${item.unit_price.toFixed(2)}</Column>
            <Column style={{ padding: '10px 16px', fontSize: 14, color: '#111827', textAlign: 'right' }}>${item.total_price.toFixed(2)}</Column>
          </Row>
        ))}
      </Section>

      <Section style={{ marginBottom: 24 }}>
        <Row>
          <Column style={{ textAlign: 'right', paddingRight: 16, fontSize: 13, color: '#6b7280' }}>Subtotal</Column>
          <Column style={{ width: 120, textAlign: 'right', fontSize: 13, color: '#374151' }}>${subtotal.toFixed(2)}</Column>
        </Row>
        {taxAmount > 0 && (
          <Row>
            <Column style={{ textAlign: 'right', paddingRight: 16, fontSize: 13, color: '#6b7280' }}>Tax (8.25%)</Column>
            <Column style={{ width: 120, textAlign: 'right', fontSize: 13, color: '#374151' }}>${taxAmount.toFixed(2)}</Column>
          </Row>
        )}
        <Row>
          <Column style={{ textAlign: 'right', paddingRight: 16, fontSize: 16, fontWeight: 700, color: '#111827', paddingTop: 8 }}>Total</Column>
          <Column style={{ width: 120, textAlign: 'right', fontSize: 16, fontWeight: 700, color: '#111827', paddingTop: 8 }}>${total.toFixed(2)}</Column>
        </Row>
      </Section>

      <Text style={{ color: '#6b7280', fontSize: 13, margin: '0 0 20px' }}>
        This quote is valid until{' '}
        <strong>
          {new Date(validUntil).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </strong>
        .
      </Text>

      {notes && (
        <Section style={{ backgroundColor: '#f9fafb', borderRadius: 6, padding: 16, marginBottom: 24 }}>
          <Text style={{ color: '#374151', fontSize: 13, margin: 0 }}>{notes}</Text>
        </Section>
      )}

      <Button
        href={acceptUrl}
        style={{
          backgroundColor: BRAND_COLOR,
          color: '#ffffff',
          fontWeight: 700,
          fontSize: 15,
          padding: '14px 32px',
          borderRadius: 8,
          display: 'inline-block',
          textDecoration: 'none',
        }}
      >
        Review &amp; Accept Quote
      </Button>
    </BrandLayout>
  )
}

export function quoteEmailText(props: QuoteEmailProps): string {
  const lines = [
    `Quote ${props.quoteNumber} — Triple J Metal LLC`,
    ``,
    `Hi ${props.customerName},`,
    ``,
    `Here is your quote from Triple J Metal LLC. Review and accept online:`,
    props.acceptUrl,
    ``,
    `LINE ITEMS`,
  ]
  for (const item of props.lineItems) {
    lines.push(
      `  ${item.description} — ${item.quantity} × $${item.unit_price.toFixed(2)} = $${item.total_price.toFixed(2)}`
    )
  }
  lines.push(``)
  lines.push(`Subtotal: $${props.subtotal.toFixed(2)}`)
  if (props.taxAmount > 0) lines.push(`Tax: $${props.taxAmount.toFixed(2)}`)
  lines.push(`Total: $${props.total.toFixed(2)}`)
  lines.push(``)
  lines.push(
    `Valid until: ${new Date(props.validUntil).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })}`
  )
  if (props.notes) {
    lines.push(``)
    lines.push(`Notes:`)
    lines.push(props.notes)
  }
  lines.push(``)
  lines.push(`—`)
  lines.push(`Triple J Metal LLC · 3319 Tem-Bel Ln, Temple, TX 76502 · 254-346-7764`)
  return lines.join('\n')
}
