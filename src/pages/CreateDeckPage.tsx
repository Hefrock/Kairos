import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDecks } from '@/hooks/useDecks'
import type { CardDefinition, DeckCategory, DeckMeta, DraftCard } from '@/types'
import ImagePicker from '@/components/deck/ImagePicker'

// Produces a slug-safe unique ID from a label
function slugId(prefix: string, label: string, index: number): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `card`
  return `${prefix}-${slug}-${index}`
}

const EMPTY_CARD = (): DraftCard => ({ _key: Date.now() + Math.random(), label: '', desc: '', img: '' })

interface PrefillState {
  prefill?: DraftCard[]
  meta?: { name?: string; description?: string }
}

export default function CreateDeckPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { saveDeck } = useDecks()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<DeckCategory>('custom')
  const [cards, setCards] = useState<DraftCard[]>([EMPTY_CARD()])
  const [expandedKey, setExpandedKey] = useState<number | null>(cards[0]._key)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const state = location.state as PrefillState | null
    if (!state?.prefill?.length) return
    const keyed = state.prefill.map(c => ({ ...c, _key: Date.now() + Math.random() }))
    setCards(keyed)
    setExpandedKey(null)
    if (state.meta?.name) setName(state.meta.name)
    if (state.meta?.description) setDescription(state.meta.description)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function updateCard(key: number, patch: Partial<DraftCard>) {
    setCards(prev => prev.map(c => c._key === key ? { ...c, ...patch } : c))
  }

  function addCard() {
    const c = EMPTY_CARD()
    setCards(prev => [...prev, c])
    setExpandedKey(c._key)
  }

  function removeCard(key: number) {
    setCards(prev => {
      const next = prev.filter(c => c._key !== key)
      return next.length ? next : [EMPTY_CARD()]
    })
  }

  function moveCard(key: number, dir: -1 | 1) {
    setCards(prev => {
      const i = prev.findIndex(c => c._key === key)
      if (i < 0) return prev
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const out = [...prev]
      ;[out[i], out[j]] = [out[j], out[i]]
      return out
    })
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Deck name is required.'
    const filledCards = cards.filter(c => c.label.trim())
    if (filledCards.length === 0) e.cards = 'Add at least one card with a label.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)

    const deckId = `custom-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
    const cardDefs: CardDefinition[] = cards
      .filter(c => c.label.trim())
      .map((c, i) => ({
        id: slugId(deckId, c.label, i),
        label: c.label.trim(),
        desc: c.desc.trim(),
        img: c.img || '',
        ...(c.content   ? { content:   c.content }   : {}),
        ...(c.cloze     ? { cloze:     c.cloze }     : {}),
        ...(c.sourceRef ? { sourceRef: c.sourceRef } : {}),
        generatedAt: c.sourceRef ? Date.now() : undefined,
      }))

    const deck: DeckMeta = {
      id: deckId,
      name: name.trim(),
      description: description.trim() || `Custom deck: ${name.trim()}`,
      category,
      tag: `Custom · ${name.trim()}`,
      version: '1.0.0',
      cards: cardDefs,
    }

    await saveDeck(deck)
    navigate(`/study/${deckId}`)
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl text-ink dark:text-parchment tracking-wide">New Deck</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-ink/50 dark:text-parchment/50 hover:text-ink/80 dark:hover:text-parchment/80 font-body transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* ── Deck metadata ── */}
      <section className="rounded-card border border-gold/20 bg-parchment dark:bg-ink-mid p-5 flex flex-col gap-4 shadow-sm">
        <p className="font-display text-xs text-ink/40 dark:text-parchment/40 tracking-widest uppercase">Deck Info</p>

        <Field label="Name" error={errors.name}>
          <input
            type="text"
            placeholder="My Greek Alphabet"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Description">
          <textarea
            placeholder="What this deck is for…"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="input resize-none"
          />
        </Field>

        <Field label="Category">
          <select
            value={category}
            onChange={e => setCategory(e.target.value as DeckCategory)}
            className="input"
          >
            <option value="custom">Custom</option>
            <option value="language">Language</option>
            <option value="maritime">Maritime</option>
          </select>
        </Field>
      </section>

      {/* ── Cards ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-display text-xs text-ink/40 dark:text-parchment/40 tracking-widest uppercase">
            Cards ({cards.filter(c => c.label.trim()).length})
          </p>
          {errors.cards && <p className="text-xs text-red-500">{errors.cards}</p>}
        </div>

        {cards.map((card, i) => (
          <CardEditor
            key={card._key}
            card={card}
            index={i}
            total={cards.length}
            expanded={expandedKey === card._key}
            onToggle={() => setExpandedKey(expandedKey === card._key ? null : card._key)}
            onChange={patch => updateCard(card._key, patch)}
            onRemove={() => removeCard(card._key)}
            onMove={dir => moveCard(card._key, dir)}
          />
        ))}

        <button
          type="button"
          onClick={addCard}
          className="rounded-card border border-dashed border-gold/30 hover:border-gold/60 py-4 flex items-center justify-center gap-2 text-ink/55 dark:text-parchment/55 hover:text-gold transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="font-display text-sm tracking-wide">Add card</span>
        </button>
      </section>

      {/* ── Save ── */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 rounded-card bg-gold text-ink font-display tracking-widest text-sm hover:bg-gold/90 transition-colors disabled:opacity-60 shadow"
      >
        {saving ? 'Saving…' : `Save & Study (${cards.filter(c => c.label.trim()).length} cards)`}
      </button>
    </div>
  )
}

interface CardEditorProps {
  card: DraftCard
  index: number
  total: number
  expanded: boolean
  onToggle: () => void
  onChange: (patch: Partial<DraftCard>) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}

function CardEditor({ card, index, total, expanded, onToggle, onChange, onRemove, onMove }: CardEditorProps) {
  const hasContent = card.label.trim()

  return (
    <div className={`rounded-card border transition-colors ${expanded ? 'border-gold/40 bg-parchment dark:bg-ink-mid shadow-md' : 'border-gold/15 bg-parchment/60 dark:bg-ink-mid/60'}`}>
      {/* ── Header row ── */}
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="font-body text-xs text-ink/30 dark:text-parchment/30 tabular-nums w-5 shrink-0">{index + 1}</span>
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 text-left font-body text-sm text-ink/80 dark:text-parchment/80 truncate"
        >
          {hasContent ? card.label : <span className="text-ink/30 dark:text-parchment/30 italic">Untitled card</span>}
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="p-1 text-ink/30 dark:text-parchment/30 hover:text-ink/60 dark:hover:text-parchment/60 disabled:opacity-20 transition-colors" title="Move up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5"><path d="M5 15l7-7 7 7"/></svg>
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className="p-1 text-ink/30 dark:text-parchment/30 hover:text-ink/60 dark:hover:text-parchment/60 disabled:opacity-20 transition-colors" title="Move down">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5"><path d="M19 9l-7 7-7-7"/></svg>
          </button>
          <button type="button" onClick={onRemove} className="p-1 text-ink/20 dark:text-parchment/20 hover:text-red-400 transition-colors ml-1" title="Remove card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <button type="button" onClick={onToggle} className="p-1 text-ink/30 dark:text-parchment/30 ml-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}><path d="M19 9l-7 7-7-7"/></svg>
          </button>
        </div>
      </div>

      {/* ── Expanded editor ── */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-4 border-t border-gold/10">
          <div className="pt-3">
            <Field label="Label (front of card)" required>
              <input
                type="text"
                placeholder="e.g. Alpha, A, 苦"
                value={card.label}
                onChange={e => onChange({ label: e.target.value })}
                className="input"
                autoFocus
              />
            </Field>
          </div>

          <Field label="Description (shown on card back)">
            <textarea
              placeholder="Explanation, pronunciation, context…"
              value={card.desc}
              onChange={e => onChange({ desc: e.target.value })}
              rows={2}
              className="input resize-none"
            />
          </Field>

          <div>
            <label className="block text-xs font-body text-ink/55 dark:text-parchment/55 mb-1.5">Image</label>
            <ImagePicker value={card.img} onChange={img => onChange({ img })} />
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children, error, required }: {
  label: string
  children: React.ReactNode
  error?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-body text-ink/55 dark:text-parchment/55">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
