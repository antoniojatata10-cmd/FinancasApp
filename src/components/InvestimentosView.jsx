import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, RefreshCw, AlertTriangle, Star,
  ChevronUp, ChevronDown, Target, Globe, Activity, Zap,
  BookOpen, Plus, Trash2, DollarSign, PieChart, BarChart2,
  CheckCircle, ArrowRight, Clock, Lightbulb, Shield
} from 'lucide-react';

// ─── Simulated BODIVA/BNA market data ────────────────────────────────────────
const BASE_BODIVA = [
  { ticker: 'OT-TX-2029', nome: 'Obrigações do Tesouro Angolano (5 Anos)', bolsa: 'BODIVA', basePreco: 99679, taxaAnual: 17, tipo: 'Tesouro', risco: 'Baixo', cor: '#34d399' },
  { ticker: 'BT-TX-2026', nome: 'Bilhetes do Tesouro Angolano (364 Dias)', bolsa: 'BNA', basePreco: 50148, taxaAnual: 14.5, tipo: 'Tesouro', risco: 'Baixo', cor: '#34d399' },
  { ticker: 'BAI', nome: 'Banco Angolano de Investimentos S.A.', bolsa: 'BODIVA', basePreco: 18453, taxaAnual: null, tipo: 'Ação', risco: 'Médio', cor: '#6366f1' },
  { ticker: 'BCI', nome: 'Banco de Comércio e Indústria', bolsa: 'BODIVA', basePreco: 4183, taxaAnual: null, tipo: 'Ação', risco: 'Médio', cor: '#6366f1' },
  { ticker: 'VOO', nome: 'Vanguard S&P 500 ETF', bolsa: 'Internacional', basePreco: 46103, taxaAnual: null, tipo: 'ETF', risco: 'Médio-Alto', cor: '#f59e0b' },
  { ticker: 'URTH', nome: 'iShares MSCI World ETF', bolsa: 'Internacional', basePreco: 12493, taxaAnual: null, tipo: 'ETF', risco: 'Médio-Alto', cor: '#f59e0b' },
];

const PERFIS = [
  { id: 'conservador', nome: 'Conservador', icon: '🛡️', cor: '#34d399', desc: 'Prioriza segurança e preservação do capital. Aceita baixo retorno para minimizar risco.', taxaRef: 14.5, alocacao: { 'BTs (Bilhetes Tesouro)': 40, 'OTs (Obrigações Tesouro)': 35, 'Depósitos a Prazo': 20, 'Ações BODIVA': 5 } },
  { id: 'moderado', nome: 'Moderado', icon: '⚖️', cor: '#f59e0b', desc: 'Equilíbrio entre segurança e crescimento. Aceita alguma volatilidade por melhor retorno.', taxaRef: 17, alocacao: { 'OTs (Obrigações Tesouro)': 30, 'Ações BODIVA': 25, 'ETFs Internacionais': 25, 'Depósitos a Prazo': 20 } },
  { id: 'arrojado', nome: 'Arrojado', icon: '🚀', cor: '#6366f1', desc: 'Prioriza crescimento máximo. Aceita alta volatilidade em busca de retornos expressivos.', taxaRef: 22, alocacao: { 'Ações BODIVA': 35, 'ETFs Internacionais': 35, 'OTs (Obrigações Tesouro)': 20, 'Divisas (USD/EUR)': 10 } },
];

const QUIZ_PERGUNTAS = [
  { pergunta: 'Se o seu investimento caísse 20% num mês, o que faria?', opcoes: [{ texto: 'Venderia tudo imediatamente para parar o prejuízo', pontos: 1 }, { texto: 'Ficaria preocupado mas aguardaria recuperação', pontos: 2 }, { texto: 'Aproveitaria para comprar mais ao preço reduzido', pontos: 3 }] },
  { pergunta: 'Qual é o seu horizonte de investimento?', opcoes: [{ texto: 'Menos de 1 ano — preciso do dinheiro em breve', pontos: 1 }, { texto: 'Entre 1 e 5 anos — planeio a médio prazo', pontos: 2 }, { texto: 'Mais de 5 anos — estou a construir riqueza a longo prazo', pontos: 3 }] },
  { pergunta: 'Qual rendimento anual esperado é mais adequado ao seu perfil?', opcoes: [{ texto: '10-14% com baixo risco (BTs e OTs do Tesouro)', pontos: 1 }, { texto: '15-18% com risco médio (mix tesouro + ações)', pontos: 2 }, { texto: '+20% com alto risco (ações e ETFs internacionais)', pontos: 3 }] },
  { pergunta: 'Qual é o seu principal objetivo ao investir?', opcoes: [{ texto: 'Preservar o meu dinheiro de forma segura (0% risco extra)', pontos: 1 }, { texto: 'Comprar património no futuro de forma equilibrada', pontos: 2 }, { texto: 'Maximizar crescimento de forma agressiva', pontos: 3 }] },
];

