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
    heroCopy: 'Privacy at home. A clear boundary for your land. An entrance that fits. Triple J Metal builds metal privacy, pipe and ranch, and ornamental fencing, plus gates, for Central Texas properties. Tell our Temple crew what you need and we’ll lay it out with you.',
    mainBenefit: 'Your fence, your layout, built by a crew you can call.',
    featuresHeading: 'Find the right fence.',
    initialService: 'fencing',
    trustPoints: ['Temple-based crew', 'English & Spanish', 'Project-specific quotes'],
    features: [
      { title: "Metal privacy fencing", description: "Screen a yard or work area with metal panels. We settle height, finish and post layout before we quote." },
      { title: "Pipe & ranch fencing", description: "Mark acreage, frontage or a ranch entrance. Tell us how the land is used, livestock included." },
      { title: "Ornamental metal fencing", description: "An open metal fence that frames the property and keeps the view. You pick the style, spacing, height and finish." },
      { title: "Gates & property access", description: "Walk gates and driveway gates, planned with the fence so access is in the quote from day one." },
      { title: "A quote built around your site", description: "Length, height, material, terrain, access and old-fence removal all shape the scope. It’s all in your written quote." },
      { title: "Help choosing a layout", description: "Not sure where to start? Send your ZIP, rough footage and a description of the property. We’ll talk options." },
    ],
    technicalAuthority: "Based in Temple, we take fencing inquiries from Temple, Belton, Killeen, Harker Heights and nearby towns. Slope, drainage, gate openings, boundaries and any city or HOA rules all matter. Send your address and any plans so we can review the layout and materials before install.",
    competitorRows: [],
    faqs: [
      { q: "What types of metal fencing do you offer?", a: "Privacy, pipe and ranch, and ornamental fencing, plus gates. Pick a style on the quote form, or tell us what you want the fence to do." },
      { q: "How much does a metal fence cost?", a: "Every fence is quoted to its scope: length, height, material, finish, gates, terrain and removal work. Send rough measurements to start. Final pricing follows a site review." },
      { q: "Do I need exact measurements to request a quote?", a: "No. Rough footage and height are enough. We confirm measurements and layout before the scope is final." },
      { q: "When can you install my fence?", a: "Tell us your timing. We confirm the schedule after reviewing the site, scope, materials and any approvals. The quote form is an inquiry, not a reserved date." },
      { q: "Will metal fencing work with my city or HOA rules?", a: "Rules vary by property and design. Send any HOA guidelines, survey or approvals you have. We confirm materials, height, placement and who handles approvals before work starts." },
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
      lede: "Privacy at home. A clear line around your land. Triple J Metal builds metal privacy, pipe and ranch, and ornamental fencing across Central Texas. Tell our Temple crew what you need and we’ll lay it out with you.",
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
      optLede: "Privacy, a property line, or an open frame that keeps the view. Pick a style.",
      options: [
        { label: "Privacy", title: "Metal privacy fencing", body: "Screen a yard or work area with metal panels. We settle height, finish and post layout before quoting.", price: "Quoted to scope", note: "Height · finish · post layout" },
        { label: "Pipe & ranch", title: "Pipe & ranch fencing", body: "Mark your acreage, frontage or ranch entrance with pipe fencing. Tell us how the land is used, livestock included.", price: "Quoted to scope", note: "Acreage · frontage · livestock", img: "/images/metal-fence-ranch-wire.webp" },
        { label: "Ornamental", title: "Ornamental metal fencing", body: "Frame the property with an open metal fence that keeps the view. Pick the picket style, spacing, height and finish with our crew.", price: "Quoted to scope", note: "Picket style · spacing · finish" },
        { label: "Gates", title: "Gates & property access", body: "Plan walk or driveway access with the fence. Share the gate count and rough opening widths so it’s in the quote from the start.", price: "Quoted to scope", note: "Gate count · opening widths" },
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
    heroCopy: "Walk gates, driveway gates and ranch entrances, planned with your metal fence by our Temple crew. Tell us how many openings and roughly how wide. Access is in the quote from the start.",
    mainBenefit: "Access planned in, not bolted on later.",
    featuresHeading: "Access planned in, not bolted on later.",
    initialService: 'fencing',
    trustPoints: ['Temple-based crew', 'English & Spanish', 'Project-specific quotes'],
    features: [
      { title: "Pedestrian gates", description: "Walk-through gates for yards, side yards and work areas, planned into the fence layout." },
      { title: "Driveway gates", description: "Openings sized to the vehicles and trailers that use them. A rough width is enough to start." },
      { title: "Ranch & pipe entrances", description: "Entrances for acreage and ranch frontage, laid out around how the land is used, livestock included." },
      { title: "Opening widths, up front", description: "Share the gate count and rough widths so access is in the quote from the start." },
      { title: "Hardware confirmed in writing", description: "Gate operation and any special hardware are confirmed while quoting and listed in your written quote." },
      { title: "Matched to your fence", description: "Privacy, pipe and ranch, or ornamental: each gate is planned with the fence around it." },
    ],
    technicalAuthority: "A gate has to work with its site: the slope across the opening, drainage, how vehicles turn in, boundaries, and any city or HOA rules. Send your address, rough opening widths and any plans so we can review the layout and materials before install.",
    competitorRows: [],
    faqs: [
      { q: "Can I add gates to a new fence?", a: "Yes. Add walk or driveway gates to your request, with rough opening widths if you know them. We confirm operation and any special hardware while quoting." },
      { q: "Do I need exact opening widths?", a: "No. Rough widths are enough to start. We confirm measurements and layout before the scope is final." },
      { q: "How much does a gate cost?", a: "Every gate is quoted to its scope: opening width, type, material, finish, hardware and site conditions. Send rough measurements to start the conversation." },
      { q: "Will a gate work with my HOA or city rules?", a: "Rules vary by property and design. Send any HOA guidelines, survey or approvals you have. We confirm materials, height, placement and who handles approvals before work starts." },
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
      lede: "Walk gates, driveway gates and ranch entrances, planned with your metal fence by our Temple crew. Tell us how many openings and roughly how wide. Access is in the quote from the start.",
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
      optLede: "Every gate starts with how you use it: on foot, by truck, or with a trailer or livestock behind you.",
      options: [
        { label: "Walk gate", title: "Pedestrian gates", body: "A walk-through gate for the yard, side yard or work area, matched to the fence around it. Tell us where you come and go and we’ll plan the opening in.", price: "Quoted to scope", note: "Location · opening width" },
        { label: "Driveway gate", title: "Driveway gates", body: "A driveway gate sized to the vehicles and trailers that use it. Share a rough opening width. We confirm operation and any special hardware while quoting.", price: "Quoted to scope", note: "Opening width · operation · hardware" },
        { label: "Ranch entrance", title: "Ranch & pipe entrances", body: "Frame an acreage or ranch entrance with pipe fencing and a gate built for how the land is used: equipment, trailers or livestock.", price: "Quoted to scope", note: "Frontage · equipment · livestock", img: "/images/metal-fence-ranch-wire.webp" },
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
      "Triple J Metal builds welded or bolted red iron carports in Temple, Belton, Killeen and across Central Texas. Pick the size, roof style and coverage. We can put site prep and a separately priced concrete pad on the same contract.",
    mainBenefit: "Welded or bolted red iron, sized for your vehicles and installed by our local crew.",
    features: [
      { title: "Welded red iron — permanent", description: "Red iron welded on site. Standard framing is 14-gauge. The heavy-duty upgrade adds 11-gauge columns, welded to the receivers and purlins." },
      { title: "Bolted red iron — affordable", description: "Bolted red iron, delivered and installed by our crew. Site prep and a concrete pad available." },
      { title: "Same-week scheduling", description: "Ask about same-week availability. We confirm the date after reviewing scope, materials, site readiness and approvals." },
      { title: "Any size or configuration", description: "Single, double or commercial width. Open, partial or fully enclosed. Built to your dimensions, not a catalog." },
      { title: "Concrete pad available", description: "Need a slab first? We handle site prep and concrete on the same contract. No separate crew to hire." },
      { title: "Texas-sourced steel", description: "PBR/PBU R-Panels on Galvalume® substrate from regional Texas suppliers, in painted finishes." },
    ],
    technicalAuthority: "We review the site, use, dimensions and foundation before we finalize your carport. Gauge, anchoring, engineering, finishes and warranty are confirmed for your design. We can talk through permit requirements. Filing and approvals are confirmed before work starts.",
    competitorRows: [],
    faqs: [
      { q: "What’s the difference between welded and bolted?", a: "Both describe how structural connections are made, and we offer both. The right pick depends on the design, use, site and budget. Wind performance comes from the whole engineered system, anchoring included, not the connection method alone." },
      { q: "How much does a custom carport cost?", a: "A 20×20 flat-roof carport at 10 ft starts at $3,000 bolted or $3,300 welded, steel and installation, before tax. Concrete, walls and other add-ons are priced separately. Final pricing follows your dimensions and scope." },
      { q: "Do you install on existing concrete?", a: "Yes. If you already have a slab, we anchor straight to it. We can also pour a new pad on the same job." },
      { q: "Do you handle permits?", a: "We’ll talk you through the permit requirements for your location and project. They vary, so we confirm which approvals apply and who files before work begins." },
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
      lede: "Triple J Metal builds welded or bolted red iron carports in Temple, Belton, Killeen and across Central Texas. Pick the size, roof style and coverage. Site prep and a separately priced concrete pad can ride on the same contract.",
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
      optLede: "Both are red iron, and our own crew installs both. The right one depends on the design, the site and your budget.",
      options: [
        { label: "Welded", title: "Welded red iron. Permanent.", body: "Red iron welded on site, with material and connection details confirmed for your project. Standard framing is 14-gauge. The heavy-duty upgrade adds 11-gauge columns, welded to the receivers and purlins.", price: "From $3,300", note: "20×20 flat roof · 10 ft · steel + install, before tax", img: "/images/red-iron-frame-hero.jpg", structure: "welded" },
        { label: "Bolted", title: "Bolted red iron. Affordable.", body: "Bolted red iron, delivered and installed by our crew, and it can be moved later. Site prep and a concrete pad available.", price: "From $3,000", note: "20×20 flat roof · 10 ft · steel + install, before tax", img: "/images/double-carport-install.jpg", structure: "bolted" },
        { label: "Turnkey + concrete", title: "Pad and carport. One contract.", body: "Plan the pad and the carport together. We handle site prep, concrete and the steel structure on one contract, itemized so you see exactly what’s in it.", price: "Quoted to scope", note: "Concrete priced separately · 3,000 PSI std, 4,000 on request", img: "/images/carport-truck-concrete-hero.jpg", concrete: "yes" },
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
      "Plan the pad and the carport together. Triple J Metal can handle site prep, concrete and a welded or bolted steel structure on one contract. We itemize the scope so you see what’s in it, and you deal with one company.",
    mainBenefit: "Site prep, concrete and your steel structure, planned together on one contract.",
    features: [
      {
        title: 'Site Grading & Prep',
        description:
          'Our John Deere skid-steer clears brush, grades and levels the pad area, and sets up drainage before the pour.',
      },
      {
        title: 'Concrete Pad Pouring',
        description:
          'Poured on site at 3,000 PSI standard (4,000 PSI on request), reinforced, and sized to your structure.',
      },
      {
        title: 'Steel Structure Installation',
        description:
          'Once the pad cures, our crew returns to erect the carport, garage or barn, welded or bolted, any size. The structure anchors to the pad.',
      },
      {
        title: 'One Invoice, One Warranty',
        description:
          'No finger-pointing between your concrete crew and your steel crew. Triple J Metal owns the whole job, ground to roof.',
      },
      {
        title: 'All Structure Types',
        description:
          'This package covers carports, garages, barns, RV covers and metal porches. If it sits on a pad, ask us.',
      },
      {
        title: 'Permit Advisory',
        description:
          'We walk you through Bell County and nearby county requirements. Who files what is confirmed in your written scope.',
      },
    ],
    technicalAuthority:
      "We review the site, use, dimensions and foundation before we finalize your turnkey project. Gauge, anchoring, engineering, finishes and warranty are confirmed for your design. Concrete is a separately priced part of the same contract. We can talk through permit requirements. Filing and approvals are confirmed before work starts.",
    competitorRows: [],
    faqs: [
      {
        q: 'Can you pour the concrete too?',
        a: 'Yes. We grade the site, pour the pad and build the structure on one contract. Concrete is priced as its own line, so you can see what each part costs.',
      },
      {
        q: 'How thick will the concrete pad be?',
        a: 'Standard residential carport and garage pads are 4" thick with reinforcement. We pour 6" reinforced slabs for heavier structures or RV weights. We recommend the right spec during your quote.',
      },
      {
        q: 'How long does the whole process take?',
        a: 'Grading and concrete usually take one day. After a 7-day cure, we return and usually install the structure the same day. Total project time is 8–10 days from job start, weather permitting.',
      },
      {
        q: 'Can you pour concrete on a sloped site?',
        a: 'Yes. We grade and level first. Steep slopes may need extra site prep, and we assess that on the quote walk.',
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
      'A Triple J Metal garage isn’t a big-box shed. It’s a fully enclosed red iron structure, welded or bolted to your exact dimensions and installed on your property. Site prep and a concrete pad are available on the same contract. Single, double or multi-bay, built in Central Texas.',
    mainBenefit: 'A fully enclosed garage built to your dimensions. Welded or bolted, concrete pad available.',
    features: [
      {
        title: 'Fully Enclosed Red Iron',
        description:
          'Four walls, a pitched roof and the door setup you choose. All red iron: stronger and more permanent than wood framing.',
      },
      {
        title: 'Custom Dimensions',
        description:
          'Single-car (12–14 ft wide), double-car (20–24 ft wide) or multi-bay. Any length. No standard catalog.',
      },
      {
        title: 'Roll-Up or Walk-In Doors',
        description:
          'Standard or commercial roll-up doors, or framed openings for your own doors. Your call.',
      },
      {
        title: 'Concrete Pad in One Contract',
        description:
          'Skip the separate concrete crew. We can pour the pad, install the garage and hand you the keys on one invoice.',
      },
      {
        title: 'Heavy-Duty Upgrade',
        description:
          'Standard framing is 14-gauge. The heavy-duty upgrade adds 11-gauge columns, welded to the receivers and purlins.',
      },
      {
        title: 'Insulation Ready',
        description:
          'Framing is spaced for standard insulation. We can advise on options to protect your tools and vehicles year-round.',
      },
    ],
    technicalAuthority:
      "We review the site, use, dimensions and foundation before we finalize your garage. Gauge, anchoring, engineering, finishes and warranty are confirmed for your design. Concrete is a separately priced part of the same contract. We can talk through permit requirements. Filing and approvals are confirmed before work starts.",
    competitorRows: [],
    faqs: [
  {
    "q": "How much does a metal garage cost?",
    "a": "Garage pricing depends on the frame, walls, doors, dimensions and foundation. Our 30×30 flat-roof steel-and-install base starts at $5,500 before tax. Enclosure, doors, concrete and other add-ons are priced separately. Ask for a full project quote."
  },
  {
    "q": "Can you add windows and side doors?",
    "a": "Yes. We frame openings for windows, man-doors and any door setup during construction."
  },
  {
    "q": "Can the garage be insulated?",
    "a": "We frame the structure for insulation. We can connect you with insulation contractors, or you can handle that phase yourself."
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
      "Plan the barn around how you use your land: equipment, hay, livestock shelter, or a mix. Triple J Metal builds welded or bolted steel structures, with layout, access, anchoring and foundation confirmed for your project.",
    mainBenefit: 'Welded or bolted red iron barns for livestock, equipment, hay or mixed use.',
    features: [
      {
        title: 'Welded Red Iron Framing',
        description:
          '14-gauge red iron, welded on site, with an optional 11-gauge heavy-duty column upgrade. Permanent and built to last.',
      },
      {
        title: 'Any Configuration',
        description:
          'Open equipment sheds, enclosed hay barns, livestock stalls or mixed multi-bay buildings. We design to your operation.',
      },
      {
        title: 'Skid-Steer Reaches 40 Feet',
        description:
          'Our John Deere skid-steer with scaffold platform reaches 40 feet — enabling taller structures like tall barns and barndominium shells that most small crews can\'t tackle.',
      },
      {
        title: 'Concrete Slab or Gravel Floor',
        description:
          'We pour concrete pads for equipment and workshops, and prep and grade gravel floors for livestock areas. Same contract.',
      },
      {
        title: 'Agricultural-Grade Panels',
        description:
          'PBR/PBU R-Panels are the standard for ag buildings. Galvalume® base steel and a 40-year painted finish resist corrosion and UV.',
      },
      {
        title: 'GC Connections for Larger Builds',
        description:
          'Need a barndominium or large commercial structure? We work with GCs on PlanHub and ToolBelt for projects beyond our standard scope.',
      },
    ],
    technicalAuthority:
      "We review the site, use, dimensions and foundation before we finalize your barn. Gauge, anchoring, engineering, finishes and warranty are confirmed for your design. Concrete is a separately priced part of the same contract. We can talk through permit requirements. Filing and approvals are confirmed before work starts.",
    competitorRows: [],
    faqs: [
      {
        q: 'Do you need permits for a farm barn in Bell County?',
        a: 'Agricultural structures often have different permit thresholds than homes. We’ll advise on what applies to your property and structure size before we start. Rural, ag-exempt land often has more flexibility.',
      },
      {
        q: 'Can you build livestock stalls inside a metal barn?',
        a: 'Yes. We frame stall partitions in the same red iron as the structure. Custom stall sizes, doors and Dutch doors are all available.',
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
      "Texas hail doesn’t send a calendar invite. One storm can total an unprotected RV or boat in minutes. Triple J Metal builds tall-clearance RV and boat covers for Central Texas properties, with same-week scheduling once your build is approved. Just bought an RV, just PCS’d to Fort Cavazos, or just had a close call with hail? Call us today.",
    mainBenefit: 'Same-week scheduling. Military discount available for Fort Cavazos families.',
    features: [
  {
    "title": "Tall Clearance for Class A & Class C RVs",
    "description": "Clearance from 12–16 feet, built to your RV or boat’s exact height. No squeezing under a low kit structure."
  },
  {
    "title": "Same-Week Scheduling",
    "description": "Ask about same-week availability. We confirm the date after reviewing scope, materials, site readiness and any approvals."
  },
  {
    "title": "Fort Cavazos Military Discount",
    "description": "Active duty, veterans and first responders get a discount on their build. PCS’ing to Fort Cavazos? We’ll protect your vehicle before your household goods arrive."
  },
  {
    "title": "Welded or Bolted — Your Choice",
    "description": "Welded red iron for a permanent install, or bolted for a more budget-friendly build. Both built and installed by our crew."
  },
  {
    "title": "Concrete Pad Available",
    "description": "Park your RV on a fresh concrete pad. No gravel, no ruts. We can pour the slab and install the cover on one contract."
  },
  {
    "title": "Side Curtains & Enclosures",
    "description": "Want more weather protection? We can add metal side panels or roll-up doors for a fully or partly enclosed RV bay."
  }
],
    technicalAuthority:
      "We review the site, use, dimensions and foundation before we finalize your RV or boat cover. Gauge, anchoring, engineering, finishes and warranty are confirmed for your design. Concrete is a separately priced part of the same contract. We can talk through permit requirements. Filing and approvals are confirmed before work starts.",
    competitorRows: [],
    faqs: [
      {
        q: 'What clearance height do I need for my RV?',
        a: 'Class A motorhomes are typically 12\'6"–13\'6" tall. We recommend at least 14\' of clearance. Bring your RV’s height and we’ll build to it.',
      },
      {
        q: 'Do you offer military discounts?',
        a: 'Yes. Active duty, veterans and first responders qualify for a discount on Triple J Metal installations. Mention your service when you call, or check the military box on the quote form.',
      },
      {
        q: 'Can I store a boat and an RV under the same structure?',
        a: 'Yes. We can build a wide multi-bay cover for both. Tell us your dimensions and we’ll design it to fit.',
      },
      {
        q: 'How quickly can you start?',
        a: `Same-week scheduling once your build is approved. We confirm the date after reviewing scope, materials and site readiness. Call ${SITE.phone} for current availability.`,
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
      "Building a carport, detached garage or cover where architectural guidelines apply? Share those rules before you pick a design. We offer finish, profile and color options, including Board & Batten and concealed-fastener systems, to help you prepare a proposal for review. The reviewing authority decides approval. Concrete and site prep can be quoted on the same contract.",
    mainBenefit: 'Architectural panel and finish options, matched against your HOA’s guidelines.',
    features: [
      {
        title: 'Concealed-Fastener Standing-Seam Roofing',
        description:
          'Premium standing-seam systems give the clean architectural profile many HOAs ask for: concealed fasteners, no exposed screws, no utility-shed look. We source from regional Texas suppliers in the gauge and color your guidelines call for.',
      },
      {
        title: 'Board & Batten Siding',
        description:
          'A classic architectural siding for upscale homes, in colors that can match your home’s exterior.',
      },
      {
        title: 'Heavy-Duty Upgrade',
        description:
          'For premium structures, the heavy-duty upgrade adds 11-gauge columns, welded to the receivers and purlins. The rest of the frame stays 14-gauge.',
      },
      {
        title: 'Low Disruption — Same-Week Build',
        description:
          'Neighbors notice long construction projects. Same-week scheduling keeps the disruption short.',
      },
      {
        title: 'Concrete & Site Prep, One Contract',
        description:
          'Skip managing two contractors. We handle site prep, concrete and the structure on one contract, with concrete priced separately.',
      },
      {
        title: 'Color Matching',
        description:
          'Our panel suppliers stock 39 painted colors across two lines. Bring your home’s trim, roof or body color and we’ll find the closest match.',
      },
    ],
    technicalAuthority:
      "We review the site, use, dimensions and foundation before we finalize your HOA-compliant structure. Gauge, anchoring, engineering, finishes and warranty are confirmed for your design. Concrete is a separately priced part of the same contract. We can talk through permit requirements. Filing and approvals are confirmed before work starts.",
    competitorRows: [],
    faqs: [
      {
        q: 'Will my HOA approve a metal structure?',
        a: 'That depends on your CC&Rs and architectural guidelines. The two big factors are panel look (standing seam vs utility R-Panel) and color continuity. Bring your HOA guidelines to the quote conversation and we’ll build a spec around them.',
      },
      {
        q: 'What\'s the difference between standing seam and standard R-Panel?',
        a: 'Standard R-Panel has exposed fasteners and a corrugated profile, so it reads agricultural or commercial. Standing seam has concealed fasteners and a clean raised seam, so it reads architectural and residential. HOAs with strict guidelines often require standing seam.',
      },
      {
        q: 'Can you match my home\'s exterior color exactly?',
        a: 'Our panel suppliers stock 39 painted colors across two lines. Bring a color chip of your home’s exterior and we’ll find the closest match. For very specific custom colors, we can discuss powder coat options.',
      },
      {
        q: 'Do you handle the HOA approval paperwork?',
        a: 'We provide the spec sheets and material documentation HOA committees typically ask for. You submit to your HOA; we supply what they need to review it.',
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
