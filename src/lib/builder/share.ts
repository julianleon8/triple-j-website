/**
 * Share links carry the whole design in the URL fragment: /build#d=<base64url>.
 * Nothing is stored on a server until the customer asks for a quote, there is
 * no PII in a design, and a link never expires. The fragment never reaches
 * the server, so /build stays a static page.
 */

import { normalizeDesign } from "./rules";
import { designSchema, type Design } from "./design";

const HASH_KEY = "d";

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodeDesign(d: Design): string {
  return toBase64Url(JSON.stringify(d));
}

/**
 * A design from a link, or null if it is malformed. A well-formed design that
 * breaks a rule (say, one the shop tightened after it was shared) still opens,
 * so a customer or HQ sees what was sent; the review step lists what needs
 * fixing, and neither the form nor the server accepts it until it is fixed.
 */
export function decodeDesign(encoded: string): Design | null {
  try {
    const parsed = designSchema.safeParse(JSON.parse(fromBase64Url(encoded)));
    return parsed.success ? normalizeDesign(parsed.data) : null;
  } catch {
    return null;
  }
}

export function designFromHash(hash: string): Design | null {
  const m = /(?:^#|&)d=([A-Za-z0-9_-]+)/.exec(hash);
  return m ? decodeDesign(m[1]) : null;
}

/** Whether a URL fragment carries a design, readable or not. */
export function hasDesignHash(hash: string): boolean {
  return /(?:^#|&)d=/.test(hash);
}

/** The URL fragment that opens a design: `#d=<base64url>`. */
export function designHash(d: Design): string {
  return `#${HASH_KEY}=${encodeDesign(d)}`;
}

/**
 * A tab that leaves mid-edit saves its newest design as the draft before the
 * address bar has caught up. It notes both here (`from`: the fragment still in
 * the address, `to`: the draft it saved), so that tab reopening at that
 * address restores its own newer draft rather than taking the address for a
 * link someone sent.
 */
export type DraftAhead = { from: string; to: string };

/**
 * What /build opens with: the design in the link, else this browser's draft,
 * else none (the default). The address bar keeps the design as it changes, so
 * a link that matches the draft is a reload of this browser's own design, not
 * one someone sent; so is the address this tab left behind (`ahead`) while the
 * draft is still the one it saved then. `badLink`: the fragment held a design
 * that can't be read.
 */
export function restoreDesign(
  hash: string,
  draft: string | null,
  ahead: DraftAhead | null = null,
): { design: Design | null; shared: boolean; badLink: boolean } {
  const hasLink = hasDesignHash(hash);
  const fromLink = hasLink ? designFromHash(hash) : null;
  const fromDraft = draft ? decodeDesign(draft) : null;
  if (fromDraft && ahead && hash === ahead.from && draft === ahead.to) return { design: fromDraft, shared: false, badLink: false };
  const own = fromLink !== null && fromDraft !== null && encodeDesign(fromLink) === encodeDesign(fromDraft);
  return { design: fromLink ?? fromDraft, shared: fromLink !== null && !own, badLink: hasLink && !fromLink };
}

/** Reads a DraftAhead note back, or null for anything else. */
export function parseDraftAhead(raw: string | null): DraftAhead | null {
  if (!raw) return null;
  try {
    const v: unknown = JSON.parse(raw);
    if (v && typeof v === "object" && typeof (v as DraftAhead).from === "string" && typeof (v as DraftAhead).to === "string") {
      return { from: (v as DraftAhead).from, to: (v as DraftAhead).to };
    }
  } catch {
    // Not ours.
  }
  return null;
}

export type HashChange = { kind: "none" } | { kind: "bad" } | { kind: "open"; design: Design };

/**
 * What a new address fragment asks of an open builder. `shown` is the one the
 * page last wrote itself: back at it, nothing changed, so the page's own
 * writes never loop. Otherwise a design link opens, an unreadable one is
 * flagged, and any other fragment is not a design link at all.
 */
export function hashChange(hash: string, shown: string): HashChange {
  if (hash === shown || !hasDesignHash(hash)) return { kind: "none" };
  const design = designFromHash(hash);
  return design ? { kind: "open", design } : { kind: "bad" };
}

export function shareUrl(origin: string, d: Design): string {
  return `${origin.replace(/\/$/, "")}/build${designHash(d)}`;
}

/** The 3D link for a design stored on a lead, or null when there is no valid one. */
export function storedDesignUrl(origin: string, stored: unknown): string | null {
  if (stored == null) return null;
  const parsed = designSchema.safeParse(stored);
  return parsed.success ? shareUrl(origin, parsed.data) : null;
}
