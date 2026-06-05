// Downloads a clean A–Z ASL image set from a raw.githubusercontent.com URL
// pattern and embeds each image directly into the ASL deck JSON as a base64
// data URI. Embedding (rather than referencing a runtime URL) guarantees the
// images render on Streamlit Cloud with zero external network dependency.
//
// Usage:
//   node scripts/embed-asl-images.mjs "<url-pattern>"
// where <url-pattern> contains one of these placeholders:
//   {L}  -> uppercase letter (A, B, …)
//   {l}  -> lowercase letter (a, b, …)
// e.g. "https://raw.githubusercontent.com/owner/repo/main/signs/{l}.png"

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const pattern = process.argv[2]
if (!pattern || (!pattern.includes('{L}') && !pattern.includes('{l}'))) {
  console.error('Provide a URL pattern containing {L} or {l}, e.g.')
  console.error('  node scripts/embed-asl-images.mjs "https://raw.githubusercontent.com/o/r/main/{l}.png"')
  process.exit(1)
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function urlFor(letter) {
  return pattern.replaceAll('{L}', letter).replaceAll('{l}', letter.toLowerCase())
}

function mimeFor(url) {
  const u = url.toLowerCase()
  if (u.endsWith('.png')) return 'image/png'
  if (u.endsWith('.jpg') || u.endsWith('.jpeg')) return 'image/jpeg'
  if (u.endsWith('.gif')) return 'image/gif'
  if (u.endsWith('.webp')) return 'image/webp'
  if (u.endsWith('.svg')) return 'image/svg+xml'
  return 'image/png'
}

async function fetchDataUri(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  return `data:${mimeFor(url)};base64,${buf.toString('base64')}`
}

async function main() {
  console.log('Downloading + embedding ASL images…')
  const uris = {}
  for (const L of LETTERS) {
    const url = urlFor(L)
    try {
      uris[L] = await fetchDataUri(url)
      console.log(`  ✓ ${L}  (${(uris[L].length / 1024).toFixed(1)} kB)`)
    } catch (e) {
      console.error(`  ✗ ${L}  ${e.message}  ${url}`)
    }
  }

  const got = Object.keys(uris).length
  if (got < 26) {
    console.error(`\nOnly ${got}/26 letters downloaded. Aborting so the deck isn't left half-updated.`)
    process.exit(1)
  }

  const jsonPath = join(root, 'src/data/decks/asl-alphabet.json')
  const pack = JSON.parse(readFileSync(jsonPath, 'utf8'))
  let updated = 0
  for (const card of pack.deck.cards) {
    const letter = card.label.split(/\s/)[0].toUpperCase()
    if (uris[letter]) {
      card.img = uris[letter]
      updated++
    }
  }
  writeFileSync(jsonPath, JSON.stringify(pack, null, 2))
  console.log(`\nEmbedded ${updated} images into asl-alphabet.json`)
}

main()
