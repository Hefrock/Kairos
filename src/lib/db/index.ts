// ─────────────────────────────────────────────
// Kairos — IndexedDB Storage Layer
// ─────────────────────────────────────────────
// Uses the `idb` wrapper for a clean Promise API.
// Schema is versioned — add new stores in upgrade().

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { CardProgress, AppSettings, DeckMeta } from '@/types'

const DB_NAME = 'kairos'
const DB_VERSION = 1

// ── Schema ────────────────────────────────────

interface KairosDB extends DBSchema {
  /** SRS progress keyed by card id */
  progress: {
    key: string
    value: CardProgress
    indexes: { 'by-due': number }
  }
  /** Installed deck metadata (not the cards themselves — those live in JSON) */
  decks: {
    key: string
    value: DeckMeta & { installedAt: number }
  }
  /** User app settings (single record, key = 'settings') */
  settings: {
    key: string
    value: AppSettings
  }
  /**
   * Phase 2: digest sources and generated cards.
   * Store is created now so the DB version doesn't need to bump later.
   */
  digestSources: {
    key: string
    value: {
      id: string
      type: string
      url: string
      label: string
      lastFetched?: number
      enabled: boolean
    }
  }
}

// ── Singleton ─────────────────────────────────

let _db: IDBPDatabase<KairosDB> | null = null

export async function getDB(): Promise<IDBPDatabase<KairosDB>> {
  if (_db) return _db
  _db = await openDB<KairosDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // progress store
      if (!db.objectStoreNames.contains('progress')) {
        const progressStore = db.createObjectStore('progress', { keyPath: 'id' })
        progressStore.createIndex('by-due', 'due')
      }
      // decks store
      if (!db.objectStoreNames.contains('decks')) {
        db.createObjectStore('decks', { keyPath: 'id' })
      }
      // settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings')
      }
      // digest sources (Phase 2 stub)
      if (!db.objectStoreNames.contains('digestSources')) {
        db.createObjectStore('digestSources', { keyPath: 'id' })
      }
    },
  })
  return _db
}

// ── Progress CRUD ─────────────────────────────

export async function getProgress(id: string): Promise<CardProgress | undefined> {
  const db = await getDB()
  return db.get('progress', id)
}

export async function putProgress(record: CardProgress): Promise<void> {
  const db = await getDB()
  await db.put('progress', record)
}

export async function getAllProgress(): Promise<CardProgress[]> {
  const db = await getDB()
  return db.getAll('progress')
}

/** Returns all cards due at or before `before` (defaults to now) */
export async function getDueProgress(before = Date.now()): Promise<CardProgress[]> {
  const db = await getDB()
  const range = IDBKeyRange.upperBound(before)
  return db.getAllFromIndex('progress', 'by-due', range)
}

// ── Settings ──────────────────────────────────

const SETTINGS_KEY = 'settings'

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  defaultStudyMode: 'image-to-label',
  dailyGoal: 20,
  timerVisible: true,
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB()
  return (await db.get('settings', SETTINGS_KEY)) ?? DEFAULT_SETTINGS
}

export async function putSettings(settings: AppSettings): Promise<void> {
  const db = await getDB()
  await db.put('settings', settings, SETTINGS_KEY)
}

// ── Export / Import ───────────────────────────

/** Export all progress records as a JSON-serialisable array */
export async function exportProgress(): Promise<CardProgress[]> {
  return getAllProgress()
}

/** Import progress records (merge strategy: overwrite by id) */
export async function importProgress(records: CardProgress[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('progress', 'readwrite')
  await Promise.all(records.map(r => tx.store.put(r)))
  await tx.done
}
