import React, { useState, useRef } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Wallet, AlertCircle, Sparkles, CheckCircle2,
  Star, ShieldAlert, User, Crown, MessageCircle, Eye, EyeOff, Bell, CreditCard,
  PiggyBank, ArrowRight, Camera
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getCardStyle } from '../utils/cardVisualStyles';

export default function DashboardView({ launches, categories, cards, role, userEmail, userId, currentUser, setCurrentUser, onAddLaunchClick, onGoToChat, onForceAdmin, onSelectCard }) {
  const [hideValues, setHideValues] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const fmt = (v) => hideValues ? '*****' : Number(v).toLocaleString('pt-PT') + ' Kz';
  const fmtShort = (v) => hideValues ? '*****' : Number(v).toLocaleString('pt-PT');

  const filteredLaunches = launches.filter(l =>
    role === 'admin' || l.CriadoPor === userId
  );

  // ── Calculations (preserved exactly) ──
  const totalEntradas = filteredLaunches.filter(l => l.Tipo === 'Entrada' && !l.CategoriaID).reduce((sum, l) => sum + Number(l.Valor), 0);
  const totalSaidas = filteredLaunches.filter(l => l.Tipo === 'Saida' && l.CategoriaID).reduce((sum, l) => sum + Number(l.Valor), 0);
  const saldoConsolidado = totalEntradas - totalSaidas;

  const categorySummary = categories.map(cat => {
    const catLaunches = filteredLaunches.filter(l => l.CategoriaID === cat.CategoriaID);
    const catEntradas = catLaunches.filter(l => l.Tipo === 'Entrada').reduce((sum, l) => sum + Number(l.Valor), 0);
    const catSaidas = catLaunches.filter(l => l.Tipo === 'Saida').reduce((sum, l) => sum + Number(l.Valor), 0);
    return { ...cat, entradas: catEntradas, saidas: catSaidas, saldo: catEntradas - catSaidas };
  }).filter(c => c.Ativa);

  const topSpendingCategories = [...categorySummary]
    .filter(c => c.saidas > 0 && c.Subtipo !== 'Divida')
    .sort((a, b) => b.saidas - a.saidas)
    .slice(0, 4);

  const achievedTargets = categorySummary.filter(c =>
    (c.Subtipo === 'Investimento' || c.Subtipo === 'Poupanca') && c.Alvo > 0 && c.saldo >= c.Alvo
  );

  const activeDebts = categorySummary.filter(c => c.Subtipo === 'Divida' && c.saldo < 0);
  const activeLoans = categorySummary.filter(c => c.Subtipo === 'Emprestimo' && c.saldo > 0);

  // Monthly grouping (last 5 months)
  const monthlyDataMap = {};
  filteredLaunches.forEach(l => {
    const dateObj = new Date(l.Data);
    if (isNaN(dateObj)) return;
    const monthKey = `${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
    const monthLabel = dateObj.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
    if (!monthlyDataMap[monthKey]) monthlyDataMap[monthKey] = { label: monthLabel, key: monthKey, entradas: 0, saidas: 0 };
    if (l.Tipo === 'Entrada') monthlyDataMap[monthKey].entradas += Number(l.Valor);
    else monthlyDataMap[monthKey].saidas += Number(l.Valor);
  });

  const sortedMonthlyData = Object.values(monthlyDataMap)
    .sort((a, b) => { const [mA, yA] = a.key.split('-').map(Number); const [mB, yB] = b.key.split('-').map(Number); return yA !== yB ? yA - yB : mA - mB; })
    .slice(-5);

  const monthlyChartData = sortedMonthlyData.length > 0 ? sortedMonthlyData : [{ label: 'Sem dados', entradas: 0, saidas: 0 }];
  const maxMonthlyVal = Math.max(...monthlyChartData.map(d => Math.max(d.entradas, d.saidas)), 10000);

  // Budget limit alerts
  const thisMonth = new Date().toISOString().slice(0, 7);
  const budgetAlerts = categorySummary
    .filter(c => c.LimiteMensal > 0 && c.Tipo === 'Despesa')
    .map(c => {
      const monthSaidas = filteredLaunches.filter(l => l.CategoriaID === c.CategoriaID && l.Tipo === 'Saida' && l.Data?.startsWith(thisMonth)).reduce((sum, l) => sum + Number(l.Valor), 0);
      const pct = c.LimiteMensal > 0 ? (monthSaidas / c.LimiteMensal) * 100 : 0;
      return { ...c, monthSaidas, pct };
    })
    .filter(c => c.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  // Donut data
  const donutCategories = [...categorySummary].filter(c => c.saidas > 0 && c.Tipo === 'Despesa').sort((a, b) => b.saidas - a.saidas).slice(0, 6);
  const donutTotal = donutCategories.reduce((sum, c) => sum + c.saidas, 0);
  const DONUT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];
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

  const lowBalanceAlerts = categorySummary.filter(c => c.Tipo === 'Despesa' && c.Subtipo === 'Nenhum' && c.saldo < 5000);

  // Motivational messaging
  const savingsRate = totalEntradas > 0 ? ((totalEntradas - totalSaidas) / totalEntradas) * 100 : 0;
  let motivationalSMS = '';
  let smsTheme = 'good';
  if (savingsRate > 25) {
    motivationalSMS = "Incrível! O seu saldo é um reflexo da sua disciplina. Guardar mais de 25% indica que está no comando do seu destino financeiro!";
    smsTheme = 'good';
  } else if (savingsRate >= 0) {
    motivationalSMS = "Você está no azul! Mas lembre-se: uma pequena economia hoje é a sua liberdade de amanhã.";
    smsTheme = 'good';
  } else {
    motivationalSMS = "Cuidado! As despesas ultrapassaram o seu rendimento. Pare e verifique no painel de Coach antes de gastar!";
    smsTheme = 'warning';
  }

  const planBadge = currentUser?.Plano === 'Pro' ? { label: 'PRO', color: '#6366f1' }
    : currentUser?.Plano === 'Enterprise' ? { label: 'ENTERPRISE', color: '#f59e0b' }
    : { label: 'GRATUITO', color: '#6b7280' };

  // ── Cards / Cartões data ──
  const userCards = cards || [];
  const investmentCategories = categorySummary.filter(c => c.Subtipo === 'Investimento');
  const investmentTotal = investmentCategories.reduce((s, c) => s + c.saldo, 0);

  // ── Avatar upload ──
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: base64 })
          .eq('id', userId);

        if (updateError) {
          console.error('Profile update error:', updateError);
          alert('Erro ao guardar foto: ' + updateError.message);
        } else {
          setCurrentUser(prev => ({ ...prev, AvatarUrl: base64 }));
        }
        setUploading(false);
      };
      reader.onerror = () => {
        alert('Erro ao ler o ficheiro.');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload exception:', err);
      alert('Erro ao carregar foto.');
      setUploading(false);
    }
  };

  // ── Recent launches (last 4) ──
  const recentLaunches = [...filteredLaunches]
    .sort((a, b) => new Date(b.Data) - new Date(a.Data))
    .slice(0, 4);

  // ── Card balance calculations for summary ──
  const getCardBalance = (cardId) => {
    const cardCats = categories.filter(c => c.card_id === cardId);
    const cardCatIds = cardCats.map(c => c.CategoriaID);
    // Include launches with card_id OR belonging to card's categories
    const cardLaunches = filteredLaunches.filter(l =>
      l.card_id === cardId || cardCatIds.includes(l.CategoriaID)
    );
    const e = cardLaunches.filter(l => l.Tipo === 'Entrada' && !l.CategoriaID).reduce((s, l) => s + Number(l.Valor), 0);
    const s = cardLaunches.filter(l => l.Tipo === 'Saida').reduce((s, l) => s + Number(l.Valor), 0);
    const catBal = cardCats.map(cat => {
      const ce = cardLaunches.filter(l => l.CategoriaID === cat.CategoriaID && l.Tipo === 'Entrada').reduce((sum, l) => sum + Number(l.Valor), 0);
      const cs = cardLaunches.filter(l => l.CategoriaID === cat.CategoriaID && l.Tipo === 'Saida').reduce((sum, l) => sum + Number(l.Valor), 0);
      return ce - cs;
    }).reduce((s, v) => s + v, 0);
    return { disponivel: e - s - catBal, contabilistico: e - s };
  };

  // Global card-based balances: sum of each card's disponivel and contabilistico
  const saldoDisponivelGlobal = userCards.reduce((sum, card) => sum + getCardBalance(card.id).disponivel, 0);
  const saldoContabilisticoGlobal = userCards.reduce((sum, card) => sum + getCardBalance(card.id).contabilistico, 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ═══════════════ 1. HEADER: Avatar + Saudação + Privacidade ═══════════════ */}
      <div className="glass-panel" style={{
        padding: '18px 22px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)',
        border: '1px solid rgba(99,102,241,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              style={{
                width: '50px', height: '50px', borderRadius: '50%', cursor: uploading ? 'wait' : 'pointer',
                background: currentUser?.AvatarUrl ? 'none' : (role === 'admin' ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : 'linear-gradient(135deg, #6366f1, #a5b4fc)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, color: '#fff', fontSize: '1.2rem', overflow: 'hidden',
                boxShadow: role === 'admin' ? '0 0 16px rgba(245,158,11,0.4)' : '0 0 16px rgba(99,102,241,0.3)',
                border: '2px solid rgba(255,255,255,0.15)',
                opacity: uploading ? 0.6 : 1, transition: 'opacity 0.2s'
              }}
              title={uploading ? 'A carregar...' : 'Clique para alterar foto'}
            >
              {uploading ? (
                <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : currentUser?.AvatarUrl ? (
                <img src={currentUser.AvatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                role === 'admin' ? <Crown size={22} /> : (currentUser?.Nome?.[0] || <User size={22} />)
              )}
            </div>
            {!uploading && (
              <div style={{
                position: 'absolute', bottom: '-2px', right: '-2px', width: '18px', height: '18px',
                borderRadius: '50%', background: 'var(--color-accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-primary)'
              }}>
                <Camera size={9} style={{ color: '#fff' }} />
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </div>

          {/* Saudação */}
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

        {/* Right side: Privacy + Notifications + Actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Privacy Toggle */}
          <button
            onClick={() => setHideValues(v => !v)}
            title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
            style={{
              background: hideValues ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hideValues ? 'rgba(245,158,11,0.3)' : 'var(--border-color)'}`,
              color: hideValues ? '#f59e0b' : 'var(--text-secondary)',
              padding: '7px', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
            {hideValues ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>

          {/* Notifications (estrutura preparada) */}
          <button
            title="Notificações"
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)', padding: '7px', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
            }}>
            <Bell size={15} />
          </button>

          {onGoToChat && (
            <button onClick={onGoToChat} style={{
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              color: 'var(--color-accent)', borderRadius: '8px',
              padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.8rem', fontWeight: 600
            }}>
              <MessageCircle size={13} /> Suporte
            </button>
          )}

          {role !== 'ReadOnly' && (
            <button onClick={onAddLaunchClick} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              + Novo
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════ 2. RESUMO DE SALDOS ═══════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {/* Saldo em Conta */}
        <div className="glass-panel" style={{
          padding: '20px', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(6,182,212,0.04) 100%)',
          border: '1px solid rgba(16,185,129,0.15)'
        }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.06 }}>
            <DollarSign size={80} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ background: 'rgba(16,185,129,0.12)', padding: '8px', borderRadius: '8px', color: 'var(--color-success)' }}>
              <DollarSign size={18} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Saldo Disponível</span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: saldoDisponivelGlobal >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
            {fmt(saldoDisponivelGlobal)}
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Contabilístico: {fmt(saldoContabilisticoGlobal)}
          </p>
        </div>

        {/* Cartões */}
        <div className="glass-panel" style={{
          padding: '20px', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)',
          border: '1px solid rgba(99,102,241,0.15)'
        }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.06 }}>
            <CreditCard size={80} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ background: 'rgba(99,102,241,0.12)', padding: '8px', borderRadius: '8px', color: 'var(--color-accent)' }}>
              <CreditCard size={18} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cartões</span>
          </div>
          {userCards.length > 0 ? (
            <>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{userCards.length}</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>cartões ativos</p>
              {/* Mini progress bars for top 3 cards */}
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {userCards.slice(0, 3).map(card => {
                  const bal = getCardBalance(card.id);
                  const totalG = bal.disponivel + bal.contabilistico;
                  const pct = totalG > 0 ? (bal.disponivel / totalG) * 100 : 0;
                  return (
                    <div key={card.id} style={{ cursor: 'pointer' }} onClick={() => onSelectCard?.(card.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '2px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{card.icon} {card.name}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{hideValues ? '***' : `${pct.toFixed(0)}%`}</span>
                      </div>
                      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-accent)', borderRadius: '2px', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Nenhum cartão</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>Crie cartões para organizar</p>
            </div>
          )}
        </div>

        {/* Investimentos */}
        <div className="glass-panel" style={{
          padding: '20px', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(249,115,22,0.04) 100%)',
          border: '1px solid rgba(245,158,11,0.15)'
        }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.06 }}>
            <PiggyBank size={80} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ background: 'rgba(245,158,11,0.12)', padding: '8px', borderRadius: '8px', color: '#f59e0b' }}>
              <PiggyBank size={18} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Investimentos</span>
          </div>
          {investmentTotal > 0 ? (
            <>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>{fmt(investmentTotal)}</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{investmentCategories.length} categorias</p>
            </>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Sem investimentos cadastrados</p>
          )}
        </div>

        {/* Entradas vs Saídas */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <TrendingUp size={14} style={{ color: 'var(--color-success)' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Entradas</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-success)' }}>{fmt(totalEntradas)}</h3>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <TrendingDown size={14} style={{ color: 'var(--color-error)' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Saídas</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-error)' }}>{fmt(totalSaidas)}</h3>
            </div>
          </div>
          {/* Savings rate bar */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Taxa de poupança</span>
              <span style={{ fontWeight: 700, color: savingsRate > 20 ? 'var(--color-success)' : savingsRate > 0 ? '#f59e0b' : 'var(--color-error)' }}>{savingsRate.toFixed(0)}%</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${Math.min(Math.max(savingsRate, 0), 100)}%`, background: savingsRate > 20 ? 'var(--color-success)' : '#f59e0b', borderRadius: '2px', transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ Motivational Banner ═══════════════ */}
      <div className="glass-panel" style={{
        padding: '14px 18px',
        background: smsTheme === 'good' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
        borderLeft: `4px solid ${smsTheme === 'good' ? 'var(--color-success)' : 'var(--color-error)'}`,
        color: smsTheme === 'good' ? 'var(--color-success)' : 'var(--color-error)',
        fontSize: '0.88rem', fontWeight: 600, borderRadius: '10px'
      }}>
        {motivationalSMS}
      </div>

      {/* ═══════════════ Target Achieved Alerts ═══════════════ */}
      {achievedTargets.length > 0 && (
        <div className="glass-panel animate-slide-up" style={{
          padding: '14px 18px', borderLeft: '4px solid var(--color-success)',
          background: 'var(--color-success-bg)', display: 'flex', flexDirection: 'column', gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 700 }}>
            <Star size={18} /> <span>Alvo Concluído! Parabéns!</span>
          </div>
          {achievedTargets.map(target => (
            <p key={target.CategoriaID} style={{ fontSize: '0.82rem', paddingLeft: '26px' }}>
              Meta <strong>{target.Nome}</strong> atingida: {target.Alvo.toLocaleString('pt-PT')} Kz
            </p>
          ))}
        </div>
      )}

      {/* ═══════════════ Debts / Loans ═══════════════ */}
      {(activeDebts.length > 0 || activeLoans.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {activeDebts.length > 0 && (
            <div className="glass-panel" style={{ padding: '14px', borderLeft: '4px solid var(--color-error)' }}>
              <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <ShieldAlert size={14} /> Dívidas Ativas
              </h5>
              {activeDebts.map(d => (
                <div key={d.CategoriaID} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>{d.Nome}</span>
                  <strong style={{ color: 'var(--color-error)' }}>{fmt(Math.abs(d.saldo))} pendente</strong>
                </div>
              ))}
            </div>
          )}
          {activeLoans.length > 0 && (
            <div className="glass-panel" style={{ padding: '14px', borderLeft: '4px solid var(--color-success)' }}>
              <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <CheckCircle2 size={14} /> Empréstimos a Receber
              </h5>
              {activeLoans.map(l => (
                <div key={l.CategoriaID} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>{l.Nome}</span>
                  <strong style={{ color: 'var(--color-success)' }}>{fmt(l.saldo)} a receber</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ 4. GRÁFICOS ═══════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
        {/* Monthly Bar Chart */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Balanço Mensal</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Entradas vs Saídas</p>
          </div>
          <div style={{ height: '200px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
            {monthlyChartData.map((data, idx) => {
              const hEntradas = (data.entradas / maxMonthlyVal) * 150;
              const hSaidas = (data.saidas / maxMonthlyVal) * 150;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '55px' }}>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '150px' }}>
                    <div style={{ width: '11px', height: `${Math.max(hEntradas, 3)}px`, background: 'linear-gradient(to top, #059669, #10b981)', borderRadius: '3px 3px 0 0', transition: 'height 0.5s ease' }} title={`Entradas: ${data.entradas.toLocaleString('pt-PT')} Kz`} />
                    <div style={{ width: '11px', height: `${Math.max(hSaidas, 3)}px`, background: 'linear-gradient(to top, #dc2626, #ef4444)', borderRadius: '3px 3px 0 0', transition: 'height 0.5s ease' }} title={`Saídas: ${data.saidas.toLocaleString('pt-PT')} Kz`} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{data.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', background: 'var(--color-success)', borderRadius: '2px', display: 'inline-block' }} />Entradas</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', background: 'var(--color-error)', borderRadius: '2px', display: 'inline-block' }} />Saídas</span>
          </div>
        </div>

        {/* Donut: Expense Distribution */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Distribuição de Despesas</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Percentagem por categoria</p>
          </div>
          {donutTotal > 0 ? (
            <div style={{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
              <svg width="160" height="160" viewBox="0 0 180 180" style={{ flexShrink: 0 }}>
                {donutSegments.map((seg, i) => (
                  <circle key={i} cx={DONUT_CX} cy={DONUT_CY} r={DONUT_R} fill="none" stroke={seg.color}
                    strokeWidth={DONUT_STROKE} strokeDasharray={`${seg.dash} ${seg.gap}`}
                    strokeDashoffset={-seg.offset}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: `${DONUT_CX}px ${DONUT_CY}px`, transition: 'stroke-dasharray 0.6s ease' }} />
                ))}
                <text x={DONUT_CX} y={DONUT_CY - 8} textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="600">Total</text>
                <text x={DONUT_CX} y={DONUT_CY + 10} textAnchor="middle" fill="var(--text-primary)" fontSize="12" fontWeight="700">{fmtShort(donutTotal)}</text>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                {donutSegments.map((seg, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: seg.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontWeight: 500 }}>{seg.cat.Nome}</span>
                    <span style={{ color: seg.color, fontWeight: 700 }}>{(seg.frac * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>Sem despesas registadas</p>
          )}
        </div>
      </div>

      {/* ═══════════════ Budget Alerts ═══════════════ */}
      {budgetAlerts.length > 0 && (
        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '4px solid var(--color-warning)', background: 'var(--color-warning-bg)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)', fontWeight: 700 }}>
            <AlertCircle size={18} /> Alertas de Orçamento
          </div>
          {budgetAlerts.map(c => (
            <div key={c.CategoriaID}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '3px' }}>
                <span style={{ fontWeight: 600 }}>{c.Nome}</span>
                <span style={{ color: c.pct >= 100 ? 'var(--color-error)' : 'var(--color-warning)', fontWeight: 700 }}>
                  {c.monthSaidas.toLocaleString('pt-PT')} / {c.LimiteMensal.toLocaleString('pt-PT')} Kz ({c.pct.toFixed(0)}%)
                </span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(c.pct, 100)}%`, background: c.pct >= 100 ? 'var(--color-error)' : 'var(--color-warning)', borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════ Low Balance Alerts ═══════════════ */}
      {lowBalanceAlerts.length > 0 && (
        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '4px solid var(--color-warning)', background: 'var(--color-warning-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)', fontWeight: 700, marginBottom: '6px' }}>
            <AlertCircle size={18} /> Saldo Baixo
          </div>
          {lowBalanceAlerts.map(alert => (
            <p key={alert.CategoriaID} style={{ fontSize: '0.82rem', paddingLeft: '26px' }}>
              <strong>{alert.Nome}</strong>: {alert.saldo.toLocaleString('pt-PT')} Kz
            </p>
          ))}
        </div>
      )}

      {/* ═══════════════ AI Analysis + Top Spending ═══════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        <div className="glass-panel" style={{ padding: '20px', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99,102,241,0.05) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', marginBottom: '12px' }}>
            <Sparkles size={18} /> <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Análise de IA</h4>
          </div>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-primary)', padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `3px solid ${savingsRate > 20 ? 'var(--color-success)' : 'var(--color-accent)'}` }}>
            {savingsRate > 20
              ? `Excelente! Você economizou ${savingsRate.toFixed(1)}% dos seus rendimentos.`
              : `Saldo líquido: ${fmt(saldoConsolidado)}. Acesse o Coach para planejamento.`}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Maiores Despesas</h4>
          {topSpendingCategories.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>Sem despesas registadas</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topSpendingCategories.map((cat, index) => (
                <div key={cat.CategoriaID} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700 }}>
                      #{index + 1}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{cat.Nome}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--color-error)', fontSize: '0.85rem' }}>-{fmt(cat.saidas)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════ 5. ÚLTIMOS LANÇAMENTOS (das Categorias) ═══════════════ */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px' }}>Últimos Lançamentos</h4>
        {(() => {
          const catLaunches = recentLaunches.filter(l => l.CategoriaID);
          if (catLaunches.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>Nenhum lançamento nas categorias</p>;
          return (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Data</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Categoria</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Tipo</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Valor</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Descrição</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {catLaunches.map(l => {
                    const cat = categories.find(c => c.CategoriaID === l.CategoriaID);
                    const card = cards?.find(c => c.id === cat?.card_id);
                    return (
                      <tr key={l.LancID} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 12px', fontSize: '0.82rem' }}>{l.Data}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.82rem', fontWeight: 600 }}>{cat?.Nome || 'Sem categoria'} {card && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>· {card.icon} {card.name}</span>}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.82rem' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: l.Tipo === 'Entrada' ? 'var(--color-success-bg)' : 'var(--color-error-bg)', color: l.Tipo === 'Entrada' ? 'var(--color-success)' : 'var(--color-error)' }}>
                            {l.Tipo === 'Entrada' ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: '0.82rem', fontWeight: 700, color: l.Tipo === 'Entrada' ? 'var(--color-success)' : 'var(--color-error)' }}>
                          {l.Tipo === 'Entrada' ? '+' : '-'}{Number(l.Valor).toLocaleString('pt-PT')} Kz
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>{l.Descricao || 'Sem descrição'}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <button onClick={onAddLaunchClick} style={{ padding: '4px 8px', border: 'none', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>
                            Novo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* ═══════════════ 6. ÚLTIMOS CARREGAMENTOS ═══════════════ */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px' }}>Últimos Carregamentos</h4>
        {(() => {
          const topUps = recentLaunches.filter(l => !l.CategoriaID);
          if (topUps.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>Nenhum carregamento de cartão</p>;
          return (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Data</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Cartão</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Tipo</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Valor</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {topUps.map(l => {
                    const c = cards?.find(c => c.id === l.card_id);
                    return (
                      <tr key={l.LancID} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 12px', fontSize: '0.82rem' }}>{l.Data}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.82rem', fontWeight: 600 }}>{c ? `${c.icon || '💳'} ${c.name}` : 'Cartão removido'}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.82rem' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>Entrada</span>
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-success)' }}>
                          +{Number(l.Valor).toLocaleString('pt-PT')} Kz
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>{l.Descricao || 'Sem descrição'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* ═══════════════ Resumo por Cartão (se existirem cartões) ═══════════════ */}
      {userCards.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px' }}>Resumo dos Cartões</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {userCards.map(card => {
              const bal = getCardBalance(card.id);
              return (
                <div key={card.id} onClick={() => onSelectCard?.(card.id)} style={{
                  ...getCardStyle(card),
                  padding: '14px', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = card.color || 'var(--color-accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ''; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{card.icon || '💳'}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{card.name}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Disponível</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: bal.disponivel >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>{fmtShort(bal.disponivel)} Kz</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Contabilístico</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{fmtShort(bal.contabilistico)} Kz</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
