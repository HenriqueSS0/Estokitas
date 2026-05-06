import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProdutos } from '@/hooks/useProdutos';
import { useToast } from '@/hooks/use-toast';
import { VariaveisManager } from './VariaveisManager';
import { DescricoesManager } from './DescricoesManager';
import { ImagensManager } from './ImagensManager';
import { ProductPreview } from './ProductPreview';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  preco_compra: z.coerce.number().min(0, 'Preço de compra deve ser positivo'),
  preco_venda: z.coerce.number().min(0, 'Preço de venda deve ser positivo'),
  categoria: z.string().optional(),
  estoque: z.coerce.number().min(0, 'Estoque deve ser positivo').int('Estoque deve ser um número inteiro'),
  estoque_minimo: z.coerce.number().min(0, 'Estoque mínimo deve ser positivo').int('Estoque mínimo deve ser um número inteiro'),
});

interface EditProdutoDialogProps {
  produto: {
    id_produto: string;
    nome: string;
    preco: number;
    preco_compra?: number;
    preco_venda?: number;
    categoria?: string;
    imagem_url?: string;
    estoque: number;
    estoque_minimo: number;
    variaveis?: any[];
    descricoes?: any[];
    imagens?: any[];
  };
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

export const EditProdutoDialog = ({ produto }: EditProdutoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [variaveis, setVariaveis] = useState<Variavel[]>(produto.variaveis || []);
  const [descricoes, setDescricoes] = useState<Descricao[]>(produto.descricoes || []);
  const [imagens, setImagens] = useState<ImagemProduto[]>(() => {
    // Migrar imagem_url antiga para o novo sistema se necessário
    if (produto.imagem_url && (!produto.imagens || produto.imagens.length === 0)) {
      return [{
        id: crypto.randomUUID(),
        url: produto.imagem_url,
        nome: 'Imagem principal'
      }];
    }
    return produto.imagens || [];
  });
  const { editProduto } = useProdutos();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: produto.nome,
      preco_compra: produto.preco_compra || 0,
      preco_venda: produto.preco_venda || produto.preco,
      categoria: produto.categoria || '',
      estoque: produto.estoque,
      estoque_minimo: produto.estoque_minimo,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await editProduto(produto.id_produto, {
        ...values,
        preco: values.preco_venda, // Manter compatibilidade
        categoria: values.categoria || null,
        variaveis: variaveis.length > 0 ? variaveis : [],
        descricoes: descricoes.length > 0 ? descricoes : [],
        imagens: imagens.length > 0 ? imagens : [],
        // Manter compatibilidade com imagem_url
        imagem_url: imagens.length > 0 ? imagens[0].url : undefined,
      });
      toast({
        title: "Produto atualizado!",
        description: "As informações do produto foram atualizadas com sucesso.",
      });
      setOpen(false);
      form.reset();
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
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

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preco_compra"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço de Compra (R$) *</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
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
                              <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
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
                      onChange={(novasVariaveis) => {
                        setVariaveis(novasVariaveis);
                      }}
                      onSave={async (novasVariaveis) => {
                        try {
                          await editProduto(produto.id_produto, {
                            variaveis: novasVariaveis,
                          });
                          toast({
                            title: "Variável atualizada!",
                            description: "As alterações foram salvas com sucesso.",
                          });
                        } catch (error: any) {
                          toast({
                            title: "Erro ao salvar",
                            description: error.message || "Ocorreu um erro inesperado.",
                            variant: "destructive",
                          });
                        }
                      }}
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
                    <Button variant="outline" onClick={() => setOpen(false)} type="button">
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </form>
              </Tabs>
            </Form>
          </div>
          
          <div className="w-80 overflow-y-auto">
            <ProductPreview
              nome={watchedValues.nome || ''}
              preco={watchedValues.preco_venda || 0}
              precoCompra={watchedValues.preco_compra || 0}
              precoVenda={watchedValues.preco_venda || 0}
              categoria={watchedValues.categoria || ''}
              variaveis={variaveis}
              descricoes={descricoes}
              imagens={imagens}
              estoque={watchedValues.estoque || 0}
              estoqueMinimo={watchedValues.estoque_minimo || 5}
              id_produto={produto.id_produto}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};