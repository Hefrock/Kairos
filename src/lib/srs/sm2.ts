// ─────────────────────────────────────────────
// Kairos — SM-2 Spaced Repetition Algorithm
// ─────────────────────────────────────────────
// Based on the SuperMemo SM-2 algorithm.
// Reference: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2

import type { CardProgress, Grade } from '@/types'

const DEFAULT_EF = 2.5
const MIN_EF = 1.3

/**
 * Apply an SM-2 review to a card progress record.
 * Returns a new CardProgress object (immutable update).
 */
export function applyGrade(
  prev: Partial<CardProgress>,
  grade: Grade,
  now = Date.now()
): CardProgress {
  const rep = prev.rep ?? 0
  const ef = prev.ef ?? DEFAULT_EF
  const prevInterval = prev.interval ?? 0

  let nextInterval: number
  let nextRep: number

  if (grade === 0) {
    // Again — reset, review in 1 minute
    nextRep = 0
    nextInterval = 0
  } else {
    // Hard / Good / Easy — advance
    nextRep = rep + 1
    if (rep === 0) nextInterval = 1
    else if (rep === 1) nextInterval = 6
    else nextInterval = Math.round(prevInterval * ef)

    // Easy bonus
    if (grade === 3) nextInterval = Math.round(nextInterval * 1.3)
  }

  // Ease factor adjustment
  const efDelta = [0, -0.15, 0, 0.1][grade]
  const nextEf = Math.max(MIN_EF, ef + efDelta)

  // Due timestamp
  const dueOffset = grade === 0
    ? 60 * 1000                          // 1 minute
    : nextInterval * 24 * 60 * 60 * 1000 // N days

  return {
    id: prev.id ?? '',
    rep: nextRep,
    ef: nextEf,
    interval: nextInterval,
    due: now + dueOffset,
    lastGrade: grade,
    overrideImg: prev.overrideImg,
    overrideDesc: prev.overrideDesc,
  }
}

/** Returns true if a card is due for review */
export function isDue(card: Partial<CardProgress>, now = Date.now()): boolean {
  return (card.due ?? 0) <= now
}

/** Returns true if card has never been reviewed */
export function isNew(card: Partial<CardProgress>): boolean {
  return !card.rep || card.rep === 0
}

/** Human-readable next review string */
export function nextReviewLabel(card: Partial<CardProgress>): string {
  if (isNew(card)) return 'New'
  const diff = (card.due ?? 0) - Date.now()
  if (diff <= 0) return 'Due now'
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

/** Fisher–Yates shuffle — returns a new randomized array */
export function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Sort cards: due first, then new, then upcoming */
export function sortQueue(
  cards: Array<Partial<CardProgress> & { id: string }>,
  now = Date.now()
): typeof cards {
  return [...cards].sort((a, b) => {
    const aDue = isDue(a, now)
    const bDue = isDue(b, now)
    if (aDue && !bDue) return -1
    if (!aDue && bDue) return 1
    return (a.due ?? 0) - (b.due ?? 0)
  })
}
