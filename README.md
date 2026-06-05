# Kairos

> *καιρός — the right, critical, or opportune moment*

A spaced repetition flashcard app built for deep, versatile learning. Phase 1 delivers a full study UI with SM-2 SRS, built-in visual decks, in-app deck creation, and progress tracking. Phase 2 will add RAG-powered knowledge digests — podcast summaries and RSS feeds converted into study cards.

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
| Shuffle mode (Fisher-Yates, persistent setting) | ✅ Complete |
| In-app deck creator with Wikimedia image search | ✅ Complete |
| Deck persistence (IndexedDB, survives refresh) | ✅ Complete |
| PWA (installable, offline) | ✅ Complete |
| Streamlit cloud deployment | ✅ Complete |
| Additional built-in decks (Greek, Japanese, Knots) | Roadmap |
| Full streak history (session log) | Roadmap |
| Phase 2 — RAG knowledge digest | Roadmap |

---

## Features

- **SM-2 Spaced Repetition** — cards surface at the optimal review interval. Again / Hard / Good / Easy grades with live next-review timing hints.
- **Card flip animation** — 3D CSS flip, Cinzel/gold/parchment visual design.
- **Dual study modes** — Image → Label, or Label → Image.
- **Shuffle** — Fisher-Yates randomization per session, toggleable in the study header and Settings. On by default.
- **Dark mode** — defaults to dark, persists across sessions, toggleable sun/moon button in the header.
- **In-app deck creator** — build decks without leaving the app. Add cards with labels, descriptions, and images sourced by URL, local file upload, or Wikimedia search.
- **Deck import** — drop any `.json` file into Settings → Import Deck to add a deck instantly.
- **Browse page** — deck grid with per-deck due / new / learned pill counts. New Deck button opens the creator.
- **Progress page** — overall learned-% ring, today's review count, streak, per-deck progress bars.
- **Settings page** — default study mode, daily goal, shuffle toggle, deck JSON import, progress export/import, data reset.
- **IndexedDB storage** — all SRS progress, user-created decks, and settings persist locally in the browser.
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

## Adding Decks

There are three ways to add decks:

### 1. In-app creator (no JSON required)
Go to **Browse → New Deck**. Fill in the deck name and add cards one by one. For each card, set a label, description, and image — paste a URL, upload a local image file, or search Wikimedia Commons directly from the form.

### 2. JSON import
Drop a `.json` file into **Settings → Import Deck**. The deck is validated and immediately available for study.

### 3. JSON format reference
Decks conform to the `DeckPack` schema (`src/types/index.ts`):

```json
{
  "schema": "1.0",
  "deck": {
    "id": "my-deck",
    "name": "My Deck",
    "description": "...",
    "category": "custom",
    "tag": "Custom · Tag",
    "version": "1.0.0",
    "cards": [
      {
        "id": "my-deck-001",
        "label": "Card Label",
        "desc": "Explanation shown on card back.",
        "img": "https://example.com/image.png"
      }
    ]
  }
}
```

`img` is optional — cards without an image display their label only.

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
│   │   ├── deck/          # ImagePicker (URL / upload / Wikimedia search)
│   │   ├── study/         # Flashcard, GradeButtons, SessionComplete,
│   │   │                  #   ProgressBar, DeckSwitcher
│   │   └── layout/        # Layout, Nav
│   ├── contexts/          # ThemeContext (dark mode)
│   ├── pages/             # StudyPage, BrowsePage, ProgressPage,
│   │                      #   SettingsPage, CreateDeckPage
│   ├── hooks/             # useDecks, useStudySession, useDeckStats,
│   │                      #   useProgress, useSettings
│   ├── lib/
│   │   ├── srs/           # SM-2 algorithm + Fisher-Yates shuffle
│   │   ├── db/            # IndexedDB layer (progress, decks, settings)
│   │   └── fetcher/       # Wikimedia Commons API helper
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

## Roadmap

### Phase 1.x
- [ ] Additional built-in decks: Greek alphabet, Japanese hiragana/katakana, nautical knots
- [ ] Full streak history (requires session log store in IndexedDB)
- [ ] Per-card image/description override in study session

### Phase 2 — Knowledge Digest (RAG)
- [ ] RSS feed ingestion → auto-generated study cards
- [ ] Podcast transcript → cards (Whisper / API)
- [ ] URL scrape → card generation
- [ ] Optional cloud sync

---

## License

All rights reserved.
