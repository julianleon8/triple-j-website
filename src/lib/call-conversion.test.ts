import { describe, expect, it } from 'vitest'

import { callConversionSendTo } from './call-conversion'

describe('callConversionSendTo', () => {
  it('joins the account and label the way gtag expects', () => {
    expect(callConversionSendTo('AW-18112939313', 'Abc_123')).toBe('AW-18112939313/Abc_123')
  })

  it('sends nothing until the call conversion label is configured', () => {
    expect(callConversionSendTo('AW-18112939313', undefined)).toBeNull()
    expect(callConversionSendTo('AW-18112939313', '  ')).toBeNull()
    expect(callConversionSendTo(undefined, 'Abc_123')).toBeNull()
  })
})
