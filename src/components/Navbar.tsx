import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Igual que en el lab de la Semana 10: un Navbar con <Link> que aparece en todas las páginas.
// <Link> navega sin recargar la página (un <a> normal recargaría todo y perdería el estado).
function Navbar() {
  const { user, logout } = useAuth()

  if (!user) return null // sin sesión no mostramos navegación

  return (
    <nav className="flex items-center gap-4 border-b p-4">
      <span className="font-bold">Grand Line</span>
      <ul className="flex flex-1 gap-4">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/wanted">Se busca</Link></li>
        <li><Link to="/news">Noticias</Link></li>
      </ul>
      <button className="rounded border px-3 py-1" onClick={logout}>Cerrar sesión</button>
    </nav>
  )
}

export default Navbar
