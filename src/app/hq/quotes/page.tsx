export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { ButtonLink } from '@/components/ui/Button'
import { PageHeader } from '../components/PageHeader'
import QuotesTable from './components/QuotesTable'

export default async function QuotesPage() {
  const { data: quotes } = await getAdminClient()
    .from('quotes')
    .select('*, customers(name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        eyebrow="Sales"
        title="Quotes"
        subtitle="Drafts, sent, accepted — every quote in one place."
        actions={
          <ButtonLink href="/hq/quotes/new" size="sm">
            + New Quote
          </ButtonLink>
        }
      />
      <QuotesTable quotes={quotes ?? []} />
    </div>
  )
}
