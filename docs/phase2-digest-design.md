# Kairos — Phase 2: Knowledge Digest (RAG)

> Design notes for the podcast/RSS/RAG layer. Written during Phase 1 to capture intent while architecture is fresh.

---

## Concept

Phase 2 transforms Kairos from a manual flashcard tool into a **passive knowledge ingestion system**. Content from podcasts, RSS feeds, and URLs is automatically digested and converted into study cards that surface through the same SM-2 system.

The learning loop:
1. **Consume** — listen to a podcast or subscribe to an RSS feed
2. **Digest** — Kairos extracts key concepts and generates cards automatically
3. **Reinforce** — those cards enter the standard SRS queue alongside manual cards

---

## Digest Sources

| Type | Input | Processing |
|---|---|---|
| RSS Feed | Feed URL | Fetch articles → chunk → LLM card generation |
| Podcast | RSS/audio URL | Whisper transcription → chunk → LLM card generation |
| URL | Web page URL | Scrape text → chunk → LLM card generation |
| PDF | File upload | Extract text → chunk → LLM card generation |

---

## Data Model (already stubbed in `src/types/index.ts`)

```ts
interface DigestSource {
  id: string
  type: 'rss' | 'podcast' | 'url' | 'pdf'
  url: string
  label: string
  lastFetched?: number
  enabled: boolean
}

interface DigestCard extends CardDefinition {
  sourceId: string
  generatedAt: number
  excerpt?: string   // source text that generated this card
}
```

---

## Backend Options (TBD)

**Option A — Fully local (privacy-first)**
- Use a local LLM (Ollama) for card generation
- Audio transcription via Whisper running locally
- No data leaves the device

**Option B — Hybrid (recommended for v0.1 of Phase 2)**
- Lightweight Node/Python server in `/server`
- OpenAI/Anthropic API for card generation
- User supplies their own API key (stored locally)
- Audio: Whisper API or AssemblyAI

**Option C — Hosted**
- Full cloud backend with user accounts
- Enables sync across devices
- Requires auth, storage service, queue for transcription jobs

---

## Card Generation Prompt Strategy

Each chunk of source text is passed to an LLM with a prompt like:

```
Given this text, generate 1-3 flashcards in JSON format.
Each card should test a single, atomic concept.
Format: [{ "label": "...", "desc": "..." }]

Text:
{chunk}
```

Cards are then attached to the deck with category: 'digest' and displayed in study with a source attribution badge.

---

## Routes to Add (Phase 2)

```
/digest              — source management dashboard
/digest/new          — add RSS/podcast/URL source
/digest/:sourceId    — view generated cards from a source
```

Already stubbed as a comment in `src/App.tsx`.

---

## Open Questions

- Should digest cards be interleaved with manual cards in a single queue, or kept in separate decks?
- How to handle card deduplication (same concept from two sources)?
- Podcast player UI — integrated or external link?
- RSS update frequency — manual refresh or background polling?
