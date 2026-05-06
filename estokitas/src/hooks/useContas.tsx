import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';

interface Conta {
  id: string;
  user_id: string;
  subscribed: boolean;
  created_at: string;
}

interface ApiKey {
  id: string;
  user_id: string;
  keysecret: string;
  keysecret_encrypted: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export const useContas = () => {
  const [conta, setConta] = useState<Conta | null>(null);
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchConta = async () => {
    if (!user) return;
    try {
      const data = await api.get<{ conta: Conta; apiKey: ApiKey | null }>('/api/conta');
      setConta(data.conta);
      setApiKey(data.apiKey);
    } catch (err) {
      if (import.meta.env.DEV) console.error('[useContas] fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const gerarApiKey = async (): Promise<ApiKey> => {
    const data = await api.post<ApiKey>('/api/conta/api-key');
    setApiKey(data);
    return data;
  };

  const revogarApiKey = async (): Promise<void> => {
    await api.delete('/api/conta/api-key');
    setApiKey(null);
  };

  useEffect(() => {
    if (user) fetchConta();
  }, [user]);

  return { conta, apiKey, loading, refetch: fetchConta, gerarApiKey, revogarApiKey };
};