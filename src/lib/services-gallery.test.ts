import { expect, it } from 'vitest'

import { SERVICES } from './services'

// Locked Decisions, "Related projects": the service-page builds row never
// claims relevance it can't back. Ported from the pre-Forge RelatedProjects
// tests; the Forge template reads these fields (3+ matches, else hidden).
it('HOA has no builds row without verified metadata', () => {
  expect(SERVICES['hoa-compliant-structures'].galleryTypes).toBeUndefined()
})

it('turnkey requires both the Carport type and the Turnkey tag', () => {
  const turnkey = SERVICES['turnkey-carports-with-concrete']
  expect(turnkey.galleryTypes).toEqual(['Carport'])
  expect(turnkey.galleryTag).toBe('Turnkey')
})
