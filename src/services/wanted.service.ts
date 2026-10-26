import api from './api'
import type { Page, Wanted } from '../types/api'

// Valores que acepta el enunciado para ordenar y para el tamaño de página.
export const SORT_OPTIONS = ['bounty,desc', 'name,asc', 'updatedAt,desc'] as const
export const SIZE_OPTIONS = [10, 20, 50] as const

export interface WantedQuery {
  page: number // empieza en 0
  size: number
  sort: string
  q?: string // búsqueda por nombre o epíteto: la resuelve el BACKEND
  status?: string
  crewId?: string
  fruit?: string
}

export const wantedService = {
  // Una sola función parametrizada: no hay un endpoint por página.
  list: async (params: WantedQuery, signal?: AbortSignal) => {
    // Los filtros vacíos se omiten para no mandar "q=" al servidor.
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined),
    )
    const { data } = await api.get<Page<Wanted>>('/wanted', { params: clean, signal })
    return data
  },
  detail: async (id: string, signal?: AbortSignal) => {
    const { data } = await api.get<Wanted>(`/wanted/${id}`, { signal })
    return data
  },
}
