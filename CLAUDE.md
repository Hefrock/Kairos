# CLAUDE.md — Kairos

This file is the source of truth for AI collaborators and developers joining the project. Read it before touching anything.

---

## What This Project Is

Kairos is a spaced repetition flashcard app today. The long-term goal is an **MCP Contextual Engineering System** — a tool that manages a personal knowledge base of context units (cards) and surfaces the right ones at the right time, both for human study and for injection into AI model context windows.

The flashcard app is not a prototype to be discarded. It is the foundation. Every schema decision should be evaluated against whether it works for both a human learner and an MCP retrieval system.

---

## Architecture in One Paragraph

React 18 + TypeScript SPA. No backend. All state lives in IndexedDB (via the `idb` wrapper). The app ships as two build targets: a standard PWA and a single inlined `static/index.html` for Streamlit Cloud. Routing uses HashRouter, not BrowserRouter, because the Streamlit build is served from a static file. The SM-2 algorithm lives in `src/lib/srs/sm2.ts` as pure functions — no side effects, no React.

---

## Non-Obvious Decisions

### Two Vite configs
`vite.config.ts` — standard PWA build → `dist/`
`vite.config.streamlit.ts` — uses `vite-plugin-singlefile` to inline all JS/CSS into one `static/index.html`

Streamlit's `st.components.v1.html()` can only serve a single HTML string. The bundle must be self-contained. Run `npm run build:streamlit` after any UI change and commit the updated `static/index.html`.

### `static/index.html` is committed
This is intentional. Streamlit Community Cloud deploys from the `main` branch and serves this file directly. It is not a build artifact to be gitignored — it is the deployment artifact.

### HashRouter
`BrowserRouter` requires a server that handles all routes with the same HTML. The Streamlit wrapper cannot do this. `HashRouter` works with any static file server. Do not change this.

### IndexedDB in-memory fallback
`src/lib/db/index.ts` falls back to plain `Map` objects when IndexedDB is unavailable. This happens in Streamlit's sandboxed iframe (null-origin context). The app loads and runs normally but progress is not persisted between refreshes. This is a known, accepted limitation.

### `DraftCard._key`
`DraftCard` in `src/types/index.ts` has a `_key: number` field. This is a React-only stable key for list rendering. It is never saved to IndexedDB or converted to a `CardDefinition`. The real card `id` is generated from the label at save time via `slugId()`.

### Built-in deck protection
`BUILT_IN_IDS` in `src/hooks/useDecks.ts` prevents deletion of the ASL and Nautical Flags decks. User-created decks (`category: 'custom'`) can be deleted. If you add a new built-in deck, add its ID to that set.

### Settings merge-over-defaults
`getSettings()` in `src/lib/db/index.ts` merges stored values over `DEFAULT_SETTINGS`. This means new settings fields with defaults work automatically for existing users without a DB migration. When adding a new setting, always add it to `DEFAULT_SETTINGS`.

### `digestSources` in IndexedDB
The `digestSources` store is wired in the DB schema but has no consumer yet. It is intentional scaffolding for Phase 2 (RAG). Do not remove it, but do not build against it until the RAG phase begins.

---

## The Card Schema (read carefully)

```typescript
interface CardDefinition {
  id: string        // slug, e.g. "asl-a"
  label: string     // card front — short identifier
  desc: string      // card back — 1–2 sentence human summary
  img: string       // image URL, Wikimedia path, or base64 data URI
  tags?: string[]   // categorical labels

  // MCP context fields — absent on hand-crafted cards
  content?: string     // full retrievable text for model context injection
  cloze?: string       // fill-in-the-blank: "The {{c1::mitochondria}} is the {{c2::powerhouse}}"
  sourceRef?: string   // provenance URL
  generatedAt?: number // Unix ms — auto-generated cards only
  // embedding?: number[] — reserved for semantic retrieval (Phase 2)
}
```

**The `desc` / `content` split is intentional and important.** `desc` is what a human reads on the card back. `content` is what an MCP server would expose as the resource body. Wikipedia import populates both. Hand-crafted cards only have `desc`. Do not collapse these fields.

---

## Data Flow

```
User action
  → React component
    → hook (useDecks / useStudySession / useSettings)
      → lib/db (IndexedDB or in-memory fallback)
        → lib/srs/sm2 (pure SM-2 functions, no storage)
```

Hooks own async state. Pages own UI state. `lib/` has no React dependencies. Keep this separation.

---

## Known Tech Debt

| Item | File | Impact |
|---|---|---|
| Streak is broken | `useProgress.ts:57` | Shows 0 or 1 only — needs a session log store |
| Double IndexedDB fetch | `useDeckStats.ts` + `useProgress.ts` | Both call `getAllProgress()` independently — optimize when adding session log |
| `updateCardOverride` is dead code | `useStudySession.ts:85` | No UI calls it — remove or build card editor UI |
| `package.json` version is `0.1.0` | `package.json` | Should be bumped to match app version |
| Cloze cards not rendered | `Flashcard.tsx` | `cloze` field is stored but study UI ignores it |

---

## What Not To Do

- **Do not add a backend.** The app is intentionally client-only. If you need server-side capability (AI API calls, sync), design it as an optional user-configured endpoint, not a required service.
- **Do not use `BrowserRouter`.** See above.
- **Do not gitignore `static/index.html`.** It is the production artifact.
- **Do not break the `desc`/`content` split.** `desc` ≤ 2 sentences. `content` can be a full paragraph or section.
- **Do not add fields to `CardDefinition` without considering the MCP retrieval model.** Every field should have a clear role in either human study or model context injection.
- **Do not collapse `useDecks` and `useStudySession` into a single hook.** They have distinct lifecycles and responsibilities.

---

## Build Commands

```bash
npm run dev              # dev server with HMR
npm run build            # PWA build → dist/
npm run build:streamlit  # Streamlit single-file build → static/index.html
npm run type-check       # tsc --noEmit (no emit, just check)
npm run lint             # ESLint
```

Always run `npm run type-check` before opening a PR. Always run `npm run build:streamlit` and commit `static/index.html` when UI changes are ready.

---

## Adding a Built-in Deck

1. Create `src/data/decks/your-deck.json` — must conform to `DeckPack` schema (`schema: "1.0"`)
2. Import it in `src/hooks/useDecks.ts` alongside the existing built-in imports
3. Add it to `BUILT_IN_DECKS` and its ID to `BUILT_IN_IDS`

---

## Adding a New Page

1. Create `src/pages/YourPage.tsx`
2. Add a route in `src/App.tsx`
3. If it needs a nav link, add it to `NAV_ITEMS` in `src/components/layout/Layout.tsx`
4. If it needs a new hook, create `src/hooks/useYourThing.ts` — keep lib functions in `src/lib/`

---

## Phase 2 Preparation (MCP)

The schema is designed to not require refactoring when MCP lands. When building the MCP layer:

- Each `CardDefinition` becomes an MCP resource at `kairos://deck/{deckId}/card/{cardId}`
- `content` is the resource body (what the model reads)
- `desc` is the resource description (what the human reads in tool call results)
- `sourceRef` is the citation URI
- `embedding` (reserved) will enable semantic ranking
- `CardProgress.due` is the SRS priority signal — due cards are high-priority context candidates
- The `digestSources` store is the ingestion pipeline entry point

The study app and the MCP server share the same IndexedDB. They are not separate systems.
