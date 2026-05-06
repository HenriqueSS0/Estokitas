import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';
import { useRealtimeUpdates } from './useRealtimeUpdates';

export interface Produto {
  id_produto: string;
  nome: string;
  preco: number;
  preco_compra?: number;
  preco_venda?: number;
  categoria?: string;
  imagem_url?: string;
  estoque: number;
  estoque_minimo: number;
  ativo: boolean;
  variaveis?: any[];
  descricoes?: any[];
  imagens?: any[];
  keysecret?: string;
  created_at: string;
  updated_at: string;
}

interface NovoProduto {
  nome: string;
  preco: number;
  preco_compra?: number;
  preco_venda?: number;
  categoria?: string | null;
  imagem_url?: string;
  estoque: number;
  estoque_minimo: number;
  variaveis?: any[];
  descricoes?: any[];
  imagens?: any[];
  ativo?: boolean;
}

export const useProdutos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProdutos = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await api.get<Produto[]>('/api/produtos');
      setProdutos(data);
    } catch (err) {
      console.error('[useProdutos] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useRealtimeUpdates(fetchProdutos, ['produtos']);

  const addProduto = async (novoProduto: NovoProduto): Promise<Produto> => {
    const data = await api.post<Produto>('/api/produtos', novoProduto);
    setProdutos((prev) => [data, ...prev]);
    return data;
  };

  const editProduto = async (id: string, produtoAtualizado: Partial<NovoProduto>): Promise<Produto> => {
    const data = await api.put<Produto>(`/api/produtos/${id}`, produtoAtualizado);
    setProdutos((prev) => prev.map((p) => (p.id_produto === id ? data : p)));
    return data;
  };

  const diminuirEstoque = async (id: string, quantidade = 1): Promise<Produto> => {
    const data = await api.patch<Produto>(`/api/produtos/${id}/estoque`, {
      operacao: 'diminuir',
      quantidade,
    });
    setProdutos((prev) => prev.map((p) => (p.id_produto === id ? data : p)));
    return data;
  };

  const aumentarEstoque = async (id: string, quantidade = 1): Promise<Produto> => {
    const data = await api.patch<Produto>(`/api/produtos/${id}/estoque`, {
      operacao: 'aumentar',
      quantidade,
    });
    setProdutos((prev) => prev.map((p) => (p.id_produto === id ? data : p)));
    return data;
  };

  const deleteProduto = async (id: string): Promise<void> => {
    await api.delete(`/api/produtos/${id}`);
    setProdutos((prev) => prev.filter((p) => p.id_produto !== id));
  };

  useEffect(() => {
    if (user) fetchProdutos();
  }, [user, fetchProdutos]);

  return {
    produtos,
    loading,
    addProduto,
    editProduto,
    diminuirEstoque,
    aumentarEstoque,
    deleteProduto,
    refetch: fetchProdutos,
  };
};