import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services/auth.service'
import { setUnauthorizedHandler } from '../services/api'
import { tokenStorage } from '../lib/token'
import type { LoginRequest, RegisterRequest, User } from '../types/api'

interface AuthState {
  user: User | null
  loading: boolean // true mientras comprobamos si ya había sesión al abrir la app
  login: (body: LoginRequest) => Promise<void>
  register: (body: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  // RESTAURAR SESIÓN: al montar la app (F5 o navegador reabierto) miramos si hay token.
  // Si existe, /auth/me confirma que sigue válido; si venció, el interceptor lo borra.
  // Mientras tanto "loading" evita mostrar el login a alguien que sí tenía sesión.
  useEffect(() => {
    if (!tokenStorage.get()) {
      setLoading(false)
      return
    }
    authService
      .me()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false))
  }, [])

  // Si cualquier petición recibe 401, cerramos la sesión local.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
  }, [])

  // Guardamos el token y pedimos al usuario con /auth/me: así no dependemos de la forma exacta
  // de la respuesta del login.
  const startSession = async (token: string) => {
    tokenStorage.set(token)
    setUser(await authService.me())
  }

  const login = async (body: LoginRequest) => {
    const { token } = await authService.login(body)
    await startSession(token)
  }

  // El registro crea la cuenta y entra directo a la app con la sesión iniciada.
  const register = async (body: RegisterRequest) => {
    const { token } = await authService.register(body)
    await startSession(token)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
