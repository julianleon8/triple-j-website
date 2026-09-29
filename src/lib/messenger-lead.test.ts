import { describe, expect, it } from 'vitest'

import {
  MAX_MESSENGER_MESSAGE_CHARS,
  appendMessengerText,
  firstMessengerMessage,
  messengerMarker,
} from './messenger-lead'

describe('messenger lead threading', () => {
  it('opens a new lead with the sender marker so later messages can find it', () => {
    const message = firstMessengerMessage('123456', '  How much for a 20x20?  ')
    expect(message).toBe('FB-Messenger-123456\n\nHow much for a 20x20?')
    expect(message.startsWith(messengerMarker('123456'))).toBe(true)
  })

  it('appends a follow-up to the open lead', () => {
    const first = firstMessengerMessage('123456', 'How much for a 20x20?')
    expect(appendMessengerText(first, 'ZIP is 76502')).toBe(`${first}\n\nZIP is 76502`)
  })

  it('writes nothing for an empty follow-up', () => {
    expect(appendMessengerText('FB-Messenger-1\n\nhi', '   ')).toBeNull()
  })

  it('stops appending once the lead reaches the cap', () => {
    const full = 'x'.repeat(MAX_MESSENGER_MESSAGE_CHARS)
    expect(appendMessengerText(full, 'one more')).toBeNull()
  })

  it('trims an append that would cross the cap', () => {
    const nearlyFull = 'x'.repeat(MAX_MESSENGER_MESSAGE_CHARS - 5)
    const result = appendMessengerText(nearlyFull, 'a longer follow-up')
    expect(result).toHaveLength(MAX_MESSENGER_MESSAGE_CHARS)
  })
})
