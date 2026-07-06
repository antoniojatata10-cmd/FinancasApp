import React, { useState, useEffect } from 'react';
import {
  Settings, Wifi, WifiOff, RefreshCcw, Trash2, Bell, Download,
  Monitor, Smartphone, Apple, User, Mail, Phone, Lock, Eye, EyeOff,
  Save, Globe, CheckCircle, Cloud, CloudOff, Database, ExternalLink,
  AlertTriangle, ShieldCheck, TestTube, BookOpen, MessageSquare
} from 'lucide-react';

import GuiaAppView from './GuiaAppView';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import ChatView from './ChatView';


export default function ConfiguracoesView({
  role, userEmail, currentUser, users, setUsers,
  isOffline, lowBalanceLimit, installPrompt,
  onRoleChange, onUserEmailChange, onOfflineToggle,
  onLowBalanceLimitChange, onResetData, onInstallApp, onToast,
  bankInfo, onShowUpgrade
}) {
  const [editNome, setEditNome] = useState(currentUser?.Nome || '');
  const [editTelefone, setEditTelefone] = useState(currentUser?.Telefone || '');
  const [editPais, setEditPais] = useState(currentUser?.Pais || 'Angola');
  const [editSenhaAtual, setEditSenhaAtual] = useState('');
  const [editSenhaNova, setEditSenhaNova] = useState('');
  const [editSenhaConfirm, setEditSenhaConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [showGuia, setShowGuia] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);

  // Cloud Sync state
  const [sbUrl, setSbUrl] = useState(() => localStorage.getItem('financas_supabase_url') || '');
  const [sbKey, setSbKey] = useState(() => localStorage.getItem('financas_supabase_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | testing | ok | error
  const [syncMsg, setSyncMsg] = useState('');
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured());

  const isSuperAdmin = role === 'SuperAdmin' || role === 'superadmin';
  const isAnyAdmin = role === 'admin' || role === 'Admin' || isSuperAdmin;

  const planoColor = (plano) => {
    switch (plano) {
      case 'Pro': return 'var(--color-accent)';
      case 'Enterprise': return '#f59e0b';
      case 'Básico': return 'var(--color-success)';
      default: return 'var(--text-muted)';
    }
  };

  const handleSaveProfile = () => {
    if (!editNome.trim()) {
      onToast({ type: 'error', text: 'O nome não pode estar vazio.' });
      return;
    }
    if (editSenhaNova || editSenhaAtual) {
      if (editSenhaAtual !== currentUser?.Senha) {
        onToast({ type: 'error', text: 'Senha atual incorreta.' });
        return;
      }
      if (editSenhaNova.length < 6) {
        onToast({ type: 'error', text: 'Nova senha deve ter pelo menos 6 caracteres.' });
        return;
      }
      if (editSenhaNova !== editSenhaConfirm) {
        onToast({ type: 'error', text: 'As novas senhas não correspondem.' });
        return;
      }
    }
    setUsers(prev => prev.map(u => {
      if (u.Email !== userEmail) return u;
      return {
        ...u,
        Nome: editNome.trim(),
        Telefone: editTelefone.trim(),
        Pais: editPais,
        ...(editSenhaNova ? { Senha: editSenhaNova } : {})
      };
    }));
    setEditSenhaAtual('');
    setEditSenhaNova('');
    setEditSenhaConfirm('');
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
    onToast({ type: 'success', text: 'Perfil atualizado com sucesso!' });
  };

  // ── Cloud Sync: Save keys ──────────────────────────────────────────────────
  const handleSaveSyncKeys = () => {
    const urlClean = sbUrl.trim();
    const keyClean = sbKey.trim();

    if (!urlClean || !keyClean) {
      onToast({ type: 'error', text: 'Preencha o URL e a chave Anon do Supabase.' });
      return;
    }

    // Basic URL validation
    if (!urlClean.startsWith('https://') || !urlClean.includes('supabase.co')) {
      onToast({ type: 'error', text: 'URL inválido. Deve ser: https://xxx.supabase.co' });
      return;
    }

    localStorage.setItem('financas_supabase_url', urlClean);
    localStorage.setItem('financas_supabase_key', keyClean);
    setIsConfigured(true);
    onToast({ type: 'success', text: '✅ Chaves guardadas! Recarregue a página para activar a sincronização.' });
  };

  // ── Cloud Sync: Test connection ────────────────────────────────────────────
  const handleTestConnection = async () => {
    setSyncStatus('testing');
    setSyncMsg('A testar ligação...');

    const urlClean = sbUrl.trim();
    const keyClean = sbKey.trim();

    if (!urlClean || !keyClean) {
      setSyncStatus('error');
      setSyncMsg('Preencha o URL e a chave antes de testar.');
      return;
    }

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(urlClean, keyClean);
      const { error } = await testClient.from('usuarios').select('count', { count: 'exact', head: true });

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows, but connection OK
        throw new Error(error.message);
      }
      setSyncStatus('ok');
      setSyncMsg('✅ Ligação bem sucedida! O Supabase está configurado e acessível.');
    } catch (err) {
      setSyncStatus('error');
      setSyncMsg(`❌ Falha na ligação: ${err.message}`);
    }
  };

  const handleClearSyncKeys = () => {
    if (!window.confirm('Remover as configurações de cloud? O app voltará a usar dados locais.')) return;
    localStorage.removeItem('financas_supabase_url');
    localStorage.removeItem('financas_supabase_key');
    setSbUrl('');
    setSbKey('');
    setIsConfigured(false);
    setSyncStatus('idle');
    setSyncMsg('');
    onToast({ type: 'success', text: 'Configuração cloud removida. Recarregue a página.' });
  };

  const syncStatusColor = {
    idle: 'var(--text-muted)',
    testing: '#f59e0b',
    ok: 'var(--color-success)',
    error: 'var(--color-error)'
  }[syncStatus];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Ajustes e Perfil</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Gerencie o seu perfil, sincronização cloud e preferências.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

        {/* ── PROFILE CARD ── */}
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
              background: isSuperAdmin
                ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                : 'linear-gradient(135deg, var(--color-accent), #a5b4fc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1.5rem', color: '#fff'
            }}>
              {(currentUser?.Nome || userEmail)?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>{currentUser?.Nome || userEmail.split('@')[0]}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{userEmail}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                📅 Desde {currentUser?.DataCadastro || 'N/A'}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nome Completo</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text" value={editNome} onChange={e => setEditNome(e.target.value)}
                  className="form-input" style={{ paddingLeft: '34px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">E-mail (não editável)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="email" value={userEmail} disabled
                  className="form-input" style={{ paddingLeft: '34px', opacity: 0.5, cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Telefone</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="tel" value={editTelefone} onChange={e => setEditTelefone(e.target.value)}
                    className="form-input" style={{ paddingLeft: '34px' }}
                    placeholder="+244..."
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">País</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Globe size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', zIndex: 1 }} />
                  <select
                    value={editPais} onChange={e => setEditPais(e.target.value)}
                    className="form-input" style={{ paddingLeft: '34px', appearance: 'none' }}
                  >
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
          </div>

          {/* Change Password */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Lock size={15} style={{ color: 'var(--color-accent)' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Alterar Senha (opcional)</span>
              <button onClick={() => setShowPass(p => !p)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {['Senha Atual', 'Nova Senha', 'Confirmar Nova'].map((lbl, i) => {
              const vals = [editSenhaAtual, editSenhaNova, editSenhaConfirm];
              const setters = [setEditSenhaAtual, setEditSenhaNova, setEditSenhaConfirm];
              return (
                <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder={lbl}
                    value={vals[i]}
                    onChange={e => setters[i](e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '34px' }}
                  />
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSaveProfile}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {profileSaved
              ? <><CheckCircle size={16} /> Salvo!</>
              : <><Save size={16} /> Guardar Alterações</>
            }
          </button>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── CLOUD SYNC CARD — Admin Only ── */}
          {isAnyAdmin && (
          <div className="glass-panel" style={{
            padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px',
            border: `1px solid ${isConfigured ? 'rgba(52,211,153,0.25)' : 'rgba(99,102,241,0.2)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isConfigured
                ? <Cloud size={20} style={{ color: 'var(--color-success)' }} />
                : <CloudOff size={20} style={{ color: 'var(--text-muted)' }} />
              }
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

            {/* Info box */}
            <div style={{
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '10px', padding: '12px', fontSize: '0.8rem', lineHeight: 1.6,
              color: 'var(--text-secondary)'
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>🔑 Para sincronizar entre PC e telemovel:</strong><br />
              1. Crie um projeto gratuito em{' '}
              <a href="https://supabase.com" target="_blank" rel="noreferrer"
                style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
                supabase.com <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
              </a><br />
              2. Vá a Project Settings → API.<br />
              3. Cole o <strong>Project URL</strong> e a chave <strong>anon public</strong> abaixo.<br />
              4. Configure as tabelas com o ficheiro SQL incluído no projeto.
            </div>

            {/* URL input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">URL do Projeto Supabase</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Database size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="url"
                  placeholder="https://xxxxxxxxxxx.supabase.co"
                  value={sbUrl}
                  onChange={e => setSbUrl(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '34px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            {/* Anon Key input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Chave Anon (anon public)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  value={sbKey}
                  onChange={e => setSbKey(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '34px', paddingRight: '40px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                />
                <button type="button" onClick={() => setShowKey(p => !p)}
                  style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Status message */}
            {syncMsg && (
              <div style={{
                fontSize: '0.8rem', padding: '10px 12px', borderRadius: '8px', lineHeight: 1.5,
                background: syncStatus === 'ok' ? 'var(--color-success-bg)' : syncStatus === 'error' ? 'var(--color-error-bg)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${syncStatusColor}`,
                color: syncStatusColor
              }}>
                {syncMsg}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={handleTestConnection} className="btn btn-secondary"
                style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem' }}
                disabled={syncStatus === 'testing'}
              >
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

          {/* Guia App Card */}
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

          {/* Support Chat Card */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-accent)' }}>
              <MessageSquare size={20} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Suporte ao Cliente</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Tem dúvidas ou precisa de ajuda? Fale com o administrador em tempo real.
            </p>
            <button onClick={() => setShowSupportChat(true)} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <MessageSquare size={16} /> Abrir Chat de Suporte
            </button>
          </div>

          {/* Install App Card */}
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
              <div style={{
                padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px dashed var(--border-color)', borderRadius: '8px',
                fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center'
              }}>
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
                  <div style={{ fontSize: '0.78rem' }}>
                    <strong>{g.label}:</strong> {g.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Network Status */}
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

          {/* Low Balance Alert */}
          <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-accent)' }}>
              <Bell size={18} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Alerta de Saldo Mínimo</h4>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number" value={lowBalanceLimit}
                  onChange={e => onLowBalanceLimitChange(Number(e.target.value))}
                  className="form-input" style={{ flexGrow: 1 }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Kz</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel" style={{
        padding: '18px',
        border: '1px solid rgba(239,68,68,0.2)',
        background: 'rgba(239,68,68,0.02)'
      }}>
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
            style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={15} /> Limpar e Reiniciar
          </button>
        </div>
      </div>

      {showGuia && <GuiaAppView onClose={() => setShowGuia(false)} />}
      
      {showSupportChat && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            maxWidth: '900px', width: '100%', height: '80vh', padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Suporte ao Cliente</h3>
              <button onClick={() => setShowSupportChat(false)} className="btn btn-secondary" style={{ padding: '6px 12px' }}>Fechar</button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ChatView currentUser={currentUser} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
