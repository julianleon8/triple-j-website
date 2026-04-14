export type LocationData = {
  slug: string
  name: string
  county: string
  zip: string
  lat: number
  lng: number
  metaTitle: string
  metaDescription: string
  heroHeadline: string
  heroCopy: string
  areaContext: string
  whyLocal: string
  services: string[]
}

export const LOCATIONS: Record<string, LocationData> = {
  'harker-heights': {
    slug: 'harker-heights',
    name: 'Harker Heights',
    county: 'Bell County',
    zip: '76548',
    lat: 31.0804,
    lng: -97.6477,
    metaTitle: 'Metal Carports Harker Heights TX | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal LLC builds and installs welded and bolted metal carports in Harker Heights, TX. Local installer based in Temple — same-week installs available. Call 254-346-7764.',
    heroHeadline: 'Metal Carport Builders in Harker Heights, TX',
    heroCopy:
      'Harker Heights homeowners trust Triple J Metal LLC for durable, affordable metal carports installed right the first time. We\'re a local Central Texas company — not a national kit seller — which means we show up, weld it, and stand behind our work. Most installs completed within the week.',
    areaContext:
      'We serve all of Harker Heights and the surrounding Bell County area, including neighborhoods near Fort Cavazos, Clear Creek Road, and the Killeen-Fort Hood Regional Airport corridor. Whether you\'re in an established neighborhood or a rural property on the outskirts, we come to you.',
    whyLocal:
      'Every national company targeting Harker Heights ships a kit and leaves you to figure out installation. Triple J Metal LLC is based in Temple — 15 minutes away — and we handle everything: site prep, delivery, welding or bolting, and cleanup. One call, one company, done.',
    services: [
      'Welded red iron steel carports',
      'Bolted metal carports',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
      'Equipment covers',
    ],
  },

  killeen: {
    slug: 'killeen',
    name: 'Killeen',
    county: 'Bell County',
    zip: '76541',
    lat: 31.1171,
    lng: -97.7278,
    metaTitle: 'Metal Carports Killeen TX | Local Installer | Triple J Metal LLC',
    metaDescription:
      'Looking for a local carport builder in Killeen, TX? Triple J Metal LLC installs welded and bolted metal carports in Killeen and surrounding Bell County. No kits, no middlemen. Call 254-346-7764.',
    heroHeadline: 'Killeen\'s Local Metal Carport Installer',
    heroCopy:
      'Killeen has no shortage of national companies selling carport kits — but Triple J Metal LLC is one of the few local Central Texas builders who actually shows up and installs it. We\'re based in Temple, serve Killeen regularly, and offer both welded and bolted red iron steel. Cheapest full-service installer in the area.',
    areaContext:
      'We serve all of Killeen, including areas near Fort Cavazos, Killeen-Fort Hood Regional Airport, Rosewood Heights, Westcliff, and the US-190 corridor into Copperas Cove. Rural properties welcome.',
    whyLocal:
      'The Carport Co., Viking Steel, and Infinity Carports all have Killeen pages — but none of them have a local crew. Triple J Metal LLC does. We offer same-week scheduling, a local phone number, and the only welded steel option you\'ll find from a local installer.',
    services: [
      'Welded red iron steel carports',
      'Bolted metal carports',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
      'Equipment covers',
      'Ranch structures',
    ],
  },

  'copperas-cove': {
    slug: 'copperas-cove',
    name: 'Copperas Cove',
    county: 'Coryell County',
    zip: '76522',
    lat: 31.1224,
    lng: -97.907,
    metaTitle: 'Metal Carports Copperas Cove TX | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal LLC installs affordable metal carports in Copperas Cove, TX. Local Central Texas builder — welded or bolted red iron steel, same-week installs. Call 254-346-7764 for a free quote.',
    heroHeadline: 'Affordable Metal Carports in Copperas Cove, TX',
    heroCopy:
      'Copperas Cove homeowners searching for a carport builder get hit with national kit companies that ship a package and walk away. Triple J Metal LLC is different — we\'re a local Central Texas crew that installs everything ourselves. Welded or bolted, residential or ranch, we build it right at the best price in the area.',
    areaContext:
      'We serve all of Copperas Cove and Coryell County, including neighborhoods near FM 116, the US-190 corridor, and rural properties heading toward Lampasas. We also regularly work in the neighboring communities of Kempner and Lampasas.',
    whyLocal:
      'Viking Steel, The Carport Co., and Get Carports all target Copperas Cove with location pages — but they\'re all national dealers. Triple J Metal LLC is based in Temple, 30 minutes away, and sends a real crew to build and install your structure from start to finish.',
    services: [
      'Welded red iron steel carports',
      'Bolted metal carports',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
      'Equipment covers',
    ],
  },

  temple: {
    slug: 'temple',
    name: 'Temple',
    county: 'Bell County',
    zip: '76501',
    lat: 31.0982,
    lng: -97.3428,
    metaTitle: 'Metal Carports Temple TX | Triple J Metal LLC — Local Builder',
    metaDescription:
      'Triple J Metal LLC is based in Temple, TX — your local metal carport builder with 8 years of experience. Welded and bolted red iron steel, residential and ranch. Call 254-346-7764.',
    heroHeadline: 'Temple\'s Local Metal Carport Builders',
    heroCopy:
      'Triple J Metal LLC is a Temple, TX company — this is our home base. We\'ve been building and installing metal carports, garages, and barns across Bell County for 8 years. When you call us, you\'re talking to a local family that knows this area, knows the weather, and knows how to build a structure that lasts.',
    areaContext:
      'We\'re based right here in Temple and serve all surrounding areas including North Temple, South Temple along I-35, East Temple near FM 93, and rural Bell County properties. We also service nearby Nolanville, Rogers, Belton, and Troy.',
    whyLocal:
      'We\'re not a chain. Triple J Metal LLC was founded by a Temple family and operates out of Temple. Our suppliers are MetalMax in Waco and MetalMart — real Texas steel, real Texas builders. When other companies send a kit, we send a crew.',
    services: [
      'Welded red iron steel carports',
      'Bolted metal carports',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
      'Equipment covers',
      'Ranch structures',
      'Custom metal fabrication',
    ],
  },

  belton: {
    slug: 'belton',
    name: 'Belton',
    county: 'Bell County',
    zip: '76513',
    lat: 31.0557,
    lng: -97.4641,
    metaTitle: 'Metal Carports Belton TX | Triple J Metal LLC',
    metaDescription:
      'Need a metal carport in Belton, TX? Triple J Metal LLC installs welded and bolted red iron carports in Belton and all of Bell County. Local Temple-based crew. Call 254-346-7764.',
    heroHeadline: 'Metal Carport Installation in Belton, TX',
    heroCopy:
      'Belton is right in Triple J Metal LLC\'s backyard. We\'re based in Temple, just minutes away, and we\'ve built carports, garages, and barns throughout Bell County. If you\'re a Belton homeowner or rancher looking for a local builder — not a national brand shipping a flat-pack — you\'ve found the right company.',
    areaContext:
      'We serve all of Belton and the Lake Belton area, including communities along US-190, FM 2271, and rural Bell County ranches. We\'re also close to Salado and Jarrell for customers on the southern end of Bell County.',
    whyLocal:
      'The Carport Co. and Dayton Barns both have Belton pages, but they\'re national outfits with no local crew. Triple J Metal LLC is 10 minutes from downtown Belton. We schedule faster, price lower, and our crew actually knows your neighborhood.',
    services: [
      'Welded red iron steel carports',
      'Bolted metal carports',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
      'Equipment covers',
      'Ranch structures',
    ],
  },
}

export const LOCATION_SLUGS = Object.keys(LOCATIONS)
