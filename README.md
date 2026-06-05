# Kairos

> *καιρός — the right, critical, or opportune moment*

A spaced repetition flashcard app built for deep, versatile learning. Phase 1 delivers a full study UI with SM-2 SRS, built-in visual decks, custom deck creation, and progress tracking. Phase 2 will add RAG-powered knowledge digests — podcast summaries and RSS feeds converted into study cards.

Deployable as a **PWA** (installable, offline-first) or as a **Streamlit app** for cloud hosting.

---

## Status — v0.3

| Area | Status |
|---|---|
| SM-2 SRS algorithm | ✅ Complete |
| Study UI (flip, grade, progress) | ✅ Complete |
| Browse decks with SRS status | ✅ Complete |
| Progress dashboard | ✅ Complete |
| Settings (study prefs, import/export) | ✅ Complete |
| Deck import (drag-and-drop JSON) | ✅ Complete |
| Built-in decks — ASL Alphabet, Nautical Flags | ✅ Complete |
| Dark mode (default, persistent, toggle) | ✅ Complete |
| ASL images — Wikimedia hand illustrations | ✅ Complete |
| PWA (installable, offline) | ✅ Complete |
| Streamlit cloud deployment | ✅ Complete |
| Custom deck creator (in-app UI) | ✅ Complete |
| Card shuffle / randomization | ✅ Complete |
| Deck persistence (IndexedDB) | ✅ Complete |
| Wikimedia image search in deck creator | ✅ Complete |
| RAG-ready card schema (cloze, sourceRef) | ✅ Complete |
| Greek / Japanese / Knots decks | Roadmap |
| Cloze card rendering in study UI | Roadmap |
| Anki .apkg import / export | Roadmap |
| Full streak history (session log) | Roadmap |
| Phase 2 — RAG knowledge digest | Roadmap |

---

## Features

- **SM-2 Spaced Repetition** — cards surface at the optimal review interval. Again / Hard / Good / Easy grades with live next-review timing hints.
- **Card flip animation** — 3D CSS flip, Cinzel/gold/parchment visual design.
- **Dual study modes** — Image → Label, or Label → Image.
- **Card shuffle** — randomize card order within a session; toggle on the study page or in Settings.
- **Dark mode** — defaults to dark, persists across sessions, toggleable in the header.
- **Browse page** — deck grid with per-deck due / new / learned pill counts. Create and delete custom decks.
- **Deck creator** — build a new deck in the app: add cards, search Wikimedia for images, reorder, save.
- **Progress page** — overall learned-% ring, today's review count, streak, per-deck progress bars.
- **Settings page** — default study mode, daily goal slider, shuffle toggle, deck JSON import (drag-and-drop), progress export/import, data reset.
- **IndexedDB storage** — all SRS progress, settings, and custom decks stay local in the browser.
- **PWA** — installable on mobile and desktop, works offline.
- **Streamlit wrapper** — single-file React bundle served via `st.components.v1.html()` for Streamlit Community Cloud.

---

## Getting Started

```bash
git clone https://github.com/hefrock/kairos.git
cd kairos
npm install

# Development server
npm run dev

# Production PWA build  →  dist/
npm run build

# Streamlit single-file build  →  static/index.html
npm run build:streamlit
```

### Run with Streamlit locally

```bash
pip install streamlit
streamlit run streamlit_app.py
```

---

## Streamlit Community Cloud Deployment

