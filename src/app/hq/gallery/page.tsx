import { getAdminClient } from '@/lib/supabase/admin'
import GalleryManager from './components/GalleryManager'

export const dynamic = 'force-dynamic'

export default async function DashboardGalleryPage() {
  const { data: items } = await getAdminClient()
    .from('gallery_items')
    .select(
      `
      *,
      gallery_photos ( id, image_url, alt_text, sort_order, is_cover )
      `,
    )
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload project photos and manage what appears on the public gallery page.
        </p>
      </div>
      <GalleryManager initialItems={items ?? []} />
    </div>
  )
}
