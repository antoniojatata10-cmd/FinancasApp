import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles, Send, Bot, User, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, DollarSign, Target, Award,
  Plus, Trash2, Edit2, Save, PieChart, Lightbulb,
  BookOpen, Star, Lock, Download, Trophy, Zap, ChevronRight, X
} from 'lucide-react';
import { supabase } from '../supabaseClient';

// ─── IA Response Engine ────────────────────────────────────────────────────────
function gerarResposta(mensagem, contexto) {
  const msg = mensagem.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const {
    totalEntradas, totalSaidas, saldoLiquido, taxaPoupanca,
    totalDividas, categorias, numLancamentos
  } = contexto;
  const fmt = (v) => `${Number(v).toLocaleString('pt-AO')} Kz`;

  if (/^(ola|oi|bom dia|boa tarde|boa noite|hello|hey)\b/.test(msg)) {
    const h = new Date().getHours();
    const s = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    return { texto: `${s}! 👋 Sou o **Coach IA** do Finança ao Ponto. Analiso as suas finanças em tempo real.\n\nExperimente perguntar:\n• *"Qual é o meu saldo?"*\n• *"Posso comprar algo de 50.000 Kz?"*\n• *"Como poupar mais?"*\n• *"Qual o meu score financeiro?"*`, tipo: 'info' };
  }

  if (/saldo|situacao|financeiro|como estou|resumo/.test(msg)) {
    const conselho = saldoLiquido > 0
      ? `Tem saldo positivo de **${fmt(saldoLiquido)}**. Taxa de poupança: **${taxaPoupanca.toFixed(1)}%**${taxaPoupanca >= 20 ? ' — Excelente!' : ' — abaixo dos 20% recomendados.'}`
      : `⚠️ Saldo negativo (${fmt(saldoLiquido)}). As saídas superam as entradas. Reveja as despesas.`;
    return { texto: `📊 **Situação financeira:**\n\n• Entradas: **${fmt(totalEntradas)}**\n• Saídas: **${fmt(totalSaidas)}**\n• Saldo: **${fmt(saldoLiquido)}** (${saldoLiquido >= 0 ? '✅ Positivo' : '🔴 Negativo'})\n• Poupança: **${taxaPoupanca.toFixed(1)}%**\n\n${conselho}`, tipo: saldoLiquido > 0 ? 'success' : 'danger' };
  }

  if (/posso comprar|posso gastar|posso pagar|vale a pena/.test(msg)) {
    const match = mensagem.match(/(\d[\d\.,]*)/);
    const valor = match ? Number(match[0].replace(/\./g, '').replace(',', '.')) : null;
    if (!valor) return { texto: `Diga-me o valor da compra. Ex: *"Posso comprar algo de 80.000 Kz?"*`, tipo: 'info' };
    if (valor > saldoLiquido) return { texto: `⛔ **Risco Alto!** O gasto de **${fmt(valor)}** supera o seu saldo de **${fmt(saldoLiquido)}**. Aguarde acumular pelo menos **${fmt(valor * 1.2)}**.`, tipo: 'danger' };
    if (valor > saldoLiquido * 0.5) return { texto: `⚠️ **Risco Moderado.** Este gasto representa **${((valor / saldoLiquido) * 100).toFixed(0)}%** do seu saldo. Verifique se é urgente.`, tipo: 'warning' };
    return { texto: `✅ **Seguro!** O gasto de **${fmt(valor)}** representa apenas **${((valor / saldoLiquido) * 100).toFixed(0)}%** do seu saldo de **${fmt(saldoLiquido)}**. As suas metas estão protegidas.`, tipo: 'success' };
  }

  if (/divida|dividas|devia|devo|emprestimo/.test(msg)) {
    if (totalDividas <= 0) return { texto: `🎉 Não foram detectadas dívidas activas. Continue assim!`, tipo: 'success' };
    return { texto: `💳 **Dívidas activas: ${fmt(totalDividas)}**\n\n**Plano recomendado:**\n1️⃣ Liste dívidas por taxa de juro (pague a mais alta primeiro — Método Avalanche)\n2️⃣ Destine 20% do rendimento para amortização extra\n3️⃣ Evite criar novas dívidas enquanto tem pendentes`, tipo: 'warning' };
  }

  if (/poupar|poupanca|economizar|reserva|emergencia/.test(msg)) {
    const metaPoupanca = totalEntradas * 0.20;
    const falta = Math.max(0, metaPoupanca - Math.max(0, saldoLiquido));
    return { texto: `💰 **Guia de Poupança:**\n\n📌 Meta 20% das entradas = **${fmt(metaPoupanca)}/mês**\n${falta > 0 ? `📌 Falta poupar: **${fmt(falta)}**\n` : '📌 Já está acima da meta! ✅\n'}\n**3 estratégias:**\n🥇 Automatize a poupança — transfira antes de gastar\n🥈 Regra 50/20/20/10: necessidades/poupança/invest./lazer\n🥉 Corte 1 despesa desnecessária este mês`, tipo: 'info' };
  }

  if (/investir|bodiva|obrigacao|tesouro|acoes|divisas/.test(msg)) {
    return { texto: `📈 **Investimentos em Angola:**\n\n🟢 **Conservador (baixo risco):**\n• BTs (Bilhetes do Tesouro): ~14,5% a.a.\n• OTs (Obrigações do Tesouro): ~17% a.a.\n\n🟡 **Moderado:**\n• Mix BTs + Ações BODIVA (BAI, BCI)\n\n🔴 **Arrojado:**\n• Ações + ETFs internacionais (VOO, URTH)\n\n💡 Aceda à aba **Investimentos** para simulações e o guia completo da BODIVA.`, tipo: 'info' };
  }

  if (/score|pontuacao|nota|avaliacao|saude/.test(msg)) {
    let s = 0;
    if (taxaPoupanca >= 20) s += 40; else s += (taxaPoupanca / 20) * 40;
    s += Math.max(0, 30 - (totalDividas / 100000) * 30);
    if (numLancamentos >= 12) s += 30; else if (numLancamentos >= 6) s += 20; else if (numLancamentos >= 2) s += 10;
    s = Math.round(s);
    const nivel = s > 80 ? '🟢 Excelente' : s > 60 ? '🔵 Bom' : s > 30 ? '🟡 Atenção' : '🔴 Crítico';
    return { texto: `🏆 **Score IA: ${s}/100 — ${nivel}**\n\n• Poupança (${taxaPoupanca.toFixed(1)}%): ${Math.round(Math.min(40, (taxaPoupanca/20)*40))}/40 pts\n• Dívidas: ${Math.round(Math.max(0, 30-(totalDividas/100000)*30))}/30 pts\n• Registos (${numLancamentos}): ${numLancamentos >= 12 ? 30 : numLancamentos >= 6 ? 20 : numLancamentos >= 2 ? 10 : 0}/30 pts`, tipo: s > 60 ? 'success' : s > 30 ? 'warning' : 'danger' };
  }

  if (/dica|conselho|sugestao|estrategia/.test(msg)) {
    const dicas = [
      `🎯 **Regra 48h:** Antes de qualquer compra acima de ${fmt(50000)}, espere 48h. Se ainda quiser, é necessário.`,
      `💡 **Automatize:** Transfira 20% do salário para poupança logo após receber. O que não se vê, não se gasta.`,
      `📋 **Revisão semanal:** 10 minutos por semana a rever lançamentos evitam surpresas no fim do mês.`,
      `🔄 **Método Snowball:** Pague a menor dívida primeiro para ganhar motivação psicológica.`,
      `📈 **Pague-se primeiro:** Invista antes de gastar. A riqueza constrói-se com este hábito.`
    ];
    return { texto: dicas[Math.floor(Math.random() * dicas.length)], tipo: 'info' };
  }

  if (/ajuda|help|exemplos|funcionalidades/.test(msg)) {
    return { texto: `🤖 **Coach IA — posso ajudar com:**\n\n• *"Qual é o meu saldo?"*\n• *"Posso comprar algo de 150.000 Kz?"*\n• *"Como poupar mais?"*\n• *"Tenho dívidas?"*\n• *"Como investir na BODIVA?"*\n• *"Qual o meu score financeiro?"*\n• *"Dá-me uma dica financeira"*\n\nQuanto mais lançamentos registar, mais preciso serei! 📊`, tipo: 'info' };
  }

  if (/independencia|liberdade|reforma|fire/.test(msg)) {
    const capital = totalSaidas * 12 * 25;
    return { texto: `🏖️ **Independência Financeira — O seu número:**\n\nPela **Regra dos 25x** (taxa de retirada de 4%/ano):\n\n💎 **Capital necessário: ${fmt(capital)}**\n\nEste valor, investido diversificadamente, gerará rendimentos passivos que cobrem as suas despesas para sempre.\n\n**Como chegar lá:** Poupança 30%+ | Reinvestir dividendos | Manter consistência por 10-20 anos`, tipo: 'info' };
  }

  return { texto: `🤔 Não compreendi bem. Tente:\n\n*"saldo", "poupar", "investir", "dívidas", "comprar [valor]", "score", "dicas"*\n\nEx: *"Posso comprar algo de 100.000 Kz?"*`, tipo: 'info' };
}

