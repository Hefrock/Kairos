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

// ── ASL hand sign SVG drawings ─────────────────────────────────────────────
// Schematic front-of-hand view, right hand.
// Coordinate system: 200×200 viewBox.
// Palm base: x=60 y=118 w=80 h=62 rx=18
// Finger x-centres: pinky=76 ring=91 middle=106 index=121
// Extended finger tops (anatomical): index≈62 middle≈55 ring≈62 pinky≈72

const SK  = '#f5d5a5'   // skin
const SO  = '#c8956a'   // skin outline / shadow
const NL  = '#f8ece0'   // nail highlight
const HBG = '#f7f3eb'   // parchment background

const hRnd = (x,y,w,h,rx,f=SK,s=SO,sw=1.5) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`
const hEll = (cx,cy,rx,ry,f=SK,s=SO,sw=1.5) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`
const hPth = (d,f=SK,s=SO,sw=1.5) =>
  `<path d="${d}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`
const hNail = (cx,y) =>
  `<ellipse cx="${cx}" cy="${y+5}" rx="4" ry="3" fill="${NL}" stroke="${SO}" stroke-width="1"/>`

const PALM = hRnd(60,118,80,62,18)

// Finger x-centres
const FP=76, FR=91, FM=106, FI=121

// Extended finger column: cx, top y, base y
const ext = (cx,top,bot=130) => hRnd(cx-8,top,16,bot-top,8)

// Folded knuckle bump at top of palm
const knu = (cx) => hEll(cx,121,8.5,6)

// Thumb variants
const thR    = () => hRnd(133,126,30,17,8)    // pointing right
const thU    = () => hRnd(44,98,16,38,8)      // pointing up on left side
const thFold = () => hRnd(68,135,26,14,7)     // folded across palm front
const thIn   = () => hRnd(80,130,16,12,6)     // tucked inside fist
const thOver = () => hRnd(62,112,36,14,7)     // draped over closed fist (S)
const thBetw = () => hRnd(108,112,17,16,7)    // peeking between index+middle (T)

