'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface ImportModalProps {
  onClose: () => void
  onImported: () => void
}

type Step = 'upload' | 'preview' | 'done'

interface PreviewData {
  csv: string
  rowCount: number
  headers: string[]
}

export default function ImportModal({ onClose, onImported }: ImportModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [replace, setReplace] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      const csv = e.target?.result as string
      const lines = csv.trim().split('\n').filter(l => l.trim())
      if (lines.length < 2) {
        setError('The file appears to be empty or has no data rows.')
        return
      }
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
      setPreview({ csv, rowCount: lines.length - 1, headers })
      setStep('preview')
      setError(null)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) handleFile(file)
  }

  async function handleImport() {
    if (!preview) return
    setIsImporting(true)
    setError(null)
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: preview.csv, replace }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Import failed')
        return
      }
      setResult(data)
      setStep('done')
      onImported()
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop bg-black/60"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="modal-content w-full max-w-lg bg-surface rounded-t-3xl overflow-y-auto"
        style={{ maxHeight: '80dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="font-serif text-xl text-ink">Import from Notion</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-ink-muted hover:text-ink transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pb-10">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="flex flex-col gap-5">
              <div className="bg-card rounded-xl p-4 text-sm text-ink-muted leading-relaxed">
                <p className="font-medium text-ink mb-2">How to export from Notion:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs">
                  <li>Open your reading list table in Notion</li>
                  <li>Click the <strong className="text-ink">•••</strong> menu (top right of the table)</li>
                  <li>Choose <strong className="text-ink">Export</strong> → <strong className="text-ink">Export as CSV</strong></li>
                  <li>Upload the downloaded file below</li>
                </ol>
              </div>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-accent/50 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors group"
              >
                <Upload size={32} className="text-ink-muted group-hover:text-accent transition-colors" />
                <p className="text-sm text-ink-muted text-center">
                  Drop your CSV here, or <span className="text-accent">browse</span>
                </p>
                <p className="text-xs text-ink-faint">Only .csv files from Notion</p>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />

              {error && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && preview && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 bg-card rounded-xl p-4">
                <FileText size={24} className="text-accent shrink-0" />
                <div>
                  <p className="text-sm text-ink font-medium">{preview.rowCount} rows detected</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Columns: {preview.headers.slice(0, 5).join(', ')}
                    {preview.headers.length > 5 && ` +${preview.headers.length - 5} more`}
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">Import options</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setReplace(!replace)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${replace ? 'bg-accent' : 'bg-border'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${replace ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-ink">Replace existing list</p>
                    <p className="text-xs text-ink-muted">
                      {replace ? 'Your current list will be cleared first' : 'New items will be added to your existing list'}
                    </p>
                  </div>
                </label>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setStep('upload'); setPreview(null) }}
                  className="flex-1 py-3 rounded-xl text-sm bg-card text-ink-muted"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-50 active:scale-[0.98] transition-transform"
                  style={{ background: 'linear-gradient(135deg, #e8774a, #c95a2a)' }}
                >
                  {isImporting ? 'Importing…' : `Import ${preview.rowCount} items`}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 'done' && result && (
            <div className="flex flex-col items-center gap-5 py-6 text-center">
              <CheckCircle size={52} className="text-status-finished" />
              <div>
                <p className="font-serif text-2xl text-ink">{result.imported} items imported</p>
                {result.skipped > 0 && (
                  <p className="text-sm text-ink-muted mt-1">{result.skipped} rows skipped (empty titles)</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #e8774a, #c95a2a)' }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
