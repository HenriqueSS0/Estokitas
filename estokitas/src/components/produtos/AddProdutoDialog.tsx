import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProdutos } from '@/hooks/useProdutos';
import { toast } from 'sonner';
import { VariaveisManager } from './VariaveisManager';
import { DescricoesManager } from './DescricoesManager';
import { ImagensManager } from './ImagensManager';
import { ProductPreview } from './ProductPreview';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  preco_compra: z.string().min(1, 'Preço de compra é obrigatório'),
  preco_venda: z.string().min(1, 'Preço de venda é obrigatório'),
  categoria: z.string().optional(),
  estoque: z.string().min(1, 'Estoque é obrigatório'),
  estoque_minimo: z.string().min(1, 'Estoque mínimo é obrigatório'),
});

interface AddProdutoDialogProps {
  variant?: 'button' | 'large';
}

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

export const AddProdutoDialog = ({ variant = 'button' }: AddProdutoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [variaveis, setVariaveis] = useState<Variavel[]>([]);
  const [descricoes, setDescricoes] = useState<Descricao[]>([]);
  const [imagens, setImagens] = useState<ImagemProduto[]>([]);
  const { addProduto } = useProdutos();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      preco_compra: '',
      preco_venda: '',
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
        preco: parseFloat(values.preco_venda), // Manter compatibilidade
        preco_compra: parseFloat(values.preco_compra),
        preco_venda: parseFloat(values.preco_venda),
        categoria: values.categoria || null,
        estoque: parseInt(values.estoque),
        estoque_minimo: parseInt(values.estoque_minimo),
        variaveis: variaveis.length > 0 ? variaveis : [],
        descricoes: descricoes.length > 0 ? descricoes : [],
        imagens: imagens.length > 0 ? imagens : [],
        // Manter compatibilidade com imagem_url
        imagem_url: imagens.length > 0 ? imagens[0].url : undefined,
      });

      toast.success('Produto adicionado com sucesso!');
      setOpen(false);
      form.reset();
      setVariaveis([]);
      setDescricoes([]);
      setImagens([]);
    } catch (error) {
      console.error('Error adding produto:', error);
      toast.error('Erro ao adicionar produto');
    } finally {
      setLoading(false);
    }
  };

  const watchedValues = form.watch();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={variant === 'large' ? 'lg' : 'default'}>
          <Plus className="h-4 w-4 mr-2" />
          {variant === 'large' ? 'Adicionar Primeiro Produto' : 'Adicionar Produto'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Adicionar Produto</DialogTitle>
          <DialogDescription>
            Preencha os dados do produto que deseja adicionar. Use as abas para organizar as informações.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-6 flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
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

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preco_compra"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço de Compra (R$) *</FormLabel>
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
                        name="preco_venda"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço de Venda (R$) *</FormLabel>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Salvando...' : 'Adicionar Produto'}
                    </Button>
                  </div>
                </form>
              </Tabs>
            </Form>
          </div>
          
          <div className="w-80 overflow-y-auto">
            <ProductPreview
              nome={watchedValues.nome || ''}
              preco={parseFloat(watchedValues.preco_venda) || 0}
              precoCompra={parseFloat(watchedValues.preco_compra) || 0}
              precoVenda={parseFloat(watchedValues.preco_venda) || 0}
              categoria={watchedValues.categoria || ''}
              variaveis={variaveis}
              descricoes={descricoes}
              imagens={imagens}
              estoque={parseInt(watchedValues.estoque) || 0}
              estoqueMinimo={parseInt(watchedValues.estoque_minimo) || 5}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};