export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase/admin'
import QuotesTable from './components/QuotesTable'

export default async function QuotesPage() {
  const { data: quotes } = await getAdminClient()
    .from('quotes')
    .select('*, customers(name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="hidden sm:block text-2xl font-bold">Quotes</h1>
        <Link
          href="/hq/quotes/new"
          className="ml-auto bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm min-h-11 px-4 flex items-center rounded-lg transition"
        >
          + New Quote
        </Link>
      </div>
      <QuotesTable quotes={quotes ?? []} />
    </div>
  )
}
