import React, { useState, useEffect, useMemo } from 'react';
import { Target, Plus, Trash2, CheckCircle, Clock, TrendingUp, Home, Car, Plane, Shield, GraduationCap, Briefcase, AlertTriangle, Zap, Brain, DollarSign, PieChart, BarChart2, ArrowRight, RefreshCw, Play, Pause, Edit2, X, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ICONS = { casa: { e: '🏠', c: '#6366f1' }, carro: { e: '🚗', c: '#f59e0b' }, viagem: { e: '✈️', c: '#34d399' }, emergencia: { e: '🛡️', c: '#ef4444' }, educacao: { e: '🎓', c: '#8b5cf6' }, negocio: { e: '💼', c: '#f97316' }, outro: { e: '🎯', c: '#64748b' } };
const PRIO = { critica: { l: 'Crítica', c: '#ef4444', w: 0.4 }, alta: { l: 'Alta', c: '#f97316', w: 0.3 }, media: { l: 'Média', c: '#eab308', w: 0.2 }, baixa: { l: 'Baixa', c: '#22c55e', w: 0.1 } };
const CATS = [{ v: 'casa', l: '🏠 Casa' }, { v: 'carro', l: '🚗 Carro' }, { v: 'viagem', l: '✈️ Viagem' }, { v: 'emergencia', l: '🛡️ Emergência' }, { v: 'educacao', l: '🎓 Educação' }, { v: 'negocio', l: '💼 Negócio' }, { v: 'outro', l: '🎯 Outro' }];
const PRIO_LIST = [{ v: 'baixa', l: 'Baixa' }, { v: 'media', l: 'Média' }, { v: 'alta', l: 'Alta' }, { v: 'critica', l: 'Crítica' }];

const fmt = (v) => Number(v || 0).toLocaleString('pt-PT');
const fmtKz = (v) => fmt(v) + ' Kz';
const getExtra = () => { try { return JSON.parse(localStorage.getItem('metas_v2') || '{}'); } catch { return {}; } };
const setExtra = (d) => localStorage.setItem('metas_v2', JSON.stringify(d));
const detectCat = (d) => { if (!d) return 'outro'; d = d.toLowerCase(); if (d.includes('casa') || d.includes('aparta')) return 'casa'; if (d.includes('carr') || d.includes('auto')) return 'carro'; if (d.includes('viag') || d.includes('ferias')) return 'viagem'; if (d.includes('emerg') || d.includes('fund')) return 'emergencia'; if (d.includes('educ') || d.includes('curso')) return 'educacao'; if (d.includes('negoc') || d.includes('empres')) return 'negocio'; return 'outro'; };
const monthsUntil = (t, c, m) => { if (m <= 0) return Infinity; const r = t - c; return r <= 0 ? 0 : Math.ceil(r / m); };
const fmtDate = (m) => { const d = new Date(); d.setMonth(d.getMonth() + m); return d.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }); };

