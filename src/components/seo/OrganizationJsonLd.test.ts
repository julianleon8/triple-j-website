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
