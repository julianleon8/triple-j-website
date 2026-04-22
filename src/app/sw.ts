/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from 'serwist'

// TS augment for the SW global scope
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  runtimeCaching: [
    // ── HQ data reads — NetworkFirst so fresh wins when online,
    // cache falls back when offline. 5-min freshness window.
    {
      matcher: ({ url, sameOrigin, request }) =>
        sameOrigin &&
        request.method === 'GET' &&
        (url.pathname === '/api/leads' ||
         url.pathname === '/api/customers' ||
         url.pathname === '/api/quotes' ||
         url.pathname === '/api/jobs' ||
         url.pathname === '/api/permit-leads'),
      handler: new NetworkFirst({
        cacheName: 'hq-api',
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24, // keep cache up to 24h as last-resort offline
          }),
        ],
      }),
    },

    // ── HQ page shells — StaleWhileRevalidate so cold launches paint the
    // last cached shell in <50ms while the network revalidates in background.
    // Trade-off: data may be a few minutes stale until revalidation completes
    // (the streamed Suspense sections in /hq/page.tsx surface fresh data on
    // their own once the revalidated HTML arrives). For owner field use this
    // is the right call — instant feedback beats fresh-but-blocked.
    {
      matcher: ({ request, sameOrigin, url }) =>
        sameOrigin &&
        request.mode === 'navigate' &&
        url.pathname.startsWith('/hq'),
      handler: new StaleWhileRevalidate({
        cacheName: 'hq-pages',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24,
          }),
        ],
      }),
    },

    // ── Static images (Supabase storage + local) — CacheFirst, long TTL
    {
      matcher: ({ request }) => request.destination === 'image',
      handler: new CacheFirst({
        cacheName: 'images',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 80,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          }),
        ],
      }),
    },

    // ── All mutations (POST/PATCH/DELETE) are NetworkOnly.
    // If offline, they fail fast — the client surfaces "you're offline" toast.
    {
      matcher: ({ request }) => request.method !== 'GET',
      handler: new NetworkOnly(),
    },

    // ── Catch-all from Serwist's default config (static assets, _next, etc.)
    ...defaultCache,
  ],

  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
})

serwist.addEventListeners()

// ──────────────────────────────────────────────────────────────────────────
// Push notifications (B4)
// Server posts a JSON payload { title, body, url?, tag? } via web-push.
// SW renders the notification; click focuses the PWA and navigates to url.
// ──────────────────────────────────────────────────────────────────────────

type PushPayload = {
  title: string
  body: string
  url?: string
  tag?: string
  icon?: string
}

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return
  let payload: PushPayload
  try {
    payload = event.data.json() as PushPayload
  } catch {
    payload = { title: 'Triple J HQ', body: event.data.text() }
  }

  const { title, body, url, tag, icon } = payload
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag: tag ?? 'triple-j',
      icon: icon ?? '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: url ?? '/hq' },
    }),
  )
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const targetUrl = (event.notification.data as { url?: string } | undefined)?.url ?? '/hq'

  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      // If an HQ tab is already open, focus it and navigate.
      for (const client of all) {
        if (client.url.includes('/hq')) {
          await client.focus()
          if ('navigate' in client) await (client as WindowClient).navigate(targetUrl)
          return
        }
      }
      // Otherwise open a fresh window at the target URL.
      await self.clients.openWindow(targetUrl)
    })(),
  )
})
