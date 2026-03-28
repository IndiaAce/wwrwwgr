import { SearchResult } from '@/types'

const BASE = 'https://api.themoviedb.org/3'
const IMG = 'https://image.tmdb.org/t/p/w300'

// ── NOTE: Set TMDB_API_KEY in your .env.local ──────────────────────────────
// Free API key at: https://www.themoviedb.org/settings/api

function getKey() {
  const key = process.env.TMDB_API_KEY
  if (!key) throw new Error('TMDB_API_KEY is not set')
  return key
}

export async function searchMovies(query: string): Promise<SearchResult[]> {
  const key = getKey()
  const res = await fetch(
    `${BASE}/search/movie?query=${encodeURIComponent(query)}&api_key=${key}&language=en-US&page=1`,
    { next: { revalidate: 60 } }
  )
  if (!res.ok) return []
  const data = await res.json()

  return data.results.slice(0, 6).map((m: TMDBMovie) => ({
    id: `tmdb-movie-${m.id}`,
    type: 'film' as const,
    title: m.title,
    year: m.release_date ? parseInt(m.release_date.slice(0, 4)) : undefined,
    coverUrl: m.poster_path ? `${IMG}${m.poster_path}` : undefined,
    tmdbId: m.id,
  }))
}

export async function searchTV(query: string): Promise<SearchResult[]> {
  const key = getKey()
  const res = await fetch(
    `${BASE}/search/tv?query=${encodeURIComponent(query)}&api_key=${key}&language=en-US&page=1`,
    { next: { revalidate: 60 } }
  )
  if (!res.ok) return []
  const data = await res.json()

  return data.results.slice(0, 6).map((s: TMDBShow) => ({
    id: `tmdb-tv-${s.id}`,
    type: 'tv' as const,
    title: s.name,
    year: s.first_air_date ? parseInt(s.first_air_date.slice(0, 4)) : undefined,
    coverUrl: s.poster_path ? `${IMG}${s.poster_path}` : undefined,
    tmdbId: s.id,
  }))
}

interface TMDBMovie {
  id: number
  title: string
  release_date?: string
  poster_path?: string
}

interface TMDBShow {
  id: number
  name: string
  first_air_date?: string
  poster_path?: string
}
