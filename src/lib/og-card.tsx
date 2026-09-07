import { ImageResponse } from 'next/og'

import { SITE } from '@/lib/site'

/**
 * Shared 1200×630 Open Graph card.
 *
 * Google's 2026-03-02 image guidance asks for a "relevant and representative"
 * preferred image per page and specifically warns off generic logos. Before
 * this existed every route but /military inherited one static /og-default.jpg,
 * so ~40 pages shared a single card. Each route family now renders its own via
 * a thin `opengraph-image.tsx` that calls this.
 *
 * Visual language is lifted from the hand-built /military card so the two stay
 * consistent — dark gradient, brand-blue accent on the punch word, rule above
 * a footer carrying the path and the phone number.
 *
 * Keep this file free of request-time APIs: Next statically optimizes
 * `opengraph-image` routes (generated at build, then cached) unless something
 * forces them dynamic, and these cards have no reason to be dynamic.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = 'image/png'

export type OgCardInput = {
  /** Small uppercase pill above the headline, e.g. "Metal Garages". */
  eyebrow: string
  /** Main line. Rendered at the largest size, uppercase. */
  headline: string
  /** Optional second line, rendered in brand blue under the headline. */
  accent?: string
  /** One or two sentences under the headline. */
  subhead?: string
  /** Path shown in the footer, e.g. "/locations/temple". */
  path: string
}

export function renderOgCard({
  eyebrow,
  headline,
  accent,
  subhead,
  path,
}: OgCardInput) {
  // Long city/service names would otherwise overflow the fixed 1200px canvas —
  // satori does not reflow or auto-shrink text the way a browser would. Size
  // off the longer of the two lines: blog accents ("Temple, Belton & Killeen
  // Requirements") routinely run longer than the headline they sit under.
  const longest = Math.max(headline.length, accent?.length ?? 0)
  const headlineSize = longest > 34 ? 56 : longest > 26 ? 68 : longest > 18 ? 80 : 92

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          backgroundImage:
            'linear-gradient(135deg, #000000 0%, #0f172a 50%, #1e3a8a 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top row: wordmark + section pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              gap: 10,
            }}
          >
            <span>Triple J</span>
            <span style={{ color: '#4d8dff' }}>Metal</span>
          </div>
          <div
            style={{
              display: 'flex',
              padding: '10px 20px',
              borderRadius: 999,
              background: 'rgba(77, 141, 255, 0.18)',
              border: '2px solid rgba(77, 141, 255, 0.5)',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#9dc2ff',
            }}
          >
            {eyebrow}
          </div>
        </div>

        {/* Headline block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: headlineSize,
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              maxWidth: 1000,
            }}
          >
            <span>{headline}</span>
            {accent ? <span style={{ color: '#4d8dff' }}>{accent}</span> : null}
          </div>
          {subhead ? (
            <div
              style={{
                fontSize: 26,
                color: 'rgba(255,255,255,0.75)',
                maxWidth: 950,
              }}
            >
              {subhead}
            </div>
          ) : null}
        </div>

        {/* Footer row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.55)',
            fontSize: 20,
            borderTop: '1px solid rgba(255,255,255,0.15)',
            paddingTop: 20,
          }}
        >
          {/* One interpolated child, not text + expression — satori rejects a
              div with more than one child unless it declares display. */}
          <div>{`triplejmetaltx.com${path}`}</div>
          <div style={{ fontWeight: 700, color: 'white' }}>{SITE.phone}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  )
}
