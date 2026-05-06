import { useState, useCallback, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { useProdutos } from '@/hooks/useProdutos';
import { useToast } from '@/hooks/use-toast';

interface ActiveToggleProps {
  produto: {
    id_produto: string;
    nome: string;
    ativo: boolean;
  };
}

export const ActiveToggle = ({ produto }: ActiveToggleProps) => {
  const [loading, setLoading] = useState(false);
  const [localAtivo, setLocalAtivo] = useState(produto.ativo);
  const { editProduto } = useProdutos();
  const { toast } = useToast();

  // Sincronizar estado local quando o produto muda
  useEffect(() => {
    setLocalAtivo(produto.ativo);
  }, [produto.ativo]);

  const handleToggle = useCallback(async (checked: boolean) => {
    if (loading) return;
    
    // Atualização otimista com animação
    setLocalAtivo(checked);
    setLoading(true);
    
    try {
      await editProduto(produto.id_produto, { ativo: checked });
      toast({
        title: checked ? 'Produto ativado' : 'Produto desativado',
        description: `${produto.nome} foi ${checked ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      // Reverte a mudança local em caso de erro
      setLocalAtivo(produto.ativo);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status do produto.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [produto.id_produto, produto.nome, produto.ativo, editProduto, loading, toast]);

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={localAtivo}
        onCheckedChange={handleToggle}
        disabled={loading}
        className="transition-all duration-300 ease-in-out"
      />
      <span 
        className={`text-sm transition-all duration-300 ease-in-out ${
          localAtivo ? 'text-green-600 animate-fade-in' : 'text-muted-foreground animate-fade-in'
        }`}
      >
        {localAtivo ? 'Ativo' : 'Inativo'}
      </span>
      {loading && (
        <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
      )}
    </div>
  );
};