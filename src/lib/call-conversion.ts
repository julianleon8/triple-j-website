/**
 * Google Ads "phone call click" conversion — a tap on any tracked phone link.
 *
 * The lead-form conversion fires on /thank-you (GoogleAdsConversion.tsx). A
 * call never reaches that page, so until this existed a caller from an ad
 * counted for nothing in Google Ads, and most contractor leads call. It is a
 * second conversion action with its own label, created in Google Ads →
 * Goals → Conversions → New → Website → "Phone call clicks":
 *
 *   NEXT_PUBLIC_GOOGLE_ADS_ID                    — shared with the form conversion
 *   NEXT_PUBLIC_GOOGLE_ADS_CALL_CONVERSION_LABEL — this action's label
 *
 * Firing for every visitor is correct: Google Ads credits a conversion only to
 * a visitor who arrived from one of its ads. No label, no event.
 */
export function callConversionSendTo(
  adsId: string | undefined,
  label: string | undefined,
): string | null {
  const id = adsId?.trim()
  const lbl = label?.trim()
  if (!id || !lbl) return null
  return `${id}/${lbl}`
}
