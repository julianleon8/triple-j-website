export const dynamic = 'force-dynamic'

import { Bell, Database, FlaskConical, Handshake, Link2, ScrollText } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { GroupedList } from '@/components/hq/ui/GroupedList'
import { SignOutButton } from '@/components/hq/SignOutButton'

async function qboStatus(): Promise<'Connected' | 'Not connected'> {
  const { data } = await getAdminClient()
    .from('qbo_tokens')
    .select('id')
    .limit(1)
    .maybeSingle()
  return data ? 'Connected' : 'Not connected'
}

export default async function SettingsHubPage() {
  const qbo = await qboStatus()
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev'
  const builtAt = process.env.VERCEL_DEPLOYMENT_CREATED_AT ?? ''

  return (
    <div className="max-w-2xl mx-auto pt-2">
      <GroupedList
        groups={[
          {
            title: 'Device',
            rows: [
              {
                icon: Bell,
                iconTone: 'bg-rose-500',
                label: 'Notifications',
                sublabel: 'Push alerts for new leads, hot permits, accepted quotes',
                href: '/hq/settings/notifications',
              },
            ],
          },
          {
            title: 'System',
            rows: [
              {
                icon: FlaskConical,
                iconTone: 'bg-violet-500',
                label: 'Testing',
                sublabel: 'Fire test push · test lead · run scrape',
                href: '/hq/settings/testing',
              },
              {
                icon: ScrollText,
                iconTone: 'bg-slate-500',
                label: 'Logs',
                sublabel: 'Email events · delivery + engagement',
                href: '/hq/settings/logs',
              },
            ],
          },
          {
            title: 'Inboxes',
            rows: [
              {
                icon: Handshake,
                iconTone: 'bg-sky-500',
                label: 'Partner Inquiries',
                sublabel: 'B2B referrals from suppliers, manufacturers, GCs',
                href: '/hq/partners',
              },
            ],
          },
          {
            title: 'Integrations',
            rows: [
              {
                icon: Link2,
                iconTone: 'bg-blue-500',
                label: 'QuickBooks',
                href: '/hq/settings/quickbooks',
                trailingValue: qbo,
                trailingValueTone: qbo === 'Connected' ? 'positive' : 'neutral',
              },
            ],
          },
          {
            title: 'About',
            rows: [
              { icon: Database, iconTone: 'bg-(--text-tertiary)', label: 'Version', trailingValue: sha },
              { label: 'Theme', trailingValue: 'Follows iOS system' },
              { label: 'Language', trailingValue: 'English' },
              ...(builtAt ? [{ label: 'Deployed', trailingValue: builtAt }] : []),
            ],
          },
        ]}
        footer={<SignOutButton />}
      />
    </div>
  )
}
