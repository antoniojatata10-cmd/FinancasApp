import React, { useState } from 'react';
import {
  BookOpen, ChevronRight, ChevronDown, X, Play, CheckCircle,
  LayoutDashboard, Receipt, Tags, FileBarChart, Sparkles,
  GraduationCap, TrendingUp, Building2, CreditCard, Settings,
  Smartphone, Wifi, Cloud, Star, Shield, Users, ArrowRight
} from 'lucide-react';

const GUIA_PASSOS = [
  {
    id: 'inicio',
    icon: '🚀',
    titulo: 'Começar com o App',
    cor: '#6366f1',
    passos: [
      { titulo: 'Criar Conta', desc: 'Clique em "Cadastrar" no ecrã inicial. Preencha o nome, e-mail e senha com mínimo 6 caracteres. A conta é criada imediatamente.' },
      { titulo: 'Entrar na Conta', desc: 'Use o e-mail e senha criados para entrar. Pode aceder do telemóvel e do computador — os dados ficam sincronizados na cloud.' },
      { titulo: 'Sincronização Cloud (Multi-Dispositivo)', desc: 'Para que a conta apareça noutros dispositivos, o administrador precisa de configurar o Supabase em Configurações → Cloud Sync. Após configurado, todos os dados ficam sincronizados em tempo real.' },
      { titulo: 'Planos: Gratuito vs Pro', desc: 'O plano Gratuito permite registar até 50 lançamentos/mês e usar o Dashboard, Lançamentos, Categorias e Relatórios. O plano Pro desbloqueia Coach IA, Academia, Investimentos e Empresa.' },
    ]
  },
  {
    id: 'dashboard',
    icon: '📊',
    titulo: 'Dashboard — Visão Geral',
    cor: '#34d399',
    passos: [
      { titulo: 'Saldo e Estatísticas', desc: 'O Dashboard mostra o saldo líquido, total de entradas e saídas do período actual. Actualiza automaticamente ao adicionar lançamentos.' },
      { titulo: 'Gráficos', desc: 'Os gráficos mostram a distribuição das despesas por categoria e a evolução do saldo ao longo do tempo.' },
      { titulo: 'Acesso Rápido', desc: 'Clique em "Adicionar Lançamento" para registar rapidamente um gasto ou receita a partir do Dashboard.' },
    ]
  },
  {
    id: 'lancamentos',
    icon: '🧾',
    titulo: 'Lançamentos — Registar Movimentos',
    cor: '#f59e0b',
    passos: [
      { titulo: 'Adicionar Lançamento', desc: 'Clique em "+ Novo Lançamento". Preencha: Data, Categoria, Tipo (Entrada ou Saída), Valor, Descrição e Conta.' },
      { titulo: 'Tipos de Lançamento', desc: 'Entrada = dinheiro que entra (salário, vendas, transferência recebida). Saída = dinheiro que sai (compras, despesas, pagamentos).' },
      { titulo: 'Editar ou Eliminar', desc: 'Clique no ícone de lápis para editar ou no ícone de lixo para eliminar um lançamento existente.' },
      { titulo: 'Limite do Plano Gratuito', desc: 'O plano Gratuito tem limite de 50 lançamentos/mês. Após atingir o limite, faça upgrade para Pro para continuar a registar.' },
    ]
  },
  {
    id: 'categorias',
    icon: '🏷️',
    titulo: 'Categorias — Organizar as Finanças',
    cor: '#ec4899',
    passos: [
      { titulo: 'Criar Categoria', desc: 'Aceda a Categorias e clique em "+ Nova Categoria". Defina o nome, tipo (Receita/Despesa) e subtipo (Poupança, Dívida, Investimento, etc.).' },
      { titulo: 'Categoria Mãe e Filha', desc: 'Pode criar uma hierarquia: a Categoria Mãe (ex: Salário) pode ter Categorias Filhas (ex: Alimentação, Transporte). Isto permite alocar o salário para subcategorias específicas.' },
      { titulo: 'Saldo da Categoria', desc: 'Cada categoria mostra o saldo actual (entradas – saídas). Ideal para controlar orçamentos por área de vida.' },
    ]
  },
  {
    id: 'coach',
    icon: '🤖',
    titulo: 'Coach IA — Consultor Financeiro (Pro)',
    cor: '#6366f1',
    passos: [
      { titulo: 'Chat Financeiro', desc: 'Escreva perguntas em Português e o Coach IA responde com base nos seus dados reais. Exemplo: "Posso comprar algo de 100.000 Kz?" ou "Como está a minha saúde financeira?"' },
      { titulo: 'Score IA', desc: 'O Coach calcula automaticamente o seu Score de Saúde Financeira (0-100) com base na taxa de poupança, dívidas e consistência de registos.' },
      { titulo: 'Planeador de Orçamento', desc: 'No separador "Planeador de Orçamento", insira o seu rendimento mensal e o app sugere uma distribuição inteligente. Pode adicionar e personalizar as suas despesas fixas.' },
      { titulo: 'Quick Prompts', desc: 'Use os botões de resposta rápida para fazer perguntas frequentes sem ter de digitar.' },
    ]
  },
  {
    id: 'academia',
    icon: '🎓',
    titulo: 'Academia Financeira (Pro)',
    cor: '#f59e0b',
    passos: [
      { titulo: 'Estrutura do Curso', desc: 'A Academia tem 4 Faculdades com múltiplas aulas cada. Clique numa faculdade para expandir e ver as aulas disponíveis.' },
      { titulo: 'Abrir uma Aula', desc: 'Clique numa aula para abri-la. Cada aula tem: Conteúdo teórico, Exercícios práticos e Quiz de avaliação.' },
      { titulo: 'Concluir uma Aula', desc: 'Para marcar como concluída, precisa de obter pelo menos 75% no Quiz. As aulas concluídas ficam marcadas com ✓ verde.' },
      { titulo: 'Certificado', desc: 'Ao concluir todas as aulas de uma faculdade, recebe um badge de conclusão. Ao completar todas as faculdades, recebe o Certificado de Conclusão.' },
    ]
  },
  {
    id: 'investimentos',
    icon: '📈',
    titulo: 'Área de Investimentos (Pro)',
    cor: '#34d399',
    passos: [
      { titulo: 'Cotações BODIVA/BNA', desc: 'O separador "Cotações" mostra preços indicativos simulados de instrumentos angolanos: OTs, BTs, acções BAI/BCI e ETFs internacionais. As divisas (USD, EUR, GBP) são obtidas em tempo real.' },
      { titulo: 'Metas Financeiras', desc: 'No separador "Metas", crie objectivos como "Comprar Carro" ou "Fundo de Emergência", defina o valor alvo e prazo. Vá alocando saldo progressivamente até atingir a meta.' },
      { titulo: 'Simulador de Juros Compostos', desc: 'Insira capital inicial, contribuição mensal, prazo e taxa de juro. O simulador mostra a projecção ano a ano do crescimento do investimento.' },
      { titulo: 'Guia BODIVA', desc: 'Passo a passo completo para investir na BODIVA, com sugestões do Coach IA em cada etapa. Da abertura de conta até à estratégia de reinvestimento.' },
      { titulo: 'Perfil de Investidor', desc: 'Responda ao quiz de 4 perguntas para descobrir o seu perfil (Conservador, Moderado ou Arrojado) e receber uma alocação de carteira personalizada.' },
    ]
  },
  {
    id: 'subscricoes',
    icon: '💳',
    titulo: 'Subscrições e Pagamentos',
    cor: '#8b5cf6',
    passos: [
      { titulo: 'Ver o Seu Plano', desc: 'Aceda a Subscrições para ver o plano actual, data de expiração e histórico de pagamentos.' },
      { titulo: 'Upgrade para Pro', desc: 'Veja os preços mensais e anuais do plano Pro. Clique em "Fazer Upgrade" para ver os dados de pagamento do administrador.' },
      { titulo: 'Formas de Pagamento', desc: 'O pagamento é feito directamente ao administrador por: Multicaixa Express, Transferência Bancária, IBAN ou referência. Após pagamento, envie o comprovativo ao administrador para activação imediata.' },
      { titulo: 'Limites do Plano Gratuito', desc: 'Coach IA, Academia, Investimentos e Módulo Empresa são exclusivos do plano Pro. Ao tentar aceder, o app mostra os dados de pagamento para facilitar o upgrade.' },
    ]
  },
  {
    id: 'admin',
    icon: '⚙️',
    titulo: 'Configurações e Administração',
    cor: '#94a3b8',
    passos: [
      { titulo: 'Configurar Cloud Sync', desc: 'Em Configurações → Cloud Sync, insira as credenciais do Supabase (URL e chave anon). Clique em "Testar Ligação". Se a ligação for bem sucedida, os dados ficam sincronizados entre dispositivos.' },
      { titulo: 'Modo Escuro/Claro', desc: 'Mude o tema em Configurações → Aparência. O tema é guardado automaticamente.' },
      { titulo: 'Painel SuperAdmin', desc: 'Se for SuperAdmin, acede ao painel de administração para: gerir utilizadores, aprovar pagamentos, definir preços dos planos e configurar os dados bancários para receber pagamentos.' },
      { titulo: 'Instalar como PWA', desc: 'Para instalar o app no telemóvel sem loja de apps, use Configurações → Instalar App. No iOS: use "Adicionar ao Ecrã Inicial" no Safari.' },
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
        width: '100%', maxWidth: '680px',
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
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Tudo o que precisa saber para usar o app</p>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {GUIA_PASSOS.map(secao => {
              const aberta = secaoAberta === secao.id;
              return (
                <div key={secao.id} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px', overflow: 'hidden'
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
                              width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                              background: `${secao.cor}20`, border: `1px solid ${secao.cor}40`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.7rem', fontWeight: 800, color: secao.cor
                            }}>{i + 1}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>{passo.titulo}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{passo.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer tip */}
          <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            💡 <strong style={{ color: 'var(--color-accent)' }}>Dica:</strong> Para acesso multi-dispositivo, configure o Supabase em <strong>Configurações → Cloud Sync</strong>. Após configurado, os dados sincronizam automaticamente entre telemóvel e computador.
          </div>
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
          <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
            Entendido — Começar a Usar!
          </button>
        </div>
      </div>
    </div>
  );
}
