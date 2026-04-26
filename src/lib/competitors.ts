/**
 * Competitor catalog for /alternatives/[slug] and the local roundup page.
 *
 * Two categories:
 *   - 'national-kit'  — ship-and-assemble kit dealers (Eagle, Get, Carport
 *     Central, Viking, Infinity). Triple J's primary keyword competition.
 *   - 'local'         — Central Texas builders (sourced from Yelp by user
 *     2026-04-26). Listed honestly in the roundup, NOT in head-to-head
 *     comparisons (would feel petty since we share a market).
 *
 * Data accuracy guideline (per /seo-competitor-pages skill):
 *   Every claim about a competitor must be verifiable from their public
 *   website or a cited review source. Update quarterly or when competitors
 *   ship major changes. The `homeUrl` field powers in-page citation links.
 *
 * Pricing intentionally absent — the no-public-pricing rule (Decisions.md
 * 2026-04-21) is in effect until Hearth Financial Services integrates.
 *   // TODO(hearth): add 'monthly_financing' field per competitor once
 *   // Hearth integrates so the comparison table can render an
 *   // "Affordable monthly payments — as low as $X/mo" row.
 */

export type CompetitorSlug =
  | 'eagle-carports'
  | 'get-carports'
  | 'carport-central'
  | 'viking-steel'
  | 'infinity-carports'
  | 'rough-country-carports'
  | 'le-metal'
  | 'texas-custom-carports'
  | 'a-plus-sheds-carports'
  | 'premier-portables'
  | 'temple-steel-buildings'
  | 'triple-j-metal'

export type CompetitorType = 'national-kit' | 'local' | 'self'

export type Competitor = {
  slug: CompetitorSlug
  name: string
  type: CompetitorType
  /** Public homepage — used for citation links + schema sameAs. */
  homeUrl: string
  /** 1-line honest description. Avoid disparaging adjectives. */
  oneLiner: string
  /** Service area as best we can determine from their public site. */
  coverage: string
  /** When was this entry last verified against the competitor's public info? */
  asOf: string
}

