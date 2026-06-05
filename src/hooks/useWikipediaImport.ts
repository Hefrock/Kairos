import { useState, useCallback } from 'react'
import { importFromWikipedia, type WikiImportResult } from '@/lib/fetcher/wikipedia'

type Status = 'idle' | 'fetching' | 'success' | 'error'

export function useWikipediaImport() {
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<WikiImportResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const importFromUrl = useCallback(async (url: string) => {
    setStatus('fetching')
    setResult(null)
    setErrorMessage(null)
    try {
      const data = await importFromWikipedia(url)
      setResult(data)
      setStatus('success')
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Import failed.')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setErrorMessage(null)
  }, [])

  return { importFromUrl, status, result, errorMessage, reset }
}
