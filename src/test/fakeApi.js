import { vi } from 'vitest'

/**
 * In-memory stand-in for the Go backend, installed as the global `fetch`.
 * It follows the API contract (routes, status codes, X-Total-Count) so page
 * tests exercise the real api/articles.js module without any network.
 *
 *   const api = installFakeApi([makeArticle(1), makeArticle(2, { status: 'draft' })])
 *   api.requests   -> every request made: { method, path, status, body }
 *   api.articles   -> the current "database"
 *   api.respondWith('GET', /^\/article\/\d+\/\d+$/, 500, { message: 'boom' })
 */
export function installFakeApi(initialArticles = []) {
  const api = {
    articles: initialArticles.map((article) => ({ ...article })),
    requests: [],
    overrides: [],

    respondWith(method, pathPattern, status, body) {
      api.overrides.push({ method, pathPattern, status, body })
    },

    // Requests that match a method and path, e.g. api.requestsTo('PUT', '/article/3').
    requestsTo(method, path) {
      return api.requests.filter((request) => request.method === method && request.path === path)
    },
  }

  let nextId = Math.max(0, ...api.articles.map((article) => article.id)) + 1

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input, options = {}) => {
      const url = new URL(input)
      const method = options.method ?? 'GET'
      const body = options.body ? JSON.parse(options.body) : undefined
      const path = url.pathname
      api.requests.push({ method, path, status: url.searchParams.get('status'), body })

      const override = api.overrides.find(
        (candidate) => candidate.method === method && candidate.pathPattern.test(path),
      )
      if (override) return json(override.body, override.status)

      const list = path.match(/^\/article\/(\d+)\/(\d+)$/)
      const single = path.match(/^\/article\/(\d+)$/)

      if (method === 'GET' && list) {
        const [limit, offset] = [Number(list[1]), Number(list[2])]
        const status = url.searchParams.get('status')
        const matching = api.articles
          .filter((article) => !status || article.status === status)
          .sort((a, b) => b.id - a.id)
        return json(matching.slice(offset, offset + limit), 200, {
          'X-Total-Count': String(matching.length),
        })
      }

      if (method === 'POST' && path === '/article/') {
        const now = new Date().toISOString()
        api.articles.push({ id: nextId++, ...body, created_date: now, updated_date: now })
        return json({}, 201)
      }

      if (single) {
        const id = Number(single[1])
        const index = api.articles.findIndex((article) => article.id === id)
        if (index === -1) return json({ message: 'article not found' }, 404)

        if (method === 'GET') return json(api.articles[index])
        if (method === 'PUT') {
          api.articles[index] = { ...api.articles[index], ...body }
          return json({})
        }
        if (method === 'DELETE') {
          api.articles.splice(index, 1)
          return json({})
        }
      }

      return json({ message: 'route not found' }, 404)
    }),
  )

  return api
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

/** A valid article (title >= 20, content >= 200, category >= 3 characters). */
export function makeArticle(id, overrides = {}) {
  return {
    id,
    title: `Article number ${id} about testing`,
    content: `Paragraph one of article ${id}.\nParagraph two. ${'Lorem ipsum dolor sit amet. '.repeat(8)}`,
    category: 'Technology',
    status: 'publish',
    created_date: '2026-03-07T10:00:00Z',
    updated_date: '2026-03-08T10:00:00Z',
    ...overrides,
  }
}
