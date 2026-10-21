import { TABS } from '../../lib/articleStatus'

/** One card per tab with its article count; clicking a card selects that tab. */
export default function StatCards({ counts, activeKey, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {TABS.map((tab) => {
        const highlighted = tab.key === 'published'
        const active = tab.key === activeKey
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelect(tab.key)}
            aria-pressed={active}
            className={`rounded-xl px-4 py-3.5 text-left transition duration-150 hover:-translate-y-0.5 ${
              highlighted ? 'bg-success-soft text-success-ink' : 'bg-subtle text-ink'
            } ${active ? 'ring-1 ring-ink/15' : ''}`}
          >
            <span className={`block text-xs ${highlighted ? 'text-success-ink/80' : 'text-muted'}`}>
              {tab.label}
            </span>
            <span className="mt-1 block font-display text-3xl tracking-[-0.02em] tabular-nums">
              {counts ? counts[tab.status] : <span className="inline-block h-8 w-10 skeleton" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
