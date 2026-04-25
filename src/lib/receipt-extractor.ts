/**
 * Receipt OCR via Claude Sonnet 4.6 vision.
 *
 * Takes an image (base64-encoded JPEG/PNG) of a paper or screenshot
 * receipt — Lowe's, Home Depot, MetalMax, Shell, etc. — and returns
 * a structured object ready to push to QuickBooks Online as a Purchase.
 *
 * Cost per call (cached system prompt after first hit): ~$0.02.
 *
 * Same shape pattern as `voice-lead-extractor.ts`: prompt-cached system
 * with the schema, single user message with the image, JSON-only output,
 * Zod validation on parse, defensive code-fence stripping.
 */

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

export const receiptLineItemSchema = z.object({
  description: z.string().trim(),
  qty:         z.number().positive().nullable(),
  unit_price:  z.number().nullable(),
  total:       z.number().nullable(),
})

export const receiptExtractionSchema = z.object({
  vendor:      z.string().trim().nullable(),
  date:        z.string().trim().nullable(),  // ISO YYYY-MM-DD when we can pin it down
  subtotal:    z.number().nonnegative().nullable(),
  tax:         z.number().nonnegative().nullable(),
  total:       z.number().nonnegative().nullable(),
  line_items:  z.array(receiptLineItemSchema).max(40),
  confidence:  z.number().min(0).max(1),
  notes:       z.string().trim().nullable(),
})

export type ReceiptExtraction = z.infer<typeof receiptExtractionSchema>

const SYSTEM_PROMPT = `You extract structured receipt data from a photo or screenshot of a vendor receipt for Triple J Metal (registered as Triple J Metal LLC), a Central Texas metal-buildings contractor. Common vendors: Lowe's, Home Depot, MetalMax, MetalMart, Sherwin Williams, Shell, Buc-ee's, McCoy's, Ferguson, Tractor Supply, gas stations.

Return ONE JSON object, no prose, no code fences, no markdown.

Schema:
{
  "vendor":      string | null,    // company name printed on the receipt header (e.g. "Lowe's")
  "date":        string | null,    // ISO YYYY-MM-DD; null if not legible or no clear transaction date
  "subtotal":    number | null,    // pre-tax total (USD, no symbol). May be absent on simple receipts.
  "tax":         number | null,    // sales tax amount (USD). May be absent.
  "total":       number | null,    // post-tax grand total (USD). The most important field.
  "line_items":  Array<{
    "description": string,         // item name as printed; trim SKUs/codes if obvious
    "qty":         number | null,  // quantity if printed, otherwise null
    "unit_price":  number | null,  // unit price if printed, otherwise null
    "total":       number | null   // line total (qty × unit_price) when present
  }>,
  "confidence":  number,            // 0..1 — your honest confidence the totals + vendor are right
  "notes":       string | null      // free-form notes (e.g. "Receipt is partially crumpled, total approximate")
}

Rules:
- Currency is USD. Strip "$" and any commas. Treat numbers like "12.99" or "1,234.56" as 12.99 / 1234.56.
- If a value is illegible, use null. Never guess.
- Vendor is the merchant name on the receipt header — not the cashier, store number, or tagline.
- Tax: if multiple tax lines exist (state + city), sum them into a single tax field.
- Line items: skip pure separators ("--- Subtotal ---"), discount lines, and rounding adjustments unless they're priced like real items. Limit to 40 lines.
- Confidence: penalise illegible totals, partial photos, glare, very-low-resolution; penalise gas-pump receipts that frequently have no itemisation; reward crisp itemized receipts where math reconciles (subtotal + tax ≈ total within $0.05).
- Date format: convert any printed format ("04/24/2026", "April 24, 2026", "24-Apr-2026") to "2026-04-24". Drop time-of-day.
- Receipts that aren't actually receipts (random photo, blank page, business card): set confidence to 0 and explain in notes.

Output JSON only.`

export async function extractReceiptFromImage(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
): Promise<ReceiptExtraction> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const client = new Anthropic({ apiKey })

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: 'Extract the receipt fields per the schema. JSON only.',
          },
        ],
      },
    ],
  })

  const text = msg.content
    .filter((c): c is Anthropic.TextBlock => c.type === 'text')
    .map((c) => c.text)
    .join('')
    .trim()

  const jsonText = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new ReceiptExtractionError(
      `Claude did not return valid JSON: ${jsonText.slice(0, 300)}`,
    )
  }

  const result = receiptExtractionSchema.safeParse(parsed)
  if (!result.success) {
    throw new ReceiptExtractionError(
      `Receipt extraction failed schema validation: ${result.error.message}`,
    )
  }

  return result.data
}

export class ReceiptExtractionError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'ReceiptExtractionError'
  }
}
