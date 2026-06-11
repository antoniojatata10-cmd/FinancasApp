import React, { useState, useMemo } from 'react';
import {
  Crown, Users, Shield, Lock, Unlock, Star, Trash2,
  UserCheck, UserX, Search, Settings2,
  ChevronDown, ChevronUp,
  Edit3, Save, X, RefreshCw, Megaphone, CreditCard,
  Banknote, DollarSign
} from 'lucide-react';

const PLANOS = ['Gratuito', 'Básico', 'Pro', 'Enterprise'];
const ROLES = ['User', 'Admin', 'SuperAdmin'];

const cardStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '14px',
  padding: '20px'
};

const badgeStyle = (color) => ({
  padding: '3px 10px',
  borderRadius: '20px',
  fontSize: '0.72rem',
  fontWeight: 700,
  backgroundColor: `${color}22`,
  color: color,
  border: `1px solid ${color}55`
});

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ ...cardStyle, textAlign: 'center' }}>
      <div style={{ color, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

export default function SuperAdminView({ users, setUsers, currentUserEmail, onToast, launches, bankInfo, setBankInfo }) {
  const [search, setSearch] = useState('');
  const [filterPlano, setFilterPlano] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [announcement, setAnnouncement] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    banco: bankInfo?.banco || '',
    titular: bankInfo?.titular || '',
    iban: bankInfo?.iban || '',
    conta: bankInfo?.conta || '',
    telefone: bankInfo?.telefone || '',
    referencia: bankInfo?.referencia || '',
    precoMensal: bankInfo?.precoMensal || '2000',
    precoAnual: bankInfo?.precoAnual || '20000'
  });

  const autoManageAccounts = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let locked = 0;
    setUsers(prev => prev.map(u => {
      if (u.Role === 'SuperAdmin') return u;
      const lastAccess = new Date(u.UltimoAcesso || '2020-01-01');
      if (lastAccess < thirtyDaysAgo && u.Ativo) {
        locked++;
        return { ...u, Ativo: false, BloqueioMotivo: 'Inatividade automática (>30 dias)' };
      }
      return u;
    }));
    onToast({ type: 'success', text: `Gestão automática concluída! ${locked} conta(s) bloqueada(s) por inatividade.` });
  };

  const stats = useMemo(() => ({
    total: users.length,
    ativos: users.filter(u => u.Ativo).length,
    bloqueados: users.filter(u => !u.Ativo).length,
    pagos: users.filter(u => u.Plano !== 'Gratuito' && u.Role !== 'SuperAdmin').length,
    admins: users.filter(u => u.Role === 'Admin').length,
  }), [users]);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch = search === '' ||
        u.Nome?.toLowerCase().includes(search.toLowerCase()) ||
        u.Email.toLowerCase().includes(search.toLowerCase());
      const matchPlano = filterPlano === 'Todos' || u.Plano === filterPlano;
      const matchStatus = filterStatus === 'Todos' ||
        (filterStatus === 'Ativo' && u.Ativo) ||
        (filterStatus === 'Bloqueado' && !u.Ativo);
      return matchSearch && matchPlano && matchStatus;
    });
  }, [users, search, filterPlano, filterStatus]);

  const handleBlockToggle = (email) => {
    if (email === currentUserEmail) {
      onToast({ type: 'error', text: 'Não pode bloquear sua própria conta!' });
      return;
    }
    setUsers(prev => prev.map(u =>
      u.Email === email ? {
        ...u,
        Ativo: !u.Ativo,
        BloqueioMotivo: u.Ativo ? 'Bloqueado manualmente pelo SuperAdmin' : ''
      } : u
    ));
    const user = users.find(u => u.Email === email);
    onToast({ type: 'success', text: `Conta "${user?.Nome}" ${user?.Ativo ? 'bloqueada' : 'desbloqueada'} com sucesso!` });
  };

  const handlePlanoChange = (email, novoPlano) => {
    setUsers(prev => prev.map(u => u.Email === email ? { ...u, Plano: novoPlano } : u));
    onToast({ type: 'success', text: `Plano alterado para "${novoPlano}" com sucesso!` });
  };

  const handleRoleChange = (email, novoRole) => {
    if (email === currentUserEmail) {
      onToast({ type: 'error', text: 'Não pode alterar o seu próprio papel!' });
      return;
    }
    setUsers(prev => prev.map(u => u.Email === email ? { ...u, Role: novoRole } : u));
    onToast({ type: 'success', text: `Papel alterado para "${novoRole}" com sucesso!` });
  };

  const handleDeleteUser = (email) => {
    if (email === currentUserEmail) {
      onToast({ type: 'error', text: 'Não pode eliminar a sua própria conta!' });
      return;
    }
    const user = users.find(u => u.Email === email);
    if (window.confirm(`⚠️ Confirmar eliminação permanente da conta de "${user?.Nome}"?\n\nEsta ação não pode ser desfeita.`)) {
      setUsers(prev => prev.filter(u => u.Email !== email));
      onToast({ type: 'success', text: `Conta de "${user?.Nome}" eliminada permanentemente.` });
    }
  };

  const handleStartEdit = (user) => {
    setEditingUser(user.Email);
    setEditForm({ Nome: user.Nome, Telefone: user.Telefone || '', Pais: user.Pais || '' });
  };

  const handleSaveEdit = (email) => {
    setUsers(prev => prev.map(u => u.Email === email ? { ...u, ...editForm } : u));
    setEditingUser(null);
    onToast({ type: 'success', text: 'Perfil do utilizador atualizado com sucesso!' });
  };

  const handlePostAnnouncement = () => {
    if (!announcement.trim()) return;
    const newAnn = {
      id: Date.now(),
      text: announcement.trim(),
      date: new Date().toLocaleString('pt-BR'),
      author: currentUserEmail
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    setAnnouncement('');
    onToast({ type: 'success', text: 'Anúncio publicado para todos os utilizadores!' });
  };

  const handleSaveBank = () => {
    setBankInfo(bankForm);
    setEditingBank(false);
    onToast({ type: 'success', text: 'Coordenadas bancárias atualizadas com sucesso!' });
  };

  const getUserLaunches = (email) => launches.filter(l => l.CriadoPor === email).length;

  const planoColor = (plano) => {
    switch (plano) {
      case 'Pro': return 'var(--color-accent)';
      case 'Enterprise': return '#f59e0b';
      case 'Básico': return 'var(--color-success)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
              borderRadius: '10px', padding: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Crown size={22} style={{ color: '#1a1a1a' }} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Painel SuperAdmin</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Controlo total sobre contas, planos, pagamentos e funcionalidades.
          </p>
        </div>
        <button
          onClick={autoManageAccounts}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} />
          Gestão Automática
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
        <StatCard icon={<Users size={24} />} label="Total de Contas" value={stats.total} color="var(--color-accent)" />
        <StatCard icon={<UserCheck size={24} />} label="Ativos" value={stats.ativos} color="var(--color-success)" />
        <StatCard icon={<UserX size={24} />} label="Bloqueados" value={stats.bloqueados} color="var(--color-error)" />
        <StatCard icon={<Star size={24} />} label="Plano Pago" value={stats.pagos} color="#f59e0b" />
        <StatCard icon={<Shield size={24} />} label="Admins" value={stats.admins} color="#a78bfa" />
      </div>

      {/* Bank Coordinates Section - SuperAdmin Only */}
      <div style={{ ...cardStyle, borderColor: 'rgba(52, 211, 153, 0.25)', background: 'rgba(52, 211, 153, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
            <Banknote size={20} />
            <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Coordenadas Bancárias (Pagamento Pro)</h4>
          </div>
          <button
            onClick={() => setEditingBank(!editingBank)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.8rem' }}
          >
            {editingBank ? <><X size={13} /> Cancelar</> : <><Edit3 size={13} /> Editar</>}
          </button>
        </div>

        {editingBank ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {[
                { key: 'banco', label: 'Nome do Banco', placeholder: 'Ex: BAI, BFA, BIC...' },
                { key: 'titular', label: 'Nome do Titular', placeholder: 'Seu nome completo' },
                { key: 'iban', label: 'IBAN', placeholder: 'AO06 0000 0000 0000 0000 0' },
                { key: 'conta', label: 'Nº da Conta', placeholder: '0000.0000.0000.0' },
                { key: 'telefone', label: 'Multicaixa Express / Telefone', placeholder: '+244 9XX XXX XXX' },
                { key: 'referencia', label: 'Referência de Pagamento', placeholder: 'REF-PRO-2026' },
              ].map(f => (
                <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>{f.label}</label>
                  <input
                    type="text"
                    value={bankForm[f.key]}
                    onChange={e => setBankForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="form-input"
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Preço Mensal (Kz)</label>
                <input type="number" value={bankForm.precoMensal}
                  onChange={e => setBankForm(prev => ({ ...prev, precoMensal: e.target.value }))}
                  className="form-input" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Preço Anual (Kz)</label>
                <input type="number" value={bankForm.precoAnual}
                  onChange={e => setBankForm(prev => ({ ...prev, precoAnual: e.target.value }))}
                  className="form-input" />
              </div>
            </div>
            <button onClick={handleSaveBank} className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Save size={15} /> Guardar Coordenadas
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[
              { icon: <CreditCard size={15} />, label: 'Banco', value: bankInfo?.banco || '(não configurado)' },
              { icon: <Users size={15} />, label: 'Titular', value: bankInfo?.titular || '(não configurado)' },
              { icon: <Banknote size={15} />, label: 'IBAN', value: bankInfo?.iban || '(não configurado)' },
              { icon: <DollarSign size={15} />, label: 'Nº Conta', value: bankInfo?.conta || '(não configurado)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-success)' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.label}</div>
                  <div style={{ fontWeight: 600 }}>{item.value}</div>
                </div>
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '16px', marginTop: '4px' }}>
              <div style={{
                padding: '10px 16px', borderRadius: '10px', flex: 1, textAlign: 'center',
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)'
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mensal</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                  {Number(bankInfo?.precoMensal || 2000).toLocaleString('pt-AO')} Kz
                </div>
              </div>
              <div style={{
                padding: '10px 16px', borderRadius: '10px', flex: 1, textAlign: 'center',
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)'
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Anual</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>
                  {Number(bankInfo?.precoAnual || 20000).toLocaleString('pt-AO')} Kz
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Announcements Section */}
      <div style={{ ...cardStyle, borderColor: 'rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#f59e0b' }}>
          <Megaphone size={20} />
          <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Publicar Anúncio / Atualização</h4>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Ex: Nova funcionalidade disponível!..."
            value={announcement} onChange={e => setAnnouncement(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePostAnnouncement()}
            className="form-input" style={{ flex: 1, minWidth: '200px' }} />
          <button onClick={handlePostAnnouncement} className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Megaphone size={15} /> Publicar
          </button>
        </div>
        {announcements.length > 0 && (
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {announcements.slice(0, 3).map(ann => (
              <div key={ann.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '10px 14px', borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.15)',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>📢 {ann.text}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{ann.date}</div>
                </div>
                <button onClick={() => setAnnouncements(prev => prev.filter(a => a.id !== ann.id))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Management */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Users size={20} style={{ color: 'var(--color-accent)' }} />
          <h4 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Gestão de Utilizadores ({filtered.length})</h4>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Pesquisar por nome ou e-mail..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="form-input" style={{ paddingLeft: '32px' }} />
          </div>
          <select value={filterPlano} onChange={e => setFilterPlano(e.target.value)}
            className="form-input" style={{ width: 'auto', minWidth: '120px' }}>
            <option value="Todos">Todos os Planos</option>
            {PLANOS.map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="form-input" style={{ width: 'auto', minWidth: '120px' }}>
            <option value="Todos">Todos os Status</option>
            <option value="Ativo">Ativos</option>
            <option value="Bloqueado">Bloqueados</option>
          </select>
        </div>

        {/* User List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Nenhum utilizador encontrado com os filtros actuais.
            </div>
          )}

          {filtered.map(user => (
            <div key={user.Email} style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${user.Ativo ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: '12px', overflow: 'hidden'
            }}>
              <div style={{
                padding: '14px 16px', display: 'flex', alignItems: 'center',
                flexWrap: 'wrap', gap: '10px', opacity: user.Ativo ? 1 : 0.6
              }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                  background: user.Role === 'SuperAdmin'
                    ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                    : user.Role === 'Admin'
                      ? 'linear-gradient(135deg, #a78bfa, #6366f1)'
                      : 'linear-gradient(135deg, #34d399, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '1rem', color: '#fff'
                }}>
                  {(user.Nome || user.Email)?.[0]?.toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: '150px' }}>
                  {editingUser === user.Email ? (
                    <input value={editForm.Nome}
                      onChange={e => setEditForm(f => ({ ...f, Nome: e.target.value }))}
                      className="form-input"
                      style={{ padding: '4px 8px', fontSize: '0.88rem', height: 'auto' }} />
                  ) : (
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      {user.Nome || user.Email.split('@')[0]}
                      {user.Email === currentUserEmail && (
                        <span style={{ ...badgeStyle('var(--color-success)'), marginLeft: '6px', fontSize: '0.65rem' }}>VOCÊ</span>
                      )}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{user.Email}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {user.Pais && `🌍 ${user.Pais}`} · {user.DataCadastro || 'N/A'}
                    · {getUserLaunches(user.Email)} lançamentos
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={badgeStyle(user.Ativo ? 'var(--color-success)' : 'var(--color-error)')}>
                    {user.Ativo ? '✓ Ativo' : '✗ Bloqueado'}
                  </span>

                  <select value={user.Plano || 'Gratuito'}
                    onChange={e => handlePlanoChange(user.Email, e.target.value)}
                    disabled={user.Role === 'SuperAdmin'}
                    style={{
                      background: `${planoColor(user.Plano)}22`,
                      color: planoColor(user.Plano),
                      border: `1px solid ${planoColor(user.Plano)}55`,
                      borderRadius: '20px', padding: '3px 10px',
                      fontSize: '0.72rem', fontWeight: 700,
                      cursor: user.Role === 'SuperAdmin' ? 'not-allowed' : 'pointer',
                      appearance: 'none'
                    }}>
                    {PLANOS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>

                  <select value={user.Role}
                    onChange={e => handleRoleChange(user.Email, e.target.value)}
                    disabled={user.Role === 'SuperAdmin' || user.Email === currentUserEmail}
                    className="form-input"
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem', height: 'auto' }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    {editingUser === user.Email ? (
                      <>
                        <button onClick={() => handleSaveEdit(user.Email)}
                          style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success)', color: 'var(--color-success)', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Save size={13} />
                        </button>
                        <button onClick={() => setEditingUser(null)}
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleStartEdit(user)} title="Editar dados"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Edit3 size={13} />
                      </button>
                    )}

                    {user.Role !== 'SuperAdmin' && (
                      <>
                        <button onClick={() => handleBlockToggle(user.Email)}
                          title={user.Ativo ? 'Bloquear' : 'Desbloquear'}
                          style={{
                            background: user.Ativo ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)',
                            border: `1px solid ${user.Ativo ? 'rgba(239,68,68,0.3)' : 'rgba(52,211,153,0.3)'}`,
                            color: user.Ativo ? 'var(--color-error)' : 'var(--color-success)',
                            borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                          }}>
                          {user.Ativo ? <Lock size={13} /> : <Unlock size={13} />}
                        </button>
                        <button onClick={() => setExpandedUser(expandedUser === user.Email ? null : user.Email)}
                          title="Detalhes"
                          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--color-accent)', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          {expandedUser === user.Email ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                        <button onClick={() => handleDeleteUser(user.Email)} title="Eliminar"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--color-error)', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {expandedUser === user.Email && (
                <div style={{
                  padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(0,0,0,0.15)',
                  display: 'flex', gap: '20px', flexWrap: 'wrap',
                  fontSize: '0.8rem', color: 'var(--text-secondary)'
                }}>
                  <div><strong style={{ color: 'var(--text-primary)' }}>Telefone:</strong> {user.Telefone || '—'}</div>
                  <div><strong style={{ color: 'var(--text-primary)' }}>País:</strong> {user.Pais || '—'}</div>
                  <div><strong style={{ color: 'var(--text-primary)' }}>Último Acesso:</strong> {user.UltimoAcesso || '—'}</div>
                  <div><strong style={{ color: 'var(--text-primary)' }}>Lançamentos:</strong> {getUserLaunches(user.Email)}</div>
                  {!user.Ativo && user.BloqueioMotivo && (
                    <div style={{ width: '100%' }}>
                      <strong style={{ color: 'var(--color-error)' }}>Motivo do Bloqueio:</strong> {user.BloqueioMotivo}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Settings */}
      <div style={{ ...cardStyle, borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--color-accent)' }}>
          <Settings2 size={20} />
          <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Configurações do Sistema</h4>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Limite Plano Gratuito</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>50 lançamentos por mês</div>
            <div style={{ ...badgeStyle('var(--color-success)'), display: 'inline-block', marginTop: '8px' }}>✓ Ativo</div>
          </div>
          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Auto-Bloqueio Inatividade</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>30 dias sem acesso</div>
            <div style={{ ...badgeStyle('var(--color-success)'), display: 'inline-block', marginTop: '8px' }}>✓ Ativo</div>
          </div>
          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Versão do Sistema</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Finança ao Ponto v3.0</div>
            <div style={{ ...badgeStyle('#f59e0b'), display: 'inline-block', marginTop: '8px' }}>⭐ SuperAdmin Build</div>
          </div>
        </div>
      </div>

    </div>
  );
}
