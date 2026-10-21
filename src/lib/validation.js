import { STATUSES } from './articleStatus'

// Minimum lengths, counted after trimming whitespace (same rules as the API).
export const MIN_LENGTH = {
  title: 20,
  content: 200,
  category: 3,
}

const LABELS = {
  title: 'Title',
  content: 'Content',
  category: 'Category',
}

// Counts characters (Unicode code points, like Go's rune count) after trimming.
export function charCount(value) {
  return [...String(value ?? '').trim()].length
}

/**
 * Validates an article and returns an object with one message per failing
 * field, e.g. { title: 'Title must be at least 20 characters' }.
 * An empty object means the article is valid.
 */
export function validateArticle(article) {
  const errors = {}

  for (const [field, min] of Object.entries(MIN_LENGTH)) {
    const length = charCount(article[field])
    if (length === 0) {
      errors[field] = `${LABELS[field]} is required`
    } else if (length < min) {
      errors[field] = `${LABELS[field]} must be at least ${min} characters`
    }
  }

  if (!article.status) {
    errors.status = 'Status is required'
  } else if (!STATUSES.includes(article.status)) {
    errors.status = `Status must be one of: ${STATUSES.join(', ')}`
  }

  return errors
}
