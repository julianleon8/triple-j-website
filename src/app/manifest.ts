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
    theme_color: '#1e6bd6',
    background_color: '#000000',
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
