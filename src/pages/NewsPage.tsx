import axios from 'axios'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { newsService } from '../services/news.service'
import ScrollProgress from '../components/ScrollProgress'
import NewsCard from '../components/NewsCard'
import type { ApiErrorBody } from '../types/api'

// Fuera del componente para que la función no cambie en cada render.
const fetchNews = (cursor: string | null, signal: AbortSignal) => newsService.feed(cursor, signal)

export default function NewsPage() {
  const { items, loading, error, hasMore, retry } = useInfiniteScroll(fetchNews)

  // 423 LOG_POSE_REQUIRED = todavía no aprobaron el CP3: mostramos un mensaje claro.
  const locked =
    axios.isAxiosError<ApiErrorBody>(error) && error.response?.status === 423

  return (
    <main className="p-6">
      <ScrollProgress />
      <h1 className="mb-4 text-2xl font-bold">Noticias</h1>
      <ul className="flex flex-col gap-3">
        {items.map((n) => (
          <NewsCard key={n.id} news={n} />
        ))}
      </ul>
      {loading && <p className="py-4">Cargando más...</p>}
      {locked && <p role="alert" className="py-4">Estas noticias se desbloquean al aprobar el Checkpoint 3.</p>}
      {!!error && !locked && (
        <p role="alert" className="py-4 text-red-600">
          Error al cargar. <button className="underline" onClick={() => void retry()}>Reintentar</button>
        </p>
      )}
      {!hasMore && items.length > 0 && <p className="py-4 text-slate-500">No hay más noticias.</p>}
      {/* TODO CP4: filtros (selects) que reinicien la lista y el cursor. */}
    </main>
  )
}
