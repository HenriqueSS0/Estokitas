import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || '';

// ── Token helpers ─────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('auth_token');
}

// ── HTTP Client ───────────────────────────────────────────────
type FetchOptions = Omit<RequestInit, 'body'> & { body?: any };

async function request<T = any>(path: string, options: FetchOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401) {
    // Token expirado — limpar sessão
    removeToken();
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    const err = new Error(errorData.error || `HTTP ${response.status}`);
    (err as any).status = response.status;
    (err as any).data = errorData;
    throw err;
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  get: <T = any>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T = any>(path: string, body?: any) => request<T>(path, { method: 'POST', body }),
  put: <T = any>(path: string, body?: any) => request<T>(path, { method: 'PUT', body }),
  patch: <T = any>(path: string, body?: any) => request<T>(path, { method: 'PATCH', body }),
  delete: <T = any>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// ── Socket.IO ─────────────────────────────────────────────────
let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(userId: string): Socket {
  if (socket?.connected) return socket;

  socket = io(API_URL, {
    query: { userId },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => console.log('[Socket.IO] Connected'));
  socket.on('disconnect', () => console.log('[Socket.IO] Disconnected'));

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
