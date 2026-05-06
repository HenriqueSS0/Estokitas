import { useEffect, useState } from 'react';
import { useProdutos } from './useProdutos';
import { useVendas } from './useVendas';

interface Notification {
  id: string;
  type: 'low_stock' | 'out_stock' | 'new_sale';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const { produtos } = useProdutos();
  const { vendas } = useVendas();

  useEffect(() => {
    const newNotifications: Notification[] = [];

    // Verificar produtos com estoque baixo ou zerado
    produtos.forEach(produto => {
      if (produto.estoque === 0) {
        newNotifications.push({
          id: `out_stock_${produto.id_produto}`,
          type: 'out_stock',
          title: 'Produto sem estoque',
          description: `${produto.nome} está sem estoque`,
          timestamp: new Date(),
          read: false
        });
      } else if (produto.estoque <= produto.estoque_minimo) {
        newNotifications.push({
          id: `low_stock_${produto.id_produto}`,
          type: 'low_stock',
          title: 'Estoque baixo',
          description: `${produto.nome} está com estoque baixo (${produto.estoque} unidades)`,
          timestamp: new Date(),
          read: false
        });
      }
    });

    // Verificar vendas recentes (últimas 24h)
    const agora = new Date();
    const ontemMesmaHora = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
    
    const vendasRecentes = vendas.filter(venda => 
      new Date(venda.created_at) > ontemMesmaHora
    );

    if (vendasRecentes.length > 0) {
      newNotifications.push({
        id: `new_sales_${Date.now()}`,
        type: 'new_sale',
        title: 'Novas vendas',
        description: `${vendasRecentes.length} nova${vendasRecentes.length > 1 ? 's' : ''} venda${vendasRecentes.length > 1 ? 's' : ''} nas últimas 24h`,
        timestamp: new Date(),
        read: false
      });
    }

    setNotifications(newNotifications);
    setHasUnread(newNotifications.some(n => !n.read));
  }, [produtos, vendas]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setHasUnread(notifications.some(n => !n.read && n.id !== notificationId));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setHasUnread(false);
  };

  return {
    notifications,
    hasUnread,
    markAsRead,
    markAllAsRead
  };
};