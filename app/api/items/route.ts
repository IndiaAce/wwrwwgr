import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getItems, saveItems } from '@/lib/store'
import { Item } from '@/types'

export async function GET() {
  const items = await getItems()
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const body: Omit<Item, 'id'> = await req.json()
  const items = await getItems()
  const newItem: Item = { ...body, id: uuidv4() }
  await saveItems([...items, newItem])
  return NextResponse.json(newItem, { status: 201 })
}
