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
function checker(cols, rows, c1, c2) {
  const cw = 200 / cols, ch = 200 / rows
  let s = ''
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      s += rect(c * cw, r * ch, cw, ch, (r + c) % 2 === 0 ? c1 : c2)
  return s
}
function hstripes(...colors) {
  const h = 200 / colors.length
  return colors.map((c, i) => rect(0, i * h, 200, h, c)).join('')
}
function vstripes(...colors) {
  const w = 200 / colors.length
  return colors.map((c, i) => rect(i * w, 0, w, 200, c)).join('')
}

// ── Nautical ICS flag designs ──────────────────────────────────────────────

const FLAGS = {
  'flag-alpha': () => {
    const body = `${rect(0,0,100,200,'#fff')}${rect(100,0,100,200,'#00529b')}`
    const notch = poly('200,80 160,100 200,120', '#fff')
    return svg(body + notch)
  },
  'flag-bravo': () => svg(rect(0,0,200,200,'#d0021b') + poly('200,80 160,100 200,120','#fff')),
  'flag-charlie': () => svg(hstripes('#00529b','#fff','#d0021b','#fff','#00529b')),
  'flag-delta': () => svg(rect(0,0,200,200,'#f5a623') + rect(80,0,40,200,'#00529b') + rect(0,80,200,40,'#00529b')),
  'flag-echo': () => svg(hstripes('#d0021b','#00529b')),
  'flag-foxtrot': () => svg(rect(0,0,200,200,'#fff') + poly('100,40 160,100 100,160 40,100','#d0021b')),
  'flag-golf': () => svg(rect(0,0,100,100,'#f5a623')+rect(100,0,100,100,'#00529b')+rect(0,100,100,100,'#00529b')+rect(100,100,100,100,'#f5a623')),
  'flag-hotel': () => svg(vstripes('#fff','#d0021b')),
  'flag-india': () => svg(rect(0,0,200,200,'#f5a623') + circle(100,100,50,'#222')),
  'flag-juliet': () => svg(hstripes('#00529b','#fff','#00529b')),
  'flag-kilo': () => svg(vstripes('#f5a623','#00529b')),
  'flag-lima': () => svg(rect(0,0,100,100,'#f5a623')+rect(100,0,100,100,'#222')+rect(0,100,100,100,'#222')+rect(100,100,100,100,'#f5a623')),
  'flag-mike': () => svg(hstripes('#fff','#00529b')),
  'flag-november': () => svg(checker(4,4,'#00529b','#fff')),
  'flag-oscar': () => svg(rect(0,0,200,200,'#f5a623') + poly('0,0 200,0 0,200','#d0021b')),
  'flag-papa': () => svg(rect(0,0,200,200,'#00529b') + rect(40,40,120,120,'#fff')),
  'flag-quebec': () => svg(rect(0,0,200,200,'#f5a623')),
  'flag-romeo': () => svg(vstripes('#d0021b','#f5a623','#d0021b')),
  'flag-sierra': () => svg(rect(0,0,200,200,'#fff') + rect(80,0,40,200,'#00529b') + rect(0,80,200,40,'#00529b')),
  'flag-tango': () => svg(vstripes('#d0021b','#fff','#d0021b')),
  'flag-uniform': () => svg(rect(0,0,200,200,'#fff') + rect(85,0,30,200,'#d0021b') + rect(0,85,200,30,'#d0021b')),
  'flag-victor': () => svg(rect(0,0,200,200,'#fff') + line(0,0,200,200,'#d0021b',36) + line(200,0,0,200,'#d0021b',36)),
  'flag-whiskey': () => svg(hstripes('#d0021b','#fff','#d0021b')),
  'flag-xray': () => svg(hstripes('#00529b','#fff','#00529b') + line(0,0,200,200,'#222',30) + line(200,0,0,200,'#222',30)),
  'flag-yankee': () => svg(checker(4,4,'#d0021b','#f5a623')),
  'flag-zulu': () => svg(rect(0,0,100,100,'#222')+rect(100,0,100,100,'#00529b')+rect(0,100,100,100,'#d0021b')+rect(100,100,100,100,'#f5a623')),
}

