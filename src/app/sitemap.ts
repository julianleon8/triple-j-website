import type { MetadataRoute } from "next";

import { BLOG_POSTS } from "@/lib/blog";
import { ALTERNATIVES_SLUGS } from "@/lib/competitors";
import { LOCATIONS } from "@/lib/locations";
import { SERVICE_SLUGS } from "@/lib/services";
import { spanishPath } from "@/i18n/routes";
import { getSiteUrl } from "@/lib/site-url";
import { getAdminClient } from "@/lib/supabase/admin";

const STATIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/quote",
  "/services",
  "/locations",
  "/military",
  "/blog",
  "/gallery",
  "/partners",
  "/services/colors",
  "/services/pbr-vs-pbu-panels",
  "/services/hybrid-projects",
  "/best-metal-carport-builders-temple-tx",
  "/privacy",
  "/terms",
] as const;

// Force dynamic so the sitemap re-queries gallery on each request — gallery
// content changes whenever Julian uploads new project photos, and we want
// Google's sitemap fetches to pick those up without a redeploy.
export const dynamic = "force-dynamic";

// `lastModified` must NOT be `new Date()` for the non-gallery entries. Because
// this route is force-dynamic, `now` is re-evaluated on every Googlebot fetch,
// so every static/service/location/alternatives URL would claim it changed
// seconds ago, every time. Google detects perpetually-fresh lastmod and stops
// trusting the signal site-wide — including for the gallery rows, where it is
// real. Bump this when the corresponding page copy actually changes; the
// gallery rows below keep their true per-row timestamps from Supabase.
const CONTENT_REVISED = new Date("2026-09-07T00:00:00.000Z");

const COPY_REVISED = new Date("2026-09-26T00:00:00.000Z");
const CITY_REVISED: Record<string, Date> = {
  ...Object.fromEntries(
    ["salado", "lampasas", "holland", "taylor", "troy", "nolanville", "georgetown", "belton", "killeen"].map((slug) => [slug, COPY_REVISED]),
  ),
  "harker-heights": new Date("2026-10-01T00:00:00.000Z"),
  "copperas-cove": new Date("2026-10-01T00:00:00.000Z"),
};

// `gallery_items` has no `updated_at` column. Selecting one made PostgREST
// reject the whole query, and because the result's `error` went unread, every
// gallery project page and photo silently dropped out of the sitemap.
// Photos are usually added after their project is created, so the newest
// photo date is the honest lastModified.
type GalleryItemRow = {
  id: string;
  created_at: string | null;
  gallery_photos:
    | { image_url: string; sort_order: number; is_cover: boolean; created_at?: string | null }[]
    | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    entries.push({
      url: `${base}${path}`,
      lastModified: CONTENT_REVISED,
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority:
        path === "/"
          ? 1
          : path === "/contact" || path === "/quote" || path === "/services" || path === "/military"
            ? 0.9
            : 0.8,
    });
  }

  for (const slug of SERVICE_SLUGS) {
    entries.push({
      url: `${base}/services/${slug}`,
      lastModified: COPY_REVISED,
      changeFrequency: "monthly",
      priority: 0.85,
    });
  }

  for (const slug of Object.keys(LOCATIONS)) {
    entries.push({
      url: `${base}/locations/${slug}`,
      lastModified: CITY_REVISED[slug] ?? CONTENT_REVISED,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const slug of ALTERNATIVES_SLUGS) {
    entries.push({
      url: `${base}/alternatives/${slug}`,
      lastModified: COPY_REVISED,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const post of BLOG_POSTS) {
    entries.push({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.65,
    });
  }

  // Gallery item pages with image extension entries — each project's photos
  // get registered with Google Image Search alongside the canonical URL.
  // Best-effort: if Supabase fails (build-time, key missing, etc.) we just
  // ship the static portion of the sitemap.
  try {
    const { data: items, error } = await getAdminClient()
      .from("gallery_items")
      .select(
        `
        id, created_at,
        gallery_photos ( image_url, sort_order, is_cover, created_at )
        `,
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;

    for (const item of (items ?? []) as GalleryItemRow[]) {
      const photos = item.gallery_photos ?? [];
      if (photos.length === 0) continue;
      // Cover first, then by sort_order ascending — matches the in-page render.
      const ordered = [...photos].sort((a, b) => {
        if (a.is_cover && !b.is_cover) return -1;
        if (b.is_cover && !a.is_cover) return 1;
        return a.sort_order - b.sort_order;
      });
      const stamps = [item.created_at, ...photos.map((p) => p.created_at)]
        .filter((s): s is string => Boolean(s))
        .map((s) => new Date(s).getTime());
      entries.push({
        url: `${base}/gallery/${item.id}`,
        lastModified: stamps.length > 0 ? new Date(Math.max(...stamps)) : now,
        changeFrequency: "monthly",
        priority: 0.6,
        // Sitemap image locations must be absolute; seeded rows store
        // site-relative paths like `/images/porch-cover-lean-to.jpg`.
        images: ordered.map((p) => (p.image_url.startsWith("/") ? `${base}${p.image_url}` : p.image_url)),
      });
    }
  } catch (err) {
    console.warn("[sitemap] gallery fetch failed, skipping image entries:", err);
  }

  return withSpanish(entries, base);
}

/**
 * Every page with a Spanish twin (src/i18n/routes.ts) is listed in both
 * languages, each entry naming the pair and x-default (English) — Google's
 * sitemap form of hreflang. English-only pages (legal) stay single.
 */
export function withSpanish(entries: MetadataRoute.Sitemap, base: string): MetadataRoute.Sitemap {
  return entries.flatMap((entry) => {
    const path = entry.url.slice(base.length) || "/";
    const es = spanishPath(path);
    if (es === null) return [entry];
    const alternates = { languages: { en: entry.url, es: `${base}${es}`, "x-default": entry.url } };
    return [
      { ...entry, alternates },
      { ...entry, url: `${base}${es}`, alternates },
    ];
  });
}
