import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Just the slice of webpack's compilation the precache filter below reads.
// webpack itself is vendored inside Next, so its types aren't importable here.
type BuildAsset = { name: string };
type BuildCompilation = {
  chunks: Iterable<{ files: Set<string> }>;
  chunkGraph: {
    getChunkModulesIterable(chunk: unknown): Iterable<{ nameForCondition(): string | null }>;
  };
};

/**
 * Every emitted file that carries pdf.js — matched by contents, not by name.
 * Next's splitChunks lifts big libraries into hash-named chunks, so a name
 * pattern can't find pdf.js's 490 KB main chunk; its worker is a plain asset
 * that keeps its own name. Computed once per compilation.
 */
const pdfJsAssets = new WeakMap<BuildCompilation, Set<string>>();
function isPdfJsAsset({ asset, compilation }: { asset: BuildAsset; compilation: BuildCompilation }) {
  let files = pdfJsAssets.get(compilation);
  if (!files) {
    files = new Set();
    for (const chunk of compilation.chunks) {
      for (const m of compilation.chunkGraph.getChunkModulesIterable(chunk)) {
        if (/[\\/]pdfjs-dist[\\/]/.test(m.nameForCondition() ?? "")) {
          for (const f of chunk.files) files.add(f);
          break;
        }
      }
    }
    pdfJsAssets.set(compilation, files);
  }
  return files.has(asset.name) || /pdf\.worker/.test(asset.name);
}

const withSerwist = withSerwistInit({
  // Service worker source file — compiled by Serwist into /sw.js
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: false,
  // Disable the generated SW in dev — it caches broken HMR chunks
  disable: process.env.NODE_ENV === "development",
  // The SW registers on every page, public site included, and precaches every
  // build asset under 2 MB. pdf.js (~1.7 MB with its worker) is only ever used
  // by the HQ quote PDF viewer, so it stays out: website visitors must not
  // download it in the background. The first two entries are Serwist's own
  // defaults, which setting `exclude` would otherwise drop.
  exclude: [/\.map$/, /^manifest.*\.js$/, isPdfJsAsset],
});

// Files the OG cards read from disk at render time (src/lib/og-card.tsx).
// Every card prerenders at build, but the tracer picked these up for only
// some of the card routes, so name them for all of them — a card rendered on
// demand without its fonts would 500.
const OG_CARD_FILES = [
  "./src/lib/og-fonts/*.woff",
  "./public/images/logo-lion.png",
  "./public/images/red-iron-frame-hero.jpg",
];

// PostHog, US Cloud, reached through our own domain (see src/lib/analytics.ts).
// First-party requests survive the ad blockers that drop posthog.com ones.
const POSTHOG_INGEST = "https://us.i.posthog.com";
const POSTHOG_ASSETS = "https://us-assets.i.posthog.com";

