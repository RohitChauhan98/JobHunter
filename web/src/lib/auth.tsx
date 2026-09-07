'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth as authApi, setToken, getToken, setOnUnauthorized, ApiError } from '@/lib/api';

interface User {
  id: string;
  email: string;
  createdAt: string;
  plan?: string;
  planInterval?: string;
  planExpiresAt?: string | null;
  planName?: string;
  isPaid?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // Clear session on any API 401
  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
    });
    return () => setOnUnauthorized(null);
  }, []);

  // Check token on mount — only clear on auth failures, not network blips
  useEffect(() => {
    const tok = getToken();
    if (tok) {
      authApi
        .me()
        .then(setUser)
        .catch((err) => {
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            setToken(null);
            setUser(null);
          }
          // Network / 5xx: keep token; user can retry
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email.trim().toLowerCase(), password);
    setToken(result.token);
    setUser(result.user);
  };

  const register = async (email: string, password: string) => {
    const result = await authApi.register(email.trim().toLowerCase(), password);
    setToken(result.token);
    setUser(result.user);
  };

  const refreshUser = async () => {
    const tok = getToken();
    if (!tok) {
      setUser(null);
      return;
    }
    const me = await authApi.me();
    setUser(me);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
