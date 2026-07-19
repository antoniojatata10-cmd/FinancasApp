import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Receipt, Tags, FileBarChart, Settings,
  Moon, Sun, Wifi, WifiOff, Sparkles, LogOut, Crown, Shield,
  Menu, X, CreditCard, AlertTriangle, Lock, Star, Banknote,
  TrendingUp, Building2, GraduationCap, BookOpen, Cloud, RefreshCw,
  MessageCircle, Bell, BellRing, CheckCheck, Target, ArrowLeftRight
} from 'lucide-react';

// views
import DashboardView from './components/DashboardView';
import LancamentosView from './components/LancamentosView';
import CategoriasView from './components/CategoriasView';
import RelatoriosView from './components/RelatoriosView';
import CoachView from './components/CoachView';
import ConfiguracoesView from './components/ConfiguracoesView';
import AuthView from './components/AuthView';
import LandingView from './components/LandingView';
import SuperAdminView from './components/SuperAdminView';
import AcademiaView from './components/AcademiaView';
import SubscriptionsView from './components/SubscriptionsView';
import InvestimentosView from './components/InvestimentosView';
import EmpresaView from './components/EmpresaView';
import ChatView from './components/ChatView';
import MetasView from './components/MetasView';
import DividasView from './components/DividasView';
import CartoesView from './components/CartoesView';
import DashboardCardView from './components/DashboardCardView';

// Supabase client
import { supabase } from './supabaseClient';

// ─────────────────────────── UPGRADE WALL ────────────────────────────────────
function UpgradeWall({ bankInfo, onClose, onGoToSubscriptions }) {
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
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Mensal</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-accent)' }}>
              {Number(bankInfo?.precoMensal || 2000).toLocaleString('pt-AO')}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Kz/mês</div>
          </div>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-8px', right: '12px', background: '#f59e0b', color: '#1a1a1a', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>POUPA 17%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Anual</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>
              {Number(bankInfo?.precoAnual || 20000).toLocaleString('pt-AO')}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Kz/ano</div>
          </div>
        </div>

        {bankInfo?.banco && (
          <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'left' }}>
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

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Voltar</button>
          <button onClick={() => { onClose(); if (onGoToSubscriptions) onGoToSubscriptions(); }} className="btn btn-primary" style={{ flex: 1 }}>Ir para Subscrições</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── PREMIUM LOCK SCREEN ─────────────────────────────
