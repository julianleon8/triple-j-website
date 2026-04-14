import { createClient } from '@/lib/supabase/server'

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  quoted: 'bg-purple-100 text-purple-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: leads } = await supabase
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

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
            <tr>
              {['Date', 'Name', 'Phone', 'City', 'Service', 'Type', 'Message', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads?.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No leads yet. They'll show up here as soon as someone fills out the quote form.
                </td>
              </tr>
            )}
            {leads?.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                  {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="px-4 py-3 font-semibold">{lead.name}</td>
                <td className="px-4 py-3">
                  <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline font-mono">
                    {lead.phone}
                  </a>
                </td>
                <td className="px-4 py-3">{lead.city || '—'}</td>
                <td className="px-4 py-3 capitalize">{lead.service_type}</td>
                <td className="px-4 py-3 capitalize">{lead.structure_type || '—'}</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{lead.message || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[lead.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
