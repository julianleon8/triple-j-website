export type BlogCategory =
  | 'Guides'
  | 'Local'
  | 'Military'
  | 'HOA'
  | 'Materials'

export type BlogPost = {
  slug: string
  /** Display title — used for the H1 and hero copy */
  title: string
  /** Short SEO title — template appends " | Triple J Metal" (≈17 chars) */
  metaTitle: string
  /** Short SEO description — target ≤155 chars */
  metaDescription: string
  excerpt: string
  /** ISO date string, e.g. "2026-04-15" */
  date: string
  readTime: string
  tags: string[]
  category: BlogCategory
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'welded-vs-bolted-metal-buildings-central-texas',
    title: 'Welded vs Bolted Metal Buildings in Central Texas: What the Storm Data Reveals',
    metaTitle: 'Welded vs Bolted Metal Buildings: Storm Data',
    metaDescription:
      'Central Texas sees 130+ MPH gusts and baseball-sized hail. What welded vs bolted actually means when those storms hit Bell County.',
    excerpt:
      'Central Texas sees 130+ MPH gusts and baseball-sized hail. Here\'s what the difference between a welded and bolted structure actually means when those storms hit Bell County.',
    date: '2026-04-15',
    readTime: '7 min read',
    tags: ['Welded', 'Bolted', 'Wind Rating', 'Materials'],
    category: 'Guides',
  },
  {
    slug: 'bell-county-metal-building-permit-guide-2025',
    title: 'Bell County Metal Building Permit Guide 2025: Temple, Belton & Killeen Requirements',
    metaTitle: 'Bell County Metal Building Permit Guide 2025',
    metaDescription:
      'Who pulls the permit, what size triggers one in Temple vs Killeen, what it costs, and how long it takes. A local contractor\'s walkthrough.',
    excerpt:
      'Who pulls the permit? What size triggers a permit in Temple vs Killeen? What does it cost and how long does it take? A local contractor\'s walkthrough of Bell County requirements.',
    date: '2026-04-15',
    readTime: '6 min read',
    tags: ['Permits', 'Bell County', 'Temple', 'Killeen', 'Belton'],
    category: 'Local',
  },
  {
    slug: 'fort-cavazos-pcs-metal-carport',
    title: 'Fort Cavazos PCS Season: How Military Families Get a Metal Carport on Military Timelines',
    metaTitle: 'Fort Cavazos PCS: Metal Carports on Military Timelines',
    metaDescription:
      'PCS orders don\'t wait. Here\'s how Triple J Metal installs carports on military timelines — from site approval to keys in hand the same week.',
    excerpt:
      'PCS orders don\'t wait. Neither do we. Here\'s how Triple J Metal handles carport installations on military timelines — from site approval to keys in hand the same week.',
    date: '2026-04-15',
    readTime: '5 min read',
    tags: ['Military', 'Fort Cavazos', 'PCS', 'Same-Week', 'Killeen'],
    category: 'Military',
  },
  {
    slug: 'blackland-prairie-soil-metal-building-foundation',
    title: 'Blackland Prairie Soil and Metal Building Foundations: What Central Texas Homeowners Need to Know',
    metaTitle: 'Blackland Prairie Soil & Metal Building Foundations',
    metaDescription:
      'Central Texas black clay heaves, cracks, and shifts slabs if you don\'t account for it. Here\'s how we engineer anchors and pads for this soil.',
    excerpt:
      'The same black clay that makes Central Texas farmland productive will heave, crack, and shift your slab if you don\'t account for it. Here\'s how we engineer anchors and pads for this soil.',
    date: '2026-04-15',
    readTime: '6 min read',
    tags: ['Foundation', 'Concrete', 'Blackland Prairie', 'Soil', 'Anchors'],
    category: 'Local',
  },
  {
    slug: 'hoa-compliant-metal-buildings-heritage-oaks-bella-charca',
    title: 'HOA-Compliant Metal Buildings in Heritage Oaks and Bella Charca: What\'s Actually Allowed',
    metaTitle: 'HOA-Compliant Metal Buildings: Heritage Oaks & Bella Charca',
    metaDescription:
      'Standard utility sheds fail HOA review in Central Texas luxury neighborhoods. What panel types, finishes, and fastener systems actually pass.',
    excerpt:
      'Standard utility sheds fail HOA architectural guidelines in Central Texas luxury neighborhoods. Here\'s what panel types, finishes, and fastener systems actually pass HOA review.',
    date: '2026-04-15',
    readTime: '7 min read',
    tags: ['HOA', 'Heritage Oaks', 'Bella Charca', 'Standing Seam', 'Luxury'],
    category: 'HOA',
  },
]
