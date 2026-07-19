import React, { useState } from 'react';
import {
  BookOpen, ChevronRight, ChevronDown, X, Play, CheckCircle,
  LayoutDashboard, Receipt, Tags, FileBarChart, Sparkles,
  GraduationCap, TrendingUp, Building2, CreditCard, Settings,
  Smartphone, Wifi, Cloud, Star, Shield, Users, ArrowRight,
  MessageCircle, PiggyBank, Wallet, TrendingDown, Hash, Camera,
  Palette, Sliders, Trash2
} from 'lucide-react';

const GUIA_PASSOS = [
  {
    id: 'inicio',
    icon: '🚀',
    titulo: 'Começar com o App',
    cor: '#6366f1',
    passos: [
      { titulo: 'Criar Conta', desc: 'Clique em "Cadastrar" no ecrã inicial. Preencha o nome, e-mail e senha com mínimo 6 caracteres. A conta é criada imediatamente e pode começar a usar.' },
      { titulo: 'Entrar na Conta', desc: 'Use o e-mail e senha criados para entrar. Pode aceder do telemóvel e do computador — os dados ficam sincronizados na cloud se configurada.' },
      { titulo: 'Navegação', desc: 'O menu principal (ícone ☰ no canto superior esquerdo) dá acesso a todas as áreas: Dashboard, Lançamentos, Categorias, Cartões, Relatórios, Coach IA, Academia, Investimentos, Empresa, Subscrições, Suporte SMS e Configurações.' },
      { titulo: 'Sincronização Cloud (Multi-Dispositivo)', desc: 'Em Configurações → Cloud Sync, insira as credenciais do Supabase (URL e chave anon). Clique em "Testar Ligação". Após configurado, todos os dados ficam sincronizados em tempo real entre dispositivos.' },
      { titulo: 'Planos: Gratuito vs Pro', desc: 'O plano Gratuito permite registar até 50 lançamentos/mês. Dashboard, Lançamentos, Categorias, Cartões e Relatórios estão disponíveis no gratuito. Coach IA, Academia, Investimentos, Subscrições e Empresa são exclusivos do plano Pro.' },
    ]
  },
  {
    id: 'perfil',
    icon: '👤',
    titulo: 'Perfil e Personalização',
    cor: '#8b5cf6',
    passos: [
      { titulo: 'Foto de Perfil', desc: 'No Dashboard, clique no avatar (círculo com a inicial) para carregar uma foto. A imagem é guardada como base64 no seu perfil e aparece instantaneamente. Clique novamente para substituir.' },
      { titulo: 'Ocultar Valores', desc: 'No Dashboard, clique no ícone 👁️ ao lado da saudação para ocultar/mostrar todos os valores monetários. Útil para apresentações públicas.' },
      { titulo: 'Modo Escuro/Claro', desc: 'Em Configurações → Aparência, alterne entre tema escuro e claro. O tema é guardado automaticamente e persiste entre sessões.' },
      { titulo: 'Instalar como PWA', desc: 'Em Configurações → Instalar App, clique em "Instalar". No Android: aparece o prompt de instalação. No iOS: use "Adicionar ao Ecrã Inicial" no Safari. O app funciona offline após instalado.' },
    ]
  },
  {
    id: 'cartoes',
    icon: '💳',
    titulo: 'Cartões — Gerir Contas Financeiras',
    cor: '#f43f5e',
    passos: [
      { titulo: 'Criar Cartão', desc: 'Na aba Cartões, clique em "Novo Cartão". Dê um nome (ex: "Banco BAI"), número opcional, escolha um ícone e descrição. Cada cartão representa uma conta financeira separada.' },
      { titulo: 'Personalizar Aparência', desc: 'Ao criar ou editar um cartão, pode definir: Cor (20 opções), Intensidade da cor (0-100%), Modelo (classico, moderno, minimalista, premium, etc.) e Estilo (plano, material, glassmorphism, neon, etc.). O cartão actualiza visualmente em tempo real.' },
      { titulo: 'Saldo Disponível vs Contabilístico', desc: 'Saldo Disponível = dinheiro por distribuir. Saldo Contabilístico = Disponível + saldo de todas as categorias do cartão. O Disponível é usado para validar se pode fazer novos lançamentos.' },
      { titulo: 'Carregamentos', desc: 'Na vista detalhada do cartão, vá a "Carregamentos" para registar entradas de dinheiro no cartão (ex: depósito, transferência recebida). Isto aumenta o Saldo Disponível.' },
      { titulo: 'Transferir entre Cartões', desc: 'Na vista detalhada do cartão, vá a "Transferir". Selecione o cartão de destino, valor e descrição. O dinheiro sai do Disponível do cartão origem e aparece como Carregamento no destino.' },
    ]
  },
  {
    id: 'dashboard',
    icon: '📊',
    titulo: 'Dashboard — Visão Geral Financeira',
    cor: '#34d399',
    passos: [
      { titulo: 'Saldos Globais', desc: 'O topo do Dashboard mostra: Saldo Disponível Global (soma do Disponível de todos os cartões), Saldo Contabilístico Global, Total de Entradas (carregamentos) e Total de Saídas (despesas com categoria).' },
      { titulo: 'Taxa de Poupança', desc: 'Calculada automaticamente: (Entradas − Saídas) ÷ Entradas × 100. Mostra o percentual do dinheiro que não foi gasto.' },
      { titulo: 'Resumo dos Cartões', desc: 'Na parte inferior do Dashboard, cada cartão aparece com o seu saldo Disponível e Contabilístico. Clique num cartão para abrir a vista detalhada.' },
      { titulo: 'Gráficos', desc: 'O gráfico de Evolução Mensal compara entradas vs saídas mês a mês. O donut mostra a distribuição do saldo por categoria.' },
      { titulo: 'Categorias com Destaque', desc: 'O Dashboard mostra os top gastos, dívidas activas, empréstimos activos, categorias que atingiram a meta, e lançamentos recentes.' },
      { titulo: 'Acesso Rápido ao Suporte', desc: 'Clique no botão "Suporte" para abrir o chat com o administrador directamente do Dashboard.' },
    ]
  },
  {
    id: 'lancamentos',
    icon: '🧾',
    titulo: 'Lançamentos — Registar Movimentos',
    cor: '#f59e0b',
    passos: [
      { titulo: 'Adicionar Lançamento', desc: 'Clique em "Novo Lançamento". Preencha: Cartão (obrigatório — todo lançamento pertence a um cartão), Data, Tipo (Entrada ou Saída), Categoria (opcional) e Valor.' },
      { titulo: 'Tipos de Lançamento', desc: 'Entrada sem categoria = carregamento do cartão. Entrada com categoria = alocação de saldo para uma categoria específica. Saída com categoria = gasto/despesa. Saída sem categoria não é permitida.' },
      { titulo: 'Categoria e Cartão', desc: 'Ao selecionar um cartão, apenas as categorias desse cartão aparecem. Se não houver cartão selecionado, crie um na aba Cartões primeiro.' },
      { titulo: 'Validações Automáticas', desc: 'O sistema valida: saldo disponível do cartão antes de alocar, saldo da categoria mãe antes de alocar para filha, e saldo da categoria antes de registar saída. Dívidas são excepção (podem ficar negativas).' },
      { titulo: 'Editar ou Eliminar', desc: 'Clique em "Editar" (lápis) ou "Eliminar" (lixo) em cada lançamento. Pode alternar entre vista tabela e vista cartões com os botões no topo.' },
      { titulo: 'Filtros e Pesquisa', desc: 'Filtre por cartão, categoria ou período (mês/ano). Use a barra de pesquisa para encontrar por descrição, referência ou ID do lançamento.' },
    ]
  },
  {
    id: 'categorias',
    icon: '🏷️',
    titulo: 'Categorias — Organizar as Finanças',
    cor: '#ec4899',
    passos: [
      { titulo: 'Criar Categoria', desc: 'Na aba Categorias (ou na vista detalhada do cartão), clique em "Nova Categoria". Defina o nome, tipo (Receita/Despesa), subtipo (Poupança, Dívida, Investimento, Empréstimo, etc.) e o cartão ao qual pertence.' },
      { titulo: 'Categoria Mãe e Filha', desc: 'Pode criar hierarquias: uma Categoria Mãe (ex: "Salário") pode ter Categorias Filhas (ex: "Alimentação", "Transporte"). Ao alocar dinheiro da Mãe para a Filha, o saldo da Mãe diminui automaticamente.' },
      { titulo: 'Saldo da Categoria', desc: 'Cada categoria mostra: Total de Entradas (verde), Total de Saídas (vermelho) e Saldo actual (entradas − saídas). Ideal para controlar orçamentos por área.' },
      { titulo: 'Metas e Limites', desc: 'Em categorias do tipo Poupança/Investimento, pode definir um Alvo (valor objectivo). Ao atingir o alvo, a categoria aparece como "concluída" no Dashboard.' },
      { titulo: 'Alocar para Categoria', desc: 'Para alocar dinheiro a uma categoria, crie um lançamento do tipo Entrada com a categoria selecionada. O dinheiro sai do Disponível do cartão e fica disponível nessa categoria.' },
    ]
  },
  {
    id: 'cartao_detalhes',
    icon: '🔍',
    titulo: 'Vista Detalhada do Cartão',
    cor: '#06b6d4',
    passos: [
      { titulo: 'Aceder à Vista', desc: 'Clique num cartão no Dashboard (secção "Resumo dos Cartões") ou na aba Cartões. Abre a vista detalhada com toda a informação do cartão.' },
      { titulo: 'Separadores', desc: 'Visão Geral: saldos, gráfico mensal, donut de categorias e últimos lançamentos. Categorias: gerir categorias do cartão. Lançamentos: todos os movimentos. Transferir: enviar dinheiro para outro cartão. Carregamentos: registar entradas.' },
      { titulo: 'Gráfico de Evolução Mensal', desc: 'Mostra barras verdes (entradas) e vermelhas (saídas) dos últimos 6 meses. Altura proporcional ao valor.' },
      { titulo: 'Donut de Categorias', desc: 'Gràfico circular que mostra a distribuição do saldo por categoria. Clique na legenda para ver os percentuais.' },
    ]
  },
  {
    id: 'coach',
    icon: '🤖',
    titulo: 'Coach IA — Consultor Financeiro (Pro)',
    cor: '#6366f1',
    passos: [
      { titulo: 'Chat Financeiro', desc: 'Escreva perguntas em Português e o Coach IA responde com base nos seus dados reais. Exemplo: "Posso comprar algo de 100.000 Kz?" ou "Como está a minha saúde financeira?"' },
      { titulo: 'Score IA', desc: 'O Coach calcula automaticamente o seu Score de Saúde Financeira (0-100) com base na taxa de poupança, dívidas e consistência de registos. Veja-o no topo do Coach.' },
      { titulo: 'Planeador de Orçamento', desc: 'No separador "Planeador", insira o seu rendimento mensal e o app sugere uma distribuição inteligente. Pode adicionar e personalizar as suas despesas fixas.' },
      { titulo: 'Quick Prompts', desc: 'Use os botões de resposta rápida para fazer perguntas frequentes sem ter de digitar.' },
    ]
  },
  {
    id: 'academia',
    icon: '🎓',
    titulo: 'Academia Financeira (Pro)',
    cor: '#f59e0b',
    passos: [
      { titulo: 'Estrutura do Curso', desc: 'A Academia tem 4 Faculdades (Finanças Pessoais, Poupança e Investimento, Crédito e Dívidas, Empreendedorismo) com múltiplas aulas cada. Clique numa faculdade para expandir.' },
      { titulo: 'Abrir uma Aula', desc: 'Cada aula contém: Conteúdo teórico, Exercícios práticos e Quiz de avaliação (4 perguntas). Precisa de 75% no Quiz para concluir.' },
      { titulo: 'Progresso', desc: 'As aulas concluídas ficam marcadas com ✓ verde. O progresso é guardado automaticamente no seu perfil.' },
      { titulo: 'Certificado', desc: 'Ao concluir todas as faculdades, recebe um Certificado de Conclusão do curso completo de educação financeira.' },
    ]
  },
  {
    id: 'investimentos',
    icon: '📈',
    titulo: 'Área de Investimentos (Pro)',
    cor: '#34d399',
    passos: [
      { titulo: 'Cotações', desc: 'Mostra preços indicativos simulados de OTs, BTs, acções BAI/BCI e ETFs. As divisas (USD, EUR, GBP, ZAR, BRL) são actualizadas em tempo real.' },
      { titulo: 'Metas Financeiras', desc: 'Crie objectivos como "Comprar Carro" ou "Fundo de Emergência", defina valor alvo e prazo. Veja o progresso e faça alocações.' },
      { titulo: 'Simulador de Juros Compostos', desc: 'Insira capital inicial, contribuição mensal, taxa de juro e prazo. Veja a projecção ano a ano do crescimento do investimento.' },
      { titulo: 'Guia BODIVA', desc: 'Passo a passo para investir na BODIVA: desde abertura de conta até estratégia de reinvestimento, com sugestões do Coach IA.' },
      { titulo: 'Perfil de Investidor', desc: 'Responda ao quiz de 4 perguntas para descobrir o seu perfil: Conservador, Moderado ou Arrojado. Receba uma alocação de carteira personalizada.' },
    ]
  },
  {
    id: 'chat',
    icon: '💬',
    titulo: 'Suporte SMS — Falar com o Admin',
    cor: '#34d399',
    passos: [
      { titulo: 'Como Aceder', desc: 'Clique em "Suporte SMS" no menu principal (ícone de mensagem). Pode também clicar no botão "Falar com Suporte" no Dashboard.' },
      { titulo: 'Enviar Mensagem', desc: 'Escreva a sua mensagem na caixa de texto e clique em Enviar. O administrador recebe a mensagem em tempo real.' },
      { titulo: 'Eliminar Mensagens', desc: 'Passe o rato sobre uma mensagem e clique no ícone 🗑️ que aparece no canto superior direito para a eliminar. Confirme a acção na caixa de diálogo.' },
      { titulo: 'Modo Local vs Online', desc: 'Se o Supabase não estiver configurado, o chat funciona em modo local (mensagens guardadas neste dispositivo). Com Supabase configurado, as mensagens são enviadas para o servidor e o admin pode responder.' },
      { titulo: 'Tipos de Suporte', desc: 'Pode usar o chat para: problemas com a conta, dúvidas sobre o plano, enviar comprovativos de pagamento, reportar erros ou qualquer outra questão.' },
    ]
  },
  {
    id: 'admin',
    icon: '⚙️',
    titulo: 'Configurações e Administração',
    cor: '#94a3b8',
    passos: [
      { titulo: 'Cloud Sync', desc: 'Em Configurações → Cloud Sync, insira as credenciais do Supabase (URL e chave anon). Clique em "Testar Ligação". Após ligação bem-sucedida, os dados sincronizam automaticamente.' },
      { titulo: 'Guia do App', desc: 'Este guia! Disponível em Configurações → "Abrir Guia do App". Contém toda a documentação de uso.' },
      { titulo: 'Suporte SMS', desc: 'Atalho directo para Configurações → Suporte SMS. Abre o chat com o administrador.' },
      { titulo: 'Instalar App', desc: 'Em Configurações → Instalar App, clique para instalar como PWA no seu dispositivo. Funciona offline.' },
      { titulo: 'Painel SuperAdmin', desc: 'Se for SuperAdmin, vê o ícone de escudo 🛡️ no menu. Acede à gestão de: utilizadores, pagamentos, preços, dados bancários, códigos de convite e logs de auditoria.' },
    ]
  },
  {
    id: 'dicas',
    icon: '💡',
    titulo: 'Dicas e Boas Práticas',
    cor: '#fbbf24',
    passos: [
      { titulo: 'Organização por Cartões', desc: 'Crie um cartão para cada conta bancária. Use o Saldo Disponível para controlar o dinheiro não alocado e as categorias para organizar gastos.' },
      { titulo: 'Alocações vs Gastos', desc: 'Use Entrada + Categoria para alocar dinheiro (ex: "Salário → Alimentação"). Use Saída + Categoria para registar gastos (ex: "Supermercado"). A alocação diminui o Disponível, o gasto diminui o saldo da categoria.' },
      { titulo: 'Hierarquia de Categorias', desc: 'Crie categorias Mãe para rendimentos (ex: "Salário", "Freelas") e categorias Filha para despesas (ex: "Casa", "Transporte"). Aloque da Mãe para as Filhas.' },
      { titulo: 'Carregar vs Transferir', desc: 'Carregamento = dinheiro novo que entra no cartão. Transferência = mover dinheiro entre cartões existentes (não altera o património total).' },
      { titulo: 'Personalização Visual', desc: 'Use cores, modelos e estilos diferentes para cada cartão. Isto ajuda a identificar rapidamente cada conta. A intensidade da cor controla quão vibrante o cartão aparece.' },
      { titulo: 'Backup dos Dados', desc: 'Os dados ficam guardados localmente e na cloud (se configurada). Para exportar, use os Relatórios. Não há perda de dados ao desinstalar o app se a cloud estiver configurada.' },
    ]
  },
];

