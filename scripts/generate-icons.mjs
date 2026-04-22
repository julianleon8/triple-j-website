import sharp from 'sharp'
import toIco from 'to-ico'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DETAILED_SRC = path.join(ROOT, 'public/images/logo-lion-detailed.png')
const SIMPLE_SRC = path.join(ROOT, 'public/images/logo-lion-simple.png')

async function blueToBlack(srcPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const out = Buffer.alloc(data.length)
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.min(data[i], data[i + 1], data[i + 2])
    out[i] = gray
    out[i + 1] = gray
    out[i + 2] = gray
    out[i + 3] = data[i + 3]
  }
  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
}

async function write(pipeline, outPath, size) {
  await pipeline.clone().resize(size, size).png().toFile(outPath)
  console.log(`  ✓ ${path.relative(ROOT, outPath)} (${size}x${size})`)
}

async function main() {
  console.log('Generating icons on black background...\n')

  const detailed = await blueToBlack(DETAILED_SRC)
  const simple = await blueToBlack(SIMPLE_SRC)

  console.log('Home-screen / PWA (detailed lion):')
  await write(detailed, path.join(ROOT, 'src/app/apple-icon.png'), 180)
  await write(detailed, path.join(ROOT, 'src/app/icon.png'), 512)
  await write(detailed, path.join(ROOT, 'public/icon-192.png'), 192)
  await write(detailed, path.join(ROOT, 'public/icon-512.png'), 512)

  // Maskable: inner content in 80% safe zone, pad with black for OS cropping.
  const safe = Math.round(512 * 0.8)
  const detailedSafe = await detailed.clone().resize(safe, safe).png().toBuffer()
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: detailedSafe, gravity: 'center' }])
    .png()
    .toFile(path.join(ROOT, 'public/icon-maskable-512.png'))
  console.log(`  ✓ public/icon-maskable-512.png (512x512 maskable, 80% safe zone)`)

  console.log('\nBrowser tab (simple lion):')
  await write(simple, path.join(ROOT, 'src/app/icon-32.png'), 32)

  const icoBufs = await Promise.all(
    [16, 32, 48].map((s) => simple.clone().resize(s, s).png().toBuffer()),
  )
  const ico = await toIco(icoBufs)
  await writeFile(path.join(ROOT, 'src/app/favicon.ico'), ico)
  console.log(`  ✓ src/app/favicon.ico (16 + 32 + 48 multi-size)`)

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
