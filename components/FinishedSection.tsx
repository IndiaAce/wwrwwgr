'use client'

import { CheckCheck } from 'lucide-react'
import { Item } from '@/types'
import CoverImage from './CoverImage'
import StarRating from './StarRating'

interface FinishedSectionProps {
  items: Item[]
  loading: boolean
  onEdit: (item: Item) => void
}

function formatDate(d?: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function FinishedSection({ items, loading, onEdit }: FinishedSectionProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-px">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-surface animate-pulse" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-24 text-center gap-3">
        <CheckCheck size={48} className="opacity-20 text-ink" />
        <p className="text-ink-muted text-sm">Nothing finished yet.</p>
        <p className="text-ink-faint text-xs">Your completed list will show up here.</p>
      </div>
    )
  }

  const finished = items.filter(i => i.status === 'finished')
  const dnf = items.filter(i => i.status === 'dnf')

  return (
    <div>
      {finished.length > 0 && (
        <section>
          <div className="flex items-center gap-2 px-4 py-3 sticky top-[72px] bg-bg/90 backdrop-blur z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">Finished</span>
            <span className="text-ink-faint text-xs">({finished.length})</span>
          </div>
          <div className="flex flex-col">
            {finished.map(item => <FinishedRow key={item.id} item={item} onEdit={onEdit} />)}
          </div>
        </section>
      )}

      {dnf.length > 0 && (
        <section className="mt-4">
          <div className="flex items-center gap-2 px-4 py-3 sticky top-[72px] bg-bg/90 backdrop-blur z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">Did Not Finish</span>
            <span className="text-ink-faint text-xs">({dnf.length})</span>
          </div>
          <div className="flex flex-col">
            {dnf.map(item => <FinishedRow key={item.id} item={item} onEdit={onEdit} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function FinishedRow({ item, onEdit }: { item: Item; onEdit: (item: Item) => void }) {
  const isDNF = item.status === 'dnf'

  return (
    <button
      onClick={() => onEdit(item)}
      className="flex gap-3 px-4 py-3 border-b border-border/50 hover:bg-surface/40 active:bg-surface/60 transition-colors text-left focus:outline-none"
    >
      <div className="relative shrink-0 rounded-md overflow-hidden shadow-md" style={{ width: 44, height: 66 }}>
        <CoverImage item={item} fill />
        {isDNF && (
          <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
            <span className="text-[8px] font-bold text-red-300 rotate-[-20deg]">DNF</span>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center flex-1 min-w-0 gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-serif text-base leading-tight line-clamp-1 ${isDNF ? 'text-ink-muted' : 'text-ink'}`}>
            {item.title}
          </p>
          {item.dateEnded && (
            <span className="text-[10px] text-ink-faint shrink-0 mt-0.5">
              {formatDate(item.dateEnded)}
            </span>
          )}
        </div>

        {item.creator && (
          <p className="text-xs text-ink-muted truncate">{item.creator}</p>
        )}

        <div className="flex items-center gap-2 mt-0.5">
          {item.rating ? (
            <StarRating value={item.rating} readonly size="sm" />
          ) : isDNF ? (
            <span className="text-[10px] text-red-400/60 font-medium">DNF</span>
          ) : null}

          {item.thoughts && (
            <p className="text-[11px] text-ink-muted italic line-clamp-1 flex-1">
              &ldquo;{item.thoughts}&rdquo;
            </p>
          )}
        </div>
      </div>
    </button>
  )
}