function aslHand(letter) {
  const bg = `<rect width="200" height="200" fill="${HBG}"/>`
  let s

  switch (letter) {
    case 'A':
      // Closed fist, thumb resting on right side of index
      s = PALM + knu(FP)+knu(FR)+knu(FM)+knu(FI) + thR()
      break

    case 'B':
      // All 4 fingers extended, thumb folded across palm
      s = ext(FP,72)+hNail(FP,72) + ext(FR,62)+hNail(FR,62) +
          ext(FM,55)+hNail(FM,55) + ext(FI,62)+hNail(FI,62) +
          PALM + thFold()
      break

    case 'C':
      // C arc — thick stroke forming an open C facing right
      s = hPth('M 148,72 Q 175,100 148,133 Q 128,162 100,165 Q 68,165 47,140 Q 28,112 34,80 Q 48,46 80,37 Q 110,28 140,48','none',SO,16) +
          hPth('M 148,72 Q 175,100 148,133 Q 128,162 100,165 Q 68,165 47,140 Q 28,112 34,80 Q 48,46 80,37 Q 110,28 140,48','none',SK,10)
      break

    case 'D':
      // Index up; ring/middle/pinky curl and touch thumb tip
      s = PALM + knu(FP)+knu(FR)+knu(FM) +
          ext(FI,62)+hNail(FI,62) +
          hEll(133,87,9,9)   // thumb tip touching index side
      break

    case 'E':
      // All 4 fingers bent forward (claw), thumb tucked under
      s = ext(FP,100)+ext(FR,96)+ext(FM,94)+ext(FI,96) + PALM + thIn()
      break

    case 'F':
      // Index+thumb make OK circle; middle+ring+pinky extended
      s = ext(FP,72)+hNail(FP,72) + ext(FR,62)+hNail(FR,62) +
          ext(FM,55)+hNail(FM,55) + PALM +
          `<circle cx="128" cy="92" r="16" fill="none" stroke="${SO}" stroke-width="14"/>` +
          `<circle cx="128" cy="92" r="16" fill="none" stroke="${SK}" stroke-width="8"/>`
      break

    case 'G':
      // Hand sideways: index + thumb pointing right
      s = hRnd(68,88,70,36,16) +   // horizontal palm
          hRnd(136,82,38,17,8) +   // index pointing right
          hRnd(136,103,30,14,7)    // thumb parallel right
      break

    case 'H':
      // Hand sideways: index + middle pointing right
      s = hRnd(68,85,70,42,16) +
          hRnd(136,78,38,17,8) +   // index right
          hRnd(136,97,38,17,8)     // middle right
      break

    case 'I':
      // Only pinky extended
      s = PALM + knu(FR)+knu(FM)+knu(FI) + ext(FP,72)+hNail(FP,72) + thFold()
      break

    case 'J':
      // Same static shape as I (J adds a traced motion)
      s = PALM + knu(FR)+knu(FM)+knu(FI) + ext(FP,72)+hNail(FP,72) + thFold()
      break

    case 'K':
      // Index + middle up, thumb between them pointing up
      s = PALM + knu(FP)+knu(FR) +
          ext(FM,60)+hNail(FM,60) + ext(FI,55)+hNail(FI,55) +
          thU()
      break

    case 'L':
      // Index up + thumb pointing right — L shape
      s = PALM + knu(FP)+knu(FR)+knu(FM) +
          ext(FI,62)+hNail(FI,62) + thR()
      break

    case 'M':
      // Three fingers (index/middle/ring) folded over thumb
      s = hRnd(70,138,24,14,7) +   // thumb stub visible below
          PALM + knu(FP) +
          hRnd(FR-8,103,16,27,8) + // ring folded over
          hRnd(FM-8,101,16,27,8) + // middle folded over
          hRnd(FI-8,101,16,27,8)   // index folded over
      break

    case 'N':
      // Two fingers (index/middle) folded over thumb
      s = hRnd(80,138,22,13,6) +
          PALM + knu(FP)+knu(FR) +
          hRnd(FM-8,103,16,27,8) +
          hRnd(FI-8,103,16,27,8)
      break

    case 'O':
      // All fingers curve to thumb forming O
      s = `<circle cx="100" cy="108" r="42" fill="${SK}" stroke="${SO}" stroke-width="2"/>` +
          `<circle cx="100" cy="108" r="25" fill="${HBG}" stroke="${SO}" stroke-width="2"/>`
      break

    case 'P':
      // Like K but hand points downward
      s = hRnd(78,68,44,36,16) +   // small palm horizontal
          hRnd(80,102,16,38,8) +   // index pointing down
          hRnd(98,96,16,32,8) +    // middle slightly less
          hRnd(60,88,18,16,8)      // thumb left
      break

    case 'Q':
      // Like G but pointing downward
      s = hRnd(62,72,68,36,16) +
          hRnd(97,106,16,38,8) +   // index down
          hRnd(77,106,14,28,7)     // thumb parallel
      break

    case 'R':
      // Index + middle extended, middle crossed over index
      s = PALM + knu(FP)+knu(FR) +
          ext(FI,62)+hNail(FI,62) +
          `<rect x="${FM-7}" y="58" width="14" height="74" rx="7" fill="${SK}" stroke="${SO}" stroke-width="1.5" transform="rotate(-10 ${FM} 130)"/>` +
          hNail(FM-6, 62) +
          thFold()
      break

    case 'S':
      // Closed fist, thumb draped over finger tops
      s = PALM + knu(FP)+knu(FR)+knu(FM)+knu(FI) + thOver()
      break

    case 'T':
      // Closed fist, thumb inserted between index and middle
      s = PALM + knu(FP)+knu(FR)+knu(FM)+knu(FI) + thBetw()
      break

    case 'U':
      // Index + middle extended side by side (parallel)
      s = PALM + knu(FP)+knu(FR) +
          ext(FM,58)+hNail(FM,58) + ext(FI,58)+hNail(FI,58) +
          thFold()
      break

    case 'V':
      // Index + middle spread in V
      s = PALM + knu(FP)+knu(FR) +
          `<rect x="${FM-7}" y="58" width="14" height="74" rx="7" fill="${SK}" stroke="${SO}" stroke-width="1.5" transform="rotate(12 ${FM} 132)"/>` +
          hNail(FM-6,64) +
          `<rect x="${FI-7}" y="58" width="14" height="74" rx="7" fill="${SK}" stroke="${SO}" stroke-width="1.5" transform="rotate(-12 ${FI} 132)"/>` +
          hNail(FI+6,64) +
          thFold()
      break

    case 'W':
      // Ring + middle + index spread in W (fan of 3)
      s = PALM + knu(FP) +
          `<rect x="${FR-7}" y="58" width="14" height="74" rx="7" fill="${SK}" stroke="${SO}" stroke-width="1.5" transform="rotate(15 ${FR} 132)"/>` +
          hNail(FR-7,66) +
          ext(FM,55)+hNail(FM,55) +
          `<rect x="${FI-7}" y="58" width="14" height="74" rx="7" fill="${SK}" stroke="${SO}" stroke-width="1.5" transform="rotate(-15 ${FI} 132)"/>` +
          hNail(FI+7,66) +
          thFold()
      break

    case 'X':
      // Index hooked at first joint
      s = PALM + knu(FP)+knu(FR)+knu(FM) +
          hRnd(FI-8,100,16,30,8) +   // lower index segment
          hPth(`M ${FI-8},100 Q ${FI-12},78 ${FI+8},66 Q ${FI+24},60 ${FI+22},76`) +
          thFold()
      break

    case 'Y':
      // Thumb pointing right + pinky extended up, others folded
      s = PALM + knu(FR)+knu(FM)+knu(FI) +
          ext(FP,72)+hNail(FP,72) + thR()
      break

    case 'Z':
      // Index extended pointing up (traces Z in motion)
      s = PALM + knu(FP)+knu(FR)+knu(FM) +
          ext(FI,62)+hNail(FI,62) + thFold()
      break

    default:
      return null
  }

  return svg(bg + s)
}

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
    return aslHand(letter)
  }
)

console.log('Done.')
