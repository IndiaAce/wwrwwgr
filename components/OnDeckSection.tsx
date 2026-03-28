'use client'

import { Item } from '@/types'
import CoverImage from './CoverImage'

interface OnDeckSectionProps {
  items: Item[]
  loading: boolean
  onEdit: (item: Item) => void
}

const TYPE_LABELS = { book: 'Book', film: 'Film', tv: 'Series' }
const TYPE_ICONS = { book: '📚', film: '🎬', tv: '📺' }

export default function OnDeckSection({ items, loading, onEdit }: OnDeckSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3 p-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="aspect-[2/3] rounded-xl bg-surface animate-pulse" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-24 text-center gap-3">
        <span className="text-5xl opacity-30">◎</span>
        <p className="text-ink-muted text-sm">Your queue is empty.</p>
        <p className="text-ink-faint text-xs">Add something to look forward to.</p>
      </div>
    )
  }

  // Group by type
  const books = items.filter(i => i.type === 'book')
  const films = items.filter(i => i.type === 'film')
  const tv = items.filter(i => i.type === 'tv')

  const groups = [
    { label: 'Books', icon: '📚', items: books },
    { label: 'Films', icon: '🎬', items: films },
    { label: 'Series', icon: '📺', items: tv },
  ].filter(g => g.items.length > 0)

  return (
    <div className="pb-4">
      {groups.map(group => (
        <section key={group.label} className="mb-6">
          <div className="flex items-center gap-2 px-4 py-3">
            <span>{group.icon}</span>
            <h2 className="font-serif text-lg text-ink">{group.label}</h2>
            <span className="text-ink-faint text-sm ml-1">({group.items.length})</span>
          </div>
          <div className="grid grid-cols-3 gap-3 px-4">
            {group.items.map(item => (
              <DeckCard key={item.id} item={item} onEdit={onEdit} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function DeckCard({ item, onEdit }: { item: Item; onEdit: (item: Item) => void }) {
  return (
    <button
      onClick={() => onEdit(item)}
      className="flex flex-col gap-1.5 text-left group focus:outline-none"
    >
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-surface shadow-lg group-active:scale-95 transition-transform">
        <CoverImage item={item} fill />
        {/* Type badge */}
        <div className="absolute top-1.5 left-1.5">
          <span className="text-xs bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            {TYPE_ICONS[item.type]}
          </span>
        </div>
      </div>
      <p className="text-xs text-ink leading-tight line-clamp-2 px-0.5">
        {item.title}
      </p>
      {item.creator && (
        <p className="text-[10px] text-ink-muted truncate px-0.5 -mt-1">
          {item.creator}
        </p>
      )}
    </button>
  )
}
