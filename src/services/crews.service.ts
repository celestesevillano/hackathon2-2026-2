import api from './api'
import type { Crew, Page } from '../types/api'

export const crewsService = {
  // TODO: confirmar en el Swagger si /crews devuelve una lista o una página; aquí aceptamos ambas.
  list: async () => {
    const { data } = await api.get<Crew[] | Page<Crew>>('/crews')
    return Array.isArray(data) ? data : data.content
  },
}
