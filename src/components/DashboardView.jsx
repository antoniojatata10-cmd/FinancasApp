import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, AlertCircle, Sparkles, CheckCircle2, Star, ShieldAlert, User, Crown, MessageCircle } from 'lucide-react';

export default function DashboardView({ launches, categories, role, userEmail, userId, currentUser, onAddLaunchClick, onGoToChat, onForceAdmin }) {
  console.log("ROLE ATUAL:", role);
  // FIX: CriadoPor stores user_id (UUID), not email. Compare against userId.
  const filteredLaunches = launches.filter(l =>
    role === 'admin' || l.CriadoPor === userId
  );

  // Calculations
  const totalEntradas = filteredLaunches
    .filter(l => l.Tipo === 'Entrada')
    .reduce((sum, l) => sum + Number(l.Valor), 0);

  const totalSaidas = filteredLaunches
    .filter(l => l.Tipo === 'Saida')
    .reduce((sum, l) => sum + Number(l.Valor), 0);

  const saldoConsolidado = totalEntradas - totalSaidas;

  // Group launches by category for category chart and list
  const categorySummary = categories.map(cat => {
    const catLaunches = filteredLaunches.filter(l => l.CategoriaID === cat.CategoriaID);
    const catEntradas = catLaunches.filter(l => l.Tipo === 'Entrada').reduce((sum, l) => sum + Number(l.Valor), 0);
    const catSaidas = catLaunches.filter(l => l.Tipo === 'Saida').reduce((sum, l) => sum + Number(l.Valor), 0);
    const catSaldo = catEntradas - catSaidas;
    return {
      ...cat,
      entradas: catEntradas,
      saidas: catSaidas,
      saldo: catSaldo
    };
  }).filter(c => c.Ativa);

  // Top spending categories (highest outputs)
  const topSpendingCategories = [...categorySummary]
    .filter(c => c.saidas > 0 && c.Subtipo !== 'Divida') // Exclude loan/debt creations from standard spending
    .sort((a, b) => b.saidas - a.saidas)
    .slice(0, 4);

  // Target achievements alerts (for Investments or Savings)
  const achievedTargets = categorySummary.filter(c =>
    (c.Subtipo === 'Investimento' || c.Subtipo === 'Poupanca') &&
    c.Alvo > 0 &&
    c.saldo >= c.Alvo
  );

  // Debt tracking summary (where Subtipo = Divida and outstanding balance is negative)
  const activeDebts = categorySummary.filter(c => c.Subtipo === 'Divida' && c.saldo < 0);

  // Loan tracking summary (where Subtipo = Emprestimo and Pedro still owes us, i.e., positive balance)
  const activeLoans = categorySummary.filter(c => c.Subtipo === 'Emprestimo' && c.saldo > 0);

  // Monthly grouping for historical chart (last 5 months)
  const monthlyDataMap = {};
  filteredLaunches.forEach(l => {
    const dateObj = new Date(l.Data);
    if (isNaN(dateObj)) return;
    const monthKey = `${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
    const monthLabel = dateObj.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });

    if (!monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey] = { label: monthLabel, key: monthKey, entradas: 0, saidas: 0 };
    }
    if (l.Tipo === 'Entrada') {
      monthlyDataMap[monthKey].entradas += Number(l.Valor);
    } else {
      monthlyDataMap[monthKey].saidas += Number(l.Valor);
    }
  });

  const sortedMonthlyData = Object.values(monthlyDataMap)
    .sort((a, b) => {
      const [mA, yA] = a.key.split('-').map(Number);
      const [mB, yB] = b.key.split('-').map(Number);
      return yA !== yB ? yA - yB : mA - mB;
    })
    .slice(-5); // Last 5 months

  const monthlyChartData = sortedMonthlyData.length > 0 ? sortedMonthlyData : [
    { label: 'Sem dados', entradas: 0, saidas: 0 }
  ];

  const maxMonthlyVal = Math.max(
    ...monthlyChartData.map(d => Math.max(d.entradas, d.saidas)),
    10000
  );

  // Budget limit alerts — current month spending vs LimiteMensal
  const thisMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const budgetAlerts = categorySummary
    .filter(c => c.LimiteMensal > 0 && c.Tipo === 'Despesa')
    .map(c => {
      const monthSaidas = filteredLaunches
        .filter(l => l.CategoriaID === c.CategoriaID && l.Tipo === 'Saida' && l.Data?.startsWith(thisMonth))
        .reduce((sum, l) => sum + Number(l.Valor), 0);
      const pct = c.LimiteMensal > 0 ? (monthSaidas / c.LimiteMensal) * 100 : 0;
      return { ...c, monthSaidas, pct };
    })
    .filter(c => c.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  // Donut chart data — top 6 expense categories by saidas
  const donutCategories = [...categorySummary]
    .filter(c => c.saidas > 0 && c.Tipo === 'Despesa')
    .sort((a, b) => b.saidas - a.saidas)
    .slice(0, 6);
  const donutTotal = donutCategories.reduce((sum, c) => sum + c.saidas, 0);
  const DONUT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];
  // Build donut arc segments
  const DONUT_R = 70; const DONUT_STROKE = 28; const DONUT_CX = 90; const DONUT_CY = 90;
  const donutCircumference = 2 * Math.PI * DONUT_R;
  let donutOffset = 0;
  const donutSegments = donutCategories.map((cat, i) => {
    const frac = donutTotal > 0 ? cat.saidas / donutTotal : 0;
    const dash = frac * donutCircumference;
    const gap = donutCircumference - dash;
    const seg = { cat, color: DONUT_COLORS[i % DONUT_COLORS.length], dash, gap, offset: donutOffset, frac };
    donutOffset += dash;
    return seg;
  });

  // Low balance categories alert (excluding income, debts, loans)
  const lowBalanceAlerts = categorySummary.filter(c =>
    c.Tipo === 'Despesa' &&
    c.Subtipo === 'Nenhum' &&
    c.saldo < 5000
  );

  // Dynamic Motivational Messaging (AI Messages simulation)
  const savingsRate = totalEntradas > 0 ? ((totalEntradas - totalSaidas) / totalEntradas) * 100 : 0;
  let motivationalSMS = '';
  let smsTheme = 'good'; // good, warning

  if (savingsRate > 25) {
    motivationalSMS = "🌟 SMS Motivadora: 'Incrível! O seu saldo é um reflexo da sua disciplina. Guardar mais de 25% indica que você está no comando do seu destino financeiro! Continue firme!'";
    smsTheme = 'good';
  } else if (savingsRate >= 0) {
    motivationalSMS = "💪 SMS Motivadora: 'Você está no azul! Mas lembre-se: uma pequena economia hoje é a sua liberdade de amanhã. Tente alocar um pouco mais nas suas metas de investimento!'";
    smsTheme = 'good';
  } else {
    motivationalSMS = "🚨 SMS de Alerta: 'Cuidado! As despesas ultrapassaram o seu rendimento. Cada saída desnecessária adia o seu sossego. Pare e verifique no painel de Coach antes de gastar!'";
    smsTheme = 'warning';
  }

  const planBadge = currentUser?.Plano === 'Pro' ? { label: 'PRO', color: '#6366f1' }
    : currentUser?.Plano === 'Enterprise' ? { label: 'ENTERPRISE', color: '#f59e0b' }
      : { label: 'GRATUITO', color: '#6b7280' };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Profile Card */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)',
        border: '1px solid rgba(99,102,241,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: role === 'admin'
              ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
              : 'linear-gradient(135deg, #6366f1, #a5b4fc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, color: '#fff', fontSize: '1.2rem',
            boxShadow: role === 'admin' ? '0 0 16px rgba(245,158,11,0.4)' : '0 0 16px rgba(99,102,241,0.3)'
          }}>
            {role === 'admin' ? <Crown size={22} /> : (currentUser?.Nome?.[0] || <User size={22} />)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
              Olá, {currentUser?.Nome?.split(' ')[0] || 'Utilizador'} 👋
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{userEmail}</span>
              <span style={{
                background: `${planBadge.color}20`, border: `1px solid ${planBadge.color}40`,
                color: planBadge.color, fontSize: '0.6rem', fontWeight: 800,
                padding: '1px 8px', borderRadius: '10px'
              }}>{planBadge.label}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {onGoToChat && (
            <button
              onClick={onGoToChat}
              style={{
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                color: 'var(--color-accent)', borderRadius: '10px',
                padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s'
              }}
            >
              <MessageCircle size={14} /> Falar com Suporte
            </button>
          )}
          {role !== 'ReadOnly' && (
            <button onClick={onAddLaunchClick} className="btn btn-primary" style={{ padding: '10px 18px' }}>
              + Novo Lançamento
            </button>
          )}
          {(import.meta.env.DEV || window.location.hostname === 'localhost') && role !== 'admin' && (
            <button
              onClick={onForceAdmin}
              style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.25)',
                color: '#f59e0b',
                borderRadius: '10px',
                padding: '8px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              <Crown size={14} /> Torna-Admin (Local)
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Painel Geral</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Visão consolidada do seu patrimônio, dívidas e metas
          </p>
        </div>
      </div>

      {/* Motivational Banner */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        background: smsTheme === 'good' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
        borderLeft: `4px solid ${smsTheme === 'good' ? 'var(--color-success)' : 'var(--color-error)'}`,
        color: smsTheme === 'good' ? 'var(--color-success)' : 'var(--color-error)',
        fontSize: '0.95rem',
        fontWeight: 600,
        borderRadius: '12px'
      }}>
        {motivationalSMS}
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* KPI 1: Saldo Consolidado */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            background: saldoConsolidado >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: saldoConsolidado >= 0 ? 'var(--color-success)' : 'var(--color-error)',
            padding: '10px', borderRadius: '10px'
          }}>
            <DollarSign size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Saldo Disponível</p>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '2px 0', color: saldoConsolidado >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
              {saldoConsolidado.toLocaleString('pt-PT')} Kz
            </h3>
          </div>
        </div>

        {/* KPI 2: Total Entradas */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--color-success)',
            padding: '10px', borderRadius: '10px'
          }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Entradas</p>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '2px 0', color: 'var(--color-success)' }}>
              {totalEntradas.toLocaleString('pt-PT')} Kz
            </h3>
          </div>
        </div>

        {/* KPI 3: Total Saídas */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-error)',
            padding: '10px', borderRadius: '10px'
          }}>
            <TrendingDown size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Saídas</p>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '2px 0', color: 'var(--color-error)' }}>
              {totalSaidas.toLocaleString('pt-PT')} Kz
            </h3>
          </div>
        </div>

        {/* KPI 4: Ativos Net */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--color-accent)',
            padding: '10px', borderRadius: '10px'
          }}>
            <Wallet size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Categorias</p>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '2px 0' }}>
              {categorySummary.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Target achieved alerts */}
      {achievedTargets.length > 0 && (
        <div className="glass-panel animate-slide-up" style={{
          padding: '16px',
          borderLeft: '4px solid var(--color-success)',
          background: 'var(--color-success-bg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 700 }}>
            <Star size={20} />
            <span>Alvo Concluído! Parabéns!</span>
          </div>
          <div style={{ paddingLeft: '28px' }}>
            {achievedTargets.map(target => (
              <p key={target.CategoriaID} style={{ fontSize: '0.85rem' }}>
                Você atingiu o valor alvo de <strong>{target.Alvo.toLocaleString('pt-PT')} Kz</strong> na meta <strong style={{ textDecoration: 'underline' }}>{target.Nome}</strong>! Você já está em condições de concluir o planejado.
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Active Debts / Loans Quick Panels */}
      {(activeDebts.length > 0 || activeLoans.length > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {/* Active Debts (We owe) */}
          {activeDebts.length > 0 && (
            <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--color-error)' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <ShieldAlert size={16} /> Suas Dívidas Ativas
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeDebts.map(d => (
                  <div key={d.CategoriaID} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>{d.Nome}</span>
                    <strong style={{ color: 'var(--color-error)' }}>{Math.abs(d.saldo).toLocaleString('pt-PT')} Kz pendente</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Loans (They owe us) */}
          {activeLoans.length > 0 && (
            <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--color-success)' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <CheckCircle2 size={16} /> Empréstimos a Receber
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeLoans.map(l => (
                  <div key={l.CategoriaID} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>{l.Nome}</span>
                    <strong style={{ color: 'var(--color-success)' }}>{l.saldo.toLocaleString('pt-PT')} Kz a receber</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Charts & Analytics Block */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '24px'
      }}>
        {/* Chart 1: Entradas vs Saídas por Mês (SVG) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Evolução de Fluxo Mensal</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Últimos meses registrados</p>
          </div>
          <div style={{ height: '220px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingTop: '10px' }}>
            {monthlyChartData.map((data, idx) => {
              const hEntradas = (data.entradas / maxMonthlyVal) * 160;
              const hSaidas = (data.saidas / maxMonthlyVal) * 160;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '60px' }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '160px' }}>
                    <div style={{
                      width: '12px',
                      height: `${Math.max(hEntradas, 4)}px`,
                      background: 'linear-gradient(to top, #059669, #10b981)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)'
                    }} title={`Entradas: ${data.entradas.toLocaleString('pt-PT')} Kz`} />
                    <div style={{
                      width: '12px',
                      height: `${Math.max(hSaidas, 4)}px`,
                      background: 'linear-gradient(to top, #dc2626, #ef4444)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease',
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)'
                    }} title={`Saídas: ${data.saidas.toLocaleString('pt-PT')} Kz`} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-success)', borderRadius: '2px' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Entradas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-error)', borderRadius: '2px' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Saídas</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Donut + Saldo por Categoria */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Distribuição de Despesas</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Percentagem por categoria de saídas</p>
          </div>
          {donutTotal > 0 ? (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* SVG Donut */}
              <svg width="180" height="180" viewBox="0 0 180 180" style={{ flexShrink: 0 }}>
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx={DONUT_CX} cy={DONUT_CY} r={DONUT_R}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={DONUT_STROKE}
                    strokeDasharray={`${seg.dash} ${seg.gap}`}
                    strokeDashoffset={-seg.offset}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: `${DONUT_CX}px ${DONUT_CY}px`, transition: 'stroke-dasharray 0.6s ease' }}
                  />
                ))}
                <text x={DONUT_CX} y={DONUT_CY - 8} textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="600">Total</text>
                <text x={DONUT_CX} y={DONUT_CY + 10} textAnchor="middle" fill="var(--text-primary)" fontSize="12" fontWeight="700">{(donutTotal / 1000).toFixed(0)}k Kz</text>
              </svg>
              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                {donutSegments.map((seg, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: seg.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontWeight: 500, color: 'var(--text-primary)' }}>{seg.cat.Nome}</span>
                    <span style={{ color: seg.color, fontWeight: 700 }}>{(seg.frac * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1, justifyContent: 'center' }}>
              {categorySummary.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Sem dados de categoria cadastrados</p>
              ) : (
                categorySummary.slice(0, 5).map(cat => {
                  const maxSaldo = Math.max(...categorySummary.map(c => Math.abs(c.saldo)), 1);
                  const percent = Math.max(0, (Math.abs(cat.saldo) / maxSaldo) * 100);
                  let color = 'var(--color-accent)';
                  if (cat.Subtipo === 'Divida') color = 'var(--color-error)';
                  else if (cat.Subtipo === 'Emprestimo') color = 'var(--color-success)';
                  else if (cat.saldo < 5000 && cat.Tipo === 'Despesa') color = 'var(--color-error)';
                  return (
                    <div key={cat.CategoriaID} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600 }}>{cat.Nome} {cat.CategoriaMaeID ? '(filha)' : '(mãe)'}</span>
                        <span style={{ fontWeight: 700, color }}>{cat.saldo.toLocaleString('pt-PT')} Kz</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${percent}%`, backgroundColor: color, borderRadius: '3px', transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Budget Limit Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="glass-panel" style={{
          padding: '16px',
          borderLeft: '4px solid var(--color-warning)',
          background: 'var(--color-warning-bg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)', fontWeight: 700 }}>
            <AlertCircle size={20} />
            <span>Alertas de Orçamento Mensal</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {budgetAlerts.map(c => (
              <div key={c.CategoriaID}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>{c.Nome}</span>
                  <span style={{ color: c.pct >= 100 ? 'var(--color-error)' : 'var(--color-warning)', fontWeight: 700 }}>
                    {c.monthSaidas.toLocaleString('pt-PT')} / {c.LimiteMensal.toLocaleString('pt-PT')} Kz ({c.pct.toFixed(0)}%)
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(c.pct, 100)}%`,
                    background: c.pct >= 100
                      ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                      : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                    borderRadius: '3px',
                    transition: 'width 0.6s ease'
                  }} />
                </div>
                {c.pct >= 100 && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-error)', marginTop: '3px', fontWeight: 600 }}>
                    ⛔ Limite atingido! Gastos nesta categoria excedem o orçamento deste mês.
                  </p>
                )}
                {c.pct >= 80 && c.pct < 100 && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-warning)', marginTop: '3px', fontWeight: 600 }}>
                    ⚠️ Atenção! Já utilizou {c.pct.toFixed(0)}% do limite mensal desta categoria.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low balance alert logs */}
      {lowBalanceAlerts.length > 0 && (
        <div className="glass-panel" style={{
          padding: '16px',
          borderLeft: '4px solid var(--color-warning)',
          background: 'var(--color-warning-bg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)' }}>
            <AlertCircle size={20} />
            <span style={{ fontWeight: 700 }}>Alerta de Saldo Baixo detectado no AppSheet</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '28px' }}>
            {lowBalanceAlerts.map(alert => (
              <p key={alert.CategoriaID} style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                Alerta: saldo baixo na categoria <strong style={{ color: 'var(--color-warning)' }}>{alert.Nome}</strong>. Saldo atual: <strong>{alert.saldo.toLocaleString('pt-PT')} Kz</strong>.
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Smart Analysis & Top Spending */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {/* Left Column: Smart Insight Message */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99,102,241,0.05) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)' }}>
            <Sparkles size={20} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Análise Inteligente de IA</h4>
          </div>
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              borderLeft: `3px solid ${savingsRate > 20 ? 'var(--color-success)' : 'var(--color-accent)'}`
            }}>
              {savingsRate > 20
                ? `Excelente desempenho financeiro! Você economizou ${savingsRate.toFixed(1)}% dos seus rendimentos. Seus ativos líquidos estão crescendo.`
                : `Seu saldo líquido disponível é de ${saldoConsolidado.toLocaleString('pt-PT')} Kz. Acesse a aba "Coach" para estruturar um planejamento de gastos e metas.`}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
              <span>Entradas operam como depósitos acumulativos.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
              <span>Saídas bloqueadas se excederem o saldo alocado.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Top Expenses */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Maiores Despesas</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Categorias com maior volume de saídas</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topSpendingCategories.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                Nenhuma despesa registrada até o momento
              </p>
            ) : (
              topSpendingCategories.map((cat, index) => {
                return (
                  <div key={cat.CategoriaID} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--color-error)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700
                      }}>
                        #{index + 1}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.Nome}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--color-error)', fontSize: '0.9rem' }}>
                      -{cat.saidas.toLocaleString('pt-PT')} Kz
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
