import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface Descricao {
  tipo: string;
}

interface DescricoesManagerProps {
  descricoes: Descricao[];
  onChange: (descricoes: Descricao[]) => void;
}

export const DescricoesManager = ({ descricoes, onChange }: DescricoesManagerProps) => {
  const [novaDescricao, setNovaDescricao] = useState({ tipo: '' });

  const adicionarDescricao = () => {
    if (!novaDescricao.tipo.trim()) return;
    
    const descricao: Descricao = {
      tipo: novaDescricao.tipo.trim()
    };
    
    onChange([...descricoes, descricao]);
    setNovaDescricao({ tipo: '' });
  };

  const removerDescricao = (index: number) => {
    const novasDescricoes = descricoes.filter((_, i) => i !== index);
    onChange(novasDescricoes);
  };

  const exemplos = ['Marca', 'Material', 'Origem', 'Garantia'];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Descrições Adicionais</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Exemplos: {exemplos.join(', ')}
        </p>
        
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Tipo (ex: Marca, Material, Garantia)"
            value={novaDescricao.tipo}
            onChange={(e) => setNovaDescricao({ tipo: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && adicionarDescricao()}
          />
          <Button 
            type="button" 
            size="sm" 
            onClick={adicionarDescricao}
            disabled={!novaDescricao.tipo.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {descricoes.map((descricao, index) => (
            <Card key={index}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-medium text-sm">{descricao.tipo}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removerDescricao(index)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};