export default function GuiaAppView({ onClose }) {
  const [secaoAberta, setSecaoAberta] = useState('inicio');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', overflowY: 'auto'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%', maxWidth: '720px',
        padding: '0', overflow: 'hidden',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--color-accent), #a5b4fc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BookOpen size={22} style={{ color: '#fff' }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Guia de Utilização — Finança ao Ponto</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              {GUIA_PASSOS.reduce((s, g) => s + g.passos.length, 0)} dicas em {GUIA_PASSOS.length} secções
            </p>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{
            height: '100%', borderRadius: '0 2px 2px 0',
            background: 'linear-gradient(90deg, var(--color-accent), #a5b4fc)',
            width: `${(GUIA_PASSOS.filter(s => s.id === secaoAberta).length > 0 ? GUIA_PASSOS.findIndex(s => s.id === secaoAberta) + 1 : 0) / GUIA_PASSOS.length * 100}%`,
            transition: 'width 0.3s'
          }} />
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {GUIA_PASSOS.map(secao => {
              const aberta = secaoAberta === secao.id;
              const secaoIdx = GUIA_PASSOS.findIndex(s => s.id === secao.id);
              return (
                <div key={secao.id} style={{
                  background: aberta ? `${secao.cor}06` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${aberta ? secao.cor + '30' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '12px', overflow: 'hidden',
                  transition: 'all 0.2s'
                }}>
                  <button
                    onClick={() => setSecaoAberta(aberta ? null : secao.id)}
                    style={{
                      width: '100%', padding: '14px 16px', background: 'none', border: 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{secao.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', flex: 1, color: 'var(--text-primary)' }}>{secao.titulo}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '10px' }}>
                      {secao.passos.length} {secao.passos.length === 1 ? 'passo' : 'passos'}
                    </span>
                    {aberta ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
                  </button>

                  {aberta && (
                    <div style={{ padding: '0 16px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {secao.passos.map((passo, i) => (
                          <div key={i} style={{
                            display: 'flex', gap: '12px', padding: '12px',
                            background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                            border: `1px solid ${secao.cor}15`
                          }}>
                            <div style={{
                              width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                              background: `${secao.cor}20`, border: `1px solid ${secao.cor}40`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.7rem', fontWeight: 800, color: secao.cor
                            }}>{i + 1}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px', color: secao.cor }}>{passo.titulo}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{passo.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Navigation within section */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        {secaoIdx > 0 && (
                          <button onClick={() => setSecaoAberta(GUIA_PASSOS[secaoIdx - 1].id)}
                            style={{
                              padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)',
                              borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-secondary)',
                              display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                            <ChevronRight size={12} style={{ transform: 'rotate(180deg)' }} /> Anterior
                          </button>
                        )}
                        {secaoIdx < GUIA_PASSOS.length - 1 && (
                          <button onClick={() => setSecaoAberta(GUIA_PASSOS[secaoIdx + 1].id)}
                            style={{
                              padding: '6px 12px', background: `${secao.cor}15`, border: `1px solid ${secao.cor}30`,
                              borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', color: secao.cor,
                              display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, marginLeft: 'auto'
                            }}>
                            Seguinte <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {GUIA_PASSOS.map(s => (
              <span key={s.id} onClick={() => setSecaoAberta(s.id)}
                style={{
                  fontSize: '0.7rem', padding: '3px 10px', borderRadius: '20px', cursor: 'pointer',
                  background: secaoAberta === s.id ? `${s.cor}25` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${secaoAberta === s.id ? s.cor + '40' : 'var(--border-color)'}`,
                  color: secaoAberta === s.id ? s.cor : 'var(--text-muted)',
                  fontWeight: secaoAberta === s.id ? 700 : 400,
                  transition: 'all 0.15s'
                }}>
                {s.icon} {s.titulo.split('—')[0].trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
          <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            <CheckCircle size={16} style={{ marginRight: '6px' }} /> Entendido — Começar a Usar!
          </button>
        </div>
      </div>
    </div>
  );
}
