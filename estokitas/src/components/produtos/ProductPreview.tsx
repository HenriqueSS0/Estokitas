import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Eye } from 'lucide-react';
import { IdDisplayModal } from '@/components/ui/id-display-modal';
import { useState } from 'react';

interface Variavel {
  id: string;
  nome: string;
  estoque?: number;
  preco?: number;
  preco_compra?: number;
  preco_venda?: number;
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

interface ProductPreviewProps {
  nome: string;
  preco: number;
  precoCompra?: number;
  precoVenda?: number;
  categoria?: string;
  variaveis: Variavel[];
  descricoes: Descricao[];
  imagens: ImagemProduto[];
  estoque: number;
  estoqueMinimo: number;
  id_produto?: string;
}

export const ProductPreview = ({
  nome,
  preco,
  precoCompra,
  precoVenda,
  categoria,
  variaveis,
  descricoes,
  imagens,
  estoque,
  estoqueMinimo,
  id_produto
}: ProductPreviewProps) => {
  const [modalData, setModalData] = useState<{isOpen: boolean, id: string, title: string}>({
    isOpen: false,
    id: '',
    title: ''
  });

  const imagemPrincipal = imagens[0];
  const outrasImagens = imagens.slice(1);

  const showVariableId = (id: string) => {
    setModalData({
      isOpen: true,
      id,
      title: 'ID da Variável'
    });
  };

  const showProductId = (id: string) => {
    setModalData({
      isOpen: true,
      id,
      title: 'ID do Produto'
    });
  };

  const closeModal = () => {
    setModalData({
      isOpen: false,
      id: '',
      title: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Preview do Produto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Imagem Principal */}
        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
          {imagemPrincipal?.url ? (
            <img 
              src={imagemPrincipal.url} 
              alt={imagemPrincipal.nome} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Outras Imagens */}
        {outrasImagens.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {outrasImagens.map((imagem) => (
              <div key={imagem.id} className="w-16 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                <img 
                  src={imagem.url} 
                  alt={imagem.nome} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Nome e Preço */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-xl">{nome || 'Nome do Produto'}</h3>
            {id_produto && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => showProductId(id_produto)}
                className="h-6 px-2 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                ID
              </Button>
            )}
          </div>
          {precoVenda !== undefined ? (
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">
                R$ {Number(precoVenda).toFixed(2)}
                <span className="text-xs text-muted-foreground ml-1">(venda)</span>
              </p>
              {precoCompra !== undefined && precoCompra > 0 && (
                <p className="text-sm text-muted-foreground">
                  Compra: R$ {Number(precoCompra).toFixed(2)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-2xl font-bold text-primary">
              R$ {preco ? Number(preco).toFixed(2) : '0.00'}
            </p>
          )}
        </div>

        {/* Categoria */}
        {categoria && (
          <div>
            <Badge variant="outline">{categoria}</Badge>
          </div>
        )}

        {/* Estoque */}
        <div className="text-sm">
          <span className={`font-medium ${estoque <= estoqueMinimo ? 'text-destructive' : 'text-muted-foreground'}`}>
            Estoque: {estoque} unidades
          </span>
          {estoque <= estoqueMinimo && (
            <span className="text-destructive"> (Baixo estoque!)</span>
          )}
        </div>

        {/* Variáveis */}
        {variaveis.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium">Variações disponíveis:</h4>
              {variaveis.map((variavel, index) => (
                <div key={variavel.id || index}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {variavel.nome}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showVariableId(variavel.id)}
                      className="h-5 px-1 text-xs"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {variavel.preco_venda ? (
                      <>
                        <Badge variant="outline" className="text-xs">
                          Venda: R$ {Number(variavel.preco_venda).toFixed(2)}
                        </Badge>
                        {variavel.preco_compra && (
                          <Badge variant="secondary" className="text-xs">
                            Compra: R$ {Number(variavel.preco_compra).toFixed(2)}
                          </Badge>
                        )}
                      </>
                    ) : variavel.preco ? (
                      <Badge variant="outline" className="text-xs">
                        +R$ {Number(variavel.preco).toFixed(2)}
                      </Badge>
                    ) : null}
                    {variavel.estoque !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        Estoque: {variavel.estoque}
                      </Badge>
                    )}
                  </div>
                  {variavel.imagens && variavel.imagens.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {variavel.imagens.slice(0, 3).map((img, imgIndex) => (
                        <div key={img.id || imgIndex} className="w-8 h-8 bg-muted rounded overflow-hidden">
                          <img src={img.url} alt={img.nome} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {variavel.imagens.length > 3 && (
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs">
                          +{variavel.imagens.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Descrições */}
        {descricoes.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">Detalhes:</h4>
              {descricoes.map((descricao, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{descricao.tipo}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <IdDisplayModal
          isOpen={modalData.isOpen}
          onClose={closeModal}
          id={modalData.id}
          title={modalData.title}
        />
      </CardContent>
    </Card>
  );
};