// ── Realistic ASL hand sign SVGs ───────────────────────────────────────────
// Front-of-right-hand view. Each letter drawn with bezier-curve fingers,
// skin-tone gradient, proper palm anatomy, and fingernail details.

const SO  = '#a06030'   // skin outline
const NL  = '#f9ede0'   // nail fill
const HBG = '#1a1a2e'   // dark parchment background (matches dark mode)

// SVG defs: skin gradient
const DEFS = `<defs>
  <linearGradient id="sk" x1="0.25" y1="0" x2="0.75" y2="1">
    <stop offset="0%" stop-color="#fdd9b5"/>
    <stop offset="55%" stop-color="#f0a870"/>
    <stop offset="100%" stop-color="#d98050"/>
  </linearGradient>
  <linearGradient id="skH" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#f0a870"/>
    <stop offset="100%" stop-color="#d98050"/>
  </linearGradient>
</defs>`

const F = 'url(#sk)'    // standard fill
const FH = 'url(#skH)'  // horizontal fill (for sideways hand)

// Smooth tapered finger: cx, tipY, baseY, lean, baseWidth, tipWidth
function mkF(cx, tipY, baseY, lean=0, bw=13, tw=8.5) {
  const r = tw / 2
  const span = baseY - tipY
  const c1y = baseY - span * 0.28
  const c2y = baseY - span * 0.72
  const ltx = cx - tw/2 + lean, rtx = cx + tw/2 + lean
  return `<path d="M ${cx-bw/2},${baseY} C ${cx-bw/2},${c1y} ${ltx},${c2y} ${ltx},${tipY+r} Q ${cx+lean},${tipY-r*0.5} ${rtx},${tipY+r} C ${rtx},${c2y} ${cx+bw/2},${c1y} ${cx+bw/2},${baseY} Z" fill="${F}" stroke="${SO}" stroke-width="1.2" stroke-linejoin="round"/>`
}

// Horizontal finger (for G, H, P, Q): baseX, tipX, cy, height
function mkFh(baseX, tipX, cy, h=13) {
  const r = h * 0.38
  const span = tipX - baseX
  const c1x = baseX + span * 0.28, c2x = baseX + span * 0.72
  return `<path d="M ${baseX},${cy-h/2} C ${c1x},${cy-h/2} ${c2x},${cy-r} ${tipX-r},${cy-r} Q ${tipX+r*0.4},${cy} ${tipX-r},${cy+r} C ${c2x},${cy+h/2} ${c1x},${cy+h/2} ${baseX},${cy+h/2} Z" fill="${FH}" stroke="${SO}" stroke-width="1.2" stroke-linejoin="round"/>`
}

// Nail on fingertip
function mkN(cx, tipY, lean=0) {
  return `<ellipse cx="${cx+lean}" cy="${tipY+1}" rx="3.8" ry="3" fill="${NL}" stroke="${SO}" stroke-width="0.7"/>`
}

// Nail on horizontal fingertip
function mkNh(tipX, cy) {
  return `<ellipse cx="${tipX-1}" cy="${cy}" rx="3" ry="3.8" fill="${NL}" stroke="${SO}" stroke-width="0.7"/>`
}

// Joint crease line
function mkJ(cx, y, lean=0, hw=5) {
  return `<path d="M ${cx-hw+lean},${y} Q ${cx+lean},${y+1.5} ${cx+hw+lean},${y}" fill="none" stroke="${SO}" stroke-width="0.7" opacity="0.5"/>`
}

// Knuckle bump (folded finger) at top of palm
function mkK(cx, baseY, bw=13) {
  const h = 18
  return `<path d="M ${cx-bw/2},${baseY} C ${cx-bw/2},${baseY-h*0.55} ${cx-bw*0.25},${baseY-h} ${cx},${baseY-h} C ${cx+bw*0.25},${baseY-h} ${cx+bw/2},${baseY-h*0.55} ${cx+bw/2},${baseY} Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
}

// Claw-bent finger: shorter, top curves forward
function mkC(cx, baseY, bw=13) {
  const h = 32
  return `<path d="M ${cx-bw/2},${baseY} C ${cx-bw/2},${baseY-h*0.5} ${cx+bw*0.5},${baseY-h*0.8} ${cx+bw*0.6},${baseY-h} Q ${cx+bw*0.7},${baseY-h*0.85} ${cx+bw/2},${baseY} Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
}

