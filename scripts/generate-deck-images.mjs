// Generates SVG data-URI images for all built-in deck cards and writes them
// directly into the deck JSON files (img field).
// Run once: node scripts/generate-deck-images.mjs

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// ── Helpers ────────────────────────────────────────────────────────────────

function svg(content, w = 200, h = 200) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${content}</svg>`
}
function dataUri(svgStr) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr)
}
function rect(x, y, w, h, fill) { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>` }
function circle(cx, cy, r, fill, stroke, sw = 0) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}/>`
}
function poly(pts, fill) { return `<polygon points="${pts}" fill="${fill}"/>` }
function line(x1,y1,x2,y2,stroke,sw) { return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>` }
function text(t, x, y, size, fill, anchor='middle', font='Georgia, serif', weight='bold') {
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" text-anchor="${anchor}" dominant-baseline="central" fill="${fill}" font-weight="${weight}">${t}</text>`
}
// Checkerboard n×n
function checker(cols, rows, c1, c2) {
  const cw = 200 / cols, ch = 200 / rows
  let s = ''
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      s += rect(c * cw, r * ch, cw, ch, (r + c) % 2 === 0 ? c1 : c2)
  return s
}
// Horizontal stripes
function hstripes(...colors) {
  const h = 200 / colors.length
  return colors.map((c, i) => rect(0, i * h, 200, h, c)).join('')
}
// Vertical stripes
function vstripes(...colors) {
  const w = 200 / colors.length
  return colors.map((c, i) => rect(i * w, 0, w, 200, c)).join('')
}

// ── Nautical ICS flag designs ──────────────────────────────────────────────

const FLAGS = {
  // Alpha (A) – white + blue, swallowtail (notch cut from fly side)
  'flag-alpha': () => {
    const body = `${rect(0,0,100,200,'#fff')}${rect(100,0,100,200,'#00529b')}`
    const notch = poly('200,80 160,100 200,120', '#fff') // swallowtail notch
    return svg(body + notch)
  },
  // Bravo (B) – solid red, swallowtail
  'flag-bravo': () => svg(rect(0,0,200,200,'#d0021b') + poly('200,80 160,100 200,120','#fff')),
  // Charlie (C) – 5 horizontal stripes: blue/white/red/white/blue
  'flag-charlie': () => svg(hstripes('#00529b','#fff','#d0021b','#fff','#00529b')),
  // Delta (D) – yellow body, blue cross
  'flag-delta': () => svg(rect(0,0,200,200,'#f5a623') + rect(80,0,40,200,'#00529b') + rect(0,80,200,40,'#00529b')),
  // Echo (E) – red top, blue bottom (horizontal halves)
  'flag-echo': () => svg(hstripes('#d0021b','#00529b')),
  // Foxtrot (F) – white with red diamond in centre
  'flag-foxtrot': () => svg(rect(0,0,200,200,'#fff') + poly('100,40 160,100 100,160 40,100','#d0021b')),
  // Golf (G) – 4 quadrants alternating yellow/blue
  'flag-golf': () => svg(rect(0,0,100,100,'#f5a623')+rect(100,0,100,100,'#00529b')+rect(0,100,100,100,'#00529b')+rect(100,100,100,100,'#f5a623')),
  // Hotel (H) – vertical halves: white left, red right
  'flag-hotel': () => svg(vstripes('#fff','#d0021b')),
  // India (I) – yellow with black circle
  'flag-india': () => svg(rect(0,0,200,200,'#f5a623') + circle(100,100,50,'#222')),
  // Juliet (J) – 3 horizontal stripes: blue/white/blue
  'flag-juliet': () => svg(hstripes('#00529b','#fff','#00529b')),
  // Kilo (K) – vertical halves: yellow left, blue right
  'flag-kilo': () => svg(vstripes('#f5a623','#00529b')),
  // Lima (L) – 4 quadrants: yellow TL+BR, black TR+BL
  'flag-lima': () => svg(rect(0,0,100,100,'#f5a623')+rect(100,0,100,100,'#222')+rect(0,100,100,100,'#222')+rect(100,100,100,100,'#f5a623')),
  // Mike (M) – white top, blue bottom
  'flag-mike': () => svg(hstripes('#fff','#00529b')),
  // November (N) – 4×4 blue/white checkerboard
  'flag-november': () => svg(checker(4,4,'#00529b','#fff')),
  // Oscar (O) – diagonal split: red upper-left, yellow lower-right
  'flag-oscar': () => svg(rect(0,0,200,200,'#f5a623') + poly('0,0 200,0 0,200','#d0021b')),
  // Papa (P) – blue border, white centre rectangle
  'flag-papa': () => svg(rect(0,0,200,200,'#00529b') + rect(40,40,120,120,'#fff')),
  // Quebec (Q) – solid yellow
  'flag-quebec': () => svg(rect(0,0,200,200,'#f5a623')),
  // Romeo (R) – 3 vertical stripes: red/yellow/red
  'flag-romeo': () => svg(vstripes('#d0021b','#f5a623','#d0021b')),
  // Sierra (S) – white with blue cross
  'flag-sierra': () => svg(rect(0,0,200,200,'#fff') + rect(80,0,40,200,'#00529b') + rect(0,80,200,40,'#00529b')),
  // Tango (T) – 3 vertical stripes: red/white/red
  'flag-tango': () => svg(vstripes('#d0021b','#fff','#d0021b')),
  // Uniform (U) – white with red cross (horizontal/vertical)
  'flag-uniform': () => svg(rect(0,0,200,200,'#fff') + rect(85,0,30,200,'#d0021b') + rect(0,85,200,30,'#d0021b')),
  // Victor (V) – white with red X (diagonal cross)
  'flag-victor': () => svg(rect(0,0,200,200,'#fff') + line(0,0,200,200,'#d0021b',36) + line(200,0,0,200,'#d0021b',36)),
  // Whiskey (W) – red, white, red horizontal
  'flag-whiskey': () => svg(hstripes('#d0021b','#fff','#d0021b')),
  // X-ray (X) – blue/white/blue horizontal with black X
  'flag-xray': () => svg(hstripes('#00529b','#fff','#00529b') + line(0,0,200,200,'#222',30) + line(200,0,0,200,'#222',30)),
  // Yankee (Y) – yellow/red diagonal stripes (checkerboard style)
  'flag-yankee': () => svg(checker(4,4,'#d0021b','#f5a623')),
  // Zulu (Z) – 4 quadrants: black TL, blue TR, red BL, yellow BR
  'flag-zulu': () => svg(rect(0,0,100,100,'#222')+rect(100,0,100,100,'#00529b')+rect(0,100,100,100,'#d0021b')+rect(100,100,100,100,'#f5a623')),
}

