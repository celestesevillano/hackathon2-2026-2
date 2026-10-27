import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { sagasService } from '../services/sagas.service';
import { getErrorMessage } from '../services/api';
import { SAMPLE_STORY } from '../lib/sagasMockData';
import { SagaMap } from '../components/SagaMap';
import type { SagaStory } from '../types/api';

function SagaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [story, setStory] = useState<SagaStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSampleData, setIsSampleData] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const stageRefs = useRef<(HTMLElement | null)[]>([]);
  const isScrollingToStage = useRef(false);

  // Carga de la historia desde la API (con fallback a OpenAPI si la API devuelve 423)
  const loadStory = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    setIsSampleData(false);
    try {
      const data = await sagasService.getSagaStory(id);
      setStory(data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 423) {
        setStory(SAMPLE_STORY);
        setIsSampleData(true);
      } else {
        setError(getErrorMessage(err, 'No se pudo cargar la historia de la saga.'));
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadStory();
  }, [loadStory]);

  // Si la URL trae ?stage=slug, buscamos el índice inicial
  useEffect(() => {
    if (!story) return;
    const stageParam = searchParams.get('stage');
    if (stageParam) {
      const foundIdx = story.stages.findIndex(
        (s) => s.slug === stageParam || s.id === stageParam || String(s.order) === stageParam
      );
      if (foundIdx !== -1) {
        setActiveStageIndex(foundIdx);
        // Scroll directo al montar si se abrió la URL con esa etapa
        const el = stageRefs.current[foundIdx];
        if (el) {
          isScrollingToStage.current = true;
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            isScrollingToStage.current = false;
          }, 800);
        }
      }
    }
  }, [story, searchParams]);

  // Función para cambiar de etapa programáticamente (clic en mapa, botones o teclado)
  const scrollToStage = useCallback(
    (index: number) => {
      if (!story || index < 0 || index >= story.stages.length) return;
      setActiveStageIndex(index);
      const targetStage = story.stages[index];
      setSearchParams({ stage: targetStage.slug }, { replace: true });

      const el = stageRefs.current[index];
      if (el) {
        isScrollingToStage.current = true;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          isScrollingToStage.current = false;
        }, 600);
      }
    },
    [story, setSearchParams]
  );

  // IntersectionObserver: Activa la etapa según el scroll del usuario
  useEffect(() => {
    if (!story || stageRefs.current.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingToStage.current) return;

        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index) && index !== activeStageIndex) {
              setActiveStageIndex(index);
              const slug = story.stages[index]?.slug;
              if (slug) {
                setSearchParams({ stage: slug }, { replace: true });
              }
            }
          }
        }
      },
      {
        root: null,
        rootMargin: '-30% 0px -40% 0px',
        threshold: 0.1,
      }
    );

    stageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [story, activeStageIndex, setSearchParams]);

  // Navegación por teclado (Flechas Arriba/Abajo/Izquierda/Derecha)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) {
        if (story && activeStageIndex < story.stages.length - 1) {
          e.preventDefault();
          scrollToStage(activeStageIndex + 1);
        }
      } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        if (story && activeStageIndex > 0) {
          e.preventDefault();
          scrollToStage(activeStageIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [story, activeStageIndex, scrollToStage]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center p-6 text-slate-500">
        <p className="animate-pulse text-xl">Sintonizando el Log Pose con la saga...</p>
      </main>
    );
  }

  if (error || !story) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          <h2 className="text-xl font-bold">Error</h2>
          <p className="mt-2">{error || 'No se encontró la historia de esta saga.'}</p>
          <div className="mt-4 flex gap-4">
            <button
              type="button"
              onClick={() => void loadStory()}
              className="rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
            >
              Reintentar
            </button>
            <Link to="/sagas" className="rounded border px-4 py-2 text-slate-700 hover:bg-slate-100">
              Volver a Sagas
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const activeStage = story.stages[activeStageIndex] ?? story.stages[0];
  const totalStages = story.stages.length;
  const progressPercent = Math.round(((activeStageIndex + 1) / totalStages) * 100);

  return (
    <div
      className="min-h-screen transition-colors duration-700"
      style={{
        backgroundColor: activeStage.palette.background,
        color: activeStage.palette.text,
      }}
    >
      {/* Barra de progreso de lectura (CSS Scroll-driven animation con fallback) */}
      <div className="fixed top-0 left-0 z-50 h-1.5 w-full bg-black/20">
        <div
          className="h-full scroll-progress-bar transition-all duration-300"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: activeStage.palette.accent,
          }}
        />
      </div>

      {/* Header superior con datos de la saga y controles accesibles */}
      <header
        className="sticky top-0 z-40 border-b px-6 py-3 backdrop-blur-md transition-colors duration-500"
        style={{
          backgroundColor: `${activeStage.palette.surface}ea`,
          borderColor: `${activeStage.palette.primary}44`,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/sagas"
              className="rounded-lg border px-3 py-1 text-sm font-semibold transition hover:opacity-80"
              style={{
                borderColor: activeStage.palette.primary,
                color: activeStage.palette.text,
              }}
            >
              ← Sagas
            </Link>
            <div>
              <h1 className="font-bold text-base md:text-lg">{story.saga.title}</h1>
              <p className="text-xs opacity-75">{story.saga.subtitle}</p>
            </div>
          </div>

          {/* Controles de navegación de etapas por teclado/clic */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="hidden text-xs opacity-75 sm:inline">
              Navega con flechas ↑ ↓ o botones:
            </span>
            <button
              type="button"
              disabled={activeStageIndex === 0}
              onClick={() => scrollToStage(activeStageIndex - 1)}
              aria-label="Etapa anterior"
              className="rounded border px-2.5 py-1 text-xs font-semibold disabled:opacity-30"
              style={{ borderColor: activeStage.palette.primary }}
            >
              ← Anterior
            </button>
            <span className="px-1 text-xs font-mono">
              {activeStageIndex + 1}/{totalStages}
            </span>
            <button
              type="button"
              disabled={activeStageIndex === totalStages - 1}
              onClick={() => scrollToStage(activeStageIndex + 1)}
              aria-label="Etapa siguiente"
              className="rounded border px-2.5 py-1 text-xs font-semibold disabled:opacity-30"
              style={{ borderColor: activeStage.palette.primary }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </header>

      {isSampleData && (
        <div className="bg-amber-500/20 px-6 py-2 text-center text-xs font-semibold">
          Mostrando datos de contrato Swagger (Grand Line 423 LOG_POSE_REQUIRED hasta aprobar CP3).
        </div>
      )}

      {/* Contenedor Scrollytelling en dos columnas: Mapa Persistente + Narrativa */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 p-6 lg:grid-cols-12">
        {/* Columna Izquierda: Mapa Persistente y Métricas de la etapa activa (Sticky) */}
        <section className="lg:sticky lg:top-20 lg:col-span-6 lg:self-start">
          <div className="flex flex-col gap-4">
            {/* Mapa Interactivo SVG */}
            <SagaMap
              width={story.map.width}
              height={story.map.height}
              stages={story.stages}
              activeStageIndex={activeStageIndex}
              palette={activeStage.palette}
              onSelectStage={scrollToStage}
            />

            {/* Panel de Métricas de la Etapa Activa */}
            <div
              className="rounded-2xl border p-4 transition-colors duration-500 shadow-sm"
              style={{
                backgroundColor: activeStage.palette.surface,
                borderColor: `${activeStage.palette.primary}44`,
              }}
            >
              <div className="flex items-center justify-between border-b pb-2 text-xs uppercase tracking-wider opacity-80">
                <span>Indicadores de la Isla</span>
                <span className="font-bold" style={{ color: activeStage.palette.accent }}>
                  {activeStage.island.name}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {activeStage.metrics.map((m) => (
                  <div key={m.key} className="rounded-lg p-2 bg-black/10">
                    <dt className="text-[11px] opacity-75">{m.label}</dt>
                    <dd className="mt-1 font-bold text-sm sm:text-base">
                      {typeof m.value === 'number' ? m.value.toLocaleString('es-PE') : m.value}{' '}
                      <span className="text-xs font-normal opacity-75">{m.unit}</span>
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Columna Derecha: Narrativa de las Etapas con Scroll */}
        <section className="lg:col-span-6 flex flex-col gap-24 py-8">
          {/* Prólogo / Introducción */}
          <div
            className="rounded-2xl border p-6 shadow-sm"
            style={{
              backgroundColor: activeStage.palette.surface,
              borderColor: `${activeStage.palette.primary}33`,
            }}
          >
            <span className="text-xs uppercase tracking-widest opacity-70">Prólogo de la Saga</span>
            <p className="mt-2 text-base italic leading-relaxed">{story.saga.intro}</p>
          </div>

          {/* Tarjetas de cada etapa narrativa activadas por scroll */}
          {story.stages.map((stage, idx) => {
            const isActive = idx === activeStageIndex;

            return (
              <article
                key={stage.id}
                id={`stage-${stage.slug}`}
                data-index={idx}
                ref={(el) => {
                  stageRefs.current[idx] = el;
                }}
                tabIndex={0}
                aria-label={`Etapa ${stage.order}: ${stage.title}`}
                className={`scroll-mt-32 rounded-3xl border p-8 transition-all duration-500 focus:outline-none focus-visible:ring-2 ${
                  isActive
                    ? 'scale-100 opacity-100 shadow-xl'
                    : 'scale-95 opacity-40 shadow-none hover:opacity-70'
                }`}
                style={{
                  backgroundColor: stage.palette.surface,
                  borderColor: isActive ? stage.palette.accent : `${stage.palette.primary}33`,
                  color: stage.palette.text,
                }}
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest opacity-80">
                  <span>
                    Etapa {stage.order} de {totalStages}
                  </span>
                  <span
                    className="rounded-full px-3 py-1 font-mono text-[11px]"
                    style={{
                      backgroundColor: `${stage.palette.primary}33`,
                      color: stage.palette.accent,
                    }}
                  >
                    📍 {stage.island.name}
                  </span>
                </div>

                <h2 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight">
                  {stage.title}
                </h2>

                <div className="mt-6 flex flex-col gap-4 text-base md:text-lg leading-relaxed opacity-95">
                  {stage.narrative.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>

                {/* Métricas inline de la etapa */}
                <div
                  className="mt-8 border-t pt-4 text-xs"
                  style={{ borderColor: `${stage.palette.text}22` }}
                >
                  <div className="flex flex-wrap gap-4 opacity-80">
                    {stage.metrics.map((metric) => (
                      <span key={metric.key}>
                        <strong>{metric.label}:</strong> {metric.value.toLocaleString('es-PE')}{' '}
                        {metric.unit}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}

          <footer className="text-center text-sm opacity-60 py-12">
            Fin de la travesía de esta saga. El Log Pose apunta a nuevas aguas.
          </footer>
        </section>
      </main>
    </div>
  );
}

export default SagaDetailPage;
