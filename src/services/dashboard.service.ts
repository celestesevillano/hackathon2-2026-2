import { api } from './api';
import type { DashboardSummary, LogPose } from '../types/api';

export const dashboardService = {
  async getSummary(signal?: AbortSignal): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>('/dashboard/summary', { signal });
    return response.data;
  },

  async getLogPose(signal?: AbortSignal): Promise<LogPose> {
    const response = await api.get<LogPose>('/log-pose', { signal });
    return response.data;
  },
};
