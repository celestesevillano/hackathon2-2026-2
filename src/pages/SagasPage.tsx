import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { sagasService } from '../services/sagas.service';
import { getErrorMessage } from '../services/api';
import { SAMPLE_SAGAS } from '../lib/sagasMockData';
import type { SagaSummary } from '../types/api';

function SagasPage() {
  const navigate = useNavigate();
  const [sagas, setSagas] = useState<SagaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSampleData, setIsSampleData] = useState(false);

  const loadSagas = useCallback(async () => {
    setLoading(true);
    setError('');
    setIsSampleData(false);
    try {
      const data = await sagasService.getSagas();
      setSagas(data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 423) {
        // Grand Line bloqueado hasta aprobar CP3 en Reverse Mountain.
        // Cargamos los datos de ejemplo del contrato OpenAPI para permitir avanzar el CP5.
        setSagas(SAMPLE_SAGAS);
        setIsSampleData(true);
      } else {
        setError(getErrorMessage(err, 'No se pudieron cargar las sagas.'));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSagas();
  }, [loadSagas]);

  // View Transition API cuando existe soporte; navegación normal cuando no.
  const openStory = (id: string) => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      document.startViewTransition(() => {
        navigate(`/sagas/${encodeURIComponent(id)}`);
      });
    } else {
      navigate(`/sagas/${encodeURIComponent(id)}`);
    }
  };

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Poneglyphs: Las Grandes Sagas</h1>
        <p className="mt-1 text-slate-600">
          La verdadera historia del Grand Line inscrita en las piedras ancestrales.
        </p>
      </header>

      {isSampleData && (
        <aside
          role="status"
          className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900"
        >
          <div className="flex items-center gap-2 font-semibold">
            <span>🔒 Modo Previa de Reverse Mountain (CP3)</span>
          </div>
          <p className="mt-1 text-sm text-amber-800">
            La API del Grand Line está protegida hasta aprobar la inspección del Log Pose (código 423).
            Mostrando las sagas del contrato oficial Swagger para explorar el scrollytelling.
          </p>
        </aside>
      )}

      {loading && (
        <div className="flex items-center justify-center p-12 text-slate-500">
          <p className="animate-pulse text-lg">Descifrando Poneglyphs...</p>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadSagas()}
            className="mt-2 font-medium underline hover:text-red-900"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {sagas.map((saga) => (
            <article
              key={saga.id}
              className="flex flex-col justify-between overflow-hidden rounded-xl border p-6 shadow-sm transition hover:shadow-md"
              style={{
                backgroundColor: saga.palette.surface,
                borderColor: saga.palette.primary,
                color: saga.palette.text,
              }}
            >
              <div>
                <div className="flex items-center justify-between text-xs uppercase tracking-wider opacity-80">
                  <span>Saga #{saga.order}</span>
                  <span>{saga.stageCount} etapas</span>
                </div>
                <h2 className="mt-2 text-2xl font-bold">{saga.title}</h2>
                <p className="mt-1 font-medium text-sm" style={{ color: saga.palette.accent }}>
                  {saga.subtitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed opacity-90">{saga.synopsis}</p>
              </div>

              <div className="mt-6 border-t pt-4 text-xs opacity-90" style={{ borderColor: `${saga.palette.text}22` }}>
                <div className="flex justify-between py-1">
                  <span>Recorrido total:</span>
                  <span className="font-semibold">{saga.totalDistanceNm.toLocaleString('es-PE')} mn</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Ruta:</span>
                  <span className="font-semibold truncate max-w-[240px]">
                    {saga.firstIsland} → {saga.lastIsland}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openStory(saga.id)}
                  className="mt-4 w-full rounded-lg px-4 py-2 font-semibold text-center transition focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    backgroundColor: saga.palette.primary,
                    color: saga.palette.background,
                  }}
                >
                  Explorar Historia y Mapa →
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default SagasPage;
