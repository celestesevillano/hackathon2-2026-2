// Guardamos el JWT en localStorage porque sobrevive a F5 y a cerrar/reabrir el
// navegador, que es justo lo que pide "restaurar sesión".
const TOKEN_KEY = 'JWT'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}
