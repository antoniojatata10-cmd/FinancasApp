import React, { useState } from 'react';
import { Tag, Check, ArrowUpRight, ArrowDownLeft, Info, Plus, AlertCircle, Target, Sparkles } from 'lucide-react';

export default function CategoriasView({ categories, launches, role, userEmail, onAddCategory, onAutoBudget }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  
  // Form State
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Despesa');
  const [categoriaMaeID, setCategoriaMaeID] = useState('');
  const [subtipo, setSubtipo] = useState('Nenhum');
  const [alvo, setAlvo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [formError, setFormError] = useState('');

  // Auto Budget State
  const [salaryInput, setSalaryInput] = useState('');
  const [budgetError, setBudgetError] = useState('');

  // Apply security filter to matches what the user can see
  const filteredLaunches = launches.filter(l => 
    role === 'Admin' || l.CriadoPor === userEmail
  );

  // Filter possible mother categories (categories that don't have mothers themselves)
  const motherCategories = categories.filter(c => !c.CategoriaMaeID && c.Ativa);

  // Handle Form Open
  const handleOpenAdd = () => {
    if (role === 'ReadOnly') {
      alert('Seu perfil de Leitura Apenas não possui permissão para criar categorias.');
      return;
    }
    setNome('');
    setTipo('Despesa');
    setCategoriaMaeID('');
    setSubtipo('Nenhum');
    setAlvo('');
    setDescricao('');
    setFormError('');
    setIsFormOpen(true);
  };

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!nome.trim()) {
      setFormError('Por favor, informe o nome da categoria.');
      return;
    }

    const catID = 'C_' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const newCat = {
      CategoriaID: catID,
      Nome: nome,
      Tipo: tipo,
      CategoriaMaeID: categoriaMaeID,
      Subtipo: subtipo,
      Alvo: subtipo === 'Investimento' || subtipo === 'Poupanca' ? Number(alvo) || 0 : 0,
      Descricao: descricao,
      Ativa: true
    };

    const success = onAddCategory(newCat);
    if (success) {
      setIsFormOpen(false);
    }
  };

  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    setBudgetError('');
    const val = Number(salaryInput);
    if (isNaN(val) || val <= 0) {
      setBudgetError('Por favor, introduza um valor de salário válido.');
      return;
    }
    onAutoBudget(val);
    setIsBudgetModalOpen(false);
    setSalaryInput('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Categorias de Controle</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Configure e gerencie o fluxo de alocação (Mãe-Filha), dívidas e metas do seu orçamento
          </p>
        </div>
        {role !== 'ReadOnly' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { setSalaryInput(''); setBudgetError(''); setIsBudgetModalOpen(true); }}
              className="btn btn-secondary"
              style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-accent)', color: 'var(--color-accent)' }}
            >
              <Sparkles size={18} /> Orçamento Automático
            </button>
            <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '10px 18px' }}>
              <Plus size={18} /> Nova Categoria
            </button>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="glass-panel" style={{
        padding: '16px',
        borderLeft: '4px solid var(--color-accent)',
        background: 'rgba(99, 102, 241, 0.05)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Info size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>Regra de Saldo Positivo & Alocação Ativa</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            • <strong>Categorias Mãe</strong> (ex: Salário) recebem depósitos diretos. Suas filhas dependem dela.<br />
            • <strong>Categorias Filhas</strong> (ex: Alimentação, Táxi) recebem alocações (Entradas) que reduzem o saldo da Mãe correspondente.<br />
            • <strong>Dívidas e Empréstimos</strong> controlam parcelamentos e amortizações até zerarem.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {categories.map((cat) => {
          const catLaunches = filteredLaunches.filter(l => l.CategoriaID === cat.CategoriaID);
          const totalEntradas = catLaunches.filter(l => l.Tipo === 'Entrada').reduce((sum, l) => sum + Number(l.Valor), 0);
          const totalSaidas = catLaunches.filter(l => l.Tipo === 'Saida').reduce((sum, l) => sum + Number(l.Valor), 0);
          const isIncomeType = cat.Tipo === 'Receita';

          // Balances calculation based on type
          let saldo = totalEntradas - totalSaidas;

          if (!cat.CategoriaMaeID && cat.Subtipo === 'Nenhum') {
            // Mother category: subtract direct expenses and children alocations
            const childIds = categories.filter(c => c.CategoriaMaeID === cat.CategoriaID).map(c => c.CategoriaID);
            const childAllocations = filteredLaunches
              .filter(l => childIds.includes(l.CategoriaID) && l.Tipo === 'Entrada')
              .reduce((sum, l) => sum + Number(l.Valor), 0);
            saldo = totalEntradas - totalSaidas - childAllocations;
          }

          const hasTarget = (cat.Subtipo === 'Investimento' || cat.Subtipo === 'Poupanca') && cat.Alvo > 0;
          const targetPercent = hasTarget ? Math.min(100, (saldo / cat.Alvo) * 100) : 0;

          return (
            <div key={cat.CategoriaID} className="glass-panel" style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              opacity: cat.Ativa ? 1 : 0.6
            }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: isIncomeType ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                    color: isIncomeType ? 'var(--color-success)' : 'var(--color-error)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Tag size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{cat.Nome}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {cat.CategoriaID} • {cat.Tipo}
                    </span>
                  </div>
                </div>

                {/* Subtype Badge */}
                {cat.Subtipo !== 'Nenhum' && (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-secondary)'
                  }}>
                    {cat.Subtipo}
                  </span>
                )}
              </div>

              {/* Mother info */}
              {cat.CategoriaMaeID && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Categoria Mãe: <strong style={{ color: 'var(--color-accent)' }}>
                    {categories.find(c => c.CategoriaID === cat.CategoriaMaeID)?.Nome || cat.CategoriaMaeID}
                  </strong>
                </div>
              )}

              {/* Description */}
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                minHeight: '40px',
                lineHeight: 1.5
              }}>
                {cat.Descricao || 'Sem descrição inserida.'}
              </p>

              {/* Targets indicators */}
              {hasTarget && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <Target size={14} /> Meta
                    </span>
                    <strong>{targetPercent.toFixed(0)}% ({saldo.toLocaleString('pt-PT')} / {cat.Alvo.toLocaleString('pt-PT')} Kz)</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${targetPercent}%`, backgroundColor: 'var(--color-success)', borderRadius: '3px' }} />
                  </div>
                </div>
              )}

              {/* Balance Breakdown Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Entradas / Abatimentos</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <ArrowUpRight size={14} /> {totalEntradas.toLocaleString('pt-PT')} Kz
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Saídas / Gastos</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <ArrowDownLeft size={14} /> {totalSaidas.toLocaleString('pt-PT')} Kz
                  </span>
                </div>
              </div>

              {/* Net Balance Footer */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--border-color)'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Saldo Disponível</span>
                <span style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: saldo < 0 ? 'var(--color-error)' : saldo < 5000 && cat.Tipo === 'Despesa' ? 'var(--color-warning)' : 'var(--text-primary)'
                }}>
                  {saldo.toLocaleString('pt-PT')} Kz
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* NEW CATEGORY MODAL */}
      {isFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }} className="animate-fade-in">
          
          <div className="glass-panel animate-scale-in" style={{
            background: 'var(--bg-secondary)',
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Nova Categoria
            </h3>

            {formError && (
              <div style={{
                background: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                border: '1px solid var(--color-error)',
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Nome */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nome da Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Farmácia, Viagens, Dívida com Pedro"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Tipo */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tipo Geral</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="form-select"
                  >
                    <option value="Despesa">Despesa (Saídas)</option>
                    <option value="Receita">Receita (Entradas)</option>
                  </select>
                </div>

                {/* Subtipo Especial */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Subtipo Especial</label>
                  <select
                    value={subtipo}
                    onChange={(e) => setSubtipo(e.target.value)}
                    className="form-select"
                  >
                    <option value="Nenhum">Nenhum (Comum)</option>
                    <option value="Divida">Dívida (Saldo Negativo Inicial)</option>
                    <option value="Emprestimo">Empréstimo (A receber)</option>
                    <option value="Investimento">Investimento (Com Meta)</option>
                    <option value="Poupanca">Poupança (Com Meta)</option>
                    <option value="Guardar">Guardar (Dinheiro alheio)</option>
                  </select>
                </div>
              </div>

              {/* Mother Category Binding */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Categoria Mãe (Opcional - para dependência)</label>
                <select
                  value={categoriaMaeID}
                  onChange={(e) => setCategoriaMaeID(e.target.value)}
                  className="form-select"
                >
                  <option value="">Nenhuma (Esta é uma Categoria Mãe)</option>
                  {motherCategories.map(c => (
                    <option key={c.CategoriaID} value={c.CategoriaID}>
                      {c.Nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target / Alvo */}
              {(subtipo === 'Investimento' || subtipo === 'Poupanca') && (
                <div className="form-group animate-slide-up" style={{ marginBottom: 0 }}>
                  <label className="form-label">Valor Alvo da Meta (Kz)</label>
                  <input
                    type="number"
                    placeholder="Ex: 150000"
                    value={alvo}
                    onChange={(e) => setAlvo(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              )}

              {/* Descrição */}
              <div className="form-group">
                <label className="form-label">Descrição / Notas</label>
                <textarea
                  placeholder="Explique o propósito desta categoria..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="form-textarea"
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Criar Categoria
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* AUTO BUDGET MODAL */}
      {isBudgetModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }} className="animate-fade-in">
          
          <div className="glass-panel animate-scale-in" style={{
            background: 'var(--bg-secondary)',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} style={{ color: 'var(--color-accent)' }} /> Orçamento Automático (50/20/20/10)
            </h3>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Introduza o seu rendimento/salário líquido mensal. O sistema irá criar automaticamente a estrutura de categorias baseada na regra de ouro financeira e fazer as distribuições iniciais:
              <br /><br />
              • <strong>50%</strong> Necessidades (Alimentação, Habitação)<br />
              • <strong>20%</strong> Metas e Poupança (Reserva Financeira)<br />
              • <strong>20%</strong> Investimentos<br />
              • <strong>10%</strong> Gastos Livres / Lazer (Extras)
            </p>

            {budgetError && (
              <div style={{
                background: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                border: '1px solid var(--color-error)',
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{budgetError}</span>
              </div>
            )}

            <form onSubmit={handleBudgetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Rendimento Geral Mensal (Kz)</label>
                <input
                  type="number"
                  placeholder="Ex: 500000"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsBudgetModalOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Gerar Estrutura
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
