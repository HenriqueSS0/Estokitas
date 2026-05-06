import { useState, useEffect } from 'react';
import { Plus, Edit, Package, Trash2, Image as ImageIcon, X, ArrowLeft, AlertTriangle, Eye, TrendingUp, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useProdutos } from '@/hooks/useProdutos';
import { useToast } from '@/hooks/use-toast';
import { IdDisplayModal } from '@/components/ui/id-display-modal';
import { ActiveToggle } from '@/components/produtos/ActiveToggle';
import { Link } from 'react-router-dom';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';

interface Produto {
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
  keysecret: string;
  created_at: string;
  updated_at: string;
}

interface ProductVariant {
  id: string;
  nome: string;
  valor: string;
  preco_compra: number;
  preco_venda: number;
  estoque: number;
  estoque_minimo: number;
  imagem_url?: string;
  ativo?: boolean;
  usar_preco_principal?: boolean;
  usar_estoque_principal?: boolean;
}

export const ProdutosPage = () => {
  const { session } = useAuth();
  const { produtos, loading: produtosLoading, addProduto, editProduto, deleteProduto } = useProdutos();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 15;
  
  const [modalData, setModalData] = useState<{isOpen: boolean, id: string, title: string}>({
    isOpen: false,
    id: '',
    title: ''
  });

  const [formData, setFormData] = useState<Partial<Produto> & { variaveis?: ProductVariant[] }>({
    nome: '',
    descricoes: [],
    preco_compra: 0,
    preco_venda: 0,
    estoque: 0,
    estoque_minimo: 5,
    imagens: [],
    categoria: '',
    variaveis: [],
    ativo: true,
  });

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEstoque = produtos.reduce((acc, produto) => acc + produto.estoque, 0);

  // Paginação
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = produtosFiltrados.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(produtosFiltrados.length / productsPerPage);

  const handleCreateProduct = async () => {
    try {
      await addProduto({
        nome: formData.nome || '',
        descricoes: formData.descricoes || [],
        preco: formData.preco_venda || 0,
        preco_compra: formData.preco_compra || 0,
        preco_venda: formData.preco_venda || 0,
        estoque: formData.estoque || 0,
        estoque_minimo: formData.estoque_minimo || 5,
        imagens: formData.imagens || [],
        categoria: formData.categoria || '',
        variaveis: formData.variaveis || [],
        ativo: formData.ativo ?? true,
      });
      toast({
        title: "Produto criado!",
        description: "O produto foi adicionado com sucesso.",
      });
      setCurrentView('list');
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o produto.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProduct = async () => {
    if (editingProduct) {
      try {
        await editProduto(editingProduct.id_produto, {
          nome: formData.nome || '',
          descricoes: formData.descricoes || [],
          preco: formData.preco_venda || 0,
          preco_compra: formData.preco_compra || 0,
          preco_venda: formData.preco_venda || 0,
          estoque: formData.estoque || 0,
          estoque_minimo: formData.estoque_minimo || 5,
          imagens: formData.imagens || [],
          categoria: formData.categoria || '',
          variaveis: formData.variaveis || [],
          ativo: formData.ativo ?? true,
        });
        toast({
          title: "Produto atualizado!",
          description: "As alterações foram salvas.",
        });
        setEditingProduct(null);
        setCurrentView('list');
        resetForm();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o produto.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduto(id);
      toast({
        title: "Produto excluído!",
        description: "O produto foi removido com sucesso.",
      });
      setDeleteConfirmProduct(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricoes: [],
      preco_compra: 0,
      preco_venda: 0,
      estoque: 0,
      estoque_minimo: 5,
      imagens: [],
      categoria: '',
      variaveis: [],
      ativo: true,
    });
  };

  const openEditPage = (product: Produto) => {
    setEditingProduct(product);
    
    // Processar descrições - pode ser array de strings ou objetos {tipo, valor}
    const descricoesProcessadas = (product.descricoes as any[])?.map((d: any) => {
      if (typeof d === 'string') return d;
      return d.valor || d.value || '';
    }) || [];
    
    setFormData({
      ...product,
      descricoes: descricoesProcessadas,
      variaveis: (product.variaveis as any[])?.map((v: any) => ({
        id: v.id || Date.now().toString(),
        nome: v.nome || '',
        valor: v.valor || '',
        preco_compra: v.preco_compra || 0,
        preco_venda: v.preco_venda || 0,
        estoque: v.estoque || 0,
        estoque_minimo: v.estoque_minimo || 5,
        imagem_url: v.imagem_url || '',
        ativo: v.ativo ?? true,
        usar_preco_principal: v.usar_preco_principal ?? false,
        usar_estoque_principal: v.usar_estoque_principal ?? false,
      })) || [],
    });
    setCurrentView('edit');
  };

  const openCreatePage = () => {
    resetForm();
    setCurrentView('create');
  };

  const cancelForm = () => {
    setCurrentView('list');
    setEditingProduct(null);
    resetForm();
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variaveis: [...(formData.variaveis || []), { 
        id: Date.now().toString(), 
        nome: '', 
        valor: '', 
        preco_compra: formData.preco_compra || 0, 
        preco_venda: formData.preco_venda || 0, 
        estoque: formData.estoque || 0,
        estoque_minimo: formData.estoque_minimo || 5,
        imagem_url: '',
        ativo: true,
        usar_preco_principal: false,
        usar_estoque_principal: false
      }],
    });
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number | boolean) => {
    const newVariants = [...(formData.variaveis || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variaveis: newVariants });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variaveis: formData.variaveis?.filter((_, i) => i !== index),
    });
  };

  const usarValorPrincipal = (index: number) => {
    const newVariants = [...(formData.variaveis || [])];
    const currentState = newVariants[index].usar_preco_principal;
    
    newVariants[index] = { 
      ...newVariants[index], 
      usar_preco_principal: !currentState,
      ...(currentState ? {} : {
        preco_compra: formData.preco_compra || 0,
        preco_venda: formData.preco_venda || 0
      })
    };
    
    setFormData({ ...formData, variaveis: newVariants });
  };

  const usarEstoquePrincipal = (index: number) => {
    const newVariants = [...(formData.variaveis || [])];
    const currentState = newVariants[index].usar_estoque_principal;
    
    newVariants[index] = { 
      ...newVariants[index], 
      usar_estoque_principal: !currentState,
      ...(currentState ? {} : {
        estoque: formData.estoque || 0,
        estoque_minimo: formData.estoque_minimo || 5
      })
    };
    
    setFormData({ ...formData, variaveis: newVariants });
  };

  const addImage = (url: string) => {
    if (url.trim()) {
      setFormData({
        ...formData,
        imagens: [...(formData.imagens || []), url],
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      imagens: formData.imagens?.filter((_, i) => i !== index),
    });
  };

  const showProductId = (id: string, title: string = 'ID do Produto') => {
    setModalData({
      isOpen: true,
      id,
      title
    });
  };

  const closeModal = () => {
    setModalData({
      isOpen: false,
      id: '',
      title: ''
    });
  };



  if (currentView === 'create' || currentView === 'edit') {
    return (
      <ScrollArea className="h-full">
        <div className="saas-page-container">
          <button
            onClick={cancelForm}
            className="saas-back-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <div className="saas-panel">
            <div className="saas-panel-header">
              <div className="saas-panel-title-row">
                <div className="saas-panel-icon-wrap" style={{ background: 'hsl(var(--primary) / 0.08)', color: 'hsl(var(--primary))' }}>
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="saas-panel-title">{currentView === 'edit' ? 'Editar Produto' : 'Novo Produto'}</h1>
                  <p className="saas-panel-subtitle">{currentView === 'edit' ? 'Atualize as informações do produto' : 'Preencha as informações do novo produto'}</p>
                </div>
              </div>
            </div>
            <div className="saas-panel-body" style={{ padding: '1.5rem' }}>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="variants">Variáveis</TabsTrigger>
                  <TabsTrigger value="images">Imagens</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-6 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="name">Nome do Produto</Label>
                      <Input
                        id="name"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Digite o nome do produto"
                      />
                    </div>

                    <div>
                      <Label htmlFor="categoria">Categoria</Label>
                      <Input
                        id="categoria"
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        placeholder="Ex: Eletrônicos, Roupas..."
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ativo"
                        checked={formData.ativo}
                        onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                      />
                      <Label htmlFor="ativo" className="cursor-pointer">
                        Produto Ativo
                      </Label>
                    </div>

                    <div>
                      <Label htmlFor="preco_compra">Preço de Compra (R$)</Label>
                      <Input
                        id="preco_compra"
                        type="number"
                        step="0.01"
                        value={formData.preco_compra}
                        onChange={(e) => setFormData({ ...formData, preco_compra: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="preco_venda">Preço de Venda (R$)</Label>
                      <Input
                        id="preco_venda"
                        type="number"
                        step="0.01"
                        value={formData.preco_venda}
                        onChange={(e) => setFormData({ ...formData, preco_venda: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="estoque">Estoque Atual</Label>
                      <Input
                        id="estoque"
                        type="number"
                        value={formData.estoque}
                        onChange={(e) => setFormData({ ...formData, estoque: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
                      <Input
                        id="estoque_minimo"
                        type="number"
                        value={formData.estoque_minimo}
                        onChange={(e) => setFormData({ ...formData, estoque_minimo: parseInt(e.target.value) || 5 })}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={(() => {
                        const desc = (formData.descricoes as any[])?.[0];
                        if (!desc) return '';
                        if (typeof desc === 'string') return desc;
                        return desc.valor || desc.value || '';
                      })()}
                      onChange={(e) => setFormData({ ...formData, descricoes: [e.target.value] })}
                      className="min-h-[120px]"
                      placeholder="Descreva seu produto..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="variants" className="space-y-4 mt-6">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg">Variações do Produto</Label>
                    <Button
                      type="button"
                      onClick={addVariant}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Variação
                    </Button>
                  </div>

                  <ScrollArea className="h-[500px]">
                    {formData.variaveis?.map((variant, index) => (
                      <Card key={variant.id} className="p-4 mb-4 border-primary/20">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold">Variação {index + 1}</h4>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => showProductId(variant.id, 'ID da Variável')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariant(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Nome</Label>
                              <Input
                                value={variant.nome}
                                onChange={(e) => updateVariant(index, 'nome', e.target.value)}
                                placeholder="Ex: Tamanho, Cor"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Valor</Label>
                              <Input
                                value={variant.valor}
                                onChange={(e) => updateVariant(index, 'valor', e.target.value)}
                                placeholder="Ex: M, Azul"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                            <Switch
                              id={`ativo-${index}`}
                              checked={variant.ativo ?? true}
                              onCheckedChange={(checked) => updateVariant(index, 'ativo', checked)}
                            />
                            <Label htmlFor={`ativo-${index}`} className="cursor-pointer text-sm">
                              Variação Ativa
                            </Label>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                              <Switch
                                id={`preco-principal-${index}`}
                                checked={variant.usar_preco_principal ?? false}
                                onCheckedChange={() => usarValorPrincipal(index)}
                              />
                              <Label htmlFor={`preco-principal-${index}`} className="cursor-pointer text-sm">
                                Usar preços do produto principal
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                              <Switch
                                id={`estoque-principal-${index}`}
                                checked={variant.usar_estoque_principal ?? false}
                                onCheckedChange={() => usarEstoquePrincipal(index)}
                              />
                              <Label htmlFor={`estoque-principal-${index}`} className="cursor-pointer text-sm">
                                Usar estoque do produto principal
                              </Label>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Preço de Compra</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={variant.usar_preco_principal ? formData.preco_compra : variant.preco_compra}
                                onChange={(e) => updateVariant(index, 'preco_compra', parseFloat(e.target.value) || 0)}
                                disabled={variant.usar_preco_principal}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Preço de Venda</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={variant.usar_preco_principal ? formData.preco_venda : variant.preco_venda}
                                onChange={(e) => updateVariant(index, 'preco_venda', parseFloat(e.target.value) || 0)}
                                disabled={variant.usar_preco_principal}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Estoque</Label>
                              <Input
                                type="number"
                                value={variant.usar_estoque_principal ? formData.estoque : variant.estoque}
                                onChange={(e) => updateVariant(index, 'estoque', parseInt(e.target.value) || 0)}
                                disabled={variant.usar_estoque_principal}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Estoque Mínimo</Label>
                              <Input
                                type="number"
                                value={variant.usar_estoque_principal ? formData.estoque_minimo : variant.estoque_minimo}
                                onChange={(e) => updateVariant(index, 'estoque_minimo', parseInt(e.target.value) || 0)}
                                disabled={variant.usar_estoque_principal}
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm">URL da Imagem (Opcional)</Label>
                            <Input
                              value={variant.imagem_url || ''}
                              onChange={(e) => updateVariant(index, 'imagem_url', e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </ScrollArea>

                  {(!formData.variaveis || formData.variaveis.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma variação adicionada ainda
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="images" className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="imageUrl">URL da Imagem</Label>
                    <div className="flex gap-2">
                      <Input
                        id="imageUrl"
                        placeholder="Cole a URL da imagem"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            if (input.value) {
                              addImage(input.value);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('imageUrl') as HTMLInputElement;
                          if (input.value) {
                            addImage(input.value);
                            input.value = '';
                          }
                        }}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {formData.imagens?.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {(!formData.imagens || formData.imagens.length === 0) && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Nenhuma imagem adicionada</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={cancelForm}
                  className="h-10 px-6 rounded-lg font-semibold border border-border"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={currentView === 'edit' ? handleUpdateProduct : handleCreateProduct}
                  className="h-10 px-6 rounded-lg font-semibold"
                  style={{ background: 'hsl(var(--primary))', color: 'white', border: 'none' }}
                >
                  {currentView === 'edit' ? 'Atualizar' : 'Criar'} Produto
                </Button>
              </div>
            </div>
          </div>
        </div>

        <IdDisplayModal
          isOpen={modalData.isOpen}
          onClose={closeModal}
          id={modalData.id}
          title={modalData.title}
        />
      </ScrollArea>
    );
  }

  return (
    <div className="saas-page-container">
      {/* Page Header */}
      <div className="saas-page-header">
        <div>
          <h1 className="saas-page-title">Produtos</h1>
          <p className="saas-page-subtitle">Gerencie todo o seu catálogo de produtos.</p>
        </div>
        <div className="saas-page-actions">
          <button onClick={openCreatePage} className="saas-action-btn">
            <Plus className="h-4 w-4" style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="saas-kpi-grid">
        <div className="saas-kpi-card color-indigo">
          <div className="saas-kpi-header">
            <span className="saas-kpi-label">Total de Produtos</span>
            <div className="saas-kpi-icon-wrap color-indigo"><Package className="h-4 w-4" /></div>
          </div>
          <div className="saas-kpi-value">{produtos.length}</div>
          <div className="saas-kpi-footer"><span className="saas-kpi-sub">produtos cadastrados</span></div>
        </div>
        <div className="saas-kpi-card color-emerald">
          <div className="saas-kpi-header">
            <span className="saas-kpi-label">Total em Estoque</span>
            <div className="saas-kpi-icon-wrap color-emerald"><TrendingUp className="h-4 w-4" /></div>
          </div>
          <div className="saas-kpi-value">{totalEstoque}</div>
          <div className="saas-kpi-footer"><span className="saas-kpi-sub">unidades disponíveis</span></div>
        </div>
      </div>

      {/* Search Bar */}
      <div>
        <Input
          placeholder="Pesquisar produtos..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="saas-search-input"
        />
      </div>

      {/* Products Grid */}
      {produtosLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner" />
        </div>
      ) : currentProducts.length === 0 ? (
        <div className="saas-empty-state" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="saas-empty-icon">📦</div>
          <p className="saas-empty-title">{searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}</p>
          <p className="saas-empty-sub">{searchTerm ? `Sem resultados para "${searchTerm}"` : 'Comece adicionando seu primeiro produto'}</p>
          {!searchTerm && (
            <div style={{ marginTop: '1rem' }}>
              <button onClick={openCreatePage} className="saas-action-btn">
                <Plus className="h-4 w-4" style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
                Adicionar Primeiro Produto
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="saas-product-grid">
            {currentProducts.map((product) => (
              <div key={product.id_produto} className="saas-product-card">
                <div className="saas-product-img">
                  {(product.imagens as string[])?.[0] ? (
                    <img
                      src={(product.imagens as string[])[0]}
                      alt={product.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="saas-product-img-placeholder">
                      <Package className="h-12 w-12" style={{ color: 'hsl(var(--muted-foreground) / 0.4)' }} />
                    </div>
                  )}
                  <div className="saas-product-badges">
                    {product.categoria && (
                      <span className="saas-product-badge category">{product.categoria}</span>
                    )}
                    <span className={`saas-product-badge ${product.ativo ? 'active' : 'inactive'}`}>
                      {product.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <div className="saas-product-body">
                  <h3 className="saas-product-name">{product.nome}</h3>
                  <p className="saas-product-desc">
                    {(() => {
                      const desc = (product.descricoes as any[])?.[0];
                      if (!desc) return 'Sem descrição';
                      if (typeof desc === 'string') return desc;
                      return desc.valor || desc.value || 'Sem descrição';
                    })()}
                  </p>

                  <div className="saas-product-price-row">
                    <div>
                      <p className="saas-product-price-label">Preço de venda</p>
                      <p className="saas-product-price">R$ {product.preco_venda ? Number(product.preco_venda).toFixed(2) : '0.00'}</p>
                    </div>
                    <span className={`saas-product-stock ${product.estoque < product.estoque_minimo ? 'low' : ''}`}>
                      {product.estoque} UN
                    </span>
                  </div>

                  {(product.variaveis as any[])?.length > 0 && (
                    <div className="saas-product-variants">
                      {(product.variaveis as any[]).slice(0, 3).map((variant: any, idx: number) => {
                        const nomeDisplay = typeof variant === 'string' ? variant : variant.nome || '';
                        return (
                          <span key={variant.id || idx} className="saas-variant-tag">{nomeDisplay}</span>
                        );
                      })}
                      {(product.variaveis as any[]).length > 3 && (
                        <span className="saas-variant-tag more">+{(product.variaveis as any[]).length - 3}</span>
                      )}
                    </div>
                  )}

                  <div style={{ marginBottom: '0.75rem' }}>
                    <ActiveToggle produto={product} />
                  </div>

                  <div className="saas-product-actions">
                    <button onClick={() => openEditPage(product)} className="saas-product-btn edit">
                      <Edit className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button onClick={() => showProductId(product.id_produto)} className="saas-product-btn icon" title="Ver ID">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteConfirmProduct(product)} className="saas-product-btn danger icon" title="Excluir">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmProduct} onOpenChange={(open) => !open && setDeleteConfirmProduct(null)}>
        <DialogContent className="border border-border rounded-2xl shadow-lg max-w-md p-0 overflow-hidden">
          <div style={{ background: 'hsl(0 72% 51%)', padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(0 72% 45%)' }}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-white" />
              <DialogTitle className="text-white text-base font-bold">Excluir Produto</DialogTitle>
            </div>
          </div>
          <div className="p-6">
            <DialogDescription className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>
              Tem certeza que deseja excluir <strong>{deleteConfirmProduct?.nome}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmProduct(null)}
                className="flex-1 h-10 rounded-lg font-semibold border border-border"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => deleteConfirmProduct && handleDeleteProduct(deleteConfirmProduct.id_produto)}
                className="flex-1 h-10 rounded-lg font-semibold"
                style={{ background: 'hsl(0 72% 51%)', color: 'white', border: 'none' }}
              >
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <IdDisplayModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        id={modalData.id}
        title={modalData.title}
      />
    </div>
  );
};

export default ProdutosPage;