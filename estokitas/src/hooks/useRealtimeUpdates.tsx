import { useEffect, useCallback } from 'react';
import { getSocket } from '@/lib/api';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

type WatchedTable = 'produtos' | 'vendas';

export const useRealtimeUpdates = (
  onUpdate: () => void,
  tables: WatchedTable[] = ['produtos', 'vendas']
) => {
  const { user } = useAuth();

  const handleUpdate = useCallback(() => {
    onUpdate();
  }, [onUpdate]);

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    if (!socket) return;

    const handlers: Array<{ event: string; fn: (data: any) => void }> = [];

    if (tables.includes('produtos')) {
      const onProdutoInsert = (data: any) => {
        handleUpdate();
        toast.success('Novo produto adicionado!');
      };
      const onProdutoUpdate = (data: any) => {
        handleUpdate();
        toast.success('Produto atualizado!');
      };
      const onProdutoDelete = (data: any) => {
        handleUpdate();
      };

      socket.on('produto:created', onProdutoInsert);
      socket.on('produto:updated', onProdutoUpdate);
      socket.on('produto:deleted', onProdutoDelete);

      handlers.push(
        { event: 'produto:created', fn: onProdutoInsert },
        { event: 'produto:updated', fn: onProdutoUpdate },
        { event: 'produto:deleted', fn: onProdutoDelete },
      );
    }

    if (tables.includes('vendas')) {
      const onVendaInsert = (data: any) => {
        handleUpdate();
      };

      socket.on('venda:created', onVendaInsert);
      handlers.push({ event: 'venda:created', fn: onVendaInsert });
    }

    return () => {
      handlers.forEach(({ event, fn }) => socket.off(event, fn));
    };
  }, [user, handleUpdate, tables.join(',')]);
};