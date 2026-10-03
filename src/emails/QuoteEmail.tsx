import {
  Section,
  Row,
  Column,
  Heading,
  Text,
  Button,
} from '@react-email/components'
import BrandLayout, { BRAND_COLOR } from './BrandLayout'
import { napSignature } from './nap'
import type { Locale } from '@/i18n/config'
import { QUOTES, quoteDate } from '@/i18n/copy/quotes'
import { SITE } from '@/lib/site'

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
  /** The customer's preferred_language (migration 034). */
  locale?: Locale
}

export function quoteEmailSubject(quoteNumber: string, locale: Locale = 'en'): string {
  return QUOTES[locale].email.subject(quoteNumber)
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
  locale = 'en',
}: QuoteEmailProps) {
  const t = QUOTES[locale]
  return (
    <BrandLayout locale={locale} preview={t.email.preview(quoteNumber, customerName)}>
      <Heading as="h2" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#00182a' }}>
        {t.email.heading(quoteNumber)}
      </Heading>
      <Text style={{ color: '#33475a', margin: '0 0 20px' }}>
        {t.email.intro(customerName, SITE.legalName)}
      </Text>

      <Section style={{ border: '1px solid #e3e9ee', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
        <Row style={{ backgroundColor: '#f4f6f8', borderBottom: '1px solid #e3e9ee' }}>
          <Column style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#546678', textTransform: 'uppercase', width: '55%' }}>{t.table.description}</Column>
          <Column style={{ padding: '10px 8px', fontSize: 11, fontWeight: 700, color: '#546678', textTransform: 'uppercase', textAlign: 'center', width: '15%' }}>{t.table.qty}</Column>
          <Column style={{ padding: '10px 8px', fontSize: 11, fontWeight: 700, color: '#546678', textTransform: 'uppercase', textAlign: 'right', width: '15%' }}>{t.table.unit}</Column>
          <Column style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#546678', textTransform: 'uppercase', textAlign: 'right', width: '15%' }}>{t.table.total}</Column>
        </Row>
        {lineItems.map((item, i) => (
          <Row key={i} style={{ borderBottom: '1px solid #eef2f5' }}>
            <Column style={{ padding: '10px 16px', fontSize: 14, color: '#00182a' }}>{item.description}</Column>
            <Column style={{ padding: '10px 8px', fontSize: 14, color: '#33475a', textAlign: 'center' }}>{item.quantity}</Column>
            <Column style={{ padding: '10px 8px', fontSize: 14, color: '#33475a', textAlign: 'right' }}>${item.unit_price.toFixed(2)}</Column>
            <Column style={{ padding: '10px 16px', fontSize: 14, color: '#00182a', textAlign: 'right' }}>${item.total_price.toFixed(2)}</Column>
          </Row>
        ))}
      </Section>

      <Section style={{ marginBottom: 24 }}>
        <Row>
          <Column style={{ textAlign: 'right', paddingRight: 16, fontSize: 13, color: '#546678' }}>{t.table.subtotal}</Column>
          <Column style={{ width: 120, textAlign: 'right', fontSize: 13, color: '#33475a' }}>${subtotal.toFixed(2)}</Column>
        </Row>
        {taxAmount > 0 && (
          <Row>
            <Column style={{ textAlign: 'right', paddingRight: 16, fontSize: 13, color: '#546678' }}>{t.table.taxRate}</Column>
            <Column style={{ width: 120, textAlign: 'right', fontSize: 13, color: '#33475a' }}>${taxAmount.toFixed(2)}</Column>
          </Row>
        )}
        <Row>
          <Column style={{ textAlign: 'right', paddingRight: 16, fontSize: 16, fontWeight: 700, color: '#00182a', paddingTop: 8 }}>{t.table.total}</Column>
          <Column style={{ width: 120, textAlign: 'right', fontSize: 16, fontWeight: 700, color: '#00182a', paddingTop: 8 }}>${total.toFixed(2)}</Column>
        </Row>
      </Section>

      <Text style={{ color: '#546678', fontSize: 13, margin: '0 0 20px' }}>
        {t.email.validUntil}{' '}
        <strong>{quoteDate(validUntil, locale)}</strong>
        .
      </Text>

      {notes && (
        <Section style={{ backgroundColor: '#f4f6f8', borderRadius: 6, padding: 16, marginBottom: 24 }}>
          <Text style={{ color: '#33475a', fontSize: 13, margin: 0 }}>{notes}</Text>
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
        {t.email.button}
      </Button>
    </BrandLayout>
  )
}

export function quoteEmailText(props: QuoteEmailProps): string {
  const locale = props.locale ?? 'en'
  const t = QUOTES[locale]
  const lines = [
    t.email.textTitle(props.quoteNumber, SITE.legalName),
    ``,
    t.email.textHi(props.customerName),
    ``,
    t.email.textIntro(SITE.legalName),
    props.acceptUrl,
    ``,
    t.email.textItems,
  ]
  for (const item of props.lineItems) {
    lines.push(
      `  ${item.description} — ${item.quantity} × $${item.unit_price.toFixed(2)} = $${item.total_price.toFixed(2)}`
    )
  }
  lines.push(``)
  lines.push(`${t.table.subtotal}: $${props.subtotal.toFixed(2)}`)
  if (props.taxAmount > 0) lines.push(`${t.table.tax}: $${props.taxAmount.toFixed(2)}`)
  lines.push(`${t.table.total}: $${props.total.toFixed(2)}`)
  lines.push(``)
  lines.push(`${t.email.textValid} ${quoteDate(props.validUntil, locale)}`)
  if (props.notes) {
    lines.push(``)
    lines.push(t.email.textNotes)
    lines.push(props.notes)
  }
  lines.push(``)
  lines.push(`—`)
  lines.push(napSignature({ legal: true }))
  return lines.join('\n')
}