// ── ASL letter badge designs ───────────────────────────────────────────────
// Gold-rimmed badge with the hand-letter prominently centred.
// Not photographic but clearly identifies each card.

function aslBadge(letter) {
  const bg = '#f7f3eb'
  const ink = '#1a1a2e'
  const gold = '#c9a84c'
  return svg(
    // Background circle
    circle(100, 100, 95, bg, gold, 5) +
    // Letter
    text(letter, 100, 95, 96, ink, 'middle', 'Georgia, serif', 'bold') +
    // "ASL" caption
    text('ASL', 100, 170, 20, gold, 'middle', 'Georgia, serif', 'normal')
  )
}

const ASL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// ── Update deck JSON files ─────────────────────────────────────────────────

function updateDeck(jsonPath, generateImage) {
  const pack = JSON.parse(readFileSync(jsonPath, 'utf8'))
  let updated = 0
  for (const card of pack.deck.cards) {
    const imgSvg = generateImage(card)
    if (imgSvg) {
      card.img = dataUri(imgSvg)
      updated++
    }
  }
  writeFileSync(jsonPath, JSON.stringify(pack, null, 2))
  console.log(`  ✓ ${jsonPath.split('/').pop()}: ${updated} cards updated`)
}

console.log('Generating deck images…')

updateDeck(
  join(root, 'src/data/decks/nautical-flags.json'),
  (card) => FLAGS[card.id] ? FLAGS[card.id]() : null
)

updateDeck(
  join(root, 'src/data/decks/asl-alphabet.json'),
  (card) => {
    const letter = card.label.replace(/\s.*/,'').toUpperCase()
    return aslBadge(letter)
  }
)

console.log('Done.')
