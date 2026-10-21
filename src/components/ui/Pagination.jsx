import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GAP, pageItems } from '../../lib/pagination'

const ITEM = 'grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm transition-colors duration-150'
const ARROW = `${ITEM} text-muted hover:bg-subtle hover:text-ink disabled:pointer-events-none disabled:opacity-40`

/** Numbered pagination with previous/next. Renders nothing when there is only one page. */
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1">
      <button
        type="button"
        className={ARROW}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>

      {pageItems(page, totalPages).map((item, index) =>
        item === GAP ? (
          <span key={`gap-${index}`} className="px-1 text-sm text-muted" aria-hidden="true">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={`${ITEM} ${item === page ? 'bg-ink font-medium text-white' : 'text-ink/80 hover:bg-subtle'}`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className={ARROW}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  )
}
