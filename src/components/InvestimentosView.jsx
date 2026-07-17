import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, RefreshCw, AlertTriangle, Star,
  ChevronUp, ChevronDown, Target, Globe, Activity, Zap,
  BookOpen, Plus, Trash2, DollarSign, PieChart, BarChart2,
  CheckCircle, ArrowRight, Clock, Lightbulb, Shield,
  Building2, Landmark, Briefcase, BarChart, GraduationCap, User,
  Info, Calculator, FileText, ExternalLink, Check
} from 'lucide-react';

const CARD = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px' };

// ============================================================
// DADOS REALISTAS POR CORRETORA
// ============================================================

const BROKER_DATA = {
  BODIVA: {
    nome: 'Bolsa de Valores de Angola',
    descricao: 'Mercado oficial de capitais de Angola. Negocia títulos públicos e corporativos.',
    website: 'bodiva.ao',
    cor: '#34d399',
    taxas: {
      negociacao: 0.005, // 0.5% comissão de negociacao
      custodia: 0.0025,  // 0.25% anual de custódia
      imposto: 0.10,     // 10% IRT sobre rendimentos
      emolumentos: 0.001 // 0.1% emolumentos
    },
    produtos: [
      { ticker: 'BT91', nome: 'Bilhete do Tesouro 91 Dias', tipo: 'BT', taxaAnual: 14.0, vencimento: '91 dias', risco: 'Baixo', minimo: 100000 },
      { ticker: 'BT182', nome: 'Bilhete do Tesouro 182 Dias', tipo: 'BT', taxaAnual: 14.2, vencimento: '182 dias', risco: 'Baixo', minimo: 100000 },
      { ticker: 'BT364', nome: 'Bilhete do Tesouro 364 Dias', tipo: 'BT', taxaAnual: 14.5, vencimento: '364 dias', risco: 'Baixo', minimo: 100000 },
      { ticker: 'OT2A', nome: 'Obrigação do Tesouro 2 Anos', tipo: 'OT', taxaAnual: 16.0, vencimento: '2 anos', risco: 'Baixo', minimo: 500000 },
      { ticker: 'OT5A', nome: 'Obrigação do Tesouro 5 Anos', tipo: 'OT', taxaAnual: 17.0, vencimento: '5 anos', risco: 'Baixo', minimo: 500000 },
      { ticker: 'OT10A', nome: 'Obrigação do Tesouro 10 Anos', tipo: 'OT', taxaAnual: 18.0, vencimento: '10 anos', risco: 'Baixo', minimo: 500000 },
      { ticker: 'BAI27', nome: 'Obrigação BAI 2027', tipo: 'Corp', taxaAnual: 15.5, vencimento: '2027', risco: 'Médio', minimo: 500000 },
      { ticker: 'BCI28', nome: 'Obrigação BCI 2028', tipo: 'Corp', taxaAnual: 16.0, vencimento: '2028', risco: 'Médio', minimo: 500000 },
      { ticker: 'BAI', nome: 'Acção BAI', tipo: 'Ação', taxaAnual: null, vencimento: null, risco: 'Médio', minimo: 1 },
      { ticker: 'BCI', nome: 'Acção BCI', tipo: 'Ação', taxaAnual: null, vencimento: null, risco: 'Médio', minimo: 1 }
    ]
  },
  AUREA: {
    nome: 'Aurea Capital Management',
    descricao: 'Gestora de fundos de investimento. Oferece fundos de renda fixa, acções e multimercado.',
    website: 'aurea.ao',
    cor: '#f59e0b',
    taxas: {
      gestao: 0.015,      // 1.5% taxa de gestão anual
      performance: 0.15,  // 15% sobre ganhos acima de 10%
      resgate: 0.01,      // 1% taxa de resgate antes de 90 dias
      minimo: 50000       // Investimento mínimo
    },
    fundos: [
      { id: 'AUR-RF', nome: 'Aurea Renda Fixa', tipo: 'Renda Fixa', taxaAnual: 12.0, risco: 'Baixo', nav: 1.42, minimo: 50000, description: 'Investe em títulos públicos e corporativos angolanos.' },
      { id: 'AUR-AV', nome: 'Aurea Acciones', tipo: 'Acciones', taxaAnual: 18.0, risco: 'Alto', nav: 1.87, minimo: 50000, description: 'Carteira diversificada de acções angolanas e internacionais.' },
      { id: 'AUR-MX', nome: 'Aurea Mixta', tipo: 'Mixto', taxaAnual: 15.0, risco: 'Médio', nav: 1.61, minimo: 50000, description: 'Combina renda fixa e acções para equilíbrio risco/retorno.' },
      { id: 'AUR-MM', nome: 'Aurea Moeda', tipo: 'Moeda', taxaAnual: 10.0, risco: 'Médio', nav: 1.15, minimo: 100000, description: 'Exposição a moedas estrangeiras (USD, EUR, GBP).' }
    ]
  },
  LEWISBROKER: {
    nome: 'Lewis Broker International',
    descricao: 'Corretora internacional. Acesso a mercados globais, acções americanas e ETFs.',
    website: 'lewisbroker.ao',
    cor: '#ef4444',
    taxas: {
      comissao: 0.001,    // 0.1% por operação (mín $5)
      spread: 0.005,      // 0.5% spread cambial
      custodia: 0,        // Sem custódia
      minimo: 100000      // Depósito mínimo em Kz
    },
    ativos: [
      { ticker: 'AAPL', nome: 'Apple Inc.', tipo: 'Ação', setor: 'Tecnologia', preco: 190, moeda: 'USD' },
      { ticker: 'MSFT', nome: 'Microsoft Corp.', tipo: 'Ação', setor: 'Tecnologia', preco: 420, moeda: 'USD' },
      { ticker: 'GOOGL', nome: 'Alphabet Inc.', tipo: 'Ação', setor: 'Tecnologia', preco: 175, moeda: 'USD' },
      { ticker: 'AMZN', nome: 'Amazon.com Inc.', tipo: 'Ação', setor: 'Consumo', preco: 185, moeda: 'USD' },
      { ticker: 'TSLA', nome: 'Tesla Inc.', tipo: 'Ação', setor: 'Automóvel', preco: 250, moeda: 'USD' },
      { ticker: 'VOO', nome: 'Vanguard S&P 500 ETF', tipo: 'ETF', setor: 'Índice', preco: 480, moeda: 'USD' },
      { ticker: 'SPY', nome: 'SPDR S&P 500 ETF', tipo: 'ETF', setor: 'Índice', preco: 530, moeda: 'USD' },
      { ticker: 'QQQ', nome: 'Invesco QQQ Trust', tipo: 'ETF', setor: 'Tecnologia', preco: 470, moeda: 'USD' },
      { ticker: 'VTI', nome: 'Vanguard Total Stock Market', tipo: 'ETF', setor: 'Índice', preco: 250, moeda: 'USD' },
      { ticker: 'BND', nome: 'Vanguard Total Bond Market', tipo: 'ETF', setor: 'Renda Fixa', preco: 72, moeda: 'USD' }
    ]
  }
};

