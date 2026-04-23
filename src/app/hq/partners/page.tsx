import { getAdminClient } from '@/lib/supabase/admin'
import { PartnerInquiriesTable } from './components/PartnerInquiriesTable'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Partner Inquiries' }

export type PartnerInquiry = {
  id: string
  created_at: string
  updated_at: string
  company_name: string
  company_type: string
  contact_name: string
  contact_role: string | null
  email: string
  phone: string | null
  message: string
  estimated_volume: string | null
  referral_source: string | null
  status: 'new' | 'contacted' | 'engaged' | 'declined'
  notes: string | null
}

export default async function PartnersHqPage() {
  const { data: inquiries } = await getAdminClient()
    .from('partner_inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="sr-only md:not-sr-only md:text-lg md:font-bold md:text-(--text-primary)">
          Partner Inquiries
        </h1>
        <span className="text-xs text-(--text-tertiary)">
          {(inquiries ?? []).length} total
        </span>
      </div>
      <PartnerInquiriesTable initialInquiries={(inquiries ?? []) as PartnerInquiry[]} />
    </div>
  )
}
