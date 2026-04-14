import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Button,
  Hr,
} from '@react-email/components'

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
    <Html>
      <Head />
      <Preview>Your quote {quoteNumber} from Triple J Metal LLC — {customerName}</Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', margin: 0, padding: '24px 0' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>

          {/* Header */}
          <Section style={{ backgroundColor: '#EAB308', padding: '24px 32px' }}>
            <Heading style={{ color: '#000000', margin: 0, fontSize: '22px', fontWeight: 'bold' }}>
              Triple J Metal LLC
            </Heading>
            <Text style={{ color: '#000000', margin: '4px 0 0', fontSize: '13px' }}>
              Temple, TX · 254-346-7764
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ padding: '32px' }}>
            <Heading as="h2" style={{ fontSize: '18px', margin: '0 0 8px' }}>
              Quote {quoteNumber}
            </Heading>
            <Text style={{ color: '#374151', margin: '0 0 24px' }}>
              Hi {customerName}, here is your quote from Triple J Metal LLC. Review the details below and click the button to accept or decline.
            </Text>

            {/* Line Items Table */}
            <Section style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
              {/* Header row */}
              <Row style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <Column style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', width: '55%' }}>Description</Column>
                <Column style={{ padding: '10px 8px', fontSize: '11px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', textAlign: 'center', width: '15%' }}>Qty</Column>
                <Column style={{ padding: '10px 8px', fontSize: '11px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', textAlign: 'right', width: '15%' }}>Unit</Column>
                <Column style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', textAlign: 'right', width: '15%' }}>Total</Column>
              </Row>
              {/* Line items */}
              {lineItems.map((item, i) => (
                <Row key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <Column style={{ padding: '10px 16px', fontSize: '14px', color: '#111827' }}>{item.description}</Column>
                  <Column style={{ padding: '10px 8px', fontSize: '14px', color: '#374151', textAlign: 'center' }}>{item.quantity}</Column>
                  <Column style={{ padding: '10px 8px', fontSize: '14px', color: '#374151', textAlign: 'right' }}>${item.unit_price.toFixed(2)}</Column>
                  <Column style={{ padding: '10px 16px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>${item.total_price.toFixed(2)}</Column>
                </Row>
              ))}
            </Section>

            {/* Totals */}
            <Section style={{ marginBottom: '24px' }}>
              <Row>
                <Column style={{ textAlign: 'right', paddingRight: '16px', fontSize: '13px', color: '#6b7280' }}>Subtotal</Column>
                <Column style={{ width: '120px', textAlign: 'right', fontSize: '13px', color: '#374151' }}>${subtotal.toFixed(2)}</Column>
              </Row>
              {taxAmount > 0 && (
                <Row>
                  <Column style={{ textAlign: 'right', paddingRight: '16px', fontSize: '13px', color: '#6b7280' }}>Tax (8.25%)</Column>
                  <Column style={{ width: '120px', textAlign: 'right', fontSize: '13px', color: '#374151' }}>${taxAmount.toFixed(2)}</Column>
                </Row>
              )}
              <Row>
                <Column style={{ textAlign: 'right', paddingRight: '16px', fontSize: '16px', fontWeight: 'bold', color: '#111827', paddingTop: '8px' }}>Total</Column>
                <Column style={{ width: '120px', textAlign: 'right', fontSize: '16px', fontWeight: 'bold', color: '#111827', paddingTop: '8px' }}>${total.toFixed(2)}</Column>
              </Row>
            </Section>

            <Text style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 24px' }}>
              This quote is valid until <strong>{new Date(validUntil).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.
            </Text>

            {notes && (
              <Section style={{ backgroundColor: '#f9fafb', borderRadius: '6px', padding: '16px', marginBottom: '24px' }}>
                <Text style={{ color: '#374151', fontSize: '13px', margin: 0 }}>{notes}</Text>
              </Section>
            )}

            {/* CTA */}
            <Button
              href={acceptUrl}
              style={{
                backgroundColor: '#EAB308',
                color: '#000000',
                fontWeight: 'bold',
                fontSize: '15px',
                padding: '14px 32px',
                borderRadius: '8px',
                display: 'inline-block',
                textDecoration: 'none',
              }}
            >
              Review &amp; Accept Quote
            </Button>
          </Section>

          <Hr style={{ borderColor: '#e5e7eb', margin: 0 }} />

          {/* Footer */}
          <Section style={{ padding: '20px 32px', backgroundColor: '#f9fafb' }}>
            <Text style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
              Triple J Metal LLC · 3319 Tem-Bel Ln, Temple, TX 76502 · 254-346-7764
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0' }}>
              Questions? Call or text us directly. We build carports, garages, and metal buildings across Central Texas.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
