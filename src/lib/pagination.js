export const GAP = 'gap'

// Reads ?page= from the URL; anything that is not a positive integer means page 1.
export function parsePage(value) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export function totalPages(total, perPage) {
  return Math.max(1, Math.ceil(total / perPage))
}

/**
 * The page buttons to render: always the first and last page, the current
 * page with one neighbour on each side, and GAP where pages are skipped.
 * pageItems(6, 10) -> [1, GAP, 5, 6, 7, GAP, 10]
 */
export function pageItems(current, last) {
  const pages = new Set([1, last, current - 1, current, current + 1])
  const sorted = [...pages].filter((page) => page >= 1 && page <= last).sort((a, b) => a - b)

  const items = []
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1]
    if (previous !== undefined && page - previous === 2) items.push(page - 1)
    else if (previous !== undefined && page - previous > 2) items.push(GAP)
    items.push(page)
  })
  return items
}
