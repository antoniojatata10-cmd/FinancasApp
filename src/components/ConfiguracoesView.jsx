import React, { useState, useRef, useEffect } from 'react';
import {
  Settings, Wifi, WifiOff, RefreshCcw, Trash2, Bell, Download,
  Monitor, Smartphone, Apple, User, Mail, Phone, Lock, Eye, EyeOff,
  Save, Globe, CheckCircle, Cloud, CloudOff, Database, ExternalLink,
  AlertTriangle, ShieldCheck, TestTube, BookOpen, MessageSquare, Send,
  CheckCheck, Check, Loader2, Users, Copy, RefreshCw
} from 'lucide-react';

import GuiaAppView from './GuiaAppView';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { createClient } from '@supabase/supabase-js';

// ─── LOCAL CHAT (offline fallback) ────────────────────────────────────────────
const LOCAL_CHAT_KEY = 'financas_support_chat_v1';
function loadChat() { try { return JSON.parse(localStorage.getItem(LOCAL_CHAT_KEY)) || []; } catch { return []; } }
function saveChat(msgs) { localStorage.setItem(LOCAL_CHAT_KEY, JSON.stringify(msgs)); }

export default function ConfiguracoesView({
  role, userEmail, currentUser, users, setUsers,
  isOffline, lowBalanceLimit, installPrompt,
  onRoleChange, onUserEmailChange, onOfflineToggle,
  onLowBalanceLimitChange, onResetData, onInstallApp, onToast,
  bankInfo, onShowUpgrade
}) {
  // Profile state
  const [editNome, setEditNome] = useState(currentUser?.Nome || '');
  const [editTelefone, setEditTelefone] = useState(currentUser?.Telefone || '');
  const [editPais, setEditPais] = useState(currentUser?.Pais || 'Angola');
  const [familyCode, setFamilyCode] = useState(currentUser?.family_code || '');
  const [editSenhaAtual, setEditSenhaAtual] = useState('');
  const [editSenhaNova, setEditSenhaNova] = useState('');
  const [editSenhaConfirm, setEditSenhaConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showGuia, setShowGuia] = useState(false);
  const [familyCodeCopied, setFamilyCodeCopied] = useState(false);

  // Sync profile state when currentUser updates
  useEffect(() => {
    if (currentUser) {
      setEditNome(currentUser.Nome || '');
      setEditTelefone(currentUser.Telefone || '');
      setEditPais(currentUser.Pais || 'Angola');
      setFamilyCode(currentUser.family_code || '');
    }
  }, [currentUser]);

  // Generate a unique family code (e.g. FAM-A3X9K2)
  const generateFamilyCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setFamilyCode('FAM-' + code);
  };

  const copyFamilyCode = () => {
    if (!familyCode) return;
    navigator.clipboard?.writeText(familyCode).catch(() => {});
    setFamilyCodeCopied(true);
    setTimeout(() => setFamilyCodeCopied(false), 2000);
  };

  // Cloud Sync state
  const [sbUrl, setSbUrl] = useState(() => localStorage.getItem('financas_supabase_url') || '');
  const [sbKey, setSbKey] = useState(() => localStorage.getItem('financas_supabase_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncMsg, setSyncMsg] = useState('');
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured());

  // Support Chat state
  const [chatMessages, setChatMessages] = useState(loadChat);
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [supabaseChatAvailable, setSupabaseChatAvailable] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const isSuperAdmin = role === 'SuperAdmin' || role === 'superadmin';
  const isAnyAdmin = role === 'admin' || role === 'Admin' || isSuperAdmin;

  // Check if Supabase chat tables exist
  useEffect(() => {
    const checkChatTables = async () => {
      if (!isSupabaseConfigured()) return;

      try {
        const { error } = await supabase
          .from('chat_messages')
          .select('id')
          .limit(1);

        if (!error || error.code !== '42P01') {
          setSupabaseChatAvailable(true);

          // Carregar mensagens do utilizador
          if (currentUser?.id) {
            const { data: msgs } = await supabase
              .from('chat_messages')
              .select('*')
              .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
              .order('created_at', { ascending: true });

            if (msgs) {
              setChatMessages(msgs);
            }
          }
        }
      } catch (err) {
        console.error('Erro ao verificar chat:', err);
      }
    };

    checkChatTables();
  }, [currentUser?.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const planoColor = (plano) => {
    switch (plano) {
      case 'Pro': return 'var(--color-accent)';
      case 'Enterprise': return '#f59e0b';
      case 'Básico': return 'var(--color-success)';
      default: return 'var(--text-muted)';
    }
  };

  // ── Save Profile (Supabase) ────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!editNome.trim()) {
      onToast({ type: 'error', text: 'O nome não pode estar vazio.' });
      return;
    }

    setSavingProfile(true);
    try {
      if (isSupabaseConfigured() && currentUser?.id) {
        const updates = {
          full_name: editNome.trim(),
          phone: editTelefone.trim(),
          country: editPais,
          family_code: familyCode.trim() || null,
        };

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', currentUser.id);

        if (error) throw error;

        // Update password if provided
        if (editSenhaNova) {
          if (editSenhaNova.length < 6) {
            onToast({ type: 'error', text: 'Nova senha deve ter pelo menos 6 caracteres.' });
            setSavingProfile(false);
            return;
          }
          if (editSenhaNova !== editSenhaConfirm) {
            onToast({ type: 'error', text: 'As novas senhas não correspondem.' });
            setSavingProfile(false);
            return;
          }
          const { error: passErr } = await supabase.auth.updateUser({ password: editSenhaNova });
          if (passErr) throw passErr;
        }
      } else if (setUsers) {
        // Local fallback
        setUsers(prev => prev.map(u => {
          if (u.Email !== userEmail) return u;
          return { ...u, Nome: editNome.trim(), Telefone: editTelefone.trim(), Pais: editPais, family_code: familyCode.trim() || null };
        }));
      }

      setEditSenhaAtual('');
      setEditSenhaNova('');
      setEditSenhaConfirm('');
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
      onToast({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      onToast({ type: 'error', text: 'Erro ao guardar perfil: ' + (err.message || 'Tente novamente.') });
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Cloud Sync ─────────────────────────────────────────────────────────────
  const handleSaveSyncKeys = () => {
    const urlClean = sbUrl.trim();
    const keyClean = sbKey.trim();
    if (!urlClean || !keyClean) { onToast({ type: 'error', text: 'Preencha o URL e a chave Anon.' }); return; }
    if (!urlClean.startsWith('https://') || !urlClean.includes('supabase.co')) {
      onToast({ type: 'error', text: 'URL inválido. Deve ser: https://xxx.supabase.co' });
      return;
    }
    localStorage.setItem('financas_supabase_url', urlClean);
    localStorage.setItem('financas_supabase_key', keyClean);
    setIsConfigured(true);
    onToast({ type: 'success', text: '✅ Chaves guardadas! Recarregue para activar a sincronização.' });
  };

  const handleTestConnection = async () => {
    setSyncStatus('testing');
    setSyncMsg('A testar ligação...');
    const urlClean = sbUrl.trim();
    const keyClean = sbKey.trim();
    if (!urlClean || !keyClean) { setSyncStatus('error'); setSyncMsg('Preencha o URL e a chave antes de testar.'); return; }
    try {
      const testClient = createClient(urlClean, keyClean);
      const { error } = await testClient.from('profiles').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      setSyncStatus('ok');
      setSyncMsg('✅ Ligação bem sucedida! O Supabase está configurado e acessível.');
    } catch (err) {
      setSyncStatus('error');
      setSyncMsg(`❌ Falha na ligação: ${err.message}`);
    }
  };

  const handleClearSyncKeys = () => {
    if (!window.confirm('Remover as configurações de cloud?')) return;
    localStorage.removeItem('financas_supabase_url');
    localStorage.removeItem('financas_supabase_key');
    setSbUrl(''); setSbKey(''); setIsConfigured(false); setSyncStatus('idle'); setSyncMsg('');
    onToast({ type: 'success', text: 'Configuração cloud removida. Recarregue a página.' });
  };

  const syncStatusColor = { idle: 'var(--text-muted)', testing: '#f59e0b', ok: 'var(--color-success)', error: 'var(--color-error)' }[syncStatus];

  // ── Send Support Message ───────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingMsg) return;
    const text = chatInput.trim();
    setChatInput('');
    setSendingMsg(true);

    const newMsg = {
      id: Date.now().toString(),
      content: text,
      sender_id: currentUser?.id || currentUser?.Email || 'user',
      sender_name: currentUser?.Nome || currentUser?.Email || 'Utilizador',
      is_admin: isAnyAdmin,
      created_at: new Date().toISOString(),
      is_read: false
    };

    try {
      if (supabaseChatAvailable && currentUser?.id) {
        let convId = activeConversationId;

        if (!convId) {
          const { data: newConv, error: convErr } = await supabase
            .from('chat_conversations')
            .insert([{ user_id: currentUser.id }])
            .select()
            .single();

          if (!convErr && newConv) {
            convId = newConv.id;
            setActiveConversationId(convId);
          }
        }

        if (convId) {
          const { data: sentMsg, error: sendErr } = await supabase
            .from('chat_messages')
            .insert([{
              conversation_id: convId,
              sender_id: currentUser.id,
              content: text
            }])
            .select()
            .single();

          if (!sendErr && sentMsg) {
            setChatMessages(prev => [...prev, sentMsg]);
          }
        }

      } else {
        const updated = [...chatMessages, newMsg];
        setChatMessages(updated);
        saveChat(updated);
      }

    } catch (err) {
      const updated = [...chatMessages, newMsg];
      setChatMessages(updated);
      saveChat(updated);

    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── PAGE HEADER ── */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Ajustes e Perfil</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Gerencie o seu perfil, sincronização cloud e preferências.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

        {/* ══ LEFT COLUMN: Profile ══ */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-accent)' }}>
            <User size={20} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Meu Perfil</h4>
            {currentUser?.Plano && (
              <span style={{
                marginLeft: 'auto', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
                backgroundColor: `${planoColor(currentUser.Plano)}22`,
                color: planoColor(currentUser.Plano),
                border: `1px solid ${planoColor(currentUser.Plano)}55`
              }}>
                ⭐ {currentUser.Plano}
              </span>
            )}
          </div>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
              background: isAnyAdmin
                ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                : 'linear-gradient(135deg, var(--color-accent), #a5b4fc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1.5rem', color: '#fff'
            }}>
              {(currentUser?.Nome || userEmail)?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>{currentUser?.Nome || userEmail?.split('@')[0]}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{userEmail}</div>
              <div style={{ fontSize: '0.72rem', color: isAnyAdmin ? '#f59e0b' : 'var(--text-muted)', marginTop: '2px', fontWeight: isAnyAdmin ? 700 : 400 }}>
                {isAnyAdmin ? '👑 Administrador' : `Plano ${currentUser?.Plano || 'Gratuito'}`}
              </div>
            </div>
          </div>

          {/* Edit Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nome Completo</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input type="text" value={editNome} onChange={e => setEditNome(e.target.value)}
                  className="form-input" style={{ paddingLeft: '34px' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">E-mail (não editável)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input type="email" value={userEmail} disabled
                  className="form-input" style={{ paddingLeft: '34px', opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Telefone</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input type="tel" value={editTelefone} onChange={e => setEditTelefone(e.target.value)}
                    className="form-input" style={{ paddingLeft: '34px' }} placeholder="+244..." />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">País</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Globe size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', zIndex: 1 }} />
                  <select value={editPais} onChange={e => setEditPais(e.target.value)}
                    className="form-input" style={{ paddingLeft: '34px', appearance: 'none' }}>
                    <option>Angola</option>
                    <option>Portugal</option>
                    <option>Brasil</option>
                    <option>Moçambique</option>
                    <option>Cabo Verde</option>
                    <option>São Tomé e Príncipe</option>
                    <option>Guiné-Bissau</option>
                    <option>Outro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Family Code */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={13} style={{ color: 'var(--color-accent)' }} />
                Código de Família
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>(partilhe com membros da família)</span>
              </label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Users size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={familyCode}
                    onChange={e => setFamilyCode(e.target.value.toUpperCase())}
                    placeholder="Gere ou insira um código (ex: FAM-AB3X9K)"
                    className="form-input"
                    style={{ paddingLeft: '34px', fontFamily: 'monospace', letterSpacing: '1px', fontSize: '0.88rem' }}
                    maxLength={12}
                  />
                </div>
                <button
                  type="button"
                  onClick={generateFamilyCode}
                  title="Gerar novo código"
                  style={{ padding: '10px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  type="button"
                  onClick={copyFamilyCode}
                  title="Copiar código"
                  style={{ padding: '10px', borderRadius: '8px', background: familyCodeCopied ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${familyCodeCopied ? 'rgba(16,185,129,0.4)' : 'var(--border-color)'}`, cursor: 'pointer', color: familyCodeCopied ? 'var(--color-success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  {familyCodeCopied ? <CheckCircle size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '5px', lineHeight: 1.5 }}>
                Membros da família com este código terão acesso de <strong>leitura</strong> aos seus dados. Guarde e não partilhe com desconhecidos.
              </p>
            </div>
          </div>

          {/* Password change */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Lock size={15} style={{ color: 'var(--color-accent)' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Alterar Senha (opcional)</span>
              <button onClick={() => setShowPass(p => !p)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {[
              { label: 'Nova Senha', val: editSenhaNova, set: setEditSenhaNova },
              { label: 'Confirmar Nova', val: editSenhaConfirm, set: setEditSenhaConfirm }
            ].map(({ label, val, set }, i) => (
              <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input type={showPass ? 'text' : 'password'} placeholder={label}
                  value={val} onChange={e => set(e.target.value)}
                  className="form-input" style={{ paddingLeft: '34px' }} />
              </div>
            ))}
          </div>

          <button onClick={handleSaveProfile} disabled={savingProfile}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {savingProfile
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> A guardar...</>
              : profileSaved
                ? <><CheckCircle size={16} /> Salvo!</>
                : <><Save size={16} /> Guardar Alterações</>
            }
          </button>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* CLOUD SYNC — Admin only */}
          {isAnyAdmin && (
            <div className="glass-panel" style={{
              padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px',
              border: `1px solid ${isConfigured ? 'rgba(52,211,153,0.25)' : 'rgba(99,102,241,0.2)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isConfigured
                  ? <Cloud size={20} style={{ color: 'var(--color-success)' }} />
                  : <CloudOff size={20} style={{ color: 'var(--text-muted)' }} />}
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Sincronização Cloud</h4>
                <span style={{
                  marginLeft: 'auto', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                  backgroundColor: isConfigured ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)',
                  color: isConfigured ? 'var(--color-success)' : 'var(--text-muted)',
                  border: `1px solid ${isConfigured ? 'rgba(52,211,153,0.3)' : 'var(--border-color)'}`
                }}>
                  {isConfigured ? '● Configurado' : '○ Local'}
                </span>
              </div>

              <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '12px', fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>🔑 Para sincronizar entre PC e telemóvel:</strong><br />
                1. Crie um projeto gratuito em{' '}
                <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
                  supabase.com <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
                </a><br />
                2. Vá a Project Settings → API.<br />
                3. Cole o <strong>Project URL</strong> e a chave <strong>anon public</strong> abaixo.
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">URL do Projeto Supabase</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Database size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input type="url" placeholder="https://xxxxxxxxxxx.supabase.co"
                    value={sbUrl} onChange={e => setSbUrl(e.target.value)}
                    className="form-input" style={{ paddingLeft: '34px', fontFamily: 'monospace', fontSize: '0.8rem' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Chave Anon (anon public)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input type={showKey ? 'text' : 'password'} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={sbKey} onChange={e => setSbKey(e.target.value)}
                    className="form-input" style={{ paddingLeft: '34px', paddingRight: '40px', fontFamily: 'monospace', fontSize: '0.8rem' }} />
                  <button type="button" onClick={() => setShowKey(p => !p)}
                    style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {syncMsg && (
                <div style={{ fontSize: '0.8rem', padding: '10px 12px', borderRadius: '8px', lineHeight: 1.5, background: syncStatus === 'ok' ? 'var(--color-success-bg)' : syncStatus === 'error' ? 'var(--color-error-bg)' : 'rgba(245,158,11,0.08)', border: `1px solid ${syncStatusColor}`, color: syncStatusColor }}>
                  {syncMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={handleTestConnection} className="btn btn-secondary"
                  style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem' }}
                  disabled={syncStatus === 'testing'}>
                  <TestTube size={14} />
                  {syncStatus === 'testing' ? 'A testar...' : 'Testar Ligação'}
                </button>
                <button onClick={handleSaveSyncKeys} className="btn btn-primary"
                  style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem' }}>
                  <Save size={14} /> Guardar Chaves
                </button>
              </div>

              {isConfigured && (
                <button onClick={handleClearSyncKeys} className="btn btn-danger"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px' }}>
                  <CloudOff size={14} /> Desactivar Cloud Sync
                </button>
              )}
            </div>
          )}

          {/* GUIA DO APP */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-accent)' }}>
              <BookOpen size={20} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Guia de Utilização</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Descubra como usar todas as funcionalidades do Finança ao Ponto.
            </p>
            <button onClick={() => setShowGuia(true)} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <BookOpen size={16} /> Abrir Guia do App
            </button>
          </div>

          {/* INSTALL APP */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-accent)' }}>
              <Download size={20} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Instalar o App</h4>
            </div>
            {installPrompt ? (
              <button onClick={onInstallApp} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Download size={16} /> Instalar Agora
              </button>
            ) : (
              <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Siga o guia abaixo para instalar o app no seu dispositivo.
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              <h5 style={{ fontSize: '0.82rem', fontWeight: 700 }}>Guia de Instalação:</h5>
              {[
                { icon: <Monitor size={14} />, label: 'Windows / Mac', desc: 'No Chrome ou Edge, clique no ícone de instalação (💻) na barra de endereços.' },
                { icon: <Smartphone size={14} />, label: 'Android', desc: 'Menu (⋮) → "Adicionar à Tela de início" ou "Instalar aplicativo".' },
                { icon: <Apple size={14} />, label: 'iOS (iPhone/iPad)', desc: 'Abra no Safari → ícone Partilhar (⬆) → "Adicionar ao ecrã de início".' },
              ].map((g, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }}>{g.icon}</div>
                  <div style={{ fontSize: '0.78rem' }}><strong>{g.label}:</strong> {g.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* NETWORK STATUS */}
          <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-accent)' }}>
              {isOffline ? <WifiOff size={18} style={{ color: 'var(--color-error)' }} /> : <Wifi size={18} style={{ color: 'var(--color-success)' }} />}
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Modo Offline</h4>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem' }}>Estado da Rede</span>
              <button onClick={onOfflineToggle} className="btn" style={{
                padding: '7px 14px', fontSize: '0.82rem',
                backgroundColor: isOffline ? 'var(--color-error-bg)' : 'var(--color-success-bg)',
                color: isOffline ? 'var(--color-error)' : 'var(--color-success)',
                border: `1px solid ${isOffline ? 'var(--color-error)' : 'var(--color-success)'}`
              }}>
                {isOffline ? '📴 DESCONECTADO' : '🟢 CONECTADO'}
              </button>
            </div>
          </div>

          {/* LOW BALANCE ALERT */}
          <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-accent)' }}>
              <Bell size={18} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Alerta de Saldo Mínimo</h4>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="number" value={lowBalanceLimit}
                  onChange={e => onLowBalanceLimitChange(Number(e.target.value))}
                  className="form-input" style={{ flexGrow: 1 }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Kz</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ══ SUPORTE SMS — Full width section ══ */}
      <div className="glass-panel" style={{
        padding: '24px', display: 'flex', flexDirection: 'column', gap: '0',
        border: '1px solid rgba(99,102,241,0.2)',
        background: 'rgba(99,102,241,0.03)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'var(--color-accent)', borderRadius: '10px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={20} style={{ color: '#fff' }} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Suporte SMS</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isAnyAdmin
                ? 'Responda às mensagens dos utilizadores abaixo.'
                : 'Escreva a sua mensagem. O administrador responderá em breve.'}
            </p>
          </div>
          {!supabaseChatAvailable && (
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
              ⚡ Modo local
            </span>
          )}
        </div>

        {/* Messages area */}
        <div style={{
          height: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px',
          padding: '12px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px 12px 0 0',
          border: '1px solid var(--border-color)', borderBottom: 'none'
        }}>
          {chatMessages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '10px' }}>
              <MessageSquare size={36} style={{ opacity: 0.2 }} />
              <p style={{ fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.6 }}>
                {isAnyAdmin
                  ? 'Nenhuma mensagem de suporte ainda.\nOs utilizadores irão contactar-te aqui.'
                  : 'Sem mensagens ainda. Escreva a sua primeira mensagem abaixo.'}
              </p>
            </div>
          ) : (
            chatMessages.map(m => {
              // Determine if this message is from the current user
              const isOwn = supabaseChatAvailable
                ? (m.sender_id === currentUser?.id)
                : (isAnyAdmin ? !!m.is_admin : !m.is_admin);

              return (
                <div key={m.id} style={{ alignSelf: isOwn ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                  {!isOwn && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '3px', marginLeft: '4px' }}>
                      {m.is_admin ? '👑 Administrador' : (m.sender_name || 'Utilizador')}
                    </div>
                  )}
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: isOwn ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isOwn ? 'var(--color-accent)' : 'rgba(255,255,255,0.07)',
                    border: isOwn ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    display: 'flex', flexDirection: 'column', gap: '4px'
                  }}>
                    <span style={{ fontSize: '0.88rem', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.content}</span>
                    <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)' }}>
                      <span>{new Date(m.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
                      {isOwn && (m.is_read ? <CheckCheck size={11} style={{ color: '#34d399' }} /> : <Check size={11} />)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSendMessage} style={{
          display: 'flex', gap: '10px', alignItems: 'flex-end',
          padding: '12px', background: 'rgba(0,0,0,0.15)',
          border: '1px solid var(--border-color)', borderTop: 'none',
          borderRadius: '0 0 12px 12px'
        }}>
          <textarea
            placeholder="Escreva a sua mensagem para o administrador..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            rows={2}
            style={{
              flex: 1, padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-color)', borderRadius: '10px',
              color: 'var(--text-primary)', fontSize: '0.88rem',
              outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5
            }}
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || sendingMsg}
            style={{
              background: chatInput.trim() ? 'var(--color-accent)' : 'rgba(99,102,241,0.25)',
              border: 'none', padding: '12px 18px', borderRadius: '10px', color: '#fff',
              cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.2s',
              flexShrink: 0
            }}
          >
            {sendingMsg
              ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              : <><Send size={16} /> Enviar</>
            }
          </button>
        </form>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
          Prima <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '1px 5px', fontSize: '0.68rem' }}>Enter</kbd> para enviar · <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '1px 5px', fontSize: '0.68rem' }}>Shift+Enter</kbd> para nova linha
        </p>
      </div>

      {/* ══ DANGER ZONE ══ */}
      <div className="glass-panel" style={{ padding: '18px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-error)', marginBottom: '8px' }}>
          <RefreshCcw size={18} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Zona de Recuperação</h4>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', maxWidth: '500px' }}>
            Restaurar o sistema apagará todos os lançamentos, categorias e contas (exceto SuperAdmin).
          </p>
          <button
            onClick={() => {
              if (window.confirm('⚠️ Atenção: Todos os dados serão apagados. Esta ação é irreversível!\n\nDeseja continuar?')) {
                onResetData();
              }
            }}
            className="btn btn-danger"
            style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trash2 size={15} /> Limpar e Reiniciar
          </button>
        </div>
      </div>

      {showGuia && <GuiaAppView onClose={() => setShowGuia(false)} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