const GUIA_BODIVA = [
  { passo: 1, titulo: 'Abrir Conta num Banco Parceiro BODIVA', desc: 'Dirija-se a um banco autorizado como BFA, BAI, BCI ou Millennium Atlântico. Solicite a abertura de conta de valores mobiliários. Necessita: BI/Passaporte, NIF e comprovativo de morada.', dica: 'O BAI e BFA possuem o processo mais simplificado para investidores individuais em 2025.', icon: '🏦', ai: 'Recomendo começar pelo BAI ou BFA — processos mais digitais e rápidos. Separe os documentos com antecedência.' },
  { passo: 2, titulo: 'Depositar Capital de Investimento', desc: 'Efectue uma transferência ou depósito para a conta de custódia de valores mobiliários. Capital mínimo recomendado para iniciar: 500.000 Kz. Para BTs, o lote mínimo é normalmente 50.000 Kz.', dica: 'Nunca invista mais do que pode perder sem comprometer o seu fundo de emergência.', icon: '💰', ai: 'Regra de ouro: só invista na BODIVA dinheiro que não vai precisar nos próximos 12 meses. Mantenha sempre 6 meses de despesas como fundo de emergência.' },
  { passo: 3, titulo: 'Escolher o Instrumento Financeiro', desc: 'Tipos disponíveis na BODIVA:\n• BTs (Bilhetes do Tesouro): 91, 182 ou 364 dias. Alta liquidez.\n• OTs (Obrigações do Tesouro): 2, 5 ou 10 anos. Cupões semestrais.\n• Ações: BAI, BCI e outras cotadas.\n• Fundos de Investimento Angolanos.', dica: 'Para iniciantes, os BTs a 364 dias são os mais recomendados — risco mínimo e retorno previsível.', icon: '📊', ai: 'Para o seu primeiro investimento BODIVA, sugiro BTs a 364 dias. Taxa de ~14,5% ao ano com garantia soberana do Estado Angolano. Após ganhar experiência, diversifique para OTs.' },
  { passo: 4, titulo: 'Colocar Ordem de Compra', desc: 'Através do banco parceiro (pessoalmente ou via app/homebanking), coloque uma ordem de subscrição para o instrumento escolhido. Especifique: quantidade, prazo e preço máximo aceitável.', dica: 'As emissões de BTs ocorrem semanalmente pelo BNA. OTs têm calendário publicado mensalmente.', icon: '📋', ai: 'Coloque ordens de compra nos primeiros dias de emissão para garantir alocação. As emissões de BTs esgotam-se rapidamente devido à alta procura.' },
  { passo: 5, titulo: 'Acompanhar o Investimento', desc: 'Após a compra, acompanhe na plataforma do banco:\n• Valor de custódia actualizado\n• Data de vencimento\n• Pagamento de cupões (para OTs)\n• Tributação: IRT de 10% sobre rendimentos', dica: 'Registe os vencimentos no calendário e planeie a reinversão dos lucros.', icon: '📈', ai: 'Estratégia compound: ao receber os cupões das OTs, reinvista imediatamente em novos BTs. Após 3-5 anos, o efeito dos juros compostos será significativo.' },
  { passo: 6, titulo: 'Reinvestir e Diversificar', desc: 'No vencimento, reinvista o capital + juros. Com o tempo, diversifique:\n1. BTs → OTs → Ações BODIVA\n2. Adicione ETFs internacionais via corretoras online\n3. Explore fundos imobiliários angolanos', dica: 'A diversificação reduz o risco sem necessariamente reduzir o retorno.', icon: '🔄', ai: 'Meta de 3 anos: 50% em títulos públicos + 30% em ações BODIVA + 20% em ETFs internacionais. Esta distribuição equilibra segurança e crescimento para o mercado angolano.' },
];

