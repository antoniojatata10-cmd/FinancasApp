import React, { useState } from 'react';
import {
  Mail, User, AlertCircle, LogIn, UserPlus,
  Lock, Eye, EyeOff, CheckCircle, Globe, Phone, ArrowLeft
} from 'lucide-react';

import { supabase } from '../supabaseClient';

export default function AuthView({ initialTab = 'login', onBackToLanding }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // LOGIN
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // REGISTER
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regTelefone, setRegTelefone] = useState('');
  const [regPais, setRegPais] = useState('Angola');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);

  const inputStyle = {
    width: '100%',
    paddingLeft: '36px'
  };

  // ================= LOGIN =================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Por favor, preencha o e-mail e a senha.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim().toLowerCase(),
      password: loginPassword,
    });

    if (error) {
      setLoginError(
        error.message === 'Invalid login credentials'
          ? 'Credenciais inválidas. Verifique o e-mail e a senha.'
          : error.message
      );
    }
    setLoading(false);
  };

  // ================= REGISTER =================
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setLoading(true);

    if (!regNome.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Preencha todos os campos obrigatórios (*).');
      setLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setRegError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('As senhas não correspondem.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      options: {
        data: {
          full_name: regNome.trim(),
          phone: regTelefone.trim(),
          country: regPais,
          role: 'user'
        }
      }
    });

    if (error) {
      setRegError(error.message);
    } else {
      setRegSuccess(true);
      setTimeout(() => {
        setLoginEmail(regEmail.trim().toLowerCase());
        setActiveTab('login');
        setRegSuccess(false);
      }, 2000);
    }
    setLoading(false);
  };

  // ================= SUCCESS SCREEN =================
  if (regSuccess) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #131a30 0%, #0a0f1d 100%)',
        padding: '16px'
      }}>
        <div className="glass-panel animate-fade-in" style={{
          padding: '48px 32px', textAlign: 'center', maxWidth: '380px', width: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
        }}>
          <div style={{
            background: 'var(--color-success-bg)', border: '2px solid var(--color-success)',
            borderRadius: '50%', width: '64px', height: '64px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <CheckCircle size={36} style={{ color: 'var(--color-success)' }} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Conta Criada!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Bem-vindo(a) ao Finança ao Ponto, <strong style={{ color: 'var(--text-primary)' }}>{regNome}</strong>!<br />
            Redirecionando para o login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at center, #131a30 0%, #0a0f1d 100%)', padding: '16px'
    }} className="animate-fade-in">

      <div className="glass-panel" style={{
        width: '100%', maxWidth: '440px', padding: '32px 24px',
        display: 'flex', flexDirection: 'column', gap: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>

        {/* Back to Landing */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              color: 'var(--text-muted)', fontSize: '0.82rem',
              padding: '0', alignSelf: 'flex-start'
            }}
          >
            <ArrowLeft size={14} /> Voltar ao início
          </button>
        )}

        {/* Brand Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, #a5b4fc 100%)',
            width: '56px', height: '56px', borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, color: '#fff', fontSize: '1.8rem', boxShadow: 'var(--shadow-glow)'
          }}>
            F
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Finança ao Ponto
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            Acesso seguro à sua área financeira
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          border: '1px solid var(--border-color)', borderRadius: '8px',
          padding: '2px', backgroundColor: 'rgba(255, 255, 255, 0.02)'
        }}>
          <button
            onClick={() => setActiveTab('login')}
            style={{
              padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'login' ? 'var(--color-accent)' : 'transparent',
              color: activeTab === 'login' ? '#fff' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <LogIn size={15} /> Entrar
          </button>
          <button
            onClick={() => setActiveTab('register')}
            style={{
              padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'register' ? 'var(--color-accent)' : 'transparent',
              color: activeTab === 'register' ? '#fff' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <UserPlus size={15} /> Cadastrar
          </button>
        </div>

        {/* ─── LOGIN ─── */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="animate-fade-in">
            {loginError && (
              <div style={{
                background: 'var(--color-error-bg)', color: 'var(--color-error)',
                border: '1px solid var(--color-error)', padding: '10px 12px',
                borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">E-mail *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="form-input"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Senha *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  placeholder="Sua senha secreta"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="form-input"
                  style={{ ...inputStyle, paddingRight: '40px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(p => !p)}
                  style={{
                    position: 'absolute', right: '10px', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                  }}
                >
                  {showLoginPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '13px', marginTop: '4px', fontSize: '0.95rem' }}>
              <LogIn size={16} style={{ marginRight: '6px' }} />
              {loading ? 'A processar...' : 'Acessar Conta'}
            </button>
          </form>
        )}

        {/* ─── REGISTER ─── */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
            {regError && (
              <div style={{
                background: 'var(--color-error-bg)', color: 'var(--color-error)',
                border: '1px solid var(--color-error)', padding: '10px 12px',
                borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{regError}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nome Completo *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text" placeholder="Seu nome completo"
                  value={regNome} onChange={(e) => setRegNome(e.target.value)}
                  className="form-input" style={inputStyle} required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">E-mail *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="email" placeholder="seu@email.com"
                  value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                  className="form-input" style={inputStyle} required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Senha *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type={showRegPass ? 'text' : 'password'} placeholder="Min. 6 chars"
                    value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    className="form-input" style={inputStyle} required
                  />
                  <button type="button" onClick={() => setShowRegPass(p => !p)}
                    style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showRegPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirmar Senha *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="password" placeholder="Repita a senha"
                    value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="form-input" style={inputStyle} required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Telefone</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="tel" placeholder="+244..."
                    value={regTelefone} onChange={(e) => setRegTelefone(e.target.value)}
                    className="form-input" style={inputStyle}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">País</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Globe size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', zIndex: 1 }} />
                  <select
                    value={regPais} onChange={(e) => setRegPais(e.target.value)}
                    className="form-input" style={{ ...inputStyle, appearance: 'none' }}
                  >
                    <option>Angola</option>
                    <option>Portugal</option>
                    <option>Brasil</option>
                    <option>Moçambique</option>
                    <option>Cabo Verde</option>
                    <option>Outro</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '13px', marginTop: '4px', fontSize: '0.95rem' }}>
              <UserPlus size={16} style={{ marginRight: '6px' }} />
              {loading ? 'A processar...' : 'Criar Conta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}