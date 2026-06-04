import { Link } from 'react-router-dom'
import { useDecks } from '@/hooks/useDecks'
import { useDeckStats, type DeckStats } from '@/hooks/useDeckStats'
import type { DeckMeta } from '@/types'

export default function BrowsePage() {
  const { decks, loading } = useDecks()
  const { stats } = useDeckStats(decks)

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <p className="font-display text-gold/50 tracking-widest animate-pulse">Loading…</p>
    </div>
  )

  return (
    <div>
      <h1 className="font-display text-xl text-ink tracking-wide mb-6">Browse Decks</h1>
      <div className="flex flex-col gap-4">
        {decks.map(deck => (
          <DeckCard key={deck.id} deck={deck} stats={stats[deck.id]} />
        ))}
      </div>
    </div>
  )
}

function DeckCard({ deck, stats }: { deck: DeckMeta; stats?: DeckStats }) {
  const hasDue = (stats?.dueCount ?? 0) > 0
  const hasNew = (stats?.newCount ?? 0) > 0

  return (
    <div className="rounded-card border border-gold/20 bg-parchment p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-gold/40 transition-all">

      {/* ── Top row: tag + count ── */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-body tracking-widest text-gold/70 uppercase">
          {deck.tag}
        </span>
        <span className="text-xs text-ink/30 font-body tabular-nums">
          {deck.cards.length} cards
        </span>
      </div>

      {/* ── Deck name + description ── */}
      <div>
        <h2 className="font-display text-lg text-ink tracking-wide leading-snug">{deck.name}</h2>
        <p className="text-sm text-ink/50 font-body mt-0.5 line-clamp-2 leading-relaxed">
          {deck.description}
        </p>
      </div>

      {/* ── Status pills + Study button ── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          {stats ? (
            <>
              {stats.dueCount > 0 && (
                <Pill value={stats.dueCount} label="due" color="text-gold bg-gold/10 border-gold/30" />
              )}
              {stats.newCount > 0 && (
                <Pill value={stats.newCount} label="new" color="text-ink/60 bg-ink/5 border-ink/15" />
              )}
              {stats.learnedCount > 0 && (
                <Pill value={stats.learnedCount} label="learned" color="text-emerald-700 bg-emerald-50 border-emerald-200" />
              )}
            </>
          ) : (
            <span className="text-xs text-ink/20 font-body">—</span>
          )}
        </div>

        <Link
          to={`/study/${deck.id}`}
          className={`shrink-0 px-5 py-2 rounded-xl font-display text-sm tracking-wide transition-colors active:scale-95 ${
            hasDue
              ? 'bg-gold text-ink hover:bg-gold/90'
              : hasNew
              ? 'bg-ink text-gold hover:bg-ink-mid'
              : 'border border-gold/30 text-gold/70 hover:border-gold/60 hover:text-gold'
          }`}
        >
          {hasDue ? 'Review' : hasNew ? 'Study' : 'Practice'}
        </Link>
      </div>
    </div>
  )
}

function Pill({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-body ${color}`}>
      <span className="tabular-nums font-medium">{value}</span>
      <span className="opacity-70">{label}</span>
    </span>
  )
}
