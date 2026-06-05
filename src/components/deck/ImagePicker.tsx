import { useState, useRef } from 'react'
import { searchWikimediaImages } from '@/lib/fetcher/wikimedia'

interface ImagePickerProps {
  value: string
  onChange: (url: string) => void
}

export default function ImagePicker({ value, onChange }: ImagePickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [searching, setSearching] = useState(false)
  const [tab, setTab] = useState<'url' | 'search'>('url')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)
    setResults([])
    const hits = await searchWikimediaImages(query.trim())
    setResults(hits.map(h => h.url))
    setSearching(false)
  }

  function handleFileUpload(file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      const dataUri = e.target?.result as string
      if (dataUri) onChange(dataUri)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Tab row */}
      <div className="flex rounded-lg border border-ink/15 dark:border-parchment/15 overflow-hidden text-xs font-body">
        {(['url', 'search'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 transition-colors ${
              tab === t
                ? 'bg-ink dark:bg-parchment text-gold dark:text-ink font-medium'
                : 'text-ink/55 dark:text-parchment/55 hover:text-ink/80 dark:hover:text-parchment/80'
            }`}
          >
            {t === 'url' ? 'URL / Upload' : 'Search Wikimedia'}
          </button>
        ))}
      </div>

      {tab === 'url' ? (
        <div className="flex flex-col gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.png"
            value={value.startsWith('data:') ? '' : value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-parchment/15 bg-transparent text-sm text-ink dark:text-parchment placeholder:text-ink/30 dark:placeholder:text-parchment/30 focus:outline-none focus:border-gold/50"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs text-ink/55 dark:text-parchment/55 hover:text-gold transition-colors text-left"
          >
            — or upload a local image file
          </button>
          <input
            ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = '' }}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Greek letter Alpha"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-3 py-2 rounded-lg border border-ink/15 dark:border-parchment/15 bg-transparent text-sm text-ink dark:text-parchment placeholder:text-ink/30 dark:placeholder:text-parchment/30 focus:outline-none focus:border-gold/50"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="px-4 py-2 rounded-lg bg-gold/10 border border-gold/30 text-gold text-sm font-display tracking-wide hover:bg-gold/20 transition-colors disabled:opacity-40"
            >
              {searching ? '…' : 'Search'}
            </button>
          </div>

          {results.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-1">
              {results.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange(url)}
                  className={`rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                    value === url ? 'border-gold' : 'border-transparent hover:border-gold/40'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-contain bg-white" />
                </button>
              ))}
            </div>
          )}
          {searching && (
            <p className="text-xs text-ink/40 dark:text-parchment/40 font-body animate-pulse">Searching Wikimedia…</p>
          )}
          {!searching && results.length === 0 && query && (
            <p className="text-xs text-ink/40 dark:text-parchment/40 font-body">No results. Try different keywords.</p>
          )}
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-ink/5 dark:bg-parchment/5 border border-ink/10 dark:border-parchment/10">
          <img src={value} alt="Preview" className="w-14 h-14 object-contain rounded bg-white shrink-0" />
          <span className="text-xs text-ink/55 dark:text-parchment/55 font-body break-all line-clamp-2">
            {value.startsWith('data:') ? 'Local image (uploaded)' : value}
          </span>
        </div>
      )}
    </div>
  )
}
