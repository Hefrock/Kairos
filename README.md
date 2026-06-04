# Kairos

> *καιρός — the right, critical, or opportune moment*

A spaced repetition flashcard app built for deep, versatile learning. Phase 1 focuses on visual recognition (ASL, nautical flags, languages). Phase 2 will add RAG-powered knowledge digests — podcast summaries and RSS feeds converted into study cards.

---

## Features (Phase 1 — Flashcards)

- **SM-2 Spaced Repetition** — Anki-style algorithm. Cards surface at the optimal moment.
- **Dual study modes** — Image → Name, or Name → Image
- **Soft session timer** — tracks time without pressure
- **Built-in decks** — ASL Alphabet, Nautical ICS Flags
- **Expandable deck format** — drop a `kairos-*.json` file to add any subject
- **Card editor** — override image URL or description per card for QA
- **IndexedDB storage** — all data stays local in the browser
- **Export / Import** — JSON backup of any deck + progress
- **PWA** — installable on mobile, works offline

---

## Roadmap

### Phase 1 — Flashcards ✅
- [x] SM-2 SRS algorithm
- [x] ASL Alphabet deck
- [x] Nautical Flags deck
- [ ] Greek alphabet deck
- [ ] Japanese hiragana / katakana decks
- [ ] Nautical knots deck
- [ ] Wikimedia auto-image fetch for new decks
- [ ] Deck import via file drop
- [ ] Progress dashboard + streak tracking
- [ ] PWA offline support

### Phase 2 — Knowledge Digest (RAG)
- [ ] RSS feed ingestion → auto-generated cards
- [ ] Podcast transcript → study cards (via Whisper or API)
- [ ] URL scrape → card generation
- [ ] Optional cloud sync (backend TBD)
- [ ] Podcast player + highlights

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite | Component model scales to Phase 2 RAG UI |
| Language | TypeScript | Type safety across both phases |
| Styling | Tailwind CSS | Mobile-first, fast iteration |
| Storage | IndexedDB (`idb`) | Handles thousands of cards, no server needed |
| Routing | React Router v6 | Clean page structure, future-proof |
| PWA | `vite-plugin-pwa` | Mobile installable, offline-first |

---

## Getting Started

```bash
# Clone
git clone https://github.com/<your-username>/kairos.git
cd kairos

# Install
npm install

# Dev server
npm run dev

# Build
npm run build
```

---

## Deck Format

Decks are plain JSON files conforming to the `DeckPack` schema (`src/types/index.ts`).

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
        "desc": "What this card teaches.",
        "img": "https://example.com/image.png"
      }
    ]
  }
}
```

Drop any `kairos-*.json` file into the Settings page to install a new deck.

---

## Project Structure

```
kairos/
├── src/
│   ├── components/
│   │   ├── flashcard/     # Flashcard, GradeButtons, CardEditor
│   │   ├── deck/          # DeckSwitcher, MiniCard, BrowseGrid
│   │   └── layout/        # Layout, Nav, Header
│   ├── pages/             # StudyPage, BrowsePage, ProgressPage, SettingsPage
│   ├── hooks/             # useDecks, useStudySession, useTimer, useSettings
│   ├── lib/
│   │   ├── srs/           # SM-2 algorithm (sm2.ts)
│   │   ├── db/            # IndexedDB layer (idb)
│   │   └── fetcher/       # Wikimedia API, URL fetcher
│   ├── data/
│   │   └── decks/         # Built-in JSON deck packs
│   └── types/             # Shared TypeScript types
├── public/                # PWA icons, favicon
├── docs/                  # Architecture notes, Phase 2 design
└── scripts/               # Deck generation / scraping utilities (future)
```

---

## Contributing

This is a personal learning tool in active development. Issues and PRs welcome once the project stabilises past v0.1.

---

## License

To be determined. All rights reserved for now.
