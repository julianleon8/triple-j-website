import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Triple J Metal HQ',
    short_name: 'Triple J',
    description: 'Triple J Metal field tool — leads, customers, quotes, jobs, gallery.',
    start_url: '/hq',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    // The installed app launches straight into /hq (start_url), which is the
    // forced-dark "Shop floor" surface — so both the chrome tint and the splash
    // ground are HQ's page colour. Brand blue here put a blue status bar over a
    // near-black app. NOTE: iOS caches the manifest at install time, so an
    // already-installed PWA keeps the old colours until it is removed and
    // re-added to the Home Screen.
    theme_color: '#0b0d0f',
    background_color: '#0b0d0f',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