export const COMPETITORS: Record<CompetitorSlug, Competitor> = {
  'eagle-carports': {
    slug: 'eagle-carports',
    name: 'Eagle Carports',
    type: 'national-kit',
    homeUrl: 'https://www.eaglecarports.com/',
    oneLiner: 'National metal carport manufacturer with a dealer network covering 40+ states.',
    coverage: '40+ U.S. states via independent dealer network',
    asOf: '2026-04-26',
  },
  'get-carports': {
    slug: 'get-carports',
    name: 'Get Carports',
    type: 'national-kit',
    homeUrl: 'https://www.getcarports.com/',
    oneLiner: 'Online configurator for prefab metal carports, garages, and barns shipped nationwide.',
    coverage: 'Continental U.S. via shipping + dealer install',
    asOf: '2026-04-26',
  },
  'carport-central': {
    slug: 'carport-central',
    name: 'Carport Central',
    type: 'national-kit',
    homeUrl: 'https://www.carportcentral.com/',
    oneLiner: 'Online retailer of prefab steel carports, garages, and metal buildings.',
    coverage: 'Continental U.S. via shipping + dealer install',
    asOf: '2026-04-26',
  },
  'viking-steel': {
    slug: 'viking-steel',
    name: 'Viking Steel Structures',
    type: 'national-kit',
    homeUrl: 'https://www.vikingsteelstructures.com/',
    oneLiner: 'Online prefab steel structure retailer covering 48 states.',
    coverage: '48 states via shipping + dealer install',
    asOf: '2026-04-26',
  },
  'infinity-carports': {
    slug: 'infinity-carports',
    name: 'Infinity Carports',
    type: 'national-kit',
    homeUrl: 'https://www.infinityoutdoorbuildings.com/',
    oneLiner: 'Online metal building configurator with a multi-state dealer network.',
    coverage: 'Multi-state U.S. via dealer network',
    asOf: '2026-04-26',
  },
  'rough-country-carports': {
    slug: 'rough-country-carports',
    name: 'Rough Country Carports & Components',
    type: 'local',
    homeUrl: 'https://www.yelp.com/biz/rough-country-carports-and-components-temple',
    oneLiner: 'Temple-based custom metal carports, RV covers, garages, and barns with on-site estimates.',
    coverage: 'Temple, TX area',
    asOf: '2026-04-26',
  },
  'le-metal': {
    slug: 'le-metal',
    name: 'L&E Metal',
    type: 'local',
    homeUrl: 'https://www.yelp.com/search?find_desc=L%26E+Metal&find_loc=Temple%2C+TX',
    oneLiner: 'Temple installer of custom-sized carports (e.g., 20x20x10) noted by reviewers for prompt scheduling.',
    coverage: 'Temple, TX area',
    asOf: '2026-04-26',
  },
  'texas-custom-carports': {
    slug: 'texas-custom-carports',
    name: 'Texas Custom Carports and Patios',
    type: 'local',
    homeUrl: 'https://www.yelp.com/search?find_desc=Texas+Custom+Carports+and+Patios&find_loc=Belton%2C+TX',
    oneLiner: 'Belton-based builder of custom steel carports and patio covers, with experience in residential backyard installs.',
    coverage: 'Belton, TX area',
    asOf: '2026-04-26',
  },
  'a-plus-sheds-carports': {
    slug: 'a-plus-sheds-carports',
    name: 'A+ Sheds and Carports',
    type: 'local',
    homeUrl: 'https://www.yelp.com/search?find_desc=A%2B+Sheds+and+Carports&find_loc=Temple%2C+TX',
    oneLiner: 'Temple reseller of Derksen Buildings and Superior Carports product lines.',
    coverage: 'Temple, TX area',
    asOf: '2026-04-26',
  },
  'premier-portables': {
    slug: 'premier-portables',
    name: 'Premier Portables',
    type: 'local',
    homeUrl: 'https://www.yelp.com/search?find_desc=Premier+Portables&find_loc=Temple%2C+TX',
    oneLiner: 'Temple provider of on-site custom-built sheds, carports, and patios.',
    coverage: 'Temple, TX area',
    asOf: '2026-04-26',
  },
  'temple-steel-buildings': {
    slug: 'temple-steel-buildings',
    name: 'Temple Steel Buildings',
    type: 'local',
    homeUrl: 'https://templesteelbuildingsintx.com/',
    oneLiner:
      'Temple-based steel building + barndominium builder led by Brice Evans, with 15+ years in welding and metal building.',
    coverage: 'Temple, TX area',
    asOf: '2026-04-26',
  },
  'triple-j-metal': {
    slug: 'triple-j-metal',
    name: 'Triple J Metal',
    type: 'self',
    homeUrl: 'https://www.triplejmetaltx.com/',
    oneLiner:
      'Temple, TX family-owned metal building contractor — welded or bolted red iron steel, turnkey concrete, same-week installs across Bell + neighboring counties.',
    coverage: 'Bell, McLennan, Coryell, Williamson, Lampasas, Falls, Milam, Burnet counties (90-minute radius from Temple)',
    asOf: '2026-04-26',
  },
}

/**
 * Comparison row — represents one feature/dimension across multiple
 * competitors. `cells` is keyed by CompetitorSlug; values are either:
 *   - 'yes' / 'no' / 'partial' / 'unknown'   → renders as a status icon
 *   - { status, note }                       → status icon + small caption
 */
export type CellStatus = 'yes' | 'no' | 'partial' | 'unknown'
export type ComparisonCell = CellStatus | { status: CellStatus; note: string }

export type ComparisonRow = {
  /** Short label shown in the leftmost column. */
  label: string
  /** Optional context tooltip / sub-label shown under the label. */
  description?: string
  /** Cell value per competitor. Missing keys render as 'unknown'. */
  cells: Partial<Record<CompetitorSlug, ComparisonCell>>
}

