import Script from "next/script";

/**
 * Loads the Google Ads gtag.js base script when NEXT_PUBLIC_GOOGLE_ADS_ID
 * is set (format: "AW-1234567890"). Mounted once in the marketing layout
 * so every public page can fire conversion events via window.gtag().
 *
 * Safe to deploy without the env var — renders nothing in that case so
 * we don't ship an empty tag in dev / preview.
 *
 * Conversion firing happens in <GoogleAdsConversion /> on /thank-you.
 */
export function GoogleAdsTag() {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!adsId) return null;

  return (
    <>
      <Script
        id="gtag-base"
        src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${adsId}');
        `}
      </Script>
    </>
  );
}
