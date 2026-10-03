import { expect, it } from 'vitest';

import { buildMessagePayload, canSendMessage, type MessageInput } from './MessageForm';

const base: MessageInput = {
  topic: 'A question', name: ' Ana Ruiz ', phone: '(254) 555-0100', email: '',
  reach: 'Text', lang: 'Español', text: ' Do you build on caliche? ',
};

it('posts a public-API lead: no ZIP, service "other", the details in the notes', () => {
  expect(buildMessagePayload(base, 'tok')).toEqual({
    name: 'Ana Ruiz',
    phone: '(254) 555-0100',
    email: undefined,
    service_type: 'other',
    source: 'website_form',
    message: 'Contact page message — Topic: A question · Reach by: Text · Language: Español — Do you build on caliche?',
    captcha_token: 'tok',
    language: 'es',
  });
});

it('needs a name, a 10-digit phone, and an address when email is the channel', () => {
  expect(canSendMessage(base)).toBe(true);
  expect(canSendMessage({ ...base, phone: '555-0100' })).toBe(false);
  expect(canSendMessage({ ...base, name: 'A' })).toBe(false);
  expect(canSendMessage({ ...base, reach: 'Email' })).toBe(false);
  expect(canSendMessage({ ...base, reach: 'Email', email: 'ana@example.com' })).toBe(true);
});

it('stores the language the person picked, whatever the page', () => {
  expect(buildMessagePayload({ ...base, lang: 'English' }, null).language).toBe('en');
  expect(buildMessagePayload(base, null).language).toBe('es');
});
