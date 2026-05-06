import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Upload, Edit, Save, X, Eye } from 'lucide-react';
import { IdDisplayModal } from '@/components/ui/id-display-modal';

interface VariavelImagem {
  id: string;
  url: string;
  nome?: string;
}

interface Variavel {
  id: string;
  nome: string;
  estoque?: number;
  estoque_minimo?: number;
  preco?: number;
  preco_compra?: number;
  preco_venda?: number;
  imagens?: VariavelImagem[];
  usar_estoque_principal?: boolean;
}

interface VariaveisManagerProps {
  variaveis: Variavel[];
  onChange: (variaveis: Variavel[]) => void;
  onSave?: (novasVariaveis: Variavel[]) => Promise<void>;
}

export const VariaveisManager = ({ variaveis, onChange, onSave }: VariaveisManagerProps) => {
  const [novaVariavel, setNovaVariavel] = useState({
    nome: '',
    estoque: '',
    estoque_minimo: '',
    preco: '', // Campo legacy
    preco_compra: '',
    preco_venda: '',
    imagens: [] as VariavelImagem[],
    usar_estoque_principal: false
  });
  const [editingVariavel, setEditingVariavel] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Variavel>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [modalData, setModalData] = useState<{isOpen: boolean, id: string, title: string}>({
    isOpen: false,
    id: '',
    title: ''
  });

  const adicionarVariavel = () => {
    if (!novaVariavel.nome.trim()) return;
    
    // Se não usa estoque do produto, o estoque é obrigatório
    if (!novaVariavel.usar_estoque_principal && !novaVariavel.estoque.trim()) {
      return;
    }
    
    const variavel: Variavel = {
      id: crypto.randomUUID(),
      nome: novaVariavel.nome.trim(),
      estoque: novaVariavel.usar_estoque_principal ? undefined : parseInt(novaVariavel.estoque),
      estoque_minimo: novaVariavel.estoque_minimo.trim() ? parseInt(novaVariavel.estoque_minimo) : undefined,
      preco: novaVariavel.preco.trim() ? parseFloat(novaVariavel.preco) : undefined,
      preco_compra: novaVariavel.preco_compra.trim() ? parseFloat(novaVariavel.preco_compra) : undefined,
      preco_venda: novaVariavel.preco_venda.trim() ? parseFloat(novaVariavel.preco_venda) : undefined,
      imagens: novaVariavel.imagens.length > 0 ? novaVariavel.imagens : undefined,
      usar_estoque_principal: novaVariavel.usar_estoque_principal
    };
    
    onChange([...variaveis, variavel]);
    setNovaVariavel({ nome: '', estoque: '', estoque_minimo: '', preco: '', preco_compra: '', preco_venda: '', imagens: [], usar_estoque_principal: false });
    setShowAddForm(false);
  };

  const removerVariavel = (index: number) => {
    const novasVariaveis = variaveis.filter((_, i) => i !== index);
    onChange(novasVariaveis);
  };

  const adicionarImagem = (variavelIndex: number, url: string) => {
    const novasVariaveis = [...variaveis];
    if (!novasVariaveis[variavelIndex].imagens) {
      novasVariaveis[variavelIndex].imagens = [];
    }
    novasVariaveis[variavelIndex].imagens!.push({
      id: crypto.randomUUID(),
      url,
      nome: `Imagem ${(novasVariaveis[variavelIndex].imagens!.length + 1)}`
    });
    onChange(novasVariaveis);
  };

  const removerImagem = (variavelIndex: number, imagemIndex: number) => {
    const novasVariaveis = [...variaveis];
    if (novasVariaveis[variavelIndex].imagens) {
      novasVariaveis[variavelIndex].imagens!.splice(imagemIndex, 1);
    }
    onChange(novasVariaveis);
  };

  const startEditing = (variavel: Variavel) => {
    setEditingVariavel(variavel.id);
    setEditingData({
      nome: variavel.nome,
      estoque: variavel.estoque,
      estoque_minimo: variavel.estoque_minimo,
      preco: variavel.preco,
      preco_compra: variavel.preco_compra,
      preco_venda: variavel.preco_venda,
      imagens: variavel.imagens || [],
      usar_estoque_principal: variavel.usar_estoque_principal || false
    });
  };

  const saveEditing = async (variavelId: string) => {
    // Validar que se não usa estoque do produto, o estoque é obrigatório
    if (!editingData.usar_estoque_principal && (editingData.estoque === undefined || editingData.estoque === null)) {
      return;
    }
    
    // Se usa estoque do produto, remover o estoque próprio da variável
    const dadosAtualizados = { ...editingData };
    if (dadosAtualizados.usar_estoque_principal) {
      dadosAtualizados.estoque = undefined;
    }
    
    const novasVariaveis = variaveis.map(v => 
      v.id === variavelId ? { ...v, ...dadosAtualizados } : v
    );
    onChange(novasVariaveis);
    setEditingVariavel(null);
    setEditingData({});
    
    // Salvar automaticamente no banco de dados
    if (onSave) {
      await onSave(novasVariaveis);
    }
  };

  const cancelEditing = () => {
    setEditingVariavel(null);
    setEditingData({});
  };

  const toggleShowId = (variavelId: string) => {
    setModalData({
      isOpen: true,
      id: variavelId,
      title: 'ID da Variável'
    });
  };

  const closeModal = () => {
    setModalData({
      isOpen: false,
      id: '',
      title: ''
    });
  };

  const adicionarImagemEditing = (url: string) => {
    const novasImagens = [...(editingData.imagens || [])];
    novasImagens.push({
      id: crypto.randomUUID(),
      url,
      nome: `Imagem ${novasImagens.length + 1}`
    });
    setEditingData({ ...editingData, imagens: novasImagens });
  };

  const removerImagemEditing = (imagemIndex: number) => {
    const novasImagens = [...(editingData.imagens || [])];
    novasImagens.splice(imagemIndex, 1);
    setEditingData({ ...editingData, imagens: novasImagens });
  };

  const exemplos = ['Cor Azul', 'Tamanho P', 'Material Algodão', 'Modelo 2024'];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Variáveis do Produto</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Cada variável é única. Campos opcionais usam os valores do produto principal se não preenchidos.
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Exemplos: {exemplos.join(', ')}
        </p>
        
        {!showAddForm && (
          <Button 
            type="button" 
            onClick={() => setShowAddForm(true)}
            className="w-full mb-4"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Nova Variável
          </Button>
        )}

        {showAddForm && (
          <Card className="p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Adicionar Nova Variável</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setNovaVariavel({ nome: '', estoque: '', estoque_minimo: '', preco: '', preco_compra: '', preco_venda: '', imagens: [], usar_estoque_principal: false });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
            <Input
              placeholder="Nome da variável (ex: Cor Azul)"
              value={novaVariavel.nome}
              onChange={(e) => setNovaVariavel({ ...novaVariavel, nome: e.target.value })}
            />
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <Switch
                checked={novaVariavel.usar_estoque_principal}
                onCheckedChange={(checked) => setNovaVariavel({ ...novaVariavel, usar_estoque_principal: checked })}
              />
              <Label className="text-sm cursor-pointer" onClick={() => setNovaVariavel({ ...novaVariavel, usar_estoque_principal: !novaVariavel.usar_estoque_principal })}>
                Utilizar estoque do produto principal
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder={novaVariavel.usar_estoque_principal ? "Usando estoque do produto" : "Estoque (obrigatório)"}
                type="number"
                min="0"
                value={novaVariavel.estoque}
                onChange={(e) => setNovaVariavel({ ...novaVariavel, estoque: e.target.value })}
                disabled={novaVariavel.usar_estoque_principal}
                required={!novaVariavel.usar_estoque_principal}
              />
              <Input
                placeholder="Estoque mín. (opcional)"
                type="number"
                min="0"
                value={novaVariavel.estoque_minimo}
                onChange={(e) => setNovaVariavel({ ...novaVariavel, estoque_minimo: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Preço de Compra (opcional)"
                type="number"
                step="0.01"
                min="0"
                value={novaVariavel.preco_compra}
                onChange={(e) => setNovaVariavel({ ...novaVariavel, preco_compra: e.target.value })}
              />
              <Input
                placeholder="Preço de Venda (opcional)"
                type="number"
                step="0.01"
                min="0"
                value={novaVariavel.preco_venda}
                onChange={(e) => setNovaVariavel({ ...novaVariavel, preco_venda: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Input
                id="nova-imagem-input"
                placeholder="URL da imagem (opcional)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const url = e.currentTarget.value.trim();
                    setNovaVariavel({
                      ...novaVariavel,
                      imagens: [...novaVariavel.imagens, {
                        id: crypto.randomUUID(),
                        url,
                        nome: `Imagem ${novaVariavel.imagens.length + 1}`
                      }]
                    });
                    e.currentTarget.value = '';
                  }
                }}
              />
              <Button 
                type="button" 
                size="sm" 
                onClick={() => {
                  const input = document.getElementById('nova-imagem-input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    const url = input.value.trim();
                    setNovaVariavel({
                      ...novaVariavel,
                      imagens: [...novaVariavel.imagens, {
                        id: crypto.randomUUID(),
                        url,
                        nome: `Imagem ${novaVariavel.imagens.length + 1}`
                      }]
                    });
                    input.value = '';
                  }
                }}
                disabled={false}
              >
                <Upload className="h-4 w-4" />
                Imagem
              </Button>
            </div>
            <Button 
              type="button" 
              size="sm" 
              onClick={adicionarVariavel}
              disabled={!novaVariavel.nome.trim() || (!novaVariavel.usar_estoque_principal && !novaVariavel.estoque.trim())}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Variável
            </Button>
            {novaVariavel.imagens.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {novaVariavel.imagens.map((img, index) => (
                  <div key={img.id} className="relative">
                    <img src={img.url} alt={img.nome} className="w-16 h-16 object-cover rounded border" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setNovaVariavel({
                        ...novaVariavel,
                        imagens: novaVariavel.imagens.filter((_, i) => i !== index)
                      })}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {variaveis.map((variavel, indexVariavel) => (
            <Card key={variavel.id} className="p-4">
              {editingVariavel === variavel.id ? (
                // Modo de edição
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Editando Variável</h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => saveEditing(variavel.id)}
                        disabled={!editingData.usar_estoque_principal && (editingData.estoque === undefined || editingData.estoque === null)}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Salvar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Input
                      placeholder="Nome da variável"
                      value={editingData.nome || ''}
                      onChange={(e) => setEditingData({ ...editingData, nome: e.target.value })}
                    />
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                      <Switch
                        checked={editingData.usar_estoque_principal || false}
                        onCheckedChange={(checked) => setEditingData({ ...editingData, usar_estoque_principal: checked })}
                      />
                      <Label className="text-sm cursor-pointer" onClick={() => setEditingData({ ...editingData, usar_estoque_principal: !editingData.usar_estoque_principal })}>
                        Utilizar estoque do produto principal
                      </Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder={editingData.usar_estoque_principal ? "Usando estoque do produto" : "Estoque (obrigatório)"}
                        type="number"
                        min="0"
                        value={editingData.estoque?.toString() || ''}
                        onChange={(e) => setEditingData({ ...editingData, estoque: e.target.value ? parseInt(e.target.value) : undefined })}
                        disabled={editingData.usar_estoque_principal || false}
                        required={!editingData.usar_estoque_principal}
                      />
                      <Input
                        placeholder="Estoque mín. (opcional)"
                        type="number"
                        min="0"
                        value={editingData.estoque_minimo?.toString() || ''}
                        onChange={(e) => setEditingData({ ...editingData, estoque_minimo: e.target.value ? parseInt(e.target.value) : undefined })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Preço de Compra (opcional)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingData.preco_compra?.toString() || ''}
                        onChange={(e) => setEditingData({ ...editingData, preco_compra: e.target.value ? parseFloat(e.target.value) : undefined })}
                      />
                      <Input
                        placeholder="Preço de Venda (opcional)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingData.preco_venda?.toString() || ''}
                        onChange={(e) => setEditingData({ ...editingData, preco_venda: e.target.value ? parseFloat(e.target.value) : undefined })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id={`edit-imagem-input-${variavel.id}`}
                        placeholder="URL da imagem (opcional)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            adicionarImagemEditing(e.currentTarget.value.trim());
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(`edit-imagem-input-${variavel.id}`) as HTMLInputElement;
                          if (input && input.value.trim()) {
                            adicionarImagemEditing(input.value.trim());
                            input.value = '';
                          }
                        }}
                      >
                        <Upload className="h-4 w-4" />
                        Imagem
                      </Button>
                    </div>
                    {editingData.imagens && editingData.imagens.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {editingData.imagens.map((img, index) => (
                          <div key={img.id} className="relative">
                            <img src={img.url} alt={img.nome} className="w-12 h-12 object-cover rounded border" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removerImagemEditing(index)}
                              className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-destructive text-destructive-foreground rounded-full"
                            >
                              <Trash2 className="h-2 w-2" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Modo de visualização
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{variavel.nome}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleShowId(variavel.id)}
                        className="h-6 px-2 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        ID
                      </Button>
                    </div>
                    {variavel.usar_estoque_principal && (
                      <div className="mb-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-md inline-block">
                        Usando estoque do produto
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Estoque:</span> {variavel.usar_estoque_principal ? 'Do produto' : (variavel.estoque !== undefined ? variavel.estoque : 'Usar do produto')}
                      </div>
                      <div>
                        <span className="font-medium">Est. mín.:</span> {variavel.estoque_minimo || 'Usar do produto'}
                      </div>
                      <div>
                        <span className="font-medium">Preço:</span> {variavel.preco ? `R$ ${Number(variavel.preco).toFixed(2)}` : 'Usar do produto'}
                      </div>
                    </div>
                    {variavel.imagens && variavel.imagens.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium">Imagens:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {variavel.imagens.map((img, imgIndex) => (
                            <div key={img.id} className="relative">
                              <img src={img.url} alt={img.nome} className="w-12 h-12 object-cover rounded border" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(variavel)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerVariavel(indexVariavel)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        <IdDisplayModal
          isOpen={modalData.isOpen}
          onClose={closeModal}
          id={modalData.id}
          title={modalData.title}
        />
      </div>
    </div>
  );
};