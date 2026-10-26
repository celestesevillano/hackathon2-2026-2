import api from './api'
import type { DashboardSummary } from '../types/api'

export const dashboardService = {
  summary: async () => {
    const { data } = await api.get<DashboardSummary>('/dashboard/summary')
    return data
  },
}
