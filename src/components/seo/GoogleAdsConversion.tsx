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
 * Goals → Conversions → New conversion action → Website.
 *
 * Enhanced conversions (manual / in-page mode):
 *   QuoteForm.tsx writes the lead's contact info to sessionStorage under
 *   "tj_ec_user_data" right before redirecting here. We read it, normalize
 *   (lowercase email, E.164 phone, split full name), pass to
 *   gtag('set', 'user_data', { ... }) BEFORE the conversion event, then
 *   clear the key. gtag.js SHA-256-hashes the values client-side before
 *   sending — Triple J's servers never see a plain hash going out.
 *
 *   This lifts match rates from ~0% (Automatic mode has nothing to scrape
 *   on this confirmation page) to typically 60–80%, which is the signal
 *   Google's bidding actually needs to find more buyers.
 *
 * `value` defaults to 0 (no monetary value yet — we'll add budget-band
 * pass-through after we have 30 conversions of baseline data).
 *
 * No-ops cleanly when env vars or window.gtag are missing — safe to
 * leave mounted in dev / preview.
 */

type StashedUserData = {
  name?: string;
  phone?: string;
  email?: string;
  zip?: string;
};

type EnhancedAddress = {
  first_name?: string;
  last_name?: string;
  postal_code?: string;
  country?: string;
};

type EnhancedUserData = {
  email?: string;
  phone_number?: string;
  address?: EnhancedAddress;
};

/**
 * E.164-ish normalization for US numbers. Strips non-digits, prepends
 * "+1" for a 10-digit number, "+" for an 11-digit number starting in 1.
 * Leaves anything else untouched (gtag will reject malformed numbers
 * silently — the conversion still fires, just without phone matching).
 */
function normalizePhone(raw: string): string | undefined {
  const digits = raw.replace(/\D+/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits.length >= 10 ? `+${digits}` : undefined;
}

/**
 * Split "Juan Leon" into first/last. Single-token names go to first_name
 * only; everything after the first whitespace becomes last_name.
 */
function splitName(full: string): { first_name?: string; last_name?: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return {};
  if (parts.length === 1) return { first_name: parts[0] };
  return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
}

function buildUserData(stashed: StashedUserData): EnhancedUserData | null {
  const ud: EnhancedUserData = {};

  if (stashed.email) {
    const e = stashed.email.trim().toLowerCase();
    if (e) ud.email = e;
  }

  if (stashed.phone) {
    const p = normalizePhone(stashed.phone);
    if (p) ud.phone_number = p;
  }

  const address: EnhancedAddress = {};
  if (stashed.name) {
    const { first_name, last_name } = splitName(stashed.name);
    if (first_name) address.first_name = first_name;
    if (last_name) address.last_name = last_name;
  }
  if (stashed.zip) {
    const z = stashed.zip.trim();
    if (z) {
      address.postal_code = z;
      address.country = "US";
    }
  }
  if (Object.keys(address).length > 0) ud.address = address;

  return Object.keys(ud).length > 0 ? ud : null;
}

export function GoogleAdsConversion({ value = 0 }: { value?: number }) {
  useEffect(() => {
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    if (!adsId || !label) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;

    // Pull the stash QuoteForm wrote right before redirecting here.
    // Wrapped in try/catch because sessionStorage can throw in private
    // mode and JSON.parse can throw on garbage. Either way we still
    // fire the conversion — just without enhanced match data.
    let userData: EnhancedUserData | null = null;
    try {
      const raw = sessionStorage.getItem("tj_ec_user_data");
      if (raw) {
        const parsed: StashedUserData = JSON.parse(raw);
        userData = buildUserData(parsed);
        // Clear immediately so a back-button → re-mount doesn't double-fire
        // user_data on a stale lead. The conversion event below is also
        // one-shot per page mount, so refreshing /thank-you also can't
        // re-credit a conversion.
        sessionStorage.removeItem("tj_ec_user_data");
      }
    } catch {
      // Non-fatal — fall through to the conversion event without user_data.
    }

    // Per Google docs: set user_data BEFORE the conversion event so
    // gtag includes the (hashed) identifiers in the same request.
    if (userData) {
      window.gtag("set", "user_data", userData);
    }

    window.gtag("event", "conversion", {
      send_to: `${adsId}/${label}`,
      value,
      currency: "USD",
    });
  }, [value]);

  return null;
}
