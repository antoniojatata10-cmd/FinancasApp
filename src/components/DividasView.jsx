import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckCircle, Clock, AlertTriangle, TrendingUp, TrendingDown, Edit2, X, ChevronDown, ChevronUp, Wallet, Bell, DollarSign } from 'lucide-react';

const CATS = [
  { id: 'pessoal', label: 'Pessoal', emoji: '👤', cor: '#6366f1' },
  { id: 'banco', label: 'Banco', emoji: '🏦', cor: '#3b82f6' },
  { id: 'familia', label: 'Família', emoji: '👨‍👩‍👧‍👦', cor: '#8b5cf6' },
  { id: 'amigo', label: 'Amigo', emoji: '🤝', cor: '#06b6d4' },
  { id: 'trabalho', label: 'Trabalho', emoji: '💼', cor: '#f59e0b' },
  { id: 'loja', label: 'Loja/Crédito', emoji: '🛍️', cor: '#ec4899' },
  { id: 'outro', label: 'Outro', emoji: '📌', cor: '#64748b' }
];

const PRIOS = [
  { id: 'baixa', label: 'Baixa', cor: '#22c55e' },
  { id: 'media', label: 'Média', cor: '#f59e0b' },
  { id: 'alta', label: 'Alta', cor: '#f97316' },
  { id: 'critica', label: 'Crítica', cor: '#ef4444' }
];

const fmt = (v) => Number(v || 0).toLocaleString('pt-PT');
const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d + 'T00:00:00').toLocaleDateString('pt-PT'); } catch { return d; }
};
const daysLeft = (d) => {
  if (!d) return 9999;
  try { return Math.ceil((new Date(d + 'T00:00:00') - new Date()) / 86400000); } catch { return 9999; }
};

