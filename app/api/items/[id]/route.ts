import { NextResponse } from 'next/server'
import { getItems, saveItems } from '@/lib/store'
import { Item } from '@/types'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body: Item = await req.json()
  const items = await getItems()
  const updated = items.map(item => (item.id === id ? { ...body, id } : item))
  await saveItems(updated)
  return NextResponse.json(body)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const items = await getItems()
  await saveItems(items.filter(item => item.id !== id))
  return NextResponse.json({ ok: true })
}
