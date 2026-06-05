import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDecks } from '@/hooks/useDecks'
import { useStudySession } from '@/hooks/useStudySession'
import { useSettings } from '@/hooks/useSettings'
import type { StudyMode } from '@/types'
import Flashcard from '@/components/study/Flashcard'
import GradeButtons from '@/components/study/GradeButtons'
import SessionComplete from '@/components/study/SessionComplete'
import ProgressBar from '@/components/study/ProgressBar'
import DeckSwitcher from '@/components/study/DeckSwitcher'

export default function StudyPage() {
  const { deckId } = useParams<{ deckId?: string }>()
  const { decks, loading } = useDecks()
  const { settings, update } = useSettings()
  const [mode, setMode] = useState<StudyMode>('image-to-label')

  const shuffle = settings?.shuffle ?? true
  const activeDeck = decks.find(d => d.id === (deckId ?? decks[0]?.id)) ?? null
  const session = useStudySession(activeDeck, mode, shuffle)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' && session.state === 'studying') {
        e.preventDefault()
        session.flip()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [session.state, session.flip])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <p className="font-display text-gold/50 tracking-widest animate-pulse">Loading…</p>
    </div>
  )

  if (!activeDeck) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <p className="font-display text-2xl text-ink/50 dark:text-parchment/50">No decks found</p>
      <p className="text-ink/55 dark:text-parchment/55 text-sm font-body">Import a deck from Browse to get started.</p>
    </div>
  )

  if (session.state === 'done' && session.stats) {
    return (
      <SessionComplete
        stats={session.stats}
        deckName={activeDeck.name}
        onRestart={session.restart}
      />
    )
  }

  return (
    <div className="flex flex-col">

      {/* ── Top row: deck switcher + controls ── */}
      <div className="flex items-center justify-between mb-3 gap-3">
        {decks.length > 1 ? (
          <DeckSwitcher decks={decks} activeDeck={activeDeck} />
        ) : (
          <span className="font-display text-sm text-ink/70 dark:text-parchment/70">{activeDeck.name}</span>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => update({ shuffle: !shuffle })}
            aria-pressed={shuffle}
            title={shuffle ? 'Shuffle on — random order' : 'Shuffle off — review order'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-body transition-colors ${
              shuffle
                ? 'border-gold/50 text-gold bg-gold/10'
                : 'border-ink/15 dark:border-parchment/20 text-ink/50 dark:text-parchment/50 hover:text-ink/80 dark:hover:text-parchment/80'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden>
              <path d="M16 3h5v5" /><path d="M4 20 21 3" />
              <path d="M21 16v5h-5" /><path d="m15 15 6 6" /><path d="M4 4l5 5" />
            </svg>
            <span className="tracking-wide">Shuffle</span>
          </button>

          <button
            onClick={() => setMode(m => m === 'image-to-label' ? 'label-to-image' : 'image-to-label')}
            title={mode === 'image-to-label' ? 'Switch to label → image' : 'Switch to image → label'}
            className="px-2.5 py-1.5 rounded-lg border border-ink/15 dark:border-parchment/20 text-xs text-ink/55 dark:text-parchment/55 hover:text-ink/80 dark:hover:text-parchment/80 font-body transition-colors tracking-wide"
          >
            {mode === 'image-to-label' ? 'img → label' : 'label → img'}
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <ProgressBar current={session.index} total={session.total} />

      {/* ── Flashcard ── */}
      {session.currentCard && (
        <Flashcard
          card={session.currentCard}
          mode={mode}
          state={session.state === 'flipped' ? 'flipped' : 'studying'}
          onFlip={session.flip}
        />
      )}

      {/* ── Grade buttons (appear after flip) ── */}
      {session.currentCard && (
        <GradeButtons
          card={session.currentCard}
          visible={session.state === 'flipped'}
          onGrade={session.grade}
        />
      )}

      {/* ── Keyboard hint ── */}
      {session.state === 'studying' && (
        <p className="text-center text-xs text-ink/40 dark:text-parchment/40 font-body mt-5 tracking-widest select-none">
          space to flip · 1 – 4 to grade
        </p>
      )}

    </div>
  )
}
