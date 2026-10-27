import type { FruitFilter, WantedSort, WantedStatus } from '../types/api'

// Valores permitidos por el contrato de la API (openapi.json). Si la URL trae otro valor,
// la API respondería 400, así que antes de pedir nada validamos contra estas listas.
export const SIZE_OPTIONS = [10, 20, 50] as const
export const DEFAULT_SIZE = 20

export const SORT_OPTIONS: { value: WantedSort; label: string }[] = [
  { value: 'bounty,desc', label: 'Mayor recompensa' },
  { value: 'name,asc', label: 'Nombre (A-Z)' },
  { value: 'updatedAt,desc', label: 'Más recientes' },
]
export const DEFAULT_SORT: WantedSort = 'bounty,desc'

export const STATUS_LABELS: Record<WantedStatus, string> = {
  AT_LARGE: 'Libre',
  CAPTURED: 'Capturado',
  MISSING: 'Desaparecido',
}

export const FRUIT_LABELS: Record<FruitFilter, string> = {
  PARAMECIA: 'Paramecia',
  ZOAN: 'Zoan',
  LOGIA: 'Logia',
  NONE: 'Sin fruta',
}

export const isStatus = (v: string): v is WantedStatus => v in STATUS_LABELS
export const isFruit = (v: string): v is FruitFilter => v in FRUIT_LABELS
export const isSort = (v: string): v is WantedSort => SORT_OPTIONS.some((o) => o.value === v)
export const isSize = (n: number): n is (typeof SIZE_OPTIONS)[number] =>
  (SIZE_OPTIONS as readonly number[]).includes(n)

export const formatBounty = (n: number) => `${n.toLocaleString('es-PE')} berries`
