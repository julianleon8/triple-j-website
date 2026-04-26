"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Fires the Google Ads "lead form submitted" conversion event once on mount.
 * Mounted on /thank-you, the post-submit redirect destination of QuoteForm.
 *
 * Configure via env (Vercel project settings, all environments):
 *   NEXT_PUBLIC_GOOGLE_ADS_ID         — e.g. "AW-1234567890"
 *   NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL — e.g. "AbCd_EfGhIj-1k2L3"
 *
 * Both come from the conversion action you create in Google Ads UI →
 * Goals → Conversions → New conversion action → Website. See README in
 * AGENTS.md for the step-by-step.
 *
 * `value` defaults to 0 (no monetary value yet — we'll add budget-band
 * pass-through after we have 30 conversions of baseline data).
 *
 * No-ops cleanly when env vars or window.gtag are missing — safe to
 * leave mounted in dev / preview.
 */
export function GoogleAdsConversion({ value = 0 }: { value?: number }) {
  useEffect(() => {
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    if (!adsId || !label) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;

    window.gtag("event", "conversion", {
      send_to: `${adsId}/${label}`,
      value,
      currency: "USD",
    });
  }, [value]);

  return null;
}
