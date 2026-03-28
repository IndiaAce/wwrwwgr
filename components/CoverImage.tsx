'use client'

import Image from 'next/image'
import { BookOpen, Clapperboard, Tv } from 'lucide-react'
import { Item } from '@/types'

interface CoverImageProps {
  item: Pick<Item, 'title' | 'type' | 'coverUrl'> & { creator?: string; platform?: string }
  className?: string
  fill?: boolean
  width?: number
  height?: number
}

/** Deterministic hue from a string so each title always gets the same color. */
function titleHue(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (str.charCodeAt(i) + ((hash << 5) - hash)) | 0
  }
  return Math.abs(hash) % 360
}

const TYPE_ICONS = { book: BookOpen, film: Clapperboard, tv: Tv }

export default function CoverImage({ item, className = '', fill, width, height }: CoverImageProps) {
  const Icon = TYPE_ICONS[item.type]

  if (!item.coverUrl) {
    const hue    = titleHue(item.title)
    const accent = `hsl(${hue}, 55%, 62%)`
    const sub    = item.creator || item.platform

    // Scale font size down for longer titles so they fit in the cover
    const len  = item.title.length
    const size = len > 50 ? '0.55rem' : len > 32 ? '0.65rem' : len > 20 ? '0.75rem' : '0.85rem'

    return (
      <div
        className={`flex flex-col overflow-hidden ${className}`}
        style={{
          background: `linear-gradient(155deg, hsl(${hue},28%,10%) 0%, hsl(${hue},38%,19%) 60%, hsl(${hue},30%,14%) 100%)`,
          ...(fill ? undefined : { width, height }),
        }}
      >
        {/* Accent rule */}
        <div style={{ height: 2, background: accent, opacity: 0.75, flexShrink: 0 }} />

        {/* Title */}
        <div className="flex-1 flex flex-col items-center justify-center px-2.5 py-3 min-h-0 gap-1.5">
          <p
            className="font-serif text-center leading-snug line-clamp-5 text-white/90"
            style={{ fontSize: size, textShadow: '0 1px 8px rgba(0,0,0,0.7)', letterSpacing: '0.01em' }}
          >
            {item.title}
          </p>

          {sub && (
            <p
              className="text-center leading-tight line-clamp-2 font-sans"
              style={{ fontSize: '0.5rem', color: accent, opacity: 0.8, letterSpacing: '0.03em' }}
            >
              {sub}
            </p>
          )}
        </div>

        {/* Type icon */}
        <div className="flex justify-center pb-2 shrink-0">
          <Icon size={10} style={{ color: accent, opacity: 0.45 }} />
        </div>
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
