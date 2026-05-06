import { useEffect } from 'react';
import { useProdutos } from '@/hooks/useProdutos';
import { useVendas } from '@/hooks/useVendas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Boxes, TrendingUp, DollarSign, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const DashboardPage = () => {
  const { loading, session } = useAuth();
  const { produtos, loading: produtosLoading } = useProdutos();
  const { vendas, loading: vendasLoading } = useVendas();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner" />
      </div>
    );
  }

  // Métricas
  const totalProdutos = produtos.length;
  const totalEstoque = produtos.reduce((acc, produto) => acc + produto.estoque, 0);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vendasHoje = vendas.filter(venda => {
    const dataVenda = new Date(venda.created_at);
    dataVenda.setHours(0, 0, 0, 0);
    return dataVenda.getTime() === hoje.getTime();
  });

  const soVendasHoje = vendasHoje.filter(v => v.tipo === 'venda' || !v.tipo);
  const totalVendasHoje = soVendasHoje.length;

  const faturamentoHoje = vendasHoje.reduce((acc, venda) => {
    return venda.tipo === 'entrada' ? acc - venda.total : acc + venda.total;
  }, 0);

  const produtosEstoqueBaixo = produtos.filter(produto =>
    produto.estoque <= produto.estoque_minimo && produto.estoque > 0
  );
  const produtosSemEstoque = produtos.filter(produto => produto.estoque === 0);

  const variaveisComEstoque: any[] = [];
  produtos.forEach(produto => {
    if (produto.variaveis && produto.variaveis.length > 0) {
      produto.variaveis.forEach((variavel: any) => {
        const estoqueVariavel = variavel.estoque ?? produto.estoque;
        const estoqueMinVariavel = variavel.estoque_minimo ?? produto.estoque_minimo;
        if (estoqueVariavel <= estoqueMinVariavel && estoqueVariavel >= 0) {
          variaveisComEstoque.push({
            ...variavel,
            nome_completo: `${produto.nome} — ${variavel.nome}`,
            estoque: estoqueVariavel,
            estoque_minimo: estoqueMinVariavel,
            produto_pai: produto.nome,
            tipo: 'variavel' as const
          });
        }
      });
    }
  });

  const variaveisEstoqueBaixo = variaveisComEstoque.filter(v => v.estoque > 0);
  const variaveisSemEstoque = variaveisComEstoque.filter(v => v.estoque === 0);

  const vendasRecentes = vendas.slice(0, 5);

  const metricCards = [
    {
      label: 'Total de Produtos',
      value: totalProdutos,
      icon: Package,
      color: 'indigo',
      sub: 'produtos base',
      trend: '+0%',
    },
    {
      label: 'Total em Estoque',
      value: totalEstoque,
      icon: Boxes,
      color: 'violet',
      sub: 'unidades prontas',
      trend: '+0%',
    },
    {
      label: 'Vendas Hoje',
      value: totalVendasHoje,
      icon: TrendingUp,
      color: 'emerald',
      sub: 'negócios fechados',
      trend: '+0%',
    },
    {
      label: 'Faturamento Hoje',
      value: `R$ ${faturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'amber',
      sub: 'receita gerada',
      trend: '+0%',
      large: true,
    },
  ];

  const alertCount = produtosSemEstoque.length + produtosEstoqueBaixo.length + variaveisSemEstoque.length + variaveisEstoqueBaixo.length;

  return (
    <div className="saas-page-container">

      {/* Page header */}
      <div className="saas-page-header">
        <div>
          <h1 className="saas-page-title">Visão Geral</h1>
          <p className="saas-page-subtitle">Acompanhe o desempenho do seu estoque em tempo real.</p>
        </div>
        <div className="saas-page-actions">
          <Link to="/dashboard/movimentacoes">
            <button className="saas-action-btn">Ver movimentações</button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="saas-kpi-grid">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`saas-kpi-card color-${card.color}`}>
              <div className="saas-kpi-header">
                <span className="saas-kpi-label">{card.label}</span>
                <div className={`saas-kpi-icon-wrap color-${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className={`saas-kpi-value ${card.large ? 'text-2xl' : ''}`}>
                {card.value}
              </div>
              <div className="saas-kpi-footer">
                <span className="saas-kpi-sub">{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom grid */}
      <div className="saas-bottom-grid">

        {/* Alertas de Estoque */}
        <div className="saas-panel">
          <div className="saas-panel-header">
            <div className="saas-panel-title-row">
              <div className="saas-panel-icon-wrap warning">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h2 className="saas-panel-title">Alertas de Estoque</h2>
                <p className="saas-panel-subtitle">Produtos que precisam de atenção</p>
              </div>
            </div>
            {alertCount > 0 && (
              <span className="saas-alert-badge">{alertCount}</span>
            )}
          </div>

          <div className="saas-panel-body">
            {alertCount === 0 ? (
              <div className="saas-empty-state">
                <div className="saas-empty-icon">✓</div>
                <p className="saas-empty-title">Estoque 100% OK</p>
                <p className="saas-empty-sub">Nenhum item em falta</p>
              </div>
            ) : (
              <div className="saas-alert-list">
                {produtosSemEstoque.map((produto) => (
                  <div key={produto.id_produto} className="saas-alert-item danger">
                    <div className="saas-alert-dot danger" />
                    <div className="flex-1">
                      <p className="saas-alert-name">{produto.nome}</p>
                      <p className="saas-alert-status danger">Sem estoque</p>
                    </div>
                    <span className="saas-alert-count danger">0</span>
                  </div>
                ))}
                {variaveisSemEstoque.map((variavel) => (
                  <div key={`var-${variavel.id}`} className="saas-alert-item danger">
                    <div className="saas-alert-dot danger" />
                    <div className="flex-1">
                      <p className="saas-alert-name">{variavel.nome_completo}</p>
                      <p className="saas-alert-status danger">Variável zerada</p>
                    </div>
                    <span className="saas-alert-count danger">0</span>
                  </div>
                ))}
                {produtosEstoqueBaixo.map((produto) => (
                  <div key={produto.id_produto} className="saas-alert-item warning">
                    <div className="saas-alert-dot warning" />
                    <div className="flex-1">
                      <p className="saas-alert-name">{produto.nome}</p>
                      <p className="saas-alert-status warning">Estoque baixo</p>
                    </div>
                    <span className="saas-alert-count warning">{produto.estoque}</span>
                  </div>
                ))}
                {variaveisEstoqueBaixo.map((variavel) => (
                  <div key={`var-${variavel.id}`} className="saas-alert-item warning">
                    <div className="saas-alert-dot warning" />
                    <div className="flex-1">
                      <p className="saas-alert-name">{variavel.nome_completo}</p>
                      <p className="saas-alert-status warning">Variável baixa</p>
                    </div>
                    <span className="saas-alert-count warning">{variavel.estoque}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vendas Recentes */}
        <div className="saas-panel">
          <div className="saas-panel-header">
            <div className="saas-panel-title-row">
              <div className="saas-panel-icon-wrap success">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h2 className="saas-panel-title">Vendas Recentes</h2>
                <p className="saas-panel-subtitle">Últimas transações registradas</p>
              </div>
            </div>
            <Link to="/dashboard/movimentacoes">
              <button className="saas-link-btn">Ver todas →</button>
            </Link>
          </div>

          <div className="saas-panel-body">
            {vendasRecentes.length === 0 ? (
              <div className="saas-empty-state">
                <div className="saas-empty-icon">📦</div>
                <p className="saas-empty-title">Nenhuma venda ainda</p>
                <p className="saas-empty-sub">As transações aparecerão aqui</p>
              </div>
            ) : (
              <div className="saas-transaction-list">
                {vendasRecentes.map((venda) => {
                  const isEntrada = venda.tipo === 'entrada';
                  return (
                    <div key={venda.id} className="saas-transaction-item">
                      <div className={`saas-transaction-icon ${isEntrada ? 'danger' : 'success'}`}>
                        {isEntrada ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="saas-transaction-info">
                        <p className="saas-transaction-name">{venda.nome_produto}</p>
                        <p className="saas-transaction-meta">
                          {venda.quantidade} un •{' '}
                          {formatDistanceToNow(new Date(venda.created_at), { addSuffix: true, locale: ptBR })}
                          {isEntrada && <span className="saas-entrada-tag">ENTRADA</span>}
                        </p>
                      </div>
                      <p className={`saas-transaction-value ${isEntrada ? 'danger' : 'success'}`}>
                        {isEntrada ? '−' : '+'} R$ {venda.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};