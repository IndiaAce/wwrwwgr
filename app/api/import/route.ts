import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getItems, saveItems } from '@/lib/store'
import { parseNotionCSV } from '@/lib/notionParser'
import { Item } from '@/types'

export async function POST(req: Request) {
  const { csv, replace } = await req.json() as { csv: string; replace?: boolean }

  if (!csv?.trim()) {
    return NextResponse.json({ error: 'No CSV provided' }, { status: 400 })
  }

  let parsed
  try {
    parsed = parseNotionCSV(csv)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse CSV'
    return NextResponse.json({ error: message }, { status: 422 })
  }

  const newItems: Item[] = parsed.items.map(item => ({ ...item, id: uuidv4() }))

  const existing = replace ? [] : await getItems()
  await saveItems([...existing, ...newItems])

  return NextResponse.json({
    imported: newItems.length,
    skipped: parsed.skipped,
  })
}
