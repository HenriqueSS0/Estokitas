import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Lock, Package, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProdutos } from '@/hooks/useProdutos';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { VariaveisManager } from '@/components/produtos/VariaveisManager';
import { DescricoesManager } from '@/components/produtos/DescricoesManager';
import { ImagensManager } from '@/components/produtos/ImagensManager';
import { ProductPreview } from '@/components/produtos/ProductPreview';
import { Link, useNavigate, useParams } from 'react-router-dom';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  preco: z.coerce.number().min(0, 'Preço deve ser positivo'),
  categoria: z.string().optional(),
  estoque: z.coerce.number().min(0, 'Estoque deve ser positivo').int('Estoque deve ser um número inteiro'),
  estoque_minimo: z.coerce.number().min(0, 'Estoque mínimo deve ser positivo').int('Estoque mínimo deve ser um número inteiro'),
});

interface Variavel {
  id: string;
  nome: string;
  estoque?: number;
  preco?: number;
  imagens?: Array<{
    id: string;
    url: string;
    nome?: string;
  }>;
}

interface Descricao {
  tipo: string;
}

interface ImagemProduto {
  id: string;
  url: string;
  nome?: string;
}

export const EditProdutoPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { produtos, loading: produtosLoading, editProduto } = useProdutos();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [variaveis, setVariaveis] = useState<Variavel[]>([]);
  const [descricoes, setDescricoes] = useState<Descricao[]>([]);
  const [imagens, setImagens] = useState<ImagemProduto[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const produto = produtos.find(p => p.id_produto === id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      preco: 0,
      categoria: '',
      estoque: 0,
      estoque_minimo: 5,
    },
  });


  // Atualizar formulário e estados quando o produto carregar
  useEffect(() => {
    if (produto) {
      // Atualizar o formulário com os dados do produto
      form.reset({
        nome: produto.nome,
        preco: produto.preco,
        categoria: produto.categoria || '',
        estoque: produto.estoque,
        estoque_minimo: produto.estoque_minimo,
      });

      // Atualizar variáveis
      setVariaveis(produto.variaveis || []);
      
      // Atualizar descrições
      setDescricoes(produto.descricoes || []);
      
      // Atualizar imagens (migrar imagem_url se necessário)
      if (produto.imagem_url && (!produto.imagens || produto.imagens.length === 0)) {
        setImagens([{
          id: crypto.randomUUID(),
          url: produto.imagem_url,
          nome: 'Imagem principal'
        }]);
      } else {
        setImagens(produto.imagens || []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produto]);

  // Redirecionar se produto não encontrado após carregamento
  useEffect(() => {
    if (!produtosLoading && !produto && produtos.length > 0) {
      toast({
        title: "Produto não encontrado",
        description: "O produto que você está tentando editar não existe.",
        variant: "destructive",
      });
      navigate('/dashboard/produtos', { replace: true });
    }
  }, [produto, produtos, produtosLoading, navigate, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!id || !produto) return;
    
    setLoading(true);
    try {
      await editProduto(id, {
        ...values,
        categoria: values.categoria || null,
        variaveis: variaveis.length > 0 ? variaveis : [],
        descricoes: descricoes.length > 0 ? descricoes : [],
        imagens: imagens.length > 0 ? imagens : [],
        imagem_url: imagens.length > 0 ? imagens[0].url : undefined,
      });
      toast({
        title: "Produto atualizado!",
        description: "As informações do produto foram atualizadas com sucesso.",
      });
      navigate('/dashboard/produtos');
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const watchedValues = form.watch();

  if (produtosLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Carregando produto...
          </p>
        </div>
      </div>
    );
  }


  if (!produto) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/produtos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Produto não encontrado</h1>
            <p className="text-muted-foreground">O produto que você está tentando editar não existe.</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Este produto pode ter sido removido ou o ID está incorreto.
            </p>
            <Link to="/dashboard/produtos">
              <Button>Voltar para Produtos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/produtos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Editar Produto</h1>
            <p className="text-muted-foreground">Atualize as informações do produto</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showPreview ? 'Ocultar' : 'Ver'} Preview
        </Button>
      </div>

      <div className="flex gap-6">
        <Card className={showPreview ? "flex-1" : "w-full"}>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
            <CardDescription>
              Edite os dados do produto. Use as abas para organizar as informações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <Tabs defaultValue="basico" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basico">Básico</TabsTrigger>
                  <TabsTrigger value="variaveis">Variáveis</TabsTrigger>
                  <TabsTrigger value="descricoes">Descrições</TabsTrigger>
                  <TabsTrigger value="imagens">Imagens</TabsTrigger>
                </TabsList>
                
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                  <TabsContent value="basico" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Produto *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do produto" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="categoria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Roupas, Acessórios" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="preco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço (R$) *</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="estoque"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estoque Atual *</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="estoque_minimo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estoque Mínimo</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" placeholder="5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="variaveis">
                    <VariaveisManager 
                      variaveis={variaveis} 
                      onChange={setVariaveis}
                    />
                  </TabsContent>
                  
                  <TabsContent value="descricoes">
                    <DescricoesManager 
                      descricoes={descricoes} 
                      onChange={setDescricoes}
                    />
                  </TabsContent>
                  
                  <TabsContent value="imagens">
                    <ImagensManager 
                      imagens={imagens} 
                      onChange={setImagens}
                    />
                  </TabsContent>
                  
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Link to="/dashboard/produtos">
                      <Button variant="outline" type="button">
                        Cancelar
                      </Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </form>
              </Tabs>
            </Form>
          </CardContent>
        </Card>
        
        {showPreview && (
          <div className="w-96 sticky top-6">
            <ProductPreview
              nome={watchedValues.nome || ''}
              preco={watchedValues.preco || 0}
              categoria={watchedValues.categoria || ''}
              variaveis={variaveis}
              descricoes={descricoes}
              imagens={imagens}
              estoque={watchedValues.estoque || 0}
              estoqueMinimo={watchedValues.estoque_minimo || 5}
              id_produto={produto.id_produto}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProdutoPage;
