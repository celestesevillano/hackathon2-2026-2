import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { useLocation, useSearchParams } from 'react-router-dom'
import { SIZE_OPTIONS, SORT_OPTIONS, wantedService } from '../services/wanted.service'
import { crewsService } from '../services/crews.service'
import WantedCard from '../components/WantedCard'
import type { Crew, Page, Wanted } from '../types/api'

const DEFAULT_SIZE = 10
const DEFAULT_SORT = SORT_OPTIONS[0]

// TODO: confirmar con el Swagger los valores reales de estos filtros.
const STATUS_OPTIONS: string[] = []
const FRUIT_OPTIONS: string[] = []

// Lee un número entero de la URL; si es inválido (o negativo) devuelve el valor por defecto.
// Así una URL con valores basura nunca rompe la vista.
function readInt(value: string | null, fallback: number) {
  const n = Number(value)
  return Number.isInteger(n) && n >= 0 ? n : fallback
}

function WantedPage() {
  // EL ESTADO VIVE EN LA URL: página, tamaño, orden, búsqueda y filtros.
  // Recargar, compartir el link o usar atrás/adelante muestra exactamente lo mismo.
  const [params, setParams] = useSearchParams()
  const location = useLocation()

  const page = readInt(params.get('page'), 0)
  const rawSize = readInt(params.get('size'), DEFAULT_SIZE)
  const size = (SIZE_OPTIONS as readonly number[]).includes(rawSize) ? rawSize : DEFAULT_SIZE
  const rawSort = params.get('sort') ?? DEFAULT_SORT
  const sort = (SORT_OPTIONS as readonly string[]).includes(rawSort) ? rawSort : DEFAULT_SORT
  const q = params.get('q') ?? ''
  const status = params.get('status') ?? ''
  const crewId = params.get('crewId') ?? ''
  const fruit = params.get('fruit') ?? ''

  const [searchInput, setSearchInput] = useState(q) // lo que se escribe; la URL se actualiza con debounce
  const [data, setData] = useState<Page<Wanted> | null>(null)
  const [crews, setCrews] = useState<Crew[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  // Cambia uno o varios parámetros de la URL. Quitar los vacíos mantiene la URL limpia.
  // Cualquier cambio de filtro/búsqueda/orden/tamaño vuelve a la página 0 (resetPage).
  const update = useCallback(
    (changes: Record<string, string>, resetPage = true, replace = false) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
          if (resetPage) next.delete('page')
          return next
        },
        { replace },
      )
    },
    [setParams],
  )

  // Debounce: espera 400 ms tras la última tecla antes de buscar, para no pedir por cada letra.
  useEffect(() => {
    if (searchInput === q) return
    const t = setTimeout(() => update({ q: searchInput }, true, true), 400)
    return () => clearTimeout(t)
  }, [searchInput, q, update])

  // Si cambia la URL desde afuera (botón atrás), el input se sincroniza con ella.
  useEffect(() => {
    setSearchInput(q)
  }, [q])

  // Las tripulaciones se piden una sola vez para llenar el select de filtro.
  useEffect(() => {
    crewsService.list().then(setCrews).catch(() => setCrews([]))
  }, [])

  // Cada cambio de parámetros vuelve a pedir al servidor (paginación REAL del servidor).
  // AbortController: si cambias rápido, cancelamos la petición vieja para que su respuesta tardía
  // no pise a la nueva (protección contra respuestas antiguas).
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    wantedService
      .list({ page, size, sort, q, status, crewId, fruit }, controller.signal)
      .then(setData)
      .catch((e) => {
        if (!axios.isCancel(e)) setError('No se pudo cargar la lista.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [page, size, sort, q, status, crewId, fruit, reloadKey])

  // Si la página actual ya no existe (por ejemplo, un filtro dejó menos resultados),
  // saltamos a la última página válida en vez de mostrar una página vacía.
  useEffect(() => {
    if (data && data.totalPages > 0 && page >= data.totalPages) {
      update({ page: String(data.totalPages - 1) }, false, true)
    }
  }, [data, page, update])

  const totalPages = data?.totalPages ?? 1

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Se busca</h1>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <input className="rounded border p-2 md:col-span-3" placeholder="Buscar por nombre o epíteto..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <select className="rounded border p-2" value={status} onChange={(e) => update({ status: e.target.value })}>
          <option value="">Estado: todos</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="rounded border p-2" value={crewId} onChange={(e) => update({ crewId: e.target.value })}>
          <option value="">Tripulación: todas</option>
          {crews.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="rounded border p-2" value={fruit} onChange={(e) => update({ fruit: e.target.value })}>
          <option value="">Fruta: todas</option>
          {FRUIT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select className="rounded border p-2" value={sort} onChange={(e) => update({ sort: e.target.value === DEFAULT_SORT ? '' : e.target.value })}>
          {SORT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="rounded border p-2" value={size} onChange={(e) => update({ size: e.target.value === String(DEFAULT_SIZE) ? '' : e.target.value })}>
          {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s} por página</option>)}
        </select>
      </div>
      {/* TODO: STATUS_OPTIONS y FRUIT_OPTIONS dependen del Swagger. */}

      {/* min-h evita que el layout salte entre loading, error, vacío y resultados. */}
      <section className="min-h-64">
        {loading && <p>Cargando...</p>}
        {error && (
          <p role="alert" className="text-red-600">
            {error} <button className="underline" onClick={() => setReloadKey((k) => k + 1)}>Reintentar</button>
          </p>
        )}
        {!loading && !error && data?.content.length === 0 && <p>Sin resultados.</p>}
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* key: React usa el id para identificar cada elemento de la lista (mejor que la posición). */}
          {data?.content.map((w) => (
            <WantedCard key={w.id} wanted={w} fromSearch={location.search} />
          ))}
        </ul>
      </section>

      <nav className="mt-4 flex items-center gap-3">
        <button className="rounded border px-3 py-1 disabled:opacity-50" disabled={page === 0 || loading} onClick={() => update({ page: String(page - 1) }, false)}>Anterior</button>
        <span>Página {page + 1} de {Math.max(totalPages, 1)}</span>
        <button className="rounded border px-3 py-1 disabled:opacity-50" disabled={!data || page + 1 >= totalPages || loading} onClick={() => update({ page: String(page + 1) }, false)}>Siguiente</button>
      </nav>
    </main>
  )
}

export default WantedPage
