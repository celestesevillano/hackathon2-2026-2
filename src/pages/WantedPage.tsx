import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { useLocation, useSearchParams } from 'react-router-dom'
import { wantedService } from '../services/wanted.service'
import { getErrorMessage } from '../services/api'
import WantedCard from '../components/WantedCard'
import {
  DEFAULT_SIZE,
  DEFAULT_SORT,
  FRUIT_LABELS,
  SIZE_OPTIONS,
  SORT_OPTIONS,
  STATUS_LABELS,
  isFruit,
  isSize,
  isSort,
  isStatus,
} from '../lib/wantedFilters'
import type { Crew, FruitFilter, WantedPage as WantedPageData, WantedSort, WantedStatus } from '../types/api'

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

  // Cada valor se valida contra lo que la API acepta: lo inválido se ignora y se usa el valor por defecto.
  const page = readInt(params.get('page'), 0)
  const rawSize = readInt(params.get('size'), DEFAULT_SIZE)
  const size = isSize(rawSize) ? rawSize : DEFAULT_SIZE
  const rawSort = params.get('sort') ?? ''
  const sort: WantedSort = isSort(rawSort) ? rawSort : DEFAULT_SORT
  const q = (params.get('q') ?? '').slice(0, 100) // la API acepta máximo 100 caracteres
  const rawStatus = params.get('status') ?? ''
  const status: WantedStatus | '' = isStatus(rawStatus) ? rawStatus : ''
  const rawFruit = params.get('fruit') ?? ''
  const fruit: FruitFilter | '' = isFruit(rawFruit) ? rawFruit : ''
  const crewId = params.get('crewId') ?? ''

  const [searchInput, setSearchInput] = useState(q) // lo que se escribe; la URL se actualiza con debounce
  const [data, setData] = useState<WantedPageData | null>(null)
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
    const controller = new AbortController()
    wantedService
      .getCrews(controller.signal)
      .then(setCrews)
      .catch(() => setCrews([]))
    return () => controller.abort()
  }, [])

  // Cada cambio de parámetros vuelve a pedir al servidor (paginación REAL del servidor).
  // AbortController: si cambias rápido, cancelamos la petición vieja para que su respuesta tardía
  // no pise a la nueva (protección contra respuestas antiguas).
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    wantedService
      .getWanted(
        { page, size, sort, q, status: status || undefined, crewId, fruit: fruit || undefined },
        controller.signal,
      )
      .then(setData)
      .catch((e) => {
        if (!axios.isCancel(e)) setError(getErrorMessage(e, 'No se pudo cargar la lista.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [page, size, sort, q, status, crewId, fruit, reloadKey])

  // Si la página actual ya no existe (la API responde 200 con la lista vacía), saltamos a la última
  // página válida en vez de dejar al usuario en una página vacía.
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
        <input className="rounded border p-2 md:col-span-3" placeholder="Buscar por nombre o epíteto..." maxLength={100} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <select className="rounded border p-2" aria-label="Estado" value={status} onChange={(e) => update({ status: e.target.value })}>
          <option value="">Estado: todos</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="rounded border p-2" aria-label="Tripulación" value={crewId} onChange={(e) => update({ crewId: e.target.value })}>
          <option value="">Tripulación: todas</option>
          {crews.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="rounded border p-2" aria-label="Fruta del diablo" value={fruit} onChange={(e) => update({ fruit: e.target.value })}>
          <option value="">Fruta: todas</option>
          {Object.entries(FRUIT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="rounded border p-2" aria-label="Orden" value={sort} onChange={(e) => update({ sort: e.target.value === DEFAULT_SORT ? '' : e.target.value })}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className="rounded border p-2" aria-label="Tamaño de página" value={size} onChange={(e) => update({ size: e.target.value === String(DEFAULT_SIZE) ? '' : e.target.value })}>
          {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s} por página</option>)}
        </select>
      </div>

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
        <span>Página {page + 1} de {Math.max(totalPages, 1)}{data ? ` · ${data.totalElements.toLocaleString('es-PE')} buscados` : ''}</span>
        <button className="rounded border px-3 py-1 disabled:opacity-50" disabled={!data || page + 1 >= totalPages || loading} onClick={() => update({ page: String(page + 1) }, false)}>Siguiente</button>
      </nav>
    </main>
  )
}

export default WantedPage
