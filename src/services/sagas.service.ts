import { api } from './api';
import type { SagaStory, SagaSummary } from '../types/api';

export const sagasService = {
  async getSagas(signal?: AbortSignal): Promise<SagaSummary[]> {
    const response = await api.get<SagaSummary[]>('/sagas', { signal });
    return response.data;
  },

  async getSagaStory(id: string, signal?: AbortSignal): Promise<SagaStory> {
    const response = await api.get<SagaStory>(`/sagas/${encodeURIComponent(id)}/story`, {
      signal,
    });
    return response.data;
  },
};
