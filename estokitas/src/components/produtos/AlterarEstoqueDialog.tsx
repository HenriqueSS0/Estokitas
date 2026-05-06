import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Plus, Minus } from 'lucide-react';
import { useProdutos } from '@/hooks/useProdutos';
import { useToast } from '@/hooks/use-toast';

interface AlterarEstoqueDialogProps {
  produto: {
    id_produto: string;
    nome: string;
    estoque: number;
  };
}

export const AlterarEstoqueDialog = ({ produto }: AlterarEstoqueDialogProps) => {
  const [open, setOpen] = useState(false);
  const [novoEstoque, setNovoEstoque] = useState(produto.estoque);
  const [loading, setLoading] = useState(false);
  const { editProduto } = useProdutos();
  const { toast } = useToast();

  const handleSalvar = async () => {
    setLoading(true);
    try {
      await editProduto(produto.id_produto, { estoque: novoEstoque });
      toast({
        title: "Estoque atualizado!",
        description: `Estoque de "${produto.nome}" atualizado para ${novoEstoque}.`,
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar estoque",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const adjustEstoque = (increment: number) => {
    const newValue = Math.max(0, novoEstoque + increment);
    setNovoEstoque(newValue);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Package className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Estoque</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Produto: {produto.nome}</Label>
            <p className="text-sm text-muted-foreground">Estoque atual: {produto.estoque}</p>
          </div>
          
          <div className="space-y-2">
            <Label>Novo Estoque</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustEstoque(-1)}
                disabled={novoEstoque <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={novoEstoque}
                onChange={(e) => setNovoEstoque(Math.max(0, parseInt(e.target.value) || 0))}
                className="text-center"
                min="0"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustEstoque(1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};