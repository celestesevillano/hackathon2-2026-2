import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { parseApiError } from '../lib/apiError'

// Registro de la tripulación (CP1): crea la cuenta del equipo y entra directo con la sesión iniciada.
function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [teamName, setTeamName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    setFieldErrors({})
    try {
      await register({ teamName, email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      // Los errores del servidor (email o nombre ya registrados, datos inválidos) se muestran
      // junto al campo que corresponde.
      const parsed = parseApiError(err)
      setMessage(parsed.message)
      setFieldErrors(parsed.fields)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-bold">Registrar tripulación</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <input className="rounded border p-2" placeholder="Nombre de la tripulación" minLength={3} maxLength={40} value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
          {fieldErrors.teamName && <span role="alert" className="text-sm text-red-600">{fieldErrors.teamName}</span>}
        </label>
        <label className="flex flex-col gap-1">
          <input className="rounded border p-2" type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {fieldErrors.email && <span role="alert" className="text-sm text-red-600">{fieldErrors.email}</span>}
        </label>
        <label className="flex flex-col gap-1">
          <input className="rounded border p-2" type="password" placeholder="Contraseña" minLength={8} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} required />
          {fieldErrors.password && <span role="alert" className="text-sm text-red-600">{fieldErrors.password}</span>}
        </label>
        {message && <p role="alert" className="text-red-600">{message}</p>}
        <button className="rounded bg-slate-900 p-2 text-white disabled:opacity-50" disabled={submitting}>
          {submitting ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      <p className="mt-4 text-sm">¿Ya tienes cuenta? <Link className="underline" to="/login">Inicia sesión</Link></p>
    </main>
  )
}

export default RegisterPage
