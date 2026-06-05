import { useState, useEffect, useCallback } from 'react'
import type { DeckMeta, DeckPack } from '@/types'
import { putDeck, getAllDecks, deleteDeck } from '@/lib/db'

// Built-in deck imports (Vite handles JSON)
import aslDeck from '@/data/decks/asl-alphabet.json'
import nauticalDeck from '@/data/decks/nautical-flags.json'

const BUILT_IN_DECKS: DeckPack[] = [
  aslDeck as DeckPack,
  nauticalDeck as DeckPack,
]
const BUILT_IN_IDS = new Set(BUILT_IN_DECKS.map(p => p.deck.id))

export function useDecks() {
  const [decks, setDecks] = useState<DeckMeta[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const builtIn = BUILT_IN_DECKS.map(p => p.deck)
    const userDecks = await getAllDecks()
    // User decks that shadow a built-in ID win; append the rest
    const builtInFiltered = builtIn.filter(d => !userDecks.find(u => u.id === d.id))
    setDecks([...builtInFiltered, ...userDecks])
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  async function importDeckFromFile(file: File): Promise<{ ok: boolean; error?: string }> {
    try {
      const text = await file.text()
      const pack = JSON.parse(text) as DeckPack
      if (pack.schema !== '1.0') return { ok: false, error: 'Unsupported deck schema version.' }
      if (!pack.deck?.id || !Array.isArray(pack.deck?.cards)) {
        return { ok: false, error: 'Invalid deck format.' }
      }
      await putDeck(pack.deck)
      await reload()
      return { ok: true }
    } catch {
      return { ok: false, error: 'Could not parse deck file.' }
    }
  }

  async function saveDeck(deck: DeckMeta): Promise<void> {
    await putDeck(deck)
    await reload()
  }

  async function removeDeck(id: string): Promise<{ ok: boolean; error?: string }> {
    if (BUILT_IN_IDS.has(id)) return { ok: false, error: 'Built-in decks cannot be removed.' }
    await deleteDeck(id)
    await reload()
    return { ok: true }
  }

  return { decks, loading, importDeckFromFile, saveDeck, removeDeck }
}
