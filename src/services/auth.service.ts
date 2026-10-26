import { api } from './api';
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterRequest,
} from '../types/api';

export const authService = {
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  async getMe(signal?: AbortSignal): Promise<MeResponse> {
    const response = await api.get<MeResponse>('/auth/me', { signal });
    return response.data;
  },
};
