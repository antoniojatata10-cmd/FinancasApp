import React, { useState } from 'react';
import {
  ArrowLeft, Plus, Edit2, Trash2, TrendingUp, TrendingDown,
  Wallet, AlertCircle, ArrowLeftRight, Tags, Receipt, CreditCard,
  Save, X, List, LayoutGrid
} from 'lucide-react';

const CARD_MODELS_DCV = [
  'classico', 'moderno', 'minimalista', 'executivo', 'premium',
  'escuro', 'claro', 'neon', 'vidro', 'futurista'
];

const CARD_STYLES_DCV = [
  'plano', 'material', 'glassmorphism', 'neumorphism', 'gradient',
  'shadow', 'luxury', 'metallic', 'carbon', 'minimal',
  'soft', 'elegant', 'color-block', 'outline', 'modern'
];

const CARD_COLORS_DCV = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444',
  '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6b7280', '#1e293b', '#ffffff', '#000000',
  '#64748b', '#94a3b8', '#cbd5e1', '#fb923c', '#a78bfa'
];

export default function DashboardCardView({
  card, categories, launches, role, userId,
  onBack, onAddCategory, onEditCategory, onDeleteCategory,
  onAddLaunch, onEditLaunch, onDeleteLaunch, getCategoryBalance,
  onTransfer, cards, onEditCard, onDeleteCard
}) {
  const [activeSection, setActiveSection] = useState('overview'); // overview | categorias | lancamentos | transferir | carregamentos
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferData, setTransferData] = useState({ to_card_id: '', amount: '', description: '' });
  const [showCatForm, setShowCatForm] = useState(false);
  const [catFormData, setCatFormData] = useState({
    Nome: '', Tipo: 'Despesa', Subtipo: 'Nenhum', CategoriaMaeID: '', Alvo: 0, LimiteMensal: 0
  });
  const [editingCat, setEditingCat] = useState(null);
  const [showLancForm, setShowLancForm] = useState(false);
  const [lancFormData, setLancFormData] = useState({
    Data: new Date().toISOString().substring(0, 10), CategoriaID: '', Tipo: 'Saida',
    Valor: '', Descricao: '', Conta: 'Banco', Status: 'confirmado'
  });
  const [editingLanc, setEditingLanc] = useState(null);
  const [showCarregForm, setShowCarregForm] = useState(false);
  const [catViewMode, setCatViewMode] = useState(() => localStorage.getItem('dcv_catViewMode') || 'list');
  const [carregFormData, setCarregFormData] = useState({
    Valor: '', Data: new Date().toISOString().substring(0, 10), Descricao: '', Observacoes: ''
  });
  const [showEditCardForm, setShowEditCardForm] = useState(false);
  const [editCardData, setEditCardData] = useState({
    color: '#6366f1', style: 'modern', model: 'classico', intensity: 50
  });

  if (!card) {
    return (
      <div className="animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
        <p>Cartão não encontrado.</p>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '16px' }}>Voltar</button>
      </div>
    );
  }

  // Filter data for this card
  const cardCategories = categories.filter(c => c.card_id === card.id);
  const cardCategoryIds = cardCategories.map(c => c.CategoriaID);
  // Incluir carregamentos do cartão (card_id) + lançamentos das categorias
  const cardLaunches = launches.filter(l =>
    l.card_id === card.id || cardCategoryIds.includes(l.CategoriaID)
  );

  // Calculate balances
  // Carregamentos: Entrada sem categoria = dinheiro que entra no cartão
  const entradas = cardLaunches.filter(l => l.Tipo === 'Entrada' && !l.CategoriaID).reduce((s, l) => s + Number(l.Valor), 0);
  // Saídas normais
  const saidas = cardLaunches.filter(l => l.Tipo === 'Saida').reduce((s, l) => s + Number(l.Valor), 0);

  const catBalances = cardCategories.map(cat => {
    const catEntradas = cardLaunches.filter(l => l.CategoriaID === cat.CategoriaID && l.Tipo === 'Entrada').reduce((s, l) => s + Number(l.Valor), 0);
    const catSaidas = cardLaunches.filter(l => l.CategoriaID === cat.CategoriaID && l.Tipo === 'Saida').reduce((s, l) => s + Number(l.Valor), 0);
    return { ...cat, saldo: catEntradas - catSaidas };
  });

  const somaCategorias = catBalances.reduce((s, c) => s + c.saldo, 0);
  const saldoDisponivel = entradas - saidas - somaCategorias;
  const saldoContabilistico = saldoDisponivel + somaCategorias;

  // Donut data for categories
  const DONUT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];
  const donutTotal = catBalances.filter(c => c.saldo > 0).reduce((s, c) => s + c.saldo, 0);
  const donutSegments = catBalances.filter(c => c.saldo > 0).sort((a, b) => b.saldo - a.saldo).slice(0, 6).map((cat, i) => {
    const frac = donutTotal > 0 ? cat.saldo / donutTotal : 0;
    return { cat, color: DONUT_COLORS[i % DONUT_COLORS.length], frac };
  });

  // Monthly data for chart
  const monthlyDataMap = {};
  cardLaunches.forEach(l => {
    const d = new Date(l.Data);
    if (isNaN(d)) return;
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    const label = d.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
    if (!monthlyDataMap[key]) monthlyDataMap[key] = { label, key, entradas: 0, saidas: 0 };
    if (l.Tipo === 'Entrada') monthlyDataMap[key].entradas += Number(l.Valor);
    else monthlyDataMap[key].saidas += Number(l.Valor);
  });
  const monthlyChartData = Object.values(monthlyDataMap).sort((a, b) => {
    const [mA, yA] = a.key.split('-').map(Number);
    const [mB, yB] = b.key.split('-').map(Number);
    return yA !== yB ? yA - yB : mA - mB;
  }).slice(-6);
  const maxMonthlyVal = Math.max(...monthlyChartData.map(d => Math.max(d.entradas, d.saidas)), 10000);

  // Handlers
  const handleTransfer = () => {
    const amt = Number(transferData.amount);
    if (!transferData.to_card_id) { alert('Selecione o cartão de destino'); return; }
    if (amt <= 0) { alert('Valor deve ser maior que 0'); return; }
    if (amt > saldoDisponivel) { alert('Valor superior ao saldo disponível'); return; }
    if (transferData.to_card_id === card.id) { alert('Não pode transferir para o mesmo cartão'); return; }
    onTransfer({
      from_card_id: card.id,
      to_card_id: transferData.to_card_id,
      amount: amt,
      description: transferData.description
    });
    setShowTransferForm(false);
    setTransferData({ to_card_id: '', amount: '', description: '' });
  };

  const handleAddCat = (e) => {
    e.preventDefault();
    if (!catFormData.Nome.trim()) { alert('Nome é obrigatório'); return; }
    onAddCategory({
      ...catFormData,
      card_id: card.id,
      Tipo: catFormData.Tipo,
      CategoriaMaeID: catFormData.CategoriaMaeID || ''
    });
    setShowCatForm(false);
    setCatFormData({ Nome: '', Tipo: 'Despesa', Subtipo: 'Nenhum', CategoriaMaeID: '', Alvo: 0, LimiteMensal: 0 });
  };

  const handleAddLanc = (e) => {
    e.preventDefault();
    if (!lancFormData.CategoriaID || !lancFormData.Valor) {
      alert('Categoria e Valor são obrigatórios');
      return;
    }

    const valor = Number(lancFormData.Valor);
    if (valor <= 0) {
      alert('O valor deve ser maior que zero');
      return;
    }

    const cat = catBalances.find(c => c.CategoriaID === lancFormData.CategoriaID);

    // Validação: Saída — verificar saldo da categoria
    if (lancFormData.Tipo === 'Saida') {
      if (cat && cat.Subtipo !== 'Divida' && cat.saldo < valor) {
        alert(`Saldo insuficiente na categoria "${cat.Nome}". Saldo disponível: ${cat.saldo.toLocaleString('pt-PT')} Kz`);
        return;
      }
    }

    // Validação: Entrada — verificar saldo disponível do cartão
    if (lancFormData.Tipo === 'Entrada') {
      if (saldoDisponivel < valor) {
        alert(`Saldo insuficiente no cartão "${card.name}". Saldo disponível: ${saldoDisponivel.toLocaleString('pt-PT')} Kz`);
        return;
      }
    }

    onAddLaunch({
      ...lancFormData,
      Valor: valor,
      card_id: card.id
    });
    setShowLancForm(false);
    setLancFormData({
      Data: new Date().toISOString().substring(0, 10), CategoriaID: '', Tipo: 'Saida',
      Valor: '', Descricao: '', Conta: 'Banco', Status: 'confirmado'
    });
  };

  // Only carregamentos (top-ups): Entrada without category
  const carregamentos = cardLaunches.filter(l => l.Tipo === 'Entrada' && !l.CategoriaID);

  const handleCarregSubmit = (e) => {
    e.preventDefault();
    const val = Number(carregFormData.Valor);
    if (!val || val <= 0) { alert('Valor deve ser maior que zero'); return; }
    onAddLaunch({
      Data: carregFormData.Data,
      Tipo: 'Entrada',
      Valor: val,
      Descricao: carregFormData.Descricao + (carregFormData.Observacoes ? ` (${carregFormData.Observacoes})` : ''),
      card_id: card.id,
      CategoriaID: null,
      Conta: 'Banco',
      Status: 'confirmado'
    });
    setShowCarregForm(false);
    setCarregFormData({ Valor: '', Data: new Date().toISOString().substring(0, 10), Descricao: '', Observacoes: '' });
  };

  const handleOpenEditCard = () => {
    setEditCardData({
      color: card.color || '#6366f1',
      style: card.style || 'modern',
      model: card.model || 'classico',
      intensity: card.intensity != null ? card.intensity : 50
    });
    setShowEditCardForm(true);
  };

  const handleSaveEditCard = (e) => {
    e.preventDefault();
    onEditCard({ ...card, ...editCardData });
    setShowEditCardForm(false);
  };

  const handleDeleteCard = () => {
    if (window.confirm(`Tem certeza que deseja eliminar o cartão "${card.name}"? Categorias e lançamentos não serão apagados, mas ficarão sem cartão.`)) {
      onDeleteCard(card.id);
    }
  };

  const sections = [
    { id: 'overview', label: 'Visão Geral', icon: <Wallet size={16} /> },
    { id: 'categorias', label: 'Categorias', icon: <Tags size={16} /> },
    { id: 'lancamentos', label: 'Lançamentos', icon: <Receipt size={16} /> },
    { id: 'transferir', label: 'Transferir', icon: <ArrowLeftRight size={16} /> },
    { id: 'carregamentos', label: 'Carregamentos', icon: <CreditCard size={16} /> },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
          borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-primary)'
        }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: card.color ? `${card.color}22` : 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
          {card.icon || '💳'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{card.name}</h2>
          {card.number && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{card.number}</p>}
        </div>
        {role !== 'ReadOnly' && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={handleOpenEditCard} title="Personalizar cartão"
              style={{ background: 'rgba(99,102,241,0.1)', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', color: 'var(--color-accent)' }}>
              <Edit2 size={16} />
            </button>
            <button onClick={handleDeleteCard} title="Eliminar cartão"
              style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', color: 'var(--color-error)' }}>
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: activeSection === s.id ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: activeSection === s.id ? 'var(--color-accent)' : 'var(--text-secondary)',
              fontWeight: activeSection === s.id ? 700 : 500, fontSize: '0.85rem',
              whiteSpace: 'nowrap'
            }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeSection === 'overview' && (
        <>
          {/* Balance Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div className="glass-panel" style={{ padding: '18px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Saldo Disponível</p>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: saldoDisponivel >= 0 ? 'var(--color-success)' : 'var(--color-error)', marginTop: '4px' }}>
                {saldoDisponivel.toLocaleString('pt-PT')} Kz
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Dinheiro não distribuído</p>
            </div>
            <div className="glass-panel" style={{ padding: '18px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Saldo Contabilístico</p>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '4px' }}>
                {saldoContabilistico.toLocaleString('pt-PT')} Kz
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Património total do cartão</p>
            </div>
            <div className="glass-panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} style={{ color: 'var(--color-success)' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Entradas</p>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-success)', marginTop: '4px' }}>
                {entradas.toLocaleString('pt-PT')} Kz
              </h3>
            </div>
            <div className="glass-panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingDown size={18} style={{ color: 'var(--color-error)' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Saídas</p>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-error)', marginTop: '4px' }}>
                {saidas.toLocaleString('pt-PT')} Kz
              </h3>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Monthly Chart */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Evolução Mensal</h4>
              <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                {monthlyChartData.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sem dados</p>
                ) : monthlyChartData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '50px' }}>
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '140px' }}>
                      <div style={{ width: '10px', height: `${Math.max((d.entradas / maxMonthlyVal) * 120, 4)}px`, background: 'var(--color-success)', borderRadius: '3px 3px 0 0' }} title={`E: ${d.entradas.toLocaleString()}`} />
                      <div style={{ width: '10px', height: `${Math.max((d.saidas / maxMonthlyVal) * 120, 4)}px`, background: 'var(--color-error)', borderRadius: '3px 3px 0 0' }} title={`S: ${d.saidas.toLocaleString()}`} />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{d.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '10px', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', background: 'var(--color-success)', borderRadius: '2px', display: 'inline-block' }} />Entradas</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', background: 'var(--color-error)', borderRadius: '2px', display: 'inline-block' }} />Saídas</span>
              </div>
            </div>

            {/* Category Donut */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Saldos por Categoria</h4>
              {donutSegments.length > 0 ? (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
                    {donutSegments.map((seg, i) => {
                      const r = 50, stroke = 22, cx = 70, cy = 70;
                      const circ = 2 * Math.PI * r;
                      let offset = 0;
                      for (let j = 0; j < i; j++) {
                        const prevFrac = donutTotal > 0 ? donutSegments[j].cat.saldo / donutTotal : 0;
                        offset += prevFrac * circ;
                      }
                      const dash = seg.frac * circ;
                      return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={stroke}
                        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset}
                        style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />;
                    })}
                    <text x="70" y="67" textAnchor="middle" fill="var(--text-secondary)" fontSize="10">Total</text>
                    <text x="70" y="80" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="700">{(donutTotal / 1000).toFixed(0)}k</text>
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    {donutSegments.map((seg, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: seg.color, flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{seg.cat.Nome}</span>
                        <span style={{ color: seg.color, fontWeight: 700 }}>{(seg.frac * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>Sem categorias com saldo</p>
              )}
            </div>
          </div>

          {/* Recent Launches — only category launches */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px' }}>Últimos Lançamentos</h4>
            {(() => {
              const catLaunches = cardLaunches.filter(l => l.CategoriaID);
              if (catLaunches.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum lançamento nas categorias</p>;
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
                      {[...catLaunches].sort((a, b) => new Date(b.Data) - new Date(a.Data)).slice(0, 5).map(l => {
                        const cat = cardCategories.find(c => c.CategoriaID === l.CategoriaID);
                        return (
                          <tr key={l.LancID} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '8px 12px', fontSize: '0.82rem' }}>{l.Data}</td>
                            <td style={{ padding: '8px 12px', fontSize: '0.82rem', fontWeight: 600 }}>{cat?.Nome || 'Sem categoria'}</td>
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
                              {role !== 'ReadOnly' && (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button onClick={() => { setEditingLanc(l); setLancFormData({ Data: l.Data, CategoriaID: l.CategoriaID, Tipo: l.Tipo, Valor: l.Valor, Descricao: l.Descricao, Conta: l.Conta || 'Banco', Status: l.Status || 'confirmado' }); setShowLancForm(true); }}
                                    style={{ padding: '4px 8px', border: 'none', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>
                                    Editar
                                  </button>
                                  <button onClick={() => { if (window.confirm('Tem certeza que deseja excluir este lançamento?')) onDeleteLaunch(l.LancID); }}
                                    style={{ padding: '4px 8px', border: 'none', borderRadius: '4px', background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}>
                                    Eliminar
                                  </button>
                                </div>
                              )}
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

          {/* Recent Carregamentos — only card top-ups */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px' }}>Últimos Carregamentos</h4>
            {(() => {
              const topUps = cardLaunches.filter(l => l.Tipo === 'Entrada' && !l.CategoriaID);
              if (topUps.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum carregamento neste cartão</p>;
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
                        <th style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...topUps].sort((a, b) => new Date(b.Data) - new Date(a.Data)).slice(0, 5).map(l => (
                        <tr key={l.LancID} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 12px', fontSize: '0.82rem' }}>{l.Data}</td>
                          <td style={{ padding: '8px 12px', fontSize: '0.82rem', fontWeight: 600 }}>{card.icon || '💳'} {card.name}</td>
                          <td style={{ padding: '8px 12px', fontSize: '0.82rem' }}>
                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>Entrada</span>
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-success)' }}>
                            +{Number(l.Valor).toLocaleString('pt-PT')} Kz
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>{l.Descricao || 'Sem descrição'}</td>
                          <td style={{ padding: '8px 12px' }}>
                            {role !== 'ReadOnly' && (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => { setEditingLanc(l); setLancFormData({ Data: l.Data, CategoriaID: l.CategoriaID, Tipo: l.Tipo, Valor: l.Valor, Descricao: l.Descricao, Conta: l.Conta || 'Banco', Status: l.Status || 'confirmado' }); setShowLancForm(true); }}
                                  style={{ padding: '4px 8px', border: 'none', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>
                                  Editar
                                </button>
                                <button onClick={() => { if (window.confirm('Tem certeza que deseja excluir este carregamento?')) onDeleteLaunch(l.LancID); }}
                                  style={{ padding: '4px 8px', border: 'none', borderRadius: '4px', background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}>
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </>
      )}

      {/* CATEGORIAS */}
      {activeSection === 'categorias' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Categorias do Cartão</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Saldo disponível do cartão: <strong style={{ color: saldoDisponivel >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {saldoDisponivel.toLocaleString('pt-PT')} Kz
                </strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <button
                  onClick={() => { setCatViewMode('list'); localStorage.setItem('dcv_catViewMode', 'list'); }}
                  style={{
                    padding: '6px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                    backgroundColor: catViewMode === 'list' ? 'var(--color-accent)' : 'transparent',
                    color: catViewMode === 'list' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => { setCatViewMode('grid'); localStorage.setItem('dcv_catViewMode', 'grid'); }}
                  style={{
                    padding: '6px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                    backgroundColor: catViewMode === 'grid' ? 'var(--color-accent)' : 'transparent',
                    color: catViewMode === 'grid' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  <LayoutGrid size={14} />
                </button>
              </div>
              {role !== 'ReadOnly' && (
                <button onClick={() => { setEditingCat(null); setCatFormData({ Nome: '', Tipo: 'Despesa', Subtipo: 'Nenhum', CategoriaMaeID: '', Alvo: 0, LimiteMensal: 0 }); setShowCatForm(true); }}
                  className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <Plus size={14} /> Nova Categoria
                </button>
              )}
            </div>
          </div>
          {catBalances.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Nenhuma categoria neste cartão</p>
          ) : catViewMode === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {catBalances.map(cat => {
                const isDespesa = cat.Tipo === 'Despesa';
                const iconColor = isDespesa ? 'var(--color-error)' : 'var(--color-success)';
                const iconBg = isDespesa ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)';
                const catLaunches = cardLaunches.filter(l => l.CategoriaID === cat.CategoriaID);
                const catEntradas = catLaunches.filter(l => l.Tipo === 'Entrada').reduce((s, l) => s + Number(l.Valor), 0);
                const catSaidas = catLaunches.filter(l => l.Tipo === 'Saida').reduce((s, l) => s + Number(l.Valor), 0);

                return (
                  <div key={cat.CategoriaID} style={{
                    padding: '14px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    transition: 'border-color 0.15s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '8px',
                          background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {isDespesa ? <TrendingDown size={16} style={{ color: iconColor }} /> : <TrendingUp size={16} style={{ color: iconColor }} />}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.92rem' }}>{cat.Nome}</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <span style={{ color: iconColor, fontWeight: 600 }}>{isDespesa ? 'Despesa' : 'Receita'}</span>
                            {cat.Subtipo !== 'Nenhum' && <span> · {cat.Subtipo}</span>}
                          </p>
                        </div>
                      </div>
                      {role !== 'ReadOnly' && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => { setEditingCat(cat); setCatFormData({ Nome: cat.Nome, Tipo: cat.Tipo, Subtipo: cat.Subtipo, CategoriaMaeID: cat.CategoriaMaeID || '', Alvo: cat.Alvo || 0, LimiteMensal: cat.LimiteMensal || 0 }); setShowCatForm(true); }}
                            style={{ background: 'rgba(99,102,241,0.1)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--color-accent)' }}
                            title="Editar">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => { if (window.confirm('Eliminar esta categoria?')) onDeleteCategory(cat.CategoriaID); }}
                            style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--color-error)' }}
                            title="Eliminar">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(16,185,129,0.06)' }}>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Entradas</p>
                        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-success)' }}>
                          {catEntradas.toLocaleString('pt-PT')} Kz
                        </p>
                      </div>
                      <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(239,68,68,0.06)' }}>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Saídas</p>
                        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-error)' }}>
                          {catSaidas.toLocaleString('pt-PT')} Kz
                        </p>
                      </div>
                      <div style={{ padding: '8px', borderRadius: '6px', background: cat.saldo >= 0 ? 'rgba(99,102,241,0.06)' : 'rgba(239,68,68,0.06)' }}>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Saldo</p>
                        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: cat.saldo >= 0 ? 'var(--color-accent)' : 'var(--color-error)' }}>
                          {cat.saldo.toLocaleString('pt-PT')} Kz
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {catBalances.map(cat => {
                const isDespesa = cat.Tipo === 'Despesa';
                const iconColor = isDespesa ? 'var(--color-error)' : 'var(--color-success)';
                const iconBg = isDespesa ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)';
                const catLaunches = cardLaunches.filter(l => l.CategoriaID === cat.CategoriaID);
                const catEntradas = catLaunches.filter(l => l.Tipo === 'Entrada').reduce((s, l) => s + Number(l.Valor), 0);
                const catSaidas = catLaunches.filter(l => l.Tipo === 'Saida').reduce((s, l) => s + Number(l.Valor), 0);
                const progress = cat.Alvo > 0 ? Math.min(cat.saldo / cat.Alvo, 1) : 0;
                const hasTarget = cat.Alvo > 0;
                const hasLimit = cat.LimiteMensal > 0;

                return (
                  <div key={cat.CategoriaID} style={{
                    padding: '16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    display: 'flex', flexDirection: 'column', gap: '10px',
                    position: 'relative', transition: 'border-color 0.15s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {isDespesa ? <TrendingDown size={18} style={{ color: iconColor }} /> : <TrendingUp size={18} style={{ color: iconColor }} />}
                      </div>
                      {role !== 'ReadOnly' && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => { setEditingCat(cat); setCatFormData({ Nome: cat.Nome, Tipo: cat.Tipo, Subtipo: cat.Subtipo, CategoriaMaeID: cat.CategoriaMaeID || '', Alvo: cat.Alvo || 0, LimiteMensal: cat.LimiteMensal || 0 }); setShowCatForm(true); }}
                            style={{ background: 'rgba(99,102,241,0.1)', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: 'var(--color-accent)' }}
                            title="Editar">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => { if (window.confirm('Eliminar esta categoria?')) onDeleteCategory(cat.CategoriaID); }}
                            style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: 'var(--color-error)' }}
                            title="Eliminar">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cat.Nome}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span style={{ color: iconColor, fontWeight: 600 }}>{isDespesa ? 'Despesa' : 'Receita'}</span>
                        {cat.Subtipo !== 'Nenhum' && <span> · {cat.Subtipo}</span>}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--color-success)' }}>Entrada</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{catEntradas.toLocaleString('pt-PT')} Kz</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--color-error)' }}>Saída</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-error)' }}>{catSaidas.toLocaleString('pt-PT')} Kz</span>
                      </div>
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Saldo</span>
                        <span style={{ fontWeight: 700, color: cat.saldo >= 0 ? 'var(--color-accent)' : 'var(--color-error)' }}>
                          {cat.saldo.toLocaleString('pt-PT')} Kz
                        </span>
                      </div>
                    </div>

                    {hasTarget && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          <span>Progresso: {cat.saldo.toLocaleString('pt-PT')} / {cat.Alvo.toLocaleString('pt-PT')} Kz</span>
                          <span>{Math.round(progress * 100)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
                          <div style={{ width: `${Math.min(progress * 100, 100)}%`, height: '100%', borderRadius: '3px', background: progress >= 1 ? 'var(--color-success)' : 'var(--color-accent)', transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    )}

                    {hasLimit && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Limite mensal</span>
                        <span style={{ fontWeight: 600, color: catSaidas > cat.LimiteMensal ? 'var(--color-error)' : 'var(--text-primary)' }}>
                          {catSaidas.toLocaleString('pt-PT')} / {cat.LimiteMensal.toLocaleString('pt-PT')} Kz
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LANCAMENTOS */}
      {activeSection === 'lancamentos' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Lançamentos das Categorias</h4>
            {role !== 'ReadOnly' && (
              <button onClick={() => { setEditingLanc(null); setLancFormData({ Data: new Date().toISOString().substring(0, 10), CategoriaID: '', Tipo: 'Saida', Valor: '', Descricao: '', Conta: 'Banco', Status: 'confirmado' }); setShowLancForm(true); }}
                className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                <Plus size={14} /> Novo Lançamento
              </button>
            )}
          </div>
          {(() => {
            const catLaunches = cardLaunches.filter(l => l.CategoriaID);
            if (catLaunches.length === 0) return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Nenhum lançamento nas categorias</p>;
            return (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Data</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Categoria</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Tipo</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Valor</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Descrição</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...catLaunches].sort((a, b) => new Date(b.Data) - new Date(a.Data)).map(l => {
                      const cat = cardCategories.find(c => c.CategoriaID === l.CategoriaID);
                      return (
                        <tr key={l.LancID} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{l.Data}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600 }}>{cat?.Nome || 'Sem categoria'}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: l.Tipo === 'Entrada' ? 'var(--color-success-bg)' : 'var(--color-error-bg)', color: l.Tipo === 'Entrada' ? 'var(--color-success)' : 'var(--color-error)' }}>
                              {l.Tipo === 'Entrada' ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: l.Tipo === 'Entrada' ? 'var(--color-success)' : 'var(--color-error)' }}>
                            {l.Tipo === 'Entrada' ? '+' : '-'}{Number(l.Valor).toLocaleString('pt-PT')} Kz
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{l.Descricao || 'Sem descrição'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {role !== 'ReadOnly' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => { setEditingLanc(l); setLancFormData({ Data: l.Data, CategoriaID: l.CategoriaID, Tipo: l.Tipo, Valor: l.Valor, Descricao: l.Descricao, Conta: l.Conta || 'Banco', Status: l.Status || 'confirmado' }); setShowLancForm(true); }}
                                  style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                                  Editar
                                </button>
                                <button onClick={() => { if (window.confirm('Tem certeza que deseja excluir este lançamento?')) onDeleteLaunch(l.LancID); }}
                                  style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>
                                  Eliminar
                                </button>
                              </div>
                            )}
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
      )}

      {/* TRANSFERIR */}
      {activeSection === 'transferir' && (
        <div className="glass-panel" style={{ padding: '20px', maxWidth: '480px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Transferir entre Cartões</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Saldo disponível: <strong>{saldoDisponivel.toLocaleString('pt-PT')} Kz</strong>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Cartão de Destino</label>
              <select value={transferData.to_card_id} onChange={e => setTransferData({ ...transferData, to_card_id: e.target.value })}
                className="form-select" style={{ width: '100%' }}>
                <option value="">Selecione...</option>
                {cards.filter(c => c.id !== card.id).map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Valor (Kz)</label>
              <input type="number" value={transferData.amount} onChange={e => setTransferData({ ...transferData, amount: e.target.value })}
                className="form-input" placeholder="0" min="0" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Descrição</label>
              <input type="text" value={transferData.description} onChange={e => setTransferData({ ...transferData, description: e.target.value })}
                className="form-input" placeholder="Opcional" style={{ width: '100%' }} />
            </div>
            <button onClick={handleTransfer} className="btn btn-primary" style={{ padding: '12px', marginTop: '8px' }}>
              <ArrowLeftRight size={16} style={{ marginRight: '6px' }} /> Transferir
            </button>
          </div>
        </div>
      )}

      {/* CARREGAMENTOS */}
      {activeSection === 'carregamentos' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Carregamentos do Cartão</h4>
            {role !== 'ReadOnly' && (
              <button onClick={() => { setCarregFormData({ Valor: '', Data: new Date().toISOString().substring(0, 10), Descricao: '', Observacoes: '' }); setShowCarregForm(true); }}
                className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                <Plus size={14} /> Novo Carregamento
              </button>
            )}
          </div>
          {carregamentos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
              Ainda não existem carregamentos registados neste cartão.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Data</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>ID</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Cartão</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Tipo</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Valor</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Descrição</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Criado Por</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {[...carregamentos].sort((a, b) => new Date(b.Data) - new Date(a.Data)).map(l => (
                    <tr key={l.LancID} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{l.Data}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{l.LancID}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600 }}>{card.icon || '💳'} {card.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                          Entrada
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-success)' }}>
                        +{Number(l.Valor).toLocaleString('pt-PT')} Kz
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{l.Descricao || 'Sem descrição'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{l.CriadoPor}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {role !== 'ReadOnly' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => { setEditingLanc(l); setLancFormData({ Data: l.Data, CategoriaID: l.CategoriaID, Tipo: l.Tipo, Valor: l.Valor, Descricao: l.Descricao, Conta: l.Conta || 'Banco', Status: l.Status || 'confirmado' }); setShowLancForm(true); }}
                              style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                              Editar
                            </button>
                            <button onClick={() => { if (window.confirm('Tem certeza que deseja excluir este carregamento?')) onDeleteLaunch(l.LancID); }}
                              style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>
                              Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Category Form Modal */}
      {showCatForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{editingCat ? 'Editar Categoria' : 'Nova Categoria'}</h3>
            <form onSubmit={handleAddCat} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nome *</label>
                <input type="text" value={catFormData.Nome} onChange={e => setCatFormData({ ...catFormData, Nome: e.target.value })}
                  className="form-input" style={{ width: '100%' }} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tipo</label>
                  <select value={catFormData.Tipo} onChange={e => setCatFormData({ ...catFormData, Tipo: e.target.value })} className="form-select" style={{ width: '100%' }}>
                    <option value="Receita">Receita</option>
                    <option value="Despesa">Despesa</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Subtipo</label>
                  <select value={catFormData.Subtipo} onChange={e => setCatFormData({ ...catFormData, Subtipo: e.target.value })} className="form-select" style={{ width: '100%' }}>
                    <option value="Nenhum">Nenhum</option>
                    <option value="Investimento">Investimento</option>
                    <option value="Poupanca">Poupança</option>
                    <option value="Divida">Dívida</option>
                    <option value="Emprestimo">Empréstimo</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowCatForm(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingCat ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Launch Form Modal */}
      {showLancForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{editingLanc ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
            <form onSubmit={handleAddLanc} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Categoria *</label>
                <select value={lancFormData.CategoriaID} onChange={e => setLancFormData({ ...lancFormData, CategoriaID: e.target.value })} className="form-select" style={{ width: '100%' }} required>
                  <option value="">Selecione...</option>
                  {cardCategories.map(c => <option key={c.CategoriaID} value={c.CategoriaID}>{c.Nome}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tipo</label>
                  <select value={lancFormData.Tipo} onChange={e => setLancFormData({ ...lancFormData, Tipo: e.target.value })} className="form-select" style={{ width: '100%' }}>
                    <option value="Entrada">Entrada</option>
                    <option value="Saida">Saída</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Valor *</label>
                  <input type="number" value={lancFormData.Valor} onChange={e => setLancFormData({ ...lancFormData, Valor: e.target.value })} className="form-input" min="0" required style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Descrição</label>
                <input type="text" value={lancFormData.Descricao} onChange={e => setLancFormData({ ...lancFormData, Descricao: e.target.value })} className="form-input" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowLancForm(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingLanc ? 'Salvar' : 'Adicionar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Carregamento Form Modal */}
      {showCarregForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Novo Carregamento</h3>
            <form onSubmit={handleCarregSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Valor *</label>
                <input type="number" value={carregFormData.Valor} onChange={e => setCarregFormData({ ...carregFormData, Valor: e.target.value })}
                  className="form-input" min="0" required style={{ width: '100%' }} placeholder="Ex: 50000" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Data</label>
                <input type="date" value={carregFormData.Data} onChange={e => setCarregFormData({ ...carregFormData, Data: e.target.value })}
                  className="form-input" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Descrição</label>
                <input type="text" value={carregFormData.Descricao} onChange={e => setCarregFormData({ ...carregFormData, Descricao: e.target.value })}
                  className="form-input" placeholder="Opcional" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Observações</label>
                <textarea value={carregFormData.Observacoes} onChange={e => setCarregFormData({ ...carregFormData, Observacoes: e.target.value })}
                  className="form-input" placeholder="Opcional" rows={2} style={{ width: '100%', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowCarregForm(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <CreditCard size={14} style={{ marginRight: '6px' }} /> Carregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Card Modal */}
      {showEditCardForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel animate-fade-in" style={{
            maxWidth: '480px', width: '100%', maxHeight: 'min(85vh, 600px)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            {/* Fixed Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Personalizar Cartão</h3>
              <button onClick={() => setShowEditCardForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <form onSubmit={handleSaveEditCard} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Live preview */}
                <div style={{
                  padding: '14px', borderRadius: '12px',
                  background: `linear-gradient(135deg, ${editCardData.color}, ${editCardData.color}dd)`,
                  color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{card.icon || '💳'}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1rem' }}>{card.name}</p>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Modelo: {editCardData.model} · Estilo: {editCardData.style}</p>
                  </div>
                </div>

                {/* Cor */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Cor</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxHeight: '100px', overflowY: 'auto', padding: '4px 0' }}>
                    {CARD_COLORS_DCV.map(c => (
                      <button key={c} type="button" onClick={() => setEditCardData({ ...editCardData, color: c })}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px', border: editCardData.color === c ? '2px solid var(--color-accent)' : '2px solid transparent',
                          background: c, cursor: 'pointer',
                          boxShadow: editCardData.color === c ? '0 0 0 2px rgba(99,102,241,0.3)' : 'none',
                          outline: c === '#ffffff' ? '1px solid var(--border-color)' : 'none'
                        }} />
                    ))}
                  </div>
                </div>

                {/* Intensidade */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Intensidade da Cor</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="range" min="0" max="100" value={editCardData.intensity}
                      onChange={e => setEditCardData({ ...editCardData, intensity: Number(e.target.value) })}
                      style={{ flex: 1, accentColor: editCardData.color, height: '6px', cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '35px', textAlign: 'right' }}>{editCardData.intensity}%</span>
                  </div>
                </div>

                {/* Modelo */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Modelo</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {CARD_MODELS_DCV.map(m => (
                      <button key={m} type="button" onClick={() => setEditCardData({ ...editCardData, model: m })}
                        style={{
                          padding: '6px 10px', borderRadius: '8px', border: editCardData.model === m ? '1px solid var(--color-accent)' : '1px solid var(--border-color)',
                          background: editCardData.model === m ? 'rgba(99,102,241,0.08)' : 'transparent',
                          cursor: 'pointer', fontSize: '0.75rem', fontWeight: editCardData.model === m ? 700 : 500,
                          color: editCardData.model === m ? 'var(--color-accent)' : 'var(--text-secondary)',
                          textTransform: 'capitalize'
                        }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estilo */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Estilo</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxHeight: '80px', overflowY: 'auto', padding: '4px 0' }}>
                    {CARD_STYLES_DCV.map(s => (
                      <button key={s} type="button" onClick={() => setEditCardData({ ...editCardData, style: s })}
                        style={{
                          padding: '6px 10px', borderRadius: '8px', border: editCardData.style === s ? '1px solid var(--color-accent)' : '1px solid var(--border-color)',
                          background: editCardData.style === s ? 'rgba(99,102,241,0.08)' : 'transparent',
                          cursor: 'pointer', fontSize: '0.75rem', fontWeight: editCardData.style === s ? 700 : 500,
                          color: editCardData.style === s ? 'var(--color-accent)' : 'var(--text-secondary)',
                          textTransform: 'capitalize'
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fixed Footer Buttons */}
              <div style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={() => setShowEditCardForm(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Save size={14} style={{ marginRight: '6px' }} /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
