/**
 * Voice-memo → structured lead extractor. Takes a Whisper transcript
 * (owner speaking about a prospective job) and returns a schema-validated
 * object ready to insert into the `leads` table.
 *
 * Model: Claude Sonnet 4.6 (same as permit-extractor.ts).
 * Budget: ~$0.01 per memo at short transcripts with prompt caching.
 */

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

// Mirrors the enum set on /api/leads so the existing insert path accepts
// the result verbatim. `structure_type` drops 'unsure' in favor of null
// (Claude should leave it null when ambiguous — one less magic value).
export const voiceLeadSchema = z.object({
  name:           z.string().trim().min(1).nullable(),
  phone:          z.string().trim().min(1).nullable(),
  email:          z.string().trim().nullable(),
  zip:            z.string().trim().nullable(),
  city:           z.string().trim().nullable(),
  service_type:   z.enum(['carport', 'garage', 'barn', 'rv_cover', 'other']).nullable(),
  structure_type: z.enum(['welded', 'bolted', 'unsure']).nullable(),
  width:          z.string().trim().nullable(),
  length:         z.string().trim().nullable(),
  height:         z.string().trim().nullable(),
  timeline:       z.enum(['asap', 'this_week', 'this_month', 'planning']).nullable(),
  is_military:    z.boolean().default(false),
  notes:          z.string().trim().nullable(),
})

export type VoiceLeadExtraction = z.infer<typeof voiceLeadSchema>

const SYSTEM_PROMPT = `You extract structured metal-building lead data from a voice-memo transcript spoken by the owner of Triple J Metal (registered as Triple J Metal LLC), a Central Texas metal-buildings contractor. Return ONE JSON object, no prose, no code fences, no markdown.

Schema:
{
  "name":           string | null,
  "phone":          string | null,
  "email":          string | null,
  "zip":            string | null,
  "city":           string | null,
  "service_type":   "carport" | "garage" | "barn" | "rv_cover" | "other" | null,
  "structure_type": "welded" | "bolted" | "unsure" | null,
  "width":          string | null,
  "length":         string | null,
  "height":         string | null,
  "timeline":       "asap" | "this_week" | "this_month" | "planning" | null,
  "is_military":    boolean,
  "notes":          string | null
}

Rules:
- Fill ONLY what's explicitly said. Leave null for anything ambiguous. Never invent details.
- Timeline mapping:
    * "ASAP", "as soon as possible", "right away", "this week if possible" → "asap"
    * "next week", "sometime this week", "a few days" → "this_week"
    * "this month", "end of the month" → "this_month"
    * vague ("thinking about it", "down the road") → "planning"
- Service type: carport = open metal cover; garage = enclosed metal garage/shop; barn = agricultural/horse barn; rv_cover = tall cover for RV/boat; other = anything else (lean-to, patio, barndominium, house addition).
- Structure: "welded"/"permanent"/"stick-built" → "welded"; "bolted"/"bolt-together"/"kit" → "bolted"; ambiguous → "unsure".
- Dimensions: "30 by 50" → width="30", length="50". Height only if explicitly stated.
- Phone: output digits separated by dashes in the format 254-555-1234 when possible. Keep any formatting the speaker used (e.g. "two-five-four...") converted to digits.
- ZIP: only include valid 5-digit Central TX ZIPs.
- is_military: true only if words like "veteran", "military", "active duty", "Fort Cavazos", "PCS" are spoken.
- notes: Free-form capture of anything meaningful that doesn't map to other fields (access road, gate code, preferred callback time, referral source, etc.).
- Caller context: these memos are Julian's recap of a live or phone conversation. First-person pronouns refer to the speaker (Julian), not the lead. Extract the lead's info.

Output JSON only.`

export async function extractLeadFromTranscript(
  transcript: string,
): Promise<VoiceLeadExtraction> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  const client = new Anthropic({ apiKey })

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        // Prompt-cache the instructions; the schema is identical across
        // every voice memo and caching saves ~70% of input-token cost
        // after the first call.
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Transcript:\n${transcript.trim()}\n\nReturn JSON matching the schema.`,
      },
    ],
  })

  const text = msg.content
    .filter((c): c is Anthropic.TextBlock => c.type === 'text')
    .map((c) => c.text)
    .join('')
    .trim()

  // Defensive: if Claude wrapped it in code fences despite instructions, strip them.
  const jsonText = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new VoiceExtractionError(
      `Claude did not return valid JSON: ${jsonText.slice(0, 300)}`,
    )
  }

  const result = voiceLeadSchema.safeParse(parsed)
  if (!result.success) {
    throw new VoiceExtractionError(
      `Extraction failed schema validation: ${result.error.message}`,
    )
  }
  return result.data
}

export class VoiceExtractionError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'VoiceExtractionError'
  }
}
