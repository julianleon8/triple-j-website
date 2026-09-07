import { createClient } from '@/lib/supabase/server'
import { PasskeyManager, type Passkey } from './PasskeyManager'

export const dynamic = 'force-dynamic'

/**
 * Fetches the owner's passkeys server-side and hands them to the client
 * component, mirroring how /hq/settings/notifications seeds DevicesList.
 *
 * Passkey reads are authorized by the caller's own access token, so this uses
 * the cookie-bound client — never the service-role one.
 */
export default async function PasskeysSettingsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.passkey.list().catch(() => ({ data: [] }))

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section>
        <h2 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
          Passkeys
        </h2>
        <PasskeyManager initial={(data ?? []) as Passkey[]} />
      </section>
    </div>
  )
}
