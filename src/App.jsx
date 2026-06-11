import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Receipt, Tags, FileBarChart, Settings,
  Moon, Sun, Wifi, WifiOff, Sparkles, LogOut, Crown, Shield,
  Menu, X, CreditCard, AlertTriangle, Lock, Star, Banknote
} from 'lucide-react';

// Views
import DashboardView from './components/DashboardView';
import LancamentosView from './components/LancamentosView';
import CategoriasView from './components/CategoriasView';
import RelatoriosView from './components/RelatoriosView';
import CoachView from './components/CoachView';
import ConfiguracoesView from './components/ConfiguracoesView';
import AuthView from './components/AuthView';
import SuperAdminView from './components/SuperAdminView';

// ─────────────────────────── SEED DATA ──────────────────────────────────────
const INITIAL_CATEGORIES = [
  { CategoriaID: 'C2', Nome: 'Salário', Tipo: 'Receita', CategoriaMaeID: '', Subtipo: 'Nenhum', Alvo: 0, Descricao: 'Rendimentos mensais principais', Ativa: true },
  { CategoriaID: 'C1', Nome: 'Alimentação', Tipo: 'Despesa', CategoriaMaeID: 'C2', Subtipo: 'Nenhum', Alvo: 0, Descricao: 'Supermercado e refeições (depende do Salário)', Ativa: true },
  { CategoriaID: 'C3', Nome: 'Transporte', Tipo: 'Despesa', CategoriaMaeID: 'C2', Subtipo: 'Nenhum', Alvo: 0, Descricao: 'Combustível e táxi (depende do Salário)', Ativa: true },
  { CategoriaID: 'C4', Nome: 'Lazer', Tipo: 'Despesa', CategoriaMaeID: 'C2', Subtipo: 'Nenhum', Alvo: 0, Descricao: 'Cinema e saídas (depende do Salário)', Ativa: true },
  { CategoriaID: 'C5', Nome: 'Fundo Telefone', Tipo: 'Receita', CategoriaMaeID: '', Subtipo: 'Investimento', Alvo: 150000, Descricao: 'Compra de celular planejado', Ativa: true },
  { CategoriaID: 'C6', Nome: 'Reserva Poupança', Tipo: 'Despesa', CategoriaMaeID: '', Subtipo: 'Poupanca', Alvo: 200000, Descricao: 'Reserva para emergências', Ativa: true },
  { CategoriaID: 'C7', Nome: 'Dívida com João', Tipo: 'Despesa', CategoriaMaeID: '', Subtipo: 'Divida', Alvo: 0, Descricao: 'Dinheiro que devo para o João', Ativa: true },
  { CategoriaID: 'C8', Nome: 'Empréstimo ao Pedro', Tipo: 'Receita', CategoriaMaeID: '', Subtipo: 'Emprestimo', Alvo: 0, Descricao: 'Dinheiro que emprestei para o Pedro', Ativa: true }
];

const INITIAL_LAUNCHES = [
  { LancID: 'L1', Data: '2026-05-01', CategoriaID: 'C2', Tipo: 'Entrada', Valor: 500000, Descricao: 'Salário de Maio', Conta: 'Banco', Referencia: 'MAIO-01', CriadoPor: 'superadmin@financasapp.com', EditadoEm: '2026-05-01 09:00:00', Status: 'confirmado' },
  { LancID: 'L2', Data: '2026-05-01', CategoriaID: 'C1', Tipo: 'Entrada', Valor: 40000, Descricao: 'Alocação Salário -> Alimentação', Conta: 'Banco', Referencia: 'ALOC-01', CriadoPor: 'superadmin@financasapp.com', EditadoEm: '2026-05-01 09:10:00', Status: 'confirmado' },
  { LancID: 'L3', Data: '2026-05-01', CategoriaID: 'C3', Tipo: 'Entrada', Valor: 15000, Descricao: 'Alocação Salário -> Transporte', Conta: 'Banco', Referencia: 'ALOC-02', CriadoPor: 'superadmin@financasapp.com', EditadoEm: '2026-05-01 09:15:00', Status: 'confirmado' },
  { LancID: 'L4', Data: '2026-05-01', CategoriaID: 'C4', Tipo: 'Entrada', Valor: 20000, Descricao: 'Alocação Salário -> Lazer', Conta: 'Banco', Referencia: 'ALOC-03', CriadoPor: 'superadmin@financasapp.com', EditadoEm: '2026-05-01 09:20:00', Status: 'confirmado' },
  { LancID: 'L5', Data: '2026-05-02', CategoriaID: 'C1', Tipo: 'Saida', Valor: 25000, Descricao: 'Compras Supermercado', Conta: 'Cartão de Crédito', Referencia: 'SUP-01', CriadoPor: 'superadmin@financasapp.com', EditadoEm: '2026-05-02 10:00:00', Status: 'confirmado' },
];

