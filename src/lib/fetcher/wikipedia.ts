import type { DraftCard } from '@/types'

// ── Internal types ─────────────────────────────

interface WikiSummary {
  title: string
  displaytitle: string
  description?: string
  extract: string
  thumbnail?: { source: string; width: number; height: number }
  type: 'standard' | 'disambiguation' | 'no-extract'
  content_urls?: { desktop?: { page?: string } }
}

interface WikiSection {
  title: string
  anchor: string
  content: string  // HTML
}

interface WikiSectionsResponse {
  sections: WikiSection[]
}

// ── Skip list for noise sections ──────────────

const SKIP_HEADINGS = new Set([
  'references', 'external links', 'see also', 'notes', 'bibliography',
  'further reading', 'footnotes', 'citations', 'sources',
])

// ── URL parsing ────────────────────────────────

export function parseWikipediaTitle(url: string): { title: string; lang: string } | null {
  try {
    const u = new URL(url)
    if (!u.hostname.endsWith('wikipedia.org')) return null
    const lang = u.hostname.split('.')[0] ?? 'en'

    // /wiki/Title form
    const wikiMatch = u.pathname.match(/^\/wiki\/(.+)$/)
    if (wikiMatch) return { title: decodeURIComponent(wikiMatch[1]).replace(/_/g, ' '), lang }

    // ?title=Title form
    const titleParam = u.searchParams.get('title')
    if (titleParam) return { title: titleParam.replace(/_/g, ' '), lang }

    return null
  } catch {
    return null
  }
}

// ── API calls ──────────────────────────────────

export async function fetchWikipediaSummary(title: string, lang = 'en'): Promise<WikiSummary> {
  const encoded = encodeURIComponent(title.replace(/ /g, '_'))
  const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encoded}`)
  if (!res.ok) throw new Error(`Wikipedia summary fetch failed: ${res.status}`)
  return res.json() as Promise<WikiSummary>
}

async function fetchWikipediaSections(title: string, lang = 'en'): Promise<WikiSection[]> {
  const encoded = encodeURIComponent(title.replace(/ /g, '_'))
  const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/sections/${encoded}`)
  if (!res.ok) throw new Error(`Wikipedia sections fetch failed: ${res.status}`)
  const data = await res.json() as WikiSectionsResponse
  return data.sections ?? []
}

function extractText(html: string): { firstSentence: string; fullText: string } {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  // Remove citation superscripts and edit links
  doc.querySelectorAll('sup, .mw-editsection').forEach(el => el.remove())
  const fullText = (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
  const sentenceEnd = fullText.search(/(?<=[.!?])\s+[A-Z]/)
  const firstSentence = sentenceEnd > 0 ? fullText.slice(0, sentenceEnd + 1).trim() : fullText.slice(0, 300).trim()
  return { firstSentence, fullText }
}

// ── Main export ────────────────────────────────

export interface WikiImportResult {
  cards: DraftCard[]
  deckName: string
  deckDescription: string
  coverImage: string
  articleUrl: string
  warnings: string[]
}

export async function importFromWikipedia(url: string): Promise<WikiImportResult> {
  const parsed = parseWikipediaTitle(url)
  if (!parsed) throw new Error('Could not parse a Wikipedia article title from that URL.')
  if (parsed.lang !== 'en') throw new Error('Only English Wikipedia (en.wikipedia.org) is supported right now.')

  const [summary, sections] = await Promise.all([
    fetchWikipediaSummary(parsed.title, parsed.lang),
    fetchWikipediaSections(parsed.title, parsed.lang),
  ])

  if (summary.type === 'disambiguation') {
    throw new Error(`"${summary.title}" is a disambiguation page. Please link to a specific article.`)
  }

  const articleUrl = summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(summary.title.replace(/ /g, '_'))}`
  const warnings: string[] = []
  const cards: DraftCard[] = []

  // Lead card from summary
  if (summary.extract) {
    const { firstSentence, fullText } = extractText(summary.extract)
    cards.push({
      _key: Date.now() + Math.random(),
      label: summary.title,
      desc: firstSentence,
      img: summary.thumbnail?.source ?? '',
      content: fullText,
      sourceRef: articleUrl,
    })
  }

  // Section cards
  let skipped = 0
  for (const section of sections) {
    if (!section.title || SKIP_HEADINGS.has(section.title.toLowerCase())) continue
    if (cards.length >= 31) { skipped++; continue }  // cap at 30 + lead

    const { firstSentence, fullText } = extractText(section.content)
    if (!firstSentence) continue

    const sectionUrl = `${articleUrl}#${section.anchor}`
    cards.push({
      _key: Date.now() + Math.random(),
      label: section.title,
      desc: firstSentence,
      img: '',
      content: fullText,
      sourceRef: sectionUrl,
    })
  }

  if (skipped > 0) warnings.push(`${skipped} section${skipped > 1 ? 's' : ''} omitted (article exceeds 30-card limit).`)

  return {
    cards,
    deckName: summary.title,
    deckDescription: summary.description ?? `Wikipedia: ${summary.title}`,
    coverImage: summary.thumbnail?.source ?? '',
    articleUrl,
    warnings,
  }
}
