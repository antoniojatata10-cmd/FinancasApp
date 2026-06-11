import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Trash2, HelpCircle, CheckCircle, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';

export default function CoachView({ launches, categories, role, userEmail }) {
  // Simulator State for Coach Input
  const [rendimento, setRendimento] = useState(() => {
    return Number(localStorage.getItem('coach_rendimento')) || 450000;
  });
  
  const [responsabilidades, setResponsabilidades] = useState(() => {
    const saved = localStorage.getItem('coach_responsabilidades');
    return saved ? JSON.parse(saved) : [
      { id: '1', nome: 'Renda de Casa', valor: 80000 },
      { id: '2', nome: 'Supermercado Alimentação', valor: 45000 },
      { id: '3', nome: 'Transporte e Combustível', valor: 20000 }
    ];
  });

  const [dificuldade, setDificuldade] = useState(() => {
    return localStorage.getItem('coach_dificuldade') || 'Poupar';
  });

  // Risk Checker state
  const [gastoValor, setGastoValor] = useState('');
  const [gastoCat, setGastoCat] = useState('');
  const [gastoDesc, setGastoDesc] = useState('');
  const [riskResult, setRiskResult] = useState(null);

  // Auto-save to LocalStorage
  useEffect(() => {
    localStorage.setItem('coach_rendimento', rendimento);
    localStorage.setItem('coach_responsabilidades', JSON.stringify(responsabilidades));
    localStorage.setItem('coach_dificuldade', dificuldade);
  }, [rendimento, responsabilidades, dificuldade]);

  // Set default category for risk check when categories load
  useEffect(() => {
    if (categories.length > 0 && !gastoCat) {
      setGastoCat(categories[0].CategoriaID);
    }
  }, [categories, gastoCat]);

  // Calculations for suggestions
  const totalResponsabilidades = responsabilidades.reduce((sum, r) => sum + Number(r.valor), 0);
  
  // Recommended distribution
  const recomEssenciais = rendimento * 0.50;
  const recomMetas = rendimento * 0.20;
  const recomFlexivel = rendimento * 0.30;

  // Add responsibility row
  const handleAddResponsibility = () => {
    setResponsabilidades(prev => [
      ...prev,
      { id: Math.random().toString(), nome: '', valor: 0 }
    ]);
  };

  // Remove row
  const handleRemoveResponsibility = (id) => {
    setResponsabilidades(prev => prev.filter(r => r.id !== id));
  };

  // Edit row field
  const handleEditResponsibility = (id, field, value) => {
    setResponsabilidades(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, [field]: field === 'valor' ? Number(value) : value };
      }
      return r;
    }));
  };

  // Risk checker logic
  const handleCheckRisk = (e) => {
    e.preventDefault();
    setRiskResult(null);

    const val = Number(gastoValor);
    if (isNaN(val) || val <= 0) {
      alert('Por favor, introduza um valor positivo.');
      return;
    }

    const cat = categories.find(c => c.CategoriaID === gastoCat);
    if (!cat) return;

    // Filter launches for checks (respecting security role)
    const userLaunches = launches.filter(l => role === 'Admin' || l.CriadoPor === userEmail);
    
    // Check total parent balance
    const totalEntradas = userLaunches.filter(l => l.Tipo === 'Entrada').reduce((sum, l) => sum + Number(l.Valor), 0);
    const totalSaidas = userLaunches.filter(l => l.Tipo === 'Saida').reduce((sum, l) => sum + Number(l.Valor), 0);
    const generalBalance = totalEntradas - totalSaidas;

    // Check specific category balance
    const catLaunches = userLaunches.filter(l => l.CategoriaID === gastoCat);
    const catEntradas = catLaunches.filter(l => l.Tipo === 'Entrada').reduce((sum, l) => sum + Number(l.Valor), 0);
    const catSaidas = catLaunches.filter(l => l.Tipo === 'Saida').reduce((sum, l) => sum + Number(l.Valor), 0);
    const catBalance = catEntradas - catSaidas;

    let level = 'success';
    let text = '';

    // 1. High risk check: Not enough available in general balance or parent balance
    if (val > generalBalance) {
      level = 'danger';
      text = `Risco Alto! Você não possui saldo geral consolidado (${generalBalance.toLocaleString('pt-PT')} Kz) suficiente para pagar este gasto de ${val.toLocaleString('pt-PT')} Kz. Esta compra resultará em endividamento imediato.`;
    } 
    // 2. High risk check: Exceeds category remaining balance
    else if (cat.Tipo === 'Despesa' && cat.Subtipo !== 'Divida' && val > catBalance) {
      level = 'danger';
      text = `Risco Alto! O saldo disponível na categoria "${cat.Nome}" é de apenas ${catBalance.toLocaleString('pt-PT')} Kz. Pelas regras de saldo positivo, o AppSheet bloqueará esta transação imediatamente.`;
    } 
    // 3. Medium risk check: planned responsibilities vs income
    else if (totalResponsabilidades + val > rendimento) {
      level = 'warning';
      text = `Risco Médio. Somando suas despesas fixas planejadas (${totalResponsabilidades.toLocaleString('pt-PT')} Kz) com esta compra, você excederá o seu rendimento mensal de ${rendimento.toLocaleString('pt-PT')} Kz. Recomendamos cortar gastos flexíveis.`;
    } 
    // 4. Low/Medium check: difficulty target risk
    else if (dificuldade === 'Poupar' && (generalBalance - val) < recomMetas) {
      level = 'warning';
      text = `Risco Moderado. Este gasto de ${val.toLocaleString('pt-PT')} Kz reduzirá sua reserva financeira para menos da meta de poupança sugerida de 20% (${recomMetas.toLocaleString('pt-PT')} Kz). Prossiga apenas se for prioritário.`;
    } 
    // 5. Success
    else {
      level = 'success';
      text = `Sem riscos! O gasto de ${val.toLocaleString('pt-PT')} Kz cabe perfeitamente na sua margem de gastos flexíveis/lazer deste mês. Seu orçamento essencial e metas de poupança continuam protegidos.`;
    }

    setRiskResult({ level, text });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Introduction Banner */}
      <div className="glass-panel" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99,102,241,0.08) 100%)',
        borderLeft: '4px solid var(--color-accent)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)' }}>
          <Sparkles size={22} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Assistente de Gestão Financeira Inteligente</h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Preencha suas informações de planejamento e suas obrigações mensais. O assistente usará esses dados para gerar uma alocação personalizada, monitorar riscos de novas compras e ajudar nas suas dificuldades.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Planning Form */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            Seus Dados de Planejamento
          </h4>

          {/* Monthly Income */}
          <div className="form-group">
            <label className="form-label">Rendimento Geral Mensal (Kz)</label>
            <input
              type="number"
              value={rendimento}
              onChange={(e) => setRendimento(Number(e.target.value))}
              placeholder="Ex: 500000"
              className="form-input"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="form-group">
            <label className="form-label">Qual a sua maior dificuldade atual?</label>
            <select
              value={dificuldade}
              onChange={(e) => setDificuldade(e.target.value)}
              className="form-select"
            >
              <option value="Poupar">Poupar Dinheiro (Criar Reserva de Emergência)</option>
              <option value="Investir">Investir Dinheiro (Metas de Casa/Carro/Telefone)</option>
              <option value="Guardar">Guardar Dinheiro de Terceiros com Segurança</option>
            </select>
          </div>

          {/* Responsibilities list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Responsabilidades e Despesas Fixas</label>
              <button
                type="button"
                onClick={handleAddResponsibility}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Add Linha
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
              {responsabilidades.map((resp, idx) => (
                <div key={resp.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Descrição da conta..."
                    value={resp.nome}
                    onChange={(e) => handleEditResponsibility(resp.id, 'nome', e.target.value)}
                    className="form-input"
                    style={{ flexGrow: 2, padding: '8px 12px', fontSize: '0.85rem' }}
                  />
                  <input
                    type="number"
                    placeholder="Valor..."
                    value={resp.valor || ''}
                    onChange={(e) => handleEditResponsibility(resp.id, 'valor', e.target.value)}
                    className="form-input"
                    style={{ width: '100px', padding: '8px 12px', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveResponsibility(resp.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-error)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Suggested Budget Breakdown */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            Distribuição Sugerida de Orçamento
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flexGrow: 1, justifyContent: 'center' }}>
            {/* Essentials Row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600 }}>Necessidades Essenciais (50%)</span>
                <span style={{ fontWeight: 700 }}>{recomEssenciais.toLocaleString('pt-PT')} Kz</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: '50%',
                  backgroundColor: 'var(--color-accent)',
                  borderRadius: '4px'
                }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Seu plano fixo atual: <strong>{totalResponsabilidades.toLocaleString('pt-PT')} Kz</strong> ({((totalResponsabilidades / rendimento) * 100).toFixed(1)}%)
              </span>
            </div>

            {/* Focus Metas Row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600 }}>Meta de Poupança/Foco ({dificuldade}) (20%)</span>
                <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{recomMetas.toLocaleString('pt-PT')} Kz</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: '20%',
                  backgroundColor: 'var(--color-success)',
                  borderRadius: '4px'
                }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Deve ser guardado imediatamente após receber o Salário.
              </span>
            </div>

            {/* Flexiveis Row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600 }}>Gastos Livres / Lazer (30%)</span>
                <span style={{ fontWeight: 700 }}>{recomFlexivel.toLocaleString('pt-PT')} Kz</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: '30%',
                  backgroundColor: 'var(--color-warning)',
                  borderRadius: '4px'
                }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Restaurantes, compras secundárias e lazer.
              </span>
            </div>
          </div>

          {/* Advice Alert */}
          <div style={{
            background: totalResponsabilidades > recomEssenciais ? 'var(--color-error-bg)' : 'var(--color-success-bg)',
            color: totalResponsabilidades > recomEssenciais ? 'var(--color-error)' : 'var(--color-success)',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            textAlign: 'center',
            fontWeight: 600
          }}>
            {totalResponsabilidades > recomEssenciais
              ? '⚠️ Suas despesas fixas estão acima de 50%! Considere cortar gastos fixos.'
              : '✓ Suas despesas fixas estão sob controle e dentro dos 50% de segurança.'}
          </div>
        </div>

      </div>

      {/* Interactive Risk Checker Form */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          Verificador de Risco de Gastos (Consultor de Bolso)
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Antes de tirar qualquer dinheiro ou fazer uma compra no impulso, informe o valor e a categoria pretendida para que o sistema verifique se trará riscos à sua saúde financeira:
        </p>

        <form onSubmit={handleCheckRisk} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          {/* Amount */}
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 150px' }}>
            <label className="form-label">Valor (Kz)</label>
            <input
              type="number"
              placeholder="Ex: 8000"
              value={gastoValor}
              onChange={(e) => setGastoValor(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Category */}
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label className="form-label">Categoria do Gasto</label>
            <select
              value={gastoCat}
              onChange={(e) => setGastoCat(e.target.value)}
              className="form-select"
              required
            >
              {categories.map(cat => (
                <option key={cat.CategoriaID} value={cat.CategoriaID}>
                  {cat.Nome} ({cat.Tipo} {cat.Subtipo !== 'Nenhum' ? ` - ${cat.Subtipo}` : ''})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 250px' }}>
            <label className="form-label">O que deseja comprar? (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Jantar restaurante novo"
              value={gastoDesc}
              onChange={(e) => setGastoDesc(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', flexShrink: 0 }}>
            Verificar Risco
          </button>
        </form>

        {/* Risk Check Result display */}
        {riskResult && (
          <div className="animate-slide-up" style={{
            marginTop: '16px',
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: riskResult.level === 'danger' ? 'var(--color-error-bg)' : riskResult.level === 'warning' ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
            border: `1px solid ${riskResult.level === 'danger' ? 'var(--color-error)' : riskResult.level === 'warning' ? 'var(--color-warning)' : 'var(--color-success)'}`,
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              color: riskResult.level === 'danger' ? 'var(--color-error)' : riskResult.level === 'warning' ? 'var(--color-warning)' : 'var(--color-success)',
              padding: '6px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              flexShrink: 0
            }}>
              {riskResult.level === 'danger' && <AlertTriangle size={24} />}
              {riskResult.level === 'warning' && <AlertTriangle size={24} />}
              {riskResult.level === 'success' && <ShieldCheck size={24} />}
            </div>
            <div>
              <h5 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: riskResult.level === 'danger' ? 'var(--color-error)' : riskResult.level === 'warning' ? 'var(--color-warning)' : 'var(--color-success)',
                marginBottom: '4px'
              }}>
                {riskResult.level === 'danger' && 'Alerta Vermelho: Risco Alto!'}
                {riskResult.level === 'warning' && 'Aviso Amarelo: Risco Moderado.'}
                {riskResult.level === 'success' && 'Sinal Verde: Compra Segura!'}
              </h5>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                {riskResult.text}
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
