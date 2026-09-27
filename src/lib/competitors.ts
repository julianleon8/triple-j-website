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
 * Competitor pricing and timelines must be verified for the specific project.
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
export const NATIONAL_KIT_COMPARISON_ROWS = (competitorSlug: CompetitorSlug): ComparisonRow[] => [
  {
    "label": "Installation",
    "description": "Confirm delivery, installation, and site preparation in the written scope.",
    "cells": {
      [competitorSlug]: {
        "status": "unknown",
        "note": "Confirm with provider"
      },
      "triple-j-metal": {
        "status": "yes",
        "note": "Our own crew"
      }
    }
  },
  {
    "label": "Welded or bolted",
    "description": "Ask which structural systems are offered for your design.",
    "cells": {
      [competitorSlug]: {
        "status": "unknown",
        "note": "Confirm with provider"
      },
      "triple-j-metal": {
        "status": "yes",
        "note": "Both available"
      }
    }
  },
  {
    "label": "Concrete",
    "description": "Check whether concrete is included or quoted separately.",
    "cells": {
      [competitorSlug]: {
        "status": "unknown",
        "note": "Confirm with provider"
      },
      "triple-j-metal": {
        "status": "yes",
        "note": "Separately priced; same contract available"
      }
    }
  },
  {
    "label": "Scheduling",
    "description": "Request a current date for your location and site readiness.",
    "cells": {
      [competitorSlug]: {
        "status": "unknown",
        "note": "Confirm with provider"
      },
      "triple-j-metal": {
        "status": "yes",
        "note": "Ask about same-week availability"
      }
    }
  },
  {
    "label": "Permits",
    "description": "Confirm filing and approval responsibilities before work starts.",
    "cells": {
      [competitorSlug]: {
        "status": "unknown",
        "note": "Confirm with provider"
      },
      "triple-j-metal": {
        "status": "yes",
        "note": "Advisory help"
      }
    }
  },
  {
    "label": "Contact",
    "description": "Identify who handles your quote and follow-up.",
    "cells": {
      [competitorSlug]: {
        "status": "unknown",
        "note": "Confirm with provider"
      },
      "triple-j-metal": {
        "status": "yes",
        "note": "Temple-based team"
      }
    }
  }
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
    },
  },
  {
    label: 'Concrete pad in same contract',
    cells: {
      'triple-j-metal': { status: 'yes', note: '3,000 PSI std · 4,000 on request' },
      'rough-country-carports': 'unknown',
      'le-metal': 'unknown',
      'texas-custom-carports': 'unknown',
      'a-plus-sheds-carports': 'unknown',
      'premier-portables': 'unknown',
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
  "eagle-carports": {
    "slug": "eagle-carports",
    "competitorSlugs": [
      "eagle-carports",
      "triple-j-metal"
    ],
    "metaTitle": "Eagle Carports Alternatives in Central Texas",
    "metaDescription": "Compare Eagle Carports with Triple J Metal in Central Texas. Review installation, concrete, design options and scheduling in a written quote.",
    "h1": "Eagle Carports Alternatives in Central Texas",
    "heroSubhead": "Compare complete project scopes. Triple J Metal offers welded or bolted structures installed by our Temple-based crew, with site preparation and concrete available in the same contract.",
    "tldr": "Compare the design, installation, foundation, and total scope before choosing a builder. Triple J Metal offers a direct relationship with a local crew. Ask each provider to confirm what is included for your address and project.",
    "whyCompare": "A building price is only useful when the scope is clear. Check dimensions, framing, roof and wall panels, doors, anchoring, delivery, installation, concrete, taxes, and any required approvals. Different quotes may cover different work.",
    "whenCompetitorWins": "Consider Eagle Carports when its service area, available designs, and written proposal fit your project. Confirm current installation arrangements, exclusions, warranty terms, and scheduling directly with the provider.",
    "whenTripleJWins": [
      "You want a Temple-based crew serving Central Texas.",
      "You want to compare welded and bolted red iron options.",
      "You want site prep and a separately priced concrete pad available in the same contract.",
      "You want to discuss your preferred timeline directly with the team.",
      "You prefer to discuss your project in English or Spanish."
    ],
    "breakdownSections": [
      {
        "heading": "Compare installation scope",
        "body": "Ask who delivers and installs the structure, who prepares the site, and who handles follow-up. Some providers include installation; others offer different arrangements. Triple J installs the structures it quotes with its own crew."
      },
      {
        "heading": "Compare the complete design",
        "body": "Welded or bolted connections alone do not establish wind performance. Compare the specified framing, anchoring, foundation, and engineering for your site. Triple J offers both welded and bolted options."
      },
      {
        "heading": "Price the concrete separately",
        "body": "Triple J can include site prep, concrete, and installation in one contract. Our advertised steel-and-install starting prices exclude concrete. Request an itemized quote from each provider so the totals cover equivalent work."
      },
      {
        "heading": "Confirm scheduling",
        "body": "Lead times change with location, design, material availability, and site readiness. Ask each provider for a current project-specific schedule. Triple J offers same-week scheduling when the scope and availability allow; your installation date is confirmed during quoting."
      }
    ]
  },
  "get-carports": {
    "slug": "get-carports",
    "competitorSlugs": [
      "get-carports",
      "triple-j-metal"
    ],
    "metaTitle": "Get Carports Alternatives in Central Texas",
    "metaDescription": "Compare Get Carports with Triple J Metal in Central Texas. Review installation, concrete, design options and scheduling in a written quote.",
    "h1": "Get Carports Alternatives in Central Texas",
    "heroSubhead": "Compare complete project scopes. Triple J Metal offers welded or bolted structures installed by our Temple-based crew, with site preparation and concrete available in the same contract.",
    "tldr": "Compare the design, installation, foundation, and total scope before choosing a builder. Triple J Metal offers a direct relationship with a local crew. Ask each provider to confirm what is included for your address and project.",
    "whyCompare": "A building price is only useful when the scope is clear. Check dimensions, framing, roof and wall panels, doors, anchoring, delivery, installation, concrete, taxes, and any required approvals. Different quotes may cover different work.",
    "whenCompetitorWins": "Consider Get Carports when its service area, available designs, and written proposal fit your project. Confirm current installation arrangements, exclusions, warranty terms, and scheduling directly with the provider.",
    "whenTripleJWins": [
      "You want a Temple-based crew serving Central Texas.",
      "You want to compare welded and bolted red iron options.",
      "You want site prep and a separately priced concrete pad available in the same contract.",
      "You want to discuss your preferred timeline directly with the team.",
      "You prefer to discuss your project in English or Spanish."
    ],
    "breakdownSections": [
      {
        "heading": "Compare installation scope",
        "body": "Ask who delivers and installs the structure, who prepares the site, and who handles follow-up. Some providers include installation; others offer different arrangements. Triple J installs the structures it quotes with its own crew."
      },
      {
        "heading": "Compare the complete design",
        "body": "Welded or bolted connections alone do not establish wind performance. Compare the specified framing, anchoring, foundation, and engineering for your site. Triple J offers both welded and bolted options."
      },
      {
        "heading": "Price the concrete separately",
        "body": "Triple J can include site prep, concrete, and installation in one contract. Our advertised steel-and-install starting prices exclude concrete. Request an itemized quote from each provider so the totals cover equivalent work."
      },
      {
        "heading": "Confirm scheduling",
        "body": "Lead times change with location, design, material availability, and site readiness. Ask each provider for a current project-specific schedule. Triple J offers same-week scheduling when the scope and availability allow; your installation date is confirmed during quoting."
      }
    ]
  },
  "carport-central": {
    "slug": "carport-central",
    "competitorSlugs": [
      "carport-central",
      "triple-j-metal"
    ],
    "metaTitle": "Carport Central Alternatives in Central Texas",
    "metaDescription": "Compare Carport Central with Triple J Metal in Central Texas. Review installation, concrete, design options and scheduling in a written quote.",
    "h1": "Carport Central Alternatives in Central Texas",
    "heroSubhead": "Compare complete project scopes. Triple J Metal offers welded or bolted structures installed by our Temple-based crew, with site preparation and concrete available in the same contract.",
    "tldr": "Compare the design, installation, foundation, and total scope before choosing a builder. Triple J Metal offers a direct relationship with a local crew. Ask each provider to confirm what is included for your address and project.",
    "whyCompare": "A building price is only useful when the scope is clear. Check dimensions, framing, roof and wall panels, doors, anchoring, delivery, installation, concrete, taxes, and any required approvals. Different quotes may cover different work.",
    "whenCompetitorWins": "Consider Carport Central when its service area, available designs, and written proposal fit your project. Confirm current installation arrangements, exclusions, warranty terms, and scheduling directly with the provider.",
    "whenTripleJWins": [
      "You want a Temple-based crew serving Central Texas.",
      "You want to compare welded and bolted red iron options.",
      "You want site prep and a separately priced concrete pad available in the same contract.",
      "You want to discuss your preferred timeline directly with the team.",
      "You prefer to discuss your project in English or Spanish."
    ],
    "breakdownSections": [
      {
        "heading": "Compare installation scope",
        "body": "Ask who delivers and installs the structure, who prepares the site, and who handles follow-up. Some providers include installation; others offer different arrangements. Triple J installs the structures it quotes with its own crew."
      },
      {
        "heading": "Compare the complete design",
        "body": "Welded or bolted connections alone do not establish wind performance. Compare the specified framing, anchoring, foundation, and engineering for your site. Triple J offers both welded and bolted options."
      },
      {
        "heading": "Price the concrete separately",
        "body": "Triple J can include site prep, concrete, and installation in one contract. Our advertised steel-and-install starting prices exclude concrete. Request an itemized quote from each provider so the totals cover equivalent work."
      },
      {
        "heading": "Confirm scheduling",
        "body": "Lead times change with location, design, material availability, and site readiness. Ask each provider for a current project-specific schedule. Triple J offers same-week scheduling when the scope and availability allow; your installation date is confirmed during quoting."
      }
    ]
  },
  "national-kit-dealers": {
    "slug": "national-kit-dealers",
    "competitorSlugs": [
      "eagle-carports",
      "get-carports",
      "carport-central",
      "viking-steel",
      "infinity-carports",
      "triple-j-metal"
    ],
    "metaTitle": "National Metal Carport Kit Alternatives in Central Texas",
    "metaDescription": "Compare national metal building providers with Triple J Metal in Central Texas. Review installation, concrete, design options and scheduling in a written quote.",
    "h1": "National Metal Carport Kit Alternatives in Central Texas",
    "heroSubhead": "Compare complete project scopes. Triple J Metal offers welded or bolted structures installed by our Temple-based crew, with site preparation and concrete available in the same contract.",
    "tldr": "Compare the design, installation, foundation, and total scope before choosing a builder. Triple J Metal offers a direct relationship with a local crew. Ask each provider to confirm what is included for your address and project.",
    "whyCompare": "A building price is only useful when the scope is clear. Check dimensions, framing, roof and wall panels, doors, anchoring, delivery, installation, concrete, taxes, and any required approvals. Different quotes may cover different work.",
    "whenCompetitorWins": "Consider national metal building providers when its service area, available designs, and written proposal fit your project. Confirm current installation arrangements, exclusions, warranty terms, and scheduling directly with the provider.",
    "whenTripleJWins": [
      "You want a Temple-based crew serving Central Texas.",
      "You want to compare welded and bolted red iron options.",
      "You want site prep and a separately priced concrete pad available in the same contract.",
      "You want to discuss your preferred timeline directly with the team.",
      "You prefer to discuss your project in English or Spanish."
    ],
    "breakdownSections": [
      {
        "heading": "Compare installation scope",
        "body": "Ask who delivers and installs the structure, who prepares the site, and who handles follow-up. Some providers include installation; others offer different arrangements. Triple J installs the structures it quotes with its own crew."
      },
      {
        "heading": "Compare the complete design",
        "body": "Welded or bolted connections alone do not establish wind performance. Compare the specified framing, anchoring, foundation, and engineering for your site. Triple J offers both welded and bolted options."
      },
      {
        "heading": "Price the concrete separately",
        "body": "Triple J can include site prep, concrete, and installation in one contract. Our advertised steel-and-install starting prices exclude concrete. Request an itemized quote from each provider so the totals cover equivalent work."
      },
      {
        "heading": "Confirm scheduling",
        "body": "Lead times change with location, design, material availability, and site readiness. Ask each provider for a current project-specific schedule. Triple J offers same-week scheduling when the scope and availability allow; your installation date is confirmed during quoting."
      }
    ]
  }
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
]
