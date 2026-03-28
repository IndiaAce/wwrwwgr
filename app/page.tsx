'use client'

import { useState, useEffect, useCallback } from 'react'
import { RotateCw, Upload } from 'lucide-react'
import { Item } from '@/types'
import BottomNav from '@/components/BottomNav'
import NowSection from '@/components/NowSection'
import OnDeckSection from '@/components/OnDeckSection'
import FinishedSection from '@/components/FinishedSection'
import AddEditModal from '@/components/AddEditModal'
import ImportModal from '@/components/ImportModal'

type Tab = 'now' | 'onDeck' | 'finished'

export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('now')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/items')
    setItems(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const nowItems = items.filter(i => i.status === 'reading' || i.status === 'watching')
  const deckItems = items.filter(i => i.status === 'tbr')
  const finishedItems = items
    .filter(i => i.status === 'finished' || i.status === 'dnf')
    .sort((a, b) => {
      const da = a.dateEnded ? new Date(a.dateEnded).getTime() : 0
      const db = b.dateEnded ? new Date(b.dateEnded).getTime() : 0
      return db - da
    })

  function openAdd() {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  function openEdit(item: Item) {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  async function handleSave(item: Item) {
    if (editingItem) {
      await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
    } else {
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
    }
    await fetchItems()
    setIsModalOpen(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/items/${id}`, { method: 'DELETE' })
    await fetchItems()
    setIsModalOpen(false)
  }

  // Auto-jump to the right tab when editing
  function openEditAndJump(item: Item) {
    openEdit(item)
  }

  return (
    <main className="min-h-dvh bg-bg text-ink">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur-md border-b border-border/50 px-5 pt-safe-top">
        <div className="max-w-lg mx-auto flex items-baseline justify-between py-4">
          <div>
            <h1 className="font-serif text-2xl text-accent tracking-tight">WWRWWGR</h1>
            <p className="text-[10px] text-ink-faint uppercase tracking-widest -mt-0.5">
              What We&apos;re Reading, What We&apos;re Gonna Read
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImportOpen(true)}
              className="text-ink-muted hover:text-ink transition-colors"
              aria-label="Import from Notion"
              title="Import from Notion CSV"
            >
              <Upload size={18} />
            </button>
            <button
              onClick={fetchItems}
              className="text-ink-muted hover:text-ink transition-colors active:rotate-180 transition-transform duration-300"
              aria-label="Refresh"
            >
              <RotateCw size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto pb-28">
        {activeTab === 'now' && (
          <NowSection items={nowItems} loading={loading} onEdit={openEditAndJump} />
        )}
        {activeTab === 'onDeck' && (
          <OnDeckSection items={deckItems} loading={loading} onEdit={openEditAndJump} />
        )}
        {activeTab === 'finished' && (
          <FinishedSection items={finishedItems} loading={loading} onEdit={openEditAndJump} />
        )}
      </div>

      {/* Bottom Nav */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          now: nowItems.length,
          onDeck: deckItems.length,
          finished: finishedItems.length,
        }}
        onAdd={openAdd}
      />

      {/* Import Modal */}
      {isImportOpen && (
        <ImportModal
          onClose={() => setIsImportOpen(false)}
          onImported={fetchItems}
        />
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <AddEditModal
          item={editingItem}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </main>
  )
}
