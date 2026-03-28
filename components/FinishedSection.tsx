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
      <>
        {/* Mobile skeleton */}
        <div className="md:hidden flex flex-col gap-px">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-surface animate-pulse" />)}
        </div>
        {/* Desktop skeleton */}
        <div className="hidden md:grid grid-cols-4 lg:grid-cols-6 gap-4 p-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-surface animate-pulse" />
          ))}
        </div>
      </>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-32 text-center gap-3">
        <CheckCheck size={52} className="opacity-20 text-ink" />
        <p className="text-ink-muted text-sm">Nothing finished yet.</p>
        <p className="text-ink-faint text-xs">Your completed list will show up here.</p>
      </div>
    )
  }

  const finished = items.filter(i => i.status === 'finished')
  const dnf      = items.filter(i => i.status === 'dnf')

  return (
    <div>
      {finished.length > 0 && (
        <Section label="Finished" count={finished.length} items={finished} onEdit={onEdit} />
      )}
      {dnf.length > 0 && (
        <Section label="Did Not Finish" count={dnf.length} items={dnf} onEdit={onEdit} isDNF />
      )}
    </div>
  )
}

function Section({ label, count, items, onEdit, isDNF = false }: {
  label: string; count: number; items: Item[]; onEdit: (i: Item) => void; isDNF?: boolean
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 px-4 md:px-6 py-3 sticky top-[73px] bg-bg/90 backdrop-blur z-10">
        <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">{label}</span>
        <span className="text-ink-faint text-xs">({count})</span>
      </div>

      {/* Mobile: list rows */}
      <div className="md:hidden flex flex-col">
        {items.map(item => <MobileRow key={item.id} item={item} onEdit={onEdit} isDNF={isDNF} />)}
      </div>

      {/* Desktop: card grid */}
      <div className="hidden md:grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 px-6">
        {items.map(item => <DesktopCard key={item.id} item={item} onEdit={onEdit} isDNF={isDNF} />)}
      </div>
    </section>
  )
}

function DesktopCard({ item, onEdit, isDNF }: { item: Item; onEdit: (i: Item) => void; isDNF: boolean }) {
  return (
    <button
      onClick={() => onEdit(item)}
      className="flex flex-col gap-2 text-left group focus:outline-none"
    >
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-surface shadow-md group-hover:ring-1 group-hover:ring-accent/30 group-active:scale-95 transition-all">
        <CoverImage item={item} fill />
        {isDNF && (
          <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center">
            <span className="text-[10px] font-bold text-red-300 bg-black/50 px-1.5 py-0.5 rounded rotate-[-15deg]">DNF</span>
          </div>
        )}
        {item.dateEnded && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4">
            <span className="text-[9px] text-white/70">{formatDate(item.dateEnded)}</span>
          </div>
        )}
      </div>

      <div className="px-0.5">
        <p className={`text-xs leading-tight line-clamp-2 ${isDNF ? 'text-ink-muted' : 'text-ink'}`}>
          {item.title}
        </p>
        {item.creator && <p className="text-[10px] text-ink-faint truncate mt-0.5">{item.creator}</p>}
        {item.rating && <div className="mt-1"><StarRating value={item.rating} readonly size="sm" /></div>}
      </div>
    </button>
  )
}

function MobileRow({ item, onEdit, isDNF }: { item: Item; onEdit: (i: Item) => void; isDNF: boolean }) {
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
            <span className="text-[10px] text-ink-faint shrink-0 mt-0.5">{formatDate(item.dateEnded)}</span>
          )}
        </div>
        {item.creator && <p className="text-xs text-ink-muted truncate">{item.creator}</p>}
        <div className="flex items-center gap-2 mt-0.5">
          {item.rating
            ? <StarRating value={item.rating} readonly size="sm" />
            : isDNF
              ? <span className="text-[10px] text-red-400/60 font-medium">DNF</span>
              : null}
          {item.thoughts && (
            <p className="text-[11px] text-ink-muted italic line-clamp-1 flex-1">&ldquo;{item.thoughts}&rdquo;</p>
          )}
        </div>
      </div>
    </button>
  )
}
