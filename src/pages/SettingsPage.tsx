import { useRef, useState } from 'react'
import { useDecks } from '@/hooks/useDecks'
import { useSettings } from '@/hooks/useSettings'
import { exportProgress, importProgress } from '@/lib/db'
import type { StudyMode, DeckPack } from '@/types'

export default function SettingsPage() {
  const { settings, loading, update } = useSettings()
  const { importDeckFromFile } = useDecks()
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (loading || !settings) return (
    <div className="flex items-center justify-center py-24">
      <p className="font-display text-gold/50 tracking-widest animate-pulse">Loading…</p>
    </div>
  )

  async function handleDeckFile(file: File) {
    setImportMsg(null)
    const result = await importDeckFromFile(file)
    setImportMsg(result.ok
      ? { ok: true, text: 'Deck imported successfully.' }
      : { ok: false, text: result.error ?? 'Import failed.' })
  }

  async function handleExport() {
    const records = await exportProgress()
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kairos-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImportProgress(file: File) {
    try {
      const text = await file.text()
      const records = JSON.parse(text)
      if (!Array.isArray(records)) throw new Error('Expected an array of progress records.')
      await importProgress(records)
      setImportMsg({ ok: true, text: `Imported ${records.length} progress records.` })
    } catch (e) {
      setImportMsg({ ok: false, text: e instanceof Error ? e.message : 'Import failed.' })
    }
  }

  async function handleClearData() {
    const records = await exportProgress()
    await importProgress(records.map(r => ({ ...r, rep: 0, ef: 2.5, interval: 0, due: Date.now() })))
    setClearConfirm(false)
    setImportMsg({ ok: true, text: 'All progress reset.' })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-xl text-ink dark:text-parchment tracking-wide">Settings</h1>

      {/* ── Study preferences ── */}
      <Section title="Study">
        <Row label="Default mode">
          <SegmentedControl
            options={[
              { value: 'image-to-label', label: 'Image → Label' },
              { value: 'label-to-image', label: 'Label → Image' },
            ]}
            value={settings.defaultStudyMode}
            onChange={v => update({ defaultStudyMode: v as StudyMode })}
          />
        </Row>
        <Row label="Daily goal">
          <div className="flex items-center gap-2">
            <input
              type="range" min={5} max={100} step={5}
              value={settings.dailyGoal}
              onChange={e => update({ dailyGoal: parseInt(e.target.value) })}
              className="w-32 accent-gold"
            />
            <span className="font-display text-sm text-gold w-10 tabular-nums">{settings.dailyGoal}</span>
          </div>
        </Row>
      </Section>

      {/* ── Deck import ── */}
      <Section title="Import Deck">
        <div
          className={`border-2 border-dashed rounded-card p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
            dragging
              ? 'border-gold bg-gold/5'
              : 'border-ink/15 dark:border-parchment/15 hover:border-gold/50'
          }`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) handleDeckFile(file)
          }}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
          aria-label="Import deck JSON file"
        >
          <svg className="w-8 h-8 text-ink/20 dark:text-parchment/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M12 16V4m0 0L8 8m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 20h16" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-ink/40 dark:text-parchment/40 font-body text-center">
            Drop a deck <code className="text-xs bg-ink/5 dark:bg-parchment/10 px-1 py-0.5 rounded">.json</code> file here, or click to browse
          </p>
        </div>
        <input
          ref={fileRef} type="file" accept=".json" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleDeckFile(f); e.target.value = '' }}
        />
        {importMsg && (
          <p className={`text-sm font-body px-1 ${importMsg.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {importMsg.text}
          </p>
        )}
      </Section>

      {/* ── Data management ── */}
      <Section title="Data">
        <Row label="Export progress">
          <button
            onClick={handleExport}
            className="px-4 py-1.5 border border-gold/30 text-gold/70 font-display text-xs rounded-lg hover:border-gold/60 hover:text-gold transition-colors tracking-wide"
          >
            Download JSON
          </button>
        </Row>
        <Row label="Import progress">
          <label className="px-4 py-1.5 border border-ink/15 dark:border-parchment/15 text-ink/50 dark:text-parchment/50 font-display text-xs rounded-lg hover:border-gold/40 hover:text-ink/70 dark:hover:text-parchment/70 transition-colors tracking-wide cursor-pointer">
            Choose file
            <input type="file" accept=".json" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImportProgress(f); if (e.target) e.target.value = '' }}
            />
          </label>
        </Row>
        <Row label="Reset all progress">
          {clearConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 dark:text-red-400 font-body">Are you sure?</span>
              <button onClick={handleClearData} className="px-3 py-1 bg-red-500 text-white font-body text-xs rounded-lg hover:bg-red-600">
                Reset
              </button>
              <button onClick={() => setClearConfirm(false)} className="px-3 py-1 border border-ink/15 dark:border-parchment/15 text-ink/50 dark:text-parchment/50 font-body text-xs rounded-lg">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setClearConfirm(true)}
              className="px-4 py-1.5 border border-red-200 dark:border-red-800 text-red-400 font-display text-xs rounded-lg hover:border-red-400 hover:text-red-600 transition-colors tracking-wide"
            >
              Reset
            </button>
          )}
        </Row>
      </Section>

      {/* ── About ── */}
      <Section title="About">
        <p className="text-sm text-ink/40 dark:text-parchment/40 font-body">
          Kairos v0.1 · Spaced repetition powered by SM-2 · Data stored locally in your browser.
        </p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-gold/20 bg-parchment dark:bg-ink-mid p-5 shadow-sm flex flex-col gap-4">
      <p className="font-display text-xs text-ink/40 dark:text-parchment/40 tracking-widest uppercase">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-ink/60 dark:text-parchment/60 font-body">{label}</span>
      {children}
    </div>
  )
}

function SegmentedControl({ options, value, onChange }: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex rounded-lg border border-ink/15 dark:border-parchment/15 overflow-hidden">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-body transition-colors ${
            value === opt.value
              ? 'bg-ink dark:bg-parchment text-gold dark:text-ink'
              : 'text-ink/50 dark:text-parchment/50 hover:text-ink/80 dark:hover:text-parchment/80 hover:bg-ink/5 dark:hover:bg-parchment/5'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// Type guard used internally for DeckPack validation in importDeckFromFile
export type { DeckPack }
