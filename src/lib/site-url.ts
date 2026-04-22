/**
 * Canonical origin for sitemaps, robots, and absolute URLs.
 * Set `NEXT_PUBLIC_SITE_URL` in Vercel (e.g. `https://www.triplejmetaltx.com`).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  return "https://www.triplejmetaltx.com";
}
