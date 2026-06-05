import { Link } from 'react-router-dom'
import type { SessionStats } from '@/types'

interface SessionCompleteProps {
  stats: SessionStats
  deckName: string
  onRestart: () => void
}

export default function SessionComplete({ stats, deckName, onRestart }: SessionCompleteProps) {
  const { cardsStudied, correct, again } = stats
  const pct = cardsStudied > 0 ? Math.round((correct / cardsStudied) * 100) : 0
  const circumference = 2 * Math.PI * 42

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-7 text-center">

      {/* Score ring */}
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r="42" fill="none" stroke="#e8d5a3" strokeOpacity="0.4" strokeWidth="7" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke="#c9a84c" strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.23,1,0.32,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl text-gold leading-none">{pct}%</span>
          <span className="text-[10px] text-ink/40 dark:text-parchment/40 font-body tracking-wide mt-0.5">correct</span>
        </div>
      </div>

      {/* Title */}
      <div>
        <h2 className="font-display text-2xl text-ink dark:text-parchment tracking-wide">Session Complete</h2>
        <p className="text-ink/40 dark:text-parchment/40 text-sm font-body mt-1">{deckName}</p>
      </div>

      {/* Stats */}
      <div className="flex gap-6 items-center">
        <Stat value={cardsStudied} label="studied" color="text-ink dark:text-parchment" />
        <div className="w-px h-8 bg-ink/10 dark:bg-parchment/10" />
        <Stat value={correct} label="correct" color="text-emerald-700 dark:text-emerald-400" />
        <div className="w-px h-8 bg-ink/10 dark:bg-parchment/10" />
        <Stat value={again} label="again" color="text-red-500 dark:text-red-400" />
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-1">
        <button
          onClick={onRestart}
          className="px-7 py-3 bg-ink dark:bg-parchment text-gold dark:text-ink font-display text-sm rounded-xl tracking-wide hover:bg-ink-mid dark:hover:bg-parchment/90 transition-colors active:scale-95"
        >
          Study Again
        </button>
        <Link
          to="/browse"
          className="px-7 py-3 border border-gold/30 text-gold/70 font-display text-sm rounded-xl tracking-wide hover:border-gold/60 hover:text-gold transition-colors"
        >
          Browse Decks
        </Link>
      </div>
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`font-display text-2xl ${color}`}>{value}</span>
      <span className="text-xs text-ink/40 dark:text-parchment/40 font-body">{label}</span>
    </div>
  )
}
