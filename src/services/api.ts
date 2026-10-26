import axios from 'axios'
import { tokenStorage } from '../lib/token'

// Una sola instancia con la baseURL: así no repetimos la URL ni el header en cada llamada.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Interceptor de REQUEST: corre antes de CADA petición.
// Si hay token, lo agrega como "Authorization: Bearer <token>" (igual que en Postman).
api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de RESPONSE: si el token venció (401) lo borramos y avisamos a la app
// para que mande al login. Así ninguna pantalla tiene que repetir esta lógica.
let onUnauthorized: () => void = () => {}
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      tokenStorage.clear()
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

export default api
