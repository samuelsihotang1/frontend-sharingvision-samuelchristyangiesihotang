import { useCallback } from 'react'
import { getArticle, listArticles } from '../api/articles'
import { TABS } from '../lib/articleStatus'
import { useRequest } from './useRequest'

// One page of articles with a given status: data = { items, total }.
export function useArticleList({ status, limit, offset }) {
  const load = useCallback(
    (signal) => listArticles({ status, limit, offset, signal }),
    [status, limit, offset],
  )
  return useRequest(load)
}

// Number of articles per status: data = { publish: 4, draft: 2, thrash: 1 }.
export function useArticleCounts() {
  const load = useCallback(async (signal) => {
    const results = await Promise.all(
      TABS.map((tab) => listArticles({ status: tab.status, limit: 1, signal })),
    )
    return Object.fromEntries(TABS.map((tab, index) => [tab.status, results[index].total]))
  }, [])
  return useRequest(load)
}

export function useArticle(id) {
  const load = useCallback((signal) => getArticle(id, { signal }), [id])
  return useRequest(load)
}
