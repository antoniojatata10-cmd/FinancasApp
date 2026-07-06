import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Shield, GraduationCap, BarChart2, CheckCircle,
  Star, ArrowRight, Sparkles, Users, Globe, ChevronDown
} from 'lucide-react';

export default function LandingView({ onShowLogin, onShowRegister }) {
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  const features = [
    {
      icon: <BarChart2 size={28} />,
      color: '#6366f1',
      title: 'Dashboard Completo',
      desc: 'Veja o seu saldo, entradas, saídas e gráficos de evolução em tempo real. Tudo numa só tela.'
    },
    {
      icon: <GraduationCap size={28} />,
      color: '#f59e0b',
      title: 'Academia Financeira',
      desc: 'Aprenda finanças com aulas adaptadas à realidade angolana. De iniciante a especialista.'
    },
    {
      icon: <TrendingUp size={28} />,
      color: '#34d399',
      title: 'Investimentos',
      desc: 'Acompanhe taxas BNA, BODIVA e simule o crescimento do seu dinheiro com juros compostos.'
    },
    {
      icon: <Sparkles size={28} />,
      color: '#a78bfa',
      title: 'Coach IA',
      desc: 'Consultor financeiro inteligente que analisa os seus dados e dá conselhos personalizados.'
    },
    {
      icon: <Shield size={28} />,
      color: '#fb7185',
      title: 'Seguro e Privado',
      desc: 'Os seus dados ficam encriptados e protegidos. Apenas você tem acesso à sua informação.'
    },
    {
      icon: <Globe size={28} />,
      color: '#22d3ee',
      title: 'Multi-dispositivo',
      desc: 'Acesse do telemóvel e do computador. Os dados sincronizam automaticamente via cloud.'
    }
  ];

  const plans = [
    {
      name: 'Gratuito',
      price: '0',
      color: '#6b7280',
      features: ['50 lançamentos/mês', 'Dashboard e Relatórios', 'Categorias básicas', 'Acesso a 1 dispositivo'],
      cta: 'Começar Grátis',
      highlight: false
    },
    {
      name: 'Pro',
      price: '2.000',
      color: '#6366f1',
      features: ['Lançamentos ilimitados', 'Coach IA incluído', 'Academia Financeira', 'Módulo Investimentos', 'Módulo Empresa', 'Suporte prioritário'],
      cta: 'Aderir ao Pro',
      highlight: true
    },
    {
      name: 'Enterprise',
      price: '5.000',
      color: '#f59e0b',
      features: ['Tudo do Pro', 'Sistema de Riqueza Pessoal', 'Mapeamento financeiro completo', 'Consultoria financeira avançada', 'Relatórios Enterprise', 'Acesso multi-empresa'],
      cta: 'Aderir ao Enterprise',
      highlight: false
    }
  ];

  const stats = [
    { value: '500+', label: 'Utilizadores' },
    { value: '50K+', label: 'Lançamentos' },
    { value: '98%', label: 'Satisfação' },
    { value: '24/7', label: 'Disponível' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #131a30 0%, #0a0f1d 60%, #000 100%)',
      color: 'var(--text-primary)',
      overflowX: 'hidden'
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'fixed', top: '-200px', right: '-200px', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: '-150px', left: '-150px', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0
      }} />

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,15,29,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #a5b4fc)',
            width: '36px', height: '36px', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, color: '#fff', fontSize: '1.1rem',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)'
          }}>F</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Finança ao Ponto</span>
          <span style={{
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '10px', padding: '2px 8px', fontSize: '0.6rem',
            color: '#a5b4fc', fontWeight: 700
          }}>Angola 🇦🇴</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={onShowLogin}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)', padding: '8px 18px', borderRadius: '8px',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
          >
            Entrar
          </button>
          <button
            onClick={onShowRegister}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', color: '#fff', padding: '8px 18px', borderRadius: '8px',
              cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
              boxShadow: '0 0 15px rgba(99,102,241,0.4)',
              transition: 'all 0.2s'
            }}
          >
            Criar Conta
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '80px 24px 60px',
        textAlign: 'center',
        position: 'relative', zIndex: 1,
        opacity: animIn ? 1 : 0,
        transform: animIn ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s ease'
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '20px', padding: '6px 16px', marginBottom: '28px',
          color: '#f59e0b', fontSize: '0.78rem', fontWeight: 700
        }}>
          <Star size={13} fill="#f59e0b" />
          O app de finanças feito para a realidade angolana
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 900, lineHeight: 1.15,
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #fff 30%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Controle Total das<br />Suas Finanças em Kwanza
        </h1>

        <p style={{
          fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
          color: 'var(--text-secondary)', lineHeight: 1.7,
          maxWidth: '600px', margin: '0 auto 36px'
        }}>
          Registe as suas entradas e saídas, aprenda educação financeira com aulas sobre a realidade de Angola,
          invista melhor e alcance a liberdade financeira com o <strong style={{ color: '#a5b4fc' }}>Finança ao Ponto</strong>.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onShowRegister}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', color: '#fff',
              padding: '14px 32px', borderRadius: '12px',
              cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 0 30px rgba(99,102,241,0.5)',
              transition: 'all 0.2s'
            }}
          >
            Começar Grátis <ArrowRight size={18} />
          </button>
          <button
            onClick={onShowLogin}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--text-primary)',
              padding: '14px 32px', borderRadius: '12px',
              cursor: 'pointer', fontWeight: 600, fontSize: '1rem',
              transition: 'all 0.2s'
            }}
          >
            Já tenho conta
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap',
          marginTop: '60px', padding: '24px',
          background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
          maxWidth: '600px', margin: '60px auto 0'
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#a5b4fc' }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '60px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            Tudo que Precisa num Só App
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '44px', fontSize: '0.92rem' }}>
            Ferramentas profissionais adaptadas à economia angolana
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                padding: '24px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                transition: 'all 0.3s',
                cursor: 'default'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `rgba(255,255,255,0.04)`;
                  e.currentTarget.style.borderColor = `${f.color}40`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: `${f.color}18`, border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color, marginBottom: '16px'
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section style={{ padding: '60px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            Planos para Todos os Objetivos
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '44px', fontSize: '0.92rem' }}>
            Comece gratuitamente e faça upgrade quando precisar de mais
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px', alignItems: 'start'
          }}>
            {plans.map((plan, i) => (
              <div key={i} style={{
                padding: '28px 24px',
                background: plan.highlight ? `linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08))` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${plan.highlight ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '20px',
                position: 'relative',
                boxShadow: plan.highlight ? '0 0 40px rgba(99,102,241,0.15)' : 'none'
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', fontSize: '0.65rem', fontWeight: 800,
                    padding: '4px 16px', borderRadius: '20px'
                  }}>MAIS POPULAR</div>
                )}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                    background: `${plan.color}20`, border: `1px solid ${plan.color}40`,
                    color: plan.color, fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px'
                  }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: plan.color }}>{plan.price}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Kz/mês</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {plan.features.map((feat, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.83rem' }}>
                      <CheckCircle size={14} style={{ color: plan.color, flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={plan.name === 'Gratuito' ? onShowRegister : onShowLogin}
                  style={{
                    width: '100%', padding: '12px',
                    background: plan.highlight
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : `${plan.color}18`,
                    border: `1px solid ${plan.color}40`,
                    color: plan.highlight ? '#fff' : plan.color,
                    borderRadius: '10px', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.88rem',
                    boxShadow: plan.highlight ? '0 0 20px rgba(99,102,241,0.3)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative', zIndex: 1,
        background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.05))'
      }}>
        <div style={{
          maxWidth: '600px', margin: '0 auto',
          padding: '48px 32px',
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '24px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🇦🇴</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>
            Feito para Angolanos, pela Angola
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '28px', fontSize: '0.9rem' }}>
            Exemplos em Kwanza, aulas sobre alambamentos, kixiquila, BODIVA, Multicaixa Express e tudo que faz parte da realidade financeira angolana.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onShowRegister}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', color: '#fff',
                padding: '14px 28px', borderRadius: '12px',
                cursor: 'pointer', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 0 20px rgba(99,102,241,0.4)'
              }}
            >
              <Users size={16} /> Criar Conta Grátis
            </button>
            <button
              onClick={onShowLogin}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-primary)',
                padding: '14px 28px', borderRadius: '12px',
                cursor: 'pointer', fontWeight: 600
              }}
            >
              Entrar na Conta
            </button>
          </div>
        </div>

        <p style={{ marginTop: '32px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          © 2026 Finança ao Ponto • Todos os direitos reservados
        </p>
      </section>
    </div>
  );
}