// ─── Budget Planner ───────────────────────────────────────────────────────────
const CATEGORIAS_PADRAO = [
  { id: '1', nome: 'Renda / Habitação', percentual: 30, cor: '#6366f1' },
  { id: '2', nome: 'Alimentação', percentual: 20, cor: '#34d399' },
  { id: '3', nome: 'Transporte', percentual: 10, cor: '#f59e0b' },
  { id: '4', nome: 'Poupança', percentual: 20, cor: '#10b981' },
  { id: '5', nome: 'Saúde', percentual: 5, cor: '#ec4899' },
  { id: '6', nome: 'Educação', percentual: 5, cor: '#8b5cf6' },
  { id: '7', nome: 'Lazer', percentual: 5, cor: '#f97316' },
  { id: '8', nome: 'Outros', percentual: 5, cor: '#94a3b8' },
];

function BudgetPlanner() {
  const [rendimento, setRendimento] = useState(() => localStorage.getItem('budget_rendimento') || '');
  const [despesas, setDespesas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('budget_despesas_v1')) || CATEGORIAS_PADRAO; } catch { return CATEGORIAS_PADRAO; }
  });
  const [novaDespesa, setNovaDespesa] = useState({ nome: '', valor: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [editVal, setEditVal] = useState('');

  useEffect(() => { localStorage.setItem('budget_rendimento', rendimento); }, [rendimento]);
  useEffect(() => { localStorage.setItem('budget_despesas_v1', JSON.stringify(despesas)); }, [despesas]);

  const rend = Number(rendimento) || 0;
  const totalAlocado = despesas.reduce((s, d) => s + (d.valor || (rend * d.percentual / 100)), 0);
  const saldoLivre = rend - totalAlocado;

  const handleAddDespesa = (e) => {
    e.preventDefault();
    if (!novaDespesa.nome || !novaDespesa.valor) return;
    setDespesas(prev => [...prev, {
      id: Date.now().toString(),
      nome: novaDespesa.nome,
      valor: Number(novaDespesa.valor),
      percentual: 0,
      cor: `hsl(${Math.random() * 360}, 70%, 55%)`
    }]);
    setNovaDespesa({ nome: '', valor: '' });
  };

  const handleRemove = (id) => setDespesas(prev => prev.filter(d => d.id !== id));

  const handleSaveEdit = (id) => {
    setDespesas(prev => prev.map(d => d.id === id ? { ...d, valor: Number(editVal), percentual: rend > 0 ? (Number(editVal) / rend) * 100 : d.percentual } : d));
    setEditandoId(null);
  };

  const getValor = (d) => d.valor || (rend * d.percentual / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Income input */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h4 style={{ fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={18} style={{ color: 'var(--color-accent)' }} /> Planeador de Orçamento Mensal
        </h4>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Rendimento Mensal Total (Kz)
          </label>
          <input
            type="number"
            value={rendimento}
            onChange={e => setRendimento(e.target.value)}
            className="form-input"
            placeholder="Ex: 500000"
            style={{ maxWidth: '280px' }}
          />
        </div>

        {rend > 0 && (
          <>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Rendimento', val: rend, color: 'var(--color-success)' },
                { label: 'Alocado', val: totalAlocado, color: 'var(--color-accent)' },
                { label: 'Saldo Livre', val: saldoLivre, color: saldoLivre >= 0 ? 'var(--color-success)' : 'var(--color-error)' },
              ].map(c => (
                <div key={c.label} style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '3px' }}>{c.label}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: c.color }}>{Number(c.val).toLocaleString('pt-AO')} Kz</div>
                </div>
              ))}
            </div>

            {/* Percentage bar */}
            <div style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', height: '10px', borderRadius: '10px', overflow: 'hidden', gap: '1px' }}>
                {despesas.map(d => {
                  const pct = rend > 0 ? (getValor(d) / rend) * 100 : 0;
                  return pct > 0 ? (
                    <div key={d.id} style={{ width: `${Math.min(pct, 100)}%`, background: d.cor, transition: 'width 0.4s' }} title={`${d.nome}: ${pct.toFixed(1)}%`} />
                  ) : null;
                })}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {((totalAlocado / rend) * 100).toFixed(0)}% do rendimento alocado
              </div>
            </div>
          </>
        )}
      </div>

      {/* Despesas list */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h4 style={{ fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart size={16} style={{ color: 'var(--color-accent)' }} /> Distribuição de Despesas Fixas
          {rend > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>— valores sugeridos com base no seu rendimento</span>}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {despesas.map(d => {
            const val = getValor(d);
            const pct = rend > 0 ? (val / rend) * 100 : d.percentual;
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: d.cor, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{d.nome}</span>
                    {editandoId === d.id ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                          style={{ width: '100px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                        <button onClick={() => handleSaveEdit(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#34d399' }}><Save size={14} /></button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{Number(val).toLocaleString('pt-AO')} Kz</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({pct.toFixed(0)}%)</span>
                        <button onClick={() => { setEditandoId(d.id); setEditVal(String(Math.round(val))); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={12} /></button>
                        <button onClick={() => handleRemove(d.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}><Trash2 size={12} /></button>
                      </div>
                    )}
                  </div>
                  {rend > 0 && (
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: d.cor, borderRadius: '4px', transition: 'width 0.4s' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add expense form */}
        <form onSubmit={handleAddDespesa} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '140px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nome da Despesa</label>
            <input type="text" value={novaDespesa.nome} onChange={e => setNovaDespesa(p => ({ ...p, nome: e.target.value }))}
              className="form-input" placeholder="Ex: Internet" />
          </div>
          <div style={{ flex: '1', minWidth: '120px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Valor (Kz)</label>
            <input type="number" value={novaDespesa.valor} onChange={e => setNovaDespesa(p => ({ ...p, valor: e.target.value }))}
              className="form-input" placeholder="20000" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', padding: '10px 14px' }}>
            <Plus size={14} /> Adicionar
          </button>
        </form>
      </div>

      {rend > 0 && (
        <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '10px', padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <Lightbulb size={14} style={{ color: 'var(--color-accent)', display: 'inline', marginRight: '6px' }} />
          <strong style={{ color: 'var(--color-accent)' }}>Sugestão IA:</strong> Com um rendimento de <strong>{Number(rend).toLocaleString('pt-AO')} Kz</strong>, a distribuição ideal é: 50% necessidades ({Number(rend * 0.5).toLocaleString('pt-AO')} Kz) + 20% poupança ({Number(rend * 0.2).toLocaleString('pt-AO')} Kz) + 20% investimentos ({Number(rend * 0.2).toLocaleString('pt-AO')} Kz) + 10% lazer ({Number(rend * 0.1).toLocaleString('pt-AO')} Kz).
        </div>
      )}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function CoachView({ launches, categories, role, userEmail, userId, getCategoryBalance }) {
  const [activeSection, setActiveSection] = useState('chat');
  const [salario503020, setSalario503020] = useState(() => localStorage.getItem('coach_salario_503020') || '');

  // Listas editáveis de despesas por categoria
  const [necessidades, setNecessidades] = useState(() => {
    try { return JSON.parse(localStorage.getItem('coach_necessidades_v2')) || []; } catch { return []; }
  });
  const [desejos, setDesejos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('coach_desejos_v2')) || []; } catch { return []; }
  });
  const [investimentos, setInvestimentos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('coach_investimentos_v2')) || []; } catch { return []; }
  });

  // Estado para formulários de adicionar
  const [novaNecessidade, setNovaNecessidade] = useState({ nome: '', valor: '' });
  const [novoDesejo, setNovoDesejo] = useState({ nome: '', valor: '' });
  const [novoInvest, setNovoInvest] = useState({ nome: '', valor: '' });

  // Estado para edição
  const [editandoId, setEditandoId] = useState(null);
  const [editandoCategoria, setEditandoCategoria] = useState('');
  const [editandoValor, setEditandoValor] = useState('');
  const [mensagens, setMensagens] = useState(() => {
    // Load messages from localStorage and filter out ones older than 24h
    try {
      const saved = JSON.parse(localStorage.getItem('coach_chat_v2')) || [];
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const fresh = saved.filter(m => (m.timestamp || 0) > oneDayAgo);
      if (fresh.length > 0) return fresh;
    } catch {}
    // Default welcome message
    return [{
      id: 'welcome', tipo: 'bot', cor: 'info', timestamp: Date.now(),
      texto: '👋 Olá! Sou o **Coach IA** — o seu consultor financeiro pessoal.\n\nAgora com inteligência artificial real! Posso analisar os seus dados financeiros e também conversar sobre outros assuntos. As conversas são guardadas por 24 horas.\n\nO que gostaria de saber hoje?',
      hora: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
    }];
  });
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const userLaunches = useMemo(() =>
    launches.filter(l => role === 'SuperAdmin' || role === 'Admin' || role === 'admin' || l.CriadoPor === userId),
    [launches, role, userId]
  );

  const contexto = useMemo(() => {
    const totalEntradas = userLaunches.filter(l => l.Tipo === 'Entrada').reduce((s, l) => s + Number(l.Valor), 0);
    const totalSaidas = userLaunches.filter(l => l.Tipo === 'Saida').reduce((s, l) => s + Number(l.Valor), 0);
    const saldoLiquido = totalEntradas - totalSaidas;
    const taxaPoupanca = totalEntradas > 0 ? ((saldoLiquido / totalEntradas) * 100) : 0;
    const debtCats = categories.filter(c => c.Subtipo === 'Divida');
    let totalDividas = 0;
    debtCats.forEach(c => {
      const cl = userLaunches.filter(l => l.CategoriaID === c.CategoriaID);
      const e = cl.filter(l => l.Tipo === 'Entrada').reduce((s, l) => s + Number(l.Valor), 0);
      const sa = cl.filter(l => l.Tipo === 'Saida').reduce((s, l) => s + Number(l.Valor), 0);
      if (sa - e > 0) totalDividas += sa - e;
    });
    const categorias = categories.slice(0, 10).map(c => {
      const cl = userLaunches.filter(l => l.CategoriaID === c.CategoriaID);
      const e = cl.filter(l => l.Tipo === 'Entrada').reduce((s, l) => s + Number(l.Valor), 0);
      const sa = cl.filter(l => l.Tipo === 'Saida').reduce((s, l) => s + Number(l.Valor), 0);
      return { nome: c.Nome, saldo: Math.abs(e - sa) };
    }).sort((a, b) => b.saldo - a.saldo);
    return { totalEntradas, totalSaidas, saldoLiquido, taxaPoupanca, totalDividas, categorias, numLancamentos: userLaunches.length };
  }, [userLaunches, categories]);

  const score = useMemo(() => {
    let s = 0;
    s += Math.min(40, (contexto.taxaPoupanca / 20) * 40);
    s += Math.max(0, 30 - (contexto.totalDividas / 100000) * 30);
    if (contexto.numLancamentos >= 12) s += 30;
    else if (contexto.numLancamentos >= 6) s += 20;
    else if (contexto.numLancamentos >= 2) s += 10;
    return Math.round(s);
  }, [contexto]);

  const scoreColor = score > 80 ? '#10b981' : score > 60 ? '#3b82f6' : score > 30 ? '#f59e0b' : '#ef4444';
  const scoreTier = score > 80 ? 'Excelente' : score > 60 ? 'Bom' : score > 30 ? 'Atenção' : 'Crítico';

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagens, isTyping]);

  // Save messages to localStorage and auto-expire after 24h
  useEffect(() => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const fresh = mensagens.filter(m => (m.timestamp || Date.now()) > oneDayAgo);
    localStorage.setItem('coach_chat_v2', JSON.stringify(fresh));
    // If messages were pruned, update state
    if (fresh.length < mensagens.length) setMensagens(fresh);
  }, [mensagens]);
  useEffect(() => { localStorage.setItem('coach_salario_503020', salario503020); }, [salario503020]);
  useEffect(() => { localStorage.setItem('coach_necessidades_v2', JSON.stringify(necessidades)); }, [necessidades]);
  useEffect(() => { localStorage.setItem('coach_desejos_v2', JSON.stringify(desejos)); }, [desejos]);
  useEffect(() => { localStorage.setItem('coach_investimentos_v2', JSON.stringify(investimentos)); }, [investimentos]);

  const handleEnviar = async (texto = inputMsg) => {
    const msgTexto = texto.trim();
    if (!msgTexto) return;
    setInputMsg('');
    const hora = new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
    setMensagens(prev => [...prev, { id: Date.now(), tipo: 'user', texto: msgTexto, timestamp: Date.now(), hora }]);
    setIsTyping(true);

    let resposta;
    try {
      // Try calling the real AI via Edge Function
      const { data: sessionData } = await supabase.auth.getSession();
      const aiRes = await supabase.functions.invoke('coach-ai', {
        body: { message: msgTexto, context: contexto },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
      });
      if (aiRes.error) throw aiRes.error;
      resposta = { texto: aiRes.data.reply, tipo: 'info' };
    } catch (err) {
      // Fallback to local rule-based AI if Edge Function fails
      console.warn("Coach AI fallback:", err?.message);
      resposta = gerarResposta(msgTexto, contexto);
    }

    setIsTyping(false);
    setMensagens(prev => [...prev, {
      id: Date.now() + 1, tipo: 'bot', texto: resposta.texto, cor: resposta.tipo, timestamp: Date.now(),
      hora: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const renderTexto = (texto) => {
    const parts = texto.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> :
        part.split('\n').map((line, j, arr) => (
          <React.Fragment key={j}>{line}{j < arr.length - 1 && <br />}</React.Fragment>
        ))
    );
  };

  const botColor = {
    info:    { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
    success: { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)' },
    warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    danger:  { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)'  },
  };

  const quickPrompts = ['Qual é o meu saldo?', 'Posso comprar algo de 50.000 Kz?', 'Como poupar mais?', 'Qual o meu score?', 'Dá-me uma dica'];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--color-accent), #a5b4fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
          <Sparkles size={24} style={{ color: '#fff' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Coach IA — Consultor Financeiro</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Chat inteligente + Planeador de Orçamento Pessoal</p>
        </div>
        <div style={{ marginLeft: 'auto', padding: '10px 16px', borderRadius: '12px', background: `${scoreColor}15`, border: `1px solid ${scoreColor}40`, textAlign: 'center', minWidth: '90px' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: '0.65rem', color: scoreColor, fontWeight: 700 }}>Score IA</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{scoreTier}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {[
          { label: 'Saldo Líquido', value: `${contexto.saldoLiquido >= 0 ? '+' : ''}${Number(contexto.saldoLiquido).toLocaleString('pt-AO')} Kz`, color: contexto.saldoLiquido >= 0 ? 'var(--color-success)' : 'var(--color-error)' },
          { label: 'Taxa Poupança', value: `${contexto.taxaPoupanca.toFixed(1)}%`, color: contexto.taxaPoupanca >= 20 ? 'var(--color-success)' : '#f59e0b' },
          { label: 'Dívidas', value: `${Number(contexto.totalDividas).toLocaleString('pt-AO')} Kz`, color: contexto.totalDividas > 0 ? 'var(--color-error)' : 'var(--color-success)' },
          { label: 'Lançamentos', value: contexto.numLancamentos, color: 'var(--color-accent)' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>{stat.label}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px', overflowX: 'auto' }}>
        {[{ id: 'chat', label: '💬 Chat Financeiro' }, { id: 'orcamento', label: '📊 Planeador' }, { id: 'regra503020', label: '⚖️ Regra 50/30/20' }, { id: 'academia', label: '🎓 Academia' }].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px', whiteSpace: 'nowrap',
            fontWeight: activeSection === s.id ? 700 : 500,
            color: activeSection === s.id ? 'var(--color-accent)' : 'var(--text-secondary)',
            borderBottom: activeSection === s.id ? '2px solid var(--color-accent)' : '2px solid transparent',
            fontSize: '0.85rem', borderRadius: '6px 6px 0 0', transition: 'all 0.15s'
          }}>{s.label}</button>
        ))}
      </div>

      {/* Chat section */}
      {activeSection === 'chat' && (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <div style={{ height: '380px', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mensagens.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: '10px', flexDirection: msg.tipo === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: msg.tipo === 'bot' ? 'linear-gradient(135deg, var(--color-accent), #a5b4fc)' : 'linear-gradient(135deg, #6b7280, #9ca3af)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {msg.tipo === 'bot' ? <Bot size={16} style={{ color: '#fff' }} /> : <User size={16} style={{ color: '#fff' }} />}
                </div>
                <div style={{
                  maxWidth: '75%',
                  background: msg.tipo === 'user' ? 'linear-gradient(135deg, var(--color-accent), #a5b4fc)' : (botColor[msg.cor || 'info']?.bg || 'rgba(99,102,241,0.08)'),
                  border: msg.tipo === 'user' ? 'none' : `1px solid ${botColor[msg.cor || 'info']?.border || 'rgba(99,102,241,0.2)'}`,
                  borderRadius: msg.tipo === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '12px 14px', color: msg.tipo === 'user' ? '#fff' : 'var(--text-primary)',
                  fontSize: '0.875rem', lineHeight: 1.6
                }}>
                  {renderTexto(msg.texto)}
                  <div style={{ fontSize: '0.65rem', color: msg.tipo === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>{msg.hora}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), #a5b4fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={16} style={{ color: '#fff' }} />
                </div>
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '18px 18px 18px 4px', padding: '14px 18px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-accent)', animation: `bounce 1s ${i * 0.2}s infinite`, display: 'inline-block' }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {quickPrompts.map((p, i) => (
              <button key={i} onClick={() => handleEnviar(p)} style={{
                flexShrink: 0, padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem',
                background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s'
              }}
                onMouseEnter={e => { e.target.style.background = 'rgba(99,102,241,0.15)'; e.target.style.color = 'var(--color-accent)'; }}
                onMouseLeave={e => { e.target.style.background = 'rgba(99,102,241,0.06)'; e.target.style.color = 'var(--text-secondary)'; }}>
                💬 {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <textarea
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar(); } }}
              placeholder="Escreva a sua pergunta financeira... (Enter para enviar)"
              rows={1}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.875rem', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
            <button onClick={() => handleEnviar()} disabled={!inputMsg.trim() || isTyping} style={{
              width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
              background: inputMsg.trim() && !isTyping ? 'linear-gradient(135deg, var(--color-accent), #a5b4fc)' : 'rgba(255,255,255,0.06)',
              border: 'none', cursor: inputMsg.trim() && !isTyping ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
              boxShadow: inputMsg.trim() ? 'var(--shadow-glow)' : 'none'
            }}>
              <Send size={16} style={{ color: inputMsg.trim() && !isTyping ? '#fff' : 'var(--text-muted)' }} />
            </button>
          </div>
        </div>
      )}

      {/* Budget Planner section */}
      {activeSection === 'orcamento' && <BudgetPlanner />}

      {/* Regra 50/30/20 Section */}
      {activeSection === 'regra503020' && (() => {
        const salario = Number(salario503020) || 0;
        const metaN = salario * 0.50;
        const metaD = salario * 0.30;
        const metaI = salario * 0.20;

        const totalN = necessidades.reduce((s, x) => s + x.valor, 0);
        const totalD = desejos.reduce((s, x) => s + x.valor, 0);
        const totalI = investimentos.reduce((s, x) => s + x.valor, 0);

        const pctN = metaN > 0 ? (totalN / metaN) * 100 : 0;
        const pctD = metaD > 0 ? (totalD / metaD) * 100 : 0;
        const pctI = metaI > 0 ? (totalI / metaI) * 100 : 0;

        const fmt = v => Number(v).toLocaleString('pt-AO', { maximumFractionDigits: 0 }) + ' Kz';

        const saude = salario > 0 ? Math.max(0, Math.min(100,
          100
          - Math.max(0, pctN - 50) * 1.5
          - Math.max(0, pctD - 30) * 2
          - Math.max(0, 20 - pctI) * 2
        )) : 0;

        const statusLabel = saude >= 80 ? 'Excelente' : saude >= 60 ? 'Boa' : saude >= 40 ? 'Atenção' : saude >= 20 ? 'Mau' : 'Crítico';
        const statusCor = saude >= 80 ? '#10b981' : saude >= 60 ? '#6366f1' : saude >= 40 ? '#f59e0b' : saude >= 20 ? '#f97316' : '#ef4444';

        const addGasto = (cat, setCat, nomeDefault) => {
          const novo = { id: Date.now(), nome: nomeDefault, valor: 0 };
          setCat([...cat, novo]);
        };
        const removeGasto = (cat, setCat, id) => setCat(cat.filter(x => x.id !== id));
        const updateGasto = (cat, setCat, id, campo, valor) => setCat(cat.map(x => x.id === id ? { ...x, [campo]: valor } : x));

        const renderLista = (items, setItems, meta, cor, icone, nome, placeholder) => {
          const total = items.reduce((s, x) => s + x.valor, 0);
          const pct = meta > 0 ? (total / meta) * 100 : 0;
          return (
            <div className="glass-panel" style={{ padding: '20px', borderLeft: `4px solid ${cor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.3rem' }}>{icone}</span>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{nome}</h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Meta: {fmt(meta)}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: pct > 100 ? '#ef4444' : cor }}>{fmt(total)}</div>
                  <div style={{ fontSize: '0.72rem', color: pct > 100 ? '#ef4444' : 'var(--text-muted)' }}>{pct.toFixed(1)}% do salário</div>
                </div>
              </div>

              {/* Barra de progresso */}
              <div style={{ height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{
                  height: '100%', width: `${Math.min(100, pct)}%`, borderRadius: '8px',
                  background: pct > 100 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : pct > 80 ? `linear-gradient(90deg, ${cor}, #f59e0b)` : `linear-gradient(90deg, ${cor}, ${cor}cc)`,
                  transition: 'width 0.5s ease'
                }} />
              </div>

              {/* Lista de itens */}
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <input
                    type="text"
                    value={item.nome}
                    onChange={e => updateGasto(items, setItems, item.id, 'nome', e.target.value)}
                    className="form-input"
                    placeholder="Descrição"
                    style={{ flex: 2, fontSize: '0.82rem', padding: '8px' }}
                  />
                  <input
                    type="number"
                    value={item.valor || ''}
                    onChange={e => updateGasto(items, setItems, item.id, 'valor', Number(e.target.value))}
                    className="form-input"
                    placeholder="0"
                    style={{ flex: 1, fontSize: '0.82rem', padding: '8px' }}
                  />
                  <button
                    onClick={() => removeGasto(items, setItems, item.id)}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Botão adicionar */}
              <button
                onClick={() => addGasto(items, setItems, placeholder)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `2px dashed ${cor}40`, background: 'transparent', color: cor, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', marginTop: '4px' }}
              >
                + Adicionar gasto
              </button>

              {/* Saldo da categoria */}
              {meta > 0 && (
                <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                  background: total <= meta ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)',
                  color: total <= meta ? '#34d399' : '#ef4444',
                  border: `1px solid ${total <= meta ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`
                }}>
                  {total <= meta ? <><CheckCircle size={16} /> Ainda pode gastar {fmt(meta - total)}</> : <><AlertTriangle size={16} /> Ultrapassou {fmt(total - meta)}</>}
                </div>
              )}
            </div>
          );
        };

        const totalGeral = totalN + totalD + totalI;
        const saldo = salario - totalGeral;

        const previsao12m = [];
        const poupancaMensal = Math.max(0, totalI);
        let acumulado = 0;
        for (let m = 1; m <= 12; m++) { acumulado += poupancaMensal; previsao12m.push({ mes: m, acumulado }); }

        const reducaoDesejos = totalD * 0.15;
        const poupancaExtra = poupancaMensal + reducaoDesejos;
        const previsao5an = [];
        let acum5 = 0;
        for (let a = 1; a <= 5; a++) { acum5 += poupancaExtra * 12; previsao5an.push({ ano: a, acumulado: acum5 }); }

        const recomendacoes = [];
        if (pctN > 50) recomendacoes.push({ tipo: 'alerta', texto: `Necessidades em ${pctN.toFixed(0)}% (meta: 50%). Reduza despesas fixas como renda, serviços ou transporte.` });
        if (pctD > 30) recomendacoes.push({ tipo: 'alerta', texto: `Desejos em ${pctD.toFixed(0)}% (meta: 30%). Corte 15% em lazer para poupar ${fmt(reducaoDesejos)}/mês extra.` });
        if (pctI < 20) recomendacoes.push({ tipo: 'dica', texto: `Poupança em ${pctI.toFixed(0)}% (meta: 20%). Automatize transferência de ${fmt(metaI - totalI)} assim que receber.` });
        if (pctN <= 50 && pctD <= 30 && pctI >= 20) recomendacoes.push({ tipo: 'sucesso', texto: 'Excelente! Está a seguir a regra 50/30/20 corretamente. Continue assim!' });
        if (totalN === 0 && totalD === 0 && totalI === 0 && salario > 0) recomendacoes.push({ tipo: 'dica', texto: 'Comece a registar os seus gastos nas 3 categorias para ter uma visão real do seu dinheiro.' });

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Introdução */}
            <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>⚖️</div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.15rem' }}>A Regra dos 50/30/20</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Metodologia internacional de organização financeira</p>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: '16px' }}>
                Esta regra recomenda que o seu rendimento líquido seja dividido em 3 partes:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {[
                  { pct: '50%', label: 'Necessidades', cor: '#6366f1', icon: '🏠' },
                  { pct: '30%', label: 'Desejos', cor: '#f59e0b', icon: '🎉' },
                  { pct: '20%', label: 'Poupança', cor: '#34d399', icon: '📈' }
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center', padding: '16px 12px', background: item.cor + '10', borderRadius: '12px', border: `1px solid ${item.cor}30` }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{item.icon}</div>
                    <div style={{ fontWeight: 900, fontSize: '1.4rem', color: item.cor }}>{item.pct}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
                ℹ️ Esta regra é apenas uma referência. Dependendo da realidade de cada pessoa, os valores podem variar. O importante é ter consciência de como o dinheiro está distribuído.
              </p>
            </div>

            {/* Input do Salário */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} style={{ color: 'var(--color-accent)' }} /> Passo 1 — Informe o seu salário
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Insira o seu salário líquido mensal (valor que recebe na conta após descontos).
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Salário Líquido Mensal (Kz)</label>
                  <input type="number" value={salario503020} onChange={e => setSalario503020(e.target.value)} className="form-input" placeholder="Ex: 650000" style={{ fontSize: '1.1rem', fontWeight: 700 }} />
                </div>
              </div>
              {salario > 0 && (
                <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(52,211,153,0.08)', borderRadius: '10px', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px', color: '#34d399' }}>✅ Distribuição automática para {fmt(salario)}:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.85rem' }}>
                    <div style={{ textAlign: 'center' }}><div style={{ color: '#6366f1', fontWeight: 700 }}>🏠 {fmt(metaN)}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Necessidades</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ color: '#f59e0b', fontWeight: 700 }}>🎉 {fmt(metaD)}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Desejos</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ color: '#34d399', fontWeight: 700 }}>📈 {fmt(metaI)}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Investimentos</div></div>
                  </div>
                </div>
              )}
            </div>

            {/* Saude Financeira */}
            {salario > 0 && (
              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `conic-gradient(${statusCor} ${saude * 3.6}deg, rgba(255,255,255,0.06) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-primary, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color: statusCor }}>{Math.round(saude)}</div>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Saúde Financeira</h4>
                    <p style={{ fontSize: '0.82rem', color: statusCor, fontWeight: 600 }}>{statusLabel}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.82rem' }}>
                  <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(99,102,241,0.06)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Necessidades</div>
                    <div style={{ fontWeight: 700, color: pctN <= 50 ? '#10b981' : '#ef4444' }}>{pctN.toFixed(0)}%</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(245,158,11,0.06)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Desejos</div>
                    <div style={{ fontWeight: 700, color: pctD <= 30 ? '#10b981' : '#ef4444' }}>{pctD.toFixed(0)}%</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(52,211,153,0.06)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Poupança</div>
                    <div style={{ fontWeight: 700, color: pctI >= 20 ? '#10b981' : '#ef4444' }}>{pctI.toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 2 - Listas Editáveis */}
            {salario > 0 && (
              <>
                <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Passo 2 — Registe os seus gastos reais</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '-12px' }}>
                  Adicione, edite ou remova gastos individualmente em cada categoria.
                </p>

                {renderLista(necessidades, setNecessidades, metaN, '#6366f1', '🏠', 'Necessidades (50%)', 'Ex: Renda')}
                {renderLista(desejos, setDesejos, metaD, '#f59e0b', '🎉', 'Desejos (30%)', 'Ex: Jantar')}
                {renderLista(investimentos, setInvestimentos, metaI, '#34d399', '📈', 'Poupança/Investimentos (20%)', 'Ex: BT')}
              </>
            )}

            {/* Resumo Geral */}
            {salario > 0 && (totalN > 0 || totalD > 0 || totalI > 0) && (
              <div className="glass-panel" style={{ padding: '20px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '12px' }}>📊 Resumo Geral</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Gasto</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ef4444' }}>{fmt(totalGeral)}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saldo</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: saldo >= 0 ? '#34d399' : '#ef4444' }}>{fmt(saldo)}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Taxa de Poupança</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: pctI >= 20 ? '#34d399' : '#f59e0b' }}>{pctI.toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Recomendações */}
            {salario > 0 && recomendacoes.length > 0 && (
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '12px' }}>🤖 Recomendações Inteligentes</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recomendacoes.map((r, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px',
                      background: r.tipo === 'sucesso' ? 'rgba(16,185,129,0.08)' : r.tipo === 'alerta' ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.08)',
                      color: r.tipo === 'sucesso' ? '#10b981' : r.tipo === 'alerta' ? '#ef4444' : '#6366f1',
                      border: `1px solid ${r.tipo === 'sucesso' ? 'rgba(16,185,129,0.2)' : r.tipo === 'alerta' ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)'}`
                    }}>
                      {r.tipo === 'sucesso' ? <CheckCircle size={18} /> : r.tipo === 'alerta' ? <AlertTriangle size={18} /> : <Lightbulb size={18} />}
                      <span>{r.texto}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previsão */}
            {salario > 0 && poupancaMensal > 0 && (
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '12px' }}>🔮 Previsão de Crescimento</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'rgba(52,211,153,0.06)', borderRadius: '12px', border: '1px solid rgba(52,211,153,0.15)' }}>
                    <h5 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px', color: '#34d399' }}>📅 Próximos 12 meses</h5>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Poupança actual: {fmt(poupancaMensal)}/mês</p>
                    {previsao12m.filter((_, i) => [2, 5, 11].includes(i)).map(p => (
                      <div key={p.mes} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{p.mes} {p.mes === 1 ? 'mês' : 'meses'}</span>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>{fmt(p.acumulado)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(99,102,241,0.06)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <h5 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px', color: '#6366f1' }}>🚀 Se reduzir desejos em 15%</h5>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Poupança extra: {fmt(poupancaExtra)}/mês</p>
                    {previsao5an.map(p => (
                      <div key={p.ano} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{p.ano} {p.ano === 1 ? 'ano' : 'anos'}</span>
                        <span style={{ fontWeight: 700, color: '#6366f1' }}>{fmt(p.acumulado)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {salario === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <DollarSign size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p>Insira o seu salário líquido mensal acima para começar.</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Academia Premium Section */}
      {activeSection === 'academia' && <AcademiaFinanceira score={score} />}

      {/* Disclaimer */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
        ⚠️ O Coach IA fornece análises educativas baseadas nos seus dados. Não constitui aconselhamento financeiro formal.
      </div>

      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 8px rgba(99,102,241,0.4); } 50% { box-shadow: 0 0 20px rgba(99,102,241,0.8); } }
      `}</style>
    </div>
  );
}

// ─── Academia Premium ─────────────────────────────────────────────────────────
const LICOES = [
  {
    id: 1, titulo: 'Fundamentos do Orçamento', emoji: '📋', xp: 100, cor: '#6366f1',
    duracao: '5 min', dificuldade: 'Iniciante',
    conteudo: [
      { tipo: 'intro', texto: 'Um orçamento é o mapa do seu dinheiro. Sem ele, o dinheiro «desaparece» sem explicação. Nesta lição aprenderá os 3 pilares de um orçamento eficaz.' },
      { tipo: 'ponto', titulo: '1️⃣ Registe todas as entradas', texto: 'Salário, rendas, freelance, dividendos — tudo o que entra na sua carteira.' },
      { tipo: 'ponto', titulo: '2️⃣ Categorize as saídas', texto: 'Divida os gastos em: Necessidades (moradia, comida), Desejos (lazer), Poupança/Investimento.' },
      { tipo: 'ponto', titulo: '3️⃣ Reveja semanalmente', texto: '10 minutos por semana evitam surpresas no fim do mês. Ajuste sempre que necessário.' },
      { tipo: 'dica', texto: '💡 Use o Planeador de Orçamento na aba «Planeador» para implementar o que aprendeu agora mesmo!' },
    ],
    quiz: [
      { pergunta: 'Qual é o primeiro passo para criar um orçamento?', opcoes: ['Reduzir gastos imediatamente', 'Registar todas as entradas', 'Investir na BODIVA', 'Pedir emprestado'], correta: 1 },
      { pergunta: 'Com que frequência deve rever o seu orçamento?', opcoes: ['Anualmente', 'Mensalmente', 'Semanalmente', 'Nunca'], correta: 2 },
    ]
  },
  {
    id: 2, titulo: 'A Regra dos 50/30/20', emoji: '⚖️', xp: 150, cor: '#10b981',
    duracao: '7 min', dificuldade: 'Iniciante',
    conteudo: [
      { tipo: 'intro', texto: 'Criada por Elizabeth Warren (professora de Harvard e senadora dos EUA), esta regra simples transforma a gestão financeira em 3 categorias claras.' },
      { tipo: 'ponto', titulo: '🏠 50% — Necessidades', texto: 'Habitação, alimentação, transporte, saúde. Se ultrapassar 50%, é sinal de que as despesas fixas estão altas.' },
      { tipo: 'ponto', titulo: '🎉 30% — Desejos', texto: 'Lazer, restaurantes, roupas, hobbies. São gastos que melhoram a qualidade de vida, mas não são essenciais.' },
      { tipo: 'ponto', titulo: '📈 20% — Poupança & Investimento', texto: 'Fundo de emergência (3-6 meses de despesas), metas futuras e investimentos. Esta é a fatia que constrói riqueza.' },
      { tipo: 'dica', texto: '💡 Veja a sua distribuição real na aba «Regra 50/30/20» com dados dos seus próprios lançamentos!' },
    ],
    quiz: [
      { pergunta: 'Quem criou a Regra dos 50/30/20?', opcoes: ['Warren Buffett', 'Elizabeth Warren', 'Benjamin Franklin', 'Robert Kiyosaki'], correta: 1 },
      { pergunta: 'Qual percentagem é recomendada para Poupança?', opcoes: ['10%', '30%', '20%', '50%'], correta: 2 },
    ]
  },
  {
    id: 3, titulo: 'Eliminar Dívidas (Método Avalanche)', emoji: '🏔️', xp: 200, cor: '#f59e0b',
    duracao: '8 min', dificuldade: 'Intermédio',
    conteudo: [
      { tipo: 'intro', texto: 'Dívidas com juros altos são a maior ameaça à saúde financeira. O Método Avalanche é matematicamente o mais eficiente para as eliminar.' },
      { tipo: 'ponto', titulo: '1️⃣ Liste todas as dívidas', texto: 'Nome do credor, valor em dívida, taxa de juro anual (TAN). Ex: Cartão A = 50.000 Kz a 45% a.a.' },
      { tipo: 'ponto', titulo: '2️⃣ Ordene por taxa de juro (maior primeiro)', texto: 'Pague o mínimo em todas as dívidas, e toda a verba extra vai para a de juro mais alto.' },
      { tipo: 'ponto', titulo: '3️⃣ Repita até liquidar todas', texto: 'Ao eliminar uma, o valor libertado soma-se ao próximo pagamento (efeito «avalanche»).' },
      { tipo: 'dica', texto: '⚠️ Alternativa psicológica: Método Snowball (paga a menor primeiro para ganhar motivação). Menos eficiente, mas funciona para quem precisa de vitórias rápidas.' },
    ],
    quiz: [
      { pergunta: 'No Método Avalanche, qual dívida se paga primeiro?', opcoes: ['A de maior valor total', 'A de maior taxa de juro', 'A mais antiga', 'A do banco principal'], correta: 1 },
      { pergunta: 'Qual alternativa é mais motivadora psicologicamente?', opcoes: ['Método Avalanche', 'Método Snowball', 'Método 50/30/20', 'Método FIRE'], correta: 1 },
    ]
  },
  {
    id: 4, titulo: 'Fundo de Emergência', emoji: '🛡️', xp: 150, cor: '#ec4899',
    duracao: '6 min', dificuldade: 'Iniciante',
    conteudo: [
      { tipo: 'intro', texto: 'O fundo de emergência é o alicerce da sua liberdade financeira. Sem ele, qualquer imprevisto pode destruir anos de poupança.' },
      { tipo: 'ponto', titulo: '🎯 Meta: 3 a 6 meses de despesas', texto: 'Se as suas despesas mensais são 200.000 Kz, o fundo deve ser entre 600.000 e 1.200.000 Kz.' },
      { tipo: 'ponto', titulo: '🏦 Onde guardar?', texto: 'Conta poupança separada, de acesso fácil mas não do dia-a-dia. BTs de curto prazo também são opção em Angola.' },
      { tipo: 'ponto', titulo: '⚡ Como construir rapidamente?', texto: '1) Destine 10% de cada salário. 2) Guarde bónus e prémios. 3) Venda itens sem uso. 4) Faça freelance.' },
      { tipo: 'dica', texto: '💡 NUNCA use o fundo de emergência para viagens, roupas ou gadgets. É exclusivamente para imprevistos (desemprego, saúde, avaria grave).' },
    ],
    quiz: [
      { pergunta: 'Qual é a meta recomendada para o Fundo de Emergência?', opcoes: ['1 mês de despesas', '3-6 meses de despesas', '1 ano de despesas', '10% do salário'], correta: 1 },
      { pergunta: 'Pode usar o Fundo de Emergência para férias?', opcoes: ['Sim, se for barato', 'Não, nunca', 'Sim, se sobrar', 'Depende do banco'], correta: 1 },
    ]
  },
  {
    id: 5, titulo: 'Independência Financeira (FIRE)', emoji: '🏖️', xp: 300, cor: '#8b5cf6',
    duracao: '10 min', dificuldade: 'Avançado',
    conteudo: [
      { tipo: 'intro', texto: 'FIRE (Financial Independence, Retire Early) é um movimento global de pessoas que poupam e investem 50-70% do rendimento para atingir a liberdade financeira em 10-15 anos.' },
      { tipo: 'ponto', titulo: '🔢 A Regra dos 25x', texto: 'O seu capital necessário = despesas anuais × 25. Ex: Se gasta 2.400.000 Kz/ano, precisa de 60.000.000 Kz investidos.' },
      { tipo: 'ponto', titulo: '📊 Taxa de Retirada Segura (4%)', texto: 'Com 4% ao ano retirado de uma carteira diversificada, o capital dura indefinidamente (estudo Trinity, EUA).' },
      { tipo: 'ponto', titulo: '🚀 Variantes FIRE', texto: 'LeanFIRE (estilo de vida simples), FatFIRE (luxo), BaristaFIRE (trabalho parcial). Escolha a que se adequa.' },
      { tipo: 'dica', texto: '🌍 Em Angola: BTs, OTs, ações BODIVA e diversificação em divisas (USD) são caminhos. A CMVM regula o mercado de capitais.' },
    ],
    quiz: [
      { pergunta: 'O que significa FIRE?', opcoes: ['Fast Income Real Estate', 'Financial Independence Retire Early', 'Fixed Income Rate Exchange', 'Fund Investment Return Estimate'], correta: 1 },
      { pergunta: 'Pela Regra dos 25x, se gasta 1.200.000 Kz/ano, qual o capital necessário?', opcoes: ['12.000.000 Kz', '25.000.000 Kz', '30.000.000 Kz', '120.000.000 Kz'], correta: 2 },
    ]
  },
];

const XP_KEY = 'academia_xp_v1';
const COMPLETED_KEY = 'academia_completed_v1';

function AcademiaFinanceira({ score }) {
  const [xp, setXp] = useState(() => { try { return Number(JSON.parse(localStorage.getItem(XP_KEY))) || 0; } catch { return 0; } });
  const [completed, setCompleted] = useState(() => { try { return JSON.parse(localStorage.getItem(COMPLETED_KEY)) || []; } catch { return []; } });
  const [activeLicao, setActiveLicao] = useState(null);
  const [quizStep, setQuizStep] = useState(null); // null | { licaoId, q: 0, answers: [], done: false }
  const [showCert, setShowCert] = useState(false);

  useEffect(() => { localStorage.setItem(XP_KEY, JSON.stringify(xp)); }, [xp]);
  useEffect(() => { localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed)); }, [completed]);

  const totalXpPossivel = LICOES.reduce((s, l) => s + l.xp, 0);
  const pctXp = Math.round((xp / totalXpPossivel) * 100);
  const tier = xp >= 700 ? { nome: 'Mestre Financeiro', cor: '#f59e0b', emoji: '🏆' }
    : xp >= 400 ? { nome: 'Investidor', cor: '#8b5cf6', emoji: '💎' }
    : xp >= 200 ? { nome: 'Poupador', cor: '#10b981', emoji: '🌱' }
    : { nome: 'Aprendiz', cor: '#6366f1', emoji: '📚' };

  const allDone = completed.length === LICOES.length;

  const startQuiz = (licao) => {
    setActiveLicao(null);
    setQuizStep({ licaoId: licao.id, q: 0, answers: [], done: false });
  };

  const answerQuiz = (licao, opcaoIdx) => {
    const q = licao.quiz[quizStep.q];
    const correct = opcaoIdx === q.correta;
    const newAnswers = [...quizStep.answers, { opcaoIdx, correct }];
    const nextQ = quizStep.q + 1;
    if (nextQ >= licao.quiz.length) {
      // Done
      const allCorrect = newAnswers.every(a => a.correct);
      if (allCorrect && !completed.includes(licao.id)) {
        setXp(prev => prev + licao.xp);
        setCompleted(prev => [...prev, licao.id]);
      }
      setQuizStep({ licaoId: licao.id, q: nextQ, answers: newAnswers, done: true, allCorrect });
    } else {
      setQuizStep({ licaoId: licao.id, q: nextQ, answers: newAnswers, done: false });
    }
  };

  const downloadCertificate = () => {
    const html = `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><title>Certificado - Finança ao Ponto</title>
<style>
  body { margin: 0; font-family: Georgia, serif; background: #0a0f1d; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .cert { background: linear-gradient(135deg, #131a30 0%, #1e2740 100%); border: 3px solid #6366f1; border-radius: 20px; padding: 60px; max-width: 700px; width: 100%; text-align: center; color: #fff; box-shadow: 0 0 60px rgba(99,102,241,0.4); }
  .logo { font-size: 3rem; margin-bottom: 10px; }
  .title { font-size: 0.9rem; letter-spacing: 4px; color: #a5b4fc; text-transform: uppercase; margin-bottom: 30px; }
  .certifica { font-size: 1rem; color: #94a3b8; margin-bottom: 10px; }
  .name { font-size: 2.2rem; font-weight: 900; color: #f1f5f9; margin: 10px 0 20px; }
  .completed { font-size: 1rem; color: #94a3b8; margin-bottom: 6px; }
  .course { font-size: 1.5rem; color: #a5b4fc; font-weight: 700; margin-bottom: 30px; }
  .xp { display: inline-block; background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.4); border-radius: 40px; padding: 8px 24px; font-size: 1rem; color: #a5b4fc; margin-bottom: 30px; }
  .date { font-size: 0.85rem; color: #64748b; margin-top: 30px; }
  .seal { font-size: 4rem; margin: 20px 0; }
  .divider { border: none; border-top: 1px solid rgba(99,102,241,0.2); margin: 24px 0; }
</style>
</head>
<body>
<div class="cert">
  <div class="logo">F</div>
  <div class="title">Finança ao Ponto — Academia Premium</div>
  <hr class="divider">
  <div class="certifica">Este certificado é atribuído a</div>
  <div class="name">Estudante Dedicado(a)</div>
  <div class="completed">pela conclusão do programa</div>
  <div class="course">Educação Financeira Completa</div>
  <div class="xp">🏆 ${xp} XP obtidos</div>
  <div class="seal">🎓</div>
  <hr class="divider">
  <div class="date">Emitido em ${new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
</div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificado_financa_ao_ponto.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentLicao = activeLicao ? LICOES.find(l => l.id === activeLicao) : null;
  const quizLicao = quizStep ? LICOES.find(l => l.id === quizStep.licaoId) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* XP Bar + Tier */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>🎓 Académia de Finanças Pessoais</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Complete lições, ganhe XP e desbloqueie o certificado</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 18px', borderRadius: '12px', background: `${tier.cor}18`, border: `1px solid ${tier.cor}40`, minWidth: '110px' }}>
            <div style={{ fontSize: '1.4rem' }}>{tier.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: tier.cor }}>{tier.nome}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{xp} / {totalXpPossivel} XP</div>
          </div>
        </div>
        <div style={{ height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pctXp}%`, background: `linear-gradient(90deg, ${tier.cor}, ${tier.cor}99)`, borderRadius: '8px', transition: 'width 0.8s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          <span>0 XP — Aprendiz</span>
          <span>200 XP — Poupador</span>
          <span>400 XP — Investidor</span>
          <span>700 XP — Mestre</span>
        </div>
        {allDone && (
          <button
            onClick={downloadCertificate}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', animation: 'pulse-glow 2s infinite' }}
          >
            <Download size={16} /> Descarregar Certificado de Conclusão
          </button>
        )}
        {!allDone && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
            {completed.length}/{LICOES.length} lições concluídas — complete todas para desbloquear o certificado 🎓
          </div>
        )}
      </div>

      {/* Lesson list */}
      {!activeLicao && !quizStep && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {LICOES.map((licao, i) => {
            const done = completed.includes(licao.id);
            const locked = i > 0 && !completed.includes(LICOES[i-1].id);
            return (
              <div
                key={licao.id}
                className="glass-panel"
                style={{
                  padding: '18px', cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.5 : 1,
                  border: done ? `1px solid ${licao.cor}50` : '1px solid var(--border-color)',
                  background: done ? `${licao.cor}08` : undefined,
                  transition: 'all 0.2s'
                }}
                onClick={() => !locked && setActiveLicao(licao.id)}
                onMouseEnter={e => { if (!locked) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0, background: done ? `${licao.cor}20` : 'rgba(255,255,255,0.05)', border: `1px solid ${done ? licao.cor + '50' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    {locked ? '🔒' : licao.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {licao.titulo}
                      {done && <CheckCircle size={14} style={{ color: licao.cor, flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {licao.duracao} · {licao.dificuldade}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: done ? licao.cor : 'var(--text-muted)' }}>+{licao.xp} XP</div>
                    {!locked && <ChevronRight size={16} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lesson content */}
      {currentLicao && !quizStep && (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setActiveLicao(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '6px' }}>
              ← Voltar
            </button>
            <div style={{ flex: 1, fontWeight: 800, fontSize: '1.1rem' }}>{currentLicao.emoji} {currentLicao.titulo}</div>
            <div style={{ fontWeight: 700, color: currentLicao.cor, fontSize: '0.9rem', flexShrink: 0 }}>+{currentLicao.xp} XP</div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {currentLicao.conteudo.map((item, i) => (
              <div key={i} style={{
                padding: '14px 16px', borderRadius: '12px', lineHeight: 1.7, fontSize: '0.87rem',
                background: item.tipo === 'intro' ? `${currentLicao.cor}0a` : item.tipo === 'dica' ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
                border: item.tipo === 'intro' ? `1px solid ${currentLicao.cor}30` : item.tipo === 'dica' ? '1px solid rgba(245,158,11,0.2)' : '1px solid var(--border-color)'
              }}>
                {item.titulo && <div style={{ fontWeight: 700, marginBottom: '4px' }}>{item.titulo}</div>}
                <div style={{ color: 'var(--text-secondary)' }}>{item.texto}</div>
              </div>
            ))}
          </div>
          <button onClick={() => startQuiz(currentLicao)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Zap size={16} /> Fazer Quiz e Ganhar {currentLicao.xp} XP
          </button>
        </div>
      )}

      {/* Quiz */}
      {quizStep && quizLicao && !quizStep.done && (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontWeight: 800 }}>Quiz — {quizLicao.titulo}</div>
            <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{quizStep.q + 1} / {quizLicao.quiz.length}</div>
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.5, padding: '14px', background: 'rgba(99,102,241,0.06)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.15)' }}>
            {quizLicao.quiz[quizStep.q].pergunta}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {quizLicao.quiz[quizStep.q].opcoes.map((op, idx) => (
              <button
                key={idx}
                onClick={() => answerQuiz(quizLicao, idx)}
                style={{
                  padding: '12px 16px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 500, transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                {String.fromCharCode(65 + idx)}) {op}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quiz result */}
      {quizStep?.done && quizLicao && (
        <div className="glass-panel animate-fade-in" style={{ padding: '28px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '3rem' }}>{quizStep.allCorrect ? '🏆' : '😕'}</div>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: quizStep.allCorrect ? 'var(--color-success)' : '#f59e0b' }}>
            {quizStep.allCorrect ? `Perfeito! +${quizLicao.xp} XP ganhos!` : 'Quase! Reveja a lição e tente novamente.'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {quizStep.answers.filter(a => a.correct).length}/{quizLicao.quiz.length} respostas corretas
          </div>
          {quizStep.allCorrect && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--color-success)', fontWeight: 700 }}>
              <Zap size={16} /> XP Total: {xp} — {tier.nome} {tier.emoji}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {!quizStep.allCorrect && (
              <button onClick={() => setActiveLicao(quizLicao.id)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={15} /> Rever Lição
              </button>
            )}
            <button onClick={() => setQuizStep(null)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {quizStep.allCorrect ? <><Trophy size={15} /> Ver Progresso</> : <><ChevronRight size={15} /> Tentar Novamente</>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
