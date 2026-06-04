// ─────────────────────────────────────────────
// useDecks — load built-in and user-imported decks
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react'
import type { DeckMeta, DeckPack } from '@/types'

// Built-in deck imports (Vite handles JSON)
import aslDeck from '@/data/decks/asl-alphabet.json'
import nauticalDeck from '@/data/decks/nautical-flags.json'

const BUILT_IN_DECKS: DeckPack[] = [
  aslDeck as DeckPack,
  nauticalDeck as DeckPack,
]

export function useDecks() {
  const [decks, setDecks] = useState<DeckMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Start with built-in decks
    const loaded = BUILT_IN_DECKS.map(p => p.deck)

    // TODO: load user-imported decks from IndexedDB decks store
    // const userDecks = await getUserDecks()
    // loaded.push(...userDecks)

    setDecks(loaded)
    setLoading(false)
  }, [])

  /**
   * Import a deck pack from a JSON file dropped/selected by the user.
   * Validates schema version before accepting.
   */
  async function importDeckFromFile(file: File): Promise<{ ok: boolean; error?: string }> {
    try {
      const text = await file.text()
      const pack = JSON.parse(text) as DeckPack
      if (pack.schema !== '1.0') return { ok: false, error: 'Unsupported deck schema version.' }
      if (!pack.deck?.id || !Array.isArray(pack.deck?.cards)) {
        return { ok: false, error: 'Invalid deck format.' }
      }
      // TODO: persist to IndexedDB decks store
      setDecks(prev => {
        const exists = prev.find(d => d.id === pack.deck.id)
        if (exists) return prev.map(d => d.id === pack.deck.id ? pack.deck : d)
        return [...prev, pack.deck]
      })
      return { ok: true }
    } catch {
      return { ok: false, error: 'Could not parse deck file.' }
    }
  }

  return { decks, loading, importDeckFromFile }
}
