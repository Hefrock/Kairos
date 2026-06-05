# Kairos

> *καιρός — the right, critical, or opportune moment*

A spaced repetition flashcard app built for deep, versatile learning. Phase 1 delivers a full study UI with SM-2 SRS, built-in visual decks, and progress tracking. Phase 2 will add RAG-powered knowledge digests — podcast summaries and RSS feeds converted into study cards.

Deployable as a **PWA** (installable, offline-first) or as a **Streamlit app** for cloud hosting.

---

## Status — v0.2

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
| Greek / Japanese / Knots decks | Roadmap |
| Full streak history (session log) | Roadmap |
| Phase 2 — RAG knowledge digest | Roadmap |

---

## Features

- **SM-2 Spaced Repetition** — cards surface at the optimal review interval. Again / Hard / Good / Easy grades with live next-review timing hints.
- **Card flip animation** — 3D CSS flip, Cinzel/gold/parchment visual design.
- **Dual study modes** — Image → Label, or Label → Image.
- **Dark mode** — defaults to dark, persists across sessions, toggleable sun/moon button in the header.
- **Browse page** — deck grid with per-deck due / new / learned pill counts.
- **Progress page** — overall learned-% ring, today's review count, streak, per-deck progress bars.
- **Settings page** — default study mode, daily goal slider, deck JSON import (drag-and-drop), progress export/import, data reset.
- **IndexedDB storage** — all SRS progress and settings stay local in the browser.
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
│   │   └── layout/        # Layout, Nav
│   ├── contexts/          # ThemeContext (dark mode)
│   ├── pages/             # StudyPage, BrowsePage, ProgressPage, SettingsPage
│   ├── hooks/             # useDecks, useStudySession, useDeckStats,
│   │                      #   useProgress, useSettings
│   ├── lib/
│   │   ├── srs/           # SM-2 algorithm
│   │   ├── db/            # IndexedDB layer
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

Decks are plain JSON conforming to the `DeckPack` schema (`src/types/index.ts`). Drop any `.json` file into **Settings → Import Deck**.

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

---

## Roadmap

### Phase 1.x
- [ ] Additional decks: Greek alphabet, Japanese hiragana/katakana, nautical knots
- [ ] Full streak history (requires session log store in IndexedDB)
- [ ] Card editor UI (override image / description per card)
- [ ] Wikimedia image search for custom decks

### Phase 2 — Knowledge Digest (RAG)
- [ ] RSS feed ingestion → auto-generated study cards
- [ ] Podcast transcript → cards (Whisper / API)
- [ ] URL scrape → card generation
- [ ] Optional cloud sync

---

## License

All rights reserved.
