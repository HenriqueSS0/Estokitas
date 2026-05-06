import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Search, Check, ChevronsUpDown, X } from 'lucide-react';
import { useProdutos } from '@/hooks/useProdutos';
import { useVendas } from '@/hooks/useVendas';
import { useToast } from '@/hooks/use-toast';
import { useContas } from '@/hooks/useContas';
import { cn } from '@/lib/utils';

interface ProdutoVendaVariavel {
  id_produto: string;
  id_variavel?: string;
  nome: string;
  nome_variavel?: string;
  preco: number;
  quantidade: number;
  diminuir_estoque: boolean;
  estoque_disponivel: number;
  descricao?: string;
}

interface RegistrarVendasComVariaveisDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const RegistrarVendasComVariaveisDialog = ({ open: externalOpen, onOpenChange }: RegistrarVendasComVariaveisDialogProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoVendaVariavel[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [descricaoGeral, setDescricaoGeral] = useState('');
  
  const { produtos } = useProdutos();
  const { registrarVendas } = useVendas();
  const { apiKey } = useContas();
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const { toast } = useToast();

  // Criar lista de produtos + variáveis
  const produtosComVariaveis = produtos.flatMap(produto => {
    const items: Array<{
      id_produto: string;
      id_variavel?: string;
      nome: string;
      nome_variavel?: string;
      preco: number;
      estoque: number;
      tipo: 'produto' | 'variavel';
      usar_estoque_principal?: boolean;
    }> = [
      {
        id_produto: produto.id_produto,
        nome: produto.nome,
        preco: produto.preco_venda || 0,
        estoque: produto.estoque,
        tipo: 'produto' as const
      }
    ];

    if (produto.variaveis && produto.variaveis.length > 0) {
      produto.variaveis.forEach((variavel: any) => {
        items.push({
          id_produto: produto.id_produto,
          id_variavel: variavel.id,
          nome: `${produto.nome} - ${variavel.nome}`,
          nome_variavel: variavel.nome,
          preco: variavel.preco_venda || produto.preco_venda || 0,
          estoque: variavel.usar_estoque_principal ? produto.estoque : (variavel.estoque ?? produto.estoque),
          tipo: 'variavel' as const,
          usar_estoque_principal: variavel.usar_estoque_principal
        });
      });
    }

    return items;
  });

  const filteredProdutos = produtosComVariaveis.filter(item =>
    item.nome.toLowerCase().includes(searchValue.toLowerCase()) &&
    !produtosSelecionados.some(p => 
      p.id_produto === item.id_produto && 
      (p.id_variavel || '') === (item.id_variavel || '')
    )
  );

  const adicionarProduto = (item: any) => {
    setProdutosSelecionados(prev => [...prev, {
      id_produto: item.id_produto,
      id_variavel: item.id_variavel,
      nome: item.nome,
      nome_variavel: item.nome_variavel,
      preco: item.preco,
      quantidade: 1,
      diminuir_estoque: true,
      estoque_disponivel: item.estoque
    }]);
    setSearchValue('');
    setOpenCombobox(false);
  };

  const removerProduto = (id_produto: string, id_variavel?: string) => {
    setProdutosSelecionados(prev => prev.filter(p => 
      !(p.id_produto === id_produto && (p.id_variavel || '') === (id_variavel || ''))
    ));
  };

  const atualizarProduto = (id_produto: string, id_variavel: string | undefined, campo: keyof ProdutoVendaVariavel, valor: any) => {
    setProdutosSelecionados(prev => prev.map(p => 
      p.id_produto === id_produto && (p.id_variavel || '') === (id_variavel || '') 
        ? { ...p, [campo]: valor } 
        : p
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
      if (produtoVenda.diminuir_estoque && produtoVenda.quantidade > produtoVenda.estoque_disponivel) {
        toast({
          title: "Estoque insuficiente",
          description: `${produtoVenda.nome}: estoque ${produtoVenda.estoque_disponivel}, solicitado ${produtoVenda.quantidade}`,
          variant: "destructive",
        });
        return;
      }
    }

    if (!apiKey?.keysecret) {
      toast({
        title: "API key não encontrada",
        description: "Não foi possível identificar sua chave de API. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const vendasParaRegistrar = produtosSelecionados
        .map(p => ({
          id_produto: p.id_produto,
          id_variavel: p.id_variavel,
          nome_produto: p.nome,
          quantidade: p.quantidade,
          preco_unitario: p.preco,
          diminuir_estoque: p.diminuir_estoque,
          descricao: descricaoGeral || p.descricao
        }));

      if (vendasParaRegistrar.length > 0) {
        await registrarVendas(vendasParaRegistrar);
      }



      toast({
        title: "Vendas registradas!",
        description: `${produtosSelecionados.length} venda(s) registrada(s) com sucesso.`,
      });
      
      setOpen(false);
      setProdutosSelecionados([]);
      setDescricaoGeral('');
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
            Registrar Venda (com Variáveis)
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Registrar Vendas (Produtos e Variáveis)</DialogTitle>
          <DialogDescription>Selecione produtos e variáveis, defina quantidades e registre as vendas.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Busca de produtos */}
          <div>
            <Label>Buscar Produto ou Variável</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Pesquisar produto ou variável...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Digite o nome do produto ou variável..." 
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                    <CommandGroup>
                      {filteredProdutos.map((item) => (
                        <CommandItem
                          key={`${item.id_produto}-${item.id_variavel || 'main'}`}
                          value={item.nome}
                          onSelect={() => adicionarProduto(item)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              "opacity-0"
                            )}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.nome}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>R$ {Number(item.preco).toFixed(2)}</span>
                              <span>•</span>
                              <span>Estoque: {item.estoque}</span>
                              {item.tipo === 'variavel' && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600">Variável</span>
                                </>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Descrição geral */}
          <div>
            <Label htmlFor="descricao-geral">Descrição (opcional)</Label>
            <Textarea
              id="descricao-geral"
              placeholder="Adicione uma descrição para esta movimentação..."
              value={descricaoGeral}
              onChange={(e) => setDescricaoGeral(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Produtos selecionados */}
          {produtosSelecionados.length > 0 && (
            <div className="space-y-2">
              <Label>Itens Selecionados</Label>
              <div className="border rounded-lg p-3 space-y-3 max-h-60 overflow-y-auto">
                {produtosSelecionados.map((produto) => (
                  <div key={`${produto.id_produto}-${produto.id_variavel || 'main'}`} className="flex items-center space-x-3 p-2 border rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{produto.nome}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>R$ {Number(produto.preco).toFixed(2)}</span>
                        <span>•</span>
                        <span>Estoque: {produto.estoque_disponivel}</span>
                        {produto.id_variavel && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">Variável</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs">Qtd:</Label>
                      <Input
                        type="number"
                        value={produto.quantidade}
                        onChange={(e) => atualizarProduto(produto.id_produto, produto.id_variavel, 'quantidade', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 h-8 text-xs"
                        min="1"
                        max={produto.estoque_disponivel}
                      />
                    </div>

                    <Checkbox
                      checked={produto.diminuir_estoque}
                      onCheckedChange={(checked) => atualizarProduto(produto.id_produto, produto.id_variavel, 'diminuir_estoque', checked === true)}
                      title="Diminuir do estoque"
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerProduto(produto.id_produto, produto.id_variavel)}
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
                {produtosSelecionados.length} item(s) selecionado(s)
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