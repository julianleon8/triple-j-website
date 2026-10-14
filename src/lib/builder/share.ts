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

export function shareUrl(origin: string, d: Design): string {
  return `${origin.replace(/\/$/, "")}/build#${HASH_KEY}=${encodeDesign(d)}`;
}

/** The 3D link for a design stored on a lead, or null when there is no valid one. */
export function storedDesignUrl(origin: string, stored: unknown): string | null {
  if (stored == null) return null;
  const parsed = designSchema.safeParse(stored);
  return parsed.success ? shareUrl(origin, parsed.data) : null;
}
