export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { CaptureScreen } from './components/CaptureScreen'
import type { FieldKey } from '@/lib/hq/capture-draft'

/**
 * /hq/capture — get a caller into the database before hanging up.
 *
 * Server component so that reopening a draft (?id=…) paints with the real
 * values already in the HTML. That matters more here than anywhere else in HQ:
 * the reason you are reopening this screen is usually that an incoming call
 * killed the PWA, and a spinner at that moment is the app admitting it lost
 * your place.
 */
export default async function CapturePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  let initialFields: Partial<Record<FieldKey, string>> = {}
  let initialNotes = ''
  let leadId: string | null = null

  if (id) {
    const { data } = await getAdminClient()
      .from('leads')
      .select('id, name, phone, email, city, zip, service_type, size_raw, needs_concrete, owner_notes')
      .eq('id', id)
      .maybeSingle<{
        id: string
        name: string | null
        phone: string | null
        email: string | null
        city: string | null
        zip: string | null
        service_type: string | null
        size_raw: string | null
        needs_concrete: string | null
        owner_notes: string | null
      }>()

    if (data) {
      leadId = data.id
      initialNotes = data.owner_notes ?? ''
      initialFields = {
        phone: data.phone ?? '',
        name: data.name ?? '',
        service: data.service_type ?? '',
        size: data.size_raw ?? '',
        email: data.email ?? '',
        // One field on screen, two columns underneath: cityFromZip() is the
        // only thing allowed to populate leads.city, so a ZIP typed here is
        // stored as a ZIP and the city is derived, never guessed.
        city: data.city ?? data.zip ?? '',
        concrete: data.needs_concrete ?? '',
      }
    }
  }

  return <CaptureScreen initialLeadId={leadId} initialFields={initialFields} initialNotes={initialNotes} />
}