export default function MetasView({ currentUser, session, launches = [], categories = [] }) {
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('visao');
  const [showForm, setShowForm] = useState(false);
  const [extra, setExtraState] = useState(getExtra());
  const [editId, setEditId] = useState(null);
  const [slider, setSlider] = useState({});
  const [form, setForm] = useState({ title: '', description: '', category: 'outro', target_amount: '', current_amount: '0', deadline: '', priority: 'media', is_required: true });
  const [abonarId, setAbonarId] = useState(null);
  const [abonarVal, setAbonarVal] = useState('');

  const fetchMetas = async () => {
    if (!session?.user?.id) { setLoading(false); return; }
    try {
      const { data, error } = await supabase.from('goals').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (!error && data) setMetas(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchMetas(); }, [session]);
  useEffect(() => { setExtraState(getExtra()); }, [metas]);

  const updateExtra = (id, updates) => {
    const next = { ...extra, [id]: { ...(extra[id] || {}), ...updates } };
    setExtra(next);
    setExtra(next);
  };

  const stats = useMemo(() => {
    const now = new Date();
    const threeAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const recent = launches.filter(l => new Date(l.Data) >= threeAgo);
    const rec = recent.filter(l => l.Tipo === 'Entrada').reduce((s, l) => s + Number(l.Valor || 0), 0);
    const des = recent.filter(l => l.Tipo === 'Saida').reduce((s, l) => s + Number(l.Valor || 0), 0);
    const months = Math.max(1, Math.ceil((now - threeAgo) / (30 * 86400000)));
    const monthlyRec = rec / months;
    const monthlyDes = des / months;
    const saldo = monthlyRec - monthlyDes;
    const avail = Math.max(0, saldo * 0.6);
    const active = metas.filter(m => !m.is_completed && (extra[m.id]?.status || 'ativa') === 'ativa');
    const totalW = active.reduce((s, g) => s + (PRIO[extra[g.id]?.priority || 'media']?.w || 0.2), 0);
    const perGoal = active.length > 0 && totalW > 0 ? avail / totalW : 0;
    const totalSaved = metas.reduce((s, m) => s + Number(m.current_amount || 0), 0);
    const totalTarget = metas.reduce((s, m) => s + Number(m.target_amount || 0), 0);
    const concluded = metas.filter(m => m.is_completed).length;
    return { monthlyRec, monthlyDes, saldo, avail, perGoal, active, totalSaved, totalTarget, concluded, totalW };
  }, [launches, metas, extra]);

  const alerts = useMemo(() => {
    const r = [];
    const now = new Date();
    metas.forEach(m => {
      if (m.is_completed) { r.push({ id: m.id, type: 'done', msg: `✅ "${m.title}" concluída!` }); return; }
      const prio = extra[m.id]?.priority || 'media';
      const mc = stats.perGoal || 50000;
      const rem = m.target_amount - m.current_amount;
      if (m.deadline) {
        const dl = new Date(m.deadline);
        const ml = Math.max(0, (dl.getFullYear() - now.getFullYear()) * 12 + dl.getMonth() - now.getMonth());
        const mn = mc > 0 ? rem / mc : Infinity;
        if (mn > ml && ml > 0) {
          const deficit = Math.ceil((rem - mc * ml) / ml);
          r.push({ id: m.id, type: 'error', msg: `⚠️ "${m.title}" atrasada! Aumentar ${fmtKz(deficit)}/mês.` });
        } else if (mn < ml - 2) {
          r.push({ id: m.id, type: 'success', msg: `🎉 "${m.title}" ${Math.floor(ml - mn)} meses adiantada!` });
        }
      }
    });
    return r;
  }, [metas, extra, stats]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.target_amount) return;
    try {
      if (editId) {
        await supabase.from('goals').update({ title: form.title, description: form.description || form.category, target_amount: Number(form.target_amount), deadline: form.deadline || null }).eq('id', editId);
        updateExtra(editId, { priority: form.priority, isRequired: form.is_required });
      } else {
        const { data } = await supabase.from('goals').insert({ user_id: session.user.id, title: form.title, description: form.description || form.category, target_amount: Number(form.target_amount), current_amount: Number(form.current_amount) || 0, deadline: form.deadline || null, is_completed: false }).select().single();
        if (data) updateExtra(data.id, { priority: form.priority, isRequired: form.is_required, status: 'ativa' });
      }
      setForm({ title: '', description: '', category: 'outro', target_amount: '', current_amount: '0', deadline: '', priority: 'media', is_required: true });
      setShowForm(false);
      setEditId(null);
      fetchMetas();
    } catch (e) { console.error(e); }
  };

  const handleAbonar = async (id) => {
    const v = Number(abonarVal);
    if (!v || v <= 0) return;
    const m = metas.find(x => x.id === id);
    if (!m) return;
    const nova = Math.min(m.target_amount, m.current_amount + v);
    await supabase.from('goals').update({ current_amount: nova, is_completed: nova >= m.target_amount }).eq('id', id);
    if (nova >= m.target_amount) updateExtra(id, { status: 'concluida' });
    setAbonarId(null);
    setAbonarVal('');
    fetchMetas();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar esta meta?')) return;
    await supabase.from('goals').delete().eq('id', id);
    const ne = { ...extra }; delete ne[id]; setExtra(ne); setExtra(ne);
    fetchMetas();
  };

  const handleToggle = (id) => { const cur = extra[id]?.status || 'ativa'; updateExtra(id, { status: cur === 'ativa' ? 'pausada' : 'ativa' }); };

  const startEdit = (m) => { setForm({ title: m.title, description: m.description || '', category: detectCat(m.description), target_amount: String(m.target_amount), current_amount: String(m.current_amount), deadline: m.deadline || '', priority: extra[m.id]?.priority || 'media', is_required: extra[m.id]?.isRequired !== false }); setEditId(m.id); setShowForm(true); setTab('criar'); };

  if (loading) return <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>A carregar metas...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={22} style={{ color: 'var(--color-accent)' }} /> Metas</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Defina objectivos e acompanhe o progresso</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setTab(showForm ? 'visao' : 'criar'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
          <Plus size={15} /> Nova Meta
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
        {[
          { l: 'Metas', v: metas.length, i: <Target size={14} />, c: 'var(--color-accent)' },
          { l: 'Ativas', v: stats.active.length, i: <Play size={14} />, c: '#22c55e' },
          { l: 'Concluídas', v: stats.concluded, i: <CheckCircle size={14} />, c: '#3b82f6' },
          { l: 'Poupado', v: fmtKz(stats.totalSaved), i: <DollarSign size={14} />, c: '#22c55e' },
          { l: 'Alvo', v: fmtKz(stats.totalTarget), i: <Target size={14} />, c: 'var(--text-primary)' }
        ].map((k, i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>{k.i} {k.l}</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {[{ id: 'visao', l: 'Visão Geral' }, { id: 'criar', l: 'Criar Meta' }, { id: 'simulador', l: 'Simulador' }, { id: 'alertas', l: `Alertas (${alerts.length})` }].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'criar') { setShowForm(true); setEditId(null); } }} style={{ background: tab === t.id ? 'rgba(99,102,241,0.12)' : 'transparent', border: `1px solid ${tab === t.id ? 'rgba(99,102,241,0.3)' : 'transparent'}`, color: tab === t.id ? 'var(--color-accent)' : 'var(--text-secondary)', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontWeight: tab === t.id ? 700 : 500, fontSize: '0.82rem' }}>{t.l}</button>
        ))}
      </div>

      {/* Visão Geral */}
      {tab === 'visao' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Financial */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><BarChart2 size={16} style={{ color: 'var(--color-accent)' }} /> Análise Financeira</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
              {[
                { l: 'Receitas/mês', v: fmtKz(stats.monthlyRec), c: '#22c55e' },
                { l: 'Despesas/mês', v: fmtKz(stats.monthlyDes), c: '#f59e0b' },
                { l: 'Saldo Médio', v: fmtKz(stats.saldo), c: stats.saldo >= 0 ? '#22c55e' : '#ef4444' },
                { l: 'Disponível', v: fmtKz(stats.avail), c: 'var(--color-accent)' }
              ].map((m, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{m.l}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: m.c }}>{m.v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(99,102,241,0.05)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <Brain size={12} style={{ color: 'var(--color-accent)', marginRight: '4px', verticalAlign: 'middle' }} />
              Recomendado: <strong style={{ color: 'var(--color-accent)' }}>{fmtKz(stats.perGoal)}/mês</strong> por meta ({stats.active.length} activa{stats.active.length !== 1 ? 's' : ''})
            </div>
          </div>

          {/* Goals */}
          {metas.length === 0 ? (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
              <Target size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>Sem metas</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Clique "Nova Meta" para começar</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {metas.map(m => {
                const cat = detectCat(m.description);
                const ic = ICONS[cat] || ICONS.outro;
                const prio = extra[m.id]?.priority || 'media';
                const pc = PRIO[prio] || PRIO.media;
                const st = m.is_completed ? 'concluida' : (extra[m.id]?.status || 'ativa');
                const pct = m.target_amount > 0 ? Math.min(100, (m.current_amount / m.target_amount) * 100) : 0;
                const rem = m.target_amount - m.current_amount;
                const mn = stats.perGoal > 0 ? monthsUntil(m.target_amount, m.current_amount, stats.perGoal) : Infinity;
                return (
                  <div key={m.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', opacity: st === 'pausada' ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${ic.c}20`, border: `1px solid ${ic.c}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{ic.e}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.title}</div>
                          {m.description && m.description !== cat && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.description}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {!m.is_completed && <button onClick={() => handleToggle(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>{st === 'ativa' ? <Pause size={13} /> : <Play size={13} />}</button>}
                        <button onClick={() => startEdit(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: `${pc.c}15`, border: `1px solid ${pc.c}30`, color: pc.c }}>{pc.l}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: st === 'concluida' ? 'rgba(59,130,246,0.1)' : st === 'pausada' ? 'rgba(148,163,184,0.1)' : 'rgba(34,197,94,0.1)', color: st === 'concluida' ? '#3b82f6' : st === 'pausada' ? '#94a3b8' : '#22c55e' }}>{st === 'concluida' ? 'Concluída' : st === 'pausada' ? 'Pausada' : 'Ativa'}</span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: ic.c }}>{fmtKz(m.current_amount)}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{fmtKz(m.target_amount)} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: m.is_completed ? '#22c55e' : ic.c, borderRadius: '6px', transition: 'width 0.4s' }} />
                      </div>
                    </div>
                    {m.deadline && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} /> Prazo: {new Date(m.deadline + 'T00:00:00').toLocaleDateString('pt-PT')}</div>}
                    {!m.is_completed && mn < Infinity && mn > 0 && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Conclusão: {fmtDate(mn)} ({mn} meses)</div>}
                    {!m.is_completed && st === 'ativa' && (
                      abonarId === m.id ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input type="number" value={abonarVal} onChange={e => setAbonarVal(e.target.value)} placeholder="Valor Kz" min="1" style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.82rem' }} />
                          <button onClick={() => handleAbonar(m.id)} style={{ padding: '6px 12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}><CheckCircle size={13} /></button>
                          <button onClick={() => { setAbonarId(null); setAbonarVal(''); }} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={13} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setAbonarId(m.id)} style={{ width: '100%', padding: '7px', background: `${ic.c}12`, border: `1px solid ${ic.c}25`, color: ic.c, borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>+ Adicionar Poupança</button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Criar Meta */}
      {tab === 'criar' && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontWeight: 800 }}>{editId ? 'Editar Meta' : 'Nova Meta'}</h4>
            <button type="button" onClick={() => { setShowForm(false); setTab('visao'); setEditId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Nome *</label><input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Ex: Comprar Carro" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Categoria</label><select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{CATS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}</select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Valor Objetivo (Kz) *</label><input type="number" value={form.target_amount} onChange={e => setForm(p => ({ ...p, target_amount: e.target.value }))} required min="1" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Já Poupado (Kz)</label><input type="number" value={form.current_amount} onChange={e => setForm(p => ({ ...p, current_amount: e.target.value }))} min="0" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Prazo</label><input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Prioridade</label><select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{PRIO_LIST.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}</select></div>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Descrição</label><input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Opcional" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={form.is_required} onChange={e => setForm(p => ({ ...p, is_required: e.target.checked }))} style={{ accentColor: 'var(--color-accent)' }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}><Shield size={12} style={{ verticalAlign: 'middle' }} /> Obrigatória</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => { setShowForm(false); setTab('visao'); setEditId(null); }} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Cancelar</button>
            <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>{editId ? 'Guardar' : 'Criar'}</button>
          </div>
        </form>
      )}

      {/* Simulador */}
      {tab === 'simulador' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stats.active.length === 0 ? (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
              <Target size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
              <div style={{ fontWeight: 700 }}>Sem metas activas</div>
            </div>
          ) : (
            stats.active.map(m => {
              const cat = detectCat(m.description);
              const ic = ICONS[cat] || ICONS.outro;
              const val = slider[m.id] || stats.perGoal || 50000;
              const mn = monthsUntil(m.target_amount, m.current_amount, val);
              const pct = m.target_amount > 0 ? Math.min(100, (m.current_amount / m.target_amount) * 100) : 0;
              return (
                <div key={m.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${ic.c}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{ic.e}</div>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{m.title}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Falta {fmtKz(m.target_amount - m.current_amount)} • {pct.toFixed(1)}%</div></div>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: ic.c, borderRadius: '5px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Contribuição mensal</span>
                    <span style={{ fontWeight: 700, color: ic.c, fontSize: '0.88rem' }}>{fmtKz(val)}/mês</span>
                  </div>
                  <input type="range" min="10000" max="500000" step="5000" value={val} onChange={e => setSlider(p => ({ ...p, [m.id]: Number(e.target.value) }))} style={{ width: '100%', accentColor: ic.c }} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {[50000, 100000, 150000, 200000].map(cp => {
                      const cpM = monthsUntil(m.target_amount, m.current_amount, cp);
                      const active = Math.abs(val - cp) < 5000;
                      return (
                        <div key={cp} style={{ textAlign: 'center', padding: '6px 4px', borderRadius: '6px', background: active ? `${ic.c}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${active ? `${ic.c}40` : 'rgba(255,255,255,0.05)'}`, fontSize: '0.65rem' }}>
                          <div style={{ fontWeight: 700, color: active ? ic.c : 'var(--text-secondary)' }}>{fmtKz(cp)}</div>
                          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{cpM < Infinity ? `${cpM} meses` : '> 5 anos'}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding: '8px', borderRadius: '6px', background: mn > 60 ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)', border: `1px solid ${mn > 60 ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'}`, fontSize: '0.78rem' }}>
                    {mn > 60 ? <span style={{ color: '#ef4444' }}>Com {fmtKz(val)}/mês levará mais de 5 anos</span> : <span>Com <strong style={{ color: ic.c }}>{fmtKz(val)}/mês</strong>, terminas em <strong>{fmtDate(mn)}</strong> ({mn} meses)</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Alertas */}
      {tab === 'alertas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.length === 0 ? (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum alerta no momento.</div>
          ) : (
            alerts.map((a, i) => (
              <div key={a.id || i} style={{ padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 600, background: a.type === 'error' ? 'rgba(239,68,68,0.06)' : a.type === 'success' ? 'rgba(34,197,94,0.06)' : 'rgba(59,130,246,0.06)', border: `1px solid ${a.type === 'error' ? 'rgba(239,68,68,0.15)' : a.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)'}`, color: a.type === 'error' ? '#ef4444' : a.type === 'success' ? '#22c55e' : '#3b82f6' }}>
                <AlertTriangle size={16} /> {a.msg}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