function Card({ d, tipo, onPay, onEdit, onDel }) {
  const [showPay, setShowPay] = useState(false);
  const [payVal, setPayVal] = useState('');
  const [open, setOpen] = useState(false);
  const cat = CATS.find(c => c.id === d.categoria) || CATS[6];
  const prio = PRIOS.find(p => p.id === d.prioridade) || PRIOS[1];
  const restante = d.valor_total - d.valor_pago;
  const pct = d.valor_total > 0 ? (d.valor_pago / d.valor_total) * 100 : 0;
  const dl = daysLeft(d.prazo);
  const atrasada = d.prazo && dl < 0 && pct < 100;
  const proxima = dl >= 0 && dl <= 7 && pct < 100;
  const feita = pct >= 100;

  const doPay = () => {
    const v = parseFloat(payVal);
    if (v > 0 && v <= restante) { onPay(d.id, v); setPayVal(''); setShowPay(false); }
  };

  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', borderLeft: `4px solid ${feita ? '#22c55e' : atrasada ? '#ef4444' : cat.cor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.1rem' }}>{cat.emoji}</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{d.nome}</span>
            {feita && <CheckCircle size={15} color="#22c55e" />}
            {atrasada && <AlertTriangle size={15} color="#ef4444" />}
            {proxima && !feita && <Clock size={15} color="#f59e0b" />}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span style={{ background: `${prio.cor}20`, color: prio.cor, padding: '2px 8px', borderRadius: '10px', fontWeight: 600, fontSize: '0.7rem' }}>{prio.label}</span>
            <span>{cat.label}</span>
            {d.pessoa && <span>{tipo === 'eu_devo' ? 'Para:' : 'De:'} {d.pessoa}</span>}
            {d.prazo && <span>Prazo: {fmtDate(d.prazo)}</span>}
            {d.taxa_juro > 0 && <span>{d.taxa_juro}% juros</span>}
          </div>
          {d.descricao && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0' }}>{d.descricao}</p>}
        </div>
        <div style={{ textAlign: 'right', minWidth: '110px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total</div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{fmt(d.valor_total)} Kz</div>
          <div style={{ fontSize: '0.7rem', color: '#22c55e' }}>Pago: {fmt(d.valor_pago)}</div>
          <div style={{ fontSize: '0.7rem', color: '#ef4444' }}>Resta: {fmt(restante)}</div>
        </div>
      </div>

      <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: feita ? '#22c55e' : cat.cor, borderRadius: '6px', transition: 'width 0.4s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{pct.toFixed(1)}% pago</span>
        {!feita && !showPay && (
          <button onClick={() => setShowPay(true)} style={{ fontSize: '0.72rem', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '2px 6px' }}>+ Pagamento</button>
        )}
      </div>

      {showPay && (
        <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(52,211,153,0.06)', borderRadius: '8px', display: 'flex', gap: '8px' }}>
          <input type="number" value={payVal} onChange={e => setPayVal(e.target.value)} placeholder={`Máx: ${fmt(restante)}`} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} min="1" max={restante} />
          <button onClick={doPay} style={{ padding: '8px 14px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>Pagar</button>
          <button onClick={() => { setShowPay(false); setPayVal(''); }} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
      )}

      <button onClick={() => setOpen(!open)} style={{ marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {open ? 'Ocultar' : 'Detalhes'}
      </button>

      {open && (
        <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.78rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Data Início:</span> <strong>{fmtDate(d.data_inicio)}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Prazo:</span> <strong>{d.prazo ? fmtDate(d.prazo) : 'Sem prazo'}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Juros:</span> <strong>{d.taxa_juro || 0}%</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Categoria:</span> <strong>{cat.label}</strong></div>
          </div>
          {d.pagamentos && d.pagamentos.length > 0 && (
            <div style={{ marginTop: '6px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.75rem' }}>Histórico:</div>
              {d.pagamentos.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.72rem' }}>
                  <span>{fmtDate(p.data)}</span><span style={{ color: '#22c55e' }}>+{fmt(p.valor)} Kz</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button onClick={() => onEdit(d)} style={{ flex: 1, padding: '6px', fontSize: '0.72rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px', cursor: 'pointer', color: 'var(--color-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Edit2 size={11} /> Editar</button>
            <button onClick={() => onDel(d.id)} style={{ flex: 1, padding: '6px', fontSize: '0.72rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Trash2 size={11} /> Eliminar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DividasView() {
  const [dividas, setDividas] = useState(() => { try { return JSON.parse(localStorage.getItem('dividas_v1')) || []; } catch { return []; } });
  const [tipo, setTipo] = useState('eu_devo');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [f, setF] = useState({ nome: '', descricao: '', valor_total: '', valor_pago: '0', pessoa: '', categoria: 'pessoal', prioridade: 'media', prazo: '', taxa_juro: '0', data_inicio: new Date().toISOString().split('T')[0] });

  useEffect(() => { localStorage.setItem('dividas_v1', JSON.stringify(dividas)); }, [dividas]);

  const filtered = useMemo(() => dividas.filter(d => d.tipo === tipo), [dividas, tipo]);

  const stats = useMemo(() => {
    const ed = dividas.filter(d => d.tipo === 'eu_devo');
    const dm = dividas.filter(d => d.tipo === 'outro_deve');
    const tEd = ed.reduce((s, d) => s + Math.max(0, d.valor_total - d.valor_pago), 0);
    const tDm = dm.reduce((s, d) => s + Math.max(0, d.valor_total - d.valor_pago), 0);
    const at = dividas.filter(d => d.prazo && daysLeft(d.prazo) < 0 && d.valor_pago < d.valor_total).length;
    return { tEd, tDm, edAct: ed.filter(d => d.valor_pago < d.valor_total).length, dmAct: dm.filter(d => d.valor_pago < d.valor_total).length, at, saldo: tDm - tEd };
  }, [dividas]);

  const alerts = useMemo(() => {
    const r = [];
    dividas.forEach(d => {
      if (d.valor_pago >= d.valor_total) return;
      const dl = daysLeft(d.prazo);
      if (dl < 0) r.push({ tipo: 'erro', msg: `"${d.nome}" está ${Math.abs(dl)} dia(s) em atraso!` });
      else if (dl <= 7) r.push({ tipo: 'aviso', msg: `"${d.nome}" vence em ${dl} dia(s). Resta ${fmt(d.valor_total - d.valor_pago)} Kz.` });
    });
    return r;
  }, [dividas]);

  const resetForm = () => { setF({ nome: '', descricao: '', valor_total: '', valor_pago: '0', pessoa: '', categoria: 'pessoal', prioridade: 'media', prazo: '', taxa_juro: '0', data_inicio: new Date().toISOString().split('T')[0] }); setShowForm(false); setEditId(null); };

  const openEdit = (d) => { setF({ nome: d.nome, descricao: d.descricao || '', valor_total: String(d.valor_total), valor_pago: String(d.valor_pago), pessoa: d.pessoa || '', categoria: d.categoria, prioridade: d.prioridade, prazo: d.prazo || '', taxa_juro: String(d.taxa_juro || 0), data_inicio: d.data_inicio || '' }); setEditId(d.id); setTipo(d.tipo); setShowForm(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = { id: editId || Date.now().toString(), nome: f.nome, descricao: f.descricao, valor_total: parseFloat(f.valor_total) || 0, valor_pago: parseFloat(f.valor_pago) || 0, pessoa: f.pessoa, categoria: f.categoria, prioridade: f.prioridade, prazo: f.prazo, taxa_juro: parseFloat(f.taxa_juro) || 0, data_inicio: f.data_inicio, tipo, pagamentos: editId ? (dividas.find(d => d.id === editId)?.pagamentos || []) : [], created_at: editId ? (dividas.find(d => d.id === editId)?.created_at || new Date().toISOString()) : new Date().toISOString() };
    if (editId) setDividas(p => p.map(d => d.id === editId ? n : d));
    else setDividas(p => [...p, n]);
    resetForm();
  };

  const doPay = (id, amt) => { setDividas(p => p.map(d => d.id !== id ? d : { ...d, valor_pago: Math.min(d.valor_pago + amt, d.valor_total), pagamentos: [...(d.pagamentos || []), { data: new Date().toISOString().split('T')[0], valor: amt }] })); };

  const doDel = (id) => { if (window.confirm('Eliminar esta dívida?')) setDividas(p => p.filter(d => d.id !== id)); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Dívidas</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Controlo de dívidas pessoais</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
          <Plus size={16} /> Nova Dívida
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
        {[
          { l: 'Eu Devo', v: `${fmt(stats.tEd)} Kz`, i: <TrendingDown size={16} />, c: '#ef4444', s: `${stats.edAct} activas` },
          { l: 'Devo-me', v: `${fmt(stats.tDm)} Kz`, i: <TrendingUp size={16} />, c: '#22c55e', s: `${stats.dmAct} activas` },
          { l: 'Saldo', v: `${stats.saldo >= 0 ? '+' : ''}${fmt(stats.saldo)} Kz`, i: <Wallet size={16} />, c: stats.saldo >= 0 ? '#22c55e' : '#ef4444', s: 'Líquido' },
          { l: 'Atrasadas', v: String(stats.at), i: <AlertTriangle size={16} />, c: stats.at > 0 ? '#ef4444' : '#22c55e', s: stats.at > 0 ? 'Atenção!' : 'Em dia' }
        ].map((x, i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: x.c, marginBottom: '4px' }}>{x.i}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{x.l}</span></div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: x.c }}>{x.v}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{x.s}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && alerts.map((a, i) => (
        <div key={i} style={{ padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600, background: a.tipo === 'erro' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${a.tipo === 'erro' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`, color: a.tipo === 'erro' ? '#ef4444' : '#f59e0b' }}>
          <Bell size={15} /> {a.msg}
        </div>
      ))}

      {/* Toggle */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
        {[{ id: 'eu_devo', l: '📉 Eu Devo', c: '#ef4444' }, { id: 'outro_deve', l: '📈 Devem-me', c: '#22c55e' }].map(t => (
          <button key={t.id} onClick={() => setTipo(t.id)} style={{ flex: 1, background: tipo === t.id ? `${t.c}20` : 'none', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: tipo === t.id ? t.c : 'var(--text-secondary)', fontWeight: tipo === t.id ? 700 : 500, fontSize: '0.85rem' }}>{t.l}</button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontWeight: 800 }}>{editId ? 'Editar Dívida' : 'Nova Dívida'}</h4>
            <button type="button" onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Nome *</label><input type="text" value={f.nome} onChange={e => setF(p => ({ ...p, nome: e.target.value }))} required placeholder="Ex: Empréstimo BAI" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{tipo === 'eu_devo' ? 'Credor' : 'Devedor'}</label><input type="text" value={f.pessoa} onChange={e => setF(p => ({ ...p, pessoa: e.target.value }))} placeholder="Nome" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} /></div>
          </div>
          <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Descrição</label><textarea value={f.descricao} onChange={e => setF(p => ({ ...p, descricao: e.target.value }))} rows="2" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem', resize: 'vertical' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Valor Total (Kz) *</label><input type="number" value={f.valor_total} onChange={e => setF(p => ({ ...p, valor_total: e.target.value }))} required min="1" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Já Pago (Kz)</label><input type="number" value={f.valor_pago} onChange={e => setF(p => ({ ...p, valor_pago: e.target.value }))} min="0" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Juros (%)</label><input type="number" value={f.taxa_juro} onChange={e => setF(p => ({ ...p, taxa_juro: e.target.value }))} min="0" step="0.1" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Categoria</label><select value={f.categoria} onChange={e => setF(p => ({ ...p, categoria: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{CATS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}</select></div>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Prioridade</label><select value={f.prioridade} onChange={e => setF(p => ({ ...p, prioridade: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{PRIOS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></div>
            <div><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Prazo</label><input type="date" value={f.prazo} onChange={e => setF(p => ({ ...p, prazo: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} /></div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={resetForm} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Cancelar</button>
            <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>{editId ? 'Guardar' : 'Criar'}</button>
          </div>
        </form>
      )}

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <DollarSign size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.3 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
              {tipo === 'eu_devo' ? 'Não tem dívidas registadas.' : 'Ninguém lhe deve dinheiro.'}
            </p>
            <button onClick={() => { resetForm(); setShowForm(true); }} style={{ padding: '8px 16px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', marginTop: '8px' }}>
              <Plus size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Criar Primeira Dívida
            </button>
          </div>
        ) : (
          filtered.sort((a, b) => { const po = { critica: 0, alta: 1, media: 2, baixa: 3 }; const aF = a.valor_pago >= a.valor_total ? 1 : 0; const bF = b.valor_pago >= b.valor_total ? 1 : 0; if (aF !== bF) return aF - bF; return (po[a.prioridade] || 2) - (po[b.prioridade] || 2); }).map(d => (
            <Card key={d.id} d={d} tipo={tipo} onPay={doPay} onEdit={openEdit} onDel={doDel} />
          ))
        )}
      </div>
    </div>
  );
}
