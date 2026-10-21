const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

// "2026-03-07T10:00:00Z" -> "March 7, 2026"
export function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date)
}

// Pastel-saturated dot colours for category chips.
const CATEGORY_COLORS = ['#F59E0B', '#4CC38A', '#60A5FA', '#8B5CF6', '#F472B6']

// The same category text always gets the same colour.
export function categoryColor(category) {
  const text = String(category ?? '').trim().toLowerCase()
  let hash = 0
  for (const char of text) hash = (hash * 31 + char.codePointAt(0)) >>> 0
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length]
}

// Hue (lavender to violet) and angle for an article's generated cover, varied by id.
export function coverTheme(id) {
  const seed = Number(id) || 0
  return {
    hue: 235 + ((seed * 37) % 60),
    angle: (seed * 53) % 360,
  }
}
