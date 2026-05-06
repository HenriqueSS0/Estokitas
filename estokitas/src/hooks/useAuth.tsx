import {
  createContext, useContext, useEffect, useState,
  ReactNode, useCallback,
} from 'react';
import {
  api, getToken, setToken, removeToken,
  connectSocket, disconnectSocket,
} from '@/lib/api';

// ─── Tipos ────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  created_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar sessão existente ao montar
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api.get<{ user: AuthUser }>('/api/auth/me')
      .then(({ user }) => {
        setUser(user);
        connectSocket(user.id);
      })
      .catch(() => {
        removeToken();
      })
      .finally(() => setLoading(false));
  }, []);

  // Escutar evento de token expirado
  useEffect(() => {
    const handler = () => {
      setUser(null);
      disconnectSocket();
    };
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { token, user } = await api.post<{ token: string; user: AuthUser }>(
        '/api/auth/signup',
        { email, password }
      );
      setToken(token);
      setUser(user);
      connectSocket(user.id);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { token, user } = await api.post<{ token: string; user: AuthUser }>(
        '/api/auth/login',
        { email, password }
      );
      setToken(token);
      setUser(user);
      connectSocket(user.id);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }, []);

  const signOut = useCallback(async () => {
    removeToken();
    setUser(null);
    disconnectSocket();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await api.post('/api/auth/reset-password', { email });
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