// Palm (natural trapezoidal shape, front of hand)
const PALM = `<path d="M 56,182 Q 57,192 100,194 Q 143,192 144,182 L 146,126 Q 135,112 121,110 Q 107,108 93,111 Q 76,114 63,124 Q 56,130 56,182 Z" fill="${F}" stroke="${SO}" stroke-width="1.5"/>`

// Sideways palm (for G, H, P, Q)
const PALM_SIDE = `<path d="M 64,86 Q 64,75 74,70 L 128,70 Q 140,72 140,84 L 140,116 Q 138,128 126,130 L 74,130 Q 62,128 62,116 Z" fill="${FH}" stroke="${SO}" stroke-width="1.5"/>`

// Finger x-centres and base y (anatomical knuckle line)
const [FP, FR, FM, FI] = [76, 91, 106, 121]    // pinky ring middle index
const [FPb, FRb, FMb, FIb] = [133, 130, 127, 130]  // base y
const [FPt, FRt, FMt, FIt] = [75, 63, 56, 63]      // extended tip y

// ── Thumb variants ──────────────────────────────────────────────────────────

// Thumb pointing right (A, L, Y)
function thumbR(baseX=136, cy=132, len=32) {
  return mkFh(baseX, baseX+len, cy, 16) + mkNh(baseX+len, cy)
}

// Thumb pointing up on left side of palm (K, D-contact)
function thumbU(cx=52, tipY=80, baseY=132) {
  return mkF(cx, tipY, baseY, 0, 15, 10) + mkN(cx, tipY)
}

// Thumb folded across lower palm face (B, I, J, U, V, W, R, Z)
function thumbFold() {
  return `<path d="M 62,142 C 62,134 67,130 74,130 L 93,130 Q 99,132 99,140 Q 99,147 93,148 L 74,148 C 67,148 62,145 62,142 Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
}

// Thumb draped over closed fist (S)
function thumbOver() {
  return `<path d="M 56,118 C 56,111 60,108 66,108 L 95,108 Q 101,110 101,118 Q 101,126 95,127 L 66,127 C 60,127 56,124 56,118 Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
}

// Thumb between index + middle fingers (T)
function thumbBetween() {
  return `<path d="M 107,118 C 107,112 111,109 116,109 L 128,109 Q 133,111 133,118 Q 133,125 128,126 L 116,126 C 111,126 107,123 107,118 Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
}

// Thumb touching index side (D — small ball)
function thumbTipD() {
  return `<ellipse cx="132" cy="86" rx="9" ry="9" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
}

