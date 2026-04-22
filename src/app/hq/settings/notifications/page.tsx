import { getAdminClient } from '@/lib/supabase/admin'
import { PushOptIn } from '@/components/hq/PushOptIn'
import { DevicesList, type Device } from './DevicesList'

export const dynamic = 'force-dynamic'

export default async function NotificationsSettingsPage() {
  const { data: subs } = await getAdminClient()
    .from('push_subscriptions')
    .select('id, endpoint, user_agent, created_at')
    .order('created_at', { ascending: false })

  const devices: Device[] = (subs ?? []).map((s: { id: string; endpoint: string; user_agent: string | null; created_at: string }) => ({
    id: s.id,
    endpoint: s.endpoint,
    userAgent: s.user_agent,
    createdAt: s.created_at,
  }))

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <PushOptIn />

      <section>
        <h2 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
          Registered devices
        </h2>
        <DevicesList initial={devices} />
      </section>
    </div>
  )
}
