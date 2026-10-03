/**
 * Niche service page data — one entry per /services/[slug] page.
 *
 * Each page targets a specific keyword gap identified by the 2026 competitor
 * research: turnkey+concrete (Gap 1), welded quality (Gap 2),
 * speed/military (Gap 3), HOA luxury (Gap 4).
 */
import { SITE } from '@/lib/site'


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
  /** Blog post slugs to feature in the inline 'Further Reading' callout.
   *  Up to 3 render. Omit or leave empty to suppress the section. */
  relatedPosts?: string[]
  initialService?: "fencing"
  trustPoints?: string[]
  featuresHeading?: string
  /** Quote-form service preselected by this page's quote section. */
  quoteService?: "fencing" | "carport" | "garage" | "barn" | "rv_cover"
  /** gallery_items.type values whose live builds this page shows (≥3 to render). */
  galleryTypes?: string[]
  /** gallery_items.tag the builds must also carry (turnkey → "Turnkey"). */
  galleryTag?: string
  /** Forge design content (2026-10-02). Pages without it render the shared
   *  template from the fields above; a section with no data is skipped. */
  forge?: ServiceForge
}

export type ServiceOption = {
  label: string
  title: string
  body: string
  price?: string
  note?: string
  /** Omitted when no real photo exists — never a placeholder. */
  img?: string
  structure?: 'welded' | 'bolted'
  concrete?: 'yes'
}

export type ServiceForge = {
  /** Short name used in menus, breadcrumbs and "Related" buttons. */
  menu: string
  eyebrow: string
  h1a: string
  h1b: string
  lede: string
  img: string
  imgAlt: string
  pos: string
  facts: { k: string; v: string; s: string }[]
  optEyebrow: string
  optHeading: string
  optLede: string
  options: ServiceOption[]
  techHeading: string
  specs: { k: string; v: string }[]
  /** Two service slugs for the "Related" row. */
  related: string[]
}

