import axios from 'axios'
import type { ApiErrorBody } from '../types/api'

// Mensajes en español para los códigos de error que el frontend debe distinguir.
const CODE_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_REGISTERED: 'Ese correo ya está registrado.',
  TEAM_NAME_TAKEN: 'Ese nombre de tripulación ya está en uso.',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
}

// Código de error -> campo del formulario al que se asocia.
const CODE_FIELDS: Record<string, string> = {
  EMAIL_ALREADY_REGISTERED: 'email',
  TEAM_NAME_TAKEN: 'teamName',
}

// Convierte un error de Axios en un mensaje general y errores por campo.
export function parseApiError(error: unknown): { message: string; fields: Record<string, string> } {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data
    const fields: Record<string, string> = {}
    for (const d of body?.details ?? []) fields[d.field] = d.message
    const code = body?.code
    if (code && CODE_FIELDS[code]) fields[CODE_FIELDS[code]] = CODE_MESSAGES[code]
    const message = (code && CODE_MESSAGES[code]) || body?.message || 'No se pudo completar la solicitud.'
    return { message, fields }
  }
  return { message: 'No se pudo completar la solicitud.', fields: {} }
}
