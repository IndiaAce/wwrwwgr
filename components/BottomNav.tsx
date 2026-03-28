'use client'

import { Play, List, CheckCheck, Plus, BarChart2 } from 'lucide-react'

type Tab = 'now' | 'onDeck' | 'finished' | 'stats'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  counts: { now: number; onDeck: number; finished: number }
  onAdd: () => void
}

export default function BottomNav({ activeTab, onTabChange, counts, onAdd }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-surface/95 border-t border-border backdrop-blur-md">
      <div className="max-w-lg mx-auto flex items-center">
        <TabButton id="now"      label="Now"     Icon={Play}      active={activeTab === 'now'}      count={counts.now}      onClick={() => onTabChange('now')} />
        <TabButton id="onDeck"   label="On Deck" Icon={List}      active={activeTab === 'onDeck'}   count={counts.onDeck}   onClick={() => onTabChange('onDeck')} />

        {/* Centre FAB */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={onAdd}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 hover:brightness-110 -mt-6"
            style={{ background: 'linear-gradient(135deg, #e8774a, #c95a2a)' }}
            aria-label="Add item"
          >
            <Plus size={26} color="white" strokeWidth={2.5} />
          </button>
        </div>

        <TabButton id="finished" label="Done"    Icon={CheckCheck} active={activeTab === 'finished'} count={counts.finished} onClick={() => onTabChange('finished')} />
        <TabButton id="stats"    label="Stats"   Icon={BarChart2}  active={activeTab === 'stats'}    onClick={() => onTabChange('stats')} />
      </div>
    </nav>
  )
}

function TabButton({ id, label, Icon, active, count, onClick }: {
  id: string; label: string; Icon: React.ElementType
  active: boolean; count?: number; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors ${active ? 'text-accent' : 'text-ink-muted'}`}
    >
      <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${active ? 'bg-accent text-white' : 'bg-ink-faint text-ink-muted'}`}>
          {count}
        </span>
      )}
    </button>
  )
}
