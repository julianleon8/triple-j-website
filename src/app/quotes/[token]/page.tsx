import { getAdminClient } from '@/lib/supabase/admin'
import QuoteAcceptView from './components/QuoteAcceptView'
import { QUOTES } from '@/i18n/copy/quotes'
import { quoteLanguage } from '@/lib/quote-language'
import { SITE } from '@/lib/site'

export default async function QuotePublicPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const locale = await quoteLanguage(token)
  const t = QUOTES[locale].accept

  // Column-scoped on purpose. `select('*')` would ship every quote column into
  // the RSC payload the customer's browser receives — including `internal_notes`,
  // which QuoteWizard packs with the calculator's cost + margin JSON. Never widen
  // this to '*'; add columns explicitly as the view needs them.
  const { data: quote, error } = await getAdminClient()
    .from('quotes')
    // Must stay a single string literal — supabase-js infers the row type by
    // parsing this at compile time, and concatenation defeats that.
    .select('id, quote_number, status, total, valid_until, notes, customers(name), quote_line_items(id, description, quantity, unit_price, total_price, sort_order)')
    .eq('accept_token', token)
    .order('sort_order', { referencedTable: 'quote_line_items', ascending: true })
    .single()

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.notFoundTitle}</h1>
          <p className="text-gray-500 text-sm">{t.notFoundBody}</p>
          <p className="text-gray-400 text-xs mt-4">
            {t.notFoundHelp} <a href={SITE.phoneHref} className="underline">{SITE.phone}</a>
          </p>
        </div>
      </div>
    )
  }

  // Without generated DB types, supabase-js infers embedded relations as arrays.
  // `customers` is a to-one FK and comes back as a single object at runtime, so
  // normalize both shapes rather than casting the whole row.
  const customers = Array.isArray(quote.customers)
    ? quote.customers[0] ?? null
    : quote.customers

  return <QuoteAcceptView quote={{ ...quote, customers }} token={token} locale={locale} />
}
