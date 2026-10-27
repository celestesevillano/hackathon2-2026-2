import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'

interface FromState {
  from?: { pathname: string; search: string }
}

// No hay landing: la app abre directo en el login.
function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Si alguien abrió una ruta privada sin sesión, PrivateRoute guardó a dónde quería ir.
  // Después de iniciar sesión volvemos exactamente ahí (con sus filtros en la URL).
  const from = (location.state as FromState | null)?.from
  const destination = from ? `${from.pathname}${from.search}` : '/dashboard'

  if (user) return <Navigate to={destination} replace />

  // Inputs controlados: el valor vive en el estado y React es la fuente de verdad.
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault() // evita que el navegador recargue la página
    setSubmitting(true)
    setError('')
    try {
      await login({ email, password })
      navigate(destination, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-bold">Iniciar sesión</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="rounded border p-2" type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="rounded border p-2" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <button className="rounded bg-slate-900 p-2 text-white disabled:opacity-50" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="mt-4 text-sm">¿Tu tripulación aún no existe? <Link className="underline" to="/register">Regístrala</Link></p>
    </main>
  )
}

export default LoginPage
