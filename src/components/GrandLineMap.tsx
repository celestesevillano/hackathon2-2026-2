import { useState } from 'react'

// Posiciones fijas (en porcentaje del mapa) donde caben hasta 6 islas.
const SLOTS = [
  { left: 12, top: 70 },
  { left: 30, top: 28 },
  { left: 50, top: 66 },
  { left: 68, top: 24 },
  { left: 84, top: 62 },
  { left: 92, top: 22 },
]

interface GrandLineMapProps {
  islands: string[]
}

// Mapa de muestra. El barco esta en una isla (estado current). Al elegir otra isla solo cambia ese numero:
// React vuelve a dibujar y CSS anima el movimiento del barco. Las islas son botones, asi que se pueden
// usar con el mouse y con el teclado (Tab para moverse, Enter o espacio para elegir).
function GrandLineMap({ islands }: GrandLineMapProps) {
  const [current, setCurrent] = useState(0)
  const places = islands.slice(0, SLOTS.length).map((name, i) => ({ name, ...SLOTS[i] }))
  if (places.length === 0) return null

  const ship = places[current] ?? places[0]

  return (
    <section className="mt-6" aria-label="Mapa del Grand Line">
      <h2 className="mb-2 font-semibold">Mapa del Grand Line</h2>
      <div className="relative h-64 overflow-hidden rounded border bg-sky-100">
        {places.map((p, i) => (
          <button
            key={p.name}
            type="button"
            onClick={() => setCurrent(i)}
            aria-pressed={i === current}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200 px-3 py-2 text-xs text-slate-900 hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-slate-900"
            style={{ left: `${p.left}%`, top: `${p.top}%` }}
          >
            {p.name}
          </button>
        ))}
        <span
          className="ship pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-3xl"
          aria-hidden="true"
          style={{ left: `${ship.left}%`, top: `${ship.top}%`, marginTop: '-2.6rem' }}
        >
          ⛵
        </span>
      </div>
      <p className="text-sm text-slate-500">Barco en: {ship.name} (mapa de muestra).</p>
    </section>
  )
}

export default GrandLineMap
