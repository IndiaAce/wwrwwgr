'use client'

import { BarChart2 } from 'lucide-react'
import { Item } from '@/types'
import StarRating from './StarRating'
import CoverImage from './CoverImage'

interface StatsSectionProps {
  items: Item[]
  loading: boolean
  onEdit: (item: Item) => void
}

interface MonthData {
  key: string
  label: string
  book: number
  film: number
  tv: number
  total: number
}

const TYPE_COLORS = { book: '#f59e0b', film: '#3b82f6', tv: '#8b5cf6' }

function getMonthlyData(items: Item[]): MonthData[] {
  const relevant = items.filter(i =>
    (i.status === 'finished' || i.status === 'dnf') && i.dateEnded
  )
  const byMonth: Record<string, MonthData> = {}
  for (const item of relevant) {
    const d = new Date(item.dateEnded! + 'T12:00:00')
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!byMonth[key]) {
      byMonth[key] = {
        key,
        label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        book: 0, film: 0, tv: 0, total: 0,
      }
    }
    byMonth[key][item.type]++
    byMonth[key].total++
  }
  return Object.values(byMonth).sort((a, b) => a.key.localeCompare(b.key))
}

export default function StatsSection({ items, loading, onEdit }: StatsSectionProps) {
  if (loading) {
    return (
      <div className="p-4 md:p-6 flex flex-col gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-surface animate-pulse" />)}
      </div>
    )
  }

  const finished     = items.filter(i => i.status === 'finished' || i.status === 'dnf')
  const withRating   = finished.filter(i => i.rating)
  const avgRating    = withRating.length
    ? (withRating.reduce((s, i) => s + i.rating!, 0) / withRating.length)
    : null
  const thisYear     = new Date().getFullYear()
  const thisYearCount = finished.filter(i => i.dateEnded?.startsWith(String(thisYear))).length
  const masterpieces = items.filter(i => i.rating === 6)
  const monthlyData  = getMonthlyData(items)
  const maxMonth     = Math.max(...monthlyData.map(m => m.total), 1)
  const topRated     = items
    .filter(i => (i.rating ?? 0) >= 5)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))

  const ratingDist = [1, 2, 3, 4, 5, 6].map(r => ({
    r,
    count: items.filter(i => i.rating === r).length,
  }))
  const maxRatingCount = Math.max(...ratingDist.map(d => d.count), 1)

  if (finished.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-32 text-center gap-3">
        <BarChart2 size={52} className="opacity-20 text-ink" />
        <p className="text-ink-muted text-sm">No stats yet.</p>
        <p className="text-ink-faint text-xs">Finish something to see your data here.</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 max-w-4xl">

      {/* ── Summary cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Completed" value={finished.length} sub="all time" />
        <StatCard label={`In ${thisYear}`} value={thisYearCount} sub="this year" />
        <StatCard
          label="Avg rating"
          value={avgRating ? avgRating.toFixed(1) : '—'}
          sub={avgRating ? '★ out of 6' : 'no ratings yet'}
        />
        <StatCard
          label="Masterpieces"
          value={masterpieces.length}
          sub="rated ✦"
          accent
        />
      </div>

      {/* ── Type breakdown ──────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">By type</h3>
        <div className="flex gap-3">
          {(['book', 'film', 'tv'] as const).map(type => {
            const count = finished.filter(i => i.type === type).length
            const pct   = finished.length ? Math.round((count / finished.length) * 100) : 0
            const label = type === 'book' ? 'Books' : type === 'film' ? 'Films' : 'TV'
            return (
              <div key={type} className="flex-1 flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-ink-muted">{label}</span>
                  <span className="text-sm font-bold text-ink">{count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: TYPE_COLORS[type] }}
                  />
                </div>
                <span className="text-[10px] text-ink-faint">{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Monthly chart ───────────────────────────────────────────── */}
      {monthlyData.length > 0 && (
        <div className="bg-card rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-5">
            Completed per month
          </h3>

          <div className="flex items-end gap-1.5 h-36 md:h-44">
            {monthlyData.map(month => (
              <div key={month.key} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                {/* Count label */}
                <span className="text-[10px] text-ink-muted leading-none">{month.total}</span>

                {/* Stacked bar */}
                <div
                  className="w-full rounded-t-md overflow-hidden flex flex-col-reverse"
                  style={{ height: `${(month.total / maxMonth) * 100}%`, minHeight: 6 }}
                >
                  {(['book', 'film', 'tv'] as const).map(type =>
                    month[type] > 0 ? (
                      <div
                        key={type}
                        style={{ flex: month[type], background: TYPE_COLORS[type], minHeight: 4 }}
                      />
                    ) : null
                  )}
                </div>

                {/* Month label */}
                <span className="text-[9px] text-ink-faint leading-none whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                  {month.label}
                </span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50">
            {([['book', 'Books'], ['film', 'Films'], ['tv', 'TV']] as const).map(([type, label]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: TYPE_COLORS[type] }} />
                <span className="text-xs text-ink-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Ratings distribution ────────────────────────────────────── */}
      {withRating.length > 0 && (
        <div className="bg-card rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-5">
            Ratings distribution
          </h3>
          <div className="flex items-end gap-2 h-24">
            {ratingDist.map(({ r, count }) => {
              const isMaster = r === 6
              const barColor = isMaster ? '#c084fc' : '#f5c518'
              return (
                <div key={r} className="flex-1 flex flex-col items-center gap-1">
                  {count > 0 && (
                    <span className="text-[10px] text-ink-muted leading-none">{count}</span>
                  )}
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: count > 0 ? `${(count / maxRatingCount) * 100}%` : 4,
                      background: count > 0 ? barColor : '#2a2420',
                      minHeight: 4,
                      opacity: count > 0 ? 1 : 0.3,
                    }}
                  />
                  <span className="text-[10px] text-ink-faint leading-none">
                    {isMaster ? '✦' : `${r}★`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Top rated ───────────────────────────────────────────────── */}
      {topRated.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3 px-0.5">
            Favourites
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {topRated.map(item => (
              <button
                key={item.id}
                onClick={() => onEdit(item)}
                className="flex-none flex flex-col gap-1.5 w-24 group focus:outline-none"
              >
                <div className="relative w-24 h-36 rounded-xl overflow-hidden bg-surface shadow-md group-hover:ring-1 group-hover:ring-accent/30 group-active:scale-95 transition-all">
                  <CoverImage item={item} fill />
                  {item.rating === 6 && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-masterpiece/90 flex items-center justify-center text-[9px]">
                      ✦
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-ink leading-tight line-clamp-2 px-0.5">{item.title}</p>
                <StarRating value={item.rating} readonly size="sm" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: boolean
}) {
  return (
    <div className="bg-card rounded-xl p-4 flex flex-col gap-1">
      <p className="text-[10px] text-ink-muted uppercase tracking-wider">{label}</p>
      <p className={`font-serif text-3xl leading-none ${accent ? 'text-masterpiece' : 'text-ink'}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-ink-faint mt-1">{sub}</p>}
    </div>
  )
}
