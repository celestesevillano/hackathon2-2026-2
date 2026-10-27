import type { NewsPriority, NewsStatus, NewsType } from '../types/api'

// Valores permitidos por el contrato (openapi.json). Si la URL trae otro valor, lo ignoramos
// en vez de mandarlo a la API, que respondería 400.
export const TYPE_LABELS: Record<NewsType, string> = {
  BOUNTY_UPDATE: 'Recompensas',
  BATTLE: 'Batallas',
  MARINE_OPERATION: 'Operaciones de la Marina',
  WORLD_GOVERNMENT: 'Gobierno Mundial',
  DISCOVERY: 'Descubrimientos',
}

export const PRIORITY_LABELS: Record<NewsPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

export const NEWS_STATUS_LABELS: Record<NewsStatus, string> = {
  RUMOR: 'Rumor',
  CONFIRMED: 'Confirmada',
  DEBUNKED: 'Desmentida',
}

export const isNewsType = (v: string): v is NewsType => v in TYPE_LABELS
export const isNewsPriority = (v: string): v is NewsPriority => v in PRIORITY_LABELS
export const isNewsStatus = (v: string): v is NewsStatus => v in NEWS_STATUS_LABELS
