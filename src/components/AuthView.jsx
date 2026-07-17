import React, { useState } from 'react';
import { Mail, User, Shield, AlertCircle, LogIn, UserPlus, Lock, Eye, EyeOff, Phone, Globe, CheckCircle } from 'lucide-react';
import { supabase } from "../supabaseClient"; // adjust import path if needed

export default function AuthView({ users, onLogin, onRegister }) {
  const [activeTab, setActiveTab] = useState('login');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register State
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Por favor, preencha o e-mail e a senha.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim().toLowerCase(),
      password: loginPassword
    });

    if (error) {
      setLoginError(error.message);
      return;
    }

    // Fetch the user profile after login to pass to parent
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileErr) {
      setLoginError('Erro ao obter perfil: ' + profileErr.message);
      return;
    }

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      setLoginError('A sua conta foi bloqueada pelo administrador.');
      return;
    }

    const user = {
      id: data.user.id,
      Email: data.user.email,
      Nome: profile?.full_name || '',
      Role: profile?.role || 'user',
      Plano: profile?.plan || 'Gratuito',
      Ativo: profile?.is_active ?? true,
      Pais: profile?.country || '',
      Telefone: profile?.phone || ''
    };
    onLogin(user);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');

    if (!regNome.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Preencha todos os campos obrigatórios (*).');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('As senhas não correspondem.');
      return;
    }

    const emailClean = regEmail.trim().toLowerCase();

    // Check if email already exists via Supabase auth
    const { data: existing, error: existingErr } = await supabase.auth.signUp({
      email: emailClean,
      password: regPassword,
      options: {
        data: {
          full_name: regNome.trim(),
          phone: regTelefone.trim(),
          country: regPais
        }
      }
    });
    if (existingErr && existingErr.message.includes('User already registered')) {
      setRegError('Este e-mail já está cadastrado. Tente fazer login.');
      return;
    }
    if (existingErr && !existingErr.message.includes('User already registered')) {
      setRegError('Erro ao registrar: ' + existingErr.message);
      return;
    }

    // Create/update profile record
    const userId = existing?.user?.id;
    if (!userId) {
      setRegError('Falha ao obter ID do usuário recém-criado.');
      return;
    }
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: regNome.trim(),
      phone: regTelefone.trim(),
      country: regPais,
      role: 'user',
      plan: 'Gratuito',
      is_active: true
    });
    if (profileErr) {
      setRegError('Erro ao salvar perfil: ' + profileErr.message);
      return;
    }

    setRegSuccess(true);
    // Auto login after registration
    const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
      email: emailClean,
      password: regPassword
    });
    if (loginErr) {
      setRegError('Registrado, mas falha ao fazer login: ' + loginErr.message);
      setRegSuccess(false);
      return;
    }
    const { data: profileAfter, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single();
    const user = {
      id: loginData.user.id,
      Email: loginData.user.email,
      Nome: profileAfter?.full_name || '',
      Role: profileAfter?.role || 'user',
      Plano: profileAfter?.plan || 'Gratuito',
      Ativo: profileAfter?.is_active ?? true,
      Pais: profileAfter?.country || '',
      Telefone: profileAfter?.phone || ''
    };
    onLogin(user);
  };

  if (regSuccess) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle at center, #131a30 0%, #0a0f1d 100%)', padding: '16px'
      }}>
        <div className="glass-panel animate-fade-in" style={{
          padding: '48px 32px', textAlign: 'center', maxWidth: '380px', width: '100%', gap: '16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
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
            Controle financeiro profissional — acesse ou crie a sua conta
          </p>
        </div>

        {/* Tab Switchers */}
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

        {/* --- LOGIN VIEW --- */}
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px', marginTop: '4px', fontSize: '0.95rem' }}>
              <LogIn size={16} style={{ marginRight: '6px' }} />
              Acessar Conta
            </button>
          </form>
        )}

        {/* --- REGISTER VIEW --- */}
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
                    type={showRegPass ? 'text' : 'password'} placeholder="Confirme a senha"
                    value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="form-input" style={inputStyle} required
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Telefone (opcional)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Phone size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text" placeholder="+244 923 456 789"
                  value={regTelefone} onChange={(e) => setRegTelefone(e.target.value)}
                  className="form-input" style={inputStyle}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">País</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Globe size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text" placeholder="Angola"
                  value={regPais} onChange={(e) => setRegPais(e.target.value)}
                  className="form-input" style={inputStyle}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.93rem' }}>
              <UserPlus size={16} style={{ marginRight: '6px' }} />
              Criar Conta
            </button>
          </form>
        )}

      </div>
    </div>
  );
}