import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useContas } from '@/hooks/useContas';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Key, Database, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const ApiPage = () => {
  const { user } = useAuth();
  const { conta, apiKey, loading, refetch, gerarApiKey, revogarApiKey } = useContas();
  const { toast } = useToast();
  const [isRevokingKey, setIsRevokingKey] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copiado!', description: 'Conteúdo copiado para a área de transferência.' });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao copiar.', variant: 'destructive' });
    }
  };

  const revogarChave = async () => {
    if (!user) return;
    setIsRevokingKey(true);
    try {
      await gerarApiKey(); // rotaciona: revoga a antiga e gera nova
      toast({ title: 'Chave revogada!', description: 'Nova chave gerada. Atualize seus endpoints.' });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao revogar a chave.', variant: 'destructive' });
    } finally {
      setIsRevokingKey(false);
      setShowRevokeDialog(false);
    }
  };

  const baseUrl = `${import.meta.env.VITE_API_URL || window.location.origin}/api/v1`;

  return (
    <div className="saas-page-container">
      {/* Page Header */}
      <div className="saas-page-header">
        <div>
          <h1 className="saas-page-title">Documentação API</h1>
          <p className="saas-page-subtitle">Integre seus produtos via API REST com sua loja.</p>
        </div>
      </div>

      {/* API Key Card */}
      <div className="saas-panel">
        <div className="saas-panel-header">
          <div className="saas-panel-title-row">
            <div className="saas-panel-icon-wrap success">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h2 className="saas-panel-title">Sua Chave de API</h2>
              <p className="saas-panel-subtitle">Use este token em todos os requests da API</p>
            </div>
          </div>
          <div className="saas-api-status-badge">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Ativa</span>
          </div>
        </div>
        <div className="saas-panel-body">
          <div className="saas-api-key-row">
            <Input
              value={apiKey?.keysecret || 'Carregando...'}
              readOnly
              className="saas-api-key-input"
            />
            <button
              onClick={() => copyToClipboard(apiKey?.keysecret || '')}
              disabled={loading}
              className="saas-api-icon-btn"
              title="Copiar chave"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowRevokeDialog(true)}
              disabled={loading || isRevokingKey}
              className="saas-api-revoke-btn"
              title="Revogar e gerar nova chave"
            >
              <RotateCcw className="h-4 w-4" />
              {isRevokingKey ? 'Revogando...' : 'Revogar'}
            </button>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="saas-api-grid">

        {/* GET */}
        <div className="saas-panel">
          <div className="saas-panel-header">
            <div className="saas-panel-title-row">
              <span className="saas-method-badge get">GET</span>
              <div>
                <h2 className="saas-panel-title">Listar Produtos</h2>
                <p className="saas-panel-subtitle">Retorna todos os produtos e variações</p>
              </div>
            </div>
          </div>
          <div className="saas-panel-body saas-api-body">
            <div className="saas-api-field">
              <p className="saas-api-label">Endpoint</p>
              <div className="saas-api-code-row">
                <code className="saas-api-code">{baseUrl}/produtos</code>
                <button onClick={() => copyToClipboard(`${baseUrl}/produtos`)} className="saas-api-copy-btn">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="saas-api-field">
              <p className="saas-api-label">Header obrigatório</p>
              <div className="saas-api-code-row">
                <code className="saas-api-code">x-keysecret: {apiKey?.keysecret}</code>
                <button onClick={() => copyToClipboard(`x-keysecret: ${apiKey?.keysecret}`)} className="saas-api-copy-btn">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="saas-api-field">
              <p className="saas-api-label">Resposta de exemplo</p>
              <pre className="saas-api-pre">{`[
  {
    "id_produto": "prod_abc123",
    "nome": "Camiseta Básica",
    "preco": 29.90,
    "categoria": "Roupas",
    "estoque": 50,
    "variaveis": [
      {
        "id": "var_def456",
        "nome": "Cor Azul - Tamanho M",
        "estoque": 20,
        "preco": 35.90
      }
    ]
  }
]`}</pre>
            </div>
          </div>
        </div>

        {/* POST */}
        <div className="saas-panel">
          <div className="saas-panel-header">
            <div className="saas-panel-title-row">
              <span className="saas-method-badge post">POST</span>
              <div>
                <h2 className="saas-panel-title">Diminuir Estoque</h2>
                <p className="saas-panel-subtitle">Registra vendas e atualiza o estoque</p>
              </div>
            </div>
          </div>
          <div className="saas-panel-body saas-api-body">
            <div className="saas-api-info-box">
              ✨ Use o <strong>mesmo endpoint</strong> para produtos e variações! Para produtos use <code>id_produto</code>, para variações use <code>id_variavel</code>.
            </div>
            <div className="saas-api-field">
              <p className="saas-api-label">Endpoint</p>
              <div className="saas-api-code-row">
                <code className="saas-api-code">PATCH {baseUrl}/estoque</code>
                <button onClick={() => copyToClipboard(`${baseUrl}/estoque`)} className="saas-api-copy-btn">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {[
              {
                title: '1️⃣ Vender Produto Principal',
                code: `{\n  "produtos": [\n    { "id_produto": "abc123def456...", "quantidade": 1 }\n  ]\n}`,
              },
              {
                title: '2️⃣ Vender Variação',
                code: `{\n  "produtos": [\n    { "id_variavel": "var_azul_m_123", "quantidade": 2 }\n  ]\n}`,
              },
              {
                title: '3️⃣ Com Descrição',
                code: `{\n  "produtos": [\n    { "id_produto": "abc123...", "quantidade": 2 },\n    { "id_variavel": "var_azul_m", "quantidade": 1 }\n  ],\n  "descricao": "Venda WhatsApp - Cliente João"\n}`,
              },
            ].map(({ title, code }) => (
              <div key={title} className="saas-api-field">
                <p className="saas-api-label">{title}</p>
                <div className="saas-api-pre-wrap">
                  <button onClick={() => copyToClipboard(code)} className="saas-api-pre-copy">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <pre className="saas-api-pre">{code}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* cURL Examples */}
        <div className="saas-panel">
          <div className="saas-panel-header">
            <div className="saas-panel-title-row">
              <div className="saas-panel-icon-wrap" style={{ background: 'hsl(220 14% 96%)', color: 'hsl(220 13% 40%)' }}>
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h2 className="saas-panel-title">Exemplos cURL</h2>
                <p className="saas-panel-subtitle">Exemplos prontos para testar</p>
              </div>
            </div>
          </div>
          <div className="saas-panel-body saas-api-body">
            {[
              {
                label: 'Listar produtos',
                code: `curl -H "x-keysecret: ${apiKey?.keysecret}" \\\n  "${baseUrl}/produtos"`,
              },
              {
                label: 'Diminuir estoque (produto)',
                code: `curl -X PATCH "${baseUrl}/estoque" \\\n  -H "Content-Type: application/json" \\\n  -H "x-keysecret: ${apiKey?.keysecret}" \\\n  -d '{"produtos": [{"id_produto": "SEU_ID", "quantidade": 1}]}'`,
              },
              {
                label: 'Diminuir estoque (variação)',
                code: `curl -X PATCH "${baseUrl}/estoque" \\\n  -H "Content-Type: application/json" \\\n  -H "x-keysecret: ${apiKey?.keysecret}" \\\n  -d '{"produtos": [{"id_variavel": "ID_VARIAVEL", "quantidade": 2}]}'`,
              },
            ].map(({ label, code }) => (
              <div key={label} className="saas-api-field">
                <p className="saas-api-label">{label}</p>
                <div className="saas-api-pre-wrap">
                  <button onClick={() => copyToClipboard(code)} className="saas-api-pre-copy">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <pre className="saas-api-pre">{code}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Codes */}
        <div className="saas-panel">
          <div className="saas-panel-header">
            <div className="saas-panel-title-row">
              <div className="saas-panel-icon-wrap warning">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h2 className="saas-panel-title">Códigos de Erro</h2>
                <p className="saas-panel-subtitle">Referência de status HTTP</p>
              </div>
            </div>
          </div>
          <div className="saas-panel-body saas-api-body">
            <div className="saas-error-grid">
              {[
                { code: '400', label: 'Requisição malformada', desc: 'Campos ausentes ou inválidos' },
                { code: '403', label: 'Não autorizado', desc: 'x-keysecret inválida' },
                { code: '404', label: 'Produto não encontrado', desc: 'Produto inexistente ou sem permissão' },
                { code: '409', label: 'Estoque insuficiente', desc: 'Quantidade maior que o disponível' },
              ].map(({ code, label, desc }) => (
                <div key={code} className="saas-error-item">
                  <span className="saas-error-code">{code}</span>
                  <div>
                    <p className="saas-error-label">{label}</p>
                    <p className="saas-error-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revoke Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent className="border border-border rounded-2xl shadow-lg max-w-md p-0 overflow-hidden">
          <div style={{ background: 'hsl(0 72% 51%)', padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(0 72% 45%)' }}>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-white text-lg font-bold">
                <AlertTriangle className="h-5 w-5" />
                Revogar Chave de API
              </AlertDialogTitle>
            </AlertDialogHeader>
          </div>
          <div className="p-6">
            <AlertDialogDescription className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>
              Ao revogar, a chave antiga <strong>não será mais válida</strong>. Você precisará atualizar todos os seus endpoints com a nova chave gerada.
            </AlertDialogDescription>
            <AlertDialogFooter className="flex gap-3 mt-6 sm:flex-row">
              <AlertDialogCancel
                disabled={isRevokingKey}
                className="flex-1 h-10 rounded-lg font-semibold border border-border"
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={revogarChave}
                disabled={isRevokingKey}
                className="flex-1 h-10 rounded-lg font-semibold"
                style={{ background: 'hsl(0 72% 51%)', color: 'white', border: 'none' }}
              >
                {isRevokingKey ? 'Revogando...' : 'Sim, Revogar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ApiPage;
