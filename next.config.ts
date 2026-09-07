import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // Service worker source file — compiled by Serwist into /sw.js
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: false,
  // Disable the generated SW in dev — it caches broken HMR chunks
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
      "frame-ancestors 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
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
