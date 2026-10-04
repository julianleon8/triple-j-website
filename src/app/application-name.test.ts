import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'

/**
 * `applicationName` renders as <meta name="application-name"> on every route
 * that inherits the root layout. It said "Triple J Metal HQ" (the owner app) on
 * every public page until 2026-10-03, which muddied the brand name Google reads
 * from the site. The public site is "Triple J Metal"; only /hq is "HQ".
 */
const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8')

it('names the public site by its brand, never as the owner app', () => {
  expect(read('src/app/layout.tsx')).not.toMatch(/applicationName:\s*["'][^"']*HQ/)
})

it('keeps "Triple J Metal HQ" as the name of the owner app on /hq', () => {
  expect(read('src/app/hq/layout.tsx')).toMatch(/applicationName:\s*['"]Triple J Metal HQ['"]/)
})
