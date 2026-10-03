import { ImageResponse } from 'next/og'

import type { Locale } from '@/i18n/config'
import { MILITARY } from '@/i18n/pages/military'
import {
  getOgAssets,
  OG_NAVY,
  OG_SIZE,
  OG_STEEL_TEXT,
  OgFooter,
  OgPill,
  PbrStrip,
  Wordmark,
} from '@/lib/og-card'
import { localizeHref } from '@/i18n/routes'

/**
 * The /military and /es/militares Open Graph card (1200×630). Fonts, the lion
 * wordmark and the card pieces come from src/lib/og-card.tsx; this card swaps
 * in the page's olive and tan (the military hero scrim) and repeats its h1.
 * The two route files (`opengraph-image.tsx`) only pick the language.
 */
export async function renderMilitaryOgCard(locale: Locale): Promise<ImageResponse> {
  const { fonts, logo } = await getOgAssets()
  const t = MILITARY[locale].og

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
            {t.pill}
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
            <span style={{ textWrap: 'balance' }}>{t.h1a}</span>
            <span style={{ textWrap: 'balance', backgroundImage: OG_STEEL_TEXT, backgroundClip: 'text', color: 'transparent' }}>
              {t.h1b}
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.4, color: 'rgba(255,255,255,0.78)', maxWidth: 900 }}>
            {t.subhead}
          </div>
        </div>

        <OgFooter path={localizeHref('/military', locale)} />
      </div>
    ),
    { ...OG_SIZE, fonts },
  )
}
