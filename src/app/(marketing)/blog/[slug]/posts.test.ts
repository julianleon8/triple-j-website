import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, it } from 'vitest'

const POSTS = join(process.cwd(), 'src/app/(marketing)/blog/[slug]/posts')
// The Spanish bodies (2026-10-03) are held to the same rule.
const DIRS = [
  { label: 'posts', dir: POSTS },
  { label: 'posts/es', dir: join(POSTS, 'es') },
]

/**
 * The compiled JSX drops the space after an inline close (`</strong> is:`)
 * when the following text run holds an HTML entity, so the page reads
 * "Texasis:". Post modules spell that space out as `{' '}`.
 */
it('post modules never rely on a bare space after an inline element', () => {
  const offenders = DIRS.flatMap(({ label, dir }) =>
    readdirSync(dir)
      .filter((f) => f.endsWith('.tsx'))
      .flatMap((f) =>
        readFileSync(join(dir, f), 'utf8')
          .split('\n')
          .map((line, i) => ({ f: `${label}/${f}`, n: i + 1, line }))
          .filter(({ line }) => /<\/(strong|em|b|a|Link)> [^\s{<]/.test(line))
          .map(({ f: file, n, line }) => `${file}:${n}: ${line.trim()}`),
      ),
  )
  expect(offenders).toEqual([])
})
