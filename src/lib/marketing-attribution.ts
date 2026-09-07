const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'] as const;
export type Attribution = Partial<Record<(typeof KEYS)[number] | 'landing_url' | 'referrer_url', string>>;
const STORAGE_KEY = 'tj_marketing_first_touch';
let memory: Attribution | undefined;

export function firstTouch(url: string, referrer: string, previous?: Attribution): Attribution {
  if (previous?.landing_url) return previous;
  const parsed = new URL(url);
  const result: Attribution = { landing_url: url.slice(0, 2000) };
  if (referrer) result.referrer_url = referrer.slice(0, 2000);
  for (const key of KEYS) {
    const value = parsed.searchParams.get(key);
    if (value) result[key] = value.slice(0, 200);
  }
  // `?src=` is the short form our own ad creatives and Marketplace listings use
  // (the /quote?src=fb funnel). Without this it was captured by nothing and the
  // lead landed with a null utm_source. Never overrides a real utm_source.
  if (!result.utm_source) {
    const src = parsed.searchParams.get('src');
    if (src) result.utm_source = src.slice(0, 200);
  }
  return result;
}

/** First landing in this tab, preserved through internal navigation and reloads. */
export function captureAttribution(): Attribution {
  if (typeof window === 'undefined') return {};
  if (memory) return memory;
  let previous: Attribution | undefined;
  try {
    const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    if (value && typeof value.landing_url === 'string') {
      previous = {};
      for (const key of [...KEYS, 'landing_url', 'referrer_url'] as const) {
        if (typeof value[key] === 'string') previous[key] = value[key].slice(0, KEYS.includes(key as typeof KEYS[number]) ? 200 : 2000);
      }
    }
  } catch { /* Storage may be blocked or contain an invalid value. */ }
  memory = firstTouch(window.location.href, document.referrer, previous);
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memory)); } catch { /* In-memory fallback. */ }
  return memory;
}
