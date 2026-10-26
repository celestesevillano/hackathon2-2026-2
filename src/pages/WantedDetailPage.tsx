import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useLocation, useParams } from 'react-router-dom'
import { wantedService } from '../services/wanted.service'
import type { Wanted } from '../types/api'

function WantedDetailPage() {
  const { id } = useParams() // useParams lee el :id de la ruta; siempre llega como string
  const location = useLocation()
  const [wanted, setWanted] = useState<Wanted | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0) // cambiarlo vuelve a disparar el efecto (reintentar)

  // "Volver" regresa al listado con los mismos filtros, porque viajan en la URL.
  const back = `/wanted${(location.state as { search?: string } | null)?.search ?? ''}`

  const retry = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    setLoading(true)
    setError('')
    wantedService
      .detail(id, controller.signal)
      .then(setWanted)
      .catch((e) => {
        if (axios.isCancel(e)) return
        const notFound = axios.isAxiosError(e) && e.response?.status === 404
        setError(notFound ? 'Este cartel no existe.' : 'No se pudo cargar el cartel.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [id, reloadKey])

  return (
    <main className="p-6">
      <Link to={back} className="underline">← Volver al listado</Link>
      {loading && <p className="mt-4">Cargando...</p>}
      {error && (
        <p role="alert" className="mt-4 text-red-600">
          {error} <button className="underline" onClick={retry}>Reintentar</button>
        </p>
      )}
      {wanted && (
        <article className="mt-4">
          <h1 className="text-2xl font-bold">{wanted.name}</h1>
          <pre className="text-sm">{JSON.stringify(wanted, null, 2)}</pre>
          {/* TODO: diseño del cartel con los campos reales. */}
        </article>
      )}
    </main>
  )
}

export default WantedDetailPage