export const SERVICES: Record<string, ServiceData> = {

  'metal-fencing': {
    slug: 'metal-fencing',
    title: 'Metal Fencing & Gates',
    shortTitle: 'Metal Fencing & Gates',
    keywordGap: null,
    metaTitle: 'Metal Fencing & Gates in Bell County, TX',
    metaDescription: 'Metal privacy fences, pipe and ranch fencing, ornamental metal fences and gates. Temple-based Triple J Metal serves Bell County. Request a free quote.',
    heroHeadline: 'Metal Fencing & Gates in Temple, Belton & Killeen',
    heroCopy: 'More privacy at home. A defined boundary for your land. An entrance that fits your property. Triple J Metal builds metal privacy fencing, pipe and ranch fencing, ornamental metal fences, and gates for Central Texas properties. Tell our Temple-based crew what you need, and we’ll work through the layout with you.',
    mainBenefit: 'Your fence, your layout — with a local metal crew you can talk to directly.',
    featuresHeading: 'Find the right fence for your property.',
    initialService: 'fencing',
    trustPoints: ['Temple-based crew', 'English & Spanish', 'Project-specific quotes'],
    features: [
      { title: "Metal privacy fencing", description: "Screen a yard or work area with metal panels. Height, finish, post layout and look are discussed before quoting." },
      { title: "Pipe & ranch fencing", description: "Define acreage, frontage or a ranch entrance. Tell us how the land is used and any livestock containment needs." },
      { title: "Ornamental metal fencing", description: "An open metal fence that frames the property and keeps the view. Picket style, spacing, height and finish are yours to pick." },
      { title: "Gates & property access", description: "Plan pedestrian or driveway gates alongside the fence so access is part of the quote from the start." },
      { title: "A quote built around your site", description: "Length, height, materials, terrain, access and any old-fence removal affect the scope — all confirmed in your written quote." },
      { title: "Help choosing a layout", description: "Not sure where to begin? Send your ZIP, approximate footage and a description of the property. We’ll talk options." },
    ],
    technicalAuthority: "Based in Temple, we take fencing inquiries from Temple, Belton, Killeen, Harker Heights and surrounding Central Texas communities. Slopes, drainage, gate openings, property boundaries and applicable city or HOA requirements all matter. Share your address and any existing plans so the layout and materials can be reviewed before installation.",
    competitorRows: [],
    faqs: [
      { q: "What types of metal fencing do you offer?", a: "Metal privacy fencing, pipe and ranch fencing, ornamental metal fencing, and gates. Use the quote form to choose a style, or tell us what you want the fence to do." },
      { q: "How much does a metal fence cost?", a: "Every fence is quoted to its scope. Total linear feet, height, material and finish, gate count, terrain and removal work affect the price. Send approximate measurements to start; final pricing follows scope and site review." },
      { q: "Do I need exact measurements to request a quote?", a: "No. Approximate linear footage and height are enough to start. We’ll confirm measurements and the layout before a final scope is agreed." },
      { q: "When can you install my fence?", a: "Tell us your preferred timing. We confirm scheduling after reviewing the site, scope, material availability and any required approvals. The quote form is an inquiry, not a reserved installation date." },
      { q: "Will metal fencing work with my city or HOA rules?", a: "Requirements vary by property and fence design. Share any HOA guidelines, survey or approval documents you already have. Materials, height, placement and approval responsibilities are confirmed before work starts." },
    ],
    militaryAngle: false,
    relatedSlugs: ['gates', 'carports', 'barns', 'metal-garages'],
    quoteService: 'fencing',
    galleryTypes: ['Fencing'],
    forge: {
      menu: "Metal Fencing",
      eyebrow: "Now quoting fencing",
      h1a: "Metal fencing.",
      h1b: "A better boundary.",
      lede: "More privacy at home. A defined boundary for your land. Triple J Metal builds metal privacy fencing, pipe and ranch fencing, and ornamental metal fences for Central Texas properties — tell our Temple-based crew what you need and we’ll work through the layout with you.",
      img: "/images/metal-fence-ranch-wire.webp",
      imgAlt: "Metal ranch wire fencing built by Triple J Metal",
      pos: "60% 50%",
      facts: [
        { k: "Styles", v: "Privacy · Pipe · Ornamental", s: "Gates in the same quote" },
        { k: "Service area", v: "Temple, Belton, Killeen", s: "And nearby Central Texas" },
        { k: "Quotes", v: "Project-specific", s: "Footage, height, finish, terrain" },
        { k: "Crew", v: "English & Español", s: "Talk to the people building it" },
      ],
      optEyebrow: "Find your fence",
      optHeading: "What should it do?",
      optLede: "Privacy, a defined property line, or an open frame that keeps the view. Pick a style to see how we approach it.",
      options: [
        { label: "Privacy", title: "Metal privacy fencing", body: "Create a more private yard or screen a work area with metal panels. We’ll discuss height, finish, post layout and the look you want before quoting.", price: "Quoted to scope", note: "Height · finish · post layout" },
        { label: "Pipe & ranch", title: "Pipe & ranch fencing", body: "Define your acreage, frontage or ranch entrance with pipe fencing. Tell us how the land is used so we can discuss the right layout and any livestock containment needs.", price: "Quoted to scope", note: "Acreage · frontage · livestock", img: "/images/metal-fence-ranch-wire.webp" },
        { label: "Ornamental", title: "Ornamental metal fencing", body: "Frame your property with an open metal fence that preserves the view. Discuss picket style, spacing, height and finish with our crew.", price: "Quoted to scope", note: "Picket style · spacing · finish" },
        { label: "Gates", title: "Gates & property access", body: "Plan pedestrian or driveway access alongside your fence. Share the number of gates and approximate opening widths so access is part of the quote from the start.", price: "Quoted to scope", note: "Gate count · opening widths" },
      ],
      techHeading: "A fence has to fit its site.",
      specs: [
        { k: "Styles", v: "Privacy, pipe & ranch, ornamental" },
        { k: "Gates", v: "Pedestrian or driveway, planned in" },
        { k: "Quote factors", v: "Length, height, material, terrain, access, removal" },
        { k: "Site review", v: "Slopes, drainage, boundaries" },
        { k: "Approvals", v: "City & HOA requirements confirmed first" },
      ],
      related: ["gates", "carports"],
    },
  },

  gates: {
    slug: 'gates',
    title: 'Metal Gates',
    shortTitle: 'Gates',
    keywordGap: null,
    metaTitle: 'Metal Gates in Temple, Belton & Killeen',
    metaDescription: "Walk gates, driveway gates and ranch entrances, planned with your metal fence by Temple-based Triple J Metal. Request a free quote.",
    heroHeadline: 'Metal Gates in Temple, Belton & Killeen',
    heroCopy: "Walk gates, driveway gates and ranch entrances, planned alongside your metal fence by our Temple-based crew. Tell us how many openings you need and roughly how wide — access is part of the quote from the start.",
    mainBenefit: "Access planned in, not bolted on later.",
    featuresHeading: "Access planned in, not bolted on later.",
    initialService: 'fencing',
    trustPoints: ['Temple-based crew', 'English & Spanish', 'Project-specific quotes'],
    features: [
      { title: "Pedestrian gates", description: "Walk-through gates for yards, side yards and work areas, planned into the fence layout." },
      { title: "Driveway gates", description: "Openings sized to the vehicles and trailers that use them. An approximate width is enough to start." },
      { title: "Ranch & pipe entrances", description: "Entrances for acreage and ranch frontage, laid out around how the land is used and any livestock needs." },
      { title: "Opening widths, up front", description: "Share the number of gates and approximate widths so access is part of the quote from the start." },
      { title: "Hardware confirmed in writing", description: "Gate operation and any special hardware are confirmed during quoting and listed in your written quote." },
      { title: "Matched to your fence", description: "Privacy, pipe and ranch, or ornamental — each gate is planned with the fence style around it." },
    ],
    technicalAuthority: "A gate has to work with its site: the slope across the opening, drainage, how vehicles turn in, property boundaries, and any city or HOA requirements. Share your address, approximate opening widths and any existing plans so the layout and materials can be reviewed before installation.",
    competitorRows: [],
    faqs: [
      { q: "Can I add gates to a new fence?", a: "Yes. Include pedestrian or driveway gates in your request, with approximate opening widths if known. Gate operation and any special hardware are confirmed during quoting." },
      { q: "Do I need exact opening widths?", a: "No. Approximate widths are enough to start. We’ll confirm measurements and the layout before a final scope is agreed." },
      { q: "How much does a gate cost?", a: "Every gate is quoted to its scope — opening width, gate type, material and finish, hardware and site conditions all affect the price. Send approximate measurements to get the conversation started." },
      { q: "Will a gate work with my HOA or city rules?", a: "Requirements vary by property and design. Share any HOA guidelines, survey or approval documents you already have; materials, height, placement and approval responsibilities are confirmed before work starts." },
    ],
    militaryAngle: false,
    relatedSlugs: ['metal-fencing', 'carports'],
    quoteService: 'fencing',
    galleryTypes: ['Fencing'],
    forge: {
      menu: "Gates",
      eyebrow: "Gates & property access",
      h1a: "Metal gates.",
      h1b: "An entrance that fits.",
      lede: "Walk gates, driveway gates and ranch entrances, planned alongside your metal fence by our Temple-based crew. Tell us how many openings you need and roughly how wide — access is part of the quote from the start.",
      img: "/images/metal-fence-ranch-wire.webp",
      imgAlt: "Metal ranch fence line where a gate entrance is planned",
      pos: "20% 50%",
      facts: [
        { k: "Types", v: "Walk · Drive · Ranch", s: "Pedestrian to full entrance" },
        { k: "Sizing", v: "Openings planned first", s: "Approximate widths are enough" },
        { k: "Hardware", v: "Confirmed in your quote", s: "Operation & special hardware" },
        { k: "Paired with", v: "Your fence style", s: "Privacy, pipe or ornamental" },
      ],
      optEyebrow: "Pick the opening",
      optHeading: "How do you come and go?",
      optLede: "Every gate starts with how it gets used — on foot, by truck, or with a trailer and livestock behind you.",
      options: [
        { label: "Walk gate", title: "Pedestrian gates", body: "A walk-through gate for the yard, side yard or work area, matched to the fence it sits in. Tell us where you come and go and we’ll plan the opening into the layout.", price: "Quoted to scope", note: "Location · opening width" },
        { label: "Driveway gate", title: "Driveway gates", body: "A driveway gate sized to the vehicles and trailers that use it. Share the approximate opening width; gate operation and any special hardware are confirmed during quoting.", price: "Quoted to scope", note: "Opening width · operation · hardware" },
        { label: "Ranch entrance", title: "Ranch & pipe entrances", body: "Frame an acreage or ranch entrance with pipe fencing and a gate built for how the land is used — equipment, trailers or livestock behind it.", price: "Quoted to scope", note: "Frontage · equipment · livestock", img: "/images/metal-fence-ranch-wire.webp" },
      ],
      techHeading: "Measure twice, open once.",
      specs: [
        { k: "Types", v: "Pedestrian, driveway, ranch entrance" },
        { k: "To quote", v: "Gate count + approximate widths" },
        { k: "Hardware", v: "Confirmed during quoting" },
        { k: "Site review", v: "Slope, drainage, turn-in, boundaries" },
        { k: "Approvals", v: "City & HOA requirements confirmed first" },
      ],
      related: ["metal-fencing", "carports"],
    },
  },

  // ─── GAP 2: Welded vs Bolted ─────────────────────────────────────────────
  carports: {
    slug: 'carports',
    title: 'Custom Metal Carports',
    shortTitle: 'Carports',
    keywordGap: 2,
    metaTitle: 'Welded & Bolted Metal Carports, Temple TX',
    metaDescription:
      "Welded or bolted metal carports in Temple, Belton, Killeen & Central Texas. Same-week installs, concrete available.",
    heroHeadline: 'Custom Metal Carports — Welded or Bolted, Same-Week Installs',
    heroCopy:
      "Triple J Metal builds and installs welded or bolted red iron carports in Temple, Belton, Killeen, and surrounding Central Texas communities. Choose the dimensions, roof style, and coverage that fit your property. Our crew can include site prep and a separately priced concrete pad in the same contract.",
    mainBenefit: "Welded or bolted red iron, sized for your vehicles and installed by our local crew.",
    features: [
      { title: "Welded red iron — permanent", description: "On-site welded red iron. Standard framing is 14-gauge; a heavy-duty upgrade with 11-gauge columns is available where appropriate." },
      { title: "Bolted red iron — affordable", description: "Bolted red iron structures with delivery and installation by our crew. Site prep and concrete can be included." },
      { title: "Same-week scheduling", description: "Ask about same-week availability. Dates are confirmed after scope, materials, site readiness and approvals are reviewed." },
      { title: "Any size or configuration", description: "Single-car, double-car or commercial-width. Open, partial or fully enclosed sides. Built to your dimensions, not a catalog." },
      { title: "Concrete pad available", description: "Need a slab poured first? We handle site prep and concrete in the same contract — no separate concrete crew to hire." },
      { title: "Texas-sourced steel", description: "PBR/PBU R-Panels on Galvalume® substrate from regional Texas suppliers, with painted finish options for your project." },
    ],
    technicalAuthority: "We review the site, intended use, dimensions and foundation needs before finalizing your carport. Steel gauge, anchoring, engineering requirements, finishes and warranty terms are confirmed for the selected design. We can discuss permit requirements; filing and approval responsibilities are confirmed before work starts.",
    competitorRows: [],
    faqs: [
      { q: "What’s the difference between welded and bolted?", a: "Welded and bolted describe how structural connections are made. We offer both. The right choice depends on the design, intended use, site conditions and budget. Wind performance depends on the complete engineered system, including anchoring — not the connection method alone." },
      { q: "How much does a custom carport cost?", a: "A 20×20 flat-roof carport at 10 ft starts at $3,000 bolted or $3,300 welded for steel and installation, before tax. Concrete, walls and other add-ons are priced separately. Final pricing follows the selected dimensions and scope." },
      { q: "Do you install on existing concrete?", a: "Yes. If you already have a slab, we anchor directly to it. We can also pour a new pad as part of the same job." },
      { q: "Do you handle permits?", a: "We can discuss permit requirements for your location and project. Requirements vary; confirm the applicable approvals and who is responsible for filing before work begins." },
    ],
    militaryAngle: false,
    relatedSlugs: ['turnkey-carports-with-concrete', 'rv-covers', 'metal-garages'],
    relatedPosts: ['welded-vs-bolted-metal-buildings-central-texas'],
    featuresHeading: "Everything a carport needs, from one crew.",
    trustPoints: ['Texas-sourced red iron steel', 'Temple-based crew'],
    quoteService: 'carport',
    galleryTypes: ['Carport', 'RV Cover'],
    forge: {
      menu: "Carports",
      eyebrow: "Carports & RV covers",
      h1a: "Custom metal carports.",
      h1b: "Welded or bolted.",
      lede: "Triple J Metal builds and installs welded or bolted red iron carports in Temple, Belton, Killeen and surrounding Central Texas communities. Choose the dimensions, roof style and coverage that fit your property — site prep and a separately priced concrete pad can ride on the same contract.",
      img: "/images/carport-gable-residential.jpg",
      imgAlt: "Gable-roof metal carport built by Triple J Metal on a residential property",
      pos: "50% 55%",
      facts: [
        { k: "Starting at", v: "$3,000", s: "20×20 bolted · steel + install" },
        { k: "Construction", v: "Welded or bolted", s: "Red iron, built by our crew" },
        { k: "Scheduling", v: "Same-week", s: "Confirmed after scope review" },
        { k: "Concrete", v: "Same contract", s: "Site prep + pad, priced separately" },
      ],
      optEyebrow: "Welded or bolted",
      optHeading: "Choose how it’s built.",
      optLede: "Both are red iron and both are installed by our own crew. The right one depends on the design, how you’ll use it, the site and your budget.",
      options: [
        { label: "Welded", title: "Welded red iron. Permanent.", body: "On-site welded red iron with material and connection details confirmed for your project. Standard framing is 14-gauge; a heavy-duty upgrade with 11-gauge columns is available where appropriate.", price: "From $3,300", note: "20×20 flat roof · 10 ft · steel + install, before tax", img: "/images/red-iron-frame-hero.jpg", structure: "welded" },
        { label: "Bolted", title: "Bolted red iron. Affordable.", body: "Bolted red iron, delivered and installed by our crew — and it can be moved later. Site preparation and concrete can be included in the quoted scope.", price: "From $3,000", note: "20×20 flat roof · 10 ft · steel + install, before tax", img: "/images/double-carport-install.jpg", structure: "bolted" },
        { label: "Turnkey + concrete", title: "Pad and carport. One contract.", body: "Plan the pad and the carport together. We handle site prep, concrete and the steel structure under one contract, itemized so you can see exactly what’s included.", price: "Quoted to scope", note: "Concrete priced separately · 3,000 PSI std, 4,000 on request", img: "/images/carport-truck-concrete-hero.jpg", concrete: "yes" },
      ],
      techHeading: "Sized for your site, not a catalog.",
      specs: [
        { k: "Framing", v: "14-gauge red iron standard" },
        { k: "Heavy-duty upgrade", v: "11-gauge columns, welded to receivers & purlins" },
        { k: "Panels", v: "PBR / PBU on Galvalume®" },
        { k: "Finish", v: "40-year painted finish" },
        { k: "Sizes", v: "Single, double, commercial — your dimensions" },
        { k: "Concrete", v: "3,000 PSI standard · 4,000 PSI on request" },
      ],
      related: ["metal-fencing", "gates"],
    },
  },

  // ─── GAP 1: Turnkey + Concrete ───────────────────────────────────────────
  'turnkey-carports-with-concrete': {
    slug: 'turnkey-carports-with-concrete',
    title: 'Turnkey Carports with Concrete',
    shortTitle: 'Turnkey + Concrete',
    keywordGap: 1,
    metaTitle: 'Carports With Concrete Pads, Central Texas',
    metaDescription:
      "Carports with site prep, concrete and steel installation in one contract. Temple-based Triple J Metal serves Central Texas. Request an itemized quote.",
    heroHeadline: 'Carports with Concrete — One Contract, Start to Finish',
    heroCopy:
      "Plan the pad and the carport together. Triple J Metal can handle site preparation, concrete, and a welded or bolted steel structure under one contract. We itemize the scope so you can see what is included and coordinate the work with one company.",
    mainBenefit: "Site prep, concrete and your steel structure — planned together in one contract.",
    features: [
      {
        title: 'Site Grading & Prep',
        description:
          'Our John Deere skid-steer handles grading, leveling, and site preparation. We remove brush, grade the pad area, and ensure proper drainage before the concrete is poured.',
      },
      {
        title: 'Concrete Pad Pouring',
        description:
          'Concrete poured on-site at 3,000 PSI standard (4,000 PSI on request), properly reinforced, and cured to meet Bell County soil requirements. Sized to your structure dimensions.',
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
      "We review the site, intended use, dimensions, and foundation needs before finalizing your turnkey + concrete project. Steel gauge, anchoring, engineering requirements, finishes, and warranty terms are confirmed for the selected design. Concrete is available as a separately priced part of the same contract. We can discuss permit requirements; filing and approval responsibilities must be confirmed before work starts.",
    competitorRows: [],
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
    relatedPosts: [
      'welded-vs-bolted-metal-buildings-central-texas',
      'blackland-prairie-soil-metal-building-foundation',
    ],
    quoteService: 'carport',
    galleryTypes: ["Carport"],
    galleryTag: 'Turnkey',
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
      'A metal garage from Triple J Metal isn\'t a shed from a big-box store. It\'s a fully-enclosed red iron steel structure, custom-welded or bolted to your exact dimensions, installed on your property, with site prep and a concrete pad available in the same contract. Single-bay, double-bay, or multi-car — we build every configuration in Central Texas.',
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
        title: 'Heavy-Duty Upgrade',
        description:
          'Standard framing is 14-gauge. The heavy-duty upgrade adds 11-gauge columns, welded to the receivers and purlins.',
      },
      {
        title: 'Insulation Ready',
        description:
          'Framing is spaced for standard insulation installation. We can advise on insulation options to keep your tools and vehicles protected year-round.',
      },
    ],
    technicalAuthority:
      "We review the site, intended use, dimensions, and foundation needs before finalizing your garages project. Steel gauge, anchoring, engineering requirements, finishes, and warranty terms are confirmed for the selected design. Concrete is available as a separately priced part of the same contract. We can discuss permit requirements; filing and approval responsibilities must be confirmed before work starts.",
    competitorRows: [],
    faqs: [
  {
    "q": "How much does a metal garage cost?",
    "a": "Garage pricing depends on the frame, walls, doors, dimensions, and foundation. Our 30×30 flat-roof steel-and-install base starts at $5,500 before tax; enclosure, doors, concrete, and other add-ons are priced separately. Ask for a complete project quote."
  },
  {
    "q": "Can you add windows and side doors?",
    "a": "Yes. We can frame openings for windows, man-doors, and any door configuration during construction."
  },
  {
    "q": "Can the garage be insulated?",
    "a": "We can frame the structure for insulation. We'll connect you with insulation contractors, or you can handle that phase yourself after we're done."
  }
],
    militaryAngle: false,
    relatedSlugs: ['carports', 'turnkey-carports-with-concrete', 'barns'],
    relatedPosts: ['welded-vs-bolted-metal-buildings-central-texas'],
    quoteService: 'garage',
    galleryTypes: ["Garage"],
  },


  // ─── Barns ───────────────────────────────────────────────────────────────
  barns: {
    slug: 'barns',
    title: 'Metal Barns & Ranch Structures',
    shortTitle: 'Barns',
    keywordGap: null,
    metaTitle: 'Metal Barns & Ag Buildings, Central Texas',
    metaDescription:
      'Metal barns and ranch structures across Bell and Coryell counties. Welded or bolted red iron, concrete available, same-week installs.',
    heroHeadline: 'Metal Barns Built for Central Texas Ranch Life',
    heroCopy:
      "Plan a barn around how you use your land: equipment storage, hay, livestock shelter, or a combination of uses. Triple J Metal offers welded or bolted steel structures with layout, access, anchoring, and foundation details confirmed for the project.",
    mainBenefit: 'Welded red iron barns engineered for Central Texas weather — livestock, equipment, hay, or mixed use.',
    features: [
      {
        title: 'Welded Red Iron Framing',
        description:
          '14-gauge red iron steel with an optional 11-gauge heavy-duty column upgrade, welded on-site. Permanent, storm-proof, and built to last decades without bolt connections loosening.',
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
      "We review the site, intended use, dimensions, and foundation needs before finalizing your barns project. Steel gauge, anchoring, engineering requirements, finishes, and warranty terms are confirmed for the selected design. Concrete is available as a separately priced part of the same contract. We can discuss permit requirements; filing and approval responsibilities must be confirmed before work starts.",
    competitorRows: [],
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
    relatedPosts: ['welded-vs-bolted-metal-buildings-central-texas'],
    quoteService: 'barn',
    galleryTypes: ["Barn"],
  },


  // ─── GAP 3: Speed + Military ─────────────────────────────────────────────
  'rv-covers': {
    slug: 'rv-covers',
    relatedPosts: [
      'welded-vs-bolted-metal-buildings-central-texas',
      'blackland-prairie-soil-metal-building-foundation',
    ],
    title: 'RV & Boat Covers',
    shortTitle: 'RV & Boat Covers',
    keywordGap: 3,
    metaTitle: 'RV Covers in Central TX | Military Discount',
    metaDescription:
      "Custom RV and boat covers across Central Texas — same-week scheduling, military discount, concrete available.",
    heroHeadline: 'RV & Boat Covers — Same-Week Installs, Texas Hail Won\'t Wait',
    heroCopy:
      "Texas hail season doesn't send a calendar invite. A single storm can total an unprotected RV or boat in minutes. Triple J Metal builds tall-clearance RV and boat covers for Central Texas properties — with same-week scheduling once your build is approved. If you just bought an RV, just PCS'd to Fort Cavazos, or just had a close call with hail — call us today.",
    mainBenefit: 'Same-week scheduling. Military discount available for Fort Cavazos families.',
    features: [
  {
    "title": "Tall Clearance for Class A & Class C RVs",
    "description": "Standard clearance heights from 12–16 feet. We build to your RV or boat's exact height requirements — no squeezing under a low kit structure."
  },
  {
    "title": "Same-Week Install — No Waiting",
    "description": "Ask about same-week availability. Installation dates are confirmed after scope, materials, site readiness, and any required approvals are reviewed."
  },
  {
    "title": "Fort Cavazos Military Discount",
    "description": "Active duty, veterans, and first responders receive a discount on all RV and boat cover installs. PCS'ing to Fort Cavazos? We'll protect your vehicle before your household goods arrive."
  },
  {
    "title": "Welded or Bolted — Your Choice",
    "description": "Custom welded red iron for a permanent installation, or bolted for a more budget-friendly option. Both built and installed by our crew."
  },
  {
    "title": "Concrete Pad Available",
    "description": "Pull your RV onto a fresh concrete pad — no gravel, no ruts. We can pour the slab and install the cover in the same contract."
  },
  {
    "title": "Side Curtains & Enclosures",
    "description": "Need extra weather protection? We can add metal side panels or roll-up doors for a fully or partially enclosed RV storage bay."
  }
],
    technicalAuthority:
      "We review the site, intended use, dimensions, and foundation needs before finalizing your rv & boat covers project. Steel gauge, anchoring, engineering requirements, finishes, and warranty terms are confirmed for the selected design. Concrete is available as a separately priced part of the same contract. We can discuss permit requirements; filing and approval responsibilities must be confirmed before work starts.",
    competitorRows: [],
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
        a: `Most jobs are scheduled within 2–5 business days of quote acceptance, weather permitting. Call ${SITE.phone} for current availability.`,
      },
    ],
    militaryAngle: true,
    relatedSlugs: ['carports', 'turnkey-carports-with-concrete', 'hoa-compliant-structures'],
    quoteService: 'rv_cover',
    galleryTypes: ["RV Cover"],
  },


  // ─── GAP 4: HOA / Luxury Subdivision ────────────────────────────────────
  'hoa-compliant-structures': {
    slug: 'hoa-compliant-structures',
    title: 'HOA-Compliant Metal Structures',
    shortTitle: 'HOA Structures',
    keywordGap: 4,
    metaTitle: 'HOA-Compliant Metal Carports & Porches',
    metaDescription:
      'HOA-compliant metal carports, garages and porches with architectural panel finishes for Heritage Oaks, Bella Charca and Central Texas luxury subdivisions.',
    heroHeadline: 'HOA-Compliant Metal Structures for Central Texas Luxury Subdivisions',
    heroCopy:
      "Planning a carport, detached garage, or cover for a property with architectural guidelines? Share those requirements before choosing a design. We offer finish, profile, and color options to help you prepare a proposal for review, including Board & Batten and concealed-fastener systems. Approval rests with the reviewing authority; concrete and site prep can be quoted in the same contract.",
    mainBenefit: 'Architectural panel and finish options to discuss against your property’s specific HOA guidelines.',
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
        title: 'Heavy-Duty Upgrade',
        description:
          'For premium structures, the heavy-duty upgrade adds 11-gauge columns, welded to the receivers and purlins. The rest of the frame stays 14-gauge.',
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
      "We review the site, intended use, dimensions, and foundation needs before finalizing your hoa structures project. Steel gauge, anchoring, engineering requirements, finishes, and warranty terms are confirmed for the selected design. Concrete is available as a separately priced part of the same contract. We can discuss permit requirements; filing and approval responsibilities must be confirmed before work starts.",
    competitorRows: [],
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
    relatedPosts: ['hoa-compliant-metal-buildings-heritage-oaks-bella-charca'],
  },
}

/**
 * One photo per service for the services index cards and the hero of service
 * pages without Forge content. See src/app/(marketing)/services/page.tsx for
 * where each one came from and how to find better candidates.
 */
export const SERVICE_PHOTOS: Record<string, string> = {
  carports: "https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/1777195148318.jpg",
  "turnkey-carports-with-concrete": "https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/1777195038839.jpeg",
  "metal-garages": "/images/metal-garage-green.jpg",
  barns: "https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/1777195257805.jpg",
  "rv-covers": "https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/1777195863079.jpg",
  "hoa-compliant-structures": "https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/1777194918087.jpg",
  "metal-fencing": "/images/metal-fence-ranch-wire.webp",
  gates: "/images/metal-fence-ranch-wire.webp",
};

export const SERVICE_SLUGS = Object.keys(SERVICES)
