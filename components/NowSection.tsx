'use client'

import { Play } from 'lucide-react'
import { Item } from '@/types'
import CoverImage from './CoverImage'
import StarRating from './StarRating'

interface NowSectionProps {
  items: Item[]
  loading: boolean
  onEdit: (item: Item) => void
}

function daysSince(dateStr?: string): string {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (diff === 0) return 'started today'
  if (diff === 1) return '1 day in'
  return `${diff} days in`
}

const STATUS_LABEL: Record<string, string> = { reading: 'Reading', watching: 'Watching' }

export default function NowSection({ items, loading, onEdit }: NowSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6">
        {[1, 2].map(i => <div key={i} className="h-52 rounded-2xl bg-surface animate-pulse" />)}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-32 text-center gap-3">
        <Play size={52} className="opacity-20 text-ink" />
        <p className="text-ink-muted text-sm">Nothing in progress.</p>
        <p className="text-ink-faint text-xs">Tap + to start something.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6">
      {items.map(item => <NowCard key={item.id} item={item} onEdit={onEdit} />)}
    </div>
  )
}

function NowCard({ item, onEdit }: { item: Item; onEdit: (item: Item) => void }) {
  const statusColor = item.status === 'reading' ? '#3b82f6' : '#8b5cf6'

  return (
    <button
      onClick={() => onEdit(item)}
      className="relative w-full rounded-2xl overflow-hidden text-left focus:outline-none active:scale-[0.98] transition-transform"
      style={{ minHeight: 200 }}
    >
      {item.coverUrl ? (
        <>
          <div className="absolute inset-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.coverUrl} alt="" aria-hidden className="cover-blur absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/25" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-surface to-card" />
      )}

      <div className="relative flex gap-4 p-5">
        <div className="relative shrink-0 rounded-xl overflow-hidden shadow-2xl" style={{ width: 96, height: 144 }}>
          <CoverImage item={item} fill className="rounded-xl" />
        </div>

        <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
          <div>
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3"
              style={{ background: `${statusColor}25`, color: statusColor }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: statusColor }} />
              {STATUS_LABEL[item.status]}
            </span>

            <h2 className="font-serif text-xl md:text-2xl text-ink leading-tight line-clamp-2">
              {item.title}
            </h2>
            {item.creator && <p className="text-ink-muted text-sm mt-1 truncate">{item.creator}</p>}
            {item.platform && !item.creator && <p className="text-ink-muted text-sm mt-1 truncate">{item.platform}</p>}
            {item.platform && item.creator && <p className="text-ink-faint text-xs mt-0.5 truncate">{item.platform}</p>}
          </div>

          <div className="flex items-center justify-between mt-3">
            {item.dateStarted && <span className="text-ink-muted text-xs">{daysSince(item.dateStarted)}</span>}
            {item.rating && <StarRating value={item.rating} readonly size="sm" />}
          </div>
        </div>
      </div>
    </button>
  )
}
