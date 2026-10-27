import axios from 'axios'
import { useSearchParams } from 'react-router-dom'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { newsService } from '../services/news.service'
import ScrollProgress from '../components/ScrollProgress'
import NewsCard from '../components/NewsCard'
import {
  NEWS_STATUS_LABELS,
  PRIORITY_LABELS,
  TYPE_LABELS,
  isNewsPriority,
  isNewsStatus,
  isNewsType,
} from '../lib/newsFilters'
import type { NewsPriority, NewsStatus, NewsType } from '../types/api'

interface NewsListProps {
  type?: NewsType
  priority?: NewsPriority
  status?: NewsStatus
  search: string
}

// Esta parte se vuelve a montar cuando cambian los filtros (ver key abajo):
// así la lista, el cursor y el scroll empiezan de cero con el estado limpio.
function NewsList({ type, priority, status, search }: NewsListProps) {
  const { items, loading, error, hasMore, retry } = useInfiniteScroll(
    (cursor: string | null, signal: AbortSignal) =>
      newsService.getFeed({ cursor: cursor ?? undefined, type, priority, status }, signal),
  )

  // 423 LOG_POSE_REQUIRED = todavía no aprobaron el CP3: mostramos un mensaje claro.
  const locked = axios.isAxiosError(error) && error.response?.status === 423

  return (
    <>
      <ul className="flex flex-col gap-3">
        {items.map((n) => (
          <NewsCard key={n.id} news={n} search={search} />
        ))}
      </ul>
      {loading && <p className="py-4">Cargando más...</p>}
      {locked && <p role="alert" className="py-4">Estas noticias se desbloquean al aprobar el Checkpoint 3.</p>}
      {!!error && !locked && (
        <p role="alert" className="py-4 text-red-600">
          Error al cargar. <button className="underline" onClick={() => void retry()}>Reintentar</button>
        </p>
      )}
      {!loading && !error && items.length === 0 && !hasMore && (
        <p className="py-4 text-slate-500">No hay noticias con esos filtros.</p>
      )}
      {!hasMore && items.length > 0 && <p className="py-4 text-slate-500">No hay más noticias.</p>}
    </>
  )
}

export default function NewsPage() {
  // El estado de los filtros vive en la URL: se puede compartir, recargar con F5 y usar el botón atrás.
  const [params, setParams] = useSearchParams()

  const rawType = params.get('type') ?? ''
  const rawPriority = params.get('priority') ?? ''
  const rawStatus = params.get('status') ?? ''
  // Validamos contra el contrato: un valor inventado en la URL se ignora.
  const type = isNewsType(rawType) ? rawType : undefined
  const priority = isNewsPriority(rawPriority) ? rawPriority : undefined
  const status = isNewsStatus(rawStatus) ? rawStatus : undefined

  const setFilter = (key: 'type' | 'priority' | 'status', value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key) // "Todos" no ensucia la URL
    setParams(next)
  }

  const search = (() => {
    const q = new URLSearchParams()
    if (type) q.set('type', type)
    if (priority) q.set('priority', priority)
    if (status) q.set('status', status)
    const s = q.toString()
    return s ? `?${s}` : ''
  })()

  return (
    <main className="p-6">
      <ScrollProgress />
      <h1 className="mb-4 text-2xl font-bold">Noticias</h1>
      <div className="mb-4 flex flex-wrap gap-3">
        <label className="flex flex-col text-sm">
          Tipo
          <select className="rounded border p-1" value={type ?? ''} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          Prioridad
          <select className="rounded border p-1" value={priority ?? ''} onChange={(e) => setFilter('priority', e.target.value)}>
            <option value="">Todas</option>
            {Object.entries(PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          Estado
          <select className="rounded border p-1" value={status ?? ''} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(NEWS_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>
      {/* key = filtros: al cambiarlos React desmonta y monta de nuevo la lista (lista y cursor reiniciados). */}
      <NewsList key={search} type={type} priority={priority} status={status} search={search} />
    </main>
  )
}
