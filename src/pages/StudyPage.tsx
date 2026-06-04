import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDecks } from '@/hooks/useDecks'
import { useStudySession } from '@/hooks/useStudySession'
import type { StudyMode } from '@/types'
import Flashcard from '@/components/study/Flashcard'
import GradeButtons from '@/components/study/GradeButtons'
import SessionComplete from '@/components/study/SessionComplete'
import ProgressBar from '@/components/study/ProgressBar'
import DeckSwitcher from '@/components/study/DeckSwitcher'

export default function StudyPage() {
  const { deckId } = useParams<{ deckId?: string }>()
  const { decks, loading } = useDecks()
  const [mode, setMode] = useState<StudyMode>('image-to-label')

  const activeDeck = decks.find(d => d.id === (deckId ?? decks[0]?.id)) ?? null
  const session = useStudySession(activeDeck, mode)

  // Space bar flips the card when studying
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
      <p className="font-display text-2xl text-ink/50">No decks found</p>
      <p className="text-ink/30 text-sm font-body">Import a deck from Browse to get started.</p>
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

      {/* ── Top row: deck switcher + mode toggle ── */}
      <div className="flex items-center justify-between mb-2">
        {decks.length > 1 ? (
          <DeckSwitcher decks={decks} activeDeck={activeDeck} />
        ) : (
          <span className="font-display text-sm text-ink/50">{activeDeck.name}</span>
        )}
        <button
          onClick={() => setMode(m => m === 'image-to-label' ? 'label-to-image' : 'image-to-label')}
          className="text-xs text-ink/30 hover:text-ink/60 font-body transition-colors tracking-wider"
          title={mode === 'image-to-label' ? 'Switch to label → image' : 'Switch to image → label'}
        >
          {mode === 'image-to-label' ? 'img → label' : 'label → img'}
        </button>
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
        <p className="text-center text-xs text-ink/20 font-body mt-5 tracking-widest select-none">
          space to flip · 1 – 4 to grade
        </p>
      )}

    </div>
  )
}
