import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useLocation, useParams } from 'react-router-dom'
import { newsService } from '../services/news.service'
import { NEWS_STATUS_LABELS, PRIORITY_LABELS, TYPE_LABELS } from '../lib/newsFilters'
import type { NewsDetail } from '../types/api'

function NewsDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const [news, setNews] = useState<NewsDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  // "Volver" regresa a la lista con los mismos filtros, porque viajan en la URL.
  const back = `/news${(location.state as { search?: string } | null)?.search ?? ''}`

  const retry = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    setLoading(true)
    setError('')
    newsService
      .getNewsById(id, controller.signal)
      .then(setNews)
      .catch((e) => {
        if (axios.isCancel(e)) return
        const status = axios.isAxiosError(e) ? e.response?.status : undefined
        setError(
          status === 404 ? 'Esta noticia no existe.'
          : status === 423 ? 'Esta noticia se desbloquea al aprobar el Checkpoint 3.'
          : 'No se pudo cargar la noticia.',
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [id, reloadKey])

  // Verificar un rumor: PATCH y reemplazamos la noticia con la respuesta (ya trae status y verifiedAt nuevos).
  const verify = async (status: 'CONFIRMED' | 'DEBUNKED') => {
    if (!id || verifying) return
    setVerifying(true)
    setVerifyError('')
    try {
      setNews(await newsService.updateNewsStatus(id, status))
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        // Ya la habían verificado con el otro estado: la API manda la noticia actual en `current`.
        const current = (e.response.data as { current?: NewsDetail }).current
        if (current) setNews(current)
        setVerifyError('Esta noticia ya fue verificada con otro estado.')
      } else {
        setVerifyError('No se pudo verificar la noticia. Intenta de nuevo.')
      }
    } finally {
      setVerifying(false)
    }
  }

  return (
    <main className="p-6">
      <Link to={back} className="underline">← Volver a las noticias</Link>
      {loading && <p className="mt-4">Cargando...</p>}
      {error && (
        <p role="alert" className="mt-4 text-red-600">
          {error} <button className="underline" onClick={retry}>Reintentar</button>
        </p>
      )}
      {news && (
        <article className="mt-4">
          <h1 className="text-2xl font-bold">{news.title}</h1>
          <p className="text-slate-500">
            {news.island} · {TYPE_LABELS[news.type]} · Prioridad {PRIORITY_LABELS[news.priority]} · {NEWS_STATUS_LABELS[news.status]}
          </p>
          <p className="text-sm text-slate-500">
            {news.source} · {new Date(news.publishedAt).toLocaleDateString('es-PE')}
            {news.verifiedAt && ` · Verificada el ${new Date(news.verifiedAt).toLocaleDateString('es-PE')}`}
          </p>
          {news.relatedWanted && (
            <p className="mt-2">
              Relacionado: <Link to={`/wanted/${news.relatedWanted.id}`} className="underline">{news.relatedWanted.name}</Link>
            </p>
          )}
          <div className="mt-3 flex flex-col gap-2">
            {news.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {/* Solo un RUMOR se puede verificar. */}
          {news.status === 'RUMOR' && (
            <div className="mt-4 flex gap-3">
              <button className="rounded border px-3 py-1" disabled={verifying} onClick={() => void verify('CONFIRMED')}>
                Confirmar
              </button>
              <button className="rounded border px-3 py-1" disabled={verifying} onClick={() => void verify('DEBUNKED')}>
                Desmentir
              </button>
            </div>
          )}
          {verifyError && <p role="alert" className="mt-2 text-red-600">{verifyError}</p>}
        </article>
      )}
    </main>
  )
}

export default NewsDetailPage
