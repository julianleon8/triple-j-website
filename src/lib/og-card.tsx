import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'
import sharp from 'sharp'

import { SITE } from '@/lib/site'

/**
 * Shared 1200×630 Open Graph cards.
 *
 * Google's 2026-03-02 image guidance asks for a "relevant and representative"
 * preferred image per page and specifically warns off generic logos. Before
 * this existed every route but /military inherited one static /og-default.jpg,
 * so ~40 pages shared a single card. Each route family now renders its own via
 * a thin `opengraph-image.tsx` that calls this.
 *
 * Two cards share one set of brand assets:
 *
 * - `renderOgCard` — the typographic card for services, locations, blog posts
 *   and /quote. Visual language is lifted from the hand-built /military card
 *   so the two stay consistent — dark gradient, brand-blue accent on the punch
 *   word, rule above a footer carrying the path and the phone number.
 * - `renderBrandCard` — the homepage card, and `/og-default.jpg`, the fallback
 *   every page without a card of its own inherits. The header's lion lockup
 *   beside the homepage hero photo, so a shared link previews the page it opens.
 *
 * `next/og` bundles only Geist Regular, so until 2026-09-28 every `fontWeight`
 * here silently rendered at 400. The cards now load the site's own faces from
 * src/lib/og-fonts — see the README there.
 *
 * Keep this file free of request-time APIs: Next statically optimizes
 * `opengraph-image` routes (generated at build, then cached) unless something
 * forces them dynamic, and these cards have no reason to be dynamic.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = 'image/png'

/**
 * The brand card carries a photo: ~1 MB as a PNG, ~120 KB as a JPEG. WhatsApp
 * drops link-preview images much over 300 KB, so this one ships as JPEG.
 */
export const BRAND_CARD_CONTENT_TYPE = 'image/jpeg'
export const BRAND_CARD_ALT = `${SITE.name} — welded or bolted metal buildings in ${SITE.address.city}, ${SITE.address.state} and Central Texas`

// satori cannot read CSS variables, so the two tokens used are copied here.
/** --color-brand-400: the "Metal" in the site header's wordmark. */
const WORDMARK_BLUE = '#5c85f2'
/** --color-ink-950 */
const INK = '#050505'

type OgAssets = {
  fonts: {
    name: string
    data: Buffer
    weight: 500 | 600 | 700 | 800
    style: 'normal'
  }[]
  /** The header's lion mark, as a data URI. */
  logo: string
}

// Literal `join(process.cwd(), '…')` paths on purpose: output file tracing
// follows them, so the files ship with any card rendered on demand rather
// than at build — an unknown slug, say.
async function loadOgAssets(): Promise<OgAssets> {
  const [barlow700, barlow800, inter500, inter600, inter700, logo] =
    await Promise.all([
      readFile(join(process.cwd(), 'src/lib/og-fonts/barlow-condensed-latin-700-normal.woff')),
      readFile(join(process.cwd(), 'src/lib/og-fonts/barlow-condensed-latin-800-normal.woff')),
      readFile(join(process.cwd(), 'src/lib/og-fonts/inter-latin-500-normal.woff')),
      readFile(join(process.cwd(), 'src/lib/og-fonts/inter-latin-600-normal.woff')),
      readFile(join(process.cwd(), 'src/lib/og-fonts/inter-latin-700-normal.woff')),
      readFile(join(process.cwd(), 'public/images/logo-lion.png')),
    ])
  return {
    fonts: [
      { name: 'Barlow Condensed', data: barlow700, weight: 700, style: 'normal' },
      { name: 'Barlow Condensed', data: barlow800, weight: 800, style: 'normal' },
      { name: 'Inter', data: inter500, weight: 500, style: 'normal' },
      { name: 'Inter', data: inter600, weight: 600, style: 'normal' },
      { name: 'Inter', data: inter700, weight: 700, style: 'normal' },
    ],
    logo: `data:image/png;base64,${logo.toString('base64')}`,
  }
}

let ogAssets: Promise<OgAssets> | undefined

/** Read once per process. A failed read is not cached, so the next card retries. */
export function getOgAssets(): Promise<OgAssets> {
  ogAssets ??= loadOgAssets().catch((err: unknown) => {
    ogAssets = undefined
    throw err
  })
  return ogAssets
}

/**
 * The site header's lockup — lion mark, then TRIPLE J METAL with "Metal" in
 * brand blue. `stacked` sets the two words on two lines, as the brand card does.
 */
