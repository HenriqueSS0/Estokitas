import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ShoppingCart, Search, Check, ChevronsUpDown, X } from 'lucide-react';
import { useProdutos } from '@/hooks/useProdutos';
import { useVendas } from '@/hooks/useVendas';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProdutoVenda {
  id_produto: string;
  nome: string;
  preco: number;
  quantidade: number;
  diminuir_estoque: boolean;
}

interface RegistrarVendasDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const RegistrarVendasDialog = ({ open: externalOpen, onOpenChange }: RegistrarVendasDialogProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoVenda[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { produtos } = useProdutos();
  const { registrarVendas } = useVendas();
  const { diminuirEstoque } = useProdutos();
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const { toast } = useToast();

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchValue.toLowerCase()) &&
    !produtosSelecionados.some(p => p.id_produto === produto.id_produto)
  );

  const adicionarProduto = (produto: any) => {
    setProdutosSelecionados(prev => [...prev, {
      id_produto: produto.id_produto,
      nome: produto.nome,
      preco: produto.preco_venda || 0,
      quantidade: 1,
      diminuir_estoque: true,
    }]);
    setSearchValue('');
    setOpenCombobox(false);
  };

  const removerProduto = (id_produto: string) => {
    setProdutosSelecionados(prev => prev.filter(p => p.id_produto !== id_produto));
  };

  const atualizarProduto = (id_produto: string, campo: keyof ProdutoVenda, valor: any) => {
    setProdutosSelecionados(prev => prev.map(p => 
      p.id_produto === id_produto ? { ...p, [campo]: valor } : p
    ));
  };

  const handleRegistrarVendas = async () => {
    if (produtosSelecionados.length === 0) {
      toast({
        title: "Nenhum produto selecionado",
        description: "Selecione pelo menos um produto para registrar a venda.",
        variant: "destructive",
      });
      return;
    }

    // Validar estoque
    for (const produtoVenda of produtosSelecionados) {
      if (produtoVenda.diminuir_estoque) {
        const produto = produtos.find(p => p.id_produto === produtoVenda.id_produto);
        if (produto && produtoVenda.quantidade > produto.estoque) {
          toast({
            title: "Estoque insuficiente",
            description: `${produtoVenda.nome}: estoque ${produto.estoque}, solicitado ${produtoVenda.quantidade}`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    setLoading(true);
    try {
      const vendas = produtosSelecionados.map(p => ({
        id_produto: p.id_produto,
        nome_produto: p.nome,
        quantidade: p.quantidade,
        preco_unitario: p.preco,
        diminuir_estoque: p.diminuir_estoque,
      }));

      await registrarVendas(vendas);



      toast({
        title: "Vendas registradas!",
        description: `${produtosSelecionados.length} venda(s) registrada(s) com sucesso.`,
      });
      
      setOpen(false);
      setProdutosSelecionados([]);
    } catch (error: any) {
      toast({
        title: "Erro ao registrar vendas",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalVendas = produtosSelecionados.reduce((acc, p) => acc + (p.quantidade * p.preco), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Registrar Venda
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Vendas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Busca de produtos */}
          <div>
            <Label>Buscar Produto</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Pesquisar produto...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Digite o nome do produto..." 
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                    <CommandGroup>
                      {filteredProdutos.map((produto) => (
                        <CommandItem
                          key={produto.id_produto}
                          value={produto.nome}
                          onSelect={() => adicionarProduto(produto)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              "opacity-0"
                            )}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{produto.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              R$ {Number(produto.preco).toFixed(2)} • Estoque: {produto.estoque}
                            </p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Produtos selecionados */}
          {produtosSelecionados.length > 0 && (
            <div className="space-y-2">
              <Label>Produtos Selecionados</Label>
              <div className="border rounded-lg p-3 space-y-3 max-h-60 overflow-y-auto">
                {produtosSelecionados.map((produto) => (
                  <div key={produto.id_produto} className="flex items-center space-x-3 p-2 border rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{produto.nome}</p>
                      <p className="text-xs text-muted-foreground">R$ {Number(produto.preco).toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs">Qtd:</Label>
                      <Input
                        type="number"
                        value={produto.quantidade}
                        onChange={(e) => atualizarProduto(produto.id_produto, 'quantidade', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 h-8 text-xs"
                        min="1"
                      />
                    </div>

                    <Checkbox
                      checked={produto.diminuir_estoque}
                      onCheckedChange={(checked) => atualizarProduto(produto.id_produto, 'diminuir_estoque', checked === true)}
                      title="Diminuir do estoque"
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerProduto(produto.id_produto)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          {produtosSelecionados.length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">
                Total: R$ {Number(totalVendas).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                {produtosSelecionados.length} produto(s) selecionado(s)
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleRegistrarVendas} 
              disabled={loading || produtosSelecionados.length === 0}
            >
              {loading ? 'Registrando...' : 'Registrar Vendas'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};