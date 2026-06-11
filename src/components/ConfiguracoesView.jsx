import React, { useState } from 'react';
import {
  Settings, Shield, Wifi, WifiOff, RefreshCcw, Trash2, Bell, Download,
  Monitor, Smartphone, Apple, User, Mail, Phone, Lock, Eye, EyeOff,
  Save, Globe, Star, CheckCircle
} from 'lucide-react';

export default function ConfiguracoesView({
  role, userEmail, currentUser, users, setUsers,
  isOffline, lowBalanceLimit, installPrompt,
  onRoleChange, onUserEmailChange, onOfflineToggle,
  onLowBalanceLimitChange, onResetData, onInstallApp, onToast
}) {
  const [editNome, setEditNome] = useState(currentUser?.Nome || '');
  const [editTelefone, setEditTelefone] = useState(currentUser?.Telefone || '');
  const [editPais, setEditPais] = useState(currentUser?.Pais || 'Angola');
  const [editSenhaAtual, setEditSenhaAtual] = useState('');
  const [editSenhaNova, setEditSenhaNova] = useState('');
  const [editSenhaConfirm, setEditSenhaConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const isSuperAdmin = role === 'SuperAdmin';

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

    // Password change if fields filled
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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Ajustes e Perfil</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Gerencie o seu perfil, senha e preferências do aplicativo.
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
          <div style={{
            borderTop: '1px solid var(--border-color)', paddingTop: '14px',
            display: 'flex', flexDirection: 'column', gap: '10px'
          }}>
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

          {/* Download / Install Card */}
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

          {/* Network Simulator Card */}
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

    </div>
  );
}
