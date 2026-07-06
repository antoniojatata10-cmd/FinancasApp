import React, { useState, useRef, useEffect } from 'react';
import {
  CreditCard, CheckCircle, Clock, AlertTriangle, XCircle, Star,
  Upload, FileText, Download, Bell, Shield, Zap, Crown,
  ChevronRight, RefreshCw, Calendar, DollarSign, Banknote,
  Phone, Globe, Lock, Info
} from 'lucide-react';
import { supabase, uploadComprovativo } from '../supabaseClient';

const PLANOS = {
  Gratuito: {
    nome: 'Gratuito',
    preco: 0,
    precoAnual: 0,
    cor: '#6b7280',
    icon: <Shield size={20} />,
    features: [
      '50 lançamentos/mês',
      '5 categorias',
      'Dashboard básico',
      'Relatórios simples'
    ],
    bloqueado: []
  },
  Pro: {
    nome: 'Pro',
    preco: null, // definido pelo admin
    precoAnual: null,
    cor: '#6366f1',
    icon: <Star size={20} />,
    features: [
      'Lançamentos ilimitados',
      'Categorias ilimitadas',
      'Coach IA avançado',
      'Academia financeira',
      'Relatórios avançados',
      'Investimentos & Mercados',
      'Exportação PDF/Excel',
      'Suporte prioritário'
    ],
    bloqueado: []
  },
  Enterprise: {
    nome: 'Enterprise',
    preco: null,
    precoAnual: null,
    cor: '#f59e0b',
    icon: <Crown size={20} />,
    features: [
      'Tudo do Pro',
      'Gestão empresarial',
      'Multi-utilizadores',
      'Fluxo de caixa avançado',
      'API de integração',
      'Gestor dedicado',
      'SLA garantido'
    ],
    bloqueado: []
  }
};

const STATUS_CONFIG = {
  Ativa: { cor: '#34d399', bg: 'rgba(52,211,153,0.1)', icon: <CheckCircle size={14} /> },
  Pendente: { cor: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={14} /> },
  Expirada: { cor: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <XCircle size={14} /> },
  Suspensa: { cor: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <AlertTriangle size={14} /> },
  Cancelada: { cor: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: <XCircle size={14} /> }
};

const METODOS = [
  { id: 'multicaixa', nome: 'Multicaixa Express', icon: <Phone size={18} />, cor: '#f59e0b' },
  { id: 'transferencia', nome: 'Transferência Bancária', icon: <Banknote size={18} />, cor: '#34d399' },
  { id: 'visa', nome: 'Visa', icon: <CreditCard size={18} />, cor: '#1a56db' },
  { id: 'mastercard', nome: 'Mastercard', icon: <CreditCard size={18} />, cor: '#ef4444' },
  { id: 'paypal', nome: 'PayPal', icon: <Globe size={18} />, cor: '#0070ba' }
];

