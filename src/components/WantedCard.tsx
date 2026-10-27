import { Link } from 'react-router-dom'
import type { WantedSummary } from '../types/api'
import { FRUIT_LABELS, STATUS_LABELS, formatBounty } from '../lib/wantedFilters'

// Igual que el componente Course de la clase: las props se describen con una interface
// (un "contrato" de la forma de los datos) y se leen con llaves.
interface WantedCardProps {
  wanted: WantedSummary
  fromSearch: string // los filtros actuales de la URL, para poder volver exactamente igual
}

function WantedCard({ wanted, fromSearch }: WantedCardProps) {
  return (
    <li className="rounded border p-3">
      {/* state: pasa la URL de origen al detalle para que el botón "Volver" restaure el listado. */}
      <Link to={`/wanted/${wanted.id}`} state={{ search: fromSearch }} className="font-semibold underline">
        {wanted.name}
      </Link>{' '}
      <span className="text-slate-500">"{wanted.epithet}"</span>
      <p className="text-sm">{formatBounty(wanted.bounty)} · {STATUS_LABELS[wanted.status]}</p>
      <p className="text-sm text-slate-600">
        {wanted.crew.name} · {wanted.devilFruit ? FRUIT_LABELS[wanted.devilFruit.type] : FRUIT_LABELS.NONE}
      </p>
    </li>
  )
}

export default WantedCard