1. Push the repo to GitHub (ensure `static/index.html` is committed).
2. Go to [share.streamlit.io](https://share.streamlit.io) → **New app**.
3. Select repo `hefrock/kairos`, branch `main`, main file `streamlit_app.py`.
4. Click **Deploy** — no Node.js build step needed on the server.

> **Keeping the bundle in sync:** after any UI changes run `npm run build:streamlit` and commit the updated `static/index.html`.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS — Cinzel / DM Sans, gold / ink / parchment palette |
| Storage | IndexedDB via `idb` |
| Routing | React Router v6 — HashRouter for static host compatibility |
| PWA | `vite-plugin-pwa` |
| Streamlit build | `vite-plugin-singlefile` |
| Cloud host | Streamlit Community Cloud |

---

## Project Structure

```
kairos/
├── src/
│   ├── components/
│   │   ├── study/         # Flashcard, GradeButtons, SessionComplete,
│   │   │                  #   ProgressBar, DeckSwitcher
│   │   ├── deck/          # ImagePicker (Wikimedia search + URL/upload)
│   │   └── layout/        # Layout, Nav
│   ├── contexts/          # ThemeContext (dark mode)
│   ├── pages/             # StudyPage, BrowsePage, ProgressPage,
│   │                      #   SettingsPage, CreateDeckPage
│   ├── hooks/             # useDecks, useStudySession, useDeckStats,
│   │                      #   useProgress, useSettings
│   ├── lib/
│   │   ├── srs/           # SM-2 algorithm + Fisher-Yates shuffle
│   │   ├── db/            # IndexedDB layer (cards, decks, settings)
│   │   └── fetcher/       # Wikimedia API helper
│   ├── data/decks/        # asl-alphabet.json, nautical-flags.json
│   └── types/             # Shared TypeScript interfaces
├── scripts/               # Build utilities
│   ├── embed-asl-images.mjs    # Download + embed ASL images as data URIs
│   ├── generate-deck-images.mjs
│   └── download-deck-images.mjs
├── static/                # Pre-built single-file bundle (committed)
│   └── index.html
├── streamlit_app.py       # Streamlit cloud wrapper
├── requirements.txt       # streamlit>=1.32.0
├── vite.config.ts         # PWA build
└── vite.config.streamlit.ts  # Single-file Streamlit build
```

---

## Deck Format

Decks are plain JSON conforming to the `DeckPack` schema (`src/types/index.ts`). Drop any `.json` file into **Settings → Import Deck**, or use the in-app **Browse → New Deck** creator.

### Field Reference

| Field | Required | Description |
|---|---|---|
| `id` | ✅ | Unique slug, e.g. `"greek-alphabet-001"` |
| `label` | ✅ | Short text shown on the front of the card |
| `desc` | ✅ | Explanation shown on the card back (can be empty string) |
| `img` | ✅ | Image URL, Wikimedia filename, or base64 data URI (can be empty string) |
| `tags` | optional | Array of category strings, e.g. `["alphabet", "vowel"]` |
| `cloze` | optional | Fill-in-the-blank sentence — see **Cloze Cards** below |
| `sourceRef` | optional | URL or citation for auto-generated cards (RAG use) |
| `generatedAt` | optional | Unix ms timestamp for auto-generated cards (RAG use) |

### Minimal example

```json
{
  "schema": "1.0",
  "deck": {
    "id": "greek-alphabet",
    "name": "Greek Alphabet",
    "description": "24 Greek letters with names and pronunciations.",
    "category": "language",
    "tag": "Language · Greek",
    "version": "1.0.0",
    "cards": [
      {
        "id": "greek-alpha",
        "label": "Α α",
        "desc": "Alpha — sounds like 'a' in 'father'.",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/.../Alpha.svg/120px-Alpha.svg.png"
      }
    ]
  }
}
```

### Full example with all optional fields

```json
{
  "schema": "1.0",
  "exportedAt": "2026-06-05T00:00:00.000Z",
  "deck": {
    "id": "biology-101",
    "name": "Biology 101",
    "description": "Cell biology fundamentals, auto-generated from lecture notes.",
    "category": "custom",
    "tag": "Custom · Biology",
    "version": "1.0.0",
    "cards": [
      {
        "id": "biology-101-mitochondria-0",
        "label": "Mitochondria",
        "desc": "Membrane-bound organelle that generates most of the cell's ATP through oxidative phosphorylation.",
        "img": "",
        "tags": ["organelle", "energy"],
        "cloze": "The {{c1::mitochondria}} is known as the powerhouse of the {{c2::cell}}.",
        "sourceRef": "https://en.wikipedia.org/wiki/Mitochondrion",
        "generatedAt": 1749081600000
      }
    ]
  }
}
```

---

## Cloze Cards

**Cloze deletion** is a fill-in-the-blank learning technique. Instead of a fixed question and answer, a sentence is presented with one or more key terms blanked out — the learner must recall the missing word.

**Notation:** `{{c1::term}}` where `c1` is the gap number and `term` is the hidden answer.

```
"The {{c1::mitochondria}} is the powerhouse of the {{c2::cell}}."
```

When studying this card:
- **Gap 1 shown first:** "The ___ is the powerhouse of the cell." → answer: *mitochondria*
- **Gap 2 shown next:** "The mitochondria is the powerhouse of the ___." → answer: *cell*

**Why cloze cards matter for RAG:** When generating cards automatically from text (a podcast, an article, a PDF), a single extracted sentence can become a testable card without manually deciding what the "question" and "answer" are. The AI identifies key terms and blanks them out. This is the same technique used in Anki and other serious SRS systems.

> **Current status:** The `cloze` field is stored in the schema and preserved through import/export, but the study UI currently renders these as standard label/description cards. Full cloze rendering is on the roadmap for Phase 2.

---

## Adding Decks

### Option 1 — In-app creator
Go to **Browse → New Deck**. Add cards one by one, search Wikimedia for images, and save. The deck persists in your browser's IndexedDB.

### Option 2 — JSON import
Create a `.json` file matching the format above and drop it into **Settings → Import Deck**.

### Option 3 — Anki .apkg (planned)
Anki's `.apkg` format (SQLite database inside a ZIP file) is an open standard with a large ecosystem of shared decks. Import/export support is on the roadmap — `.apkg` files will be converted to the Kairos JSON format internally, with cloze cards mapped automatically.

---

## Roadmap

### Phase 1.x
- [ ] Additional decks: Greek alphabet, Japanese hiragana/katakana, nautical knots
- [ ] Cloze card rendering in study UI
- [ ] Anki .apkg import / export
- [ ] Full streak history (requires session log store in IndexedDB)
- [ ] Card editor UI (override image / description per card)

### Phase 2 — Knowledge Digest (RAG)
- [ ] RSS feed ingestion → auto-generated study cards
- [ ] Podcast transcript → cards (Whisper / API)
- [ ] URL scrape → card generation with cloze extraction
- [ ] Optional cloud sync

---

## License

All rights reserved.
