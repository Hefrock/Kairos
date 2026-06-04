// ─────────────────────────────────────────────
// Kairos — Image Fetcher
// ─────────────────────────────────────────────
// Resolves card images from:
//   1. Wikimedia Commons API (primary)
//   2. Curated URL override per card (manual QA)
//   3. Bundled fallback placeholder

const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php'
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'

export interface ImageResult {
  url: string
  source: 'wikimedia' | 'override' | 'fallback'
  attribution?: string
}

/**
 * Fetch a thumbnail URL from Wikimedia Commons by file name.
 * e.g. fetchWikimediaThumb('Sign_language_A.svg', 300)
 */
export async function fetchWikimediaThumb(
  fileName: string,
  width = 300
): Promise<ImageResult | null> {
  const params = new URLSearchParams({
    action: 'query',
    titles: `File:${fileName}`,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: String(width),
    format: 'json',
    origin: '*',
  })

  try {
    const res = await fetch(`${WIKIMEDIA_API}?${params}`)
    const data = await res.json()
    const pages = data?.query?.pages ?? {}
    const page = Object.values(pages)[0] as Record<string, unknown>
    const info = (page?.imageinfo as { thumburl?: string; extmetadata?: { Artist?: { value?: string } } }[])?.[0]

    if (!info?.thumburl) return null

    const artist = info?.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '') ?? undefined

    return {
      url: info.thumburl,
      source: 'wikimedia',
      attribution: artist,
    }
  } catch {
    return null
  }
}

/**
 * Search Wikimedia Commons for images matching a query.
 * Useful for building new decks without knowing exact file names.
 */
export async function searchWikimediaImages(
  query: string,
  limit = 5
): Promise<ImageResult[]> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: `${query} filetype:bitmap|drawing`,
    srnamespace: '6', // File namespace
    srlimit: String(limit),
    format: 'json',
    origin: '*',
  })

  try {
    const res = await fetch(`${WIKIMEDIA_API}?${params}`)
    const data = await res.json()
    const hits = (data?.query?.search ?? []) as { title: string }[]

    const results = await Promise.all(
      hits.map(h => fetchWikimediaThumb(h.title.replace('File:', ''), 300))
    )
    return results.filter((r): r is ImageResult => r !== null)
  } catch {
    return []
  }
}

/**
 * Wikipedia page image — useful for concept cards (e.g. Greek letters).
 */
export async function fetchWikipediaPageImage(
  pageName: string
): Promise<ImageResult | null> {
  const params = new URLSearchParams({
    action: 'query',
    titles: pageName,
    prop: 'pageimages',
    pithumbsize: '300',
    format: 'json',
    origin: '*',
  })

  try {
    const res = await fetch(`${WIKIPEDIA_API}?${params}`)
    const data = await res.json()
    const pages = data?.query?.pages ?? {}
    const page = Object.values(pages)[0] as { thumbnail?: { source?: string } }
    const thumbUrl = page?.thumbnail?.source

    if (!thumbUrl) return null
    return { url: thumbUrl, source: 'wikimedia' }
  } catch {
    return null
  }
}

/** Resolve the best available image for a card */
export async function resolveCardImage(
  overrideUrl: string | undefined,
  wikimediaFile: string | undefined,
  fallbackUrl: string
): Promise<ImageResult> {
  // 1. User override always wins
  if (overrideUrl) return { url: overrideUrl, source: 'override' }

  // 2. Try Wikimedia
  if (wikimediaFile) {
    const result = await fetchWikimediaThumb(wikimediaFile, 300)
    if (result) return result
  }

  // 3. Fallback (bundled or static URL in deck definition)
  return { url: fallbackUrl, source: 'fallback' }
}
