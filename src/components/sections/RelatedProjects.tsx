import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getAdminClient } from '@/lib/supabase/admin';

const MATCHES: Record<string, { type: string; tag?: string }> = {
  carports: { type: 'Carport' },
  'metal-garages': { type: 'Garage' },
  barns: { type: 'Barn' },
  'rv-covers': { type: 'RV Cover' },
  'turnkey-carports-with-concrete': { type: 'Carport', tag: 'Turnkey' },
};

export async function RelatedProjects({ service }: { service: string }) {
  const match = MATCHES[service];
  if (!match) return null;
  try {
    let query = getAdminClient().from('gallery_items')
      .select('id,title,city,gallery_photos!inner(image_url,alt_text,is_cover,sort_order)')
      .eq('is_active', true).eq('type', match.type)
      .order('is_featured', { ascending: false }).order('sort_order', { ascending: true })
      .limit(3);
    if (match.tag) query = query.eq('tag', match.tag);
    const { data, error } = await query;
    if (error || !data?.length) return null;
    return (
      <section aria-labelledby="related-projects-heading" className="bg-paper-2 py-14 md:py-20">
        <Container size="wide">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Built by Triple J</p>
          <h2 id="related-projects-heading" className="mt-3 text-ink-900">See what this could look like.</h2>
          <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((project) => {
              const photos = [...project.gallery_photos].sort((a, b) => a.sort_order - b.sort_order);
              const photo = photos.find((p) => p.is_cover) ?? photos[0];
              if (!photo) return null;
              return (
                <Link key={project.id} href={`/gallery/${project.id}`} className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-ink-100">
                    <Image src={photo.image_url} alt={photo.alt_text || project.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform motion-safe:group-hover:scale-105" />
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-wider text-ink-500">{project.city}</p>
                  <h3 className="mt-1 text-xl text-ink-900">{project.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-brand-700">View this build →</p>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
    );
  } catch {
    // Optional portfolio proof must not prevent a service page from rendering.
    return null;
  }
}
