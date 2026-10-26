import api from './api'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/api'

// Los *.service.ts son TypeScript puro (no .tsx) porque no son componentes:
// solo agrupan las llamadas HTTP de un tema.
export const authService = {
  register: async (body: RegisterRequest) => {
    const { data } = await api.post<AuthResponse>('/auth/register', body)
    return data
  },
  // El login es con email y password (el código de equipo lo asigna el backend al registrar).
  login: async (body: LoginRequest) => {
    const { data } = await api.post<AuthResponse>('/auth/login', body)
    return data
  },
  // Sirve para restaurar la sesión: si el token es válido devuelve al usuario.
  me: async () => {
    const { data } = await api.get<User>('/auth/me')
    return data
  },
}
