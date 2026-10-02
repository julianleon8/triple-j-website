import { ImageResponse } from 'next/og'
import {
  getOgAssets,
  OG_NAVY,
  OG_STEEL_TEXT,
  OgFooter,
  OgPill,
  PbrStrip,
  Wordmark,
} from '@/lib/og-card'

/**
 * Per-page Open Graph + Twitter card image for /military.
 *
 * Next.js's file-based OG image API: any `opengraph-image.tsx` (or
 * `twitter-image.tsx`) inside a route segment becomes that page's
 * og:image / twitter:image. Generated as a 1200×630 PNG at request time
 * + cached. Fonts, the lion wordmark and the card pieces come from
 * src/lib/og-card.tsx; this card swaps in the page's olive and tan
 * (the military hero scrim) and repeats its h1.
 *
 * Falls back to /og-default.jpg sitewide if this route fails to render.
 */

// Default Node serverless runtime. Edge would be cheaper per-request
// but the ImageResponse bundle (@vercel/og + satori + resvg WASM)
// exceeds Vercel's 1 MB Edge Function size limit. Node serverless has
// a 50 MB function limit and OG images are cached aggressively by
// crawlers + the CDN, so cold-start cost is paid at most once per
// invalidation.
export const alt =
  'Triple J Metal — Fort Cavazos Carports & Same-Week PCS Installs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function MilitaryOpenGraphImage() {
  const { fonts, logo } = await getOgAssets()

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
          // --scrim-hero-military, without the photo under it.
          backgroundImage: `linear-gradient(110deg, ${OG_NAVY} 0%, #06213a 45%, #3a4420 100%)`,
          color: 'white',
          fontFamily: 'Inter',
          position: 'relative',
        }}
      >
        <PbrStrip width={460} fade="#1e3330" />

        {/* Top row: brand + Fort Cavazos pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Wordmark logo={logo} size={34} />
          <OgPill color="#e2d6ae" border="rgba(197, 180, 129, 0.6)" background="rgba(75, 83, 32, 0.55)">
            Fort Cavazos
          </OgPill>
        </div>

        {/* Headline — the page's h1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Cinzel',
              fontSize: 66,
              fontWeight: 900,
              lineHeight: 1.06,
              letterSpacing: '0.01em',
              maxWidth: 1040,
            }}
          >
            {/* textWrap set per span: satori does not inherit it. */}
            <span style={{ textWrap: 'balance' }}>Fort Cavazos carports.</span>
            <span style={{ textWrap: 'balance', backgroundImage: OG_STEEL_TEXT, backgroundClip: 'text', color: 'transparent' }}>
              Same-week for PCS families.
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.4, color: 'rgba(255,255,255,0.78)', maxWidth: 900 }}>
            Welded or bolted. Concrete available. 7% military discount
            honored. Hablamos español.
          </div>
        </div>

        <OgFooter path="/military" />
      </div>
    ),
    { ...size, fonts },
  )
}
