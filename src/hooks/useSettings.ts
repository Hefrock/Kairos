import { useState, useEffect, useCallback } from 'react'
import type { AppSettings } from '@/types'
import { getSettings, putSettings } from '@/lib/db'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSettings().then(s => { setSettings(s); setLoading(false) })
  }, [])

  const update = useCallback(async (patch: Partial<AppSettings>) => {
    setSettings(prev => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      putSettings(next)
      return next
    })
  }, [])

  return { settings, loading, update }
}
