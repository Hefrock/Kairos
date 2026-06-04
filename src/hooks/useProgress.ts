import { useState, useEffect, useCallback } from 'react'
import type { DeckMeta } from '@/types'
import { getAllProgress } from '@/lib/db'
import { isDue, isNew } from '@/lib/srs/sm2'

export interface OverallStats {
  totalCards: number
  newCards: number
  dueCards: number
  learnedCards: number
  masteredCards: number   // rep >= 5
  studiedToday: number    // sessions graded today (grade >= 1)
  streak: number          // consecutive days with at least one review
}

export function useProgress(decks: DeckMeta[]) {
  const [stats, setStats] = useState<OverallStats | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (decks.length === 0) return
    const allProgress = await getAllProgress()
    const byId = new Map(allProgress.map(p => [p.id, p]))
    const now = Date.now()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    let newCards = 0, dueCards = 0, learnedCards = 0, masteredCards = 0
    let totalCards = 0

    for (const deck of decks) {
      for (const card of deck.cards) {
        totalCards++
        const p = byId.get(card.id)
        if (!p || isNew(p)) {
          newCards++
        } else if (isDue(p, now)) {
          dueCards++
        } else {
          learnedCards++
          if ((p.rep ?? 0) >= 5) masteredCards++
        }
      }
    }

    // "studied today" = progress records with due reset recently (grade applied today)
    // We infer this from cards whose due - interval*day roughly equals today.
    // Simpler proxy: count records whose due was updated (due > todayStart and rep > 0)
    const studiedToday = allProgress.filter(p =>
      (p.rep ?? 0) > 0 && p.due >= todayStart.getTime()
    ).length

    // Streak: count consecutive days going back from today that have at least one review.
    // We approximate by checking if studiedToday > 0 for streak = 1+, but without
    // full session history we can only give a rough estimate based on due dates.
    // For a proper streak, we'd need a session log store — for now, show 1 if studied today.
    const streak = studiedToday > 0 ? 1 : 0

    setStats({ totalCards, newCards, dueCards, learnedCards, masteredCards, studiedToday, streak })
    setLoading(false)
  }, [decks])

  useEffect(() => { refresh() }, [refresh])

  return { stats, loading, refresh }
}
