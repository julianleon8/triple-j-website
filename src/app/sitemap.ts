import type { MetadataRoute } from "next";

import { BLOG_POSTS } from "@/lib/blog";
import { ALTERNATIVES_SLUGS } from "@/lib/competitors";
import { LOCATIONS } from "@/lib/locations";
import { SERVICE_SLUGS } from "@/lib/services";
import { getSiteUrl } from "@/lib/site-url";
import { getAdminClient } from "@/lib/supabase/admin";

const STATIC_PATHS = [
  "/",
  "/about",
  "/contact",
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

type GalleryItemRow = {
  id: string;
  updated_at: string | null;
  created_at: string | null;
  gallery_photos: { image_url: string; sort_order: number; is_cover: boolean }[] | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    entries.push({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority:
        path === "/"
          ? 1
          : path === "/contact" || path === "/services" || path === "/military"
            ? 0.9
            : 0.8,
    });
  }

  for (const slug of SERVICE_SLUGS) {
    entries.push({
      url: `${base}/services/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    });
  }

  for (const slug of Object.keys(LOCATIONS)) {
    entries.push({
      url: `${base}/locations/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const slug of ALTERNATIVES_SLUGS) {
    entries.push({
      url: `${base}/alternatives/${slug}`,
      lastModified: now,
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
    const { data: items } = await getAdminClient()
      .from("gallery_items")
      .select(
        `
        id, updated_at, created_at,
        gallery_photos ( image_url, sort_order, is_cover )
        `,
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(500);

    for (const item of (items ?? []) as GalleryItemRow[]) {
      const photos = item.gallery_photos ?? [];
      if (photos.length === 0) continue;
      // Cover first, then by sort_order ascending — matches the in-page render.
      const ordered = [...photos].sort((a, b) => {
        if (a.is_cover && !b.is_cover) return -1;
        if (b.is_cover && !a.is_cover) return 1;
        return a.sort_order - b.sort_order;
      });
      entries.push({
        url: `${base}/gallery/${item.id}`,
        lastModified: item.updated_at
          ? new Date(item.updated_at)
          : item.created_at
            ? new Date(item.created_at)
            : now,
        changeFrequency: "monthly",
        priority: 0.6,
        images: ordered.map((p) => p.image_url),
      });
    }
  } catch (err) {
    console.warn("[sitemap] gallery fetch failed, skipping image entries:", err);
  }

  return entries;
}
