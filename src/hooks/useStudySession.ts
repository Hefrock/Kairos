// ─────────────────────────────────────────────
// useStudySession — manages a single study session
// ─────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react'
import type { Card, Grade, StudyMode, SessionStats, DeckMeta } from '@/types'
import { applyGrade, isDue, isNew, sortQueue, shuffle } from '@/lib/srs/sm2'
import { getProgress, putProgress } from '@/lib/db'

type SessionState = 'idle' | 'studying' | 'flipped' | 'done'

export function useStudySession(deck: DeckMeta | null, mode: StudyMode, randomize = false) {
  const [queue, setQueue] = useState<Card[]>([])
  const [index, setIndex] = useState(0)
  const [state, setState] = useState<SessionState>('idle')
  const [stats, setStats] = useState<SessionStats | null>(null)

  // Build the study queue from deck cards + their SRS progress
  const buildQueue = useCallback(async () => {
    if (!deck) return
    const now = Date.now()

    const withProgress = await Promise.all(
      deck.cards.map(async (def) => {
        const progress = await getProgress(def.id)
        return { ...def, ...progress } as Card
      })
    )

    // Due + new cards first; if nothing is due, study all
    let due = withProgress.filter(c => isDue(c, now) || isNew(c))
    if (due.length === 0) due = withProgress

    // Randomize order when shuffle is on, otherwise SRS-prioritized order
    const ordered = randomize
      ? shuffle(due.map(c => ({ ...c, id: c.id })))
      : sortQueue(due.map(c => ({ ...c, id: c.id })))

    setQueue(ordered as Card[])
    setIndex(0)
    setState('studying')
    setStats({
      deckId: deck.id,
      startedAt: now,
      cardsStudied: 0,
      correct: 0,
      again: 0,
    })
  }, [deck, randomize])

  useEffect(() => {
    buildQueue()
  }, [buildQueue])

  const currentCard = queue[index] ?? null

  function flip() {
    if (state === 'studying') setState('flipped')
  }

  async function grade(g: Grade) {
    if (!currentCard || state !== 'flipped') return

    const updated = applyGrade(currentCard, g)
    await putProgress(updated)

    // Merge override fields back (not stored in SM-2 record by default)
    const next: Card = {
      ...currentCard,
      ...updated,
      overrideImg: currentCard.overrideImg,
      overrideDesc: currentCard.overrideDesc,
    }

    setQueue(prev => prev.map((c, i) => i === index ? next : c))

    setStats(prev => prev ? {
      ...prev,
      cardsStudied: prev.cardsStudied + 1,
      correct: prev.correct + (g >= 2 ? 1 : 0),
      again: prev.again + (g === 0 ? 1 : 0),
    } : prev)

    const nextIndex = index + 1
    if (nextIndex >= queue.length) {
      setState('done')
    } else {
      setIndex(nextIndex)
      setState('studying')
    }
  }

  async function updateCardOverride(id: string, overrideImg?: string, overrideDesc?: string) {
    const progress = await getProgress(id) ?? {
      id, rep: 0, ef: 2.5, interval: 0, due: Date.now()
    }
    await putProgress({ ...progress, overrideImg, overrideDesc })
    setQueue(prev =>
      prev.map(c => c.id === id ? { ...c, overrideImg, overrideDesc } : c)
    )
  }

  return {
    currentCard,
    index,
    total: queue.length,
    state,
    stats,
    mode,
    flip,
    grade,
    restart: buildQueue,
    updateCardOverride,
  }
}
