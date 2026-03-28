import { SearchResult } from '@/types'

// Open Library — free, no API key required

export async function searchBooks(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=key,title,author_name,cover_i,first_publish_year&limit=6`,
    { next: { revalidate: 60 } }
  )
  if (!res.ok) return []
  const data = await res.json()

  return data.docs.map((book: OLDoc) => ({
    id: book.key,
    type: 'book' as const,
    title: book.title,
    creator: book.author_name?.[0],
    year: book.first_publish_year,
    coverUrl: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : undefined,
    openLibraryKey: book.key,
  }))
}

interface OLDoc {
  key: string
  title: string
  author_name?: string[]
  cover_i?: number
  first_publish_year?: number
}
