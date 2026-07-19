import React, { useState } from 'react';
import { CreditCard, Plus, Edit2, Trash2, ArrowLeft, Wallet, Eye, Hash, X } from 'lucide-react';
import { getCardStyle } from '../utils/cardVisualStyles';

const CARD_ICONS = ['💳', '🏦', '💰', '💳', '🏧', '🪙', '💎', '🔥', '⭐', '🎯'];

const CARD_MODELS = [
  'classico', 'moderno', 'minimalista', 'executivo', 'premium',
  'escuro', 'claro', 'neon', 'vidro', 'futurista'
];

const CARD_STYLES = [
  'plano', 'material', 'glassmorphism', 'neumorphism', 'gradient',
  'shadow', 'luxury', 'metallic', 'carbon', 'minimal',
  'soft', 'elegant', 'color-block', 'outline', 'modern'
];

const CARD_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444',
  '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6b7280', '#1e293b', '#ffffff', '#000000',
  '#64748b', '#94a3b8', '#cbd5e1', '#fb923c', '#a78bfa'
];

export default function CartoesView({
  cards, launches, categories, role, userId,
  onAddCard, onEditCard, onDeleteCard, onSelectCard
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    name: '', number: '', icon: '💳', description: '',
    color: '#6366f1', style: 'modern', model: 'classico', intensity: 50
  });
  const [formError, setFormError] = useState('');

  const userCards = cards.filter(c =>
    c.user_id === userId
  );

  const getCardStats = (cardId) => {
    const cardCategories = categories.filter(c => c.card_id === cardId);
    const cardCategoryIds = cardCategories.map(c => c.CategoriaID);
    const cardLaunches = launches.filter(l =>
      cardCategoryIds.includes(l.CategoriaID) || l.card_id === cardId
    );

    const entradas = cardLaunches
      .filter(l => l.Tipo === 'Entrada' && !l.CategoriaID)
      .reduce((s, l) => s + Number(l.Valor), 0);
    const saidas = cardLaunches
      .filter(l => l.Tipo === 'Saida')
      .reduce((s, l) => s + Number(l.Valor), 0);

    const catBalances = cardCategories.map(cat => {
      const catEntradas = cardLaunches
        .filter(l => l.CategoriaID === cat.CategoriaID && l.Tipo === 'Entrada')
        .reduce((s, l) => s + Number(l.Valor), 0);
      const catSaidas = cardLaunches
        .filter(l => l.CategoriaID === cat.CategoriaID && l.Tipo === 'Saida')
        .reduce((s, l) => s + Number(l.Valor), 0);
      return catEntradas - catSaidas;
    });

    const somaCategorias = catBalances.reduce((s, v) => s + v, 0);
    const saldoDisponivel = entradas - saidas - somaCategorias;
    const saldoContabilistico = saldoDisponivel + somaCategorias;

    return {
      entradas, saidas, saldoDisponivel, saldoContabilistico,
      numCategorias: cardCategories.length,
      numLancamentos: cardLaunches.length
    };
  };

  const handleOpenAdd = () => {
    setEditingCard(null);
    setFormData({ name: '', number: '', icon: '💳', description: '', color: '#6366f1', style: 'modern', model: 'classico', intensity: 50 });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (card) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      number: card.number || '',
      icon: card.icon || '💳',
      description: card.description || '',
      color: card.color || '#6366f1',
      style: card.style || 'modern',
      model: card.model || 'classico',
      intensity: card.intensity != null ? card.intensity : 50
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Nome é obrigatório');
      return;
    }

    if (editingCard) {
      onEditCard({ ...editingCard, ...formData });
    } else {
      onAddCard({ ...formData, user_id: userId });
    }
    setIsFormOpen(false);
    setEditingCard(null);
  };

  const handleDelete = (cardId) => {
    if (window.confirm('Eliminar este cartão? Categorias e lançamentos não serão apagados, mas ficarão sem cartão.')) {
      onDeleteCard(cardId);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Meus Cartões</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Gerencie os seus cartões financeiros e categorias
          </p>
        </div>
        {role !== 'ReadOnly' && (
          <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '10px 18px' }}>
            <Plus size={18} style={{ marginRight: '6px' }} /> Novo Cartão
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {userCards.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <CreditCard size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Nenhum cartão cadastrado</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Crie o seu primeiro cartão para começar a organizar as suas finanças
          </p>
          {role !== 'ReadOnly' && (
            <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '10px 24px' }}>
              <Plus size={16} style={{ marginRight: '6px' }} /> Criar Cartão
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {userCards.map(card => {
            const stats = getCardStats(card.id);
            return (
              <div key={card.id} className="glass-panel" style={{
                ...getCardStyle(card),
                padding: '20px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => onSelectCard(card.id)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = card.color || 'var(--color-accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ''; }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: card.color ? `${card.color}22` : 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      {card.icon || '💳'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{card.name}</h3>
                      {card.number && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <Hash size={10} /> {card.number}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(card); }}
                      style={{ background: 'rgba(99,102,241,0.1)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--color-accent)' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(card.id); }}
                      style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--color-error)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Balances */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(16,185,129,0.06)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Disponível</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: stats.saldoDisponivel >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {stats.saldoDisponivel.toLocaleString('pt-PT')} Kz
                    </p>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(99,102,241,0.06)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Contabilístico</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                      {stats.saldoContabilistico.toLocaleString('pt-PT')} Kz
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span>{stats.numCategorias} categorias</span>
                  <span>{stats.numLancamentos} lançamentos</span>
                </div>

                {card.description && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                    {card.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            maxWidth: '480px', width: '100%', maxHeight: 'min(85vh, 580px)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            {/* Fixed Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 0' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingCard ? 'Editar Cartão' : 'Novo Cartão'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ margin: '12px 20px 0', padding: '10px', borderRadius: '8px', background: 'var(--color-error-bg)', color: 'var(--color-error)', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            {/* Scrollable Content */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Nome *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="form-input" placeholder="Ex: Banco BAI" style={{ width: '100%' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Número (visual)</label>
                  <input type="text" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })}
                    className="form-input" placeholder="Ex: **** 1234" style={{ width: '100%' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Ícone</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {CARD_ICONS.map(icon => (
                      <button key={icon} type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        style={{
                          width: '40px', height: '40px', borderRadius: '8px',
                          border: formData.icon === icon ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                          background: formData.icon === icon ? 'rgba(99,102,241,0.1)' : 'transparent',
                          cursor: 'pointer', fontSize: '1.2rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Descrição</label>
                  <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="form-input" placeholder="Opcional" style={{ width: '100%' }} />
                </div>

                {/* Cor */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Cor</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxHeight: '80px', overflowY: 'auto', padding: '2px 0' }}>
                    {CARD_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px', border: formData.color === c ? '2px solid var(--color-accent)' : '2px solid transparent',
                          background: c, cursor: 'pointer', boxShadow: formData.color === c ? '0 0 0 2px rgba(99,102,241,0.3)' : 'none'
                        }} />
                    ))}
                  </div>
                </div>

                {/* Intensidade */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Intensidade da Cor</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="range" min="0" max="100" value={formData.intensity}
                      onChange={e => setFormData({ ...formData, intensity: Number(e.target.value) })}
                      style={{ flex: 1, accentColor: formData.color, height: '6px', cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '35px', textAlign: 'right' }}>{formData.intensity}%</span>
                  </div>
                </div>

                {/* Modelo */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Modelo</label>
                  <select value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })}
                    className="form-select" style={{ width: '100%' }}>
                    {CARD_MODELS.map(m => (
                      <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* Estilo */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Estilo</label>
                  <select value={formData.style} onChange={e => setFormData({ ...formData, style: e.target.value })}
                    className="form-select" style={{ width: '100%' }}>
                    {CARD_STYLES.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fixed Footer Buttons */}
              <div style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={() => setIsFormOpen(false)}
                  className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingCard ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
