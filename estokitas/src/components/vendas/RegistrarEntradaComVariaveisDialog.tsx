import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PackagePlus, Search, Check, ChevronsUpDown, X } from 'lucide-react';
import { useProdutos } from '@/hooks/useProdutos';
import { useVendas } from '@/hooks/useVendas';
import { useToast } from '@/hooks/use-toast';
import { useContas } from '@/hooks/useContas';
import { cn } from '@/lib/utils';

interface ProdutoEntradaVariavel {
  id_produto: string;
  id_variavel?: string;
  nome: string;
  nome_variavel?: string;
  preco: number;
  quantidade: number;
  estoque_atual: number;
  descricao?: string;
}

interface RegistrarEntradaComVariaveisDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const RegistrarEntradaComVariaveisDialog = ({ open: externalOpen, onOpenChange }: RegistrarEntradaComVariaveisDialogProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoEntradaVariavel[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [descricaoGeral, setDescricaoGeral] = useState('');
  const [aumentarEstoque, setAumentarEstoque] = useState(true);
  
  const { produtos } = useProdutos();
  const { registrarVendas } = useVendas();
  const { aumentarEstoque: aumentarEstoqueProduto } = useProdutos();
  const { apiKey, loading: loadingApiKey } = useContas();
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
        preco: produto.preco_compra || 0,
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
          preco: variavel.preco_compra || produto.preco_compra || 0,
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
      estoque_atual: item.estoque
    }]);
    setSearchValue('');
    setOpenCombobox(false);
  };

  const removerProduto = (id_produto: string, id_variavel?: string) => {
    setProdutosSelecionados(prev => prev.filter(p => 
      !(p.id_produto === id_produto && (p.id_variavel || '') === (id_variavel || ''))
    ));
  };

  const atualizarProduto = (id_produto: string, id_variavel: string | undefined, campo: keyof ProdutoEntradaVariavel, valor: any) => {
    setProdutosSelecionados(prev => prev.map(p => 
      p.id_produto === id_produto && (p.id_variavel || '') === (id_variavel || '') 
        ? { ...p, [campo]: valor } 
        : p
    ));
  };

  const handleRegistrarEntradas = async () => {
    if (produtosSelecionados.length === 0) {
      toast({
        title: "Nenhum produto selecionado",
        description: "Selecione pelo menos um produto para registrar a entrada.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const entradas = produtosSelecionados.map(p => ({
        id_produto: p.id_produto,
        id_variavel: p.id_variavel,
        nome_produto: p.nome,
        quantidade: p.quantidade,
        preco_unitario: p.preco,
        diminuir_estoque: false,
        aumentar_estoque: aumentarEstoque,
        tipo: 'entrada' as const,
        descricao: descricaoGeral || p.descricao
      }));

      await registrarVendas(entradas);



      toast({
        title: "Entradas registradas!",
        description: `${produtosSelecionados.length} entrada(s) registrada(s) com sucesso.`,
      });
      
      setOpen(false);
      setProdutosSelecionados([]);
      setDescricaoGeral('');
      setAumentarEstoque(true);
    } catch (error: any) {
      toast({
        title: "Erro ao registrar entradas",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalEntradas = produtosSelecionados.reduce((acc, p) => acc + (p.quantidade * p.preco), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <PackagePlus className="h-4 w-4 mr-2" />
            Registrar Entrada (com Variáveis)
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Registrar Entrada de Estoque (Produtos e Variáveis)</DialogTitle>
          <DialogDescription>Selecione produtos e variáveis e informe as quantidades a adicionar ao estoque.</DialogDescription>
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
                              <span>Estoque atual: {item.estoque}</span>
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
            <Label htmlFor="descricao-entrada">Descrição (opcional)</Label>
            <Textarea
              id="descricao-entrada"
              placeholder="Adicione uma descrição para esta entrada..."
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
              
              {/* Toggle de Aumentar Estoque */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <Switch
                  checked={aumentarEstoque}
                  onCheckedChange={setAumentarEstoque}
                />
                <Label className="text-sm cursor-pointer" onClick={() => setAumentarEstoque(!aumentarEstoque)}>
                  Aumentar estoque automaticamente
                </Label>
              </div>
              
              <div className="border rounded-lg p-3 space-y-3 max-h-60 overflow-y-auto">
                {produtosSelecionados.map((produto) => (
                  <div key={`${produto.id_produto}-${produto.id_variavel || 'main'}`} className="flex items-center space-x-3 p-2 border rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{produto.nome}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>R$ {Number(produto.preco).toFixed(2)}</span>
                        <span>•</span>
                        <span>Estoque atual: {produto.estoque_atual}</span>
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
                      />
                    </div>

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
                Total: R$ {Number(totalEntradas).toFixed(2)}
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
              onClick={handleRegistrarEntradas} 
              disabled={loading || produtosSelecionados.length === 0 || (aumentarEstoque && loadingApiKey)}
            >
              {loading ? 'Registrando...' : 'Registrar Entradas'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};