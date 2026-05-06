import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';
import { useRealtimeUpdates } from './useRealtimeUpdates';

interface Venda {
  id: string;
  id_produto: string;
  id_variavel?: string;
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
  diminuir_estoque: boolean;
  tipo: 'venda' | 'entrada';
  created_at: string;
  updated_at: string;
  descricao?: string;
}

interface NovaVenda {
  id_produto: string;
  id_variavel?: string;
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
  diminuir_estoque: boolean;
  tipo?: 'venda' | 'entrada';
  descricao?: string;
}

export const useVendas = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchVendas = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await api.get<any[]>('/api/vendas');
      const parsedData = data.map((v) => ({
        ...v,
        preco_unitario: Number(v.preco_unitario) || 0,
        total: Number(v.total) || 0,
        quantidade: Number(v.quantidade) || 0,
      }));
      setVendas(parsedData);
    } catch (err) {
      console.error('[useVendas] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useRealtimeUpdates(fetchVendas, ['vendas']);

  const registrarVenda = async (novaVenda: NovaVenda): Promise<Venda> => {
    const data = await api.post<Venda>('/api/vendas', novaVenda);
    return data;
  };

  const registrarVendas = async (novasVendas: NovaVenda[]): Promise<Venda[]> => {
    const data = await api.post<Venda[]>('/api/vendas/batch', { vendas: novasVendas });
    return data;
  };

  useEffect(() => {
    if (user) fetchVendas();
  }, [user, fetchVendas]);

  return {
    vendas,
    loading,
    registrarVenda,
    registrarVendas,
    refetch: fetchVendas,
  };
};