function VariacaoBadge({ variacao }) {
  const positivo = variacao >= 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.78rem', fontWeight: 700, color: positivo ? '#34d399' : '#ef4444' }}>
      {positivo ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      {Math.abs(variacao).toFixed(2)}%
    </span>
  );
}

// Simulate realistic market fluctuation based on time seed
function simulatePrice(base, seed) {
  const factor = Math.sin(seed * 0.7) * 0.008 + Math.cos(seed * 1.3) * 0.005;
  return base * (1 + factor);
}

export default function InvestimentosView({ currentUser, launches, categories }) {
  const [activeTab, setActiveTab] = useState('mercado');
  const [perfilSelecionado, setPerfilSelecionado] = useState(() => localStorage.getItem('inv_perfil') || null);
  const [quizAtivo, setQuizAtivo] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizPontos, setQuizPontos] = useState(0);
  const [quizConcluido, setQuizConcluido] = useState(false);
  const [ultimaAtt, setUltimaAtt] = useState(new Date());
  const [atualizando, setAtualizando] = useState(false);
  const [tick, setTick] = useState(0);

  // Goals state
  const [metas, setMetas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('inv_metas_v1')) || []; } catch { return []; }
  });
  const [novaMeta, setNovaMeta] = useState({ nome: '', alvo: '', proposito: '', dataLimite: '' });
  const [alocacaoMeta, setAlocacaoMeta] = useState({ metaId: '', valor: '' });

  // Simulator state
  const [simCapital, setSimCapital] = useState('100000');
  const [simMensal, setSimMensal] = useState('10000');
  const [simAnos, setSimAnos] = useState('5');
  const [simAtivo, setSimAtivo] = useState('OT-TX-2029');
  const [simTaxa, setSimTaxa] = useState('17');

  // Divisas from API
  const [divisas, setDivisas] = useState([
    { par: 'USD/AOA', preco: 922.50, variacao: 0.32 },
    { par: 'EUR/AOA', preco: 1004.80, variacao: -0.15 },
    { par: 'GBP/AOA', preco: 1165.20, variacao: 0.48 },
    { par: 'ZAR/AOA', preco: 49.80, variacao: 0.22 },
  ]);

  // Simulated BODIVA live prices
  const bodivaAtual = useMemo(() =>
    BASE_BODIVA.map(item => ({
      ...item,
      preco: simulatePrice(item.basePreco, tick + item.basePreco * 0.001),
      variacao: (Math.sin((tick + item.basePreco) * 0.003) * 2).toFixed(2)
    })),
    [tick]
  );

  // Tick every 30s to update prices
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Persist metas
  useEffect(() => {
    localStorage.setItem('inv_metas_v1', JSON.stringify(metas));
  }, [metas]);

  // Persist perfil
  useEffect(() => {
    if (perfilSelecionado) localStorage.setItem('inv_perfil', perfilSelecionado);
  }, [perfilSelecionado]);

  // Fetch real divisas
  const fetchRates = useCallback(async () => {
    setAtualizando(true);
    try {
      const r = await fetch('https://economia.awesomeapi.com.br/last/USD-AOA,EUR-AOA,GBP-AOA,ZAR-AOA');
      if (r.ok) {
        const d = await r.json();
        setDivisas([
          { par: 'USD/AOA', preco: Number(d.USDAOA?.bid || 922.5), variacao: Number(d.USDAOA?.pctChange || 0) },
          { par: 'EUR/AOA', preco: Number(d.EURAOA?.bid || 1004.8), variacao: Number(d.EURAOA?.pctChange || 0) },
          { par: 'GBP/AOA', preco: Number(d.GBPAOA?.bid || 1165.2), variacao: Number(d.GBPAOA?.pctChange || 0) },
          { par: 'ZAR/AOA', preco: Number(d.ZARAOA?.bid || 49.8), variacao: Number(d.ZARAOA?.pctChange || 0) },
        ]);
      }
    } catch { /* use fallback */ } finally {
      setAtualizando(false);
      setUltimaAtt(new Date());
    }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  // Quiz logic
  const handleQuizResposta = (pontos) => {
    const novos = quizPontos + pontos;
    if (quizStep < QUIZ_PERGUNTAS.length - 1) {
      setQuizStep(s => s + 1);
      setQuizPontos(novos);
    } else {
      const perfil = novos <= 5 ? 'conservador' : novos <= 9 ? 'moderado' : 'arrojado';
      setPerfilSelecionado(perfil);
      setQuizConcluido(true);
      setQuizAtivo(false);
    }
  };

  const reiniciarQuiz = () => { setQuizStep(0); setQuizPontos(0); setQuizConcluido(false); setQuizAtivo(true); };

  // Goals logic
  const handleAddMeta = (e) => {
    e.preventDefault();
    if (!novaMeta.nome || !novaMeta.alvo) return;
    setMetas(prev => [...prev, {
      id: Date.now().toString(),
      nome: novaMeta.nome,
      alvo: Number(novaMeta.alvo),
      proposito: novaMeta.proposito,
      dataLimite: novaMeta.dataLimite,
      alocado: 0,
      icon: novaMeta.proposito.toLowerCase().includes('car') ? '🚗' :
        novaMeta.proposito.toLowerCase().includes('cas') ? '🏠' :
        novaMeta.proposito.toLowerCase().includes('emerg') ? '🛡️' :
        novaMeta.proposito.toLowerCase().includes('viag') ? '✈️' : '🎯'
    }]);
    setNovaMeta({ nome: '', alvo: '', proposito: '', dataLimite: '' });
  };

  const handleAlocarMeta = (e) => {
    e.preventDefault();
    const valor = Number(alocacaoMeta.valor);
    if (!alocacaoMeta.metaId || !valor) return;
    setMetas(prev => prev.map(m =>
      m.id === alocacaoMeta.metaId ? { ...m, alocado: Math.min(m.alvo, m.alocado + valor) } : m
    ));
    setAlocacaoMeta({ metaId: '', valor: '' });
  };

  const handleRemoveMeta = (id) => setMetas(prev => prev.filter(m => m.id !== id));

  // Compound interest simulator
  const simResult = useMemo(() => {
    const capital = Number(simCapital) || 0;
    const mensal = Number(simMensal) || 0;
    const anos = Math.min(30, Number(simAnos) || 1);
    const taxa = (Number(simTaxa) || 17) / 100;
    const taxaMensal = Math.pow(1 + taxa, 1 / 12) - 1;
    const rows = [];
    let total = capital;
    for (let a = 1; a <= anos; a++) {
      const meses = a * 12;
      const investido = capital + mensal * meses;
      // FV formula with monthly contributions
      const fv = capital * Math.pow(1 + taxaMensal, meses) +
        mensal * ((Math.pow(1 + taxaMensal, meses) - 1) / taxaMensal);
      rows.push({ ano: a, investido, total: fv });
      total = fv;
    }
    const ultimo = rows[rows.length - 1];
    const rendimento = ultimo ? ultimo.total - ultimo.investido : 0;
    return { rows, totalFinal: ultimo?.total || 0, rendimento };
  }, [simCapital, simMensal, simAnos, simTaxa]);

  const ativoSelecionado = BASE_BODIVA.find(b => b.ticker === simAtivo);
  const perfilObj = PERFIS.find(p => p.id === perfilSelecionado);

  const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px' };

  const TABS = [
    { id: 'mercado', label: '📈 Cotações' },
    { id: 'metas', label: '🎯 Metas' },
    { id: 'simulador', label: '🔢 Simulador' },
    { id: 'guia', label: '📚 Guia BODIVA' },
    { id: 'perfil', label: '🧠 Perfil' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={22} style={{ color: 'var(--color-accent)' }} />
            Mercados & Simulador de Investimentos
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px' }}>
            Cotações simuladas BNA/BODIVA · Divisas em tempo real · Última actualização: {ultimaAtt.toLocaleTimeString('pt-PT')}
          </p>
        </div>
        <button onClick={fetchRates} disabled={atualizando} style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
          borderRadius: '10px', border: '1px solid var(--border-color)',
          background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem'
        }}>
          <RefreshCw size={14} style={{ animation: atualizando ? 'spin 1s linear infinite' : 'none' }} />
          {atualizando ? 'A actualizar...' : 'Actualizar'}
        </button>
      </div>

      {/* Quick Divisas Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
        {divisas.map(d => (
          <div key={d.par} style={{ ...cardStyle, textAlign: 'center', padding: '12px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '3px' }}>{d.par}</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{d.preco.toFixed(2)} Kz</div>
            <VariacaoBadge variacao={d.variacao} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', paddingBottom: '2px' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            padding: '8px 14px', fontWeight: activeTab === tab.id ? 700 : 500,
            color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--text-secondary)',
            borderBottom: activeTab === tab.id ? '2px solid var(--color-accent)' : '2px solid transparent',
            fontSize: '0.82rem', borderRadius: '6px 6px 0 0'
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB MERCADO ─── */}
      {activeTab === 'mercado' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 12px', background: 'rgba(99,102,241,0.06)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.15)' }}>
            ℹ️ As cotações BODIVA apresentadas são simuladas com base em preços indicativos de mercado para fins educativos e de planeamento académico.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {bodivaAtual.map(item => {
              const pos = Number(item.variacao) >= 0;
              return (
                <div key={item.ticker} style={{
                  ...cardStyle, borderLeft: `3px solid ${item.cor}`,
                  display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.9rem', color: item.cor }}>{item.ticker}</span>
                        <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: '8px', background: `${item.cor}20`, color: item.cor }}>{item.bolsa}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>{item.nome}</div>
                    </div>
                    <VariacaoBadge variacao={Number(item.variacao)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Preço Indicativo</div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{item.preco.toLocaleString('pt-AO', { maximumFractionDigits: 2 })} Kz</div>
                    </div>
                    {item.taxaAnual && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Taxa Anual Est.</div>
                        <div style={{ fontWeight: 700, color: '#34d399' }}>{item.taxaAnual}% a.a.</div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{item.tipo}</span>
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '8px', background: item.risco === 'Baixo' ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)', color: item.risco === 'Baixo' ? '#34d399' : '#f59e0b' }}>Risco: {item.risco}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB METAS ─── */}
      {activeTab === 'metas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Add goal form */}
          <div style={{ ...cardStyle, border: '1px solid rgba(99,102,241,0.2)' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} style={{ color: 'var(--color-accent)' }} /> Estruturar Nova Meta
            </h4>
            <form onSubmit={handleAddMeta}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nome do Objectivo</label>
                  <input type="text" value={novaMeta.nome} onChange={e => setNovaMeta(p => ({ ...p, nome: e.target.value }))}
                    className="form-input" placeholder="Ex: Entrada do Apartamento" required />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Montante Alvo (Kz)</label>
                  <input type="number" value={novaMeta.alvo} onChange={e => setNovaMeta(p => ({ ...p, alvo: e.target.value }))}
                    className="form-input" placeholder="15000000" required />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Propósito</label>
                  <input type="text" value={novaMeta.proposito} onChange={e => setNovaMeta(p => ({ ...p, proposito: e.target.value }))}
                    className="form-input" placeholder="Comprar Carro, Casa, Viagem..." />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Data Limite de Resgate</label>
                  <input type="date" value={novaMeta.dataLimite} onChange={e => setNovaMeta(p => ({ ...p, dataLimite: e.target.value }))}
                    className="form-input" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <Plus size={15} /> Adicionar Meta
              </button>
            </form>
          </div>

          {/* Allocate form */}
          {metas.length > 0 && (
            <div style={{ ...cardStyle }}>
              <h4 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}>Alocar Saldo para Meta</h4>
              <form onSubmit={handleAlocarMeta} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1', minWidth: '180px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Selecione a meta...</label>
                  <select value={alocacaoMeta.metaId} onChange={e => setAlocacaoMeta(p => ({ ...p, metaId: e.target.value }))}
                    className="form-input" required>
                    <option value="">-- Escolher meta --</option>
                    {metas.filter(m => m.alocado < m.alvo).map(m => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: '1', minWidth: '150px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Valor em Kz</label>
                  <input type="number" value={alocacaoMeta.valor} onChange={e => setAlocacaoMeta(p => ({ ...p, valor: e.target.value }))}
                    className="form-input" placeholder="500000" required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>Alocar</button>
              </form>
            </div>
          )}

          {/* Goals list */}
          {metas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <Target size={40} style={{ marginBottom: '12px', opacity: 0.3 }} /><br />
              Nenhuma meta criada. Crie a sua primeira meta financeira acima!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {metas.map(meta => {
                const pct = meta.alvo > 0 ? Math.min(100, (meta.alocado / meta.alvo) * 100) : 0;
                const concluida = pct >= 100;
                const diasRestantes = meta.dataLimite ? Math.ceil((new Date(meta.dataLimite) - new Date()) / 86400000) : null;
                return (
                  <div key={meta.id} style={{
                    ...cardStyle,
                    border: concluida ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.07)',
                    background: concluida ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.8rem' }}>{meta.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{meta.nome}</div>
                          {meta.proposito && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{meta.proposito}</div>}
                          {meta.dataLimite && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Vencimento: {meta.dataLimite}</div>}
                        </div>
                      </div>
                      <button onClick={() => handleRemoveMeta(meta.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {/* Progress */}
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                        <span style={{ color: concluida ? '#34d399' : 'var(--color-accent)', fontWeight: 700 }}>
                          {Number(meta.alocado).toLocaleString('pt-AO')} Kz
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {Number(meta.alvo).toLocaleString('pt-AO')} Kz ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: concluida ? '#34d399' : 'linear-gradient(90deg, var(--color-accent), #a5b4fc)',
                          borderRadius: '8px', transition: 'width 0.6s'
                        }} />
                      </div>
                    </div>
                    {diasRestantes !== null && (
                      <div style={{ fontSize: '0.72rem', color: diasRestantes < 30 ? '#ef4444' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} />
                        {diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Prazo vencido'}
                      </div>
                    )}
                    {concluida && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '0.78rem', fontWeight: 700, marginTop: '8px' }}>
                        <CheckCircle size={14} /> Meta concluída! 🎉
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB SIMULADOR ─── */}
      {activeTab === 'simulador' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Ativo selector */}
          <div style={cardStyle}>
            <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>Ativo Foco: <span style={{ color: 'var(--color-accent)' }}>{simAtivo}</span></h4>
            {ativoSelecionado && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                {ativoSelecionado.nome}. {ativoSelecionado.taxaAnual ? `Taxa média anual estimada para simulação: ${ativoSelecionado.taxaAnual}% (Kz)` : 'Retorno variável baseado no mercado.'}
              </p>
            )}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {BASE_BODIVA.filter(b => b.taxaAnual).map(b => (
                <button key={b.ticker} onClick={() => { setSimAtivo(b.ticker); setSimTaxa(String(b.taxaAnual)); }}
                  style={{
                    padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                    border: `1px solid ${simAtivo === b.ticker ? b.cor : 'rgba(255,255,255,0.1)'}`,
                    background: simAtivo === b.ticker ? `${b.cor}20` : 'transparent',
                    color: simAtivo === b.ticker ? b.cor : 'var(--text-muted)'
                  }}>
                  {b.ticker}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Capital Inicial (Kz)', val: simCapital, set: setSimCapital, type: 'number' },
                { label: 'Contribuição Mensal (Kz)', val: simMensal, set: setSimMensal, type: 'number' },
                { label: 'Prazo de Resgate (Anos)', val: simAnos, set: setSimAnos, type: 'number', max: '30', min: '1' },
                { label: 'Taxa Anual (%)', val: simTaxa, set: setSimTaxa, type: 'number', step: '0.1' },
              ].map(({ label, val, set, ...rest }) => (
                <div key={label}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{label}</label>
                  <input type="number" value={val} onChange={e => set(e.target.value)} className="form-input" {...rest} />
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ ...cardStyle, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Final Projetado</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399' }}>
                {simResult.totalFinal.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
              </div>
            </div>
            <div style={{ ...cardStyle, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Rendimento Líquido</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-accent)' }}>
                +{simResult.rendimento.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
              </div>
            </div>
          </div>

          {/* Year by year table */}
          <div style={cardStyle}>
            <h4 style={{ fontWeight: 700, marginBottom: '14px' }}>Projecção do Crescimento Ano a Ano</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {simResult.rows.map(row => {
                const pct = simResult.totalFinal > 0 ? (row.total / simResult.totalFinal) * 100 : 0;
                return (
                  <div key={row.ano} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.82rem' }}>
                    <div style={{ width: '48px', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>Ano {row.ano}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Investido: {row.investido.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</span>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>Total: {row.total.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #34d399, var(--color-accent))', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '14px', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              ⚠️ As cotações apresentadas servem para fins de formação prática e académica. Investimentos possuem riscos associados. Rendimentos passados não garantem resultados futuros.
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB GUIA BODIVA ─── */}
      {activeTab === 'guia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ ...cardStyle, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <BookOpen size={20} style={{ color: 'var(--color-accent)' }} />
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Guia Passo a Passo — Investir na BODIVA</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A BODIVA (Bolsa de Dívida e Valores de Angola) é a plataforma oficial de negociação de títulos públicos e acções em Angola.
              Siga os passos abaixo para começar a investir de forma segura e informada.
            </p>
          </div>

          {GUIA_BODIVA.map((passo, i) => (
            <div key={passo.passo} style={{ ...cardStyle, display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--color-accent), #a5b4fc)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '1rem', color: '#fff'
              }}>{passo.passo}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{passo.icon}</span>
                  <h5 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{passo.titulo}</h5>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '10px', whiteSpace: 'pre-line' }}>
                  {passo.desc}
                </p>
                {/* Dica */}
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.78rem', color: '#f59e0b', marginBottom: '8px' }}>
                  💡 <strong>Dica:</strong> {passo.dica}
                </div>
                {/* AI suggestion */}
                <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <Zap size={13} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong style={{ color: 'var(--color-accent)' }}>Coach IA:</strong> {passo.ai}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Disclaimer */}
          <div style={{ ...cardStyle, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', gap: '10px' }}>
            <AlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
            <span><strong style={{ color: '#ef4444' }}>Aviso Legal:</strong> Este guia tem fins educativos. A BODIVA e os seus instrumentos financeiros possuem riscos. Consulte sempre um agente de distribuição de valores mobiliários autorizado pelo BNA antes de investir capital real.</span>
          </div>
        </div>
      )}

      {/* ─── TAB PERFIL ─── */}
      {activeTab === 'perfil' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!quizAtivo && !quizConcluido && !perfilSelecionado && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '36px 24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧠</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Descubra o seu Perfil de Investidor</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.6 }}>
                Responda a 4 perguntas e descubra qual estratégia de investimento se adapta melhor ao seu perfil de tolerância ao risco.
              </p>
              <button onClick={() => { setQuizAtivo(true); setQuizConcluido(false); }} className="btn btn-primary">
                Iniciar Teste de Perfil
              </button>
            </div>
          )}

          {quizAtivo && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pergunta {quizStep + 1} de {QUIZ_PERGUNTAS.length}</span>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '180px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '4px', background: 'var(--color-accent)', width: `${((quizStep + 1) / QUIZ_PERGUNTAS.length) * 100}%`, transition: 'width 0.4s' }} />
                </div>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px', lineHeight: 1.5 }}>
                {quizStep + 1}. {QUIZ_PERGUNTAS[quizStep].pergunta}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {QUIZ_PERGUNTAS[quizStep].opcoes.map((op, i) => (
                  <button key={i} onClick={() => handleQuizResposta(op.pontos)} style={{
                    padding: '14px 16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500,
                    textAlign: 'left', fontSize: '0.88rem', transition: 'all 0.2s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                    {String.fromCharCode(65 + i)}. {op.texto}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(quizConcluido || perfilSelecionado) && !quizAtivo && (() => {
            const p = PERFIS.find(x => x.id === perfilSelecionado);
            if (!p) return null;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ ...cardStyle, background: `${p.cor}0a`, border: `1px solid ${p.cor}33`, textAlign: 'center', padding: '28px 24px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{p.icon}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>O seu perfil é</div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: p.cor, marginBottom: '8px' }}>{p.nome}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 16px' }}>{p.desc}</p>
                  <p style={{ fontSize: '0.8rem', color: p.cor, fontWeight: 700, marginBottom: '16px' }}>Taxa de referência: {p.taxaRef}% a.a.</p>
                  <button onClick={reiniciarQuiz} style={{ padding: '8px 16px', border: `1px solid ${p.cor}`, background: 'transparent', color: p.cor, borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                    Refazer Teste
                  </button>
                </div>
                <div style={cardStyle}>
                  <div style={{ fontWeight: 700, marginBottom: '14px' }}>📊 Alocação Recomendada para o Mercado Angolano</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(p.alocacao).map(([cat, perc]) => (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                          <span>{cat}</span>
                          <strong style={{ color: p.cor }}>{perc}%</strong>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${perc}%`, background: p.cor, borderRadius: '4px', transition: 'width 0.8s' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ ...cardStyle, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Lightbulb size={15} style={{ color: 'var(--color-accent)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Próximos Passos Recomendados</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <div>→ Use o <strong style={{ color: 'var(--text-primary)' }}>Simulador</strong> para projectar o crescimento com a taxa de {p.taxaRef}%</div>
                    <div>→ Siga o <strong style={{ color: 'var(--text-primary)' }}>Guia BODIVA</strong> para abrir a sua conta de investimentos</div>
                    <div>→ Crie <strong style={{ color: 'var(--text-primary)' }}>Metas Financeiras</strong> para manter o foco nos seus objectivos</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
