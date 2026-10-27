import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Ruta privada: si no hay sesión, manda a /login. Mientras se restaura la sesión
// mostramos "Cargando" para no botar al login a alguien que sí tenía sesión (F5).
export default function PrivateRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <p className="p-6">Cargando sesión...</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}
