// Full-page screenshot via Puppeteer.
// Usage: node screenshot.mjs <url> [label] [--width=1440] [--height=900] [--viewport-only] [--delay=400]
// Saves to ./temporary screenshots/screenshot-N.png (or screenshot-N-label.png).
// --delay: ms to wait after load before capturing (default 400) — raise it to
// capture the settled state of mount animations.

import { mkdir, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import puppeteer from 'puppeteer'

const OUT_DIR = resolve(import.meta.dirname, 'temporary screenshots')

const args = process.argv.slice(2)
const flags = args.filter((a) => a.startsWith('--'))
const positional = args.filter((a) => !a.startsWith('--'))

const url = positional[0]
const label = positional[1]

if (!url) {
  console.error('Usage: node screenshot.mjs <url> [label] [--width=1440] [--height=900] [--viewport-only]')
  process.exit(1)
}

if (url.startsWith('file://')) {
  console.error('Refusing to screenshot a file:// URL. Start `node serve.mjs` and use http://localhost:3000.')
  process.exit(1)
}

const flagValue = (name, fallback) => {
  const hit = flags.find((f) => f.startsWith(`--${name}=`))
  return hit ? Number(hit.split('=')[1]) : fallback
}

const width = flagValue('width', 1440)
const height = flagValue('height', 900)
const delay = flagValue('delay', 400)
const fullPage = !flags.includes('--viewport-only')

// Next sequence number — scan existing files so we never overwrite.
async function nextIndex() {
  try {
    const files = await readdir(OUT_DIR)
    const nums = files
      .map((f) => f.match(/^screenshot-(\d+)/))
      .filter(Boolean)
      .map((m) => Number(m[1]))
    return nums.length ? Math.max(...nums) + 1 : 1
  } catch {
    return 1
  }
}

await mkdir(OUT_DIR, { recursive: true })
const index = await nextIndex()
const filename = label ? `screenshot-${index}-${label}.png` : `screenshot-${index}.png`
const outPath = join(OUT_DIR, filename)

const browser = await puppeteer.launch({
  headless: true,
  // Required in containers/codespaces — no user namespaces for Chrome's sandbox.
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

try {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 2 })
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })

  // Let fonts settle and any entrance animations finish before capturing.
  await page.evaluate(() => document.fonts.ready)
  await new Promise((r) => setTimeout(r, delay))

  await page.screenshot({ path: outPath, fullPage })
  console.log(outPath)
} catch (err) {
  console.error(`Screenshot failed: ${err.message}`)
  process.exitCode = 1
} finally {
  await browser.close()
}
