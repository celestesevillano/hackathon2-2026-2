import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useLocation, useParams } from 'react-router-dom'
import { wantedService } from '../services/wanted.service'
import { FRUIT_LABELS, STATUS_LABELS, formatBounty } from '../lib/wantedFilters'
import type { WantedDetail } from '../types/api'

function WantedDetailPage() {
  const { id } = useParams() // useParams lee el :id de la ruta; siempre llega como string
  const location = useLocation()
  const [wanted, setWanted] = useState<WantedDetail | null>(null)
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
      .getWantedById(id, controller.signal)
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
          <h1 className="text-2xl font-bold">{wanted.name} <span className="font-normal text-slate-500">"{wanted.epithet}"</span></h1>
          <p className="text-lg">{formatBounty(wanted.bounty)} · {STATUS_LABELS[wanted.status]}</p>
          <p className="mt-2">{wanted.bio}</p>
          <dl className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
            <div><dt className="text-sm text-slate-500">Tripulación</dt><dd>{wanted.crew.name}</dd></div>
            <div><dt className="text-sm text-slate-500">Fruta del diablo</dt><dd>{wanted.devilFruit ? `${wanted.devilFruit.name} (${FRUIT_LABELS[wanted.devilFruit.type]})` : 'Sin fruta'}</dd></div>
            <div><dt className="text-sm text-slate-500">Edad / altura</dt><dd>{wanted.age} años · {wanted.heightCm} cm</dd></div>
            <div><dt className="text-sm text-slate-500">Nivel de amenaza</dt><dd>{wanted.threatLevel}</dd></div>
            <div><dt className="text-sm text-slate-500">Visto por última vez</dt><dd>{wanted.lastSeen.island} ({new Date(wanted.lastSeen.seenAt).toLocaleDateString('es-PE')})</dd></div>
          </dl>
          <h2 className="mt-4 font-semibold">Historial de recompensa</h2>
          <ul className="list-disc pl-6">
            {wanted.bountyHistory.map((h) => (
              <li key={h.issuedAt}>{formatBounty(h.amount)} · {new Date(h.issuedAt).toLocaleDateString('es-PE')}</li>
            ))}
          </ul>
        </article>
      )}
    </main>
  )
}

export default WantedDetailPage
