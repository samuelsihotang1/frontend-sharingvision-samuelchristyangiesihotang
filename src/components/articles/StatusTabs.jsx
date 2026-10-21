import { TABS } from '../../lib/articleStatus'

/** Underline-style tabs: Published / Drafts / Trashed, each with its count. */
export default function StatusTabs({ activeKey, counts, onSelect }) {
  return (
    <div role="tablist" aria-label="Article status" className="flex gap-6 border-b border-line">
      {TABS.map((tab) => {
        const active = tab.key === activeKey
        return (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls="articles-panel"
            onClick={() => onSelect(tab.key)}
            className={`-mb-px flex items-center gap-2 border-b-2 pt-1 pb-3 text-sm transition-colors duration-150 ${
              active ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {tab.label}
            {counts && (
              <span className="rounded-full bg-subtle px-1.5 py-px text-[11px] text-muted tabular-nums">
                {counts[tab.status]}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
