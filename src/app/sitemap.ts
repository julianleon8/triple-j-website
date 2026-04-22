import type { MetadataRoute } from "next";

import { BLOG_POSTS } from "@/lib/blog";
import { LOCATIONS } from "@/lib/locations";
import { SERVICE_SLUGS } from "@/lib/services";
import { getSiteUrl } from "@/lib/site-url";

const STATIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/services",
  "/service-areas",
  "/locations",
  "/blog",
  "/gallery",
  "/services/colors",
  "/services/pbr-vs-pbu-panels",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
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
          : path === "/contact" || path === "/services"
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

  for (const post of BLOG_POSTS) {
    entries.push({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.65,
    });
  }

  return entries;
}
