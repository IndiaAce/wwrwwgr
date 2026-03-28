'use client'

import Image from 'next/image'
import { BookOpen, Clapperboard, Tv } from 'lucide-react'
import { Item } from '@/types'

interface CoverImageProps {
  item: Pick<Item, 'title' | 'type' | 'coverUrl'>
  className?: string
  fill?: boolean
  width?: number
  height?: number
}

const TYPE_ICONS = {
  book: BookOpen,
  film: Clapperboard,
  tv: Tv,
}

const TYPE_BG = {
  book:  'from-amber-900  to-amber-800',
  film:  'from-slate-800  to-slate-700',
  tv:    'from-violet-900 to-violet-800',
}

export default function CoverImage({ item, className = '', fill, width, height }: CoverImageProps) {
  const Icon = TYPE_ICONS[item.type]
  const initials = item.title
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')

  if (!item.coverUrl) {
    return (
      <div
        className={`bg-gradient-to-br ${TYPE_BG[item.type]} flex flex-col items-center justify-center gap-2 ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <Icon size={28} className="opacity-50 text-white" />
        <span className="text-sm font-serif font-bold text-white/60 text-center px-2 leading-tight">
          {initials}
        </span>
      </div>
    )
  }

  if (fill) {
    return (
      <Image
        src={item.coverUrl}
        alt={item.title}
        fill
        className={`object-cover ${className}`}
        sizes="(max-width: 768px) 50vw, 33vw"
      />
    )
  }

  return (
    <Image
      src={item.coverUrl}
      alt={item.title}
      width={width ?? 100}
      height={height ?? 150}
      className={`object-cover ${className}`}
    />
  )
}