const BROKER_TABS = ['BODIVA', 'AUREA', 'LEWISBROKER'];

const GUIAS = {
  BODIVA: [
    { titulo: 'Abrir Conta de Valores', desc: 'Dirija-se a um banco autorizado (BFA, BAI, BCI ou Millennium Atlântico). Solicite abertura de conta de valores mobiliários.', dica: 'O BAI e BFA possuem processo mais simplificado.', ai: 'Comece pelo BAI ou BFA — processos mais digitais e rápidos.' },
    { titulo: 'Depositar Capital', desc: 'Efectue transferência para conta de custódia. Capital mínimo: 100.000 Kz para BTs, 500.000 Kz para OTs.', dica: 'Nunca invista mais do que pode perder.', ai: 'Só invista dinheiro que não vai precisar nos próximos 12 meses.' },
    { titulo: 'Escolher Instrumento', desc: 'BTs (91, 182 ou 364 dias), OTs (2, 5 ou 10 anos), ou Ações (BAI, BCI).', dica: 'Para iniciantes, BTs a 364 dias são os mais recomendados.', ai: 'Sugiro BTs a 364 dias. Taxa ~14,5% a.a. com garantia soberana.' },
    { titulo: 'Colocar Ordem', desc: 'Através do banco (pessoalmente ou via homebanking), coloque ordem de subscrição.', dica: 'Emissões de BTs ocorrem semanalmente pelo BNA.', ai: 'Coloque ordens nos primeiros dias de emissão para garantir alocação.' },
    { titulo: 'Acompanhar e Receber', desc: 'Acompanhe valor de custódia, data de vencimento e pagamentos de cupões. IRT 10% sobre rendimentos.', dica: 'Registe vencimentos no calendário e planeie reinversão.', ai: 'Ao receber cupões, reinvista imediatamente em novos BTs.' },
    { titulo: 'Reinvestir e Diversificar', desc: 'No vencimento, reinvista capital + juros. Diversifique gradualmente para OTs e ações.', dica: 'Diversificação reduz risco sem necessariamente reduzir retorno.', ai: 'Meta 3 anos: 50% títulos + 30% ações + 20% ETFs.' }
  ],
  AUREA: [
    { titulo: 'Avaliar Perfil', desc: 'Responda ao questionário de perfil na plataforma Aurea.', dica: 'Seja honesto nas respostas.', ai: 'O questionário define os fundos compatíveis com o seu perfil.' },
    { titulo: 'Escolher Fundo', desc: 'Renda Fixa (12% a.a.), Acciones (18% a.a.), Mixto (15% a.a.) ou Moeda (10% a.a.).', dica: 'Para primeira vez, o fundo Mixto é equilibrado.', ai: 'Comece com o Fundo Mixto — equilibra segurança e crescimento.' },
    { titulo: 'Investir', desc: 'Mínimo: 50.000 Kz (Renda Fixa/Acciones/Mixto) ou 100.000 Kz (Moeda). Subscreva online ou presencialmente.', dica: 'Investimentos maiores podem ter taxas de gestão inferiores.', ai: 'Invista valores regulares (DCA) para suavizar volatilidade.' },
    { titulo: 'Monitorar NAV', desc: 'Acompanhe NAV diário no site Aurea. Relatórios mensais por email.', dica: 'O NAV actualiza-se às 18h de cada dia útil.', ai: 'Revise mensalmente para evitar decisões emocionais.' },
    { titulo: 'Resgatar', desc: 'Submeta pedido de resgate online. Liquidação em 2-5 dias úteis.', dica: 'Resgate antes de 90 dias pode ter penalidade de 1%.', ai: 'Planeie resgates com 2 meses de antecedência.' }
  ],
  LEWISBROKER: [
    { titulo: 'Abrir Conta', desc: 'Acesse lewisbroker.ao e complete formulário KYC.', dica: 'Tenha passaporte e comprovativo de morada.', ai: 'Use passaporte para verificação mais rápida.' },
    { titulo: 'Verificação KYC', desc: 'Envie BI/Passaporte, comprovativo de morada, extrato bancário.', dica: 'Extrato bancário recente (30 dias) é obrigatório.', ai: 'Envie todos os documentos de uma vez para evitar atrasos.' },
    { titulo: 'Fundar Conta', desc: 'Deposite via SWIFT ou conversão USD/AOA via parceiros. Mínimo: 100.000 Kz.', dica: 'SWIFT demora 2-3 dias.', ai: 'Compare taxas de câmbio — pode poupar até 3%.' },
    { titulo: 'Negociar', desc: 'Accções: AAPL, MSFT, GOOGL, AMZN, TSLA. ETFs: VOO, SPY, QQQ, VTI, BND.', dica: 'ETFs são mais diversificados e menos voláteis.', ai: 'Comece com ETFs — diversificação automática.' },
    { titulo: 'Gerir Portfólio', desc: 'Acompanhe posições, defina alertas de preço, rebalanceie.', dica: 'Rebalanceie trimestralmente para manter alocação.', ai: 'Defina alertas em vez de verificar constantemente.' }
  ]
};

const GUIA_CONCEITOS = [
  { titulo: 'O que é o Mercado de Bolsa de Angola?', conteudo: 'O Mercado de Bolsa de Angola (BODIVA) é o mercado oficial onde se negociam títulos de renda fixa (obrigações e bilhetes do tesouro) e renda variável (acções de empresas cotadas). Funciona como a "bolsa de valores" angolana, regulada pelo INAPEM.' },
  { titulo: 'Obrigações do Tesouro (OT)', conteudo: 'Títulos de dívida pública emitidos pelo Estado angolano com prazos de 2, 5 ou 10 anos. Pagam juros (cupões) semestrais e são considerados investimentos de baixo risco pois são garantidos pelo Estado. Taxas actuais: 16-18% a.a.' },
  { titulo: 'Bilhetes do Tesouro (BT)', conteudo: 'Títulos de curto prazo (91, 182 ou 364 dias) emitidos pelo BNA em nome do Estado. São investimentos de muito baixo risco com rendimento pré-definido. Ideais para quem quer preservar capital com liquidez. Taxa actual: ~14,5% a.a.' },
  { titulo: 'Acções vs ETFs', conteudo: 'Acções são participações em empresas individuais (mais voláteis, maior potencial). ETFs são fundos que replicam índices (mais diversificados, menos voláteis). Para iniciantes, ETFs são mais seguros pois diversificam automaticamente.' },
  { titulo: 'O que é Renda Fixa?', conteudo: 'Investimentos onde o rendimento é pré-definido e conhecido antecipadamente. Exemplos: BTs, OTs, obrigações corporativas. Ideal para investidores conservadores que priorizam segurança.' },
  { titulo: 'O que é Renda Variável?', conteudo: 'Investimentos cujo rendimento depende da variação do preço. Exemplos: acções, ETFs de acções. Maior potencial de retorno, mas também maior risco. Ideal para investidores com perfil moderado ou arrojado.' },
  { titulo: 'Diversificação', conteudo: 'Estratégia de distribuir investimentos por diferentes activos/sectores para reduzir risco. Regra prática: não colocar mais de 30% do capital num único activo.' },
  { titulo: 'Impostos sobre Investimentos', conteudo: 'Em Angola, incide IRT de 10% sobre rendimentos de capital (juros de BTs/OTs). ETFs e acções internacionais podem ter retenção na fonte no país de origem. Consulte sempre um contabilista.' }
];

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

