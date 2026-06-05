import { useState } from 'react'
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
        <div className="card-face absolute inset-0 rounded-card bg-parchment dark:bg-ink-mid border border-gold/20 shadow-md overflow-hidden flex flex-col items-center justify-center gap-5 px-6 cursor-pointer">
          {mode === 'image-to-label' ? (
            <>
              {imgSrc && <CardImage src={imgSrc} alt={card.label} dark={false} />}
              <span className="text-[11px] text-ink/45 dark:text-parchment/45 tracking-[0.25em] uppercase font-body select-none">
                tap to reveal
              </span>
            </>
          ) : (
            <>
              <p className="font-display text-4xl text-ink dark:text-parchment tracking-wide text-center leading-tight select-none">
                {card.label}
              </p>
              <span className="text-[11px] text-ink/45 dark:text-parchment/45 tracking-[0.25em] uppercase font-body select-none">
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
              <p className="text-gold-light/90 text-[15px] text-center leading-relaxed font-body max-w-xs">
                {desc}
              </p>
            </>
          ) : (
            <>
              {imgSrc && <CardImage src={imgSrc} alt={card.label} dark={true} />}
              <p className="font-display text-lg text-gold/90 tracking-widest text-center select-none">
                {card.label}
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

function CardImage({ src, alt, dark }: { src: string; alt: string; dark: boolean }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div className="relative flex items-center justify-center w-full max-h-56 min-h-[100px] rounded-xl overflow-hidden bg-white">
      {status === 'loading' && (
        <div className={`absolute inset-0 rounded-lg animate-pulse ${dark ? 'bg-white/5' : 'bg-ink/5 dark:bg-parchment/5'}`} />
      )}
      {status === 'error' && (
        <div className={`flex flex-col items-center gap-2 ${dark ? 'text-gold/30' : 'text-ink/20 dark:text-parchment/20'}`}>
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 15l5-5 4 4 3-3 6 6" />
            <circle cx="8.5" cy="8.5" r="1.5" />
          </svg>
          <span className="text-xs font-body tracking-wide">{alt}</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        draggable={false}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={`max-h-56 max-w-full w-auto object-contain drop-shadow transition-opacity duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0 absolute'
        }`}
      />
    </div>
  )
}