export default function SubscriptionsView({ currentUser, bankInfo, onToast, subscriptions, setSubscriptions }) {
  const [activeTab, setActiveTab] = useState('planos');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState('mensal');
  const [selectedMetodo, setSelectedMetodo] = useState(null);
  const [comprovativo, setComprovativo] = useState(null);
  const [comprovativoNome, setComprovativoNome] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const fileRef = useRef();

  const planAtual = currentUser?.Plano || 'Gratuito';
  const subscricaoAtual = (subscriptions || []).find(s =>
    (s.user_id === currentUser?.id || s.userEmail === currentUser?.Email) && s.status === 'Ativa'
  );

  const precoMensal = Number(bankInfo?.precoMensal || 2000);
  const precoAnual  = Number(bankInfo?.precoAnual  || 20000);

  const TIPOS_ACEITES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
  const EXTENSOES_ACEITES = ['png', 'jpg', 'jpeg', 'pdf'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type - only financial documents (images and PDFs)
    const ext = file.name.split('.').pop().toLowerCase();
    if (!TIPOS_ACEITES.includes(file.type) || !EXTENSOES_ACEITES.includes(ext)) {
      onToast({
        type: 'warning',
        text: '❌ Tipo de ficheiro não aceite. Só são aceites imagens (PNG, JPG) ou PDF de comprovativos bancarios.'
      });
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onToast({ type: 'warning', text: 'Ficheiro demasiado grande. Máximo 5MB.' });
      e.target.value = '';
      return;
    }
    setComprovativo(file);
    setComprovativoNome(file.name);
  };

  const handleEnviarPedido = async () => {
    if (!selectedPlan || !selectedMetodo) {
      onToast({ type: 'warning', text: 'Selecione o plano e o método de pagamento.' });
      return;
    }
    if (!comprovativo) {
      onToast({ type: 'warning', text: 'Carregue o comprovativo de pagamento.' });
      return;
    }

    setEnviando(true);
    try {
      // Upload comprovativo to Supabase Storage
      let comprovUrl = null;
      try {
        const fileExt = comprovativo.name.split('.').pop();
        const fileName = `${currentUser?.id || 'user'}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('comprovativos')
          .upload(fileName, comprovativo, { cacheControl: '3600', upsert: false });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('comprovativos')
            .getPublicUrl(fileName);
          comprovUrl = urlData?.publicUrl || null;
        }
      } catch (uploadErr) {
        console.warn('Upload falhou, prosseguindo sem comprovativo:', uploadErr);
      }

      // Insert into payments table
      const { data: newPayment, error: insertError } = await supabase
        .from('payments')
        .insert([{
          user_id:           currentUser?.id,
          plano:             selectedPlan,
          periodo:           selectedPeriodo,
          metodo:            selectedMetodo,
          valor:             selectedPeriodo === 'mensal' ? precoMensal : precoAnual,
          comprovativo_url:  comprovUrl,
          comprovativo_nome: comprovativoNome,
          status:            'Pendente'
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local subscriptions list
      if (setSubscriptions && newPayment) {
        setSubscriptions(prev => [newPayment, ...(prev || [])]);
      }

      setEnviado(true);
      onToast({ type: 'success', text: 'Pedido de subscrição enviado! Aguarde aprovação do administrador.' });
    } catch (err) {
      console.error('Erro ao enviar pedido:', err);
      onToast({ type: 'warning', text: 'Erro ao enviar pedido: ' + (err.message || 'Tente novamente.') });
    } finally {
      setEnviando(false);
    }
  };

  const historicoUser = (subscriptions || []).filter(s =>
    s.user_id === currentUser?.id || s.userEmail === currentUser?.Email
  );

  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '20px'
  };

  return (
    <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={22} style={{ color: 'var(--color-accent)' }} />
          Subscrições & Planos
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Gerencie o seu plano e histórico de pagamentos
        </p>
      </div>

      {/* Status Atual */}
      <div style={{
        ...cardStyle,
        background: planAtual === 'Gratuito'
          ? 'rgba(107,114,128,0.08)'
          : planAtual === 'Pro'
            ? 'rgba(99,102,241,0.08)'
            : 'rgba(245,158,11,0.08)',
        border: `1px solid ${planAtual === 'Gratuito' ? 'rgba(107,114,128,0.2)' : planAtual === 'Pro' ? 'rgba(99,102,241,0.25)' : 'rgba(245,158,11,0.25)'}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: PLANOS[planAtual]?.cor || '#6b7280',
            width: '44px', height: '44px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            {PLANOS[planAtual]?.icon}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>Plano {planAtual}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {subscricaoAtual ? `Válido até: ${new Date(subscricaoAtual.dataExpiracao || Date.now() + 30 * 86400000).toLocaleDateString('pt-PT')}` : 'Sem subscrição activa'}
            </div>
          </div>
        </div>
        {subscricaoAtual && (
          <div style={{
            ...STATUS_CONFIG[subscricaoAtual.status],
            padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            {STATUS_CONFIG[subscricaoAtual.status]?.icon}
            {subscricaoAtual.status}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
        {['planos', 'pagamento', 'historico'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px 16px', borderRadius: '8px 8px 0 0',
            fontWeight: activeTab === tab ? 700 : 500,
            color: activeTab === tab ? 'var(--color-accent)' : 'var(--text-secondary)',
            borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
            fontSize: '0.85rem'
          }}>
            {tab === 'planos' ? '🎯 Planos' : tab === 'pagamento' ? '💳 Fazer Upgrade' : '📜 Histórico'}
          </button>
        ))}
      </div>

      {/* TAB: PLANOS */}
      {activeTab === 'planos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {Object.entries(PLANOS).map(([key, plano]) => (
            <div key={key} style={{
              ...cardStyle,
              border: `2px solid ${planAtual === key ? plano.cor : 'rgba(255,255,255,0.07)'}`,
              position: 'relative', transition: 'all 0.2s'
            }}>
              {planAtual === key && (
                <div style={{
                  position: 'absolute', top: '-10px', right: '16px',
                  background: plano.cor, color: '#fff', fontSize: '0.68rem',
                  fontWeight: 800, padding: '3px 10px', borderRadius: '10px'
                }}>ACTUAL</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  background: plano.cor, width: '38px', height: '38px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}>{plano.icon}</div>
                <div>
                  <div style={{ fontWeight: 800 }}>{plano.nome}</div>
                  <div style={{ fontSize: '0.78rem', color: plano.cor, fontWeight: 700 }}>
                    {key === 'Gratuito' ? 'Grátis'
                      : `${precoMensal.toLocaleString('pt-AO')} Kz/mês`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {plano.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                    <CheckCircle size={13} style={{ color: plano.cor, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>
              {key !== 'Gratuito' && planAtual !== key && (
                <button onClick={() => { setSelectedPlan(key); setActiveTab('pagamento'); }} style={{
                  marginTop: '16px', width: '100%', padding: '10px',
                  background: `${plano.cor}22`, border: `1px solid ${plano.cor}55`,
                  color: plano.cor, borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}>
                  Escolher {plano.nome} <ChevronRight size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB: PAGAMENTO */}
      {activeTab === 'pagamento' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {enviado ? (
            <div style={{
              ...cardStyle, textAlign: 'center', padding: '40px 24px',
              background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)'
            }}>
              <CheckCircle size={48} style={{ color: '#34d399', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Pedido Enviado!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
                O seu comprovativo foi submetido. Aguarde a aprovação do administrador (normalmente em 24h).
              </p>
              <button onClick={() => { setEnviado(false); setActiveTab('historico'); }} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                Ver Histórico
              </button>
            </div>
          ) : (
            <>
              {/* Selecionar Plano */}
              <div style={cardStyle}>
                <div style={{ fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={16} style={{ color: 'var(--color-accent)' }} /> 1. Selecione o Plano
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['Pro', 'Enterprise'].map(p => (
                    <button key={p} onClick={() => setSelectedPlan(p)} style={{
                      padding: '12px', border: `2px solid ${selectedPlan === p ? PLANOS[p].cor : 'rgba(255,255,255,0.1)'}`,
                      background: selectedPlan === p ? `${PLANOS[p].cor}15` : 'transparent',
                      color: selectedPlan === p ? PLANOS[p].cor : 'var(--text-secondary)',
                      borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}>
                      {p === 'Pro' ? '⭐' : '👑'} {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selecionar Período */}
              <div style={cardStyle}>
                <div style={{ fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} style={{ color: 'var(--color-accent)' }} /> 2. Período de Pagamento
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={() => setSelectedPeriodo('mensal')} style={{
                    padding: '14px', border: `2px solid ${selectedPeriodo === 'mensal' ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)'}`,
                    background: selectedPeriodo === 'mensal' ? 'rgba(99,102,241,0.1)' : 'transparent',
                    color: selectedPeriodo === 'mensal' ? 'var(--color-accent)' : 'var(--text-secondary)',
                    borderRadius: '10px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s'
                  }}>
                    <div style={{ fontSize: '1.1rem' }}>{precoMensal.toLocaleString('pt-AO')} Kz</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>por mês</div>
                  </button>
                  <button onClick={() => setSelectedPeriodo('anual')} style={{
                    padding: '14px', border: `2px solid ${selectedPeriodo === 'anual' ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                    background: selectedPeriodo === 'anual' ? 'rgba(245,158,11,0.1)' : 'transparent',
                    color: selectedPeriodo === 'anual' ? '#f59e0b' : 'var(--text-secondary)',
                    borderRadius: '10px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute', top: '-8px', right: '8px', background: '#f59e0b',
                      color: '#1a1a1a', fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', borderRadius: '8px'
                    }}>POUPA 17%</div>
                    <div style={{ fontSize: '1.1rem' }}>{precoAnual.toLocaleString('pt-AO')} Kz</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>por ano</div>
                  </button>
                </div>
              </div>

              {/* Dados Bancários */}
              {bankInfo?.banco && (
                <div style={{
                  ...cardStyle,
                  background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)'
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>
                    <Banknote size={16} /> Dados para Pagamento
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                    {bankInfo.banco && <div><span style={{ color: 'var(--text-muted)' }}>Banco: </span><strong>{bankInfo.banco}</strong></div>}
                    {bankInfo.titular && <div><span style={{ color: 'var(--text-muted)' }}>Titular: </span><strong>{bankInfo.titular}</strong></div>}
                    {bankInfo.iban && <div><span style={{ color: 'var(--text-muted)' }}>IBAN: </span><strong style={{ fontFamily: 'monospace' }}>{bankInfo.iban}</strong></div>}
                    {bankInfo.conta && <div><span style={{ color: 'var(--text-muted)' }}>Nº Conta: </span><strong style={{ fontFamily: 'monospace' }}>{bankInfo.conta}</strong></div>}
                    {bankInfo.telefone && <div><span style={{ color: 'var(--text-muted)' }}>Multicaixa Express: </span><strong>{bankInfo.telefone}</strong></div>}
                    {bankInfo.referencia && <div><span style={{ color: 'var(--text-muted)' }}>Referência: </span><strong>{bankInfo.referencia}</strong></div>}
                  </div>
                </div>
              )}

              {/* Método de Pagamento */}
              <div style={cardStyle}>
                <div style={{ fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={16} style={{ color: 'var(--color-accent)' }} /> 3. Método de Pagamento
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {METODOS.map(m => (
                    <button key={m.id} onClick={() => setSelectedMetodo(m.id)} style={{
                      padding: '12px 16px',
                      border: `2px solid ${selectedMetodo === m.id ? m.cor : 'rgba(255,255,255,0.08)'}`,
                      background: selectedMetodo === m.id ? `${m.cor}12` : 'transparent',
                      borderRadius: '10px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      color: selectedMetodo === m.id ? m.cor : 'var(--text-secondary)',
                      fontWeight: selectedMetodo === m.id ? 700 : 500, transition: 'all 0.2s'
                    }}>
                      <span style={{ color: m.cor }}>{m.icon}</span>
                      {m.nome}
                      {selectedMetodo === m.id && <CheckCircle size={14} style={{ marginLeft: 'auto', color: m.cor }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Comprovativo */}
              <div style={cardStyle}>
                <div style={{ fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={16} style={{ color: 'var(--color-accent)' }} /> 4. Comprovativo de Pagamento
                </div>
                {/* Info sobre documentos aceites */}
                <div style={{
                  padding: '10px 14px', background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px',
                  fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px'
                }}>
                  <strong style={{ color: 'var(--color-accent)' }}>📎 Documentos aceites:</strong> Captura de écrã ou PDF do comprovativo de transferência bancária, recibo Multicaixa Express, ou histórico de pagamento da app do banco.
                  <br /><span style={{ color: 'var(--color-error)', fontWeight: 600 }}>❌ Não são aceites:</span> Documentos de identidade, capturas de écrã genéricas, ou outros documentos não relacionados com o pagamento.
                </div>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${comprovativo ? '#34d399' : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer',
                    background: comprovativo ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s'
                  }}
                >
                  {comprovativo ? (
                    <div style={{ color: '#34d399' }}>
                      <CheckCircle size={28} style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{comprovativoNome}</div>
                      <div style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: '4px' }}>Clique para alterar</div>
                      {/* Preview for images */}
                      {comprovativo.type.startsWith('image/') && (
                        <img
                          src={URL.createObjectURL(comprovativo)}
                          alt="pré-visualização"
                          style={{ maxWidth: '200px', maxHeight: '120px', borderRadius: '8px', marginTop: '10px', border: '1px solid rgba(52,211,153,0.3)', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>
                      <Upload size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Clique para carregar comprovativo</div>
                      <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>PNG, JPG ou PDF • Máximo 5MB</div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>


              <button
                onClick={handleEnviarPedido}
                disabled={enviando}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '0.95rem', opacity: enviando ? 0.7 : 1 }}
              >
                {enviando ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={16} />}
                {enviando ? ' A enviar...' : ' Enviar Pedido de Subscrição'}
              </button>
            </>
          )}
        </div>
      )}

      {/* TAB: HISTÓRICO */}
      {activeTab === 'historico' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {historicoUser.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>Sem histórico de subscrições</p>
            </div>
          ) : (
            historicoUser.map(sub => {
              const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.Pendente;
              return (
                <div key={sub.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Plano {sub.plano} — {sub.periodo}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(sub.dataPedido).toLocaleDateString('pt-PT')} · {METODOS.find(m => m.id === sub.metodo)?.nome || sub.metodo}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        background: statusCfg.bg, color: statusCfg.cor, border: `1px solid ${statusCfg.cor}44`,
                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        {statusCfg.icon} {sub.status}
                      </div>
                      <div style={{ fontWeight: 800, color: 'var(--color-accent)', fontSize: '0.95rem' }}>
                        {Number(sub.valor || 0).toLocaleString('pt-AO')} Kz
                      </div>
                    </div>
                  </div>
                  {sub.observacao && (
                    <div style={{
                      marginTop: '10px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)',
                      borderLeft: `3px solid ${statusCfg.cor}`
                    }}>
                      <strong>Observação:</strong> {sub.observacao}
                    </div>
                  )}
                  {sub.comprovativoNome && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <FileText size={12} /> {sub.comprovativoNome}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
