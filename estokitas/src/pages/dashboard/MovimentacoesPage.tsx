import { useState, useEffect } from 'react';
import { ShoppingCart, PackagePlus, ArrowUpDown, Lock, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useVendas } from '@/hooks/useVendas';
import { useProdutos } from '@/hooks/useProdutos';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { VendasFilter } from '@/components/vendas/VendasFilter';
import { MovimentacaoButton } from '@/components/layout/MovimentacaoButton';
import { format, isToday, isWithinInterval, subDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const MovimentacoesPage = () => {
  const { session } = useAuth();
  const { vendas, loading: vendasLoading } = useVendas();
  const { produtos } = useProdutos();
  const [filter, setFilter] = useState<'hoje' | 'ultimos_7_dias' | 'ultimos_30_dias' | 'total' | 'personalizada'>('total');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedProduto, setSelectedProduto] = useState<string>('todos');

  const vendasFiltradas = vendas.filter(venda => {
    const dataVenda = new Date(venda.created_at);
    let passaFiltroPeriodo = false;
    switch (filter) {
      case 'hoje':
        passaFiltroPeriodo = isToday(dataVenda);
        break;
      case 'ultimos_7_dias':
        passaFiltroPeriodo = isWithinInterval(dataVenda, { start: subDays(new Date(), 7), end: new Date() });
        break;
      case 'ultimos_30_dias':
        passaFiltroPeriodo = isWithinInterval(dataVenda, { start: subDays(new Date(), 30), end: new Date() });
        break;
      case 'personalizada':
        passaFiltroPeriodo = selectedDate ? isSameDay(dataVenda, selectedDate) : false;
        break;
      default:
        passaFiltroPeriodo = true;
    }
    const passaFiltroProduto = selectedProduto === 'todos' || venda.id_produto === selectedProduto;
    return passaFiltroPeriodo && passaFiltroProduto;
  });

  const vendas_apenas = vendasFiltradas.filter(v => v.tipo === 'venda');
  const entradas = vendasFiltradas.filter(v => v.tipo === 'entrada');
  const totalVendas = vendas_apenas.length;
  const totalReceita = vendas_apenas.reduce((sum, venda) => sum + venda.total, 0);

  const kpiCards = [
    {
      label: 'Total de Vendas',
      value: totalVendas,
      icon: ShoppingCart,
      color: 'indigo',
      sub: 'no período selecionado',
    },
    {
      label: 'Faturamento',
      value: `R$ ${totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'emerald',
      sub: 'receita no período',
      large: true,
    },
    {
      label: 'Entradas',
      value: entradas.length,
      icon: PackagePlus,
      color: 'violet',
      sub: 'reposições de estoque',
    },
    {
      label: 'Ticket Médio',
      value: `R$ ${totalVendas > 0 ? (totalReceita / totalVendas).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}`,
      icon: TrendingUp,
      color: 'amber',
      sub: 'por venda',
      large: true,
    },
  ];

  return (
    <div className="saas-page-container">
      {/* Page Header */}
      <div className="saas-page-header">
        <div>
          <h1 className="saas-page-title">Movimentações</h1>
          <p className="saas-page-subtitle">Controle total de vendas e entradas de estoque.</p>
        </div>
        <div className="saas-page-actions" style={{ gap: '0.5rem', display: 'flex', flexWrap: 'wrap' }}>
          <MovimentacaoButton />
          <VendasFilter
            filter={filter}
            onFilterChange={setFilter}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedProduto={selectedProduto}
            onProdutoChange={setSelectedProduto}
            produtos={produtos.map(p => ({ id: p.id_produto, nome: p.nome }))}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="saas-kpi-grid">
        {kpiCards.map((card) => {
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

      {/* History Panel */}
      <div className="saas-panel">
        <div className="saas-panel-header">
          <div className="saas-panel-title-row">
            <div className="saas-panel-icon-wrap success">
              <ArrowUpDown className="h-4 w-4" />
            </div>
            <div>
              <h2 className="saas-panel-title">Histórico de Movimentações</h2>
              <p className="saas-panel-subtitle">Todas as transações do período filtrado</p>
            </div>
          </div>
          {vendasFiltradas.length > 0 && (
            <span className="saas-alert-badge" style={{ background: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary))' }}>
              {vendasFiltradas.length}
            </span>
          )}
        </div>

        <div className="saas-panel-body" style={{ padding: '1rem 1.25rem' }}>
          {vendasLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading-spinner" />
            </div>
          ) : vendasFiltradas.length === 0 ? (
            <div className="saas-empty-state">
              <div className="saas-empty-icon">📊</div>
              <p className="saas-empty-title">Nenhuma movimentação</p>
              <p className="saas-empty-sub">Registre vendas ou entradas para ver aqui.</p>
              <div style={{ marginTop: '1rem' }}>
                <MovimentacaoButton />
              </div>
            </div>
          ) : (
            <div className="saas-mov-list">
              {vendasFiltradas
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((movimentacao) => (
                  <div
                    key={movimentacao.id}
                    className={`saas-mov-item ${movimentacao.tipo === 'venda' ? 'venda' : 'entrada'}`}
                  >
                    <div className={`saas-transaction-icon ${movimentacao.tipo === 'venda' ? 'danger' : 'success'}`}>
                      {movimentacao.tipo === 'venda' ? (
                        <ShoppingCart className="h-4 w-4" />
                      ) : (
                        <PackagePlus className="h-4 w-4" />
                      )}
                    </div>
                    <div className="saas-transaction-info">
                      <p className="saas-transaction-name">{movimentacao.nome_produto}</p>
                      <div className="saas-transaction-meta">
                        <span>{movimentacao.quantidade} un.</span>
                        <span
                          className="saas-mov-badge"
                          style={{
                            background: movimentacao.tipo === 'venda'
                              ? 'hsl(0 72% 51% / 0.1)'
                              : 'hsl(152 76% 35% / 0.1)',
                            color: movimentacao.tipo === 'venda'
                              ? 'hsl(0 72% 45%)'
                              : 'hsl(152 76% 35%)',
                          }}
                        >
                          {movimentacao.tipo === 'venda' ? 'VENDA' : 'ENTRADA'}
                        </span>
                        {movimentacao.descricao && (
                          <span style={{ opacity: 0.6 }}>• {movimentacao.descricao}</span>
                        )}
                      </div>
                      <p className="saas-mov-date">
                        {format(new Date(movimentacao.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <p className={`saas-transaction-value ${movimentacao.tipo === 'venda' ? 'danger' : 'success'}`}>
                      {movimentacao.tipo === 'venda' ? '−' : '+'} R$ {movimentacao.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovimentacoesPage;