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
 *   and /quote, in Forge (2026-10-02): navy ground with a strip of PBR panel,
 *   Cinzel headline in sentence case with the steel-gradient second line, a
 *   rule above a footer carrying the path and the phone number. /military
 *   renders its own card from the same pieces, with olive and tan.
 * - `renderBrandCard` — the homepage card, and `/og-default.jpg`, the fallback
 *   every page without a card of its own inherits. The header's lion lockup
 *   on navy beside a jobsite photo.
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
/** The /es homepage card (2026-10-03). */
export const BRAND_CARD_ALT_ES = `${SITE.name} — edificios metálicos soldados o atornillados en ${SITE.address.city}, ${SITE.address.state} y el centro de Texas`

const BRAND_CARD_WORDS = {
  en: { lines: ['Welded or bolted', 'metal buildings'], region: 'Central Texas' },
  es: { lines: ['Edificios metálicos', 'soldados o atornillados'], region: 'Centro de Texas' },
} as const

// satori cannot read CSS variables, so the Forge tokens used are copied here
// from src/app/globals.css.
export const OG_NAVY = '#00182a'
const NAVY_RAISED = '#0c2538'
export const OG_STEEL_LIGHT = '#9fb0c0'
export const OG_SILVER = '#c9d3dc'
/** The steel gradient on every Forge headline's second line (.forge-steel-text). */
export const OG_STEEL_TEXT =
  'linear-gradient(180deg, #e9eef2 0%, #9fb0c0 45%, #788a9c 55%, #c9d3dc 100%)'

/** Card ground: navy into navy-raised. */
export const OG_NAVY_GROUND = `linear-gradient(135deg, ${OG_NAVY} 0%, ${NAVY_RAISED} 60%, #15344e 100%)`

/** `#rrggbb` → `rgba(r,g,b,a)`; satori's colour parser is safer with rgba than 8-digit hex. */
function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}

/**
 * A strip of PBR wall panel (the site footer's texture) down the right of a
 * card, faded into the ground so text never sits on it. One rib every 120px:
 * shaded face and cast shadow, two stiffeners in the pan, lit face, crown fold.
 */
export function PbrStrip({ width = 560, fade = OG_NAVY }: { width?: number; fade?: string }) {
  return (
    <div style={{ position: 'absolute', top: 0, right: 0, width, height: 630, display: 'flex' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height: 630,
          display: 'flex',
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(0,7,14,.4) 0px, rgba(0,7,14,0) 18px, rgba(0,7,14,0) 28px, rgba(201,211,220,.08) 28px, rgba(0,7,14,.3) 30px, rgba(0,7,14,0) 31px, rgba(0,7,14,0) 56px, rgba(201,211,220,.08) 56px, rgba(0,7,14,.3) 58px, rgba(0,7,14,0) 59px, rgba(0,7,14,0) 84px, rgba(201,211,220,.08) 85px, rgba(201,211,220,.16) 96px, rgba(201,211,220,.34) 96px, rgba(201,211,220,.34) 97px, rgba(201,211,220,.1) 97px, rgba(201,211,220,.1) 106px, rgba(0,6,13,.55) 106px, rgba(0,6,13,.45) 120px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height: 630,
          display: 'flex',
          backgroundImage: `linear-gradient(90deg, ${rgba(fade, 1)} 0%, ${rgba(fade, 0.82)} 30%, ${rgba(fade, 0.35)} 75%, ${rgba(fade, 0.2)} 100%)`,
        }}
      />
    </div>
  )
}

type OgAssets = {
  fonts: {
    name: string
    data: Buffer
    weight: 500 | 600 | 700 | 900
    style: 'normal'
  }[]
  /** The header's lion mark, as a data URI. */
  logo: string
}

// Literal `join(process.cwd(), '…')` paths on purpose: output file tracing
// follows them, so the files ship with any card rendered on demand rather
// than at build — an unknown slug, say.
async function loadOgAssets(): Promise<OgAssets> {
  const [cinzel700, cinzel900, inter500, inter600, inter700, logo] =
    await Promise.all([
      readFile(join(process.cwd(), 'src/lib/og-fonts/cinzel-latin-700-normal.woff')),
      readFile(join(process.cwd(), 'src/lib/og-fonts/cinzel-latin-900-normal.woff')),
      readFile(join(process.cwd(), 'src/lib/og-fonts/inter-latin-500-normal.woff')),
      readFile(join(process.cwd(), 'src/lib/og-fonts/inter-latin-600-normal.woff')),
      readFile(join(process.cwd(), 'src/lib/og-fonts/inter-latin-700-normal.woff')),
      readFile(join(process.cwd(), 'public/images/logo-lion.png')),
    ])
  return {
    fonts: [
      { name: 'Cinzel', data: cinzel700, weight: 700, style: 'normal' },
      { name: 'Cinzel', data: cinzel900, weight: 900, style: 'normal' },
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
 * The site header's lockup — lion mark, then "Triple J Metal" in Cinzel Black,
 * sentence case, all white. `stacked` sets it on two lines, as the brand card
 * does.
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
  const mark = Math.round(size * (stacked ? 1.7 : 1.4))
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- satori renders this, not a browser */}
      <img src={logo} width={mark} height={mark} alt="" />
      <div
        style={{
          display: 'flex',
          flexDirection: stacked ? 'column' : 'row',
          marginLeft: Math.round(size * 0.35),
          fontFamily: 'Cinzel',
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: '0.01em',
        }}
      >
        <span>Triple J</span>
        <span style={{ marginLeft: stacked ? 0 : Math.round(size * 0.28) }}>Metal</span>
      </div>
    </div>
  )
}

