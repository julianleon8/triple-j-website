import { describe, expect, it } from 'vitest'

import { morningBriefText } from './MorningBrief'
import type { MorningBrief } from '@/lib/jobs/morning-brief'

const brief: MorningBrief = {
  subject: 'Morning brief: no new leads · 1 waiting on a call',
  heading: 'Call Maria Lopez first',
  subhead: 'No new leads · 1 waiting on a call · 2 drafts',
  newTitle: 'New since Tue, Sep 29, 7:00 AM Central',
  newItems: [],
  newMore: 0,
  waitingItems: [{ primary: 'Maria Lopez', secondary: 'carport · Belton · 3 days waiting', href: 'https://example.com/hq/leads/1' }],
  waitingMore: 0,
  draftCount: 2,
}

describe('morningBriefText', () => {
  it('lists who is waiting before what is new, with a link per lead', () => {
    const text = morningBriefText(brief, 'https://example.com/hq')
    expect(text.indexOf('WAITING ON A FIRST CALL')).toBeLessThan(text.indexOf('NEW SINCE TUE, SEP 29'))
    expect(text).toContain('- Maria Lopez — carport · Belton · 3 days waiting')
    expect(text).toContain('https://example.com/hq/leads/1')
  })

  it('says so when a list is empty and counts drafts', () => {
    const text = morningBriefText(brief, 'https://example.com/hq')
    expect(text).toContain('No new leads.')
    expect(text).toContain('2 captured calls are still a draft')
    expect(text).not.toContain('undefined')
  })
})