// Thumb tucked inside fist (E)
function thumbTuck() {
  return `<path d="M 76,138 C 74,133 76,130 80,130 L 95,130 Q 100,132 100,138 Q 100,143 95,144 L 80,144 C 76,143 76,141 76,138 Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
}

// ── Compose letters ────────────────────────────────────────────────────────

function aslHand(letter) {
  const bg = `<rect width="200" height="200" fill="${HBG}"/>`
  let s

  switch (letter) {

    case 'A': {
      // Closed fist – all knuckles, thumb along right side
      const fingers = mkK(FP,FPb) + mkK(FR,FRb) + mkK(FM,FMb) + mkK(FI,FIb)
      s = fingers + PALM + thumbR()
      break
    }

    case 'B': {
      // 4 fingers fully extended, thumb folded across
      const ext = mkF(FP,FPt,FPb)+mkN(FP,FPt) + mkF(FR,FRt,FRb)+mkN(FR,FRt) +
                  mkF(FM,FMt,FMb)+mkN(FM,FMt) + mkF(FI,FIt,FIb)+mkN(FI,FIt)
      const joints = mkJ(FP,108) + mkJ(FR,100) + mkJ(FM,96) + mkJ(FI,100)
      s = ext + joints + PALM + thumbFold()
      break
    }

    case 'C': {
      // C arc — open to the right
      s = bg +
        `<path d="M 152,72 Q 178,100 152,134 Q 132,165 100,168 Q 66,168 44,140 Q 24,110 32,76 Q 46,44 78,36 Q 110,28 140,48" fill="none" stroke="${SO}" stroke-width="18" stroke-linecap="round"/>` +
        `<path d="M 152,72 Q 178,100 152,134 Q 132,165 100,168 Q 66,168 44,140 Q 24,110 32,76 Q 46,44 78,36 Q 110,28 140,48" fill="none" stroke="url(#sk)" stroke-width="12" stroke-linecap="round"/>`
      return svg(DEFS + s)
    }

    case 'D': {
      // Index extended, others curled, thumb tip touches index
      const idx = mkF(FI,FIt,FIb) + mkN(FI,FIt) + mkJ(FI,98)
      s = mkK(FP,FPb) + mkK(FR,FRb) + mkK(FM,FMb) + idx + PALM + thumbTipD()
      break
    }

    case 'E': {
      // All fingers bent in claw, thumb tucked
      s = mkC(FP,FPb) + mkC(FR,FRb) + mkC(FM,FMb) + mkC(FI,FIb) + PALM + thumbTuck()
      break
    }

    case 'F': {
      // Middle/ring/pinky extended; index+thumb make OK circle
      const ext = mkF(FP,FPt,FPb)+mkN(FP,FPt) + mkF(FR,FRt,FRb)+mkN(FR,FRt) +
                  mkF(FM,FMt,FMb)+mkN(FM,FMt)
      s = ext + PALM +
        `<circle cx="128" cy="90" r="17" fill="none" stroke="${SO}" stroke-width="15"/>` +
        `<circle cx="128" cy="90" r="17" fill="none" stroke="${F}" stroke-width="9"/>`
      break
    }

    case 'G': {
      // Sideways hand: index pointing right, thumb below
      s = PALM_SIDE +
          mkFh(138,175,82,14) + mkNh(175,82) +       // index
          mkFh(136,165,100,13)                         // thumb
      break
    }

    case 'H': {
      // Sideways: index + middle pointing right
      s = PALM_SIDE +
          mkFh(138,176,76,14) + mkNh(176,76) +   // index
          mkFh(138,176,94,14) + mkNh(176,94)     // middle
      break
    }

    case 'I': {
      // Only pinky extended
      s = mkK(FR,FRb) + mkK(FM,FMb) + mkK(FI,FIb) +
          mkF(FP,FPt,FPb)+mkN(FP,FPt)+mkJ(FP,105) +
          PALM + thumbFold()
      break
    }

    case 'J': {
      // Same static shape as I (J adds traced J motion)
      s = mkK(FR,FRb) + mkK(FM,FMb) + mkK(FI,FIb) +
          mkF(FP,FPt,FPb)+mkN(FP,FPt)+mkJ(FP,105) +
          PALM + thumbFold()
      break
    }

    case 'K': {
      // Index + middle extended, thumb up between them
      s = mkK(FP,FPb) + mkK(FR,FRb) +
          mkF(FM,FMt,FMb)+mkN(FM,FMt)+mkJ(FM,96) +
          mkF(FI,FIt,FIb)+mkN(FI,FIt)+mkJ(FI,100) +
          PALM + thumbU(52, 84, 132)
      break
    }

    case 'L': {
      // Index up + thumb right — clear L shape
      s = mkK(FP,FPb) + mkK(FR,FRb) + mkK(FM,FMb) +
          mkF(FI,FIt,FIb)+mkN(FI,FIt)+mkJ(FI,100) +
          PALM + thumbR()
      break
    }

    case 'M': {
      // 3 fingers (index/middle/ring) folded over thumb
      const over3 =
        `<path d="M ${FR-7},${FRb} C ${FR-7},${FRb-26} ${FR+10},${FRb-30} ${FR+10},${FRb-22} Q ${FR+9},${FRb-14} ${FR+7},${FRb} Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>` +
        `<path d="M ${FM-7},${FMb} C ${FM-7},${FMb-28} ${FM+10},${FMb-32} ${FM+10},${FMb-24} Q ${FM+9},${FMb-15} ${FM+7},${FMb} Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>` +
        `<path d="M ${FI-7},${FIb} C ${FI-7},${FIb-26} ${FI+10},${FIb-30} ${FI+10},${FIb-22} Q ${FI+9},${FIb-14} ${FI+7},${FIb} Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
      // Thumb visible below fingers
      const thStub = `<path d="M 68,142 C 68,135 73,132 78,132 L 90,132 Q 95,134 95,141 Q 95,147 90,148 L 78,148 C 73,148 68,146 68,142 Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
      s = thStub + PALM + mkK(FP,FPb) + over3
      break
    }

    case 'N': {
      // 2 fingers (index/middle) folded over thumb
      const over2 =
        `<path d="M ${FM-7},${FMb} C ${FM-7},${FMb-26} ${FM+10},${FMb-30} ${FM+10},${FMb-22} Q ${FM+9},${FMb-14} ${FM+7},${FMb} Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>` +
        `<path d="M ${FI-7},${FIb} C ${FI-7},${FIb-26} ${FI+10},${FIb-30} ${FI+10},${FIb-22} Q ${FI+9},${FIb-14} ${FI+7},${FIb} Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
      const thStub = `<path d="M 76,142 C 76,135 80,132 85,132 L 96,132 Q 101,134 101,141 Q 101,147 96,148 L 85,148 C 80,148 76,146 76,142 Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
      s = thStub + PALM + mkK(FP,FPb) + mkK(FR,FRb) + over2
      break
    }

    case 'O': {
      // All fingers and thumb form O — draw as a skin-colored ring
      s = `<circle cx="100" cy="106" r="44" fill="${F}" stroke="${SO}" stroke-width="2"/>` +
          `<circle cx="100" cy="106" r="27" fill="${HBG}" stroke="${SO}" stroke-width="2"/>`
      break
    }

    case 'P': {
      // Like K but hand points down (index + middle down, thumb left)
      const downPalm = `<path d="M 70,58 Q 80,50 110,52 Q 130,54 132,64 L 130,100 Q 128,112 110,112 Q 90,112 76,108 Q 66,104 68,94 Z" fill="${FH}" stroke="${SO}" stroke-width="1.5"/>`
      s = downPalm +
          mkFh(66,40,78,14) + mkNh(40,78) +   // index pointing left/down
          mkFh(64,40,96,13) + mkNh(40,96) +   // middle
          `<path d="M 112,60 C 118,55 126,55 130,60 L 130,78 Q 130,84 124,86 Q 118,88 114,84 Q 110,80 112,74 Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
      break
    }

    case 'Q': {
      // Like G but pointing down
      s = PALM_SIDE +
          mkFh(62,30,93,14) + mkNh(30,93) +    // index pointing left (down)
          mkFh(64,35,110,12)                    // thumb
      break
    }

    case 'R': {
      // Index + middle extended, middle crossed over index
      const idx = mkF(FI,FIt,FIb) + mkN(FI,FIt)
      const mid = `<path d="M ${FM-7},${FMb} C ${FM-4},${FMb-28} ${FI-4},${FMt+28} ${FI-5},${FMt+4} Q ${FI},${FMt-5} ${FI+5},${FMt+4} C ${FI+6},${FMt+28} ${FM+5},${FMb-28} ${FM+7},${FMb} Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
      const midNail = mkN(FI, FMt)
      s = mkK(FP,FPb) + mkK(FR,FRb) + idx + PALM + mid + midNail + thumbFold()
      break
    }

    case 'S': {
      // Closed fist, thumb draped over top of fingers
      s = mkK(FP,FPb) + mkK(FR,FRb) + mkK(FM,FMb) + mkK(FI,FIb) + PALM + thumbOver()
      break
    }

    case 'T': {
      // Closed fist, thumb inserted between index and middle
      s = mkK(FP,FPb) + mkK(FR,FRb) + mkK(FM,FMb) + mkK(FI,FIb) + PALM + thumbBetween()
      break
    }

    case 'U': {
      // Index + middle side by side, parallel
      s = mkK(FP,FPb) + mkK(FR,FRb) +
          mkF(FM,FMt,FMb)+mkN(FM,FMt)+mkJ(FM,96) +
          mkF(FI,FIt,FIb)+mkN(FI,FIt)+mkJ(FI,100) +
          PALM + thumbFold()
      break
    }

    case 'V': {
      // Index + middle spread in V (rotated outward)
      const midPath = `<path d="M ${FM-6},${FMb} C ${FM-7},${FMb-25} ${FM-10},${FMt+25} ${FM-11},${FMt+6} Q ${FM-8},${FMt-4} ${FM-2},${FMt-4} Q ${FM+3},${FMt-4} ${FM+6},${FMt+6} C ${FM+7},${FMt+25} ${FM+5},${FMb-25} ${FM+6},${FMb} Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
      const idxPath = `<path d="M ${FI-6},${FIb} C ${FI-5},${FIb-25} ${FI+4},${FIt+25} ${FI+5},${FIt+6} Q ${FI+8},${FIt-4} ${FI+14},${FIt-4} Q ${FI+19},${FIt-4} ${FI+22},${FIt+6} C ${FI+23},${FIt+25} ${FI+14},${FIb-25} ${FI+14},${FIb} Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
      const midNail = mkN(FM-5, FMt)
      const idxNail = mkN(FI+13, FIt)
      s = mkK(FP,FPb) + mkK(FR,FRb) + midPath + idxPath + PALM + midNail + idxNail + thumbFold()
      break
    }

    case 'W': {
      // Ring + middle + index spread (fan of 3)
      const rPath  = `<path d="M ${FR-6},${FRb} C ${FR-7},${FRb-24} ${FR-13},${FRt+26} ${FR-14},${FRt+6} Q ${FR-11},${FRt-4} ${FR-5},${FRt-4} Q ${FR+0},${FRt-4} ${FR+3},${FRt+6} C ${FR+4},${FRt+26} ${FR+3},${FRb-24} ${FR+7},${FRb} Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
      const mPath  = mkF(FM,FMt,FMb)
      const iPath  = `<path d="M ${FI-6},${FIb} C ${FI-5},${FIb-25} ${FI+5},${FIt+26} ${FI+6},${FIt+6} Q ${FI+9},${FIt-4} ${FI+15},${FIt-4} Q ${FI+21},${FIt-4} ${FI+24},${FIt+6} C ${FI+25},${FIt+26} ${FI+16},${FIb-25} ${FI+16},${FIb} Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
      const nails  = mkN(FR-10,FRt) + mkN(FM,FMt) + mkN(FI+15,FIt)
      s = mkK(FP,FPb) + rPath + mPath + iPath + PALM + nails + thumbFold()
      break
    }

    case 'X': {
      // Index hooked (bent at proximal joint)
      const hook = `<path d="M ${FI-6},${FIb} C ${FI-6},${FIb-28} ${FI+2},${FIb-42} ${FI+12},${FIb-44} Q ${FI+22},${FIb-46} ${FI+24},${FIb-38} Q ${FI+26},${FIb-28} ${FI+16},${FIb-22} L ${FI+6},${FIb} Z" fill="${F}" stroke="${SO}" stroke-width="1.2"/>`
      s = mkK(FP,FPb) + mkK(FR,FRb) + mkK(FM,FMb) + hook + PALM + thumbFold()
      break
    }

    case 'Y': {
      // Pinky + thumb extended, others folded
      s = mkK(FR,FRb) + mkK(FM,FMb) + mkK(FI,FIb) +
          mkF(FP,FPt,FPb)+mkN(FP,FPt)+mkJ(FP,105) +
          PALM + thumbR()
      break
    }

    case 'Z': {
      // Index extended pointing up (traces Z — static same as pointing index)
      s = mkK(FP,FPb) + mkK(FR,FRb) + mkK(FM,FMb) +
          mkF(FI,FIt,FIb)+mkN(FI,FIt)+mkJ(FI,100) +
          PALM + thumbFold()
      break
    }

    default:
      return null
  }

  return svg(DEFS + `<rect width="200" height="200" fill="${HBG}"/>` + s)
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