export function Wordmark({
  logo,
  size,
  stacked = false,
}: {
  logo: string
  /** Font size of the words, in px; the mark scales from it. */
  size: number
  stacked?: boolean
}) {
  const mark = Math.round(size * (stacked ? 1.5 : 1.3))
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- satori renders this, not a browser */}
      <img src={logo} width={mark} height={mark} alt="" />
      <div
        style={{
          display: 'flex',
          flexDirection: stacked ? 'column' : 'row',
          marginLeft: Math.round(size * 0.3),
          fontFamily: 'Barlow Condensed',
          fontWeight: 800,
          fontSize: size,
          lineHeight: stacked ? 0.88 : 1,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
        }}
      >
        <span>Triple J</span>
        <span
          style={{
            color: WORDMARK_BLUE,
            marginLeft: stacked ? 0 : Math.round(size * 0.22),
          }}
        >
          Metal
        </span>
      </div>
    </div>
  )
}

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

export async function renderOgCard({
  eyebrow,
  headline,
  accent,
  subhead,
  path,
}: OgCardInput) {
  const { fonts, logo } = await getOgAssets()

  // Long city/service names would otherwise overflow the fixed 1200px canvas —
  // satori does not reflow or auto-shrink text the way a browser would. Size
  // off the longer of the two lines: blog accents ("Temple, Belton & Killeen
  // Requirements") routinely run longer than the headline they sit under.
  // Barlow Condensed sets far narrower than the Geist these steps were first
  // tuned against, so each step sits a notch larger.
  const longest = Math.max(headline.length, accent?.length ?? 0)
  const headlineSize = longest > 34 ? 64 : longest > 26 ? 80 : longest > 18 ? 92 : 104

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 80px 60px',
          backgroundImage:
            'linear-gradient(135deg, #000000 0%, #0f172a 50%, #1e3a8a 100%)',
          color: 'white',
          fontFamily: 'Inter',
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
          <Wordmark logo={logo} size={40} />
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
              fontFamily: 'Barlow Condensed',
              fontSize: headlineSize,
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: '-0.01em',
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
                fontWeight: 500,
                lineHeight: 1.35,
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
            fontWeight: 500,
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
    { ...OG_SIZE, fonts },
  )
}

/**
 * The homepage card, and the body of `/og-default.jpg`. Returns a JPEG — see
 * BRAND_CARD_CONTENT_TYPE — so it is a plain Response, not an ImageResponse.
 */
export async function renderBrandCard(): Promise<Response> {
  const [{ fonts, logo }, photo] = await Promise.all([
    getOgAssets(),
    // The homepage hero, so the preview matches the page the link opens.
    readFile(join(process.cwd(), 'public/images/red-iron-frame-hero.jpg')),
  ])

  const png = await new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: INK,
          color: 'white',
          fontFamily: 'Inter',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- satori renders this, not a browser */}
        <img
          src={`data:image/jpeg;base64,${photo.toString('base64')}`}
          width={760}
          height={630}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 440,
            width: 760,
            height: 630,
            objectFit: 'cover',
          }}
        />
        {/* Solid ink under the text, feathering into the photo. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: 'flex',
            backgroundImage: `linear-gradient(90deg, ${INK} 0%, ${INK} 50%, rgba(5,5,5,0.6) 58%, rgba(5,5,5,0.15) 66%, rgba(5,5,5,0) 72%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 640,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: 64,
          }}
        >
          <Wordmark logo={logo} size={92} stacked />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 40,
              fontSize: 40,
              fontWeight: 600,
              lineHeight: 1.15,
            }}
          >
            <span>Welded or bolted</span>
            <span>metal buildings</span>
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 14,
              fontSize: 28,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            {`${SITE.address.city}, ${SITE.address.state} · Central Texas`}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 30,
              fontFamily: 'Barlow Condensed',
              fontSize: 66,
              fontWeight: 700,
              lineHeight: 0.88,
              letterSpacing: '0.01em',
            }}
          >
            {SITE.phone}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  ).arrayBuffer()

  // 4:4:4 keeps the blue "Metal" crisp; the default 4:2:0 smears coloured type.
  const jpeg = await sharp(Buffer.from(png))
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer()

  return new Response(new Uint8Array(jpeg), {
    headers: { 'Content-Type': BRAND_CARD_CONTENT_TYPE },
  })
}
