import { useState, useEffect } from 'react'
import type { DeckMeta } from '@/types'
import { getAllProgress } from '@/lib/db'
import { isDue, isNew } from '@/lib/srs/sm2'

export interface DeckStats {
  total: number
  newCount: number
  dueCount: number
  learnedCount: number
}

export function useDeckStats(decks: DeckMeta[]) {
  const [stats, setStats] = useState<Record<string, DeckStats>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (decks.length === 0) return
    ;(async () => {
      const allProgress = await getAllProgress()
      const byId = new Map(allProgress.map(p => [p.id, p]))
      const now = Date.now()
      const result: Record<string, DeckStats> = {}

      for (const deck of decks) {
        let newCount = 0, dueCount = 0, learnedCount = 0
        for (const card of deck.cards) {
          const p = byId.get(card.id)
          if (!p || isNew(p)) newCount++
          else if (isDue(p, now)) dueCount++
          else learnedCount++
        }
        result[deck.id] = { total: deck.cards.length, newCount, dueCount, learnedCount }
      }
      setStats(result)
      setLoading(false)
    })()
  }, [decks])

  return { stats, loading }
}
