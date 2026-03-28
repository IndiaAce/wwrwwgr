'use client'

import { BookOpen, Clapperboard, Tv, List } from 'lucide-react'
import { Item } from '@/types'
import CoverImage from './CoverImage'

interface OnDeckSectionProps {
  items: Item[]
  loading: boolean
  onEdit: (item: Item) => void
}

const TYPE_GROUPS = [
  { type: 'book' as const, label: 'Books',  Icon: BookOpen },
  { type: 'film' as const, label: 'Films',  Icon: Clapperboard },
  { type: 'tv'   as const, label: 'Series', Icon: Tv },
]

const TYPE_ICONS = { book: BookOpen, film: Clapperboard, tv: Tv }

export default function OnDeckSection({ items, loading, onEdit }: OnDeckSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] rounded-xl bg-surface animate-pulse" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-24 text-center gap-3">
        <List size={48} className="opacity-20 text-ink" />
        <p className="text-ink-muted text-sm">Your queue is empty.</p>
        <p className="text-ink-faint text-xs">Add something to look forward to.</p>
      </div>
    )
  }

  const groups = TYPE_GROUPS
    .map(g => ({ ...g, items: items.filter(i => i.type === g.type) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="pb-4">
      {groups.map(group => {
        const { Icon } = group
        return (
          <section key={group.label} className="mb-6">
            <div className="flex items-center gap-2 px-4 py-3">
              <Icon size={16} className="text-ink-muted" />
              <h2 className="font-serif text-lg text-ink">{group.label}</h2>
              <span className="text-ink-faint text-sm ml-1">({group.items.length})</span>
            </div>
            <div className="grid grid-cols-3 gap-3 px-4">
              {group.items.map(item => (
                <DeckCard key={item.id} item={item} onEdit={onEdit} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function DeckCard({ item, onEdit }: { item: Item; onEdit: (item: Item) => void }) {
  const Icon = TYPE_ICONS[item.type]
  return (
    <button
      onClick={() => onEdit(item)}
      className="flex flex-col gap-1.5 text-left group focus:outline-none"
    >
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-surface shadow-lg group-active:scale-95 transition-transform">
        <CoverImage item={item} fill />
        <div className="absolute top-1.5 left-1.5">
          <span className="flex items-center justify-center w-6 h-6 bg-black/60 backdrop-blur-sm rounded-md">
            <Icon size={12} className="text-white/80" />
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

