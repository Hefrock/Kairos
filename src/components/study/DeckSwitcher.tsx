import { useNavigate } from 'react-router-dom'
import type { DeckMeta } from '@/types'

interface DeckSwitcherProps {
  decks: DeckMeta[]
  activeDeck: DeckMeta
}

export default function DeckSwitcher({ decks, activeDeck }: DeckSwitcherProps) {
  const navigate = useNavigate()
  return (
    <label className="flex items-center gap-1 cursor-pointer group">
      <select
        value={activeDeck.id}
        onChange={e => navigate(`/study/${e.target.value}`)}
        className="font-display text-sm text-ink bg-transparent border-none outline-none cursor-pointer group-hover:text-gold transition-colors appearance-none"
        aria-label="Select deck"
      >
        {decks.map(d => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <svg className="w-3 h-3 text-ink/30 group-hover:text-gold/60 transition-colors" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
        <path d="M6 8 L2 4 L10 4 Z" />
      </svg>
    </label>
  )
}
