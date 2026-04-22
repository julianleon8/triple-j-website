import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/hq/", "/api/", "/login", "/setup", "/dashboard", "/quotes/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