// TODO(hearth): once Hearth Financial Services integrates, append a
// "Monthly financing" row to NATIONAL_KIT_COMPARISON_ROWS and to
// LOCAL_ROUNDUP_COMPARISON_ROWS with cells like:
//   { status: 'yes', note: 'as low as $X/mo' }  // Triple J
//   'unknown' or 'no'                            // most national kits

/** Comparison rows used on /alternatives/[national-kit-slug] pages. */
export const NATIONAL_KIT_COMPARISON_ROWS = (
  competitorSlug: CompetitorSlug,
): ComparisonRow[] => [
  {
    label: 'Install crew shows up',
    description: 'Do they actually build it on your property, or just ship a kit?',
    cells: {
      [competitorSlug]: { status: 'no', note: 'Customer arranges install' },
      'triple-j-metal': { status: 'yes', note: 'Our welded crew, every job' },
    },
  },
  {
    label: 'Welded steel option',
    description: 'On-site welded red iron, not a bolted-only kit.',
    cells: {
      [competitorSlug]: { status: 'no', note: 'Bolted kit only' },
      'triple-j-metal': 'yes',
    },
  },
  {
    label: 'Concrete pad in the same contract',
    description: 'One company pours your slab — no separate concrete contractor.',
    cells: {
      [competitorSlug]: { status: 'no', note: 'Customer arranges' },
      'triple-j-metal': { status: 'yes', note: '4,000 PSI' },
    },
  },
  {
    label: 'Same-week scheduling',
    description: 'On-site within days of contract signing, not 4–16 weeks.',
    cells: {
      [competitorSlug]: { status: 'partial', note: 'Typically 4–16 weeks' },
      'triple-j-metal': 'yes',
    },
  },
  {
    label: 'Permitting help',
    description: 'We pull permits in Bell, Coryell, McLennan, Williamson counties.',
    cells: {
      [competitorSlug]: 'no',
      'triple-j-metal': 'yes',
    },
  },
  {
    label: 'Custom dimensions',
    description: 'Any width / length / height — not a fixed catalog SKU.',
    cells: {
      [competitorSlug]: 'partial',
      'triple-j-metal': 'yes',
    },
  },
  {
    label: 'Local crew you can call',
    description: 'Texas phone, Texas crew — not a national 800 number.',
    cells: {
      [competitorSlug]: { status: 'no', note: 'National support line' },
      'triple-j-metal': { status: 'yes', note: '254-346-7764' },
    },
  },
  {
    label: 'Coverage area',
    cells: {
      [competitorSlug]: { status: 'yes', note: 'National via dealers' },
      'triple-j-metal': { status: 'partial', note: '90-min radius from Temple' },
    },
  },
]

/** Comparison rows used on the local roundup page. Row labels reflect what
 *  matters when picking among local builders, not vs. national kits. */
