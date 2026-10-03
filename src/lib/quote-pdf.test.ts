import { writeFile } from 'node:fs/promises'

import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { expect, it } from 'vitest'

import { QuotePdfDocument, type QuotePdfProps } from './quote-pdf'

const SAMPLE: QuotePdfProps = {
  quoteNumber: 'Q-2026-0142',
  customerName: 'Ana Ruiz',
  customerEmail: 'ana@example.com',
  customerPhone: '2545550100',
  customerAddress: '1200 Example Rd, Temple, TX 76502',
  lineItems: [
    { description: '20×20 welded carport, 14-gauge frame', quantity: 1, unit_price: 3300, total_price: 3300 },
    { description: 'Sample line item', quantity: 2, unit_price: 100, total_price: 200 },
  ],
  subtotal: 3500,
  taxAmount: 0,
  total: 3500,
  validUntil: '2026-11-01',
  notes: 'Sample render for the quote PDF test.',
  generatedAt: '2026-10-02T15:00:00.000Z',
}

// Renders with the registered Cinzel files — a bad font path fails here, not
// in front of a customer. QUOTE_PDF_OUT=<file> keeps the render for a look.
it('renders the quote PDF with the Forge fonts', async () => {
  const pdf = await renderToBuffer(createElement(QuotePdfDocument, SAMPLE) as Parameters<typeof renderToBuffer>[0])
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
  expect(pdf.toString('latin1')).toMatch(/Cinzel/)
  if (process.env.QUOTE_PDF_OUT) await writeFile(process.env.QUOTE_PDF_OUT, pdf)
}, 30_000)
