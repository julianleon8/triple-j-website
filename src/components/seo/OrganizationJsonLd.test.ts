import { describe, expect, it } from 'vitest'

import { SITE } from '@/lib/site'
import { OrganizationJsonLd } from './OrganizationJsonLd'

/**
 * The hours were wrong in three places at once (site, Yelp, the old Wix site)
 * until the owner confirmed them on 2026-10-03. The text and the schema must
 * change together, and a change here should be deliberate.
 */
function graph(): Array<Record<string, unknown>> {
  const element = OrganizationJsonLd()
  const json = element.props.dangerouslySetInnerHTML.__html.replace(/\\u003c/g, '<')
  return JSON.parse(json)['@graph']
}

describe('business hours', () => {
  it('are declared in the LocalBusiness schema as Mon–Fri 8–7 and Sat 8–3', () => {
    const business = graph().find((node) => JSON.stringify(node['@type']).includes('LocalBusiness'))
    expect(business?.openingHoursSpecification).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '19:00',
      },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '08:00', closes: '15:00' },
    ])
  })

  it('read the same as text on the footer, contact page and share card', () => {
    expect(SITE.hours).toBe('Mon–Fri 8am–7pm · Sat 8am–3pm')
  })
})

const node = (type: string) => graph().find((n) => JSON.stringify(n['@type']).includes(type))!

// "triple j metal" alone is triple j's (the Australian radio station's) metal
// shows to Google. These fields are what tell it which Triple J this is.
describe('brand', () => {
  it('names the business in a way that cannot be mistaken for another Triple J', () => {
    const org = node('Organization')
    expect(org.alternateName).toBe(SITE.alternateName)
    expect(org.alternateName).not.toBe(org.name)
    expect(node('WebSite').alternateName).toBe(SITE.alternateName)
    expect(org.disambiguatingDescription).toMatch(/Temple, Texas/)
  })

  it('links every profile in SITE.social from both business nodes', () => {
    const profiles = Object.values(SITE.social).filter(Boolean)
    expect(profiles.length).toBeGreaterThan(0)
    expect(node('Organization').sameAs).toEqual(profiles)
    expect(node('LocalBusiness').sameAs).toEqual(profiles)
  })

  // Locked Decisions → Pricing: "concrete available", never turnkey as a blanket.
  it('never labels the whole business turnkey', () => {
    for (const n of graph()) expect(n.description).not.toMatch(/turnkey concrete/i)
  })
})