function VariacaoBadge({ v }) {
  const pos = v >= 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.78rem', fontWeight: 700, color: pos ? '#34d399' : '#ef4444' }}>
      {pos ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      {Math.abs(v).toFixed(2)}%
    </span>
  );
}

function Sparkline({ data, color, w = 60, h = 20 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${(h - ((v - min) / range) * h)}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function fmtKz(v) { return v.toLocaleString('pt-PT', { maximumFractionDigits: 0 }); }
function fmtUsd(v) { return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function loadJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }

function simulatePrice(base, tick, seed) {
  const f = Math.sin((tick + (seed || 0)) * 0.7) * 0.008 + Math.cos((tick + (seed || 0)) * 1.3) * 0.005;
  return base * (1 + f);
}

function simulateVariacao(tick, seed) {
  return +(Math.sin((tick + (seed || 0)) * 0.003) * 2).toFixed(2);
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function InvestimentosView() {
  const [tab, setTab] = useState('mercado');
  const [subTab, setSubTab] = useState('BODIVA');
  const [tick, setTick] = useState(0);
  const [ultimaAtt, setUltimaAtt] = useState(new Date());
  const [atualizando, setAtualizando] = useState(false);

  // FX Rates
  const [fxRates, setFxRates] = useState({ USD: 922.5, EUR: 1004.8, GBP: 1165.2, ZAR: 49.8 });
  const [fxVariacao, setFxVariacao] = useState({ USD: 0, EUR: 0, GBP: 0, ZAR: 0 });
  const [fxHistory, setFxHistory] = useState({ USD: [], EUR: [], GBP: [], ZAR: [] });

  // Portfolio
  const [portfolio, setPortfolio] = useState(() => loadJson('inv_portfolio_v5', []));
  const [portfolioSub, setPortfolioSub] = useState('BODIVA');
  const [novoInv, setNovoInv] = useState({ broker: 'BODIVA', ticker: '', qtd: '', preco: '', data: new Date().toISOString().split('T')[0] });

  // Metas
  const [metas, setMetas] = useState(() => loadJson('inv_metas_v5', []));
  const [novaMeta, setNovaMeta] = useState({ nome: '', alvo: '', proposito: '', dataLimite: '', broker: 'BODIVA' });

  // Simulador
  const [simBroker, setSimBroker] = useState('BODIVA');
  const [simProduto, setSimProduto] = useState('BT364');
  const [simCapital, setSimCapital] = useState('100000');
  const [simMensal, setSimMensal] = useState('10000');
  const [simMeses, setSimMeses] = useState('60');
  const [simHistorico, setSimHistorico] = useState(() => loadJson('inv_sim_hist_v2', []));

  // Perfil
  const [perfil, setPerfil] = useState(() => localStorage.getItem('inv_perfil_v5') || null);
  const [quizAtivo, setQuizAtivo] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizPontos, setQuizPontos] = useState(0);

  const [guiasChecklist, setGuiasChecklist] = useState(() => loadJson('inv_guias_check_v2', {}));

  // Effects
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => { localStorage.setItem('inv_portfolio_v5', JSON.stringify(portfolio)); }, [portfolio]);
  useEffect(() => { localStorage.setItem('inv_metas_v5', JSON.stringify(metas)); }, [metas]);
  useEffect(() => { localStorage.setItem('inv_sim_hist_v2', JSON.stringify(simHistorico)); }, [simHistorico]);
  useEffect(() => { localStorage.setItem('inv_guias_check_v2', JSON.stringify(guiasChecklist)); }, [guiasChecklist]);
  useEffect(() => { if (perfil) localStorage.setItem('inv_perfil_v5', perfil); }, [perfil]);

  const fetchRates = useCallback(() => {
    setAtualizando(true);
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => {
        const aoaPerUsd = (d.rates && d.rates.AOA) || 922.5;
        const newRates = {
          USD: aoaPerUsd,
          EUR: aoaPerUsd / ((d.rates && d.rates.EUR) || 0.92),
          GBP: aoaPerUsd / ((d.rates && d.rates.GBP) || 0.79),
          ZAR: aoaPerUsd / ((d.rates && d.rates.ZAR) || 18.5),
        };
        setFxRates(newRates);
        setFxHistory(prev => ({
          USD: prev.USD.slice(-19).concat([newRates.USD]),
          EUR: prev.EUR.slice(-19).concat([newRates.EUR]),
          GBP: prev.GBP.slice(-19).concat([newRates.GBP]),
          ZAR: prev.ZAR.slice(-19).concat([newRates.ZAR]),
        }));
      })
      .catch(() => {})
      .then(() => { setAtualizando(false); setUltimaAtt(new Date()); });
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  // Live data per broker
  const bodivaLive = useMemo(() => BROKER_DATA.BODIVA.produtos.map((p, i) => ({
    ...p,
    preco: p.tipo === 'Ação' ? simulatePrice(p.tipo === 'Ação' ? 5000 : 95000, tick, i * 100) : p.minimo,
    variacao: simulateVariacao(tick, i * 100),
    sparkData: Array.from({ length: 20 }, (_, j) => simulatePrice(p.tipo === 'Ação' ? 5000 : 95000, tick - 19 + j, i * 100))
  })), [tick]);

  const aureaLive = useMemo(() => BROKER_DATA.AUREA.fundos.map((f, i) => ({
    ...f,
    nav: simulatePrice(f.nav, tick, i * 200),
    variacao: simulateVariacao(tick, i * 200),
    sparkData: Array.from({ length: 20 }, (_, j) => simulatePrice(f.nav, tick - 19 + j, i * 200))
  })), [tick]);

  const lewisLive = useMemo(() => BROKER_DATA.LEWISBROKER.ativos.map((s, i) => ({
    ...s,
    preco: simulatePrice(s.preco, tick, i * 300),
    variacao: simulateVariacao(tick, i * 300),
    sparkData: Array.from({ length: 20 }, (_, j) => simulatePrice(s.preco, tick - 19 + j, i * 300))
  })), [tick]);

  // Portfolio calculations
  const portfolioCalculated = useMemo(() => {
    const grouped = {};
    let totalInvested = 0, totalCurrent = 0;
    portfolio.forEach(p => {
      let currentPrice = p.preco;
      if (p.broker === 'BODIVA') {
        const asset = bodivaLive.find(b => b.ticker === p.ticker);
        if (asset) currentPrice = asset.preco;
      } else if (p.broker === 'AUREA') {
        const fund = aureaLive.find(f => f.id === p.ticker);
        if (fund) currentPrice = fund.nav;
      } else if (p.broker === 'LEWISBROKER') {
        const stock = lewisLive.find(s => s.ticker === p.ticker);
        if (stock) currentPrice = stock.preco * fxRates.USD;
      }
      const cost = p.qtd * p.preco;
      const val = p.qtd * currentPrice;
      totalInvested += cost;
      totalCurrent += val;
      if (!grouped[p.broker]) grouped[p.broker] = [];
      const existing = grouped[p.broker].find(g => g.ticker === p.ticker);
      if (existing) {
        existing.qtd += p.qtd;
        existing.totalCost += cost;
        existing.currentValue += val;
      } else {
        grouped[p.broker].push({ ticker: p.ticker, nome: p.nome || p.ticker, qtd: p.qtd, totalCost: cost, currentValue: val, avgPrice: p.preco, currentPrice });
      }
    });
    return { grouped, totalInvested, totalCurrent, pl: totalCurrent - totalInvested, plPct: totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested * 100) : 0 };
  }, [portfolio, bodivaLive, aureaLive, lewisLive, fxRates]);

  const addInvestimento = (e) => {
    e.preventDefault();
    if (!novoInv.ticker || !novoInv.qtd || !novoInv.preco) return;
    const tickerData = novoInv.broker === 'BODIVA' ? BROKER_DATA.BODIVA.produtos.find(b => b.ticker === novoInv.ticker)
      : novoInv.broker === 'AUREA' ? BROKER_DATA.AUREA.fundos.find(f => f.id === novoInv.ticker)
      : BROKER_DATA.LEWISBROKER.ativos.find(s => s.ticker === novoInv.ticker);
    setPortfolio(prev => [...prev, {
      id: Date.now().toString(),
      broker: novoInv.broker,
      ticker: novoInv.ticker,
      nome: (tickerData && tickerData.nome) || novoInv.ticker,
      qtd: Number(novoInv.qtd),
      preco: Number(novoInv.preco),
      data: novoInv.data,
    }]);
    setNovoInv(p => ({ ...p, qtd: '', preco: '' }));
  };

  const removeInvestimento = (id) => {
    if (window.confirm('Remover esta transação?')) setPortfolio(prev => prev.filter(p => p.id !== id));
  };

  const removeByTicker = (broker, ticker) => {
    if (window.confirm('Remover TODAS as posições de ' + ticker + '?')) {
      setPortfolio(prev => prev.filter(p => !(p.broker === broker && p.ticker === ticker)));
    }
  };

  const addMeta = (e) => {
    e.preventDefault();
    if (!novaMeta.nome || !novaMeta.alvo) return;
    setMetas(prev => [...prev, { id: Date.now().toString(), nome: novaMeta.nome, alvo: Number(novaMeta.alvo), proposito: novaMeta.proposito, dataLimite: novaMeta.dataLimite, broker: novaMeta.broker, alocado: 0 }]);
    setNovaMeta({ nome: '', alvo: '', proposito: '', dataLimite: '', broker: 'BODIVA' });
  };

  const alocarMeta = (metaId, valor) => {
    setMetas(prev => prev.map(m => m.id === metaId ? { ...m, alocado: Math.min(m.alvo, m.alocado + Number(valor)) } : m));
  };

  const removeMeta = (id) => setMetas(prev => prev.filter(m => m.id !== id));

  // Simulator calculation with broker fees
  const simResult = useMemo(() => {
    const capital = Number(simCapital) || 0;
    const mensal = Number(simMensal) || 0;
    const meses = Math.min(360, Number(simMeses) || 60);

    // Get base rate
    let taxaAnual = 14.5;
    if (simBroker === 'BODIVA') {
      const asset = BROKER_DATA.BODIVA.produtos.find(b => b.ticker === simProduto);
      taxaAnual = (asset && asset.taxaAnual) || 14.5;
    } else if (simBroker === 'AUREA') {
      const fund = BROKER_DATA.AUREA.fundos.find(f => f.id === simProduto);
      taxaAnual = (fund && fund.taxaAnual) || 12;
    } else if (simBroker === 'LEWISBROKER') {
      taxaAnual = ['VOO', 'SPY', 'QQQ', 'VTI'].includes(simProduto) ? 10 : 12;
    } else {
      taxaAnual = 8;
    }

    // Apply broker fees
    const brokerInfo = BROKER_DATA[simBroker];
    let taxaLiquida = taxaAnual;
    let taxasDetalhe = {};

    if (simBroker === 'BODIVA') {
      const irrt = brokerInfo.taxas.imposto;
      taxaLiquida = taxaAnual * (1 - irrt);
      taxasDetalhe = { 'IRT (10%)': (taxaAnual * irrt).toFixed(2) + '% a.a.' };
    } else if (simBroker === 'AUREA') {
      const taxaGestao = brokerInfo.taxas.gestao;
      taxaLiquida = taxaAnual - (taxaAnual * taxaGestao);
      taxasDetalhe = { 'Taxa de Gestão (1.5%)': (taxaAnual * taxaGestao).toFixed(2) + '% a.a.' };
    } else if (simBroker === 'LEWISBROKER') {
      const comissao = brokerInfo.taxas.comissao;
      taxaLiquida = taxaAnual * (1 - comissao);
      taxasDetalhe = { 'Comissão (0.1%)': (taxaAnual * comissao).toFixed(2) + '% a.a.' };
    }

    const taxaMensal = Math.pow(1 + taxaLiquida / 100, 1 / 12) - 1;
    const rows = [];
    let saldo = capital;
    let totalInvestido = capital;
    let totalJuros = 0;

    for (let m = 1; m <= meses; m++) {
      const abertura = saldo;
      saldo += mensal;
      totalInvestido += mensal;
      const juros = saldo * taxaMensal;
      saldo += juros;
      totalJuros += juros;
      rows.push({ mes: m, abertura, contribuicao: mensal, juros, saldo });
    }

    return {
      rows,
      totalFinal: saldo,
      totalInvestido,
      rendimento: saldo - totalInvestido,
      taxaAnual,
      taxaLiquida,
      taxasDetalhe,
      totalJuros
    };
  }, [simCapital, simMensal, simMeses, simBroker, simProduto]);

  const chartPoints = useMemo(() => {
    const data = simResult.rows;
    if (data.length === 0) return '';
    let max = -Infinity, min = Infinity;
    data.forEach(r => { if (r.saldo > max) max = r.saldo; if (r.saldo < min) min = r.saldo; });
    const range = max - min || 1;
    return data.map((r, i) => `${(i / (data.length - 1)) * 100},${(100 - ((r.saldo - min) / range) * 80)}`).join(' ');
  }, [simResult]);

  const handleQuizAnswer = (pts) => {
    const novos = quizPontos + pts;
    if (quizStep < 4) {
      setQuizStep(s => s + 1);
      setQuizPontos(novos);
    } else {
      const p = novos <= 5 ? 'conservador' : novos <= 10 ? 'moderado' : 'arrojado';
      setPerfil(p);
      setQuizAtivo(false);
      setQuizStep(0);
    }
  };

  const toggleGuideStep = (broker, step) => {
    setGuiasChecklist(prev => {
      const key = 'guide_' + broker;
      const arr = prev[key] || [];
      const idx = arr.indexOf(step);
      const newArr = idx >= 0 ? arr.filter((_, i) => i !== idx) : [...arr, step];
      return { ...prev, [key]: newArr };
    });
  };

  const getTickersForBroker = (broker) => {
    if (broker === 'BODIVA') return BROKER_DATA.BODIVA.produtos.map(b => ({ value: b.ticker, label: `${b.ticker} — ${b.nome}` }));
    if (broker === 'AUREA') return BROKER_DATA.AUREA.fundos.map(f => ({ value: f.id, label: `${f.id} — ${f.nome}` }));
    if (broker === 'LEWISBROKER') return BROKER_DATA.LEWISBROKER.ativos.map(s => ({ value: s.ticker, label: `${s.ticker} — ${s.nome}` }));
    return [];
  };

  const PERFIS = [
    { id: 'conservador', nome: 'Conservador', icon: Shield, cor: '#34d399', desc: 'Prioriza segurança e preservação do capital.', alocacao: { BODIVA: 65, AUREA: 30, LEWISBROKER: 5 } },
    { id: 'moderado', nome: 'Moderado', icon: Target, cor: '#f59e0b', desc: 'Equilíbrio entre segurança e crescimento.', alocacao: { BODIVA: 40, AUREA: 35, LEWISBROKER: 25 } },
    { id: 'arrojado', nome: 'Arrojado', icon: Zap, cor: '#6366f1', desc: 'Prioriza crescimento máximo, aceita volatilidade.', alocacao: { BODIVA: 15, AUREA: 20, LEWISBROKER: 65 } }
  ];

  const QUIZ = [
    { q: 'Se o seu investimento caísse 20% num mês, o que faria?', o: ['Venderia tudo imediatamente', 'Ficaria preocupado mas aguardaria', 'Aproveitaria para comprar mais'] },
    { q: 'Qual é o seu horizonte de investimento?', o: ['Menos de 1 ano', 'Entre 1 e 5 anos', 'Mais de 5 anos'] },
    { q: 'Qual rendimento anual esperado é mais adequado?', o: ['10-14% com baixo risco', '15-18% com risco médio', '+20% com alto risco'] },
    { q: 'Qual é o seu principal objectivo?', o: ['Preservar o dinheiro', 'Crescimento equilibrado', 'Maximizar crescimento'] },
    { q: 'Como reagiria a uma queda de 30%?', o: ['Entraria em pânico e venderia', 'Manteria a calma e esperaria', 'Compraria mais activos em promoção'] }
  ];

  const perfilObj = PERFIS.find(p => p.id === perfil) || null;
  let totalAssets = 0;
  if (portfolioCalculated.grouped) {
    Object.keys(portfolioCalculated.grouped).forEach(k => { totalAssets += portfolioCalculated.grouped[k].length; });
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={22} style={{ color: 'var(--color-accent)' }} />
            Investimentos — Finança ao Ponto
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px' }}>
            3 corretoras · Dados actualizados · Última actualização: {ultimaAtt.toLocaleTimeString('pt-PT')}
          </p>
        </div>
        <button onClick={fetchRates} disabled={atualizando} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem' }}>
          <RefreshCw size={14} style={{ animation: atualizando ? 'spin 1s linear infinite' : 'none' }} />
          {atualizando ? 'A actualizar...' : 'Actualizar'}
        </button>
      </div>

      {/* FX Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        {[['USD/AOA', fxRates.USD, fxVariacao.USD, '#34d399'],
          ['EUR/AOA', fxRates.EUR, fxVariacao.EUR, '#6366f1'],
          ['GBP/AOA', fxRates.GBP, fxVariacao.GBP, '#f59e0b'],
          ['ZAR/AOA', fxRates.ZAR, fxVariacao.ZAR, '#ef4444']].map(([par, preco, v, cor]) => {
          const curKey = par.split('/')[0];
          return (
            <div key={par} style={{ ...CARD, textAlign: 'center', padding: '12px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '3px' }}>{par}</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{preco.toFixed(2)} Kz</div>
              <VariacaoBadge v={v} />
              <Sparkline data={fxHistory[curKey] || []} color={cor} w={80} h={16} />
            </div>
          );
        })}
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', paddingBottom: '2px' }}>
        {[{ id: 'mercado', label: 'Mercado', icon: TrendingUp },
          { id: 'carteira', label: 'Carteira', icon: Briefcase },
          { id: 'metas', label: 'Metas', icon: Target },
          { id: 'simulador', label: 'Simulador', icon: BarChart2 },
          { id: 'guias', label: 'Guias', icon: BookOpen },
          { id: 'perfil', label: 'Perfil', icon: User }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', padding: '8px 14px', fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? 'var(--color-accent)' : 'var(--text-secondary)', borderBottom: tab === t.id ? '2px solid var(--color-accent)' : '2px solid transparent', fontSize: '0.82rem', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB MERCADO ═══ */}
      {tab === 'mercado' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 12px', background: 'rgba(99,102,241,0.06)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.15)' }}>
            <Info size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Dados simulados para fins educativos. Divisas obtidas de API pública. Actualizado: {ultimaAtt.toLocaleTimeString('pt-PT')}
          </div>

          {/* Broker subtabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {BROKER_TABS.map(b => (
              <button key={b} onClick={() => setSubTab(b)} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: `1px solid ${subTab === b ? BROKER_DATA[b].cor : 'rgba(255,255,255,0.1)'}`, background: subTab === b ? BROKER_DATA[b].cor + '20' : 'transparent', color: subTab === b ? BROKER_DATA[b].cor : 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {b}
              </button>
            ))}
          </div>

          {/* BODIVA */}
          {subTab === 'BODIVA' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {bodivaLive.map(item => (
                <div key={item.ticker} style={{ ...CARD, borderLeft: `3px solid ${BROKER_DATA.BODIVA.cor}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.9rem', color: BROKER_DATA.BODIVA.cor }}>{item.ticker}</span>
                        <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: '8px', background: BROKER_DATA.BODIVA.cor + '20', color: BROKER_DATA.BODIVA.cor }}>{item.tipo}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.nome}</div>
                    </div>
                    <VariacaoBadge v={Number(item.variacao)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.tipo === 'Ação' ? 'Preço' : 'Mínimo'}</div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{fmtKz(item.preco)} Kz</div>
                    </div>
                    {item.taxaAnual && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Taxa Anual</div>
                        <div style={{ fontWeight: 700, color: '#34d399' }}>{item.taxaAnual}% a.a.</div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                      {item.vencimento ? `Venc: ${item.vencimento}` : 'Risco: ' + item.risco}
                    </span>
                    <Sparkline data={item.sparkData} color={BROKER_DATA.BODIVA.cor} w={60} h={18} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AUREA */}
          {subTab === 'AUREA' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {aureaLive.map(f => (
                <div key={f.id} style={{ ...CARD, borderLeft: `3px solid ${BROKER_DATA.AUREA.cor}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: BROKER_DATA.AUREA.cor }}>{f.id}</span>
                        <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: '8px', background: BROKER_DATA.AUREA.cor + '20', color: BROKER_DATA.AUREA.cor }}>{f.tipo}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{f.nome}</div>
                    </div>
                    <VariacaoBadge v={Number(f.variacao)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>NAV Actual</div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{f.nav.toFixed(4)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Taxa Anual Est.</div>
                      <div style={{ fontWeight: 700, color: BROKER_DATA.AUREA.cor }}>{f.taxaAnual}% a.a.</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{f.description}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                      Mín: {fmtKz(f.minimo)} Kz · Risco: {f.risco}
                    </span>
                    <Sparkline data={f.sparkData} color={BROKER_DATA.AUREA.cor} w={60} h={18} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LEWISBROKER */}
          {subTab === 'LEWISBROKER' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {lewisLive.map(s => (
                <div key={s.ticker} style={{ ...CARD, borderLeft: `3px solid ${BROKER_DATA.LEWISBROKER.cor}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.9rem', color: BROKER_DATA.LEWISBROKER.cor }}>{s.ticker}</span>
                        <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: '8px', background: BROKER_DATA.LEWISBROKER.cor + '20', color: BROKER_DATA.LEWISBROKER.cor }}>{s.tipo}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{s.nome}</div>
                    </div>
                    <VariacaoBadge v={Number(s.variacao)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Preço (USD)</div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{fmtUsd(s.preco)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Em Kz</div>
                      <div style={{ fontWeight: 700, color: BROKER_DATA.LEWISBROKER.cor }}>{fmtKz(s.preco * fxRates.USD)} Kz</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                      {s.setor} · {s.moeda}
                    </span>
                    <Sparkline data={s.sparkData} color={BROKER_DATA.LEWISBROKER.cor} w={60} h={18} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB CARTEIRA ═══ */}
      {tab === 'carteira' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {[['Total Investido', fmtKz(portfolioCalculated.totalInvested) + ' Kz', 'var(--text-primary)'],
              ['Valor Actual', fmtKz(portfolioCalculated.totalCurrent) + ' Kz', 'var(--text-primary)'],
              ['Lucro / Prejuízo', (portfolioCalculated.pl >= 0 ? '+' : '') + fmtKz(portfolioCalculated.pl) + ' Kz', portfolioCalculated.pl >= 0 ? '#34d399' : '#ef4444'],
              ['Ativos', String(totalAssets), 'var(--color-accent)']].map(([label, value, color]) => (
              <div key={label} style={{ ...CARD, textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Add form */}
          <div style={{ ...CARD, maxWidth: '400px' }}>
            <div style={{ fontWeight: 700, marginBottom: '12px' }}>+ Registar Compra</div>
            <form onSubmit={addInvestimento} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select value={novoInv.broker} onChange={e => setNovoInv(p => ({ ...p, broker: e.target.value, ticker: '' }))} className="form-input">
                {BROKER_TABS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={novoInv.ticker} onChange={e => {
                const tickers = getTickersForBroker(novoInv.broker);
                const found = tickers.find(t => t.value === e.target.value);
                setNovoInv(p => ({ ...p, ticker: e.target.value }));
              }} className="form-input" required>
                <option value="">-- Escolher --</option>
                {getTickersForBroker(novoInv.broker).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input type="number" min="1" value={novoInv.qtd} onChange={e => setNovoInv(p => ({ ...p, qtd: e.target.value }))} className="form-input" placeholder="Quantidade" required />
              <input type="number" min="0" step="0.01" value={novoInv.preco} onChange={e => setNovoInv(p => ({ ...p, preco: e.target.value }))} className="form-input" placeholder="Preço (Kz)" required />
              <input type="date" value={novoInv.data} onChange={e => setNovoInv(p => ({ ...p, data: e.target.value }))} className="form-input" />
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Adicionar ao Portfólio</button>
            </form>
          </div>

          {/* Holdings per broker */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {BROKER_TABS.map(b => (
              <button key={b} onClick={() => setPortfolioSub(b)} style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: `1px solid ${portfolioSub === b ? BROKER_DATA[b].cor : 'rgba(255,255,255,0.1)'}`, background: portfolioSub === b ? BROKER_DATA[b].cor + '20' : 'transparent', color: portfolioSub === b ? BROKER_DATA[b].cor : 'var(--text-muted)' }}>
                {b}
              </button>
            ))}
          </div>

          {(portfolioCalculated.grouped[portfolioSub] || []).length === 0 ? (
            <div style={{ ...CARD, textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontWeight: 700 }}>Sem posições em {portfolioSub}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Registe uma compra usando o formulário.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {(portfolioCalculated.grouped[portfolioSub] || []).map(item => {
                const pl = item.currentValue - item.totalCost;
                const plPct = item.totalCost > 0 ? (pl / item.totalCost * 100) : 0;
                return (
                  <div key={item.ticker} style={{ ...CARD, borderLeft: `3px solid ${BROKER_DATA[portfolioSub].cor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace', color: BROKER_DATA[portfolioSub].cor }}>{item.ticker}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.nome}</div>
                      </div>
                      <button onClick={() => removeByTicker(portfolioSub, item.ticker)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: pl >= 0 ? '#34d399' : '#ef4444', fontWeight: 700 }}>
                      {(pl >= 0 ? '+' : '') + fmtKz(pl) + ' Kz (' + (plPct >= 0 ? '+' : '') + plPct.toFixed(2) + '%)'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {portfolio.length > 0 && (
            <div style={CARD}>
              <div style={{ fontWeight: 700, marginBottom: '10px' }}>Histórico de Transações</div>
              {portfolio.slice().reverse().map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '6px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: BROKER_DATA[p.broker]?.cor || 'var(--text-primary)' }}>{p.ticker}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>{p.data} · {p.qtd} un. @ {fmtKz(p.preco)} Kz</span>
                  </div>
                  <button onClick={() => removeInvestimento(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB METAS ═══ */}
      {tab === 'metas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ ...CARD, border: '1px solid rgba(99,102,241,0.2)' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '12px' }}>Nova Meta</h4>
            <form onSubmit={addMeta} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '12px' }}>
              <input type="text" value={novaMeta.nome} onChange={e => setNovaMeta(p => ({ ...p, nome: e.target.value }))} className="form-input" placeholder="Nome da meta" required />
              <input type="number" value={novaMeta.alvo} onChange={e => setNovaMeta(p => ({ ...p, alvo: e.target.value }))} className="form-input" placeholder="Montante Alvo (Kz)" required />
              <input type="text" value={novaMeta.proposito} onChange={e => setNovaMeta(p => ({ ...p, proposito: e.target.value }))} className="form-input" placeholder="Propósito" />
              <select value={novaMeta.broker} onChange={e => setNovaMeta(p => ({ ...p, broker: e.target.value }))} className="form-input">
                {BROKER_TABS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <input type="date" value={novaMeta.dataLimite} onChange={e => setNovaMeta(p => ({ ...p, dataLimite: e.target.value }))} className="form-input" />
              <button type="submit" className="btn btn-primary">Adicionar Meta</button>
            </form>
          </div>

          {metas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <Target size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <br />
              Nenhuma meta criada. Crie a sua primeira meta financeira!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {metas.map(meta => {
                const pct = meta.alvo > 0 ? Math.min(100, (meta.alocado / meta.alvo) * 100) : 0;
                const dias = meta.dataLimite ? Math.ceil((new Date(meta.dataLimite) - new Date()) / 86400000) : null;
                const done = pct >= 100;
                return (
                  <div key={meta.id} style={{ ...CARD, border: done ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{meta.nome}</div>
                        <div style={{ fontSize: '0.68rem', color: BROKER_DATA[meta.broker]?.cor || 'var(--text-muted)' }}>{meta.broker}</div>
                      </div>
                      <button onClick={() => removeMeta(meta.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                        <span style={{ color: done ? '#34d399' : 'var(--color-accent)', fontWeight: 700 }}>{fmtKz(meta.alocado)} Kz</span>
                        <span style={{ color: 'var(--text-muted)' }}>{fmtKz(meta.alvo)} Kz ({pct.toFixed(0)}%)</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: pct + '%', background: done ? '#34d399' : 'var(--color-accent)', borderRadius: '8px', transition: 'width 0.6s' }} />
                      </div>
                    </div>
                    {!done && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="number" placeholder="Valor Kz" id={`aloc_${meta.id}`} className="form-input" style={{ flex: 1, fontSize: '0.8rem' }} />
                        <button type="button" onClick={() => {
                          const inp = document.getElementById(`aloc_${meta.id}`);
                          if (inp && inp.value) { alocarMeta(meta.id, inp.value); inp.value = ''; }
                        }} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>Alocar</button>
                      </div>
                    )}
                    {dias !== null && (
                      <div style={{ fontSize: '0.72rem', color: dias < 30 ? '#ef4444' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                        <Clock size={11} />
                        {dias > 0 ? `${dias} dias restantes` : 'Prazo vencido'}
                      </div>
                    )}
                    {done && <div style={{ color: '#34d399', fontSize: '0.78rem', fontWeight: 700, marginTop: '6px' }}>Meta concluída!</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB SIMULADOR ═══ */}
      {tab === 'simulador' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={CARD}>
            <h4 style={{ fontWeight: 700, marginBottom: '12px' }}>
              <Calculator size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
              Simulador de Investimento
            </h4>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {BROKER_TABS.map(b => (
                <button key={b} onClick={() => { setSimBroker(b); const tickers = getTickersForBroker(b); setSimProduto(tickers[0] ? tickers[0].value : ''); }} style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: `1px solid ${simBroker === b ? BROKER_DATA[b].cor : 'rgba(255,255,255,0.1)'}`, background: simBroker === b ? BROKER_DATA[b].cor + '20' : 'transparent', color: simBroker === b ? BROKER_DATA[b].cor : 'var(--text-muted)' }}>
                  {b}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Produto</label>
                <select value={simProduto} onChange={e => setSimProduto(e.target.value)} className="form-input">
                  {getTickersForBroker(simBroker).map(t => <option key={t.value} value={t.value}>{t.value}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Capital Inicial (Kz)</label>
                <input type="number" value={simCapital} onChange={e => setSimCapital(e.target.value)} className="form-input" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Contribuição Mensal (Kz)</label>
                <input type="number" value={simMensal} onChange={e => setSimMensal(e.target.value)} className="form-input" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Período (meses)</label>
                <input type="number" min="1" max="360" value={simMeses} onChange={e => setSimMeses(e.target.value)} className="form-input" />
              </div>
            </div>
          </div>

          {/* Taxas e comissões da corretora */}
          <div style={{ ...CARD, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '0.85rem' }}>
              Taxas e Comissões — {simBroker}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.8rem' }}>
              {simBroker === 'BODIVA' && (
                <>
                  <div style={{ color: 'var(--text-secondary)' }}>Comissão de Negociação: <strong>0,5%</strong></div>
                  <div style={{ color: 'var(--text-secondary)' }}>Custódia Anual: <strong>0,25%</strong></div>
                  <div style={{ color: 'var(--text-secondary)' }}>IRT sobre Rendimentos: <strong>10%</strong></div>
                  <div style={{ color: 'var(--text-secondary)' }}>Emolumentos: <strong>0,1%</strong></div>
                </>
              )}
              {simBroker === 'AUREA' && (
                <>
                  <div style={{ color: 'var(--text-secondary)' }}>Taxa de Gestão: <strong>1,5% a.a.</strong></div>
                  <div style={{ color: 'var(--text-secondary)' }}>Taxa de Performance: <strong>15%</strong> (acima de 10%)</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{'Taxa de Resgate (< 90 dias):'} <strong>1%</strong></div>
                  <div style={{ color: 'var(--text-secondary)' }}>Investimento Mínimo: <strong>50.000 Kz</strong></div>
                </>
              )}
              {simBroker === 'LEWISBROKER' && (
                <>
                  <div style={{ color: 'var(--text-secondary)' }}>Comissão por Operação: <strong>0,1%</strong> (mín $5)</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Spread Cambial: <strong>0,5%</strong></div>
                  <div style={{ color: 'var(--text-secondary)' }}>Custódia: <strong>Gratuita</strong></div>
                  <div style={{ color: 'var(--text-secondary)' }}>Depósito Mínimo: <strong>100.000 Kz</strong></div>
                </>
              )}
            </div>
          </div>

          {/* Chart */}
          <div style={CARD}>
            <div style={{ fontWeight: 700, marginBottom: '8px' }}>Evolução do Investimento</div>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '120px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }} preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BROKER_DATA[simBroker].cor} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={BROKER_DATA[simBroker].cor} stopOpacity="0" />
                </linearGradient>
              </defs>
              {chartPoints && (
                <g>
                  <polygon points={`0,100 ${chartPoints} 100,100`} fill="url(#chartGrad)" />
                  <polyline points={chartPoints} fill="none" stroke={BROKER_DATA[simBroker].cor} strokeWidth="1" strokeLinecap="round" />
                </g>
              )}
            </svg>
          </div>

          {/* Results */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
            {[['Total Final Projetado', fmtKz(simResult.totalFinal) + ' Kz', '#34d399'],
              ['Rendimento Líquido', '+' + fmtKz(simResult.rendimento) + ' Kz', 'var(--color-accent)'],
              ['Taxa Anual Líquida', simResult.taxaLiquida.toFixed(2) + '% a.a.', BROKER_DATA[simBroker].cor],
              ['Total Investido', fmtKz(simResult.totalInvestido) + ' Kz', 'var(--text-primary)']].map(([label, value, color]) => (
              <div key={label} style={{ ...CARD, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Monthly table */}
          <div style={CARD}>
            <h4 style={{ fontWeight: 700, marginBottom: '10px' }}>Detalhe Mensal</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Mês', 'Abertura', 'Contribuição', 'Juros', 'Saldo'].map(h => (
                      <th key={h} style={{ textAlign: h === 'Mês' ? 'left' : 'right', padding: '6px', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {simResult.rows.slice(0, 60).map(r => (
                    <tr key={r.mes} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '6px', fontWeight: 700 }}>{r.mes}</td>
                      <td style={{ padding: '6px', textAlign: 'right', color: 'var(--text-muted)' }}>{fmtKz(r.abertura)} Kz</td>
                      <td style={{ padding: '6px', textAlign: 'right' }}>{fmtKz(r.contribuicao)} Kz</td>
                      <td style={{ padding: '6px', textAlign: 'right', color: '#34d399' }}>+{fmtKz(r.juros)} Kz</td>
                      <td style={{ padding: '6px', textAlign: 'right', fontWeight: 700, color: BROKER_DATA[simBroker].cor }}>{fmtKz(r.saldo)} Kz</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button onClick={() => {
            setSimHistorico(prev => prev.slice(-9).concat([{ id: Date.now(), broker: simBroker, produto: simProduto, total: simResult.totalFinal }]));
          }} className="btn btn-primary" style={{ width: 'fit-content' }}>+ Guardar Simulação</button>

          {simHistorico.length > 0 && (
            <div style={CARD}>
              <h4 style={{ fontWeight: 700, marginBottom: '10px' }}>Simulações Anteriores</h4>
              {simHistorico.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '6px', fontSize: '0.8rem' }}>
                  <span><span style={{ fontWeight: 700, color: BROKER_DATA[s.broker]?.cor }}>{s.broker}</span> · {s.produto}</span>
                  <span style={{ fontWeight: 700, color: '#34d399' }}>{fmtKz(s.total)} Kz</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB GUIAS ═══ */}
      {tab === 'guias' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Conceitos básicos */}
          <div style={{ ...CARD, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} style={{ color: 'var(--color-accent)' }} />
              Conceitos Básicos de Investimento
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              {GUIA_CONCEITOS.map((c, i) => (
                <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--color-accent)' }}>{c.titulo}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.conteudo}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Guia por corretora */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {BROKER_TABS.map(b => (
              <button key={b} onClick={() => setSubTab(b)} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: `1px solid ${subTab === b ? BROKER_DATA[b].cor : 'rgba(255,255,255,0.1)'}`, background: subTab === b ? BROKER_DATA[b].cor + '20' : 'transparent', color: subTab === b ? BROKER_DATA[b].cor : 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {b}
              </button>
            ))}
          </div>

          {GUIAS[subTab] && GUIAS[subTab].map((passo, i) => {
            const guiaKey = subTab;
            const done = (guiasChecklist['guide_' + guiaKey] || []).indexOf(i) >= 0;
            return (
              <div key={i} style={{ ...CARD, borderLeft: `3px solid ${done ? '#34d399' : BROKER_DATA[subTab].cor}`, background: done ? 'rgba(52,211,153,0.04)' : undefined, display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <button onClick={() => toggleGuideStep(guiaKey, i)} style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, background: done ? '#34d399' : 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: '1rem', color: '#fff' }}>
                  {done ? <Check size={18} /> : String(i + 1)}
                </button>
                <div style={{ flex: 1 }}>
                  <h5 style={{ fontWeight: 700, marginBottom: '6px', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }}>{passo.titulo}</h5>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '8px' }}>{passo.desc}</p>
                  <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.78rem', color: '#f59e0b', marginBottom: '6px' }}>Dica: {passo.dica}</div>
                  <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--color-accent)' }}>Coach IA: </strong>{passo.ai}
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{ ...CARD, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#ef4444' }}>Aviso Legal: </strong>
            Este guia tem fins educativos. Investimentos possuem riscos. Os dados apresentados são informativos e coletados de fontes públicas (BODIVA, Aurea, Lewis Broker). Consulte um profissional autorizado antes de investir capital real.
          </div>
        </div>
      )}

      {/* ═══ TAB PERFIL ═══ */}
      {tab === 'perfil' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!quizAtivo && !perfil && (
            <div style={{ ...CARD, textAlign: 'center', padding: '36px 24px' }}>
              <User size={48} style={{ marginBottom: '12px', opacity: 0.3, color: 'var(--color-accent)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Descubra o seu Perfil de Investidor</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.6 }}>Responda a 5 perguntas e descubra qual corretora e estratégia se adaptam melhor ao seu perfil.</p>
              <button onClick={() => { setQuizAtivo(true); setQuizStep(0); setQuizPontos(0); }} className="btn btn-primary">Iniciar Teste</button>
            </div>
          )}

          {quizAtivo && (
            <div style={CARD}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pergunta {quizStep + 1} de {QUIZ.length}</span>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '180px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '4px', background: 'var(--color-accent)', width: ((quizStep + 1) / QUIZ.length * 100) + '%', transition: 'width 0.4s' }} />
                </div>
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: '16px', lineHeight: 1.5 }}>{quizStep + 1}. {QUIZ[quizStep].q}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {QUIZ[quizStep].o.map((op, i) => (
                  <button key={i} onClick={() => handleQuizAnswer(i + 1)} style={{ padding: '14px 16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, textAlign: 'left', fontSize: '0.88rem' }}>
                    {String.fromCharCode(65 + i)}. {op}
                  </button>
                ))}
              </div>
            </div>
          )}

          {perfil && !quizAtivo && perfilObj && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ ...CARD, background: perfilObj.cor + '0a', border: `1px solid ${perfilObj.cor}33`, textAlign: 'center', padding: '28px 24px' }}>
                <perfilObj.icon size={40} style={{ color: perfilObj.cor, marginBottom: '10px' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>O seu perfil é</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: perfilObj.cor, marginBottom: '8px' }}>{perfilObj.nome}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 16px' }}>{perfilObj.desc}</p>
                <button onClick={() => { setPerfil(null); setQuizAtivo(false); }} style={{ padding: '8px 16px', border: `1px solid ${perfilObj.cor}`, background: 'transparent', color: perfilObj.cor, borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Refazer Teste</button>
              </div>

              <div style={CARD}>
                <div style={{ fontWeight: 700, marginBottom: '12px' }}>Alocação Recomendada</div>
                {Object.keys(perfilObj.alocacao).map(broker => {
                  const perc = perfilObj.alocacao[broker];
                  return (
                    <div key={broker} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                        <span>{broker}</span>
                        <strong style={{ color: BROKER_DATA[broker].cor }}>{perc}%</strong>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: perc + '%', background: BROKER_DATA[broker].cor, borderRadius: '4px', transition: 'width 0.8s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ ...CARD, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontWeight: 700, marginBottom: '8px' }}>Próximos Passos</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div>→ Use o Simulador para projectar crescimento</div>
                  <div>→ Siga o Guia da corretora recomendada</div>
                  <div>→ Crie Metas Financeiras para manter o foco</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
