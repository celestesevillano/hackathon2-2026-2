import api from './api'
import type { CursorPage, NewsItem } from '../types/api'

// Grand Line: responde 423 LOG_POSE_REQUIRED hasta aprobar el CP3.
export const newsService = {
  feed: async (cursor: string | null, signal?: AbortSignal) => {
    const { data } = await api.get<CursorPage<NewsItem>>('/news/feed', {
      params: cursor ? { cursor } : {},
      signal,
    })
    return data
  },
}
