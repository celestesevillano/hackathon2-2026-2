import { api } from './api';
import type {
  NewsDetail,
  NewsFeed,
  NewsFeedParams,
  NewsStatusUpdate,
} from '../types/api';

export const newsService = {
  async getFeed(params?: NewsFeedParams, signal?: AbortSignal): Promise<NewsFeed> {
    const cleanParams: Record<string, string | number> = {};

    if (params) {
      if (params.cursor) cleanParams.cursor = params.cursor;
      if (params.limit !== undefined && params.limit !== null) cleanParams.limit = params.limit;
      if (params.type) cleanParams.type = params.type;
      if (params.priority) cleanParams.priority = params.priority;
      if (params.status) cleanParams.status = params.status;
    }

    const response = await api.get<NewsFeed>('/news/feed', {
      params: cleanParams,
      signal,
    });
    return response.data;
  },

  async getNewsById(id: string, signal?: AbortSignal): Promise<NewsDetail> {
    const response = await api.get<NewsDetail>(`/news/${encodeURIComponent(id)}`, {
      signal,
    });
    return response.data;
  },

  async updateNewsStatus(
    id: string,
    status: 'CONFIRMED' | 'DEBUNKED',
    signal?: AbortSignal
  ): Promise<NewsDetail> {
    const body: NewsStatusUpdate = { status };
    const response = await api.patch<NewsDetail>(
      `/news/${encodeURIComponent(id)}/status`,
      body,
      { signal }
    );
    return response.data;
  },
};
