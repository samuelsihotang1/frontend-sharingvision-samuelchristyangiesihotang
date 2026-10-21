// Thin wrapper around the article endpoints of the Go backend.

export function normalizeBaseUrl(url) {
  return String(url || 'http://localhost:8080').replace(/\/+$/, '')
}

export const API_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL)

// Thrown for every failed request. `fieldErrors` holds the 422 validation messages.
export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {} } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(`Cannot reach the API at ${API_URL}. Is the backend running?`)
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(data?.message || `Request failed with status ${response.status}`, {
      status: response.status,
      fieldErrors: data?.errors ?? {},
    })
  }
  return { data, headers: response.headers }
}

// Only these fields are sent when creating or updating an article.
function toPayload({ title, content, category, status }) {
  return { title, content, category, status }
}

/**
 * Lists articles newest first. Returns { items, total } where total comes
 * from the X-Total-Count header (all rows matching the status filter).
 */
export async function listArticles({ limit, offset = 0, status, signal } = {}) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  const { data, headers } = await request(`/article/${limit}/${offset}${query}`, { signal })
  const items = data ?? []
  const header = headers.get('X-Total-Count')
  const total = header === null ? offset + items.length : Number(header)
  return { items, total }
}

export async function getArticle(id, { signal } = {}) {
  const { data } = await request(`/article/${encodeURIComponent(id)}`, { signal })
  return data
}

export async function createArticle(article) {
  await request('/article/', { method: 'POST', body: toPayload(article) })
}

export async function updateArticle(id, article) {
  await request(`/article/${encodeURIComponent(id)}`, { method: 'PUT', body: toPayload(article) })
}

export async function deleteArticle(id) {
  await request(`/article/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
