import { Item, ItemType, ItemStatus } from '@/types'

// Parse a single CSV row, handling quoted fields with commas inside them
function parseCSVRow(row: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < row.length; i++) {
    const ch = row[i]
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current.trim())
  return cells
}

function findCol(headers: string[], ...candidates: string[]): number {
  for (const c of candidates) {
    const idx = headers.findIndex(h => h.toLowerCase().includes(c.toLowerCase()))
    if (idx !== -1) return idx
  }
  return -1
}

function mapType(raw?: string): ItemType {
  const v = raw?.toLowerCase().trim() ?? ''
  if (v.includes('film') || v.includes('movie')) return 'film'
  if (v.includes('tv') || v.includes('series') || v.includes('show')) return 'tv'
  return 'book'
}

function mapStatus(raw?: string): ItemStatus {
  const v = raw?.toLowerCase().trim() ?? ''
  if (v.includes('ready') || v.includes('tbr') || v.includes('to read') || v.includes('to watch')) return 'tbr'
  if (v.includes('reading')) return 'reading'
  if (v.includes('watching')) return 'watching'
  if (v.includes('dnf') || v.includes('not finish')) return 'dnf'
  if (v.includes('finish') || v.includes('done') || v.includes('complete')) return 'finished'
  return 'tbr'
}

function parseRating(raw?: string): number | undefined {
  if (!raw?.trim()) return undefined
  // Count star characters — handles ★ ✦ ⭐ and the ⭐️ emoji variant
  const starCount = (raw.match(/⭐️|[★✦⭐]/g) ?? []).length
  if (starCount > 0) return Math.min(starCount, 6)
  // Try numeric
  const n = parseFloat(raw.trim())
  if (!isNaN(n) && n >= 1 && n <= 6) return Math.round(n)
  return undefined
}

function parseDate(raw?: string): string | undefined {
  if (!raw?.trim()) return undefined
  const s = raw.trim()

  // Already ISO format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)

  // M/D, M/D/YY, or M/D/YYYY (Notion's short date export)
  const mdMatch = s.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)
  if (mdMatch) {
    const month = parseInt(mdMatch[1])
    const day   = parseInt(mdMatch[2])
    let year: number

    if (mdMatch[3]) {
      year = parseInt(mdMatch[3])
      if (year < 100) year += 2000
    } else {
      // No year provided — pick the most recent past date with this M/D.
      // If the date with the current year is more than 7 days in the future,
      // assume it was last year.
      const now = new Date()
      const candidate = new Date(now.getFullYear(), month - 1, day)
      const sevenDaysOut = new Date(now.getTime() + 7 * 86_400_000)
      year = candidate > sevenDaysOut ? now.getFullYear() - 1 : now.getFullYear()
    }

    const d = new Date(year, month - 1, day)
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  }

  // "Month Day, Year" — e.g. "March 11, 2025"
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)

  return undefined
}

export interface ParseResult {
  items: Omit<Item, 'id'>[]
  skipped: number
}

export function parseNotionCSV(csvText: string): ParseResult {
  const lines = csvText.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return { items: [], skipped: 0 }

  const headers = parseCSVRow(lines[0])

  const typeIdx      = findCol(headers, 'type')
  const nameIdx      = findCol(headers, 'name', 'title')
  const statusIdx    = findCol(headers, 'status')
  const authorIdx    = findCol(headers, 'author', 'platform', 'creator', 'director')
  const scoreIdx     = findCol(headers, 'score', 'rating', 'stars')
  const startIdx     = findCol(headers, 'start date', 'started', 'date start')
  const endIdx       = findCol(headers, 'completion', 'end date', 'finished date', 'date end')
  const thoughtsIdx  = findCol(headers, 'thought', 'review', 'notes', 'comment')

  if (nameIdx === -1) {
    throw new Error('Could not find a "Name" or "Title" column in the CSV. Make sure you exported the correct Notion table.')
  }

  const items: Omit<Item, 'id'>[] = []
  let skipped = 0

  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cells = parseCSVRow(line)
    const title = nameIdx !== -1 ? cells[nameIdx]?.trim() : ''
    if (!title) { skipped++; continue }

    const type = mapType(typeIdx !== -1 ? cells[typeIdx] : undefined)
    const status = mapStatus(statusIdx !== -1 ? cells[statusIdx] : undefined)
    const creator = authorIdx !== -1 ? cells[authorIdx]?.trim() || undefined : undefined
    const rating = parseRating(scoreIdx !== -1 ? cells[scoreIdx] : undefined)
    const dateStarted = parseDate(startIdx !== -1 ? cells[startIdx] : undefined)
    const dateEnded = parseDate(endIdx !== -1 ? cells[endIdx] : undefined)
    const thoughts = thoughtsIdx !== -1 ? cells[thoughtsIdx]?.trim() || undefined : undefined

    const item: Omit<Item, 'id'> = {
      type,
      title,
      status,
      ...(type === 'book' ? { creator } : { platform: creator }),
      ...(rating !== undefined && { rating }),
      ...(dateStarted && { dateStarted }),
      ...(dateEnded && { dateEnded }),
      ...(thoughts && { thoughts }),
    }

    items.push(item)
  }

  return { items, skipped }
}
