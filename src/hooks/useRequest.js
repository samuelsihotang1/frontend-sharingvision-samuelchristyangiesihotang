import { useCallback, useEffect, useState } from 'react'

/**
 * Runs `load(signal)` whenever `load` changes (wrap it in useCallback) and
 * returns { data, error, loading, reload }.
 *
 * - When `load` changes (new id, page, status...) data resets to null, so the
 *   page shows a skeleton instead of results that belong to other params.
 * - reload() runs the same request again and keeps the current data visible
 *   while it is loading.
 * - A superseded or unmounted request is aborted, so stale responses never land.
 *
 * Each result remembers which request (load + attempt) produced it, so
 * `loading` is derived during render instead of being set inside the effect.
 */
export function useRequest(load) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ load: null, attempt: -1, data: null, error: null })

  useEffect(() => {
    const controller = new AbortController()

    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ load, attempt, data, error: null })
      },
      (error) => {
        if (!controller.signal.aborted) setResult({ load, attempt, data: null, error })
      },
    )

    return () => controller.abort()
  }, [load, attempt])

  const reload = useCallback(() => setAttempt((count) => count + 1), [])

  const sameRequest = result.load === load
  const finished = sameRequest && result.attempt === attempt
  return {
    data: sameRequest ? result.data : null,
    error: finished ? result.error : null,
    loading: !finished,
    reload,
  }
}
