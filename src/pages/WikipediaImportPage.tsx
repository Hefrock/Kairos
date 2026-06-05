import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWikipediaImport } from '@/hooks/useWikipediaImport'

export default function WikipediaImportPage() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const { importFromUrl, status, result, errorMessage, reset } = useWikipediaImport()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (url.trim()) importFromUrl(url.trim())
  }

  function handleEdit() {
    if (!result) return
    navigate('/browse/create', {
      state: {
        prefill: result.cards,
        meta: { name: result.deckName, description: result.deckDescription },
      },
    })
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl text-ink dark:text-parchment tracking-wide">From Wikipedia</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-ink/50 dark:text-parchment/50 hover:text-ink/80 dark:hover:text-parchment/80 font-body transition-colors"
        >
          Cancel
        </button>
      </div>

      <section className="rounded-card border border-gold/20 bg-parchment dark:bg-ink-mid p-5 flex flex-col gap-4 shadow-sm">
        <p className="font-display text-xs text-ink/40 dark:text-parchment/40 tracking-widest uppercase">Article URL</p>
        <p className="text-sm text-ink/55 dark:text-parchment/55 font-body">
          Paste a Wikipedia article URL. Each section heading becomes a card — label is the heading, back is the first sentence, full text is stored for MCP context retrieval.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="url"
            placeholder="https://en.wikipedia.org/wiki/Spaced_repetition"
            value={url}
            onChange={e => { setUrl(e.target.value); if (status !== 'idle') reset() }}
            className="input"
            disabled={status === 'fetching'}
          />
          <button
            type="submit"
            disabled={!url.trim() || status === 'fetching'}
            className="w-full py-3 rounded-card bg-gold text-ink font-display tracking-widest text-sm hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {status === 'fetching' ? 'Fetching…' : 'Import article'}
          </button>
        </form>

        {status === 'error' && (
          <p className="text-sm text-red-500 font-body">{errorMessage}</p>
        )}
      </section>

      {status === 'success' && result && (
        <section className="rounded-card border border-gold/20 bg-parchment dark:bg-ink-mid p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            {result.coverImage && (
              <img src={result.coverImage} alt="" className="w-16 h-16 object-cover rounded-lg shrink-0 bg-ink/5" />
            )}
            <div className="flex flex-col gap-1 min-w-0">
              <p className="font-display text-base text-ink dark:text-parchment">{result.deckName}</p>
              <p className="text-sm text-ink/55 dark:text-parchment/55 font-body">{result.deckDescription}</p>
              <a
                href={result.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gold/70 hover:text-gold font-body truncate transition-colors"
              >
                {result.articleUrl}
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-display text-xs text-ink/40 dark:text-parchment/40 tracking-widest uppercase">
              {result.cards.length} card{result.cards.length !== 1 ? 's' : ''} extracted
            </p>
          </div>

          <ul className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
            {result.cards.map((card, i) => (
              <li key={card._key} className="flex items-start gap-3 py-1.5 border-b border-gold/10 last:border-0">
                <span className="font-body text-xs text-ink/30 dark:text-parchment/30 tabular-nums w-5 shrink-0 pt-px">{i + 1}</span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-body text-sm text-ink/80 dark:text-parchment/80 truncate">{card.label}</span>
                  {card.desc && (
                    <span className="font-body text-xs text-ink/45 dark:text-parchment/45 line-clamp-1">{card.desc}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {result.warnings.length > 0 && (
            <div className="flex flex-col gap-1">
              {result.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-600 dark:text-amber-400 font-body">{w}</p>
              ))}
            </div>
          )}

          <button
            onClick={handleEdit}
            className="w-full py-3 rounded-card bg-gold text-ink font-display tracking-widest text-sm hover:bg-gold/90 transition-colors"
          >
            Review & save in deck creator →
          </button>
        </section>
      )}
    </div>
  )
}
