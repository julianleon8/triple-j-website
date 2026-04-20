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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <Link
          href="/hq/quotes/new"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm px-4 py-2 rounded-lg transition"
        >
          + New Quote
        </Link>
      </div>
      <QuotesTable quotes={quotes ?? []} />
    </div>
  )
}