export const LOCAL_ROUNDUP_COMPARISON_ROWS: ComparisonRow[] = [
  {
    label: 'Welded steel option',
    cells: {
      'triple-j-metal': 'yes',
      'rough-country-carports': 'unknown',
      'le-metal': 'unknown',
      'texas-custom-carports': 'unknown',
      'a-plus-sheds-carports': 'unknown',
      'premier-portables': 'unknown',
      'temple-steel-buildings': { status: 'yes', note: '15+ yrs welding' },
    },
  },
  {
    label: 'Bolted steel option',
    cells: {
      'triple-j-metal': 'yes',
      'rough-country-carports': 'yes',
      'le-metal': 'yes',
      'texas-custom-carports': 'yes',
      'a-plus-sheds-carports': 'yes',
      'premier-portables': 'yes',
      'temple-steel-buildings': 'unknown',
    },
  },
  {
    label: 'Concrete pad in same contract',
    cells: {
      'triple-j-metal': { status: 'yes', note: '4,000 PSI' },
      'rough-country-carports': 'unknown',
      'le-metal': 'unknown',
      'texas-custom-carports': 'unknown',
      'a-plus-sheds-carports': 'unknown',
      'premier-portables': 'unknown',
      'temple-steel-buildings': 'unknown',
    },
  },
  {
    label: 'Custom barns + garages + RV covers',
    cells: {
      'triple-j-metal': 'yes',
      'rough-country-carports': 'yes',
      'le-metal': 'partial',
      'texas-custom-carports': 'partial',
      'a-plus-sheds-carports': 'yes',
      'premier-portables': 'yes',
      'temple-steel-buildings': { status: 'yes', note: 'Barndominiums' },
    },
  },
  {
    label: 'Same-week scheduling',
    cells: {
      'triple-j-metal': 'yes',
      'rough-country-carports': 'unknown',
      'le-metal': { status: 'yes', note: 'Per Yelp reviews' },
      'texas-custom-carports': 'unknown',
      'a-plus-sheds-carports': 'unknown',
      'premier-portables': 'unknown',
      'temple-steel-buildings': 'unknown',
    },
  },
  {
    label: 'Hablamos Español',
    cells: {
      'triple-j-metal': 'yes',
      'rough-country-carports': 'unknown',
      'le-metal': 'unknown',
      'texas-custom-carports': 'unknown',
      'a-plus-sheds-carports': 'unknown',
      'premier-portables': 'unknown',
      'temple-steel-buildings': 'unknown',
    },
  },
]

/** All alternatives slugs (drives generateStaticParams on the dynamic route). */
export const ALTERNATIVES_SLUGS = [
  'eagle-carports',
  'get-carports',
  'carport-central',
  'national-kit-dealers',
] as const

export type AlternativesSlug = (typeof ALTERNATIVES_SLUGS)[number]

/**
 * Page-level content for each /alternatives/[slug] page. Keeping copy in the
 * data file (vs. inline in page.tsx) keeps the route logic thin — the page
 * just renders sections from data.
 */
export type AlternativesPageContent = {
  slug: AlternativesSlug
  /** Competitor slugs to compare against in the table. For the consolidated
   *  national-kit-dealers page, this is all 5 national-kit competitors. */
  competitorSlugs: CompetitorSlug[]
  /** SEO title (template appends " | Triple J Metal"). */
  metaTitle: string
  /** SEO description, ≤155 chars. */
  metaDescription: string
  /** Hero H1. Should match target keyword. */
  h1: string
  heroSubhead: string
  /** TL;DR verdict — 2-3 sentences shown in a callout box under the hero. */
  tldr: string
  /** "Why people compare these" — 1 paragraph setting the search intent. */
  whyCompare: string
  /** "When [competitor] is the right pick" — honest section that builds
   *  trust + reduces legal risk. 2-3 sentences. */
  whenCompetitorWins: string
  /** "When Triple J is the better fit" — 4-5 bullets. */
  whenTripleJWins: string[]
  /** Written breakdown sections — each becomes an h2 + 1-2 paragraphs.
   *  Use {COMP} as a placeholder for the competitor name (gets replaced
   *  at render time so the consolidated page can substitute "national kit
   *  dealers" while individual pages substitute the real brand). */
  breakdownSections: Array<{ heading: string; body: string }>
}

