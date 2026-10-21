import { categoryColor } from '../../lib/format'

/** Category label with a small coloured square derived from the category text. */
export default function CategoryChip({ category, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2 py-0.5 text-xs text-ink/80 ${className}`}
    >
      <span
        className="size-1.5 shrink-0 rounded-[2px]"
        style={{ backgroundColor: categoryColor(category) }}
        aria-hidden="true"
      />
      <span className="truncate">{category}</span>
    </span>
  )
}
