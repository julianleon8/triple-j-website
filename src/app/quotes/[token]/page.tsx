import { getAdminClient } from '@/lib/supabase/admin'
import QuoteAcceptView from './components/QuoteAcceptView'

export default async function QuotePublicPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const { data: quote, error } = await getAdminClient()
    .from('quotes')
    .select('*, customers(name), quote_line_items(*)')
    .eq('accept_token', token)
    .single()

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h1>
          <p className="text-gray-500 text-sm">This quote link is invalid or has expired.</p>
          <p className="text-gray-400 text-xs mt-4">
            Need help? Call <a href="tel:+12543467764" className="underline">254-346-7764</a>
          </p>
        </div>
      </div>
    )
  }

  return <QuoteAcceptView quote={quote} token={token} />
}