export const ALTERNATIVES_CONTENT: Record<AlternativesSlug, AlternativesPageContent> = {
  'eagle-carports': {
    slug: 'eagle-carports',
    competitorSlugs: ['eagle-carports', 'triple-j-metal'],
    metaTitle: 'Eagle Carports Alternatives in Central Texas',
    metaDescription:
      'Looking for an Eagle Carports alternative in Bell County? Triple J Metal builds welded or bolted carports same-week, with concrete in the same contract. Temple, TX local crew.',
    h1: 'Eagle Carports Alternatives in Central Texas',
    heroSubhead:
      'You searched Eagle and ended up here because you want someone who actually shows up. Triple J Metal is Temple, TX based — we weld or bolt your structure on your property and pour the concrete pad in the same contract.',
    tldr:
      'Eagle Carports is a national kit manufacturer that ships through a dealer network. Triple J Metal is a local Central Texas builder — we install with our own crew, offer welded red iron steel, and include the concrete pad. If you want a kit you can pick up, Eagle works. If you want it built and ready to use, Triple J fits better.',
    whyCompare:
      "Both companies make metal carports — but the business models are different. Eagle is a manufacturer that sells through a network of dealers and installers. Triple J is the crew that builds the structure on your property, end to end, with one contract and one phone number. Customers usually compare the two when they want a real answer to 'who shows up' and 'is the concrete pad included.'",
    whenCompetitorWins:
      "If you're outside Central Texas, Eagle's national dealer network covers more zip codes than Triple J Metal does. If you only want a bolted kit at the absolute lowest sticker price and you have your own crew or contractor lined up to install, Eagle's catalog is broad and well-priced for that use case. We're not the right fit for those buyers.",
    whenTripleJWins: [
      "You're in Bell, Coryell, McLennan, Williamson, Lampasas, Falls, Milam, or Burnet county — within our 90-minute build radius from Temple, TX.",
      'You want a welded red iron structure (a permanent real-estate improvement), not a bolted kit that can rattle in Texas storms.',
      'You want the concrete pad poured in the same contract — no second contractor, no second invoice, no scheduling gap between concrete cure and structure install.',
      "You need it built same-week, not in 4–16 weeks. We schedule within days of contract signing and most carports finish in one working day.",
      'You want a local Texas phone number that goes to the actual crew, plus permitting help in our home counties.',
    ],
    breakdownSections: [
      {
        heading: 'Manufacturing model vs. building model',
        body:
          'Eagle Carports manufactures and ships steel kits through a dealer network — the Eagle staff designs and builds the components, but the dealer (or you) handles installation on your property. Triple J Metal is the installation crew. We weld or bolt your structure on-site, pour the concrete pad if you need one, and clean up before we leave. Different services, different price profiles, different decisions for the customer.',
      },
      {
        heading: 'Welded vs. bolted',
        body:
          "Eagle Carports' standard product line is bolted steel — components ship pre-fabricated and the installer assembles them with bolts on your property. That works for many use cases. Triple J's flagship offering is welded red iron — we run a Miller Bobcat welder on-site and weld the joints, which produces a permanent structure rated for higher wind loads. We also offer bolted as our budget option. The right choice depends on your priorities: bolted is faster and cheaper, welded is permanent and storm-rated.",
      },
      {
        heading: 'Concrete pad — separate contractor vs. one contract',
        body:
          'When customers buy through Eagle, the slab (if needed) is usually a separate purchase from a different concrete contractor — the customer manages the schedule between concrete cure and steel install. Triple J Metal handles both in the same contract: we pour 4,000 PSI concrete (Central Texas\' Blackland Prairie clay needs the higher PSI) and our crew is on-site to install once it cures. One company, one phone call, one invoice.',
      },
      {
        heading: 'Same-week scheduling vs. 4–16 weeks',
        body:
          "Eagle's typical lead time, per their public order flow, runs several weeks from order to install — manufacturing + shipping + dealer scheduling. Triple J's lead time is measured in days for most residential carports. We control the schedule because we manufacture, transport, and install in-house with our own crew.",
      },
    ],
  },
  'get-carports': {
    slug: 'get-carports',
    competitorSlugs: ['get-carports', 'triple-j-metal'],
    metaTitle: 'Get Carports Alternatives in Central Texas',
    metaDescription:
      'Compare Get Carports to a Central Texas local builder. Triple J Metal welds or bolts on-site, includes concrete, and schedules same-week from Temple, TX.',
    h1: 'Get Carports Alternatives in Central Texas',
    heroSubhead:
      'Get Carports is an online configurator for prefab steel structures. If you want a local crew that pours concrete and builds same-week instead, Triple J Metal serves Bell + neighboring counties from Temple, TX.',
    tldr:
      "Get Carports is a national online retailer. You configure your structure on their site and a partner installer delivers it. Triple J Metal is the installer — we build directly, with welded steel as a flagship option and concrete pads in the same contract. If you want a configurator and don't mind coordinating dealers, Get works. If you want one company doing the whole job, Triple J fits.",
    whyCompare:
      "Both Get Carports and Triple J Metal will end with steel on your property. The difference is who handles the work in between. Get Carports is the catalog and the manufacturer relationship. Triple J Metal is the crew, the welder, the concrete pour, and the call-back. People compare when they realize the 'who shows up' question matters more than the catalog.",
    whenCompetitorWins:
      "If you live outside Central Texas or want to compare configurations across many regional installers, Get Carports' online tooling covers more variations than we publish. If you want only a bolted kit and you have your own slab and your own assembly help, Get's catalog is broader than Triple J's.",
    whenTripleJWins: [
      "You're in our Bell County build radius (90 min from Temple, TX).",
      'You want welded red iron — Get Carports primarily ships bolted kits.',
      "You don't want to coordinate the slab and the steel as two separate jobs.",
      "You'd rather have one Texas phone number than a national support line.",
      'You need it on-site this week, not in 4–8 weeks.',
    ],
    breakdownSections: [
      {
        heading: 'Online retailer vs. local installer',
        body:
          "Get Carports is essentially a configurator + dealer-network business — you spec your structure online, pay a deposit, and a regional installer in their network handles delivery and assembly. Triple J Metal is the installer side of that equation, but for our own customers we're also the manufacturer relationship and the concrete contractor. One contract, one crew, one schedule.",
      },
      {
        heading: 'Welded vs. bolted',
        body:
          "Get Carports' product line is primarily bolted steel — assembled on-site by the installer using their hardware. That's a fine product for many residential carports. Triple J's flagship welded red iron carport is a different category — a permanent structure with on-site Miller Bobcat-welded joints, rated for higher wind loads. We offer bolted as the budget option for customers who want a kit-style price; welded is for customers treating the carport as a long-term real estate improvement.",
      },
      {
        heading: 'Concrete pad — your contractor vs. ours',
        body:
          "When you order through Get Carports, the slab is your job — you arrange a local concrete contractor, manage the schedule between cure and install, and handle that invoice separately. With Triple J, both the concrete pad (4,000 PSI for Central Texas' clay soil) and the steel structure are in the same contract. You make one decision, write one check, and one company answers when you call.",
      },
      {
        heading: 'Lead time',
        body:
          "Get Carports' typical lead time depends on the regional installer and current factory load — historically several weeks from configuration to install. Triple J's lead time is measured in days because we control the manufacturing relationship, the truck, the crew, and the calendar. Same-week installs are normal for residential carports; larger structures take 2–3 days on-site.",
      },
    ],
  },
  'carport-central': {
    slug: 'carport-central',
    competitorSlugs: ['carport-central', 'triple-j-metal'],
    metaTitle: 'Carport Central Alternatives in Central Texas',
    metaDescription:
      'Carport Central ships nationwide. Triple J Metal builds locally — welded or bolted, concrete included, same-week from Temple, TX. Compare side-by-side.',
    h1: 'Carport Central Alternatives in Central Texas',
    heroSubhead:
      'Carport Central is a national online retailer for prefab steel buildings. Triple J Metal is the local crew Bell County customers call when they want concrete + steel + install handled by one company.',
    tldr:
      "Carport Central is a national catalog retailer — you order online, they ship + arrange install through dealers. Triple J Metal is the installer + concrete contractor + manufacturer relationship for Central Texas customers, all under one contract. If you want a wide online catalog with no local relationship, Carport Central works. If you want one company that does the whole job in your county, Triple J Metal is the fit.",
    whyCompare:
      "Customers comparing Carport Central and Triple J Metal are usually deciding between 'national catalog with dealer install' and 'local crew with concrete in the contract.' Both deliver steel structures. The decision is about who manages the project end-to-end and how fast it lands.",
    whenCompetitorWins:
      "If you're outside our 90-minute build radius from Temple, TX, Carport Central's national network covers more area than we do. If you specifically want to browse a very wide product catalog online and pick the cheapest bolted kit available, Carport Central has more variety than Triple J publishes.",
    whenTripleJWins: [
      "You're in Bell, Coryell, McLennan, Williamson, Lampasas, Falls, Milam, or Burnet county.",
      "You want welded red iron steel — Carport Central's catalog is mostly bolted prefab.",
      "You don't want the concrete pad as a second contract.",
      "You want the work done same-week with a local crew you can call back.",
      'You want permitting help in your home county.',
    ],
    breakdownSections: [
      {
        heading: 'Online catalog vs. one-contract local build',
        body:
          'Carport Central is the catalog. They aggregate prefab structures from manufacturers, take orders online, arrange shipping, and a regional installer handles the on-site work. Triple J Metal is the local crew on the ground in Central Texas. We control the build, the concrete, and the schedule because everything happens with our team. One contract, one phone number, one invoice.',
      },
      {
        heading: 'Welded option',
        body:
          'Carport Central\'s lineup is mostly bolted prefab — components ship and assemble on-site with hardware. Triple J\'s flagship is welded red iron, with bolted available as the budget tier. Welded gives you a permanent structure rated for higher wind loads (relevant for Central Texas storms); bolted is faster and lower cost. Both are valid; the decision should be informed.',
      },
      {
        heading: 'Concrete pad in the same contract',
        body:
          "Through Carport Central, the slab is the customer's responsibility — you arrange a separate concrete contractor and manage scheduling between concrete cure and the installer arriving. Triple J pours the 4,000 PSI slab AND installs the structure under one contract. Central Texas's expansive Blackland Prairie clay needs the higher PSI; we engineer for it.",
      },
      {
        heading: 'Same-week vs. multi-week lead time',
        body:
          "Carport Central's lead time runs several weeks from order through dealer installation. Triple J's residential carports are typically on-site within days of contract signing. We can do this because we own every step — the manufacturing relationship, the truck, the welder, the crew, and the calendar.",
      },
    ],
  },
  'national-kit-dealers': {
    slug: 'national-kit-dealers',
    competitorSlugs: ['eagle-carports', 'get-carports', 'carport-central', 'viking-steel', 'infinity-carports', 'triple-j-metal'],
    metaTitle: 'National Metal Carport Kit Alternatives in Central Texas',
    metaDescription:
      'Compare Eagle, Get Carports, Carport Central, Viking, and Infinity to a Central Texas local builder. Triple J Metal welds, pours concrete, and installs same-week from Temple, TX.',
    h1: 'National Metal Carport Kit Alternatives in Central Texas',
    heroSubhead:
      'Eagle, Get Carports, Carport Central, Viking, and Infinity all sell prefab metal carports nationally. Triple J Metal is the local Central Texas crew that builds with welded steel, pours your concrete pad, and installs same-week from Temple, TX.',
    tldr:
      "All of the major national kit dealers (Eagle, Get Carports, Carport Central, Viking Steel, Infinity) follow a similar model: you configure online, they ship, an installer assembles. Triple J Metal is the local installer + concrete contractor + manufacturer relationship for Central Texas — one contract for the whole job. National kits work for buyers outside our service area or who only need a bolted kit at the lowest possible price. Triple J fits when you want one company that builds, pours, and installs in your county.",
    whyCompare:
      "All five national kit dealers compete on the same axes: price per square foot for bolted prefab, catalog breadth, and dealer network reach. Triple J Metal competes on different axes: welded option, concrete in the contract, same-week installs, and local crew accountability. The comparison usually starts when a Central Texas customer realizes the kit dealers don't actually install — they ship.",
    whenCompetitorWins:
      "If you're outside Central Texas — even by a few hours — any of the national kits cover more zip codes than Triple J does. If you want the cheapest possible bolted carport and you have your own slab + assembly resources, the national catalogs publish broader product lines than we do. We're built for one specific customer: someone in Bell + neighboring counties who wants the whole job done by one local crew.",
    whenTripleJWins: [
      "You're in our 90-minute build radius from Temple, TX (Bell, Coryell, McLennan, Williamson, Lampasas, Falls, Milam, Burnet counties).",
      "You want welded red iron steel — every national kit on this list is primarily bolted.",
      "You want the concrete pad in the same contract — no national kit dealer pours the slab.",
      "You want it built this week — not in the 4–16 week typical national kit window.",
      'You want permitting help in your home county.',
    ],
    breakdownSections: [
      {
        heading: 'How the national kit model works',
        body:
          "Eagle Carports, Get Carports, Carport Central, Viking Steel Structures, and Infinity Carports all run variations on the same business model: customers configure a structure online or via a 1-800 number, the manufacturer fabricates the components, a freight company delivers, and an independent regional installer in the dealer network assembles on-site. Concrete (if needed) is the customer's separate problem — usually a different contractor, a different schedule, a different invoice. The national kit model is efficient at scale and works well for buyers who want a transactional purchase.",
      },
      {
        heading: 'How Triple J Metal works',
        body:
          "Triple J Metal is a Temple, TX family-owned contractor — Juan Luis Leon (founder), Julian Leon Alvarez (operations), and Jose Alfredo 'Freddy' (foreman). When a customer signs with us, our crew handles every step: site visit, concrete pour (4,000 PSI for Central Texas clay), structure fabrication and installation, cleanup. One contract, one phone number, one team that finishes what they start.",
      },
      {
        heading: 'Welded vs. bolted (the real differentiator)',
        body:
          "Every national kit dealer on this list ships primarily bolted prefab steel as their default product. That's an efficient manufacturing model — pre-cut components, assembly hardware, predictable shipping. Triple J Metal's flagship is welded red iron, fabricated with on-site welding for permanent joints rated for higher wind loads. We also offer bolted as a budget option. The welded vs. bolted decision is real and should be made on storm-rating priorities, not just sticker price.",
      },
      {
        heading: 'Concrete is not optional in Central Texas',
        body:
          "Central Texas sits on Blackland Prairie clay — soil that expands when wet and contracts when dry, putting stress on any structure anchored to it. The right concrete pad uses 4,000 PSI mix (not the industry-default 3,000) and is engineered to move with the soil rather than crack. Triple J pours that pad in the same contract as the structure install. National kit dealers leave the pad to a separate concrete contractor, which adds a coordination problem and (often) a less-engineered slab.",
      },
      {
        heading: 'Lead time and accountability',
        body:
          'A typical national kit order takes 4–16 weeks from purchase to install — the manufacturer scheduling slot, the freight, the regional installer\'s calendar. If something goes wrong, you have three or four parties to triangulate. Triple J\'s residential carports are usually on-site within days of contract signing because we control every step in-house. If something goes wrong, you call one number and we fix it.',
      },
    ],
  },
}

/** Helper: return the AlternativesPageContent for a slug, or null. */
export function getAlternativesContent(slug: string): AlternativesPageContent | null {
  if (!ALTERNATIVES_SLUGS.includes(slug as AlternativesSlug)) return null
  return ALTERNATIVES_CONTENT[slug as AlternativesSlug]
}

/** Slugs of the local Bell County competitors used in the roundup. */
export const LOCAL_ROUNDUP_SLUGS: CompetitorSlug[] = [
  'triple-j-metal',
  'rough-country-carports',
  'le-metal',
  'texas-custom-carports',
  'a-plus-sheds-carports',
  'premier-portables',
  'temple-steel-buildings',
]
