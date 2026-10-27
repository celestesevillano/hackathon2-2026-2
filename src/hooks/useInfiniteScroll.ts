import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'

// Página de un feed paginado por cursor (la misma forma que devuelve /news/feed).
interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

// Infinite scroll a mano (sin librerías): los items se ACUMULAN en vez de reemplazarse.
export function useInfiniteScroll<T extends { id: string }>(
  fetchPage: (cursor: string | null, signal: AbortSignal) => Promise<CursorPage<T>>,
) {
  const [items, setItems] = useState<T[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const loadingRef = useRef(false) // evita lanzar dos cargas a la vez aunque el scroll dispare muchas veces

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoading(true)
    setError(null)
    const controller = new AbortController()
    try {
      const page = await fetchPage(cursor, controller.signal)
      // Sumamos lo nuevo a lo anterior y descartamos ids repetidos.
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.id))
        return [...prev, ...page.items.filter((i) => !seen.has(i.id))]
      })
      setCursor(page.nextCursor)
      setHasMore(page.hasMore)
    } catch (e) {
      if (!axios.isCancel(e)) setError(e) // conservamos lo ya cargado y permitimos reintentar
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [cursor, hasMore, fetchPage])

  // Carga inicial.
  useEffect(() => {
    void loadMore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Listener de scroll: cuando llegas al final de la página pide la siguiente.
  // El return limpia el listener para no acumular listeners al desmontar.
  useEffect(() => {
    const onScroll = () => {
      const atBottom =
        window.innerHeight + document.documentElement.scrollTop + 1 >=
        document.documentElement.scrollHeight
      if (atBottom) void loadMore()
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [loadMore])

  return { items, loading, error, hasMore, retry: loadMore }
}
