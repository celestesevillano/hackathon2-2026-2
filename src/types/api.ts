// Tipos de las respuestas de la API.
// Lo que está CONFIRMADO por el enunciado: nombres de endpoints y parámetros, y que las listas paginadas
// traen content/totalElements/totalPages/page/size y el feed trae items/nextCursor/hasMore.
// Lo que es SUPOSICIÓN (marcado con TODO): los campos de cada objeto. Cuando abran el Swagger
// (/docs), completen estas interfaces: es el único lugar que hay que cambiar.

export interface User {
  id?: string
  email?: string
  teamName?: string
  teamCode?: string // el código (ej. TEAM-007) lo asigna el backend al registrar
  [field: string]: unknown // TODO: reemplazar por los campos reales de /auth/me
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  teamName: string
  email: string
  password: string
}

// Solo asumimos que el login/registro devuelve el token; el usuario se obtiene luego con /auth/me.
export interface AuthResponse {
  token: string
}

// Respuesta paginada por página (CP2: /wanted). La página empieza en 0.
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

// Respuesta paginada por cursor (CP4: /news/feed).
export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

export interface DashboardSummary {
  team: { code: string; name: string }
  wanted: {
    total: number
    totalBounty: number
    averageBounty: number
    byStatus: Record<string, number>
    byFruit: Record<string, number>
  }
  crews: {
    total: number
    mostWanted: {
      id: string
      name: string
      shipName: string
      jollyRogerColor: string
      memberCount: number
      totalBounty: number
    }
  }
  topBounties: TopBounty[]
  generatedAt: string
}

export interface TopBounty {
  id: string
  name: string
  epithet: string
  bounty: number
  status: string
  crew: { id: string; name: string }
  role: string
  devilFruit: { name: string; type: string } | null
  threatLevel: number
  lastSeenIsland: string
  updatedAt: string
}

export interface LogPoseState {
  status: string
  grandLineUnlocked: boolean
  unlockedAt: string | null
  message: string
}

export interface Crew {
  id: string
  name: string // TODO: confirmar con el Swagger
}

export interface Wanted {
  id: string
  name: string // TODO: completar (epíteto, recompensa, estado, tripulación, fruta...)
  [field: string]: unknown
}

export interface NewsItem {
  id: string
  title?: string // TODO: completar con los campos reales de la noticia
}

// Cuerpo de error de la API (formato único de toda la API). `details` solo viene en 400 VALIDATION_ERROR.
export interface ApiErrorBody {
  status?: number
  code?: string
  message?: string
  traceId?: string
  details?: { field: string; message: string }[]
}
