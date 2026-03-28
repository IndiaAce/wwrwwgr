import { NextResponse } from 'next/server'
import { searchMovies, searchTV } from '@/lib/tmdb'
import { searchBooks } from '@/lib/openLibrary'
import { ItemType } from '@/types'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  const type = searchParams.get('type') as ItemType | null

  if (!query || !type) {
    return NextResponse.json({ error: 'Missing q or type' }, { status: 400 })
  }

  try {
    if (type === 'book') {
      const results = await searchBooks(query)
      return NextResponse.json(results)
    }
    if (type === 'film') {
      const results = await searchMovies(query)
      return NextResponse.json(results)
    }
    if (type === 'tv') {
      const results = await searchTV(query)
      return NextResponse.json(results)
    }
    return NextResponse.json([])
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
