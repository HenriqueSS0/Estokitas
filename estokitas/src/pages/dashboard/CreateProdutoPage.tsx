import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProdutos } from '@/hooks/useProdutos';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { VariaveisManager } from '@/components/produtos/VariaveisManager';
import { DescricoesManager } from '@/components/produtos/DescricoesManager';
import { ImagensManager } from '@/components/produtos/ImagensManager';
import { ProductPreview } from '@/components/produtos/ProductPreview';
import { Link, useNavigate } from 'react-router-dom';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  preco: z.string().min(1, 'Preço é obrigatório'),
  categoria: z.string().optional(),
  estoque: z.string().min(1, 'Estoque é obrigatório'),
  estoque_minimo: z.string().min(1, 'Estoque mínimo é obrigatório'),
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

export const CreateProdutoPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [variaveis, setVariaveis] = useState<Variavel[]>([]);
  const [descricoes, setDescricoes] = useState<Descricao[]>([]);
  const [imagens, setImagens] = useState<ImagemProduto[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { addProduto } = useProdutos();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      preco: '',
      categoria: '',
      estoque: '',
      estoque_minimo: '5',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await addProduto({
        nome: values.nome,
        preco: parseFloat(values.preco),
        categoria: values.categoria || null,
        estoque: parseInt(values.estoque),
        estoque_minimo: parseInt(values.estoque_minimo),
        variaveis: variaveis.length > 0 ? variaveis : [],
        descricoes: descricoes.length > 0 ? descricoes : [],
        imagens: imagens.length > 0 ? imagens : [],
        imagem_url: imagens.length > 0 ? imagens[0].url : undefined,
      });

      toast.success('Produto adicionado com sucesso!');
      navigate('/dashboard/produtos');
    } catch (error) {
      console.error('Error adding produto:', error);
      toast.error('Erro ao adicionar produto');
    } finally {
      setLoading(false);
    }
  };

  const watchedValues = form.watch();



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
            <h1 className="text-3xl font-bold text-gradient">Criar Produto</h1>
            <p className="text-muted-foreground">Adicione um novo produto ao seu estoque</p>
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
              Preencha os dados do produto que deseja adicionar. Use as abas para organizar as informações.
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Produto *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Camiseta Básica" />
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
                              <Input {...field} placeholder="Ex: Roupas, Acessórios" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="preco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço (R$) *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                step="0.01"
                                min="0"
                                placeholder="0.00" 
                              />
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
                            <FormLabel>Estoque Inicial *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="0"
                                placeholder="0" 
                              />
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
                              <Input 
                                {...field} 
                                type="number" 
                                min="0"
                                placeholder="5" 
                              />
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
                  
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Link to="/dashboard/produtos">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Salvando...' : 'Adicionar Produto'}
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
              preco={parseFloat(watchedValues.preco) || 0}
              categoria={watchedValues.categoria || ''}
              variaveis={variaveis}
              descricoes={descricoes}
              imagens={imagens}
              estoque={parseInt(watchedValues.estoque) || 0}
              estoqueMinimo={parseInt(watchedValues.estoque_minimo) || 5}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProdutoPage;
