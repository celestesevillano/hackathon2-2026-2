import { Link } from 'react-router-dom'
import type { WantedSummary } from '../types/api'

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
      <Link to={`/wanted/${wanted.id}`} state={{ search: fromSearch }} className="underline">
        {wanted.name}
      </Link>
    </li>
  )
}

export default WantedCard