/** Uppercase micro-label pill, top right of a card. */
export function OgPill({
  children,
  color = OG_SILVER,
  border = 'rgba(201, 211, 220, 0.35)',
  background = 'rgba(255, 255, 255, 0.06)',
}: {
  children: string
  color?: string
  border?: string
  background?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        padding: '10px 20px',
        borderRadius: 999,
        background,
        border: `2px solid ${border}`,
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color,
      }}
    >
      {children}
    </div>
  )
}

/** Path on the left, phone on the right, over a hairline rule. */
export function OgFooter({ path }: { path: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: OG_STEEL_LIGHT,
        fontSize: 20,
        fontWeight: 500,
        borderTop: '1px solid rgba(201,211,220,0.2)',
        paddingTop: 20,
      }}
    >
      {/* One interpolated child, not text + expression — satori rejects a
          div with more than one child unless it declares display. */}
      <div>{`triplejmetaltx.com${path}`}</div>
      <div style={{ fontWeight: 700, color: 'white' }}>{SITE.phone}</div>
    </div>
  )
}

/**
 * Cinzel's capitals set wide and satori does not reflow or auto-shrink text,
 * so size off the longer line: blog accents ("Temple, Belton & Killeen
 * Requirements") routinely run longer than the headline they sit under.
 */
export function ogHeadlineSize(...lines: (string | undefined)[]): number {
  const longest = Math.max(...lines.map((l) => l?.length ?? 0))
  return longest > 34 ? 50 : longest > 26 ? 60 : longest > 18 ? 70 : 82
}

export type OgCardInput = {
  /** Small micro-label pill above the headline, e.g. "Metal Garages". */
  eyebrow: string
  /** Main line. Rendered at the largest size, Cinzel, sentence case. */
  headline: string
  /** Optional second line, in the steel gradient under the headline. */
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
  const headlineSize = ogHeadlineSize(headline, accent)

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
          backgroundImage: OG_NAVY_GROUND,
          color: 'white',
          fontFamily: 'Inter',
          position: 'relative',
        }}
      >
        <PbrStrip />

        {/* Top row: wordmark + section pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Wordmark logo={logo} size={34} />
          <OgPill>{eyebrow}</OgPill>
        </div>

        {/* Headline block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Cinzel',
              fontSize: headlineSize,
              fontWeight: 900,
              lineHeight: 1.06,
              letterSpacing: '0.01em',
              maxWidth: 1040,
            }}
          >
            {/* Balanced so a wrap never strands one word. Set on each span:
                satori does not inherit textWrap from a parent. */}
            <span style={{ textWrap: 'balance' }}>{headline}</span>
            {accent ? (
              <span
                style={{
                  textWrap: 'balance',
                  backgroundImage: OG_STEEL_TEXT,
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {accent}
              </span>
            ) : null}
          </div>
          {subhead ? (
            <div
              style={{
                fontSize: 26,
                fontWeight: 500,
                lineHeight: 1.4,
                color: 'rgba(255,255,255,0.78)',
                maxWidth: 900,
              }}
            >
              {subhead}
            </div>
          ) : null}
        </div>

        <OgFooter path={path} />
      </div>
    ),
    { ...OG_SIZE, fonts },
  )
}

/**
 * The homepage card, and the body of `/og-default.jpg`. Returns a JPEG — see
 * BRAND_CARD_CONTENT_TYPE — so it is a plain Response, not an ImageResponse.
 */
export async function renderBrandCard(locale: 'en' | 'es' = 'en'): Promise<Response> {
  const words = BRAND_CARD_WORDS[locale]
  const [{ fonts, logo }, photo] = await Promise.all([
    getOgAssets(),
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
          background: OG_NAVY,
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
        {/* Solid navy under the text, feathering into the photo. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: 'flex',
            backgroundImage: `linear-gradient(90deg, ${OG_NAVY} 0%, ${OG_NAVY} 50%, rgba(0,24,42,0.62) 58%, rgba(0,24,42,0.18) 66%, rgba(0,24,42,0) 72%)`,
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
          <Wordmark logo={logo} size={78} stacked />
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
            <span>{words.lines[0]}</span>
            <span>{words.lines[1]}</span>
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 14,
              fontSize: 28,
              fontWeight: 500,
              color: OG_STEEL_LIGHT,
            }}
          >
            {`${SITE.address.city}, ${SITE.address.state} · ${words.region}`}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 30,
              fontFamily: 'Cinzel',
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '0.02em',
            }}
          >
            {SITE.phone}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  ).arrayBuffer()

  // 4:4:4 keeps the fine Cinzel serifs crisp; the default 4:2:0 smears them.
  const jpeg = await sharp(Buffer.from(png))
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer()

  return new Response(new Uint8Array(jpeg), {
    headers: { 'Content-Type': BRAND_CARD_CONTENT_TYPE },
  })
}