const INITIAL_USERS = [
  {
    Email: 'superadmin@financasapp.com',
    Nome: 'SuperAdmin',
    Senha: 'admin123',
    Telefone: '',
    Pais: 'Angola',
    Role: 'SuperAdmin',
    Ativo: true,
    Plano: 'Enterprise',
    DataCadastro: '2026-01-01',
    UltimoAcesso: new Date().toISOString().split('T')[0],
    LancamentosUsados: 0
  }
];

const INITIAL_BANK = {
  banco: '',
  titular: '',
  iban: '',
  conta: '',
  telefone: '',
  referencia: '',
  precoMensal: '2000',
  precoAnual: '20000'
};

// ─────────────────────────── UPGRADE WALL ────────────────────────────────────
function UpgradeWall({ bankInfo, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '480px', width: '100%', padding: '32px 24px',
        display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
          width: '64px', height: '64px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto'
        }}>
          <Star size={32} style={{ color: '#1a1a1a' }} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Faça Upgrade para Pro</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
          O seu plano gratuito atingiu o limite. Para continuar a usar todas as funcionalidades do <strong>Finança ao Ponto</strong>, faça o upgrade para o plano <strong style={{ color: 'var(--color-accent)' }}>Pro</strong>.
        </p>

        {/* Pricing */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{
            padding: '16px', borderRadius: '12px',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Mensal</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-accent)' }}>
              {Number(bankInfo?.precoMensal || 2000).toLocaleString('pt-AO')}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Kz/mês</div>
          </div>
          <div style={{
            padding: '16px', borderRadius: '12px',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute', top: '-8px', right: '12px',
              background: '#f59e0b', color: '#1a1a1a', fontSize: '0.65rem',
              fontWeight: 800, padding: '2px 8px', borderRadius: '10px'
            }}>POUPA 17%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Anual</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>
              {Number(bankInfo?.precoAnual || 20000).toLocaleString('pt-AO')}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Kz/ano</div>
          </div>
        </div>

        {/* Bank info for payment */}
        {bankInfo?.banco && (
          <div style={{
            background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: '12px', padding: '16px', textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--color-success)' }}>
              <Banknote size={16} />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Dados para Pagamento</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
              {bankInfo.banco && <div><span style={{ color: 'var(--text-muted)' }}>Banco:</span> <strong>{bankInfo.banco}</strong></div>}
              {bankInfo.titular && <div><span style={{ color: 'var(--text-muted)' }}>Titular:</span> <strong>{bankInfo.titular}</strong></div>}
              {bankInfo.iban && <div><span style={{ color: 'var(--text-muted)' }}>IBAN:</span> <strong style={{ fontFamily: 'monospace' }}>{bankInfo.iban}</strong></div>}
              {bankInfo.conta && <div><span style={{ color: 'var(--text-muted)' }}>Nº Conta:</span> <strong style={{ fontFamily: 'monospace' }}>{bankInfo.conta}</strong></div>}
              {bankInfo.telefone && <div><span style={{ color: 'var(--text-muted)' }}>Multicaixa Express:</span> <strong>{bankInfo.telefone}</strong></div>}
              {bankInfo.referencia && <div><span style={{ color: 'var(--text-muted)' }}>Referência:</span> <strong>{bankInfo.referencia}</strong></div>}
            </div>
          </div>
        )}

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Após o pagamento, envie o comprovativo para o administrador para activação imediata do plano Pro.
        </p>

        <button onClick={onClose} className="btn btn-secondary" style={{ width: '100%' }}>
          Voltar (Plano Gratuito)
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── MAIN APP ───────────────────────────────────────
export default function App() {
  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('financas_is_auth') === 'true');
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('financas_users_v4');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [currentUserEmail, setCurrentUserEmail] = useState(() => localStorage.getItem('financas_user_email_v4') || '');
  const [currentRole, setCurrentRole] = useState(() => localStorage.getItem('financas_user_role_v4') || '');

  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  // Data
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('financas_categories_v4');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  const [launches, setLaunches] = useState(() => {
    const saved = localStorage.getItem('financas_launches_v4');
    return saved ? JSON.parse(saved) : INITIAL_LAUNCHES;
  });

  // Bank info (SuperAdmin configures)
  const [bankInfo, setBankInfo] = useState(() => {
    const saved = localStorage.getItem('financas_bank_v4');
    return saved ? JSON.parse(saved) : INITIAL_BANK;
  });

  // UI
  const [isOffline, setIsOffline] = useState(false);
  const [lowBalanceLimit, setLowBalanceLimit] = useState(5000);
  const [theme, setTheme] = useState('dark');
  const [toastMessage, setToastMessage] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showUpgradeWall, setShowUpgradeWall] = useState(false);

  const currentUser = users.find(u => u.Email === currentUserEmail);
  const isSuperAdmin = currentRole === 'SuperAdmin';
  const isProUser = currentUser?.Plano && currentUser.Plano !== 'Gratuito';

  // Persist
  useEffect(() => { localStorage.setItem('financas_users_v4', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('financas_categories_v4', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('financas_launches_v4', JSON.stringify(launches)); }, [launches]);
  useEffect(() => { localStorage.setItem('financas_bank_v4', JSON.stringify(bankInfo)); }, [bankInfo]);
  useEffect(() => {
    localStorage.setItem('financas_is_auth', isAuthenticated ? 'true' : 'false');
    localStorage.setItem('financas_user_email_v4', currentUserEmail);
    localStorage.setItem('financas_user_role_v4', currentRole);
  }, [isAuthenticated, currentUserEmail, currentRole]);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (toastMessage) { const t = setTimeout(() => setToastMessage(null), 4500); return () => clearTimeout(t); }
  }, [toastMessage]);

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  // Close menu when tab changes
  useEffect(() => { setMenuOpen(false); }, [activeTab]);

  // Category Balance
  const getCategoryBalance = (catId, excludeLaunchId = null) => {
    const cat = categories.find(c => c.CategoriaID === catId);
    if (!cat) return 0;
    const userLaunches = launches.filter(l =>
      (isSuperAdmin || currentRole === 'Admin' || l.CriadoPor === currentUserEmail) &&
      l.LancID !== excludeLaunchId
    );
    const totalEntradas = userLaunches.filter(l => l.CategoriaID === catId && l.Tipo === 'Entrada').reduce((sum, l) => sum + Number(l.Valor), 0);
    const totalSaidas = userLaunches.filter(l => l.CategoriaID === catId && l.Tipo === 'Saida').reduce((sum, l) => sum + Number(l.Valor), 0);
    if (!cat.CategoriaMaeID) {
      const childIds = categories.filter(c => c.CategoriaMaeID === catId).map(c => c.CategoriaID);
      const childAllocations = userLaunches
        .filter(l => childIds.includes(l.CategoriaID) && l.Tipo === 'Entrada')
        .reduce((sum, l) => sum + Number(l.Valor), 0);
      return totalEntradas - totalSaidas - childAllocations;
    }
    return totalEntradas - totalSaidas;
  };

  // Auth
  const handleLogin = (user) => {
    setUsers(prev => prev.map(u => u.Email === user.Email ? { ...u, UltimoAcesso: new Date().toISOString().split('T')[0] } : u));
    setCurrentUserEmail(user.Email);
    setCurrentRole(user.Role);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
    setToastMessage({ type: 'success', text: `Bem-vindo(a), ${user.Nome || user.Email.split('@')[0]}!` });
  };
  const handleRegister = (newUser) => { setUsers(prev => [...prev, newUser]); };
  const handleLogout = () => {
    setIsAuthenticated(false); setCurrentUserEmail(''); setCurrentRole('');
    setActiveTab('dashboard'); setMenuOpen(false);
    setToastMessage({ type: 'success', text: 'Sessão encerrada com segurança.' });
  };

  // Launches
  const handleAddLaunch = (newLaunch) => {
    // Check free plan limit (50 per month)
    if (!isSuperAdmin && !isProUser) {
      const thisMonth = new Date().toISOString().slice(0, 7);
      const monthLaunches = launches.filter(l => l.CriadoPor === currentUserEmail && l.Data?.startsWith(thisMonth)).length;
      if (monthLaunches >= 50) {
        setShowUpgradeWall(true);
        return;
      }
    }
    if (isOffline) {
      setLaunches(prev => [newLaunch, ...prev]);
      setOfflineQueue(prev => [...prev, newLaunch]);
      setToastMessage({ type: 'warning', text: 'Salvo localmente (offline).' });
    } else {
      setLaunches(prev => [newLaunch, ...prev]);
      setToastMessage({ type: 'success', text: 'Lançamento registrado com sucesso!' });
    }
  };
  const handleEditLaunch = (updated) => {
    setLaunches(prev => prev.map(l => l.LancID === updated.LancID ? updated : l));
    setToastMessage({ type: 'success', text: 'Lançamento atualizado!' });
  };
  const handleDeleteLaunch = (id) => {
    setLaunches(prev => prev.filter(l => l.LancID !== id));
    setToastMessage({ type: 'success', text: 'Lançamento removido!' });
  };

  // Categories
  const handleAddCategory = (newCat) => {
    if (categories.some(c => c.CategoriaID === newCat.CategoriaID || c.Nome.toLowerCase() === newCat.Nome.toLowerCase())) {
      alert('Já existe uma categoria com este ID ou Nome.');
      return false;
    }
    setCategories(prev => [...prev, newCat]);
    setToastMessage({ type: 'success', text: `Categoria "${newCat.Nome}" criada!` });
    return true;
  };

  // Offline
  const handleOfflineToggle = () => {
    setIsOffline(prev => {
      const next = !prev;
      if (!next && offlineQueue.length > 0) {
        setToastMessage({ type: 'success', text: `Reconectado! ${offlineQueue.length} item(s) sincronizado(s).` });
        setOfflineQueue([]);
      }
      return next;
    });
  };

  // Reset
  const handleResetData = () => {
    ['financas_categories_v4', 'financas_launches_v4', 'financas_users_v4', 'financas_bank_v4'].forEach(k => localStorage.removeItem(k));
    setCategories(INITIAL_CATEGORIES); setLaunches(INITIAL_LAUNCHES);
    setUsers(INITIAL_USERS); setBankInfo(INITIAL_BANK); setOfflineQueue([]);
    handleLogout();
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleInstallApp = () => {
    if (!installPrompt) { alert('Siga as instruções de instalação em Ajustes!'); return; }
    installPrompt.prompt();
    installPrompt.userChoice.then(r => { if (r.outcome === 'accepted') setInstallPrompt(null); });
  };

  // Guard
  if (!isAuthenticated) {
    return <AuthView users={users} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  // Tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'superadmin':
        return isSuperAdmin
          ? <SuperAdminView users={users} setUsers={setUsers} currentUserEmail={currentUserEmail}
              onToast={setToastMessage} launches={launches} bankInfo={bankInfo} setBankInfo={setBankInfo} />
          : <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-error)' }}>⛔ Acesso negado.</div>;
      case 'dashboard':
        return <DashboardView launches={launches} categories={categories} role={currentRole}
          userEmail={currentUserEmail} onAddLaunchClick={() => setActiveTab('lancamentos')} />;
      case 'lancamentos':
        return <LancamentosView launches={launches} categories={categories} role={currentRole}
          userEmail={currentUserEmail} onAddLaunch={handleAddLaunch} onEditLaunch={handleEditLaunch}
          onDeleteLaunch={handleDeleteLaunch} getCategoryBalance={getCategoryBalance} />;
      case 'categorias':
        return <CategoriasView categories={categories} launches={launches} role={currentRole}
          userEmail={currentUserEmail} onAddCategory={handleAddCategory} />;
      case 'relatorios':
        return <RelatoriosView launches={launches} categories={categories} role={currentRole} userEmail={currentUserEmail} />;
      case 'coach':
        return <CoachView launches={launches} categories={categories} role={currentRole} userEmail={currentUserEmail} />;
      case 'configuracoes':
        return <ConfiguracoesView role={currentRole} userEmail={currentUserEmail} currentUser={currentUser}
          users={users} setUsers={setUsers} isOffline={isOffline} lowBalanceLimit={lowBalanceLimit}
          installPrompt={installPrompt} onRoleChange={setCurrentRole} onUserEmailChange={setCurrentUserEmail}
          onOfflineToggle={handleOfflineToggle} onLowBalanceLimitChange={setLowBalanceLimit}
          onResetData={handleResetData} onInstallApp={handleInstallApp} onToast={setToastMessage}
          bankInfo={bankInfo} onShowUpgrade={() => setShowUpgradeWall(true)} />;
      default: return null;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { id: 'lancamentos', icon: <Receipt size={18} />, label: 'Lançamentos' },
    { id: 'categorias', icon: <Tags size={18} />, label: 'Categorias' },
    { id: 'relatorios', icon: <FileBarChart size={18} />, label: 'Relatórios' },
    { id: 'coach', icon: <Sparkles size={18} />, label: 'Coach IA' },
    ...(isSuperAdmin ? [{ id: 'superadmin', icon: <Crown size={18} />, label: 'Painel Admin', gold: true }] : []),
    { id: 'configuracoes', icon: <Settings size={18} />, label: 'Ajustes' },
  ];

  const roleBadgeColor = currentRole === 'SuperAdmin' ? '#f59e0b' : currentRole === 'Admin' ? '#a78bfa' : 'var(--color-accent)';

  return (
    <div className="app-container">

      {/* Upgrade Wall Modal */}
      {showUpgradeWall && <UpgradeWall bankInfo={bankInfo} onClose={() => setShowUpgradeWall(false)} />}

      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 300,
          background: toastMessage.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
          color: toastMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-warning)',
          border: `1px solid ${toastMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-warning)'}`,
          padding: '12px 18px', borderRadius: '10px', boxShadow: 'var(--shadow-lg)',
          fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
          maxWidth: '340px'
        }} className="animate-slide-up">
          {toastMessage.type === 'success' ? '✓' : '⚠️'} {toastMessage.text}
        </div>
      )}

      {/* HEADER */}
      <header className="glass-panel" style={{
        padding: '10px 16px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', gap: '8px',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        {/* Left: Logo + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, #a5b4fc 100%)',
            width: '30px', height: '30px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#fff', fontSize: '1rem'
          }}>F</div>
          <h1 style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Finança ao Ponto
          </h1>
        </div>

        {/* Right: Badges + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Offline badge */}
          <div onClick={handleOfflineToggle} style={{
            display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
            padding: '4px 8px', borderRadius: '16px', fontSize: '0.68rem', fontWeight: 700,
            backgroundColor: isOffline ? 'var(--color-error-bg)' : 'var(--color-success-bg)',
            color: isOffline ? 'var(--color-error)' : 'var(--color-success)',
            border: `1px solid ${isOffline ? 'var(--color-error)' : 'var(--color-success)'}`
          }}>
            {isOffline ? <WifiOff size={11} /> : <Wifi size={11} />}
            {isOffline ? 'OFF' : 'ON'}
          </div>

          {/* Plan badge (non-admin) */}
          {!isSuperAdmin && (
            <div onClick={() => setShowUpgradeWall(true)} style={{
              padding: '4px 8px', borderRadius: '16px', fontSize: '0.68rem', fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: isProUser ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
              color: isProUser ? 'var(--color-accent)' : 'var(--text-muted)',
              border: `1px solid ${isProUser ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'}`,
              display: 'flex', alignItems: 'center', gap: '3px'
            }}>
              {isProUser ? <Star size={10} /> : <Lock size={10} />}
              {currentUser?.Plano || 'Gratuito'}
            </div>
          )}

          {/* User name (compact) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '0.72rem', fontWeight: 700, color: roleBadgeColor
          }}>
            {currentRole === 'SuperAdmin' && <Crown size={12} style={{ color: '#f59e0b' }} />}
            {currentUser?.Nome?.split(' ')[0] || currentUserEmail.split('@')[0]}
          </div>

          {/* Theme */}
          <button onClick={toggleTheme} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
            color: 'var(--text-primary)', padding: '6px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </button>

          {/* Hamburger Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            background: menuOpen ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${menuOpen ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'}`,
            color: menuOpen ? 'var(--color-accent)' : 'var(--text-primary)',
            padding: '6px', borderRadius: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
          }}>
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* DROPDOWN MENU (replaces bottom nav) */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div onClick={() => setMenuOpen(false)} style={{
            position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.4)'
          }} />
          {/* Menu Panel */}
          <div className="glass-panel animate-fade-in" style={{
            position: 'fixed', top: '56px', right: '12px', zIndex: 95,
            padding: '8px', borderRadius: '14px', minWidth: '200px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', gap: '2px'
          }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMenuOpen(false); }}
                style={{
                  background: activeTab === item.id
                    ? (item.gold ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)')
                    : 'transparent',
                  border: 'none', cursor: 'pointer', padding: '10px 14px',
                  borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px',
                  color: activeTab === item.id
                    ? (item.gold ? '#f59e0b' : 'var(--color-accent)')
                    : 'var(--text-secondary)',
                  fontWeight: activeTab === item.id ? 700 : 500,
                  fontSize: '0.88rem', transition: 'all 0.15s', width: '100%', textAlign: 'left'
                }}
              >
                <span style={{
                  color: activeTab === item.id
                    ? (item.gold ? '#f59e0b' : 'var(--color-accent)')
                    : 'var(--text-muted)'
                }}>{item.icon}</span>
                {item.label}
                {item.gold && (
                  <span style={{
                    marginLeft: 'auto', width: '7px', height: '7px', borderRadius: '50%',
                    background: '#f59e0b'
                  }} />
                )}
              </button>
            ))}

            {/* Logout inside menu */}
            <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
            <button onClick={handleLogout} style={{
              background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer',
              padding: '10px 14px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '10px',
              color: 'var(--color-error)', fontWeight: 600, fontSize: '0.88rem', width: '100%'
            }}>
              <LogOut size={18} /> Sair da Conta
            </button>
          </div>
        </>
      )}

      {/* MAIN CONTENT — no padding bottom needed since no bottom nav */}
      <main className="content-area" style={{ paddingBottom: '24px' }}>
        {renderTabContent()}
      </main>

    </div>
  );
}
