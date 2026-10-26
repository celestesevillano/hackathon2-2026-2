import { api } from './api';
import type {
  Crew,
  WantedDetail,
  WantedPage,
  WantedQueryParams,
} from '../types/api';

export const wantedService = {
  async getWanted(params?: WantedQueryParams, signal?: AbortSignal): Promise<WantedPage> {
    const cleanParams: Record<string, string | number> = {};

    if (params) {
      if (params.page !== undefined && params.page !== null) cleanParams.page = params.page;
      if (params.size !== undefined && params.size !== null) cleanParams.size = params.size;
      if (params.status) cleanParams.status = params.status;
      if (params.crewId) cleanParams.crewId = params.crewId;
      if (params.fruit) cleanParams.fruit = params.fruit;
      if (params.q && params.q.trim()) cleanParams.q = params.q.trim();
      if (params.sort) cleanParams.sort = params.sort;
    }

    const response = await api.get<WantedPage>('/wanted', {
      params: cleanParams,
      signal,
    });
    return response.data;
  },

  async getWantedById(id: string, signal?: AbortSignal): Promise<WantedDetail> {
    const response = await api.get<WantedDetail>(`/wanted/${encodeURIComponent(id)}`, {
      signal,
    });
    return response.data;
  },

  async getCrews(signal?: AbortSignal): Promise<Crew[]> {
    const response = await api.get<Crew[]>('/crews', { signal });
    return response.data;
  },
};
