import { Bell, Package, TrendingDown, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const NotificationBell = () => {
  const { notifications, hasUnread, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'out_stock':
        return <Package className="h-4 w-4 text-destructive" />;
      case 'low_stock':
        return <TrendingDown className="h-4 w-4 text-warning" />;
      case 'new_sale':
        return <ShoppingCart className="h-4 w-4 text-success" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2 bg-white text-black border-4 border-black shadow-[4px_4px_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_#000] active:translate-y-1 active:shadow-[2px_2px_0_#000] rounded-xl h-12 w-12 p-0 transition-all flex items-center justify-center">
          <Bell className="h-6 w-6 stroke-[3px]" />
          {hasUnread && (
            <div className="absolute -top-2 -right-2 h-5 w-5 bg-[#FF0033] border-2 border-black rounded-full animate-bounce" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl bg-white dark:bg-slate-950 p-2">
        <DropdownMenuLabel className="flex items-center justify-between font-bold text-slate-900 dark:text-white px-3 py-2">
          Notificações
          {hasUnread && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10"
            >
              Marcar todas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
        
        <div className="max-h-[400px] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-400">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <span className="text-sm font-medium">Nenhuma notificação</span>
            </div>
          ) : (
            <>
              {notifications.slice(0, 10).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`cursor-pointer p-3 rounded-lg mb-1 transition-all border-l-4 ${
                    !notification.read 
                      ? 'bg-slate-100 dark:bg-slate-900 border-primary shadow-sm' 
                      : 'bg-white dark:bg-slate-950 border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className={`p-2 rounded-full ${!notification.read ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-slate-50 dark:bg-slate-900'}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${!notification.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-2 leading-relaxed">
                        {notification.description}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-tight">
                        {formatDistanceToNow(notification.timestamp, { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              {notifications.length > 10 && (
                <div className="text-center py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    +{notifications.length - 10} mais notificações
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};