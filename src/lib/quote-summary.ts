/**
 * The one-line build summary echoed back on step 2 of the quote form, just
 * above the submit button: "A 20×30×12 welded carport in Killeen".
 *
 * It is a confirmation, not an estimate. There are deliberately no prices here
 * and there never may be -- pricing lives on the sales pack and is quoted on
 * the call.
 *
 * Every part is optional and every part degrades to a shorter valid sentence
 * rather than a broken one. Users paste into the dimension fields, leave them
 * blank, and type ZIPs we don't serve; none of that may produce "A ×  carport"
 * or "A NaN carport".
 */

import { cityFromZip } from './locations';

export type BuildSummaryInput = {
  service_type?: string;
  structure_type?: string;
  width?: string;
  length?: string;
  height?: string;
  zip?: string;
};

const SERVICE_NOUNS: Record<string, string> = {
  carport: 'carport',
  garage: 'metal garage',
  barn: 'metal barn',
  rv_cover: 'RV or boat cover',
  lean_to: 'lean-to patio',
  other: 'custom build',
};

/** `unsure` is the default, so most summaries carry no adjective at all. */
const STRUCTURE_ADJECTIVES: Record<string, string> = {
  welded: 'welded',
  bolted: 'bolted',
};

/**
 * Letters whose name begins with a vowel sound, for initialisms like "RV"
 * ("an ar-vee"). Without this the only vowel-initial service noun we have
 * reads as "a RV or boat cover".
 */
const VOWEL_SOUND_LETTERS = /^[AEFHILMNORSX](?![a-z])/;

/** "a" or "an" for a phrase, covering the numbers dimensions actually produce. */
export function indefiniteArticle(phrase: string): 'A' | 'An' {
  const head = phrase.trimStart();
  if (!head) return 'A';

  if (/^\d/.test(head)) {
    // Eight, eighty, eight hundred -- any leading 8 takes "an".
    if (head.startsWith('8')) return 'An';
    // Eleven and eighteen, but not 110 or 180.
    if (/^1[18](?!\d)/.test(head)) return 'An';
    return 'A';
  }

  if (/^[aeiou]/i.test(head)) return 'An';
  if (VOWEL_SOUND_LETTERS.test(head)) return 'An';
  return 'A';
}

/**
 * A positive whole number of feet, or null for blank, zero, negative or junk.
 *
 * Deliberately stricter than parseInt, which stops at the first non-digit and
 * would turn a pasted `1e9999` into a 1-foot height -- a plausible-looking
 * number the customer never typed. A trailing unit is tolerated because `12ft`
 * is a realistic paste; anything else drops, and the summary simply omits the
 * dimension rather than echoing something wrong.
 */
function dimension(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/\s*(?:ft|feet|'|")$/i, '').trim();
  if (!/^\d{1,3}$/.test(cleaned)) return null;
  const value = Number.parseInt(cleaned, 10);
  return value > 0 ? value : null;
}

/**
 * The summary sentence, or null when there is nothing worth echoing.
 *
 * Null (rather than a partial sentence) whenever the service is unknown: the
 * service noun is the only part that makes the rest mean anything.
 */
export function summarizeBuild(input: BuildSummaryInput): string | null {
  const noun = SERVICE_NOUNS[input.service_type?.trim() ?? ''];
  if (!noun) return null;

  const width = dimension(input.width);
  const length = dimension(input.length);
  const height = dimension(input.height);

  // Width and length are the pair that means something. A lone width is not a
  // size, so it is dropped rather than shown half-stated.
  let size = '';
  if (width && length) {
    size = height ? `${width}×${length}×${height}` : `${width}×${length}`;
  }

  const adjective = STRUCTURE_ADJECTIVES[input.structure_type?.trim() ?? ''] ?? '';

  // cityFromZip returns null for anything unrecognised, and the raw ZIP is
  // never echoed -- a bare five-digit number reads like a mistake.
  const city = cityFromZip(input.zip);

  const phrase = [size, adjective, noun].filter(Boolean).join(' ');
  const article = indefiniteArticle(phrase);

  return city ? `${article} ${phrase} in ${city}` : `${article} ${phrase}`;
}
