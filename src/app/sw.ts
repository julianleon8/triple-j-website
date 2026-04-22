/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
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

    // ── HQ page shells — NetworkFirst on navigation so you see fresh
    // server-rendered HTML when online, cached shell when offline.
    {
      matcher: ({ request, sameOrigin, url }) =>
        sameOrigin &&
        request.mode === 'navigate' &&
        url.pathname.startsWith('/hq'),
      handler: new NetworkFirst({
        cacheName: 'hq-pages',
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
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
