// ─────────────────────────────────────────────
// Kairos — Core Types
// ─────────────────────────────────────────────

// ── Cards ─────────────────────────────────────

/** A single flashcard definition (static content) */
export interface CardDefinition {
  id: string            // e.g. "asl-a", "flag-alpha"
  label: string         // e.g. "A", "Alpha (A)"
  desc: string          // short summary shown on card back (1–2 sentences)
  img: string           // canonical image URL (Wikimedia or bundled)
  tags?: string[]       // e.g. ["alphabet", "handshape"]

  // ── MCP context fields — optional, safe to omit in hand-crafted decks ──
  /** Full retrievable text for this card — the payload exposed to a model's context window.
   *  `desc` is the human-readable summary; `content` is the complete source text.
   *  Absent on hand-crafted cards. Required for RAG / MCP resource exposure. */
  content?: string
  /** Fill-in-the-blank notation: "The {{c1::mitochondria}} is the powerhouse of the {{c2::cell}}"
   *  Supports multiple gaps (c1, c2, …). Same syntax as Anki cloze deletion. */
  cloze?: string
  /** Source URL, DOI, or citation for auto-generated or imported cards */
  sourceRef?: string
  /** Unix ms timestamp when this card was auto-generated (absent on hand-crafted cards) */
  generatedAt?: number
  // embedding?: number[]  — reserved: semantic vector for future MCP retrieval ranking
}

/** SRS progress record stored in IndexedDB */
export interface CardProgress {
  id: string
  rep: number           // number of successful reviews
  ef: number            // ease factor (SM-2), starts at 2.5
  interval: number      // days until next review
  due: number           // Unix ms timestamp
  lastGrade?: Grade     // last SM-2 grade given
  overrideImg?: string  // user-supplied image URL override
  overrideDesc?: string // user-supplied description override
}

/** Merged card used at runtime */
export type Card = CardDefinition & Partial<CardProgress>

/** SM-2 grade: 0=Again 1=Hard 2=Good 3=Easy */
export type Grade = 0 | 1 | 2 | 3

// ── Decks ─────────────────────────────────────

export type DeckCategory =
  | 'language'    // ASL, Greek, Japanese
  | 'maritime'    // nautical flags, knots
  | 'custom'      // user-created
  | 'digest'      // future: RAG-generated cards from podcasts/RSS

export interface DeckMeta {
  id: string              // e.g. "asl-alphabet"
  name: string            // display name
  description: string
  category: DeckCategory
  tag: string             // shown on card chip
  version: string         // semver for JSON deck packs
  source?: string         // attribution URL
  cards: CardDefinition[]
}

/** Serialized deck pack (JSON file format) */
export interface DeckPack {
  schema: '1.0'           // bump when format changes
  deck: DeckMeta
  exportedAt?: string     // ISO date
  progressSnapshot?: CardProgress[]  // optional — for full backup files
}

// ── Draft (in-app deck creator) ───────────────

/** Mutable card being assembled in the deck creator UI.
 *  `_key` is a stable React key only — not persisted. */
export interface DraftCard {
  _key: number
  label: string
  desc: string
  img: string
  content?: string
  cloze?: string
  sourceRef?: string
}

// ── Study Session ──────────────────────────────

export type StudyMode = 'image-to-label' | 'label-to-image'

export interface SessionStats {
  deckId: string
  startedAt: number
  cardsStudied: number
  correct: number         // grades ≥ 2
  again: number           // grade 0
}

// ── App Settings ──────────────────────────────

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  defaultStudyMode: StudyMode
  dailyGoal: number       // target cards per day
  timerVisible: boolean
  shuffle: boolean        // randomize card order within a session
}

// ── Future: RAG / Digest (Phase 2 stubs) ──────

export type DigestSourceType = 'rss' | 'podcast' | 'url' | 'pdf'

export interface DigestSource {
  id: string
  type: DigestSourceType
  url: string
  label: string
  lastFetched?: number
  enabled: boolean
}

/**
 * A digest-generated card stub — Phase 2.
 * Extends CardDefinition so it can be used in standard study sessions.
 * `generatedAt` and `sourceRef` are inherited from CardDefinition (now required here).
 */
export interface DigestCard extends CardDefinition {
  sourceId: string        // which DigestSource produced this
  generatedAt: number     // required for digest cards (overrides the optional base field)
  excerpt?: string        // raw source text that generated the card
}
