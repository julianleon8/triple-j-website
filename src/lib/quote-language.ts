import { cache } from 'react'

import type { Locale } from '@/i18n/config'
import { asPreferredLanguage } from '@/lib/preferred-language'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * The language of the customer a quote link belongs to (migration 034), for
 * the public /quotes/[token] page and its root layout's `<html lang>`.
 * `customers(*)` rather than the column by name, so the read still works
 * before the migration (it then answers English). Cached per request: the
 * layout and the page both ask.
 */
export const quoteLanguage = cache(async (token: string): Promise<Locale> => {
  const { data } = await getAdminClient()
    .from('quotes')
    .select('customers(*)')
    .eq('accept_token', token)
    .maybeSingle()
  const customers = (data as { customers?: unknown } | null)?.customers
  const customer = (Array.isArray(customers) ? customers[0] : customers) as { preferred_language?: string | null } | null | undefined
  return asPreferredLanguage(customer?.preferred_language)
})
