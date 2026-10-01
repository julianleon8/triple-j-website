/**
 * Quote PDF document.
 *
 * Renders a customer-ready PDF identical in structure to the email
 * accept-token view at /quotes/[token] but in offline-shareable form.
 * Used by /api/quotes/[id]/pdf — see that route for streaming setup.
 *
 * Uses @react-pdf/renderer (4.x). The library defines its own React
 * tree (Document/Page/View/Text) — DOM JSX is not valid here.
 */

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer'

import { formatUsPhone } from '@/lib/pipeline'
import { SITE } from '@/lib/site'

export type QuoteLineItem = {
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

export type QuotePdfProps = {
  quoteNumber: string
  customerName: string
  customerEmail?: string | null
  customerPhone?: string | null
  customerAddress?: string | null
  lineItems: QuoteLineItem[]
  subtotal: number
  taxAmount: number
  total: number
  validUntil: string
  notes?: string | null
  /** ISO timestamp the PDF was generated (used for the print line). */
  generatedAt: string
}

// ── Brand constants ────────────────────────────────────────────────────
const BRAND_BLUE = '#1e6bd6'
const INK_900 = '#0f172a'
const INK_700 = '#334155'
const INK_500 = '#64748b'
const INK_200 = '#e2e8f0'

// lineHeight gotcha: react-pdf resolves a unitless lineHeight against the
// font size of the style that DECLARES it, then children inherit the result
// in points. The page's 1.4 becomes a flat 14pt, so any text larger than the
// 10pt body must set its own lineHeight or it overprints the line below —
// which is exactly how the address ended up on top of the brand title.
const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: INK_900,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: INK_200,
    borderBottomStyle: 'solid',
  },
  brandStack: { flexDirection: 'column' },
  brandTitle: {
    fontSize: 24,
    lineHeight: 1.15,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -0.5,
    color: INK_900,
  },
  brandAccent: { color: BRAND_BLUE },
  brandSub: { marginTop: 2, fontSize: 9, color: INK_500 },
  quoteMeta: { flexDirection: 'column', alignItems: 'flex-end' },
  quoteLabel: {
    fontSize: 8,
    color: INK_500,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontFamily: 'Helvetica-Bold',
  },
  quoteNumber: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 1.2,
    fontFamily: 'Helvetica-Bold',
    color: BRAND_BLUE,
  },
  quoteValidity: { marginTop: 4, fontSize: 9, color: INK_500 },
  customerBlock: { marginBottom: 24 },
  customerLabel: {
    fontSize: 8,
    color: INK_500,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  customerName: { fontSize: 14, lineHeight: 1.25, fontFamily: 'Helvetica-Bold', color: INK_900 },
  customerLine: { marginTop: 2, fontSize: 10, color: INK_700 },
  table: { marginTop: 12 },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: INK_900,
    borderBottomStyle: 'solid',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: INK_200,
    borderBottomStyle: 'solid',
  },
  cellDesc: { flex: 4, paddingRight: 8 },
  cellQty: { flex: 0.7, textAlign: 'right' },
  cellUnit: { flex: 1.3, textAlign: 'right' },
  cellTotal: { flex: 1.5, textAlign: 'right', fontFamily: 'Helvetica-Bold' },
  totalsBlock: { marginTop: 18, alignSelf: 'flex-end', minWidth: 240 },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalsLabel: { fontSize: 10, color: INK_700 },
  totalsValue: { fontSize: 10, color: INK_900 },
  totalsGrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: INK_900,
    borderTopStyle: 'solid',
  },
  totalsGrandLabel: { fontSize: 12, lineHeight: 1.2, fontFamily: 'Helvetica-Bold', color: INK_900 },
  totalsGrandValue: { fontSize: 16, lineHeight: 1.2, fontFamily: 'Helvetica-Bold', color: BRAND_BLUE },
  notesBlock: {
    marginTop: 28,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 8,
    color: INK_500,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  notesText: { fontSize: 10, color: INK_700 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: INK_500,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: INK_200,
    borderTopStyle: 'solid',
  },
})

function fmtUSD(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// valid_until is a bare date ("2026-05-21"), which JS parses as UTC
// midnight. Formatting it in UTC keeps it from printing as the day before
// on any machine west of Greenwich. generatedAt is a real instant, so it is
// shown in Central time — the shop's clock, whatever the server's is.
function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const timeZone = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? 'UTC' : 'America/Chicago'
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone })
}

export function QuotePdfDocument(props: QuotePdfProps) {
  const {
    quoteNumber,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    lineItems,
    subtotal,
    taxAmount,
    total,
    validUntil,
    notes,
    generatedAt,
  } = props

  return (
    <Document
      title={`Triple J Metal — Quote ${quoteNumber}`}
      author="Triple J Metal"
      subject={`Quote ${quoteNumber} for ${customerName}`}
    >
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandStack}>
            <Text style={styles.brandTitle}>
              TRIPLE J <Text style={styles.brandAccent}>METAL</Text>
            </Text>
            <Text style={styles.brandSub}>{SITE.addressOneLine}</Text>
            <Text style={styles.brandSub}>{SITE.phone} · triplejmetaltx.com</Text>
          </View>
          <View style={styles.quoteMeta}>
            <Text style={styles.quoteLabel}>Quote</Text>
            <Text style={styles.quoteNumber}>{quoteNumber}</Text>
            <Text style={styles.quoteValidity}>Valid until {fmtDate(validUntil)}</Text>
          </View>
        </View>

        {/* Customer */}
        <View style={styles.customerBlock}>
          <Text style={styles.customerLabel}>Quote for</Text>
          <Text style={styles.customerName}>{customerName}</Text>
          {customerAddress ? <Text style={styles.customerLine}>{customerAddress}</Text> : null}
          {customerEmail ? <Text style={styles.customerLine}>{customerEmail}</Text> : null}
          {customerPhone ? <Text style={styles.customerLine}>{formatUsPhone(customerPhone)}</Text> : null}
        </View>

        {/* Line items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.cellDesc}>Description</Text>
            <Text style={styles.cellQty}>Qty</Text>
            <Text style={styles.cellUnit}>Unit</Text>
            <Text style={styles.cellTotal}>Total</Text>
          </View>
          {lineItems.map((li, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={styles.cellDesc}>{li.description}</Text>
              <Text style={styles.cellQty}>{li.quantity}</Text>
              <Text style={styles.cellUnit}>{fmtUSD(li.unit_price)}</Text>
              <Text style={styles.cellTotal}>{fmtUSD(li.total_price)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{fmtUSD(subtotal)}</Text>
          </View>
          {taxAmount > 0 ? (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax</Text>
              <Text style={styles.totalsValue}>{fmtUSD(taxAmount)}</Text>
            </View>
          ) : null}
          <View style={styles.totalsGrandRow}>
            <Text style={styles.totalsGrandLabel}>Total</Text>
            <Text style={styles.totalsGrandValue}>{fmtUSD(total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {notes ? (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>{SITE.legalName} · {SITE.tagline}</Text>
          <Text>Generated {fmtDate(generatedAt)}</Text>
        </View>
      </Page>
    </Document>
  )
}
