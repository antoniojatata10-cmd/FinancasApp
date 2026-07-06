import React, { useState, useMemo } from 'react';
import {
  Crown, Users, Shield, Lock, Unlock, Star, Trash2,
  UserCheck, UserX, Search, Settings2,
  ChevronDown, ChevronUp,
  Edit3, Save, X, RefreshCw, Megaphone, CreditCard,
  Banknote, DollarSign, CheckCircle, Clock, AlertTriangle,
  FileText, Eye, Plus, ShieldAlert, Key
} from 'lucide-react';
import { supabase } from '../supabaseClient';

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

export default function SuperAdminView({
  users,
  setUsers,
  currentUserEmail,
  onToast,
  launches,
  bankInfo,
  setBankInfo,
  subscriptions,
  setSubscriptions,
  inviteCodes,
  setInviteCodes,
  auditLogs,
  onAddAuditLog
}) {
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

  // User CRUD states
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [createNome, setCreateNome] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createSenha, setCreateSenha] = useState('');
  const [createRole, setCreateRole] = useState('User');
  const [createPlano, setCreatePlano] = useState('Gratuito');

  // Invite codes states
  const [newInviteCode, setNewInviteCode] = useState('');

  // Logs search state
  const [logSearch, setLogSearch] = useState('');

  // Image preview lightbox
  const [previewImg, setPreviewImg] = useState(null);

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
    if (onAddAuditLog) onAddAuditLog(currentUserEmail, `Executou gestão automática: Bloqueou ${locked} contas inativas`);
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

  const filteredLogs = useMemo(() => {
    const logs = auditLogs || [];
    if (!logSearch.trim()) return logs;
    const clean = logSearch.toLowerCase();
    return logs.filter(l =>
      l.email.toLowerCase().includes(clean) ||
      l.acao.toLowerCase().includes(clean) ||
      l.ip.toLowerCase().includes(clean)
    );
  }, [auditLogs, logSearch]);

  const handleBlockToggle = async (userId, email, currentlyActive) => {
    if (email === currentUserEmail) {
      onToast({ type: 'error', text: 'Não pode bloquear a sua própria conta!' });
      return;
    }
    const newState = !currentlyActive;
    // Update Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: newState })
      .eq('id', userId);

    if (error) {
      onToast({ type: 'warning', text: 'Erro ao actualizar estado: ' + error.message });
      return;
    }
    // Update local state
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, Ativo: newState } : u
    ));
    onToast({ type: 'success', text: `Conta ${newState ? 'desbloqueada' : 'bloqueada'} com sucesso!` });
  };

  const handlePlanoChange = async (userId, email, novoPlano) => {
    const updates = { plan: novoPlano };
    if (novoPlano === 'Gratuito') {
      updates.plan_expires_at = null;
    } else {
      // Manual upgrade gives 30 days expiration by default
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 30);
      updates.plan_expires_at = expDate.toISOString();
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      onToast({ type: 'warning', text: 'Erro ao alterar plano: ' + error.message });
      return;
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, Plano: novoPlano, PlanExpiresAt: updates.plan_expires_at } : u));
    onToast({ type: 'success', text: `Plano alterado para "${novoPlano}" com sucesso!` });
  };

  const handleRoleChange = async (userId, email, novoRole) => {
    if (email === currentUserEmail) {
      onToast({ type: 'error', text: 'Não pode alterar o seu próprio papel!' });
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .update({ role: novoRole.toLowerCase() })
      .eq('id', userId);

    if (error) {
      onToast({ type: 'warning', text: 'Erro ao alterar papel: ' + error.message });
      return;
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, Role: novoRole } : u));
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
      if (onAddAuditLog) onAddAuditLog(currentUserEmail, `ELIMINOU permanentemente o utilizador: ${email}`);
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
    if (onAddAuditLog) onAddAuditLog(currentUserEmail, `Editou perfil do utilizador: ${email}`);
  };

  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (!createNome.trim() || !createEmail.trim() || !createSenha.trim()) {
      alert('Por favor, preencha os campos obrigatórios (*).');
      return;
    }

    const emailClean = createEmail.trim().toLowerCase();
    if (users.some(u => u.Email.toLowerCase() === emailClean)) {
      alert('Este e-mail já está cadastrado no sistema.');
      return;
    }

    const newUser = {
      Email: emailClean,
      Nome: createNome.trim(),
      Senha: createSenha,
      Telefone: '',
      Pais: 'Angola',
      Role: createRole,
      Ativo: true,
      Plano: createPlano,
      DataCadastro: new Date().toISOString().split('T')[0],
      UltimoAcesso: new Date().toISOString().split('T')[0],
      LancamentosUsados: 0
    };

    setUsers(prev => [...prev, newUser]);
    setIsCreateUserOpen(false);
    onToast({ type: 'success', text: `Utilizador "${newUser.Nome}" criado com sucesso!` });
    if (onAddAuditLog) onAddAuditLog(currentUserEmail, `CRIOU utilizador diretamente: ${emailClean} (Role: ${createRole}, Plano: ${createPlano})`);

    // Reset fields
    setCreateNome('');
    setCreateEmail('');
    setCreateSenha('');
    setCreateRole('User');
    setCreatePlano('Gratuito');
  };

  const handleAddInviteCodeSubmit = (e) => {
    e.preventDefault();
    const code = newInviteCode.trim().toUpperCase();
    if (!code) return;

    const currentCodes = inviteCodes || [];
    if (currentCodes.includes(code)) {
      onToast({ type: 'warning', text: 'Este código de convite já existe!' });
      return;
    }

    setInviteCodes(prev => [...(prev || []), code]);
    setNewInviteCode('');
    onToast({ type: 'success', text: `Código de convite "${code}" criado com sucesso.` });
    if (onAddAuditLog) onAddAuditLog(currentUserEmail, `Criou código de convite: ${code}`);
  };

  const handleRevokeInviteCode = (code) => {
    setInviteCodes(prev => (prev || []).filter(c => c !== code));
    onToast({ type: 'success', text: `Código de convite "${code}" revogado.` });
    if (onAddAuditLog) onAddAuditLog(currentUserEmail, `Revogou código de convite: ${code}`);
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
    if (onAddAuditLog) onAddAuditLog(currentUserEmail, `Publicou anúncio global: "${newAnn.text}"`);
  };

  const handleSaveBank = async () => {
    try {
      // Save each key-value pair to admin_settings
      const updates = Object.entries(bankForm).map(([key, value]) =>
        supabase.from('admin_settings').upsert({ key, value }, { onConflict: 'key' })
      );
      await Promise.all(updates);
      setBankInfo(bankForm);
      setEditingBank(false);
      onToast({ type: 'success', text: 'Coordenadas bancárias guardadas no Supabase com sucesso!' });
    } catch (err) {
      onToast({ type: 'warning', text: 'Erro ao guardar: ' + (err.message || 'Tente novamente.') });
    }
  };

  // Approve payment via SQL function
  const handleApprovePayment = async (paymentId, adminId) => {
    try {
      const { error } = await supabase.rpc('approve_payment', {
        payment_id: paymentId,
        admin_id:   adminId
      });
      if (error) throw error;
      // Refresh local payments list
      if (setSubscriptions) {
        setSubscriptions(prev => prev.map(s =>
          s.id === paymentId ? { ...s, status: 'Ativa' } : s
        ));
      }
      onToast({ type: 'success', text: 'Pagamento aprovado! Plano activado para o utilizador.' });
    } catch (err) {
      onToast({ type: 'warning', text: 'Erro ao aprovar: ' + (err.message || 'Tente novamente.') });
    }
  };

  // Revoke plan (admin force reset to Gratuito)
  const handleRevokePlan = async (sub) => {
    if (!window.confirm(`⚠️ Revogar plano de "${sub.userName || sub.userEmail}"?\nO utilizador voltará ao plano Gratuito imediatamente.`)) return;
    try {
      // Reset profile plan
      const { error: profErr } = await supabase
        .from('profiles')
        .update({ plan: 'Gratuito', plan_expires_at: null })
        .eq('id', sub.user_id);
      if (profErr) throw profErr;

      // Mark payment as Expirada
      const { error: payErr } = await supabase
        .from('payments')
        .update({ status: 'Expirada' })
        .eq('id', sub.id);
      if (payErr) throw payErr;

      // Update local state
      if (setSubscriptions) {
        setSubscriptions(prev => prev.map(s =>
          s.id === sub.id ? { ...s, status: 'Expirada' } : s
        ));
      }
      setUsers(prev => prev.map(u =>
        u.id === sub.user_id ? { ...u, Plano: 'Gratuito' } : u
      ));
      onToast({ type: 'success', text: `Plano de "${sub.userName || sub.userEmail}" revogado para Gratuito!` });
    } catch (err) {
      onToast({ type: 'warning', text: 'Erro ao revogar: ' + (err.message || 'Tente novamente.') });
    }
  };

  // Reject payment via SQL function
  const handleRejectPayment = async (paymentId, adminId, motivo = '') => {
    try {
      const { error } = await supabase.rpc('reject_payment', {
        payment_id: paymentId,
        admin_id:   adminId,
        motivo
      });
      if (error) throw error;
      if (setSubscriptions) {
        setSubscriptions(prev => prev.map(s =>
          s.id === paymentId ? { ...s, status: 'Cancelada' } : s
        ));
      }
      onToast({ type: 'success', text: 'Pagamento rejeitado. Utilizador notificado.' });
    } catch (err) {
      onToast({ type: 'warning', text: 'Erro ao rejeitar: ' + (err.message || 'Tente novamente.') });
    }
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
            Controlo total sobre contas, planos, pagamentos, convites e auditoria de segurança.
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} style={{ color: 'var(--color-accent)' }} />
            <h4 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Gestão de Utilizadores ({filtered.length})</h4>
          </div>
          <button onClick={() => setIsCreateUserOpen(true)} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> Novo Utilizador
          </button>
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
                    onChange={e => handlePlanoChange(user.id, user.Email, e.target.value)}
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
                    onChange={e => handleRoleChange(user.id, user.Email, e.target.value)}
                    disabled={user.Role === 'SuperAdmin' || user.Email === currentUserEmail}
                    className="form-input"
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem', height: 'auto' }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>

                  {/* Quick "Tornar Admin" button — APENAS VISÍVEL LOCALMENTE (dev mode) */}
                  {import.meta.env.DEV && user.Role !== 'admin' && user.Role !== 'Admin' && user.Role !== 'SuperAdmin' && user.Email !== currentUserEmail && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Tornar "${user.Nome || user.Email}" administrador?\n\nEsta ação dá ao utilizador acesso total ao painel de admin.`)) {
                          handleRoleChange(user.id, user.Email, 'admin');
                        }
                      }}
                      title="Tornar Administrador"
                      style={{
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.08))',
                        border: '1px solid rgba(245,158,11,0.4)',
                        color: '#f59e0b',
                        borderRadius: '6px', padding: '5px 10px',
                        cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '4px',
                        whiteSpace: 'nowrap', transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.25)'; e.currentTarget.style.borderColor = '#f59e0b'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.08))'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; }}
                    >
                      <Crown size={13} /> Tornar Admin
                    </button>
                  )}

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
                        <button onClick={() => handleBlockToggle(user.id, user.Email, user.Ativo)}
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

      {/* ─── SUBSCRIPTION APPROVAL PANEL ─── */}
      <div style={{ ...cardStyle, borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)' }}>
            <CreditCard size={20} />
            <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Aprovação de Subscrições</h4>
          </div>
          {(subscriptions || []).filter(s => s.status === 'Pendente').length > 0 && (
            <span style={{ ...badgeStyle('#f59e0b'), fontSize: '0.75rem' }}>
              {(subscriptions || []).filter(s => s.status === 'Pendente').length} pendente(s)
            </span>
          )}
        </div>

        {(!subscriptions || subscriptions.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Clock size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
            <p>Nenhum pedido de subscrição recebido.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(subscriptions || []).map(sub => {
              const statusColors = {
                Pendente: { cor: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                Ativa: { cor: '#34d399', bg: 'rgba(52,211,153,0.1)' },
                Rejeitada: { cor: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                Cancelada: { cor: '#6b7280', bg: 'rgba(107,114,128,0.1)' }
              };
              const sc = statusColors[sub.status] || statusColors.Pendente;

              // Aprovação/rejeição via Supabase RPC (ver handleApprovePayment / handleRejectPayment)
              const compUrl = sub.comprovativo_url || sub.comprovativoUrl;
              const compNome = sub.comprovativo_nome || sub.comprovativoNome || '';
              const isImage = compUrl && (compNome.match(/\.(png|jpg|jpeg)$/i) || compUrl.match(/\.(png|jpg|jpeg)(\?|$)/i));

              return (
                <div key={sub.id} style={{
                  background: 'rgba(255,255,255,0.02)', border: `1px solid ${sc.cor}33`,
                  borderRadius: '12px', padding: '14px 16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {sub.userName || sub.userEmail}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{sub.userEmail}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Plano {sub.plano} ({sub.periodo}) · {new Date(sub.data_pedido || sub.dataPedido).toLocaleDateString('pt-PT')}
                      </div>
                      <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                        Valor: <strong style={{ color: 'var(--color-accent)' }}>{Number(sub.valor || 0).toLocaleString('pt-AO')} Kz</strong>
                        {compNome && (
                          <span style={{ marginLeft: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                            <FileText size={11} /> {compNome}
                          </span>
                        )}
                      </div>

                      {/* Inline image preview of comprovativo */}
                      {isImage && compUrl && (
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>📋 Comprovativo:</div>
                          <img
                            src={compUrl}
                            alt="comprovativo"
                            onClick={() => setPreviewImg(compUrl)}
                            style={{
                              maxWidth: '220px', maxHeight: '120px', borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.12)', objectFit: 'cover',
                              cursor: 'zoom-in', transition: 'transform 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          />
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>Clique para ampliar</div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        background: sc.bg, color: sc.cor, border: `1px solid ${sc.cor}44`,
                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700
                      }}>{sub.status}</span>

                      {compUrl && (
                        <a href={compUrl} target="_blank" rel="noopener noreferrer" style={{
                          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                          color: 'var(--color-accent)', borderRadius: '6px', padding: '5px 10px',
                          cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none'
                        }}>
                          <Eye size={12} /> Abrir Original
                        </a>
                      )}

                      {sub.status === 'Pendente' && (
                        <>
                          <button onClick={() => handleApprovePayment(sub.id, null)} style={{
                            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
                            color: '#34d399', borderRadius: '6px', padding: '5px 12px',
                            cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem',
                            display: 'flex', alignItems: 'center', gap: '4px'
                          }}>
                            <CheckCircle size={13} /> Aprovar
                          </button>
                          <button onClick={() => handleRejectPayment(sub.id, null, 'Comprovativo não válido.')} style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            color: '#ef4444', borderRadius: '6px', padding: '5px 12px',
                            cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem',
                            display: 'flex', alignItems: 'center', gap: '4px'
                          }}>
                            <X size={13} /> Rejeitar
                          </button>
                        </>
                      )}

                      {/* Revoke active plan button */}
                      {sub.status === 'Ativa' && (
                        <button onClick={() => handleRevokePlan(sub)} style={{
                          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                          color: '#f59e0b', borderRadius: '6px', padding: '5px 12px',
                          cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem',
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                          <Lock size={13} /> Revogar Plano
                        </button>
                      )}
                    </div>
                  </div>
                  {sub.observacao && (
                    <div style={{
                      marginTop: '8px', padding: '6px 10px', background: 'rgba(239,68,68,0.05)',
                      borderRadius: '6px', fontSize: '0.75rem', color: 'var(--color-error)',
                      borderLeft: '3px solid var(--color-error)'
                    }}>
                      {sub.observacao}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid for Invite Codes and Audit Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        
        {/* INVITE CODES PANEL */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--color-accent)' }}>
            <Key size={20} />
            <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Códigos de Convite (Registo)</h4>
          </div>

          <form onSubmit={handleAddInviteCodeSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input
              type="text"
              placeholder="Ex: PROMO2026"
              value={newInviteCode}
              onChange={e => setNewInviteCode(e.target.value)}
              className="form-input"
              style={{ flex: 1, textTransform: 'uppercase' }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={15} /> Adicionar
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {(!inviteCodes || inviteCodes.length === 0) ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '100%', textAlign: 'center', padding: '12px' }}>
                Nenhum código de convite ativo.
              </div>
            ) : (
              inviteCodes.map(code => (
                <div key={code} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                  padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem'
                }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{code}</strong>
                  <button
                    onClick={() => handleRevokeInviteCode(code)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                    title="Revogar Código"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AUDIT LOGS PANEL */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyStyle: 'space-between', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-error)' }}>
              <ShieldAlert size={20} />
              <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Auditoria de Logs de Acesso</h4>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {filteredLogs.length} registos
            </span>
          </div>

          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar nos logs (IP, Email, Ação)..."
              value={logSearch}
              onChange={e => setLogSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '30px', fontSize: '0.8rem', paddingY: '6px' }}
            />
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: '6px',
            maxHeight: '180px', overflowY: 'auto', paddingRight: '4px'
          }}>
            {filteredLogs.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                Nenhum log de auditoria encontrado.
              </div>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id} style={{
                  padding: '8px 10px', borderRadius: '6px',
                  background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)',
                  fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{log.email.split('@')[0]}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{log.data}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>{log.acao}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textAlign: 'right' }}>IP: {log.ip}</div>
                </div>
              ))
            )}
          </div>
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

      {/* CREATE USER MODAL */}
      {isCreateUserOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '16px'
        }} className="animate-fade-in">
          
          <div className="glass-panel animate-scale-in" style={{
            background: 'var(--bg-secondary)', width: '100%', maxWidth: '440px',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Criar Novo Utilizador
            </h3>

            <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nome Completo *</label>
                <input type="text" value={createNome} onChange={e => setCreateNome(e.target.value)}
                  placeholder="Nome do utilizador" className="form-input" required />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">E-mail *</label>
                <input type="email" value={createEmail} onChange={e => setCreateEmail(e.target.value)}
                  placeholder="utilizador@financasapp.com" className="form-input" required />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Senha Inicial *</label>
                <input type="password" value={createSenha} onChange={e => setCreateSenha(e.target.value)}
                  placeholder="Min. 6 caracteres" className="form-input" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Role</label>
                  <select value={createRole} onChange={e => setCreateRole(e.target.value)} className="form-select">
                    <option value="User">User (Utilizador)</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Plano</label>
                  <select value={createPlano} onChange={e => setCreatePlano(e.target.value)} className="form-select">
                    {PLANOS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsCreateUserOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Criar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMAGE LIGHTBOX MODAL */}
      {previewImg && (
        <div
          onClick={() => setPreviewImg(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', cursor: 'zoom-out'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={previewImg}
              alt="Comprovativo de pagamento"
              style={{
                maxWidth: '100%', maxHeight: '85vh',
                borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                border: '2px solid rgba(255,255,255,0.1)'
              }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); setPreviewImg(null); }}
              style={{
                position: 'absolute', top: '-12px', right: '-12px',
                background: '#ef4444', border: 'none', color: '#fff',
                width: '32px', height: '32px', borderRadius: '50%',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}
            >
              <X size={16} />
            </button>
            <div style={{ textAlign: 'center', marginTop: '12px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
              Clique fora da imagem para fechar · <a href={previewImg} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>Abrir em tamanho original</a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
