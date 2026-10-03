/**
 * leads / customers / partner_inquiries `preferred_language` (migration 034,
 * the Spanish site, 2026-10-03).
 *
 * The migration must be applied before the code that writes the column ships.
 * These helpers are the backstop if it was not: an insert that names a column
 * the table lacks is rejected outright, and on the public forms that is a lost
 * lead. Each write path retries once without the column and logs loudly.
 */

export type PreferredLanguage = 'en' | 'es'

/** PostgREST's (PGRST204) or Postgres's (42703) "no such column" for preferred_language. */
export function isMissingLanguageColumn(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  return (error.code === 'PGRST204' || error.code === '42703') && /preferred_language/.test(error.message ?? '')
}

/** The row without `preferred_language`, for the retry. */
export function withoutLanguage<T extends { preferred_language?: unknown }>(row: T): Omit<T, 'preferred_language'> {
  const { preferred_language: _dropped, ...rest } = row
  void _dropped
  return rest
}

/** A stored value, defaulting anything unexpected (including a missing column) to English. */
export function asPreferredLanguage(value: unknown): PreferredLanguage {
  return value === 'es' ? 'es' : 'en'
}
