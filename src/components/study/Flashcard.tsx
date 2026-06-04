import type { Card, StudyMode } from '@/types'

interface FlashcardProps {
  card: Card
  mode: StudyMode
  state: 'studying' | 'flipped'
  onFlip: () => void
}

export default function Flashcard({ card, mode, state, onFlip }: FlashcardProps) {
  const isFlipped = state === 'flipped'
  const imgSrc = card.overrideImg ?? card.img
  const desc = card.overrideDesc ?? card.desc

  return (
    <div
      className={`card-wrap w-full h-[340px] sm:h-[380px]${isFlipped ? ' flipped' : ''}`}
      onClick={!isFlipped ? onFlip : undefined}
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? card.label : 'Tap to reveal'}
      onKeyDown={e => {
        if (!isFlipped && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault()
          onFlip()
        }
      }}
    >
      <div className="card-inner relative w-full h-full">

        {/* ── Front face ── */}
        <div className="card-face absolute inset-0 rounded-card bg-parchment border border-gold/20 shadow-md overflow-hidden flex flex-col items-center justify-center gap-5 px-6 cursor-pointer">
          {mode === 'image-to-label' ? (
            <>
              {imgSrc && (
                <img
                  src={imgSrc}
                  alt={card.label}
                  className="max-h-52 max-w-[78%] object-contain drop-shadow"
                  draggable={false}
                />
              )}
              <span className="text-[11px] text-ink/25 tracking-[0.25em] uppercase font-body select-none">
                tap to reveal
              </span>
            </>
          ) : (
            <>
              <p className="font-display text-4xl text-ink tracking-wide text-center leading-tight select-none">
                {card.label}
              </p>
              <span className="text-[11px] text-ink/25 tracking-[0.25em] uppercase font-body select-none">
                tap to reveal
              </span>
            </>
          )}
        </div>

        {/* ── Back face ── */}
        <div className="card-face card-back-face absolute inset-0 rounded-card bg-ink border border-gold/10 shadow-xl overflow-hidden flex flex-col items-center justify-center gap-4 px-8">
          {mode === 'image-to-label' ? (
            <>
              <p className="font-display text-3xl sm:text-4xl text-gold tracking-wide text-center leading-tight">
                {card.label}
              </p>
              <div className="w-10 h-px bg-gold/30" />
              <p className="text-gold-light/60 text-sm text-center leading-relaxed font-body max-w-xs">
                {desc}
              </p>
            </>
          ) : (
            <>
              {imgSrc && (
                <img
                  src={imgSrc}
                  alt={card.label}
                  className="max-h-52 max-w-[78%] object-contain"
                  draggable={false}
                />
              )}
              <p className="font-display text-lg text-gold/70 tracking-widest text-center select-none">
                {card.label}
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