function PremiumLockScreen({ tabName, bankInfo, onGoToSubscriptions }) {
  const featureInfo = {
    metas: { icon: '🎯', nome: 'Metas Financeiras', desc: 'Defina e acompanhe objectivos financeiros com projetores de crescimento.' },
    dividas: { icon: '🔄', nome: 'Gestão de Dívidas', desc: 'Controle dívidas que tem e que lhe devem com alertas inteligentes.' },
    coach: { icon: '🤖', nome: 'Coach IA', desc: 'Consultor financeiro em tempo real com análise dos seus dados.' },
    academia: { icon: '🎓', nome: 'Academia Financeira', desc: '8 níveis de formação financeira com quizzes e certificado.' },
    investimentos: { icon: '📈', nome: 'Área de Investimentos', desc: 'Taxas de câmbio reais, perfil de investidor e simulações.' },
    empresa: { icon: '🏢', nome: 'Módulo Empresa', desc: 'Gestão financeira empresarial, DRE, fluxo de caixa e tesouraria.' }
  };
  const info = featureInfo[tabName] || { icon: '⭐', nome: tabName, desc: 'Funcionalidade exclusiva do plano Pro.' };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', padding: '16px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '480px', width: '100%', padding: '36px 28px',
        display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center',
        border: '1px solid rgba(245,158,11,0.2)',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.04), rgba(99,102,241,0.04))'
      }}>
        <div style={{ fontSize: '3rem' }}>{info.icon}</div>

        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '20px', padding: '4px 12px', marginBottom: '12px',
            color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700
          }}>
            <Star size={12} /> Exclusivo Pro
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>{info.nome}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {info.desc}
          </p>
        </div>

        <div style={{
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: '12px', padding: '16px'
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>PLANO GRATUITO vs PRO</div>
          {[
            ['Lançamentos', '50/mês', 'Ilimitados'],
            ['Categorias', 'Básicas', 'Ilimitadas'],
            ['Metas', '❌', '✅ Objectivos'],
            ['Dívidas', '❌', '✅ Controlo total'],
            ['Coach IA', '❌', '✅ Chat em tempo real'],
            ['Academia', '❌', '✅ 8 níveis + certificado'],
            ['Investimentos', '❌', '✅ Dados reais'],
            ['Empresa', '❌', '✅ Módulo completo'],
          ].map(([feat, free, pro], i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: '6px', fontSize: '0.78rem', padding: '6px 0',
              borderBottom: i < 5 ? '1px solid var(--border-color)' : 'none'
            }}>
              <span style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>{feat}</span>
              <span style={{ color: 'var(--text-muted)', textAlign: 'center' }}>{free}</span>
              <span style={{ color: 'var(--color-success)', textAlign: 'right', fontWeight: 600 }}>{pro}</span>
            </div>
          ))}
        </div>

        {bankInfo?.precoMensal && (
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-accent)' }}>
            Apenas {Number(bankInfo.precoMensal).toLocaleString('pt-AO')} Kz/mês
          </div>
        )}

        <button onClick={onGoToSubscriptions} className="btn btn-primary" style={{
          padding: '14px', fontSize: '1rem', fontWeight: 700,
          background: 'linear-gradient(135deg, #f59e0b, #f97316)'
        }}>
          <Star size={16} style={{ marginRight: '8px' }} />
          Aderir ao Plano Pro
        </button>

        {bankInfo?.banco && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Pague via Multicaixa Express (<strong>{bankInfo.telefone}</strong>) ou transferência bancária e envie o comprovativo ao administrador.
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────── MAIN APP ───────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('landing'); // 'landing' | 'login' | 'register'

  // Data State
  const [launches, setLaunches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cards, setCards] = useState([]);

  // Global App State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [showUpgradeWall, setShowUpgradeWall] = useState(false);

  // Fallbacks for missing admin features
  const [users, setUsers] = useState([]);
  const [bankInfo, setBankInfo] = useState({});
  const [subscriptions, setSubscriptions] = useState([]);
  const [inviteCodes, setInviteCodes] = useState(['AFA2026', 'FINPRO2026']);
  const [auditLogs, setAuditLogs] = useState([]);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      else {
        setCurrentUser(null);
        setLaunches([]);
        setCategories([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    setLoading(true);

    try {
      // Trigger plans expiration check — must complete BEFORE fetching profile
      // so that expired plans are reverted to Gratuito before we read the user data
      await supabase.rpc('expire_plans').then(() => {}).catch(err => {
        console.error("Error expiring plans:", err);
      });

      // Fetch Profile + auth email in parallel
      const [{ data: profile }, { data: { user: authUser } }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.auth.getUser()
      ]);

      console.log("AUTH USER:", authUser?.id, authUser?.email);
      console.log("PROFILE:", profile);

      let userProfile = profile;
      if (!userProfile && authUser) {
        console.log("Profile missing, creating default profile for:", userId);
        const defaultName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Utilizador';
        const { data: newProfile, error: insertErr } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            full_name: defaultName,
            phone: authUser.user_metadata?.phone || '',
            country: authUser.user_metadata?.country || 'Angola',
            role: 'user',
            plan: 'Gratuito',
            is_active: true
          }])
          .select()
          .single();
        
        if (!insertErr && newProfile) {
          userProfile = newProfile;
        } else {
          console.error("Error creating default profile:", insertErr);
        }
      }

      if (userProfile && userProfile.is_active === false) {
        await supabase.auth.signOut({ scope: 'local' });
        return;
      }

      const mappedUser = userProfile ? {
        id: userProfile.id,
        Email: authUser?.email || '',
        Nome: userProfile.full_name,
        Role: userProfile.role?.toLowerCase() || 'user',
        Plano: userProfile.plan,
        PlanExpiresAt: userProfile.plan_expires_at,
        Ativo: userProfile.is_active,
        Pais: userProfile.country,
        Telefone: userProfile.phone,
        AvatarUrl: userProfile.avatar_url
      } : { Role: 'user', Plano: 'Gratuito', Email: authUser?.email || '' };

      setCurrentUser(mappedUser);

      // Load admin_settings (bank info) — readable by all authenticated users
      const { data: adminSettingsRows } = await supabase
        .from('admin_settings')
        .select('key, value');

      if (adminSettingsRows) {
        const cfg = {};
        adminSettingsRows.forEach(row => { cfg[row.key] = row.value; });
        setBankInfo(cfg);
      }

      // If admin (or we want to force admin features for testing): also load all users
      if (userProfile?.role?.toLowerCase() === 'admin' || mappedUser.Role === 'admin') {
        const { data: allProfiles } = await supabase
          .from('admin_users_view')
          .select('*')
          .order('created_at', { ascending: false });

        if (allProfiles) {
          setUsers(allProfiles.map(u => ({
            id: u.id,
            Email: u.email || '',
            Nome: u.full_name || '',
            Role: u.role?.toLowerCase() || 'user',
            Plano: u.plan,
            PlanExpiresAt: u.plan_expires_at,
            Ativo: u.is_active,
            Pais: u.country,
            Telefone: u.phone,
            totalTransactions: u.total_transactions,
            lastSignIn: u.last_sign_in_at
          })));
        }

        // Also load all subscriptions/payments for admin
        const { data: allPayments } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });

        if (allPayments) setSubscriptions(allPayments);
      } else {
        // Normal user: load own payments
        const { data: ownPayments } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (ownPayments) setSubscriptions(ownPayments);
      }

      // Fetch categories & transactions concurrently
      await loadDataFromSupabase(userId, userProfile?.role?.toLowerCase() || 'user');

    } catch (err) {
      console.error('Error fetching user data', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDataFromSupabase = async (userId, role) => {
    try {
      // Cards
      const cardsQuery = supabase.from('cards').select('*').eq('user_id', userId);
      const { data: cardData } = await cardsQuery;
      if (cardData) setCards(cardData);

      // Categories
      const categoriesQuery = role === 'admin' ? supabase.from('categories').select('*') : supabase.from('categories').select('*').eq('user_id', userId);
      const { data: catData } = await categoriesQuery;

      if (catData) {
        setCategories(catData.map(c => ({
          CategoriaID: c.id,
          Nome: c.name,
          Tipo: c.type === 'income' ? 'Receita' : 'Despesa',
          CategoriaMaeID: c.parent_id || '',
          Subtipo: c.subtype,
          Alvo: c.target_amount,
          LimiteMensal: c.monthly_limit || 0,
          Ativa: true,
          card_id: c.card_id || null
        })));
      }

      // Transactions
      const transQuery = role === 'admin' ? supabase.from('transactions').select('*') : supabase.from('transactions').select('*').eq('user_id', userId);
      const { data: txData } = await transQuery;

      if (txData) {
        setLaunches(txData.map(t => ({
          LancID: t.id,
          Data: t.created_at.split('T')[0],
          CategoriaID: t.category_id,
          Tipo: t.type === 'income' ? 'Entrada' : 'Saida',
          Valor: t.amount,
          Descricao: t.description,
          Conta: t.account,
          Status: t.status,
          CriadoPor: t.user_id,
          card_id: t.card_id || null
        })));
      }
    } catch (err) {
      console.error('Error loading data', err);
    }
  };

  // Realtime listeners
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase.channel('public:transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, payload => {
        loadDataFromSupabase(session.user.id, currentUser?.Role);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, payload => {
        loadDataFromSupabase(session.user.id, currentUser?.Role);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, payload => {
        loadDataFromSupabase(session.user.id, currentUser?.Role);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, currentUser]);

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  useEffect(() => { if (toastMessage) { const t = setTimeout(() => setToastMessage(null), 4500); return () => clearTimeout(t); } }, [toastMessage]);
  useEffect(() => { setMenuOpen(false); }, [activeTab]);

  // Fetch notifications for current user
  const fetchNotifications = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);
      if (!error && data) setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) fetchNotifications(session.user.id);
  }, [session, fetchNotifications]);

  const markAllNotificationsRead = async () => {
    if (!session?.user?.id || unreadCount === 0) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', session.user.id)
      .eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = async (id) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Reset to dashboard if user switches tab, leaves site, or returns (resumes)
  useEffect(() => {
    const handleResume = () => {
      if (session) {
        setActiveTab('dashboard');
        setSelectedCardId(null);
        setMenuOpen(false);
      }
    };
    if (document.visibilityState === 'visible') handleResume();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') handleResume();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleResume);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleResume);
    };
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSession(null);
    setLaunches([]);
    setCategories([]);
    setCards([]);
    setSelectedCardId(null);
    setActiveTab('dashboard');
    setAuthMode('landing');
  };

  // Category Balance logic
  const getCategoryBalance = (catId, excludeLaunchId = null) => {
    const cat = categories.find(c => c.CategoriaID === catId);
    if (!cat) return 0;
    const userLaunches = launches.filter(l =>
      (currentUser?.Role === 'admin' || l.CriadoPor === session?.user?.id) &&
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

  // Data Handlers mapping to Supabase
  const handleAddLaunch = async (newLaunch) => {
    if (!session?.user?.id) return;
    const isPro = currentUser?.Plano !== 'Gratuito';
    const isAdmin = currentUser?.Role === 'admin';

    if (!isAdmin && !isPro) {
      const thisMonth = new Date().toISOString().slice(0, 7);
      const monthLaunches = launches.filter(l => l.CriadoPor === session.user.id && l.Data?.startsWith(thisMonth)).length;
      if (monthLaunches >= 50) {
        setShowUpgradeWall(true);
        return;
      }
    }

    const { error } = await supabase.from('transactions').insert([{
      user_id: session.user.id,
      type: newLaunch.Tipo === 'Entrada' ? 'income' : 'expense',
      amount: newLaunch.Valor,
      description: newLaunch.Descricao,
      category_id: newLaunch.CategoriaID,
      account: newLaunch.Conta,
      status: newLaunch.Status,
      card_id: newLaunch.card_id || null
    }]);

    if (error) setToastMessage({ type: 'warning', text: 'Erro ao salvar: ' + error.message });
    await loadDataFromSupabase(session.user.id, currentUser?.Role);
    setToastMessage({ type: 'success', text: 'Lançamento registrado!' });
  };

  const handleEditLaunch = async (updated) => {
    const { error } = await supabase.from('transactions').update({
      type: updated.Tipo === 'Entrada' ? 'income' : 'expense',
      amount: updated.Valor,
      description: updated.Descricao,
      category_id: updated.CategoriaID,
      account: updated.Conta,
      status: updated.Status
    }).eq('id', updated.LancID);

    if (error) setToastMessage({ type: 'warning', text: 'Erro ao atualizar: ' + error.message });
    await loadDataFromSupabase(session.user.id, currentUser?.Role);
    setToastMessage({ type: 'success', text: 'Lançamento atualizado!' });
  };

  const handleDeleteLaunch = async (id) => {
    console.log("TENTANDO ELIMINAR ID:", id);

    let query = supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (currentUser?.Role !== 'admin') {
      query = query.eq('user_id', session.user.id);
    }

    const { data, error } = await query.select();

    console.log("REGISTOS APAGADOS:", data);
    console.log("ERRO DELETE:", error);

    if (error) {
      setToastMessage({ type: 'warning', text: 'Erro ao remover: ' + error.message });
    } else {
      await loadDataFromSupabase(session.user.id, currentUser?.Role);
      setToastMessage({
        type: 'success',
        text: 'Lançamento removido!'
      });
    }
  };

  const handleAddCategory = async (newCat) => {
    const { error } = await supabase.from('categories').insert([{
      user_id: session.user.id,
      name: newCat.Nome,
      type: newCat.Tipo === 'Receita' ? 'income' : 'expense',
      subtype: newCat.Subtipo,
      parent_id: newCat.CategoriaMaeID ? newCat.CategoriaMaeID : null,
      target_amount: newCat.Alvo || 0,
      monthly_limit: newCat.LimiteMensal || 0,
      card_id: newCat.card_id || null
    }]);

    if (error) {
      alert('Erro ao criar categoria.');
      return false;
    }
    setToastMessage({ type: 'success', text: 'Categoria criada!' });
    return true;
  };

  const handleDeleteCategory = async (id) => {
    const confirmDelete = window.confirm('Deseja realmente eliminar esta categoria?');
    if (!confirmDelete) return;

    let query = supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (currentUser?.Role !== 'admin') {
      query = query.eq('user_id', session.user.id);
    }

    const { error } = await query;

    if (error) {
      setToastMessage({ type: 'warning', text: 'Erro ao remover categoria: ' + error.message });
    } else {
      await loadDataFromSupabase(session.user.id, currentUser?.Role);
      setToastMessage({ type: 'success', text: 'Categoria removida!' });
    }
  };

  const handleEditCategory = async (updated) => {
    const isAdmin = ['admin', 'superadmin'].includes(currentUser?.Role?.toLowerCase());
    let query = supabase
      .from('categories')
      .update({
        name: updated.Nome,
        type: updated.Tipo === 'Receita' ? 'income' : 'expense',
        subtype: updated.Subtipo,
        parent_id: updated.CategoriaMaeID || null,
        target_amount: updated.Alvo || 0,
        monthly_limit: updated.LimiteMensal || 0
      })
      .eq('id', updated.CategoriaID);

    // Admins podem editar qualquer categoria; utilizadores comuns só as suas
    if (!isAdmin) {
      query = query.eq('user_id', session.user.id);
    }

    const { error } = await query;

    if (error) {
      setToastMessage({
        type: 'warning',
        text: 'Erro ao atualizar categoria: ' + error.message
      });
      return false;
    }

    setToastMessage({
      type: 'success',
      text: 'Categoria atualizada!'
    });

    await loadDataFromSupabase(session.user.id, currentUser?.Role);

    return true;
  };

  const handleAutoBudget = async (salaryAmount) => {
    alert("Funcionalidade de orçamento automático migrada para a cloud. Em construção.");
  };

  // Card CRUD
  const handleAddCard = async (newCard) => {
    const { error } = await supabase.from('cards').insert([{
      user_id: session.user.id,
      name: newCard.name,
      number: newCard.number || '',
      icon: newCard.icon || '💳',
      description: newCard.description || '',
      color: newCard.color || '#6366f1',
      style: newCard.style || 'modern',
      model: newCard.model || 'classico',
      intensity: newCard.intensity != null ? newCard.intensity : 50
    }]);
    if (error) setToastMessage({ type: 'warning', text: 'Erro ao criar cartão: ' + error.message });
    else setToastMessage({ type: 'success', text: 'Cartão criado!' });
    await loadDataFromSupabase(session.user.id, currentUser?.Role);
  };

  const handleEditCard = async (updated) => {
    const { error } = await supabase.from('cards').update({
      name: updated.name,
      number: updated.number,
      icon: updated.icon,
      description: updated.description,
      color: updated.color,
      style: updated.style,
      model: updated.model,
      intensity: updated.intensity != null ? updated.intensity : 50
    }).eq('id', updated.id).eq('user_id', session?.user?.id);
    if (error) setToastMessage({ type: 'warning', text: 'Erro ao editar cartão: ' + error.message });
    else setToastMessage({ type: 'success', text: 'Cartão atualizado!' });
    await loadDataFromSupabase(session.user.id, currentUser?.Role);
  };

  const handleDeleteCard = async (id) => {
    const { error } = await supabase.from('cards').delete().eq('id', id).eq('user_id', session?.user?.id);
    if (error) setToastMessage({ type: 'warning', text: 'Erro ao eliminar cartão: ' + error.message });
    else {
      setToastMessage({ type: 'success', text: 'Cartão eliminado!' });
      if (selectedCardId === id) setSelectedCardId(null);
    }
    await loadDataFromSupabase(session.user.id, currentUser?.Role);
  };

  // UI Setup
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1d', color: '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="loader" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p>A carregar o seu ambiente financeiro...</p>
        </div>
      </div>
    );
  }

  // Temporary function to bypass Supabase Studio issues
  const handleForceAdmin = async () => {
    if (!session?.user?.id) return;

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Erro ao verificar perfil:", fetchError.message);
      return;
    }

    let saveError;
    if (!existingProfile) {
      // If it doesn't exist, insert a new profile row
      const { error } = await supabase
        .from('profiles')
        .insert([{
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Admin',
          phone: session.user.user_metadata?.phone || '',
          country: session.user.user_metadata?.country || 'Angola',
          role: 'admin',
          plan: 'Pro'
        }]);
      saveError = error;
    } else {
      // If it exists, update it
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin', plan: 'Pro' })
        .eq('id', session.user.id);
      saveError = error;
    }

    if (saveError) {
      alert("Erro ao tornar admin: " + saveError.message);
    } else {
      alert("Sucesso! O perfil foi atualizado para Admin e Plano Pro. A recarregar...");
      window.location.reload();
    }
  };

  if (!session) {
    // Show landing or auth based on landing state
    if (authMode === 'landing') {
      return (
        <LandingView
          onShowLogin={() => setAuthMode('login')}
          onShowRegister={() => setAuthMode('register')}
        />
      );
    }
    return (
      <AuthView
        initialTab={authMode === 'register' ? 'register' : 'login'}
        onBackToLanding={() => setAuthMode('landing')}
        onLogin={(user) => {
          setCurrentUser(user);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  const isSuperAdmin = currentUser?.Role === 'admin';
  const isProUser = currentUser?.Plano && currentUser.Plano !== 'Gratuito';

  const PREMIUM_TABS = ['metas', 'dividas', 'coach', 'academia', 'investimentos', 'empresa'];
  const isPremiumLocked = (tab) => PREMIUM_TABS.includes(tab) && !isProUser && !isSuperAdmin;

  const renderTabContent = () => {
    if (isPremiumLocked(activeTab)) {
      return <PremiumLockScreen tabName={activeTab} bankInfo={bankInfo} onGoToSubscriptions={() => setActiveTab('subscricoes')} />;
    }

    switch (activeTab) {
      case 'dashboard':
        if (selectedCardId) {
          const selectedCard = cards.find(c => c.id === selectedCardId);
          return <DashboardCardView
            card={selectedCard}
            categories={categories}
            launches={launches}
            role={currentUser?.Role}
            userId={session?.user?.id}
            onBack={() => { setSelectedCardId(null); setActiveTab('cartoes'); }}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddLaunch={handleAddLaunch}
            onEditLaunch={handleEditLaunch}
            onDeleteLaunch={handleDeleteLaunch}
            getCategoryBalance={getCategoryBalance}
            cards={cards}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
          />;
        }
        return <DashboardView launches={launches} categories={categories} cards={cards} role={currentUser?.Role} userEmail={currentUser?.Email} userId={session?.user?.id} currentUser={currentUser} setCurrentUser={setCurrentUser} onAddLaunchClick={() => setActiveTab('lancamentos')} onGoToChat={() => setActiveTab('chat')} onForceAdmin={handleForceAdmin} onSelectCard={(cardId) => { setSelectedCardId(cardId); setActiveTab('dashboard'); }} />;
      case 'cartoes':
        return <CartoesView cards={cards} launches={launches} categories={categories} role={currentUser?.Role} userId={session?.user?.id}
          onAddCard={handleAddCard} onEditCard={handleEditCard} onDeleteCard={handleDeleteCard}
          onSelectCard={(cardId) => { setSelectedCardId(cardId); setActiveTab('dashboard'); }} />;
      case 'lancamentos':
        return <LancamentosView launches={launches} categories={categories} cards={cards} role={currentUser?.Role} userEmail={currentUser?.Email} userId={session?.user?.id} onAddLaunch={handleAddLaunch} onEditLaunch={handleEditLaunch} onDeleteLaunch={handleDeleteLaunch} getCategoryBalance={getCategoryBalance} />;
      case 'categorias':
        return <CartoesView cards={cards} launches={launches} categories={categories} role={currentUser?.Role} userId={session?.user?.id}
          onAddCard={handleAddCard} onEditCard={handleEditCard} onDeleteCard={handleDeleteCard}
          onSelectCard={(cardId) => { setSelectedCardId(cardId); setActiveTab('dashboard'); }} />;
      case 'relatorios':
        return <RelatoriosView launches={launches} categories={categories} cards={cards} role={currentUser?.Role} userEmail={currentUser?.Email} userId={session?.user?.id} />;
      case 'coach':
        return <CoachView launches={launches} categories={categories} role={currentUser?.Role} userEmail={currentUser?.Email} userId={session?.user?.id} getCategoryBalance={getCategoryBalance} />;
      case 'academia':
        return <AcademiaView currentUser={currentUser} />;
      case 'investimentos':
        return <InvestimentosView currentUser={currentUser} launches={launches} categories={categories} />;
      case 'empresa':
        return <EmpresaView currentUser={currentUser} onToast={setToastMessage} />;
      case 'subscricoes':
        return <SubscriptionsView currentUser={currentUser} bankInfo={bankInfo} onToast={setToastMessage} subscriptions={subscriptions} setSubscriptions={setSubscriptions} />;
      case 'chat':
        return <ChatView currentUser={currentUser} />;
      case 'configuracoes':
        return <ConfiguracoesView role={currentUser?.Role} userEmail={currentUser?.Email} currentUser={currentUser}
          users={users} setUsers={setUsers} isOffline={false} lowBalanceLimit={5000} onResetData={() => { }}
          onInstallApp={() => { }} onToast={setToastMessage} bankInfo={bankInfo} onShowUpgrade={() => setShowUpgradeWall(true)} />;
      case 'metas':
        return <MetasView currentUser={currentUser} session={session} launches={launches} categories={categories} />;
      case 'dividas':
        return <DividasView currentUser={currentUser} launches={launches} />;
      case 'superadmin':
        return isSuperAdmin
          ? <SuperAdminView users={users} setUsers={setUsers} currentUserEmail={currentUser?.Email} onToast={setToastMessage} launches={launches} bankInfo={bankInfo} setBankInfo={setBankInfo} subscriptions={subscriptions} setSubscriptions={setSubscriptions} inviteCodes={inviteCodes} setInviteCodes={setInviteCodes} auditLogs={auditLogs} onAddAuditLog={() => { }} />
          : <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-error)' }}>⛔ Acesso negado.</div>;
      default: return null;
    }
  };

  const mainNavItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { id: 'cartoes', icon: <CreditCard size={18} />, label: 'Cartões' },
    { id: 'lancamentos', icon: <Receipt size={18} />, label: 'Carregar Cartão' },
    { id: 'relatorios', icon: <FileBarChart size={18} />, label: 'Relatórios' },
    { id: 'coach', icon: <Sparkles size={18} />, label: 'Coach IA' },
    { id: 'chat', icon: <MessageCircle size={18} />, label: 'Suporte SMS' },
  ];

  const extraNavItems = [
    { id: 'metas', icon: <Target size={18} />, label: 'Metas' },
    { id: 'dividas', icon: <ArrowLeftRight size={18} />, label: 'Dívidas' },
    { id: 'academia', icon: <GraduationCap size={18} />, label: 'Academia' },
    { id: 'investimentos', icon: <TrendingUp size={18} />, label: 'Investimentos' },
    { id: 'empresa', icon: <Building2 size={18} />, label: 'Empresa' },
    { id: 'subscricoes', icon: <CreditCard size={18} />, label: 'Subscrições' },
    ...(isSuperAdmin ? [{ id: 'superadmin', icon: <Crown size={18} />, label: 'Painel Admin', gold: true }] : []),
    { id: 'configuracoes', icon: <Settings size={18} />, label: 'Ajustes' },
  ];

  const roleBadgeColor = currentUser?.Role === 'admin' ? '#f59e0b' : 'var(--color-accent)';

  return (
    <div className="app-container">
      {showUpgradeWall && <UpgradeWall bankInfo={bankInfo} onClose={() => setShowUpgradeWall(false)} onGoToSubscriptions={() => { setShowUpgradeWall(false); setActiveTab('subscricoes'); }} />}

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

      <header className="glass-panel" style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, #a5b4fc 100%)', width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '1rem', flexShrink: 0 }}>F</div>
          <h1 className="hide-phone" style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Finança ao Ponto</h1>
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px', padding: '2px 7px', fontSize: '0.6rem', color: 'var(--color-success)', fontWeight: 700 }}>
            <Cloud size={9} /> Supabase
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!isSuperAdmin && (
            <div className="hide-mobile" onClick={() => setActiveTab('subscricoes')} style={{ padding: '4px 8px', borderRadius: '16px', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', backgroundColor: isProUser ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: isProUser ? 'var(--color-accent)' : 'var(--text-muted)', border: `1px solid ${isProUser ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', gap: '3px' }}>
              {isProUser ? <Star size={10} /> : <Lock size={10} />}
              {currentUser?.Plano || 'Gratuito'}
            </div>
          )}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: roleBadgeColor }}>
            {currentUser?.Role === 'admin' && <Crown size={12} style={{ color: '#f59e0b' }} />}
            {currentUser?.Nome?.split(' ')[0] || currentUser?.Email?.split('@')[0]}
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => { setShowNotifications(v => !v); if (!showNotifications) markAllNotificationsRead(); }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}
            title="Notificações"
          >
            {unreadCount > 0 ? <BellRing size={13} style={{ color: '#f59e0b' }} /> : <Bell size={13} />}
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: '#ef4444', color: '#fff', borderRadius: '50%',
                width: '15px', height: '15px', fontSize: '0.6rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          <button className="hide-mobile" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: menuOpen ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${menuOpen ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'}`, color: menuOpen ? 'var(--color-accent)' : 'var(--text-primary)', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifications && (
        <>
          <div onClick={() => setShowNotifications(false)} style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.3)' }} />
          <div className="glass-panel animate-fade-in" style={{
            position: 'fixed', top: '56px', right: '12px', zIndex: 99,
            width: '320px', maxHeight: '480px', overflowY: 'auto',
            padding: '8px', borderRadius: '14px', boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', gap: '4px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>🔔 Notificações</div>
              {unreadCount > 0 && (
                <button onClick={markAllNotificationsRead} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-accent)', fontSize: '0.75rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}><CheckCheck size={13} /> Marcar todas lidas</button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                📭 Nenhuma notificação.
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  padding: '10px 12px', borderRadius: '10px', cursor: 'default',
                  background: n.read ? 'transparent' : 'rgba(99,102,241,0.07)',
                  border: n.read ? '1px solid transparent' : '1px solid rgba(99,102,241,0.15)'
                }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '5px',
                    background: n.read ? 'transparent' : 'var(--color-accent)'
                  }} />
                  <div style={{ flex: 1 }}>
                    {n.title && <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '2px' }}>{n.title}</div>}
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {new Date(n.created_at).toLocaleString('pt-AO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <button onClick={() => deleteNotification(n.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: '2px', flexShrink: 0, fontSize: '0.8rem'
                  }}>✕</button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.4)' }} />
          <div className="glass-panel animate-fade-in" style={{ position: 'fixed', top: '64px', right: '12px', zIndex: 95, padding: '8px', borderRadius: '14px', minWidth: '210px', boxShadow: '0 12px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: 'calc(100vh - 88px)', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, padding: '4px 12px 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Principal</div>
            {mainNavItems.map(item => (
              <button key={item.id} onClick={() => { if (item.id === 'dashboard') setSelectedCardId(null); setActiveTab(item.id); setMenuOpen(false); }} style={{ background: activeTab === item.id ? 'rgba(99,102,241,0.12)' : 'transparent', border: 'none', cursor: 'pointer', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: activeTab === item.id ? 'var(--color-accent)' : 'var(--text-secondary)', fontWeight: activeTab === item.id ? 700 : 500, fontSize: '0.88rem', transition: 'all 0.15s', width: '100%', textAlign: 'left' }}>
                <span style={{ color: activeTab === item.id ? 'var(--color-accent)' : 'var(--text-muted)' }}>{item.icon}</span>{item.label}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, padding: '4px 12px 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avançado</div>
            {extraNavItems.map(item => {
              const locked = isPremiumLocked(item.id);
              return (
              <button key={item.id} onClick={() => { if (item.id === 'dashboard') setSelectedCardId(null); setActiveTab(item.id); setMenuOpen(false); }} style={{ background: activeTab === item.id ? (item.gold ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)') : 'transparent', border: 'none', cursor: 'pointer', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: activeTab === item.id ? (item.gold ? '#f59e0b' : 'var(--color-accent)') : 'var(--text-secondary)', fontWeight: activeTab === item.id ? 700 : 500, fontSize: '0.88rem', transition: 'all 0.15s', width: '100%', textAlign: 'left', opacity: locked ? 0.7 : 1 }}>
                <span style={{ color: activeTab === item.id ? (item.gold ? '#f59e0b' : 'var(--color-accent)') : 'var(--text-muted)' }}>{item.icon}</span>{item.label}
                {locked && <Lock size={13} style={{ marginLeft: 'auto', color: '#f59e0b', flexShrink: 0 }} />}
              </button>
              );
            })}
            <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
            <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-error)', fontWeight: 600, fontSize: '0.88rem', width: '100%' }}>
              <LogOut size={18} /> Sair da Conta
            </button>
          </div>
        </>
      )}

      <main className="content-area" style={{ paddingBottom: '24px' }}>
        {renderTabContent()}
      </main>

      {/* Bottom Navigation for Mobile */}
      {(
        <nav className="bottom-nav">
          {mainNavItems.concat(extraNavItems).filter((item, index, self) =>
            self.findIndex(i => i.id === item.id) === index
          ).map(item => {
            const locked = isPremiumLocked(item.id);
            const isActive = activeTab === item.id;
            return (
              <button key={item.id}
                onClick={() => { if (item.id === 'dashboard') setSelectedCardId(null); setActiveTab(item.id); setMenuOpen(false); }}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  padding: '4px 6px', borderRadius: '8px', flex: 1, maxWidth: '64px',
                  color: isActive ? 'var(--color-accent)' : 'var(--text-muted)',
                  opacity: locked ? 0.5 : 1,
                  transition: 'color 0.15s'
                }}
                title={item.label}
              >
                <span style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.15s' }}>{item.icon}</span>
                <span className="bottom-nav-text" style={{ fontSize: '0.55rem', fontWeight: isActive ? 700 : 500, lineHeight: 1.1 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
