import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles, Send, Bot, User, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, DollarSign, Target, Award,
  Plus, Trash2, Edit2, Save, PieChart, Lightbulb
} from 'lucide-react';

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
export default function CoachView({ launches, categories, role, userEmail, getCategoryBalance }) {
  const [activeSection, setActiveSection] = useState('chat');
  const [mensagens, setMensagens] = useState([
    {
      id: 'welcome', tipo: 'bot', cor: 'info',
      texto: '👋 Olá! Sou o **Coach IA** — o seu consultor financeiro pessoal.\n\nAnaliso os seus dados em tempo real e respondo às suas dúvidas financeiras em Português. O que gostaria de saber hoje?',
      hora: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const userLaunches = useMemo(() =>
    launches.filter(l => role === 'SuperAdmin' || role === 'Admin' || l.CriadoPor === userEmail),
    [launches, role, userEmail]
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

  const handleEnviar = async (texto = inputMsg) => {
    const msgTexto = texto.trim();
    if (!msgTexto) return;
    setInputMsg('');
    const hora = new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
    setMensagens(prev => [...prev, { id: Date.now(), tipo: 'user', texto: msgTexto, hora }]);
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
    setIsTyping(false);
    const resposta = gerarResposta(msgTexto, contexto);
    setMensagens(prev => [...prev, {
      id: Date.now() + 1, tipo: 'bot', texto: resposta.texto, cor: resposta.tipo,
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
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
        {[{ id: 'chat', label: '💬 Chat Financeiro' }, { id: 'orcamento', label: '📊 Planeador de Orçamento' }].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px',
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

      {/* Disclaimer */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
        ⚠️ O Coach IA fornece análises educativas baseadas nos seus dados. Não constitui aconselhamento financeiro formal.
      </div>

      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
      `}</style>
    </div>
  );
}
