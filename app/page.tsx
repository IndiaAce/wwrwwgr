'use client'

import { useState, useEffect, useCallback } from 'react'
import { RotateCw, Upload, Plus, Play, List, CheckCheck } from 'lucide-react'
import { Item } from '@/types'
import BottomNav from '@/components/BottomNav'
import NowSection from '@/components/NowSection'
import OnDeckSection from '@/components/OnDeckSection'
import FinishedSection from '@/components/FinishedSection'
import AddEditModal from '@/components/AddEditModal'
import ImportModal from '@/components/ImportModal'

type Tab = 'now' | 'onDeck' | 'finished'

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'now',      label: 'Now',     Icon: Play },
  { id: 'onDeck',   label: 'On Deck', Icon: List },
  { id: 'finished', label: 'Done',    Icon: CheckCheck },
]

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

  useEffect(() => { fetchItems() }, [fetchItems])

  const nowItems      = items.filter(i => i.status === 'reading' || i.status === 'watching')
  const deckItems     = items.filter(i => i.status === 'tbr')
  const finishedItems = items
    .filter(i => i.status === 'finished' || i.status === 'dnf')
    .sort((a, b) => (b.dateEnded ?? '').localeCompare(a.dateEnded ?? ''))

  const counts = { now: nowItems.length, onDeck: deckItems.length, finished: finishedItems.length }

  function openAdd()         { setEditingItem(null); setIsModalOpen(true) }
  function openEdit(i: Item) { setEditingItem(i);    setIsModalOpen(true) }

  async function handleSave(item: Item) {
    if (editingItem) {
      await fetch(`/api/items/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    } else {
      await fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    }
    await fetchItems()
    setIsModalOpen(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/items/${id}`, { method: 'DELETE' })
    await fetchItems()
    setIsModalOpen(false)
  }

  return (
    <main className="min-h-dvh bg-bg text-ink">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-5 md:px-8 flex items-center justify-between py-4">
          {/* Logo */}
          <div>
            <h1 className="font-serif text-2xl text-accent tracking-tight leading-none">WWRWWGR</h1>
            <p className="text-[10px] text-ink-faint uppercase tracking-widest mt-0.5 hidden sm:block">
              What We&apos;re Reading, What We&apos;re Gonna Read
            </p>
          </div>

          {/* Desktop tab nav */}
          <nav className="hidden md:flex items-center gap-1 bg-card rounded-xl p-1">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-surface text-accent shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Icon size={14} strokeWidth={activeTab === id ? 2.5 : 1.8} />
                {label}
                {counts[id] > 0 && (
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                    activeTab === id ? 'bg-accent text-white' : 'bg-border text-ink-muted'
                  }`}>
                    {counts[id]}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportOpen(true)}
              className="text-ink-muted hover:text-ink transition-colors p-2 rounded-lg hover:bg-card"
              title="Import from Notion"
            >
              <Upload size={17} />
            </button>
            <button
              onClick={fetchItems}
              className="text-ink-muted hover:text-ink transition-colors p-2 rounded-lg hover:bg-card"
              title="Refresh"
            >
              <RotateCw size={17} />
            </button>
            {/* Desktop add button */}
            <button
              onClick={openAdd}
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #e8774a, #c95a2a)' }}
            >
              <Plus size={15} strokeWidth={2.5} />
              Add
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto pb-28 md:pb-10 md:px-4 lg:px-8">
        {activeTab === 'now'      && <NowSection      items={nowItems}      loading={loading} onEdit={openEdit} />}
        {activeTab === 'onDeck'   && <OnDeckSection   items={deckItems}     loading={loading} onEdit={openEdit} />}
        {activeTab === 'finished' && <FinishedSection items={finishedItems} loading={loading} onEdit={openEdit} />}
      </div>

      {/* Mobile bottom nav only */}
      <div className="md:hidden">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} counts={counts} onAdd={openAdd} />
      </div>

      {isImportOpen && <ImportModal onClose={() => setIsImportOpen(false)} onImported={fetchItems} />}
      {isModalOpen  && <AddEditModal item={editingItem} onSave={handleSave} onDelete={handleDelete} onClose={() => setIsModalOpen(false)} />}
    </main>
  )
}
