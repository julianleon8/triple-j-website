# Open Graph card fonts

Read by `src/lib/og-card.tsx`. `next/og` bundles only Geist Regular, so without
these every `fontWeight` in a card silently renders at 400.

| File | Face | Used for |
|---|---|---|
| `barlow-condensed-latin-800-normal.woff` | Barlow Condensed ExtraBold | wordmark, headlines |
| `barlow-condensed-latin-700-normal.woff` | Barlow Condensed Bold | phone number |
| `inter-latin-{500,600,700}-normal.woff` | Inter | body text, pills, footer |

The same two families the site loads through `next/font/google` in
`src/app/layout.tsx`. Latin subsets from `@fontsource/barlow-condensed` and
`@fontsource/inter` 5.3.0. WOFF, not WOFF2 — satori cannot parse WOFF2.

Both are licensed under the SIL Open Font License 1.1
(https://openfontlicense.org). Used only to render images at build time;
never served to browsers.
