/**
 * Page → quote-form handoff for Forge pages.
 *
 * Option cards, the lightbox's "Quote a build like this", the homepage
 * fencing card and the military calculator all live in different components
 * from the shared <QuoteSection>. They never import the form: they dispatch a
 * window event and the form, which listens, applies the prefill. Then the page
 * scrolls to the form with the header's height as the offset.
 */

export type QuoteServiceValue = "fencing" | "carport" | "garage" | "barn" | "rv_cover" | "lean_to" | "other";

export type QuoteRequest = {
  service?: QuoteServiceValue;
  structure?: "welded" | "bolted" | "unsure";
  concrete?: "yes" | "already_have" | "unsure";
  military?: boolean;
  /** Which element to scroll to. Defaults to the quote section. */
  target?: "quote" | "quote-card";
};

export const QUOTE_EVENT = "forge:quote";

/** Header height on desktop; the design scrolls anchors with this offset. */
export const ANCHOR_OFFSET = 84;

export function scrollToId(id: string, offset = ANCHOR_OFFSET) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  return true;
}

/**
 * Prefill the page's quote form and scroll to it. Returns false when the page
 * has no quote section, so the caller can fall back to /quote.
 */
export function requestQuote(req: QuoteRequest = {}): boolean {
  if (typeof window === "undefined") return false;
  const target = req.target ?? "quote";
  if (!document.getElementById(target)) return false;
  window.dispatchEvent(new CustomEvent<QuoteRequest>(QUOTE_EVENT, { detail: req }));
  return scrollToId(target) !== false;
}

/** Gallery item type → quote service (lightbox "Quote a build like this"). */
export function quoteServiceForGalleryType(type: string | null | undefined): QuoteServiceValue {
  const t = (type ?? "").toLowerCase();
  if (/fenc|gate/.test(t)) return "fencing";
  // One "Carport / RV Cover" chip on the form, so RV covers quote as carports.
  if (/carport|rv|boat/.test(t)) return "carport";
  if (/patio|lean|porch/.test(t)) return "lean_to";
  if (/garage|enclos|shop/.test(t)) return "garage";
  if (/barn|equipment|stable|hay/.test(t)) return "barn";
  return "other";
}
