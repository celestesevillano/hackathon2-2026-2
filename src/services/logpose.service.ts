import api from './api'
import type { LogPoseState } from '../types/api'

export const logPoseService = {
  get: async () => {
    const { data } = await api.get<LogPoseState>('/log-pose')
    return data
  },
}
