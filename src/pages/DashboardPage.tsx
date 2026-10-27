import { useCallback, useEffect, useState } from 'react'
import { dashboardService } from '../services/dashboard.service'
import { getErrorMessage } from '../services/api'
import type { DashboardSummary, LogPose } from '../types/api'
import GrandLineMap from '../components/GrandLineMap'
import { STATUS_LABELS, formatBounty } from '../lib/wantedFilters'

interface StatCardProps {
  label: string
  value: string
  detail?: string
}

function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="rounded border p-3">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-xl font-semibold">{value}</dd>
      {detail && <p className="text-sm text-slate-500">{detail}</p>}
    </div>
  )
}

function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [logPose, setLogPose] = useState<LogPose | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Se pide el resumen y el estado del Log Pose juntos. useCallback permite reutilizar la función
  // en el botón "Reintentar" sin recrearla en cada render.
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [s, l] = await Promise.all([dashboardService.getSummary(), dashboardService.getLogPose()])
      setSummary(s)
      setLogPose(l)
    } catch (e) {
      setError(getErrorMessage(e, 'No se pudieron cargar los indicadores.'))
    } finally {
      setLoading(false)
    }
  }, [])

  // [] = pedir los datos UNA vez al montar la pantalla.
  useEffect(() => {
    void load()
  }, [load])

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Dashboard{summary ? ` - ${summary.team.name}` : ''}</h1>
      {/* Siempre manejamos los tres estados: cargando, error (con reintento) y datos. */}
      {loading && <p>Cargando...</p>}
      {error && (
        <p role="alert" className="text-red-600">
          {error} <button className="underline" onClick={() => void load()}>Reintentar</button>
        </p>
      )}

      {summary && (
        <>
          <dl className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <StatCard label="Tripulación" value={summary.team.name} detail={summary.team.code} />
            <StatCard label="Buscados" value={summary.wanted.total.toLocaleString('es-PE')} />
            <StatCard label="Tripulaciones" value={summary.crews.total.toLocaleString('es-PE')} />
            <StatCard label="Recompensa total" value={formatBounty(summary.wanted.totalBounty)} />
            <StatCard label="Recompensa promedio" value={formatBounty(summary.wanted.averageBounty)} />
            {summary.crews.mostWanted && (
              <StatCard
                label="Tripulación más buscada"
                value={summary.crews.mostWanted.name}
                detail={`${summary.crews.mostWanted.shipName} · ${summary.crews.mostWanted.memberCount} miembros`}
              />
            )}
          </dl>

          <section className="mt-6">
            <h2 className="mb-2 font-semibold">Buscados por estado</h2>
            <ul className="flex flex-wrap gap-3">
              {Object.entries(summary.wanted.byStatus).map(([status, count]) => (
                <li key={status} className="rounded border px-3 py-1">
                  {STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status}:{' '}
                  <strong>{count.toLocaleString('es-PE')}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="mb-2 font-semibold">Mayores recompensas</h2>
            <ol className="flex flex-col gap-2">
              {summary.topBounties.map((b) => (
                <li key={b.id} className="rounded border p-3">
                  <p className="font-semibold">{b.name} <span className="font-normal text-slate-500">"{b.epithet}"</span></p>
                  <p className="text-sm text-slate-600">
                    {formatBounty(b.bounty)} · {b.crew.name} · visto en {b.lastSeenIsland}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <GrandLineMap islands={[...new Set(summary.topBounties.map((b) => b.lastSeenIsland))]} />
        </>
      )}

      {logPose && (
        <section className={`mt-6 rounded border p-3 ${logPose.grandLineUnlocked ? 'border-green-600' : 'border-amber-500'}`}>
          <h2 className="font-semibold">Log Pose: {logPose.grandLineUnlocked ? 'Grand Line desbloqueada' : 'Bloqueado'}</h2>
          <p className="text-sm">{logPose.message}</p>
          {logPose.unlockedAt && <p className="text-sm text-slate-500">Desde {new Date(logPose.unlockedAt).toLocaleString('es-PE')}</p>}
        </section>
      )}
    </main>
  )
}

export default DashboardPage
