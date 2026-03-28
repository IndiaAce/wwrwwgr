export type ItemType = 'book' | 'film' | 'tv'
export type ItemStatus = 'tbr' | 'reading' | 'watching' | 'dnf' | 'finished'

export interface Item {
  id: string
  type: ItemType
  title: string
  creator?: string   // author for books, director for film, showrunner for tv
  platform?: string  // Netflix, Plex, Apple TV, etc. — mainly for film/tv
  status: ItemStatus
  dateStarted?: string  // ISO date string YYYY-MM-DD
  dateEnded?: string
  rating?: number       // 1–5 = stars, 6 = masterpiece
  thoughts?: string
  coverUrl?: string
  year?: number
  tmdbId?: number
  openLibraryKey?: string
}

export interface SearchResult {
  id: string
  type: ItemType
  title: string
  creator?: string
  year?: number
  coverUrl?: string
  tmdbId?: number
  openLibraryKey?: string
}
