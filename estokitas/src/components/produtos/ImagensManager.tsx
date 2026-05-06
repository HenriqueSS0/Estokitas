import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';

interface ImagemProduto {
  id: string;
  url: string;
  nome?: string;
}

interface ImagensManagerProps {
  imagens: ImagemProduto[];
  onChange: (imagens: ImagemProduto[]) => void;
}

export const ImagensManager = ({ imagens, onChange }: ImagensManagerProps) => {
  const [novaImagem, setNovaImagem] = useState({ url: '', nome: '' });

  const adicionarImagem = () => {
    if (!novaImagem.url.trim()) return;
    
    const imagem: ImagemProduto = {
      id: crypto.randomUUID(),
      url: novaImagem.url.trim(),
      nome: novaImagem.nome.trim() || 'Imagem do produto'
    };
    
    onChange([...imagens, imagem]);
    setNovaImagem({ url: '', nome: '' });
  };

  const removerImagem = (id: string) => {
    const novasImagens = imagens.filter(img => img.id !== id);
    onChange(novasImagens);
  };

  const moverImagem = (index: number, direcao: 'up' | 'down') => {
    if (
      (direcao === 'up' && index === 0) || 
      (direcao === 'down' && index === imagens.length - 1)
    ) return;

    const novasImagens = [...imagens];
    const newIndex = direcao === 'up' ? index - 1 : index + 1;
    [novasImagens[index], novasImagens[newIndex]] = [novasImagens[newIndex], novasImagens[index]];
    onChange(novasImagens);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Imagens do Produto</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Adicione múltiplas imagens. A primeira será a imagem principal.
        </p>
        
        <div className="space-y-2 mb-4">
          <Input
            placeholder="URL da imagem"
            value={novaImagem.url}
            onChange={(e) => setNovaImagem({ ...novaImagem, url: e.target.value })}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Nome da imagem (opcional)"
              value={novaImagem.nome}
              onChange={(e) => setNovaImagem({ ...novaImagem, nome: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && adicionarImagem()}
            />
            <Button 
              type="button" 
              size="sm" 
              onClick={adicionarImagem}
              disabled={!novaImagem.url.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {imagens.map((imagem, index) => (
            <Card key={imagem.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {imagem.url ? (
                      <img 
                        src={imagem.url} 
                        alt={imagem.nome} 
                        className="w-12 h-12 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '';
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {imagem.nome || 'Imagem do produto'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {imagem.url}
                    </p>
                    {index === 0 && (
                      <p className="text-xs text-primary font-medium">Imagem principal</p>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moverImagem(index, 'up')}
                        className="h-6 w-6 p-0"
                      >
                        ↑
                      </Button>
                    )}
                    {index < imagens.length - 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moverImagem(index, 'down')}
                        className="h-6 w-6 p-0"
                      >
                        ↓
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerImagem(imagem.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};