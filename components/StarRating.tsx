'use client'

interface StarRatingProps {
  value?: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const sizeClass = SIZES[size]

  if (readonly) {
    if (!value) return null
    return (
      <span className={`inline-flex gap-0.5 ${sizeClass}`} aria-label={`${value} out of ${value === 6 ? '6 — masterpiece' : '5'} stars`}>
        {Array.from({ length: Math.min(value, 5) }).map((_, i) => (
          <span key={i} style={{ color: '#f5c518' }}>★</span>
        ))}
        {value === 6 && (
          <span title="Masterpiece" style={{ color: '#c084fc' }}>★</span>
        )}
      </span>
    )
  }

  return (
    <div className="flex gap-1" role="group" aria-label="Rate this item">
      {[1, 2, 3, 4, 5, 6].map((star) => {
        const isMasterpiece = star === 6
        const isActive = value !== undefined && star <= value
        const color = isMasterpiece
          ? isActive ? '#c084fc' : '#4a433c'
          : isActive ? '#f5c518' : '#4a433c'

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star === value ? 0 : star)}
            className={`${sizeClass} transition-transform hover:scale-125 active:scale-110`}
            style={{ color }}
            title={isMasterpiece ? 'Masterpiece ✦' : `${star} star${star > 1 ? 's' : ''}`}
            aria-label={isMasterpiece ? 'Masterpiece' : `${star} star${star > 1 ? 's' : ''}`}
          >
            {isMasterpiece ? '✦' : '★'}
          </button>
        )
      })}
    </div>
  )
}
