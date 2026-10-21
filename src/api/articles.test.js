import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  createArticle,
  deleteArticle,
  getArticle,
  listArticles,
  normalizeBaseUrl,
  updateArticle,
} from './articles'

function jsonResponse(body, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

describe('normalizeBaseUrl', () => {
  it('strips trailing slashes and falls back to localhost:8080', () => {
    expect(normalizeBaseUrl('https://api.example.com/')).toBe('https://api.example.com')
    expect(normalizeBaseUrl('https://api.example.com//')).toBe('https://api.example.com')
    expect(normalizeBaseUrl(undefined)).toBe('http://localhost:8080')
    expect(normalizeBaseUrl('')).toBe('http://localhost:8080')
  })
})

describe('article API', () => {
  let fetchMock

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // The [url, options] of the n-th fetch call.
  const call = (index = 0) => fetchMock.mock.calls[index]

  it('lists a page of articles and reads the total from X-Total-Count', async () => {
    const items = [{ id: 1, title: 'First' }]
    fetchMock.mockResolvedValue(jsonResponse(items, { headers: { 'X-Total-Count': '42' } }))

    const result = await listArticles({ limit: 10, offset: 20, status: 'draft' })

    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8080/article/10/20?status=draft')
    expect(result).toEqual({ items, total: 42 })
  })

  it('lists all statuses when no status is given', async () => {
    fetchMock.mockResolvedValue(jsonResponse([], { headers: { 'X-Total-Count': '0' } }))
    await listArticles({ limit: 5, offset: 0 })
    expect(call()[0]).toBe('http://localhost:8080/article/5/0')
    expect(call()[1].method).toBe('GET')
  })

  it('treats a null body as an empty list', async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, { headers: { 'X-Total-Count': '0' } }))
    await expect(listArticles({ limit: 1 })).resolves.toEqual({ items: [], total: 0 })
  })

  it('gets one article by id', async () => {
    const article = { id: 3, title: 'Hello' }
    fetchMock.mockResolvedValue(jsonResponse(article))

    await expect(getArticle(3)).resolves.toEqual(article)
    expect(call()[0]).toBe('http://localhost:8080/article/3')
  })

  it('creates an article with POST /article/ and a JSON body', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { status: 201 }))
    const article = { title: 'Title', content: 'Content', category: 'News', status: 'draft' }

    await createArticle(article)

    const [url, options] = call()
    expect(url).toBe('http://localhost:8080/article/')
    expect(options.method).toBe('POST')
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(JSON.parse(options.body)).toEqual(article)
  })

  it('deletes an article with DELETE /article/{id}', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}))

    await deleteArticle(9)

    expect(call()[0]).toBe('http://localhost:8080/article/9')
    expect(call()[1].method).toBe('DELETE')
    expect(call()[1].body).toBeUndefined()
  })

  it('sends only the article fields when updating', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}))
    const article = {
      id: 7,
      title: 'Title',
      content: 'Content',
      category: 'News',
      status: 'thrash',
      created_date: '2026-01-01T00:00:00Z',
    }

    await updateArticle(7, article)

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:8080/article/7')
    expect(options.method).toBe('PUT')
    expect(JSON.parse(options.body)).toEqual({
      title: 'Title',
      content: 'Content',
      category: 'News',
      status: 'thrash',
    })
  })

  it('turns a 422 response into an ApiError with field errors', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { message: 'validation failed', errors: { title: 'title must be at least 20 characters' } },
        { status: 422 },
      ),
    )

    const error = await updateArticle(1, {}).catch((caught) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(422)
    expect(error.message).toBe('validation failed')
    expect(error.fieldErrors).toEqual({ title: 'title must be at least 20 characters' })
  })

  it('uses the server message for 404 and 500 responses', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'article not found' }, { status: 404 }))
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'database error' }, { status: 500 }))

    const notFound = await getArticle(404).catch((caught) => caught)
    const serverError = await deleteArticle(1).catch((caught) => caught)

    expect(notFound).toMatchObject({ status: 404, message: 'article not found', fieldErrors: {} })
    expect(serverError).toMatchObject({ status: 500, message: 'database error' })
  })

  it('falls back to a generic message when the error body is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('Bad Gateway', { status: 502 }))

    const error = await getArticle(1).catch((caught) => caught)

    expect(error).toMatchObject({ status: 502, message: 'Request failed with status 502' })
  })

  it('reports an unreachable API as an ApiError with status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    const error = await listArticles({ limit: 1 }).catch((caught) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(0)
    expect(error.message).toMatch(/Cannot reach the API/)
  })
})
