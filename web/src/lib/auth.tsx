'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth as authApi, setToken, getToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check token on mount
  useEffect(() => {
    const tok = getToken();
    if (tok) {
      authApi
        .me()
        .then(setUser)
        .catch(() => {
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    setToken(result.token);
    setUser(result.user);
  };

  const register = async (email: string, password: string) => {
    const result = await authApi.register(email, password);
    setToken(result.token);
    setUser(result.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
