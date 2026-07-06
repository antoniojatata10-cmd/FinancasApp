import React from 'react';
import { Calendar, Download, TrendingUp, TrendingDown, RefreshCw, Layers, Award, ShieldAlert } from 'lucide-react';

export default function RelatoriosView({ launches, categories, role, userEmail, userId }) {
  // FIX: CriadoPor stores user_id (UUID), not email
  const filteredLaunches = launches.filter(l => 
    role === 'admin' || l.CriadoPor === userId
  );

  // Group by months dynamically
  const monthlySummary = {};
  filteredLaunches.forEach(l => {
    const d = new Date(l.Data);
    if (isNaN(d)) return;
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const name = d.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

    if (!monthlySummary[key]) {
      monthlySummary[key] = {
        key,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        entradas: 0,
        saidas: 0,
        saldo: 0,
        count: 0
      };
    }
    if (l.Tipo === 'Entrada') {
      monthlySummary[key].entradas += Number(l.Valor);
    } else {
      monthlySummary[key].saidas += Number(l.Valor);
    }
    monthlySummary[key].count += 1;
  });

  // Convert map to array and sort chronologically (most recent first)
  const reportRows = Object.values(monthlySummary).sort((a, b) => b.key.localeCompare(a.key));

  // Calculate comparisons (Current Month vs Previous Month)
  let growthEntradas = 0;
  let growthSaidas = 0;
  let statusText = 'Equilibrado';
  let statusIcon = <Award size={20} style={{ color: 'var(--color-success)' }} />;
  let statusColorClass = 'var(--color-success)';

  if (reportRows.length >= 2) {
    const cur = reportRows[0];
    const prev = reportRows[1];

    growthEntradas = prev.entradas > 0 ? ((cur.entradas - prev.entradas) / prev.entradas) * 100 : 0;
    growthSaidas = prev.saidas > 0 ? ((cur.saidas - prev.saidas) / prev.saidas) * 100 : 0;

    const netSavingsRatio = cur.entradas > 0 ? (cur.entradas - cur.saidas) / cur.entradas : 0;

    if (netSavingsRatio > 0.2) {
      statusText = 'Bom Mês';
      statusIcon = <Award size={20} style={{ color: 'var(--color-success)' }} />;
      statusColorClass = 'var(--color-success)';
    } else if (netSavingsRatio > 0) {
      statusText = 'Mês Estável';
      statusIcon = <Layers size={20} style={{ color: 'var(--color-accent)' }} />;
      statusColorClass = 'var(--color-accent)';
    } else {
      statusText = 'Atenção';
      statusIcon = <ShieldAlert size={20} style={{ color: 'var(--color-error)' }} />;
      statusColorClass = 'var(--color-error)';
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Relatórios Financeiros</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Histórico consolidado mensal e exportação de templates do Google Sheets
        </p>
      </div>

      {/* Comparisons Panel */}
      {reportRows.length >= 2 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {/* Card: Status Indicator */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '12px', borderRadius: '12px'
            }}>
              {statusIcon}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Indicador Visual</p>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '2px 0', color: statusColorClass }}>
                {statusText}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Comparação vs mês anterior</span>
            </div>
          </div>

          {/* Card: Entradas Growth */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              background: growthEntradas >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: growthEntradas >= 0 ? 'var(--color-success)' : 'var(--color-error)',
              padding: '12px', borderRadius: '12px'
            }}>
              {growthEntradas >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Variação de Receitas</p>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '2px 0', color: growthEntradas >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                {growthEntradas >= 0 ? '+' : ''}{growthEntradas.toFixed(1)}%
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Crescimento de entradas</span>
            </div>
          </div>

          {/* Card: Saídas Growth */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              background: growthSaidas <= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: growthSaidas <= 0 ? 'var(--color-success)' : 'var(--color-error)',
              padding: '12px', borderRadius: '12px'
            }}>
              {growthSaidas <= 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Variação de Gastos</p>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '2px 0', color: growthSaidas <= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                {growthSaidas >= 0 ? '+' : ''}{growthSaidas.toFixed(1)}%
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Evolução de despesas</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Gere mais de 2 meses de lançamentos históricos para habilitar comparações mensais automáticas.
        </div>
      )}

      {/* Monthly Reports Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tabela Consolidada Mensal</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={12} /> Atualização em tempo real
          </span>
        </div>

        {reportRows.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Nenhum lançamento no histórico</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  <th style={{ padding: '10px 16px', fontWeight: 700 }}>Mês / Período</th>
                  <th style={{ padding: '10px 16px', fontWeight: 700 }}>Lançamentos</th>
                  <th style={{ padding: '10px 16px', fontWeight: 700 }}>Entradas</th>
                  <th style={{ padding: '10px 16px', fontWeight: 700 }}>Saídas</th>
                  <th style={{ padding: '10px 16px', fontWeight: 700 }}>Saldo Mensal</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map(row => {
                  const isPositive = row.entradas >= row.saidas;
                  return (
                    <tr key={row.key} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{row.count} itens</td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-success)', fontWeight: 600 }}>
                        {row.entradas.toLocaleString('pt-PT')} Kz
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-error)', fontWeight: 600 }}>
                        {row.saidas.toLocaleString('pt-PT')} Kz
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        fontWeight: 700,
                        color: isPositive ? 'var(--color-success)' : 'var(--color-error)'
                      }}>
                        {(row.entradas - row.saidas).toLocaleString('pt-PT')} Kz
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Google Sheets Handoff / Download Center */}
      <div className="glass-panel" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(16,185,129,0.05) 100%)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid rgba(16, 185, 129, 0.2)'
      }}>
        <div style={{ display: 'flex', gap: '16px', flex: '1 1 400px' }}>
          <div style={{
            background: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Download size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Planilha Principal do Google Sheets</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
              Baixe o arquivo de semente estruturado <strong>Financas_Appsheet_Template.xlsx</strong>. Contém as abas formatadas <em>Categorias</em>, <em>Lancamentos</em>, <em>Usuarios</em> e <em>Resumo_Mensal/Anual</em> pronto para ser importado no AppSheet e sincronizado no Google Drive.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>• Fórmulas de cores ativas</span>
              <span>• ID Únicos definidos</span>
              <span>• Dados fictícios pré-carregados</span>
            </div>
          </div>
        </div>

        <a href="/Financas_Appsheet_Template.xlsx" download className="btn btn-primary" style={{
          backgroundColor: 'var(--color-success)',
          color: '#fff',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
          display: 'inline-flex',
          padding: '12px 24px',
          textDecoration: 'none'
        }}>
          <Download size={18} /> Baixar Planilha Template
        </a>
      </div>

    </div>
  );
}
