// ─────────────────────────────────────────────
// Kairos — IndexedDB Storage Layer
// ─────────────────────────────────────────────
// Uses the `idb` wrapper for a clean Promise API.
// Schema is versioned — add new stores in upgrade().
//
// When IndexedDB is unavailable (e.g. sandboxed iframe / null-origin
// context such as Streamlit's st.components.v1.html), all operations
// fall back to in-memory Maps so the app loads and runs normally.
// Progress is not persisted between page refreshes in that context.

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { CardProgress, AppSettings, DeckMeta } from '@/types'

const DB_NAME = 'kairos'
const DB_VERSION = 1

// ── Schema ────────────────────────────────────

interface KairosDB extends DBSchema {
  progress: {
    key: string
    value: CardProgress
    indexes: { 'by-due': number }
  }
  decks: {
    key: string
    value: DeckMeta & { installedAt: number }
  }
  settings: {
    key: string
    value: AppSettings
  }
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

// ── In-memory fallback ────────────────────────
// Used when IndexedDB is blocked (sandboxed iframe, private browsing, etc.)

const mem = {
  progress: new Map<string, CardProgress>(),
  settings: null as AppSettings | null,
}

// ── Singleton ─────────────────────────────────

let _db: IDBPDatabase<KairosDB> | null = null
let _idbUnavailable = false

async function getDB(): Promise<IDBPDatabase<KairosDB> | null> {
  if (_idbUnavailable) return null
  if (_db) return _db
  try {
    _db = await openDB<KairosDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('progress')) {
          const s = db.createObjectStore('progress', { keyPath: 'id' })
          s.createIndex('by-due', 'due')
        }
        if (!db.objectStoreNames.contains('decks')) {
          db.createObjectStore('decks', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }
        if (!db.objectStoreNames.contains('digestSources')) {
          db.createObjectStore('digestSources', { keyPath: 'id' })
        }
      },
    })
    return _db
  } catch {
    _idbUnavailable = true
    return null
  }
}

// ── Progress CRUD ─────────────────────────────

export async function getProgress(id: string): Promise<CardProgress | undefined> {
  const db = await getDB()
  if (!db) return mem.progress.get(id)
  return db.get('progress', id)
}

export async function putProgress(record: CardProgress): Promise<void> {
  const db = await getDB()
  if (!db) { mem.progress.set(record.id, record); return }
  await db.put('progress', record)
}

export async function getAllProgress(): Promise<CardProgress[]> {
  const db = await getDB()
  if (!db) return [...mem.progress.values()]
  return db.getAll('progress')
}

/** Returns all cards due at or before `before` (defaults to now) */
export async function getDueProgress(before = Date.now()): Promise<CardProgress[]> {
  const db = await getDB()
  if (!db) return [...mem.progress.values()].filter(p => p.due <= before)
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
  if (!db) return mem.settings ?? DEFAULT_SETTINGS
  return (await db.get('settings', SETTINGS_KEY)) ?? DEFAULT_SETTINGS
}

export async function putSettings(settings: AppSettings): Promise<void> {
  const db = await getDB()
  if (!db) { mem.settings = settings; return }
  await db.put('settings', settings, SETTINGS_KEY)
}

// ── Export / Import ───────────────────────────

export async function exportProgress(): Promise<CardProgress[]> {
  return getAllProgress()
}

export async function importProgress(records: CardProgress[]): Promise<void> {
  const db = await getDB()
  if (!db) { records.forEach(r => mem.progress.set(r.id, r)); return }
  const tx = db.transaction('progress', 'readwrite')
  await Promise.all(records.map(r => tx.store.put(r)))
  await tx.done
}
