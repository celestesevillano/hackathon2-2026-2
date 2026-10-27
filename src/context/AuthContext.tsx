import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '../services/auth.service';
import {
  getAuthToken,
  onUnauthorized,
  setAuthToken,
} from '../services/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Team,
  User,
} from '../types/api';

export interface AuthContextType {
  user: User | null;
  team: Team | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<LoginResponse>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setTeam(null);
  }, []);

  const refreshSession = useCallback(async () => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      setUser(null);
      setTeam(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await authService.getMe();
      setUser(me.user);
      setTeam(me.team);
      setToken(storedToken);
    } catch {
      // Token is invalid, expired, or server rejected it
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    // Initial session restoration on mount
    refreshSession();

    // Listen to automatic 401s from axios interceptor
    const unsubscribe = onUnauthorized(() => {
      logout();
    });

    return () => {
      unsubscribe();
    };
  }, [refreshSession, logout]);

  const login = useCallback(async (credentials: LoginRequest): Promise<LoginResponse> => {
    const res = await authService.login(credentials);
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setTeam(res.team);
    return res;
  }, []);

  const register = useCallback(async (data: RegisterRequest): Promise<LoginResponse> => {
    const res = await authService.register(data);
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setTeam(res.team);
    return res;
  }, []);

  const value: AuthContextType = {
    user,
    team,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
