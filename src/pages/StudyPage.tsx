// ─────────────────────────────────────────────
// StudyPage
// ─────────────────────────────────────────────
// TODO (Claude Code): Build out the full UI using:
//   - useDecks() to list/select decks
//   - useStudySession() for SM-2 queue, flip, grade
//   - <Flashcard /> component for the card
//   - <GradeButtons /> for Again/Hard/Good/Easy
//   - <SessionComplete /> for end-of-session summary
//
// Reference the working prototype in this conversation for
// the visual design (Cinzel font, gold/ink/parchment palette,
// card flip animation, soft timer, progress bar).
// ─────────────────────────────────────────────

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDecks } from '@/hooks/useDecks'
import { useStudySession } from '@/hooks/useStudySession'
import type { StudyMode } from '@/types'

export default function StudyPage() {
  const { deckId } = useParams<{ deckId?: string }>()
  const { decks, loading } = useDecks()
  const [mode, setMode] = useState<StudyMode>('image-to-label')

  const activeDeck = decks.find(d => d.id === (deckId ?? decks[0]?.id)) ?? null
  const session = useStudySession(activeDeck, mode)

  if (loading) return <p className="text-center text-ink/50 pt-12">Loading decks…</p>
  if (!activeDeck) return <p className="text-center text-ink/50 pt-12">No decks found.</p>

  return (
    <div>
      <p className="text-sm text-ink/50 mb-4">
        {/* Deck selector — TODO: replace with DeckSwitcher component */}
        Deck: <strong>{activeDeck.name}</strong> ·{' '}
        Card {session.index + 1} of {session.total}
      </p>

      {/* TODO: <Flashcard card={session.currentCard} mode={mode} onFlip={session.flip} state={session.state} /> */}
      <div className="bg-white border border-gold/30 rounded-card p-8 text-center min-h-[280px] flex items-center justify-center">
        {session.state === 'done' ? (
          <div>
            <p className="font-display text-2xl text-gold mb-4">Session Complete</p>
            <p className="text-ink/60 mb-6">
              {session.stats?.correct} / {session.stats?.cardsStudied} correct
            </p>
            <button
              onClick={session.restart}
              className="px-6 py-3 bg-ink text-gold font-display rounded-lg"
            >
              Study Again
            </button>
          </div>
        ) : session.state === 'flipped' ? (
          <div>
            <p className="font-display text-3xl">{session.currentCard?.label}</p>
            <p className="text-ink/70 mt-3 max-w-xs">{session.currentCard?.overrideDesc ?? session.currentCard?.desc}</p>
          </div>
        ) : (
          <div onClick={session.flip} className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-4">
            {session.currentCard?.img && (
              <img src={session.currentCard.overrideImg ?? session.currentCard.img} alt={session.currentCard.label} className="max-h-48 object-contain" />
            )}
            <p className="text-sm text-ink/40">tap to reveal</p>
          </div>
        )}
      </div>

      {/* TODO: <GradeButtons onGrade={session.grade} visible={session.state === 'flipped'} /> */}
      {session.state === 'flipped' && (
        <div className="grid grid-cols-4 gap-3 mt-4">
          {(['Again', 'Hard', 'Good', 'Easy'] as const).map((label, i) => (
            <button
              key={label}
              onClick={() => session.grade(i as 0|1|2|3)}
              className="py-3 rounded-xl text-sm font-medium border"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
