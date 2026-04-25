export const dynamic = 'force-dynamic'

import {
  Activity,
  BarChart3,
  ClipboardList,
  FileText,
  Handshake,
  Settings,
  UserSquare2,
} from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { GroupedList } from '@/components/hq/ui/GroupedList'
import { SignOutButton } from '@/components/hq/SignOutButton'

export default async function MoreHubPage() {
  const db = getAdminClient()

  const [
    { count: hotPermits },
    { count: openCustomers },
    { count: openQuotes },
    { count: newPartnerInquiries },
  ] = await Promise.all([
    db.from('permit_leads').select('id', { count: 'exact', head: true }).in('status', ['new', 'called']),
    db.from('customers').select('id', { count: 'exact', head: true }),
    db.from('quotes').select('id', { count: 'exact', head: true }).in('status', ['draft', 'sent']),
    db.from('partner_inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ])

  return (
    <div className="max-w-2xl mx-auto pt-2">
      <GroupedList
        groups={[
          {
            title: 'Pipeline',
            rows: [
              {
                icon: ClipboardList,
                iconTone: 'bg-indigo-500',
                label: 'Permits',
                href: '/hq/permit-leads',
                badge: hotPermits ? { text: String(hotPermits), tone: 'warn' } : undefined,
              },
              {
                icon: UserSquare2,
                iconTone: 'bg-green-500',
                label: 'Customers',
                href: '/hq/customers',
                badge: openCustomers ? { text: String(openCustomers) } : undefined,
              },
              {
                icon: FileText,
                iconTone: 'bg-amber-500',
                label: 'Quotes',
                href: '/hq/quotes',
                badge: openQuotes ? { text: String(openQuotes) } : undefined,
              },
              {
                icon: Handshake,
                iconTone: 'bg-sky-500',
                label: 'Partners',
                href: '/hq/partners',
                badge: newPartnerInquiries ? { text: String(newPartnerInquiries), tone: 'warn' } : undefined,
              },
            ],
          },
          {
            title: 'Insights',
            rows: [
              {
                icon: BarChart3,
                iconTone: 'bg-(--brand-fg)',
                label: 'Stats',
                sublabel: 'Pipeline · Conversion · Revenue · Operations',
                href: '/hq/more/stats',
              },
              {
                icon: Activity,
                iconTone: 'bg-rose-500',
                label: 'Activity log',
                sublabel: 'Phase 5',
                disabled: true,
              },
            ],
          },
          {
            title: 'System',
            rows: [
              {
                icon: Settings,
                iconTone: 'bg-(--text-tertiary)',
                label: 'Settings',
                href: '/hq/settings',
              },
            ],
          },
        ]}
        footer={<SignOutButton />}
      />
    </div>
  )
}
