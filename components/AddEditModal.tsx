'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Item, ItemType, ItemStatus, SearchResult } from '@/types'
import StarRating from './StarRating'

interface AddEditModalProps {
  item: Item | null
  onSave: (item: Item) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

const TYPE_OPTIONS: { id: ItemType; label: string; icon: string }[] = [
  { id: 'book', label: 'Book', icon: '📚' },
  { id: 'film', label: 'Film', icon: '🎬' },
  { id: 'tv', label: 'TV', icon: '📺' },
]

const STATUS_OPTIONS: { id: ItemStatus; label: string; types: ItemType[] }[] = [
  { id: 'tbr', label: 'To Read / Watch', types: ['book', 'film', 'tv'] },
  { id: 'reading', label: 'Reading', types: ['book'] },
  { id: 'watching', label: 'Watching', types: ['film', 'tv'] },
  { id: 'dnf', label: 'Did Not Finish', types: ['book', 'film', 'tv'] },
  { id: 'finished', label: 'Finished', types: ['book', 'film', 'tv'] },
]

const CREATOR_LABEL: Record<ItemType, string> = {
  book: 'Author',
  film: 'Director',
  tv: 'Creator / Showrunner',
}

const PLATFORM_LABEL = 'Platform (Netflix, Plex, etc.)'

function emptyForm(type: ItemType = 'book'): Omit<Item, 'id'> {
  return {
    type,
    title: '',
    creator: '',
    platform: '',
    status: 'tbr',
    dateStarted: '',
    dateEnded: '',
    rating: undefined,
    thoughts: '',
    coverUrl: '',
    year: undefined,
    tmdbId: undefined,
    openLibraryKey: undefined,
  }
}

export default function AddEditModal({ item, onSave, onDelete, onClose }: AddEditModalProps) {
  const isEdit = !!item
  const [form, setForm] = useState<Omit<Item, 'id'>>(item ?? emptyForm())
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Debounced search
  const runSearch = useCallback(
    async (q: string, type: ItemType) => {
      if (!q.trim() || q.length < 2) {
        setSearchResults([])
        return
      }
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`)
        if (res.ok) {
          setSearchResults(await res.json())
        }
      } finally {
        setIsSearching(false)
      }
    },
    []
  )

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      runSearch(searchQuery, form.type)
    }, 400)
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [searchQuery, form.type, runSearch])

  function applySearchResult(result: SearchResult) {
    setForm(f => ({
      ...f,
      title: result.title,
      creator: result.creator ?? f.creator,
      coverUrl: result.coverUrl ?? f.coverUrl,
      year: result.year ?? f.year,
      tmdbId: result.tmdbId,
      openLibraryKey: result.openLibraryKey,
    }))
    setSearchResults([])
    setSearchQuery('')
  }

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleTypeChange(type: ItemType) {
    setForm(f => ({
      ...f,
      type,
      status: type === 'book' ? 'tbr' : 'tbr',
    }))
    setSearchResults([])
    setSearchQuery('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setIsSaving(true)
    try {
      const clean = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== '' && v !== undefined)
      ) as Omit<Item, 'id'>
      await onSave({ ...clean, id: item?.id ?? '' })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!item) return
    setIsSaving(true)
    try {
      await onDelete(item.id)
    } finally {
      setIsSaving(false)
    }
  }

  const availableStatuses = STATUS_OPTIONS.filter(s => s.types.includes(form.type))

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop bg-black/60"
      onClick={handleBackdrop}
    >
      <div
        ref={modalRef}
        className="modal-content w-full max-w-lg bg-surface rounded-t-3xl overflow-y-auto"
        style={{ maxHeight: '92dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="font-serif text-xl text-ink">
            {isEdit ? 'Edit' : 'Add to List'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-10 flex flex-col gap-5">
          {/* Type selector */}
          <div className="flex gap-2">
            {TYPE_OPTIONS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTypeChange(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  form.type === t.id
                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                    : 'bg-card text-ink-muted hover:text-ink hover:bg-border/50'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">🔍</span>
              <input
                type="text"
                placeholder={`Search for a ${form.type === 'tv' ? 'TV show' : form.type}…`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-3 text-ink placeholder-ink-faint focus:outline-none focus:border-accent/60 transition-colors text-sm"
              />
              {isSearching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted text-xs animate-pulse">
                  …
                </span>
              )}
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
                {searchResults.map(result => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => applySearchResult(result)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-surface active:bg-border transition-colors text-left"
                  >
                    {result.coverUrl ? (
                      <Image
                        src={result.coverUrl}
                        alt={result.title}
                        width={32}
                        height={48}
                        className="rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-12 rounded bg-surface shrink-0 flex items-center justify-center text-lg">
                        {form.type === 'book' ? '📚' : form.type === 'film' ? '🎬' : '📺'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink truncate">{result.title}</p>
                      <p className="text-xs text-ink-muted truncate">
                        {result.creator && `${result.creator} · `}
                        {result.year}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-ink-faint uppercase tracking-wider">Details</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Cover preview + Title */}
          <div className="flex gap-3">
            {form.coverUrl ? (
              <div className="relative shrink-0 rounded-lg overflow-hidden shadow-lg" style={{ width: 64, height: 96 }}>
                <Image
                  src={form.coverUrl}
                  alt={form.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="flex-1 flex flex-col gap-2">
              <Field label="Title" required>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setField('title', e.target.value)}
                  placeholder="Title"
                  className={INPUT_CLASS}
                  required
                />
              </Field>
              <Field label={CREATOR_LABEL[form.type]}>
                <input
                  type="text"
                  value={form.creator ?? ''}
                  onChange={e => setField('creator', e.target.value)}
                  placeholder={CREATOR_LABEL[form.type]}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
          </div>

          {/* Cover URL (manual) */}
          {!form.coverUrl && (
            <Field label="Cover image URL (optional)">
              <input
                type="url"
                value={form.coverUrl ?? ''}
                onChange={e => setField('coverUrl', e.target.value)}
                placeholder="https://…"
                className={INPUT_CLASS}
              />
            </Field>
          )}

          {form.type !== 'book' && (
            <Field label={PLATFORM_LABEL}>
              <input
                type="text"
                value={form.platform ?? ''}
                onChange={e => setField('platform', e.target.value)}
                placeholder="Netflix, Plex, Apple TV…"
                className={INPUT_CLASS}
              />
            </Field>
          )}

          {/* Status */}
          <div>
            <label className="text-xs text-ink-muted uppercase tracking-wider block mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {availableStatuses.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setField('status', s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    form.status === s.id
                      ? 'bg-accent/20 text-accent border border-accent/40'
                      : 'bg-card text-ink-muted border border-transparent hover:border-border'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="flex gap-3">
            <Field label="Date Started" className="flex-1">
              <input
                type="date"
                value={form.dateStarted ?? ''}
                onChange={e => setField('dateStarted', e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            {(form.status === 'finished' || form.status === 'dnf') && (
              <Field label="Date Ended" className="flex-1">
                <input
                  type="date"
                  value={form.dateEnded ?? ''}
                  onChange={e => setField('dateEnded', e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="text-xs text-ink-muted uppercase tracking-wider block mb-2">
              Rating
              {form.rating === 6 && (
                <span className="ml-2 text-masterpiece text-[10px] font-bold">✦ Masterpiece</span>
              )}
            </label>
            <StarRating
              value={form.rating}
              onChange={v => setField('rating', v || undefined)}
              size="lg"
            />
          </div>

          {/* Thoughts */}
          <Field label="Thoughts">
            <textarea
              value={form.thoughts ?? ''}
              onChange={e => setField('thoughts', e.target.value)}
              placeholder="What did you think?"
              rows={3}
              className={`${INPUT_CLASS} resize-none`}
            />
          </Field>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={isSaving || !form.title.trim()}
              className="w-full py-3.5 rounded-xl font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #e8774a, #c95a2a)' }}
            >
              {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add to List'}
            </button>

            {isEdit && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3 rounded-xl text-sm text-red-400/70 hover:text-red-400 transition-colors"
              >
                Remove from list
              </button>
            )}

            {isEdit && showDeleteConfirm && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl text-sm bg-card text-ink-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl text-sm bg-red-500/20 text-red-400 border border-red-500/30"
                >
                  Yes, remove
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

const INPUT_CLASS =
  'w-full bg-card border border-border rounded-xl px-3 py-2.5 text-ink placeholder-ink-faint focus:outline-none focus:border-accent/60 transition-colors text-sm'

function Field({
  label,
  children,
  required,
  className,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <label className="text-xs text-ink-muted uppercase tracking-wider block mb-1.5">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
