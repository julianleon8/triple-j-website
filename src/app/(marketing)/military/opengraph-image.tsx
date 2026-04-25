import { ImageResponse } from 'next/og'

/**
 * Per-page Open Graph + Twitter card image for /military.
 *
 * Next.js's file-based OG image API: any `opengraph-image.tsx` (or
 * `twitter-image.tsx`) inside a route segment becomes that page's
 * og:image / twitter:image. Generated as a 1200×630 PNG at request time
 * + cached. No external asset needed; brand-consistent.
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
        {/* Top row: brand + Fort Cavazos pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              alignItems: 'center',
              gap: 12,
              padding: '10px 20px',
              borderRadius: 999,
              background: 'rgba(220, 38, 38, 0.25)',
              border: '2px solid rgba(220, 38, 38, 0.6)',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#fca5a5',
            }}
          >
            Fort Cavazos
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 86,
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              maxWidth: 1000,
            }}
          >
            <span>Same-Week Carports</span>
            <span style={{ display: 'flex', gap: 18 }}>
              <span>for</span>
              <span style={{ color: '#4d8dff' }}>PCS Families.</span>
            </span>
          </div>
          <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.75)', maxWidth: 950 }}>
            Welded or bolted. Concrete pad in the same contract. 7% military
            discount honored. Hablamos español.
          </div>
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
          <div>triplejmetaltx.com / military</div>
          <div style={{ fontWeight: 700, color: 'white' }}>254-346-7764</div>
        </div>
      </div>
    ),
    size,
  )
}
