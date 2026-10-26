import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '../types/api';

const TOKEN_KEY = 'logpose_jwt_token';

let onUnauthorizedHandler: (() => void) | null = null;

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore localStorage errors (e.g. private browsing restrictions)
  }
};

export const onUnauthorized = (handler: () => void): (() => void) => {
  onUnauthorizedHandler = handler;
  return () => {
    if (onUnauthorizedHandler === handler) {
      onUnauthorizedHandler = null;
    }
  };
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://logpose-api-jg7f.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // Token invalid or expired
      setAuthToken(null);
      if (onUnauthorizedHandler) {
        onUnauthorizedHandler();
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a friendly error message from an API error response.
 */
export const getErrorMessage = (error: unknown, fallback = 'Ha ocurrido un error inesperado'): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiErrorResponse | undefined;
    if (apiError?.message) {
      return apiError.message;
    }
    if (error.code === 'ECONNABORTED') {
      return 'La solicitud tardó demasiado tiempo en responder.';
    }
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

/**
 * Extracts validation error field map (field -> message) from a 400 response.
 */
export const getValidationErrors = (error: unknown): Record<string, string> => {
  const result: Record<string, string> = {};
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiErrorResponse | undefined;
    if (apiError?.details && Array.isArray(apiError.details)) {
      for (const item of apiError.details) {
        if (item.field && item.message) {
          result[item.field] = item.message;
        }
      }
    }
  }
  return result;
};
