import { Link } from 'react-router-dom'
import { useDecks } from '@/hooks/useDecks'
import { useDeckStats, type DeckStats } from '@/hooks/useDeckStats'
import type { DeckMeta } from '@/types'

export default function BrowsePage() {
  const { decks, loading, removeDeck } = useDecks()
  const { stats } = useDeckStats(decks)

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <p className="font-display text-gold/50 tracking-widest animate-pulse">Loading…</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl text-ink dark:text-parchment tracking-wide">Browse Decks</h1>
        <Link
          to="/browse/create"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold text-ink font-display text-sm tracking-wide hover:bg-gold/90 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Deck
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {decks.map(deck => (
          <DeckCard key={deck.id} deck={deck} stats={stats[deck.id]} onRemove={() => removeDeck(deck.id)} />
        ))}
      </div>
    </div>
  )
}

function DeckCard({ deck, stats, onRemove }: { deck: DeckMeta; stats?: DeckStats; onRemove: () => void }) {
  const hasDue = (stats?.dueCount ?? 0) > 0
  const hasNew = (stats?.newCount ?? 0) > 0
  const isBuiltIn = deck.category !== 'custom'

  return (
    <div className="rounded-card border border-gold/20 bg-parchment dark:bg-ink-mid p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-gold/40 transition-all">

      {/* ── Top row: tag + count ── */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-body tracking-widest text-gold/70 uppercase">
          {deck.tag}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink/50 dark:text-parchment/50 font-body tabular-nums">
            {deck.cards.length} cards
          </span>
          {!isBuiltIn && (
            <button
              onClick={onRemove}
              title="Remove deck"
              className="text-ink/20 dark:text-parchment/20 hover:text-red-400 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-4 h-4" aria-hidden>
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Deck name + description ── */}
      <div>
        <h2 className="font-display text-lg text-ink dark:text-parchment tracking-wide leading-snug">{deck.name}</h2>
        <p className="text-sm text-ink/65 dark:text-parchment/65 font-body mt-0.5 line-clamp-2 leading-relaxed">
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
                <Pill value={stats.newCount} label="new" color="text-ink/60 dark:text-parchment/60 bg-ink/5 dark:bg-parchment/5 border-ink/15 dark:border-parchment/15" />
              )}
              {stats.learnedCount > 0 && (
                <Pill value={stats.learnedCount} label="learned" color="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700" />
              )}
            </>
          ) : (
            <span className="text-xs text-ink/20 dark:text-parchment/20 font-body">—</span>
          )}
        </div>

        <Link
          to={`/study/${deck.id}`}
          className={`shrink-0 px-5 py-2 rounded-xl font-display text-sm tracking-wide transition-colors active:scale-95 ${
            hasDue
              ? 'bg-gold text-ink hover:bg-gold/90'
              : hasNew
              ? 'bg-ink dark:bg-parchment text-gold dark:text-ink hover:bg-ink-mid dark:hover:bg-parchment/90'
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
