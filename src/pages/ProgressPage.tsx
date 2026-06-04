import { Link } from 'react-router-dom'
import { useDecks } from '@/hooks/useDecks'
import { useProgress } from '@/hooks/useProgress'
import { useDeckStats } from '@/hooks/useDeckStats'
import type { DeckMeta } from '@/types'
import type { DeckStats } from '@/hooks/useDeckStats'

export default function ProgressPage() {
  const { decks, loading: decksLoading } = useDecks()
  const { stats, loading: statsLoading } = useProgress(decks)
  const { stats: deckStats } = useDeckStats(decks)

  if (decksLoading || statsLoading || !stats) return (
    <div className="flex items-center justify-center py-24">
      <p className="font-display text-gold/50 tracking-widest animate-pulse">Loading…</p>
    </div>
  )

  const learnedPct = stats.totalCards > 0
    ? Math.round((stats.learnedCards / stats.totalCards) * 100)
    : 0

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-xl text-ink tracking-wide">Progress</h1>

      {/* ── Overview ring + key numbers ── */}
      <div className="rounded-card border border-gold/20 bg-parchment p-5 flex items-center gap-6 shadow-sm">
        <ProgressRing pct={learnedPct} size={88} />
        <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3">
          <Stat value={stats.totalCards}   label="total cards" />
          <Stat value={stats.dueCards}     label="due now"     accent={stats.dueCards > 0 ? 'gold' : undefined} />
          <Stat value={stats.newCards}     label="not started" />
          <Stat value={stats.masteredCards} label="mastered"   accent="emerald" />
        </div>
      </div>

      {/* ── Today row ── */}
      <div className="rounded-card border border-gold/20 bg-parchment p-5 shadow-sm">
        <p className="font-display text-xs text-ink/40 tracking-widest uppercase mb-3">Today</p>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-display text-3xl text-ink">{stats.studiedToday}</span>
            <span className="text-xs text-ink/40 font-body">cards reviewed</span>
          </div>
          <div className="w-px h-10 bg-ink/10" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-display text-3xl text-gold">{stats.streak}</span>
            <span className="text-xs text-ink/40 font-body">day streak</span>
          </div>
          {stats.dueCards > 0 && (
            <Link
              to="/study"
              className="ml-auto px-5 py-2 bg-gold text-ink font-display text-sm rounded-xl tracking-wide hover:bg-gold/90 transition-colors active:scale-95"
            >
              Review {stats.dueCards} due
            </Link>
          )}
        </div>
      </div>

      {/* ── Per-deck breakdown ── */}
      <div>
        <p className="font-display text-xs text-ink/40 tracking-widest uppercase mb-3">Decks</p>
        <div className="flex flex-col gap-3">
          {decks.map(deck => (
            <DeckRow key={deck.id} deck={deck} stats={deckStats[deck.id]} />
          ))}
        </div>
      </div>
    </div>
  )
}

function DeckRow({ deck, stats }: { deck: DeckMeta; stats?: DeckStats }) {
  const total = stats?.total ?? deck.cards.length
  const learned = stats?.learnedCount ?? 0
  const pct = total > 0 ? Math.round((learned / total) * 100) : 0

  return (
    <div className="rounded-card border border-gold/20 bg-parchment px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm text-ink truncate">{deck.name}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1 bg-ink/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-ink/30 font-body tabular-nums shrink-0">{pct}%</span>
        </div>
      </div>
      <div className="flex gap-3 text-right shrink-0">
        {(stats?.dueCount ?? 0) > 0 && (
          <span className="text-xs font-body text-gold tabular-nums">{stats!.dueCount} due</span>
        )}
        <span className="text-xs font-body text-ink/30 tabular-nums">{learned}/{total}</span>
      </div>
    </div>
  )
}

function Stat({ value, label, accent }: { value: number; label: string; accent?: 'gold' | 'emerald' }) {
  const color = accent === 'gold'
    ? 'text-gold'
    : accent === 'emerald'
    ? 'text-emerald-700'
    : 'text-ink'
  return (
    <div>
      <p className={`font-display text-2xl leading-none ${color}`}>{value}</p>
      <p className="text-xs text-ink/40 font-body mt-0.5">{label}</p>
    </div>
  )
}

function ProgressRing({ pct, size }: { pct: number; size: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8d5a3" strokeOpacity="0.4" strokeWidth="5" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#c9a84c" strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.23,1,0.32,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl text-gold leading-none">{pct}%</span>
        <span className="text-[10px] text-ink/40 font-body mt-0.5">learned</span>
      </div>
    </div>
  )
}
