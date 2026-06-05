// Downloads all built-in deck images from their source URLs and saves them
// to src/assets/deck-images/ so they can be bundled locally.
// Run once: node scripts/download-deck-images.mjs

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const DECKS = [
  {
    file: join(root, 'src/data/decks/asl-alphabet.json'),
    dir:  join(root, 'src/assets/deck-images/asl'),
  },
  {
    file: join(root, 'src/data/decks/nautical-flags.json'),
    dir:  join(root, 'src/assets/deck-images/nautical'),
  },
]

const UA = 'KairosApp/0.1 (educational; https://github.com/hefrock/kairos)'

let ok = 0, fail = 0

for (const { file, dir } of DECKS) {
  mkdirSync(dir, { recursive: true })
  const pack = JSON.parse(readFileSync(file, 'utf8'))

  for (const card of pack.deck.cards) {
    const url = card.img
    const ext  = url.toLowerCase().includes('.svg') ? '.png' : '.png'
    const dest = join(dir, `${card.id}${ext}`)

    if (existsSync(dest)) {
      console.log(`  skip  ${card.id}${ext} (already exists)`)
      ok++
      continue
    }

    process.stdout.write(`  fetch ${card.id}${ext} … `)
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = await res.arrayBuffer()
      writeFileSync(dest, Buffer.from(buf))
      console.log(`✓ (${(buf.byteLength / 1024).toFixed(1)} KB)`)
      ok++
    } catch (e) {
      console.log(`✗ ${e.message}`)
      fail++
    }
  }
}

console.log(`\nDone: ${ok} downloaded, ${fail} failed.`)
if (fail > 0) process.exit(1)
