import { useState } from 'react';
import { ChevronDown, ChevronRight, ShoppingCart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VendaItem {
  id: string;
  id_produto: string;
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
  diminuir_estoque: boolean;
  created_at: string;
}

interface VendaGroupedItemProps {
  data: string;
  vendas: VendaItem[];
}

export const VendaGroupedItem = ({ data, vendas }: VendaGroupedItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const totalVendas = vendas.length;
  const valorTotal = vendas.reduce((acc, venda) => acc + venda.total, 0);
  const quantidadeTotal = vendas.reduce((acc, venda) => acc + venda.quantidade, 0);

  // Se houver apenas uma venda, mostrar direto sem agrupamento
  if (totalVendas === 1) {
    const venda = vendas[0];
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">{venda.nome_produto}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{venda.quantidade} unidade{venda.quantidade > 1 ? 's' : ''}</span>
                  <Badge variant={venda.diminuir_estoque ? 'destructive' : 'secondary'} className="text-xs">
                    {venda.diminuir_estoque ? 'Estoque reduzido' : 'Sem redução'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(venda.created_at), { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                R$ {venda.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">
                R$ {venda.preco_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / un
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Para múltiplas vendas, mostrar agrupado
  return (
    <Card>
      <CardContent className="p-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">
                  {totalVendas} vendas realizadas
                </h4>
                <p className="text-sm text-muted-foreground">
                  {quantidadeTotal} itens • {formatDistanceToNow(new Date(data), { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-semibold">
                  R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total das vendas
                </p>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent className="mt-4 space-y-2">
            {vendas.map((venda) => (
              <div 
                key={venda.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{venda.nome_produto}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {venda.quantidade} unidade{venda.quantidade > 1 ? 's' : ''}
                      </span>
                      <Badge variant={venda.diminuir_estoque ? 'destructive' : 'secondary'} className="text-xs">
                        {venda.diminuir_estoque ? 'Estoque reduzido' : 'Sem redução'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    R$ {venda.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    R$ {venda.preco_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / un
                  </p>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};