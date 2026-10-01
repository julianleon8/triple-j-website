/**
 * /llms.txt and /llms-full.txt — the site summarised for AI search tools.
 *
 * Generated from the data that renders the pages themselves (SITE, SERVICES,
 * LOCATIONS, BLOG_POSTS) so it can never drift from them. It replaced a
 * hand-kept public/llms.txt that, by 2026-10, still promised 4,000 PSI
 * concrete as standard, "4 to 16 week" competitor lead times and permit
 * pulling — all reversed months earlier in Locked Decisions.md.
 *
 * Only the "Key facts" list is written here. Keep it to claims Locked
 * Decisions.md already approves; everything else comes from the data files.
 */
import { BLOG_POSTS } from '@/lib/blog'
import { LOCATIONS } from '@/lib/locations'
import { SERVICES } from '@/lib/services'
import { SITE } from '@/lib/site'

const SUMMARY =
  `Family-owned metal building contractor in ${SITE.address.city}, Texas (legal name ${SITE.legalName}, ` +
  `founded ${SITE.established}). Welded or bolted carports, garages, barns, RV and boat covers, lean-to ` +
  `patios and metal fencing across Central Texas, built by our own crew with same-week scheduling. ` +
  `Concrete available.`

const KEY_FACTS = [
  `Phone: ${SITE.phone} (English and Spanish)`,
  `Email: ${SITE.email}`,
  `Shop: ${SITE.addressOneLine}`,
  `Hours: ${SITE.hours}`,
  `Track record: over ${SITE.stats.projects.replace('+', '')} completed projects for more than ${SITE.stats.clients.replace('+', '')} clients across Central Texas since ${SITE.established}.`,
  'Frame: welded or bolted red iron, the customer’s choice.',
  'Crew: owner-operated, zero subcontractors.',
  'Scheduling: same-week.',
  'Concrete: available on the same contract and priced separately. 3,000 PSI is standard; 4,000 PSI on request.',
  'Turnkey: site prep, concrete and installation on one contract.',
  'Fort Cavazos: 7% military and first-responder discount on every install.',
  'Spanish: Juan and Freddy speak Spanish; Julian speaks English.',
  'Permits: we talk customers through permit requirements.',
  'Quotes: free, with a reply within 24 hours.',
]

/** Pages that are not driven by SERVICES / LOCATIONS / BLOG_POSTS. */
const COMPANY_PAGES = [
  { path: '/quote', title: 'Free quote', note: 'Project type, size and ZIP; reply within 24 hours.' },
  { path: '/gallery', title: 'Project gallery', note: 'Completed and in-progress Triple J builds.' },
  { path: '/military', title: 'Fort Cavazos military', note: 'PCS-timed installs and the 7% military discount.' },
  { path: '/about', title: 'About', note: 'The Leon family and crew behind Triple J Metal.' },
  { path: '/contact', title: 'Contact', note: `Phone, email and shop address in ${SITE.address.city}, TX.` },
  { path: '/partners', title: 'Install partners', note: 'For general contractors and suppliers.' },
]

const GUIDE_PAGES = [
  { path: '/services/colors', title: 'Metal panel colors & finishes' },
  { path: '/services/pbr-vs-pbu-panels', title: 'PBR vs PBU roofing panels' },
  { path: '/services/hybrid-projects', title: 'Hybrid projects: stalls, warehouses, decks' },
]

const link = (base: string, path: string, title: string, note?: string) =>
  `- [${title}](${base}${path})${note ? `: ${note}` : ''}`

function index(base: string, fullLink: boolean): string[] {
  const services = Object.values(SERVICES)
  const cities = Object.values(LOCATIONS)
  return [
    `# ${SITE.name}`,
    '',
    `> ${SUMMARY}`,
    '',
    '## Key facts',
    '',
    ...KEY_FACTS.map((f) => `- ${f}`),
    '',
    '## Services',
    '',
    ...services.map((s) => link(base, `/services/${s.slug}`, s.title, s.metaDescription)),
    ...GUIDE_PAGES.map((p) => link(base, p.path, p.title)),
    '',
    '## Service areas',
    '',
    ...cities.map((l) => link(base, `/locations/${l.slug}`, `${l.name}, TX (${l.county})`, l.metaDescription)),
    '',
    '## Guides',
    '',
    ...BLOG_POSTS.map((p) => link(base, `/blog/${p.slug}`, p.title, p.excerpt)),
    '',
    '## Company',
    '',
    ...COMPANY_PAGES.map((p) => link(base, p.path, p.title, p.note)),
    ...(fullLink
      ? ['', '## Optional', '', link(base, '/llms-full.txt', 'Full text', 'every service and service-area page in one file')]
      : []),
  ]
}

export function buildLlmsTxt(base: string): string {
  return index(base, true).join('\n') + '\n'
}

export function buildLlmsFullTxt(base: string): string {
  const out = index(base, false)

  out.push('', '---', '', '# Services in full')
  for (const s of Object.values(SERVICES)) {
    out.push('', `## ${s.title}`, '', `URL: ${base}/services/${s.slug}`, '', s.heroCopy, '', s.mainBenefit)
    if (s.features.length) {
      out.push('', '### What’s included', '', ...s.features.map((f) => `- **${f.title}.** ${f.description}`))
    }
    out.push('', s.technicalAuthority)
    if (s.faqs.length) {
      out.push('', '### Questions', '')
      for (const f of s.faqs) out.push(`Q: ${f.q}`, `A: ${f.a}`, '')
      out.pop()
    }
  }

  out.push('', '---', '', '# Service areas in full')
  for (const l of Object.values(LOCATIONS)) {
    out.push('', `## ${l.name}, TX`, '', `URL: ${base}/locations/${l.slug} · ${l.county} · ZIP ${l.zip}`)
    out.push('', l.localIntro ?? l.areaContext)
    out.push('', ...(l.whyLocalBullets?.length ? l.whyLocalBullets.map((b) => `- ${b}`) : [l.whyLocal]))
    out.push('', `Services: ${l.services.join('; ')}.`)
    if (l.military) out.push('', l.military.copy)
    if (l.localSource) out.push('', `Local reference: ${l.localSource.url}`)
  }

  return out.join('\n') + '\n'
}
