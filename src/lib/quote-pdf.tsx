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

import { join } from 'node:path'

import {
  Document,
  Font,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer'

import { INTL_LOCALE, type Locale } from '@/i18n/config'
import { QUOTES } from '@/i18n/copy/quotes'
import { formatUsPhone } from '@/lib/pipeline'
import { SITE, SITE_ES } from '@/lib/site'

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
  /** The customer's preferred_language (migration 034). Line items print as typed. */
  locale?: Locale
}

// ── Brand constants (Forge, 2026-10-02) ────────────────────────────────
const NAVY = '#00182a'
const INK_900 = NAVY
const INK_700 = '#33475a'
const INK_500 = '#546678'
const INK_200 = '#e3e9ee'
const STEEL = '#788a9c'

// Cinzel for the wordmark and the grand total — the same WOFF files the Open
// Graph cards load (fontkit reads WOFF). Literal join(process.cwd(), …) paths
// so output file tracing ships them with /api/quotes/[id]/pdf. Body stays on
// the built-in Helvetica.
Font.register({
  family: 'Cinzel',
  fonts: [
    { src: join(process.cwd(), 'src/lib/og-fonts/cinzel-latin-700-normal.woff'), fontWeight: 700 },
    { src: join(process.cwd(), 'src/lib/og-fonts/cinzel-latin-900-normal.woff'), fontWeight: 900 },
  ],
})
// Cinzel has no hyphenation dictionary; never split a word across lines.
Font.registerHyphenationCallback((word) => [word])

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
    borderBottomWidth: 1.5,
    borderBottomColor: STEEL,
    borderBottomStyle: 'solid',
  },
  brandStack: { flexDirection: 'column' },
  brandTitle: {
    fontSize: 22,
    lineHeight: 1.2,
    fontFamily: 'Cinzel',
    fontWeight: 900,
    letterSpacing: 0.2,
    color: NAVY,
  },
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
    color: NAVY,
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
  totalsGrandValue: { fontSize: 16, lineHeight: 1.2, fontFamily: 'Cinzel', fontWeight: 700, color: NAVY },
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
function fmtDate(iso: string, locale: Locale = 'en'): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const timeZone = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? 'UTC' : 'America/Chicago'
  return d.toLocaleDateString(INTL_LOCALE[locale], { month: 'long', day: 'numeric', year: 'numeric', timeZone })
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
    locale = 'en',
  } = props
  const t = QUOTES[locale]

  return (
    <Document
      title={`Triple J Metal — ${t.pdf.quote} ${quoteNumber}`}
      author="Triple J Metal"
      subject={t.pdf.subject(quoteNumber, customerName)}
      language={locale}
    >
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandStack}>
            <Text style={styles.brandTitle}>
              Triple J Metal
            </Text>
            <Text style={styles.brandSub}>{SITE.addressOneLine}</Text>
            <Text style={styles.brandSub}>{SITE.phone} · triplejmetaltx.com</Text>
          </View>
          <View style={styles.quoteMeta}>
            <Text style={styles.quoteLabel}>{t.pdf.quote}</Text>
            <Text style={styles.quoteNumber}>{quoteNumber}</Text>
            <Text style={styles.quoteValidity}>{t.pdf.validUntil} {fmtDate(validUntil, locale)}</Text>
          </View>
        </View>

        {/* Customer */}
        <View style={styles.customerBlock}>
          <Text style={styles.customerLabel}>{t.pdf.quoteFor}</Text>
          <Text style={styles.customerName}>{customerName}</Text>
          {customerAddress ? <Text style={styles.customerLine}>{customerAddress}</Text> : null}
          {customerEmail ? <Text style={styles.customerLine}>{customerEmail}</Text> : null}
          {customerPhone ? <Text style={styles.customerLine}>{formatUsPhone(customerPhone)}</Text> : null}
        </View>

        {/* Line items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.cellDesc}>{t.table.description}</Text>
            <Text style={styles.cellQty}>{t.table.qty}</Text>
            <Text style={styles.cellUnit}>{t.table.unit}</Text>
            <Text style={styles.cellTotal}>{t.table.total}</Text>
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
            <Text style={styles.totalsLabel}>{t.table.subtotal}</Text>
            <Text style={styles.totalsValue}>{fmtUSD(subtotal)}</Text>
          </View>
          {taxAmount > 0 ? (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>{t.table.tax}</Text>
              <Text style={styles.totalsValue}>{fmtUSD(taxAmount)}</Text>
            </View>
          ) : null}
          <View style={styles.totalsGrandRow}>
            <Text style={styles.totalsGrandLabel}>{t.table.total}</Text>
            <Text style={styles.totalsGrandValue}>{fmtUSD(total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {notes ? (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>{t.pdf.notes}</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>{SITE.legalName} · {locale === 'es' ? SITE_ES.tagline : SITE.tagline}</Text>
          <Text>{t.pdf.generated} {fmtDate(generatedAt, locale)}</Text>
        </View>
      </Page>
    </Document>
  )
}
