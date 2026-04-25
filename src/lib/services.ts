/**
 * Niche service page data — one entry per /services/[slug] page.
 *
 * Each page targets a specific keyword gap identified by the 2026 competitor
 * research: turnkey+concrete (Gap 1), welded quality (Gap 2),
 * speed/military (Gap 3), HOA luxury (Gap 4).
 */

export type ServiceFeature = {
  title: string
  description: string
}

export type FAQ = {
  q: string
  a: string
}

export type CompetitorRow = {
  them: string
  us: string
}

export type ServiceData = {
  slug: string
  title: string
  shortTitle: string
  keywordGap: 1 | 2 | 3 | 4 | null
  metaTitle: string
  metaDescription: string
  heroHeadline: string
  heroCopy: string
  mainBenefit: string
  features: ServiceFeature[]
  technicalAuthority: string   // localized TX-specific copy for conversion + SEO
  competitorRows: CompetitorRow[]
  faqs: FAQ[]
  militaryAngle: boolean        // show Fort Cavazos / PCS section
  relatedSlugs: string[]
}

export const SERVICES: Record<string, ServiceData> = {

  // ─── GAP 2: Welded vs Bolted ─────────────────────────────────────────────
  carports: {
    slug: 'carports',
    title: 'Custom Metal Carports',
    shortTitle: 'Carports',
    keywordGap: 2,
    metaTitle: 'Custom Metal Carports Temple TX | Welded & Bolted',
    metaDescription:
      'Welded or bolted metal carports in Temple, Belton, Killeen & Central Texas. Same-week installs, concrete pad included.',
    heroHeadline: 'Custom Metal Carports — Welded or Bolted, Same-Week Installs',
    heroCopy:
      'Most carport companies ship you a kit and leave. Triple J Metal shows up with a crew, welds or bolts your structure on-site, and cleans up before we leave. Welded red iron steel is a permanent real estate improvement — it doesn\'t rattle loose in Texas storms. Bolted red iron is the affordable option when a kit-level investment fits your budget. Either way, we build it right the first time.',
    mainBenefit: 'Permanent welded steel that becomes part of your property — not a kit that shakes apart in a Texas storm.',
    features: [
      {
        title: 'Welded Red Iron — Permanent',
        description:
          'Our custom-welded carports use 14-gauge (standard) or 12-gauge (storm upgrade) red iron steel, welded on-site with a Miller Bobcat welder. No bolt-on connections to loosen over time.',
      },
      {
        title: 'Bolted Red Iron — Affordable',
        description:
          'Prefer a budget-friendly option? We also install bolted red iron carport kits — but unlike Alan\'s or kit dealers, we handle every step: delivery, site prep, and installation.',
      },
      {
        title: 'Same-Week Scheduling',
        description:
          'Most installs are completed in one working day — larger structures in two. East Texas Carports quotes 4–16 weeks. We schedule within days, not months.',
      },
      {
        title: 'Any Size or Configuration',
        description:
          'Single-car, double-car, or commercial-width. Open sides, partial sides, or fully enclosed. We build to your dimensions, not to a standard catalog.',
      },
      {
        title: 'Concrete Pad Available',
        description:
          'Need a concrete slab poured first? We handle site prep and concrete in the same contract. No need to hire a separate concrete crew.',
      },
      {
        title: 'Texas-Sourced Red Iron Steel',
        description:
          'Panels sourced from leading regional Texas suppliers — PBR/PBU R-Panels on Galvalume® substrate with painted finishes rated for Central Texas weather. Multi-source so a single supplier shortage never delays your build.',
      },
    ],
    technicalAuthority:
      'All Triple J carports are engineered for Central Texas conditions: 90 mph wind rating, 4,000 PSI concrete footings for Bell County\'s expansive clay soils, and painted-Galvalume® panels backed by a 40-year paint warranty that resist UV degradation and hail impact. We\'re familiar with Bell County and Coryell County setback requirements and can advise on permit needs before we break ground.',
    competitorRows: [
      { them: 'Ships a kit — you arrange installation', us: 'We deliver, weld, and install everything' },
      { them: '4–16 week lead times (East Texas Carports)', us: 'Most builds scheduled within the week' },
      { them: 'Extra fees for customizations', us: 'Custom dimensions included in your quote' },
      { them: 'You handle your own concrete', us: 'Concrete pad available in the same contract' },
      { them: 'Warranties voided if land isn\'t perfectly level', us: 'We grade and prep the site ourselves' },
    ],
    faqs: [
      {
        q: 'What\'s the difference between welded and bolted carports?',
        a: 'Welded carports are custom-fabricated on-site using a MIG welder — the steel is fused together permanently. Bolted carports use pre-drilled red iron sections connected with bolts. Welded is more durable and a true real estate improvement. Bolted is slightly less expensive and appropriate for lower-wind environments or temporary installations.',
      },
      {
        q: 'Do you handle permits?',
        a: 'We can advise on Bell County and surrounding county permit requirements. Many residential carports under a certain square footage don\'t require permits, but we\'ll walk you through what applies to your property before we start.',
      },
      {
        q: 'How much does a custom carport cost?',
        a: 'A Triple J welded 20×20 carport typically runs $4,500–$7,500 depending on gauge, panel style, and whether concrete is included. Bolted configurations start lower. We quote every job individually — call 254-346-7764 or fill out our quote form.',
      },
      {
        q: 'Do you install on existing concrete?',
        a: 'Yes. If you already have a slab, we anchor directly to it. We can also pour a new pad as part of the same job if needed.',
      },
    ],
    militaryAngle: false,
    relatedSlugs: ['turnkey-carports-with-concrete', 'rv-covers', 'metal-garages'],
  },

  // ─── GAP 1: Turnkey + Concrete ───────────────────────────────────────────
  'turnkey-carports-with-concrete': {
    slug: 'turnkey-carports-with-concrete',
    title: 'Turnkey Carports with Concrete',
    shortTitle: 'Turnkey + Concrete',
    keywordGap: 1,
    metaTitle: 'Carports With Concrete Pads Central Texas | One Contract',
    metaDescription:
      'The only Central Texas carport builder that includes site prep and concrete pouring in a single contract. No coordinating multiple contractors.',
    heroHeadline: 'Carports with Concrete — One Contract, Start to Finish',
    heroCopy:
      'Every other carport company in Central Texas has the same fine print: "Customer is responsible for site preparation and concrete." That means you\'re calling a concrete contractor, waiting on permits, getting a separate quote, coordinating schedules — before the carport people will even show up. Triple J Metal is the only local installer that handles site grading, concrete pad pouring, and structure installation under one contract. One call. One crew. One invoice.',
    mainBenefit: 'The only Central Texas carport company that includes site prep and concrete in the same contract — no separate concrete crew.',
    features: [
      {
        title: 'Site Grading & Prep',
        description:
          'Our John Deere skid-steer handles grading, leveling, and site preparation. We remove brush, grade the pad area, and ensure proper drainage before the concrete is poured.',
      },
      {
        title: 'Concrete Pad Pouring',
        description:
          '4,000 PSI concrete poured on-site, properly reinforced, and cured to meet Bell County soil requirements. Sized to your structure dimensions.',
      },
      {
        title: 'Steel Structure Installation',
        description:
          'Once the pad cures, our crew returns to erect the carport, garage, or barn — welded or bolted, any size. The structure is anchored directly into the fresh concrete.',
      },
      {
        title: 'One Invoice, One Warranty',
        description:
          'No finger-pointing between your concrete guy and your steel guy. Triple J Metal owns the whole job from ground to roof.',
      },
      {
        title: 'All Structure Types',
        description:
          'This turnkey package applies to carports, garages, barns, RV covers, and metal porches. If it goes on a pad, we can build it.',
      },
      {
        title: 'Permit Advisory',
        description:
          'We advise on Bell County and surrounding county requirements and can help coordinate permit pulls where required.',
      },
    ],
    technicalAuthority:
      'Central Texas\'s expansive clay soils — especially in Bell and Coryell counties — require proper base preparation before any concrete is poured. We use 4,000 PSI concrete with appropriate reinforcement, grade the site to ensure positive drainage away from the structure, and allow full cure time before anchoring the frame. This is why national companies exclude concrete: the liability of getting it wrong is high. Our crew does it daily.',
    competitorRows: [
      { them: 'Site prep: "not included, customer\'s responsibility"', us: 'Site grading and leveling included' },
      { them: 'Concrete: "you\'ll need to hire a separate contractor"', us: 'Concrete pad poured by us, same contract' },
      { them: 'Warranties voided if slab not perfectly level (Safeguard)', us: 'We level the site ourselves — no voided warranties' },
      { them: 'Multiple contractors = multiple invoices and scheduling gaps', us: 'One call, one crew, one invoice' },
      { them: 'Customer coordinates 2–3 trades to get a carport built', us: 'We handle everything start to finish' },
    ],
    faqs: [
      {
        q: 'Why don\'t other carport companies include concrete?',
        a: 'Concrete requires equipment (a skid-steer or tractor for grading), licensing, and liability that most carport dealers don\'t have. Most are national kit-sellers, not full-service builders. Triple J Metal operates its own skid-steer and has poured hundreds of pads across Central Texas.',
      },
      {
        q: 'How thick will the concrete pad be?',
        a: 'Standard residential carport and garage pads are 4" thick with appropriate reinforcement. We can pour 6" reinforced slabs for heavier structures or RV weights. We\'ll recommend the right spec for your project during the quote.',
      },
      {
        q: 'How long does the whole process take?',
        a: 'Grading and concrete typically take one day. After a 7-day cure, we return to install the structure — usually completed same day. Total project time is 8–10 days from job start, weather permitting.',
      },
      {
        q: 'Can you pour concrete on a sloped site?',
        a: 'Yes. We grade and level the area first. Steep slopes may require additional site prep — we\'ll assess during the quote walk.',
      },
    ],
    militaryAngle: false,
    relatedSlugs: ['carports', 'metal-garages', 'barns'],
  },

  // ─── Metal Garages ───────────────────────────────────────────────────────
  'metal-garages': {
    slug: 'metal-garages',
    title: 'Metal Garages',
    shortTitle: 'Garages',
    keywordGap: null,
    metaTitle: 'Custom Metal Garages Temple & Belton TX',
    metaDescription:
      'Fully-enclosed custom metal garages in Temple, Belton, Killeen & Central Texas. Single and multi-bay, welded or bolted, concrete available.',
    heroHeadline: 'Custom Metal Garages — Fully Enclosed, Built to Order',
    heroCopy:
      'A metal garage from Triple J Metal isn\'t a shed from a big-box store. It\'s a fully-enclosed red iron steel structure, custom-welded or bolted to your exact dimensions, installed on your property with site prep and concrete pad included if needed. Single-bay, double-bay, or multi-car — we build every configuration in Central Texas.',
    mainBenefit: 'Fully-enclosed custom metal garage built to your dimensions — welded or bolted, with concrete pad available in the same contract.',
    features: [
      {
        title: 'Fully Enclosed Red Iron',
        description:
          'Four walls, a pitched roof, and your choice of door configuration. All red iron steel — stronger and more permanent than wood-frame construction.',
      },
      {
        title: 'Custom Dimensions',
        description:
          'Single-car (12–14 ft wide), double-car (20–24 ft wide), or multi-bay. Any length. We don\'t work from a standard catalog.',
      },
      {
        title: 'Roll-Up or Walk-In Doors',
        description:
          'Standard roll-up doors, commercial roll-up doors, or framed openings for your own door installation — your choice.',
      },
      {
        title: 'Concrete Pad in One Contract',
        description:
          'Don\'t want to source your own concrete crew? We pour the pad, install the garage, and hand you the keys — one invoice.',
      },
      {
        title: '12-Gauge Storm Upgrade',
        description:
          'Upgrade from 14-gauge to 12-gauge steel for maximum durability in Central Texas hail country. Ideal for insured structures.',
      },
      {
        title: 'Insulation Ready',
        description:
          'Framing is spaced for standard insulation installation. We can advise on insulation options to keep your tools and vehicles protected year-round.',
      },
    ],
    technicalAuthority:
      'All Triple J metal garages are built with PBR/PBU R-Panels — the same commercial-grade paneling used on agricultural and industrial structures throughout Texas. Roofing is Galvalume® steel with a painted finish backed by a 40-year warranty, rated for Central Texas UV exposure and hail impact. We pull Bell County permits where required and ensure structures meet local setback requirements.',
    competitorRows: [
      { them: 'Standard catalog sizes only', us: 'Any dimension — we build to your spec' },
      { them: 'Kit delivery, self-install', us: 'Full installation by our crew' },
      { them: 'No concrete — customer\'s responsibility', us: 'Concrete pad available, same contract' },
      { them: '6–16 week lead times', us: 'Most installs scheduled within the week' },
    ],
    faqs: [
      {
        q: 'How much does a metal garage cost?',
        a: 'A basic 20×20 single-bay enclosed garage starts around $6,000–$9,000 depending on gauge, panel style, and door configuration. Multi-bay and larger structures are quoted individually. Call 254-346-7764 or submit a quote request.',
      },
      {
        q: 'Can you add windows and side doors?',
        a: 'Yes. We can frame openings for windows, man-doors, and any door configuration during construction.',
      },
      {
        q: 'Can the garage be insulated?',
        a: 'We can frame the structure for insulation. We\'ll connect you with insulation contractors, or you can handle that phase yourself after we\'re done.',
      },
    ],
    militaryAngle: false,
    relatedSlugs: ['carports', 'turnkey-carports-with-concrete', 'barns'],
  },

  // ─── Barns ───────────────────────────────────────────────────────────────
  barns: {
    slug: 'barns',
    title: 'Metal Barns & Ranch Structures',
    shortTitle: 'Barns',
    keywordGap: null,
    metaTitle: 'Metal Barns Central Texas | Ranch & Ag Structures',
    metaDescription:
      'Metal barns and ranch structures across Bell and Coryell counties. Welded or bolted red iron, concrete available, same-week installs.',
    heroHeadline: 'Metal Barns Built for Central Texas Ranch Life',
    heroCopy:
      'A Central Texas barn has to handle 90 mph gusts, hail the size of golf balls, and baking summer heat — then do it all again next season. Triple J Metal builds welded red iron barns engineered for this climate: thick steel, proper anchoring, and Texas-sourced Galvalume® roofing rated for the punishment Texas delivers. We\'ve built structures across Bell and Coryell counties for livestock, equipment storage, hay, and mixed use. Our John Deere skid-steer reaches 40 feet — we can tackle larger structures that smaller crews can\'t.',
    mainBenefit: 'Welded red iron barns engineered for Central Texas weather — livestock, equipment, hay, or mixed use.',
    features: [
      {
        title: 'Welded Red Iron Framing',
        description:
          '14-gauge or 12-gauge red iron steel, welded on-site. Permanent, storm-proof, and built to last decades without bolt connections loosening.',
      },
      {
        title: 'Any Configuration',
        description:
          'Open-sided equipment sheds, fully-enclosed hay barns, livestock stalls, or mixed-use multi-bay structures. We design to your operation.',
      },
      {
        title: 'Skid-Steer Reaches 40 Feet',
        description:
          'Our John Deere skid-steer with scaffold platform reaches 40 feet — enabling taller structures like tall barns and barndominium shells that most small crews can\'t tackle.',
      },
      {
        title: 'Concrete Slab or Gravel Floor',
        description:
          'We pour concrete pads for equipment storage and workshops, or prep and grade gravel floors for livestock areas. Same contract.',
      },
      {
        title: 'Agricultural-Grade Panels',
        description:
          'PBR/PBU R-Panels are the industry standard for agricultural buildings. Galvalume® base steel with a 40-year painted finish resists corrosion and UV damage.',
      },
      {
        title: 'GC Connections for Larger Builds',
        description:
          'Need a barndominium or large commercial structure? We work with GCs on PlanHub and ToolBelt for projects beyond our standard scope.',
      },
    ],
    technicalAuthority:
      'Bell County ranch properties often have caliche and clay soil that requires proper grading and drainage planning before a barn slab is poured. We\'ve built across the Temple–Belton–Killeen–Copperas Cove corridor and know the soil conditions, flood zone considerations, and county permit requirements for agricultural structures. We use 4,000 PSI concrete for slabs and ensure proper anchor bolt placement for the local wind load requirements.',
    competitorRows: [
      { them: 'Bolted kit barns — connections loosen over time', us: 'Welded red iron — permanently fused steel' },
      { them: 'National dealer, no local crew', us: 'Temple-based crew, same-week scheduling' },
      { them: 'No concrete — customer\'s responsibility', us: 'Concrete slab or gravel floor in the same contract' },
      { them: 'Can\'t reach taller structures', us: 'Skid-steer reaches 40 ft for taller barns' },
    ],
    faqs: [
      {
        q: 'Do you need permits for a farm barn in Bell County?',
        a: 'Agricultural structures often have different permit thresholds than residential buildings. We\'ll advise on what applies to your property and structure size before we start. Rural properties on ag-exempt land often have more flexibility.',
      },
      {
        q: 'Can you build livestock stalls inside a metal barn?',
        a: 'Yes. We can frame stall partitions using the same red iron steel as the structure. Custom stall sizing, doors, and Dutch doors all available.',
      },
      {
        q: 'What\'s the largest barn you can build?',
        a: 'Our skid-steer reaches 40 feet, enabling structures up to that height. For very large commercial or barndominium projects, we work with general contractors. Call us to discuss your specific project.',
      },
    ],
    militaryAngle: false,
    relatedSlugs: ['turnkey-carports-with-concrete', 'metal-garages', 'carports'],
  },

  // ─── GAP 3: Speed + Military ─────────────────────────────────────────────
  'rv-covers': {
    slug: 'rv-covers',
    title: 'RV & Boat Covers',
    shortTitle: 'RV & Boat Covers',
    keywordGap: 3,
    metaTitle: 'RV Covers Central Texas | Same-Week Installs | Fort Cavazos Military Discount',
    metaDescription:
      'Custom RV and boat covers across Central Texas — same-week scheduling, military discount, concrete pad included.',
    heroHeadline: 'RV & Boat Covers — Same-Week Installs, Texas Hail Won\'t Wait',
    heroCopy:
      'Texas hail season doesn\'t send a calendar invite. A single storm can total an unprotected RV or boat in minutes. Triple J Metal builds tall-clearance RV and boat covers faster than any competitor in Central Texas — most jobs are scheduled and on-site within days of your approval. East Texas Carports quotes 4–16 weeks. If you just bought an RV, just PCS\'d to Fort Cavazos, or just had a close call with hail — call us today.',
    mainBenefit: 'Same-week installs beat every competitor in Central Texas. Military discount available for Fort Cavazos families.',
    features: [
      {
        title: 'Tall Clearance for Class A & Class C RVs',
        description:
          'Standard clearance heights from 12–16 feet. We build to your RV or boat\'s exact height requirements — no squeezing under a low kit structure.',
      },
      {
        title: 'Same-Week Install — No Waiting',
        description:
          'We schedule within days of your approval. East Texas Carports, Viking Steel, and similar dealers quote 4–16 weeks. If hail season is approaching, speed matters.',
      },
      {
        title: 'Fort Cavazos Military Discount',
        description:
          'Active duty, veterans, and first responders receive a discount on all RV and boat cover installs. PCS\'ing to Fort Cavazos? We\'ll protect your vehicle before your household goods arrive.',
      },
      {
        title: 'Welded or Bolted — Your Choice',
        description:
          'Custom welded red iron for a permanent installation, or bolted for a more budget-friendly option. Both built and installed by our crew.',
      },
      {
        title: 'Concrete Pad Included if Needed',
        description:
          'Pull your RV onto a fresh concrete pad — no gravel, no ruts. We pour the slab and install the cover in the same contract.',
      },
      {
        title: 'Side Curtains & Enclosures',
        description:
          'Need extra weather protection? We can add metal side panels or roll-up doors for a fully or partially enclosed RV storage bay.',
      },
    ],
    technicalAuthority:
      'Central Texas averages some of the highest hail frequency in the nation — Bell County alone sees multiple significant hail events per year. A standard Class A RV is 13–13.5 feet tall; we build clearance frames to 14–16 feet to ensure full roof clearance with room to maneuver. All structures are anchored into 4,000 PSI concrete or direct-buried posts engineered for 90 mph wind loads.',
    competitorRows: [
      { them: '4–16 week lead times (East Texas Carports)', us: 'On-site within days — same-week scheduling' },
      { them: 'Standard kit heights may not clear your RV', us: 'Built to your RV\'s exact height requirements' },
      { them: 'No military discount', us: 'Fort Cavazos military and first responder discount' },
      { them: 'No concrete — you handle site prep', us: 'Concrete pad poured in the same contract' },
    ],
    faqs: [
      {
        q: 'What clearance height do I need for my RV?',
        a: 'Class A motorhomes are typically 12\'6"–13\'6" tall. We recommend at least 14\' of clearance. Bring your RV\'s height spec and we\'ll build exactly what you need.',
      },
      {
        q: 'Do you offer military discounts?',
        a: 'Yes. Active duty, veterans, and first responders qualify for a discount on all Triple J Metal installations. Mention your service when you call or check the military discount box on our quote form.',
      },
      {
        q: 'Can I store a boat and an RV under the same structure?',
        a: 'Absolutely. We can build a wide multi-bay cover that accommodates both. Tell us your dimensions and we\'ll design something that fits.',
      },
      {
        q: 'How quickly can you start?',
        a: 'Most jobs are scheduled within 2–5 business days of quote acceptance, weather permitting. Call 254-346-7764 for current availability.',
      },
    ],
    militaryAngle: true,
    relatedSlugs: ['carports', 'turnkey-carports-with-concrete', 'hoa-compliant-structures'],
  },

  // ─── GAP 4: HOA / Luxury Subdivision ────────────────────────────────────
  'hoa-compliant-structures': {
    slug: 'hoa-compliant-structures',
    title: 'HOA-Compliant Metal Structures',
    shortTitle: 'HOA Structures',
    keywordGap: 4,
    metaTitle: 'HOA-Compliant Metal Carports & Porches | Heritage Oaks Bella Charca',
    metaDescription:
      'HOA-compliant metal carports, garages, and porches with architectural panel finishes for Heritage Oaks, Bella Charca, and Central Texas luxury subdivisions.',
    heroHeadline: 'HOA-Compliant Metal Structures for Central Texas Luxury Subdivisions',
    heroCopy:
      'Heritage Oaks and Bella Charca homeowners know the challenge: your HOA has strict architectural guidelines, your builder only built the main house, and the secondary structures — the RV cover, the porch extension, the detached garage — are yours to figure out. National carport brands sell utility-grade sheds that HOAs reject on first review. Triple J Metal builds premium architectural structures using concealed-fastener standing-seam and Board & Batten panel systems that meet the strictest HOA guidelines in Central Texas — and we include concrete and site prep so you never have to manage a second contractor.',
    mainBenefit: 'Architectural-grade panel systems (concealed-fastener standing-seam, Board & Batten) that pass HOA review in Heritage Oaks, Bella Charca, and similar Central Texas luxury developments.',
    features: [
      {
        title: 'Concealed-Fastener Standing-Seam Roofing',
        description:
          'Premium standing-seam systems provide the clean architectural profile required by HOAs — concealed fasteners, no exposed screws, no utility-shed appearance. We source from regional Texas suppliers in the gauge and color your HOA spec calls for.',
      },
      {
        title: 'Board & Batten Siding',
        description:
          'The architectural siding standard for luxury residential construction — available in the same color palette as your primary home\'s exterior for seamless matching.',
      },
      {
        title: '12-Gauge Storm Upgrade',
        description:
          'Premium structures deserve premium steel. 12-gauge framing provides greater rigidity and meets the structural requirements of HOA engineering reviews.',
      },
      {
        title: 'Low Disruption — Same-Week Build',
        description:
          'Heritage Oaks and Bella Charca neighbors notice long construction projects. Our fast build timeline means minimal neighborhood disruption — most jobs are done before your neighbors realize construction started.',
      },
      {
        title: 'Concrete & Site Prep Included',
        description:
          'Wealthy buyers don\'t want to manage two contractors. We handle concrete, site prep, and structure installation under one contract.',
      },
      {
        title: 'Color Matching',
        description:
          'Our panel suppliers stock 39 painted colors across two lines. We can match your home\'s trim, roof, or body color for architectural continuity.',
      },
    ],
    technicalAuthority:
      'Heritage Oaks and Bella Charca are developed by Saratoga Homes and Flintrock Building Texas in the Killeen–Harker Heights corridor — home prices from $500,000 to $900,000. HOA architectural guidelines typically require color continuity with the primary residence, no exposed fasteners on roofing, and framing gauges that meet residential engineering standards. Our concealed-fastener standing-seam and Board & Batten systems are designed for exactly this market. We\'ve worked in Bell County luxury neighborhoods and understand the approval process.',
    competitorRows: [
      { them: 'Utility-grade panels — HOA rejection guaranteed', us: 'Standing seam + Board & Batten — HOA-ready' },
      { them: 'Standard color palette of 6–8 options', us: '39-color palette with color-match service' },
      { them: '14-gauge only — may not pass HOA engineering review', us: '12-gauge upgrade available for premium builds' },
      { them: 'No concrete — manage your own site prep', us: 'Concrete and site prep in the same contract' },
      { them: 'Weeks of neighborhood disruption', us: 'Same-week build — minimal neighborhood impact' },
    ],
    faqs: [
      {
        q: 'Will my HOA approve a metal structure?',
        a: 'HOA approval depends on your specific CC&Rs and architectural guidelines. The two biggest factors are panel aesthetic (standing seam vs utility R-Panel) and color continuity. We\'ve helped Heritage Oaks and Bella Charca homeowners navigate this process. Bring your HOA guidelines to the quote conversation and we\'ll design a spec that meets them.',
      },
      {
        q: 'What\'s the difference between standing seam and standard R-Panel?',
        a: 'Standard R-Panel has exposed fasteners and a corrugated profile — it reads as agricultural or commercial. Standing seam has concealed fasteners and a clean raised seam profile — it reads as architectural and residential. HOAs with strict guidelines almost always require standing seam.',
      },
      {
        q: 'Can you match my home\'s exterior color exactly?',
        a: 'Our panel suppliers stock 39 painted colors across two lines. Bring your home\'s exterior color chip and we\'ll identify the closest match. For very specific custom colors, we can discuss powder coat options.',
      },
      {
        q: 'Do you handle the HOA approval paperwork?',
        a: 'We provide detailed spec sheets and material documentation that HOA architectural committees typically require. You submit to your HOA — we supply everything they need to review it.',
      },
    ],
    militaryAngle: false,
    relatedSlugs: ['carports', 'rv-covers', 'metal-garages'],
  },
}

export const SERVICE_SLUGS = Object.keys(SERVICES)