const nextConfig: NextConfig = {
  // PostHog's API paths end in a slash (/e/, /flags/) and Next's built-in
  // trailing-slash redirect would bounce every one of them. It is switched off
  // here and re-created in redirects() below for every path except /ingest,
  // so /about/ still 308s to /about exactly as before.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: `${POSTHOG_ASSETS}/static/:path*` },
      { source: "/ingest/array/:path*", destination: `${POSTHOG_ASSETS}/array/:path*` },
      { source: "/ingest/:path*", destination: `${POSTHOG_INGEST}/:path*` },
    ];
  },
  outputFileTracingIncludes: {
    "/**/opengraph-image*": OG_CARD_FILES,
    "/og-default.jpg": OG_CARD_FILES,
  },
  async redirects() {
    return [
      // Next's own trailing-slash rule (`/:path+/` → `/:path+`, 308), minus
      // /ingest — see skipTrailingSlashRedirect above. Must stay first.
      {
        source: "/:path((?!ingest/).+)/",
        destination: "/:path",
        permanent: true,
      },
      {
        source: "/services/garages",
        destination: "/services/metal-garages",
        permanent: true,
      },
      {
        // These two have no service page of their own yet. /quote beats
        // /contact for them: the visitor asked for a specific build, and the
        // prefill lands them on a form already set to it. Still 307 — a real
        // service page may yet claim these URLs.
        source: "/services/lean-to-patios",
        destination: "/quote?service=lean_to",
        permanent: false,
      },
      {
        source: "/services/house-additions",
        destination: "/quote",
        permanent: false,
      },

      // ── Short aliases for /quote ────────────────────────────────────────
      // Printed on cards and said out loud, so the obvious misses resolve.
      // 307 rather than 301 for now: a cached permanent redirect on a
      // brand-new alias is expensive to undo if the shape changes.
      {
        source: "/free-quote",
        destination: "/quote",
        permanent: false,
      },
      {
        source: "/estimate",
        destination: "/quote",
        permanent: false,
      },
      {
        // /service-areas folded into /locations on 2026-04-26 (near-duplicate
        // hub pages were splitting Google's ranking signal).
        source: "/service-areas",
        destination: "/locations",
        permanent: true,
      },

      // ── County pages folded into their strongest member city, 2026-09-06 ──
      // All eight carried 28-36 lines of data with no landmarks, callouts or
      // topServices, wrapped in the same chrome as the city pages and sharing
      // the identical 6-photo gallery strip — Google's "substantially similar
      // pages" test. They also cannibalised the cities inside them
      // (/locations/lampasas vs /locations/lampasas-county). Removed from
      // LOCATIONS in src/lib/locations.ts, so they leave the sitemap too.
      // Counties with a strong member city land there; the four with no city
      // page of their own land on the hub.
      {
        source: "/locations/bell-county",
        destination: "/locations/temple",
        permanent: true,
      },
      {
        source: "/locations/mclennan-county",
        destination: "/locations/waco",
        permanent: true,
      },
      {
        source: "/locations/williamson-county",
        destination: "/locations/georgetown",
        permanent: true,
      },
      {
        source: "/locations/coryell-county",
        destination: "/locations/copperas-cove",
        permanent: true,
      },
      {
        source: "/locations/lampasas-county",
        destination: "/locations/lampasas",
        permanent: true,
      },
      // Falls, Milam and Burnet have no city page of their own — the hub is
      // the closest genuinely equivalent destination.
      {
        source: "/locations/falls-county",
        destination: "/locations",
        permanent: true,
      },
      {
        source: "/locations/milam-county",
        destination: "/locations",
        permanent: true,
      },
      {
        source: "/locations/burnet-county",
        destination: "/locations",
        permanent: true,
      },

      // The permit guide dropped "2025" from its title and URL, 2026-10-03:
      // in search results a year-stamped guide reads as out of date. The
      // fee figures inside stay dated "As of 2025".
      {
        source: "/blog/bell-county-metal-building-permit-guide-2025",
        destination: "/blog/bell-county-metal-building-permit-guide",
        permanent: true,
      },

      // ── Per-brand comparison pages folded into one, 2026-10-04 ──────────
      // Eagle Carports, Get Carports and Carport Central each had a page 97%
      // identical to the others (only the name differed) — near-duplicates
      // Google folds together or treats as doorways. The national-dealer
      // page already compares all three, plus Viking and Infinity.
      {
        source: "/alternatives/eagle-carports",
        destination: "/alternatives/national-kit-dealers",
        permanent: true,
      },
      {
        source: "/alternatives/get-carports",
        destination: "/alternatives/national-kit-dealers",
        permanent: true,
      },
      {
        source: "/alternatives/carport-central",
        destination: "/alternatives/national-kit-dealers",
        permanent: true,
      },
    ];
  },
  async headers() {
    const cspReportOnly = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "connect-src 'self' https:",
      // Google Maps on /contact, the hCaptcha widget on every form, and the
      // Google Ads tag's frames. Without this, frame-src falls back to
      // default-src 'self' and enforcing would break all three.
      "frame-src 'self' https:",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
      // Violations are logged as `[csp]` lines in the Vercel runtime logs.
      // Review a week of them before switching this header to enforce.
      "report-uri /api/csp-report",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: cspReportOnly,
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'metalmax.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

export default withSerwist(nextConfig);
