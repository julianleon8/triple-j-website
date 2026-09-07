/**
 * Query-param prefill for the /quote landing page.
 *
 * Ad creatives, Marketplace listings and links Julian texts to a customer all
 * arrive with a query string: ?service=rv_cover, ?city=killeen, ?project=<uuid>.
 * This turns that into form state.
 *
 * The governing rule is **drop, never guess**. An unrecognised value yields
 * `undefined` and the field opens blank, because every wrong answer here is
 * worse than no answer: a wrong ZIP lands in `leads.city` (the exact corruption
 * migration 028 exists to repair) and a wrong service chip sends the customer
 * a quote for a building they didn't ask about.
 *
 * Parsing happens server-side in the page component, not via useSearchParams
 * inside QuoteForm -- that hook would force a Suspense boundary around all
 * fourteen inline usages of the form, four of which are statically prerendered.
 */

import { LOCATIONS } from './locations';
import type { ReferenceService } from './project-reference';

export type QuotePrefill = {
  service?: ReferenceService;
  zip?: string;
  projectId?: string;
};

type RawParams = Record<string, string | string[] | undefined>;

/**
 * Aliases we accept for `?service=`, beyond the canonical values themselves.
 * These are the words that end up in ad copy and in conversation -- nobody
 * types `rv_cover` into a link by hand.
 *
 * `lean_to` is a form-only value: it collapses to `other` at submit time with
 * its label preserved in the notes (see QuoteForm). Prefilling it just selects
 * the chip; the submit-time mapping is untouched.
 */
const SERVICE_ALIASES: Record<string, ReferenceService> = {
  carport: 'carport', carports: 'carport',
  garage: 'garage', garages: 'garage', shop: 'garage', workshop: 'garage',
  barn: 'barn', barns: 'barn',
  rv_cover: 'rv_cover', 'rv-cover': 'rv_cover', rvcover: 'rv_cover',
  rv: 'rv_cover', boat: 'rv_cover', 'boat-cover': 'rv_cover',
  lean_to: 'lean_to', 'lean-to': 'lean_to', leanto: 'lean_to',
  patio: 'lean_to', porch: 'lean_to', 'porch-cover': 'lean_to',
  other: 'other', custom: 'other',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ZIP = /^\d{5}$/;

/**
 * A repeated param (`?service=a&service=b`) is ambiguous, so it is dropped
 * rather than silently resolved to the first value.
 */
function single(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/** `Killeen, TX` / `harker_heights` / ` Belton ` all reach the LOCATIONS key. */
function citySlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/,?\s*(tx|texas)$/, '')
    .trim()
    .replace(/[\s_]+/g, '-');
}

export function parseQuotePrefill(params: RawParams): QuotePrefill {
  const result: QuotePrefill = {};

  const service = single(params.service);
  if (service) {
    const match = SERVICE_ALIASES[service.trim().toLowerCase()];
    if (match) result.service = match;
  }

  // `?zip=` wins over `?city=` -- it is the more specific of the two, and it is
  // what the form field actually holds.
  const zip = single(params.zip)?.trim();
  if (zip && ZIP.test(zip)) {
    result.zip = zip;
  } else {
    const city = single(params.city)?.trim();
    if (city) {
      // A bare ZIP passed as ?city= is still a ZIP.
      if (ZIP.test(city)) result.zip = city;
      else result.zip = LOCATIONS[citySlug(city)]?.zip;
    }
  }

  const project = single(params.project)?.trim();
  if (project && UUID.test(project)) result.projectId = project;

  return result;
}
