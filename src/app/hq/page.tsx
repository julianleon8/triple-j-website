export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import LeadsTable from './components/LeadsTable'

export default async function DashboardPage() {
  const { data: leads } = await getAdminClient()
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const counts = {
    new: leads?.filter(l => l.status === 'new').length ?? 0,
    contacted: leads?.filter(l => l.status === 'contacted').length ?? 0,
    quoted: leads?.filter(l => l.status === 'quoted').length ?? 0,
    won: leads?.filter(l => l.status === 'won').length ?? 0,
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leads</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'New', count: counts.new, style: 'bg-blue-50 border-blue-200 text-blue-800' },
          { label: 'Contacted', count: counts.contacted, style: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
          { label: 'Quoted', count: counts.quoted, style: 'bg-purple-50 border-purple-200 text-purple-800' },
          { label: 'Won', count: counts.won, style: 'bg-green-50 border-green-200 text-green-800' },
        ].map(({ label, count, style }) => (
          <div key={label} className={`rounded-xl border p-4 ${style}`}>
            <div className="text-3xl font-bold">{count}</div>
            <div className="text-sm font-medium mt-1">{label}</div>
          </div>
        ))}
      </div>

      <LeadsTable initialLeads={leads ?? []} />
    </div>
  )
}
