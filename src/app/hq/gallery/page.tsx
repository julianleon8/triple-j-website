import { getAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '../components/PageHeader'
import GalleryManager from './components/GalleryManager'

export const dynamic = 'force-dynamic'

export default async function DashboardGalleryPage() {
  const { data: items } = await getAdminClient()
    .from('gallery_items')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <PageHeader
        eyebrow="Marketing"
        title="Gallery"
        subtitle="Upload project photos and manage what appears on the public gallery page."
      />
      <GalleryManager initialItems={items ?? []} />
    </div>
  )
}
