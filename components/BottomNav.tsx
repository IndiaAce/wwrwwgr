'use client'

type Tab = 'now' | 'onDeck' | 'finished'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  counts: { now: number; onDeck: number; finished: number }
  onAdd: () => void
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'now', label: 'Now', icon: '▶' },
  { id: 'onDeck', label: 'On Deck', icon: '◎' },
  { id: 'finished', label: 'Done', icon: '✓' },
]

export default function BottomNav({ activeTab, onTabChange, counts, onAdd }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-surface/95 border-t border-border backdrop-blur-md">
      <div className="max-w-lg mx-auto flex items-center">
        {/* Left two tabs */}
        {tabs.slice(0, 2).map(tab => (
          <TabButton
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            count={counts[tab.id]}
            onClick={() => onTabChange(tab.id)}
          />
        ))}

        {/* Center add button */}
        <div className="flex-1 flex justify-center pb-safe">
          <button
            onClick={onAdd}
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-light text-bg shadow-lg transition-transform active:scale-90 hover:brightness-110 -mt-6"
            style={{ background: 'linear-gradient(135deg, #e8774a, #c95a2a)' }}
            aria-label="Add item"
          >
            +
          </button>
        </div>

        {/* Right tab */}
        <TabButton
          tab={tabs[2]}
          active={activeTab === tabs[2].id}
          count={counts[tabs[2].id]}
          onClick={() => onTabChange(tabs[2].id)}
        />

        {/* Spacer to balance layout */}
        <div className="flex-1" />
      </div>

      {/* Safe area padding for iPhone home bar */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}

function TabButton({
  tab,
  active,
  count,
  onClick,
}: {
  tab: { id: Tab; label: string; icon: string }
  active: boolean
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors ${
        active ? 'text-accent' : 'text-ink-muted'
      }`}
    >
      <span className="text-lg leading-none">{tab.icon}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
      {count > 0 && (
        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
            active ? 'bg-accent text-white' : 'bg-ink-faint text-ink-muted'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}
