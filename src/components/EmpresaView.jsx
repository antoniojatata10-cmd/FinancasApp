import React, { useState, useMemo } from 'react';
import {
  Building2, Users, Package, Truck, ArrowDownCircle, ArrowUpCircle,
  DollarSign, TrendingUp, TrendingDown, Plus, Trash2, Edit3,
  Save, X, Search, Filter, CheckCircle, Clock, AlertTriangle,
  FileText, BarChart2, ChevronDown, ChevronUp
} from 'lucide-react';

function fmt(v) {
  return Number(v || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function uid() {
  return 'E' + Date.now().toString(36).toUpperCase();
}

const TABS_EMPRESA = ['visao', 'fluxo', 'pagar', 'receber', 'fornecedores', 'clientes'];
const TAB_LABELS = {
  visao: '🏢 Visão Geral',
  fluxo: '💸 Fluxo de Caixa',
  pagar: '📤 Contas a Pagar',
  receber: '📥 Contas a Receber',
  fornecedores: '🚛 Fornecedores',
  clientes: '👥 Clientes'
};

const STATUS_COLORS = {
  Pendente: { cor: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  Pago: { cor: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  Recebido: { cor: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  Vencido: { cor: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  Cancelado: { cor: '#6b7280', bg: 'rgba(107,114,128,0.1)' }
};

function StatusBadge({ status }) {
  const cfg = STATUS_COLORS[status] || STATUS_COLORS.Pendente;
  return (
    <span style={{
      background: cfg.bg, color: cfg.cor, border: `1px solid ${cfg.cor}44`,
      padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700
    }}>{status}</span>
  );
}

const INITIAL_EMPRESA_DATA = {
  fluxo: [
    { id: 'F1', data: '2026-06-01', tipo: 'Entrada', descricao: 'Vendas Junho', categoria: 'Vendas', valor: 850000, conta: 'Banco', obs: '' },
    { id: 'F2', data: '2026-06-05', tipo: 'Saida', descricao: 'Salários Funcionários', categoria: 'Recursos Humanos', valor: 320000, conta: 'Banco', obs: '' },
    { id: 'F3', data: '2026-06-10', tipo: 'Saida', descricao: 'Aluguer Escritório', categoria: 'Infraestrutura', valor: 85000, conta: 'Banco', obs: '' }
  ],
  pagar: [
    { id: 'P1', vencimento: '2026-07-01', fornecedor: 'Sonangol', descricao: 'Combustível Julho', valor: 45000, status: 'Pendente', obs: '' },
    { id: 'P2', vencimento: '2026-06-20', fornecedor: 'ENDE', descricao: 'Electricidade', valor: 12500, status: 'Vencido', obs: '' }
  ],
  receber: [
    { id: 'R1', vencimento: '2026-07-15', cliente: 'Empresa ABC', descricao: 'Serviços de Consultoria', valor: 250000, status: 'Pendente', obs: '' },
    { id: 'R2', vencimento: '2026-06-30', cliente: 'Empresa XYZ', descricao: 'Venda Produtos', valor: 180000, status: 'Recebido', obs: '' }
  ],
  fornecedores: [
    { id: 'FN1', nome: 'Sonangol EP', contacto: '222 333 444', categoria: 'Combustíveis', nif: '5000000001', email: 'comercial@sonangol.co.ao', activo: true },
    { id: 'FN2', nome: 'ENDE', contacto: '222 111 000', categoria: 'Energia Elétrica', nif: '5000000002', email: 'clientes@ende.co.ao', activo: true }
  ],
  clientes: [
    { id: 'CL1', nome: 'Empresa ABC Lda', contacto: '912 345 678', categoria: 'Serviços', nif: '6000000001', email: 'financeiro@abc.co.ao', activo: true, debitoTotal: 250000 },
    { id: 'CL2', nome: 'Empresa XYZ SA', contacto: '923 456 789', categoria: 'Comércio', nif: '6000000002', email: 'contabilidade@xyz.co.ao', activo: true, debitoTotal: 0 }
  ]
};

function useEmpresaData(key, initial) {
  const [data, setData] = useState(() => {
    try {
      const s = localStorage.getItem(`empresa_${key}`);
      return s ? JSON.parse(s) : initial;
    } catch { return initial; }
  });

  const update = (newData) => {
    setData(newData);
    try { localStorage.setItem(`empresa_${key}`, JSON.stringify(newData)); } catch {}
  };

  return [data, update];
}

export default function EmpresaView({ currentUser, onToast }) {
  const [activeTab, setActiveTab] = useState('visao');
  const [fluxo, setFluxo] = useEmpresaData('fluxo', INITIAL_EMPRESA_DATA.fluxo);
  const [pagar, setPagar] = useEmpresaData('pagar', INITIAL_EMPRESA_DATA.pagar);
  const [receber, setReceber] = useEmpresaData('receber', INITIAL_EMPRESA_DATA.receber);
  const [fornecedores, setFornecedores] = useEmpresaData('fornecedores', INITIAL_EMPRESA_DATA.fornecedores);
  const [clientes, setClientes] = useEmpresaData('clientes', INITIAL_EMPRESA_DATA.clientes);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');

  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '18px'
  };

  // Métricas
  const totalEntradas = fluxo.filter(f => f.tipo === 'Entrada').reduce((s, f) => s + Number(f.valor), 0);
  const totalSaidas = fluxo.filter(f => f.tipo === 'Saida').reduce((s, f) => s + Number(f.valor), 0);
  const saldoCaixa = totalEntradas - totalSaidas;
  const totalAPagar = pagar.filter(p => p.status === 'Pendente' || p.status === 'Vencido').reduce((s, p) => s + Number(p.valor), 0);
  const totalAReceber = receber.filter(r => r.status === 'Pendente').reduce((s, r) => s + Number(r.valor), 0);
  const vencidos = pagar.filter(p => p.status === 'Vencido').length;

  // Generic helpers
  const openForm = (item = {}, id = null) => {
    setFormData(item);
    setEditId(id);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setFormData({}); setEditId(null); };

  const handleFluxoSave = () => {
    if (!formData.descricao || !formData.valor) { onToast({ type: 'warning', text: 'Preencha todos os campos.' }); return; }
    const item = { ...formData, id: editId || uid(), valor: Number(formData.valor) };
    if (editId) {
      setFluxo(fluxo.map(f => f.id === editId ? item : f));
      onToast({ type: 'success', text: 'Movimento atualizado!' });
    } else {
      setFluxo([item, ...fluxo]);
      onToast({ type: 'success', text: 'Movimento adicionado!' });
    }
    closeForm();
  };

  const handlePagarSave = () => {
    if (!formData.descricao || !formData.valor) { onToast({ type: 'warning', text: 'Preencha todos os campos.' }); return; }
    const item = { ...formData, id: editId || uid(), valor: Number(formData.valor), status: formData.status || 'Pendente' };
    if (editId) {
      setPagar(pagar.map(p => p.id === editId ? item : p));
    } else {
      setPagar([item, ...pagar]);
    }
    onToast({ type: 'success', text: 'Conta a pagar salva!' });
    closeForm();
  };

  const handleReceberSave = () => {
    if (!formData.descricao || !formData.valor) { onToast({ type: 'warning', text: 'Preencha todos os campos.' }); return; }
    const item = { ...formData, id: editId || uid(), valor: Number(formData.valor), status: formData.status || 'Pendente' };
    if (editId) {
      setReceber(receber.map(r => r.id === editId ? item : r));
    } else {
      setReceber([item, ...receber]);
    }
    onToast({ type: 'success', text: 'Conta a receber salva!' });
    closeForm();
  };

  const handleFornecedorSave = () => {
    if (!formData.nome) { onToast({ type: 'warning', text: 'Preencha o nome do fornecedor.' }); return; }
    const item = { ...formData, id: editId || uid(), activo: true };
    if (editId) {
      setFornecedores(fornecedores.map(f => f.id === editId ? item : f));
    } else {
      setFornecedores([item, ...fornecedores]);
    }
    onToast({ type: 'success', text: 'Fornecedor salvo!' });
    closeForm();
  };

  const handleClienteSave = () => {
    if (!formData.nome) { onToast({ type: 'warning', text: 'Preencha o nome do cliente.' }); return; }
    const item = { ...formData, id: editId || uid(), activo: true };
    if (editId) {
      setClientes(clientes.map(c => c.id === editId ? item : c));
    } else {
      setClientes([item, ...clientes]);
    }
    onToast({ type: 'success', text: 'Cliente salvo!' });
    closeForm();
  };

  const InputField = ({ label, field, type = 'text', options = null }) => (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>{label}</label>
      {options ? (
        <select className="form-input" value={formData[field] || ''} onChange={e => setFormData({ ...formData, [field]: e.target.value })}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} className="form-input" value={formData[field] || ''}
          onChange={e => setFormData({ ...formData, [field]: e.target.value })} />
      )}
    </div>
  );

  return (
    <div style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={22} style={{ color: 'var(--color-accent)' }} /> Gestão Empresarial
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px' }}>
          Fluxo de caixa, contas, clientes e fornecedores
        </p>
      </div>

      {/* Métricas Rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
        <div style={{ ...cardStyle, textAlign: 'center', background: saldoCaixa >= 0 ? 'rgba(52,211,153,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${saldoCaixa >= 0 ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>💰 Saldo Caixa</div>
          <div style={{ fontWeight: 800, color: saldoCaixa >= 0 ? '#34d399' : '#ef4444', fontSize: '1.1rem' }}>{fmt(saldoCaixa)} Kz</div>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>📤 A Pagar</div>
          <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '1.1rem' }}>{fmt(totalAPagar)} Kz</div>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>📥 A Receber</div>
          <div style={{ fontWeight: 800, color: '#34d399', fontSize: '1.1rem' }}>{fmt(totalAReceber)} Kz</div>
        </div>
        {vencidos > 0 && (
          <div style={{ ...cardStyle, textAlign: 'center', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ fontSize: '0.72rem', color: '#ef4444', marginBottom: '4px' }}>⚠️ Vencidos</div>
            <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '1.5rem' }}>{vencidos}</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px', overflowX: 'auto' }}>
        {TABS_EMPRESA.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            padding: '8px 14px', fontWeight: activeTab === tab ? 700 : 500,
            color: activeTab === tab ? 'var(--color-accent)' : 'var(--text-secondary)',
            borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
            fontSize: '0.82rem', borderRadius: '6px 6px 0 0'
          }}>
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '24px', borderRadius: '16px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>{editId ? 'Editar' : 'Adicionar'} Registo</h3>
              <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            {activeTab === 'fluxo' && <>
              <InputField label="Tipo" field="tipo" options={['Entrada', 'Saida']} />
              <InputField label="Data" field="data" type="date" />
              <InputField label="Descrição" field="descricao" />
              <InputField label="Categoria" field="categoria" />
              <InputField label="Valor (Kz)" field="valor" type="number" />
              <InputField label="Conta" field="conta" options={['Banco', 'Caixa', 'Cartão']} />
              <button onClick={handleFluxoSave} className="btn btn-primary" style={{ width: '100%' }}><Save size={14} /> Salvar</button>
            </>}

            {activeTab === 'pagar' && <>
              <InputField label="Fornecedor" field="fornecedor" />
              <InputField label="Descrição" field="descricao" />
              <InputField label="Vencimento" field="vencimento" type="date" />
              <InputField label="Valor (Kz)" field="valor" type="number" />
              <InputField label="Status" field="status" options={['Pendente', 'Pago', 'Vencido', 'Cancelado']} />
              <InputField label="Observações" field="obs" />
              <button onClick={handlePagarSave} className="btn btn-primary" style={{ width: '100%' }}><Save size={14} /> Salvar</button>
            </>}

            {activeTab === 'receber' && <>
              <InputField label="Cliente" field="cliente" />
              <InputField label="Descrição" field="descricao" />
              <InputField label="Vencimento" field="vencimento" type="date" />
              <InputField label="Valor (Kz)" field="valor" type="number" />
              <InputField label="Status" field="status" options={['Pendente', 'Recebido', 'Vencido', 'Cancelado']} />
              <InputField label="Observações" field="obs" />
              <button onClick={handleReceberSave} className="btn btn-primary" style={{ width: '100%' }}><Save size={14} /> Salvar</button>
            </>}

            {activeTab === 'fornecedores' && <>
              <InputField label="Nome da Empresa *" field="nome" />
              <InputField label="Contacto" field="contacto" />
              <InputField label="E-mail" field="email" type="email" />
              <InputField label="NIF" field="nif" />
              <InputField label="Categoria" field="categoria" />
              <button onClick={handleFornecedorSave} className="btn btn-primary" style={{ width: '100%' }}><Save size={14} /> Salvar</button>
            </>}

            {activeTab === 'clientes' && <>
              <InputField label="Nome do Cliente *" field="nome" />
              <InputField label="Contacto" field="contacto" />
              <InputField label="E-mail" field="email" type="email" />
              <InputField label="NIF" field="nif" />
              <InputField label="Categoria" field="categoria" />
              <button onClick={handleClienteSave} className="btn btn-primary" style={{ width: '100%' }}><Save size={14} /> Salvar</button>
            </>}
          </div>
        </div>
      )}

      {/* VISÃO GERAL */}
      {activeTab === 'visao' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={cardStyle}>
              <div style={{ fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={15} style={{ color: '#34d399' }} /> Entradas (mês)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{fmt(totalEntradas)} Kz</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingDown size={15} style={{ color: '#ef4444' }} /> Saídas (mês)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>{fmt(totalSaidas)} Kz</div>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontWeight: 700, marginBottom: '12px' }}>📊 Resumo Operacional</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fornecedores</span>
                <strong>{fornecedores.filter(f => f.activo).length} activos</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Clientes</span>
                <strong>{clientes.filter(c => c.activo).length} activos</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Contas a Pagar (pendentes)</span>
                <strong style={{ color: '#ef4444' }}>{pagar.filter(p => p.status === 'Pendente').length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Contas a Receber (pendentes)</span>
                <strong style={{ color: '#34d399' }}>{receber.filter(r => r.status === 'Pendente').length}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLUXO DE CAIXA */}
      {activeTab === 'fluxo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => openForm({ tipo: 'Entrada', data: new Date().toISOString().split('T')[0], conta: 'Banco' })} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={14} /> Novo Movimento
            </button>
          </div>
          {fluxo.map(f => (
            <div key={f.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: f.tipo === 'Entrada' ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {f.tipo === 'Entrada' ? <ArrowDownCircle size={18} style={{ color: '#34d399' }} /> : <ArrowUpCircle size={18} style={{ color: '#ef4444' }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{f.descricao}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.data} · {f.categoria} · {f.conta}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: f.tipo === 'Entrada' ? '#34d399' : '#ef4444' }}>
                  {f.tipo === 'Entrada' ? '+' : '-'}{fmt(f.valor)} Kz
                </span>
                <button onClick={() => openForm(f, f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}><Edit3 size={14} /></button>
                <button onClick={() => { setFluxo(fluxo.filter(x => x.id !== f.id)); onToast({ type: 'success', text: 'Removido!' }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTAS A PAGAR */}
      {activeTab === 'pagar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => openForm({ status: 'Pendente', vencimento: new Date().toISOString().split('T')[0] })} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={14} /> Nova Conta a Pagar
            </button>
          </div>
          {pagar.map(p => (
            <div key={p.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.descricao}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {p.fornecedor} · Vence: {p.vencimento}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <StatusBadge status={p.status} />
                <span style={{ fontWeight: 800, color: '#ef4444' }}>{fmt(p.valor)} Kz</span>
                <button onClick={() => openForm(p, p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}><Edit3 size={14} /></button>
                <button onClick={() => { setPagar(pagar.filter(x => x.id !== p.id)); onToast({ type: 'success', text: 'Removido!' }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTAS A RECEBER */}
      {activeTab === 'receber' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => openForm({ status: 'Pendente', vencimento: new Date().toISOString().split('T')[0] })} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={14} /> Nova Conta a Receber
            </button>
          </div>
          {receber.map(r => (
            <div key={r.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.descricao}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {r.cliente} · Vence: {r.vencimento}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <StatusBadge status={r.status} />
                <span style={{ fontWeight: 800, color: '#34d399' }}>{fmt(r.valor)} Kz</span>
                <button onClick={() => openForm(r, r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}><Edit3 size={14} /></button>
                <button onClick={() => { setReceber(receber.filter(x => x.id !== r.id)); onToast({ type: 'success', text: 'Removido!' }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORNECEDORES */}
      {activeTab === 'fornecedores' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => openForm({})} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={14} /> Novo Fornecedor
            </button>
          </div>
          {fornecedores.map(f => (
            <div key={f.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={18} style={{ color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{f.nome}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.contacto} · {f.categoria}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', background: f.activo ? 'rgba(52,211,153,0.1)' : 'rgba(107,114,128,0.1)', color: f.activo ? '#34d399' : '#6b7280', fontWeight: 700 }}>
                  {f.activo ? 'Activo' : 'Inactivo'}
                </span>
                <button onClick={() => openForm(f, f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}><Edit3 size={14} /></button>
                <button onClick={() => { setFornecedores(fornecedores.filter(x => x.id !== f.id)); onToast({ type: 'success', text: 'Fornecedor removido!' }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CLIENTES */}
      {activeTab === 'clientes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => openForm({})} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={14} /> Novo Cliente
            </button>
          </div>
          {clientes.map(c => (
            <div key={c.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} style={{ color: '#34d399' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{c.nome}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.contacto} · {c.categoria}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {c.debitoTotal > 0 && (
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b' }}>
                    Débito: {fmt(c.debitoTotal)} Kz
                  </span>
                )}
                <button onClick={() => openForm(c, c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}><Edit3 size={14} /></button>
                <button onClick={() => { setClientes(clientes.filter(x => x.id !== c.id)); onToast({ type: 'success', text: 'Cliente removido!' }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
