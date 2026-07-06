import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  GraduationCap, BookOpen, ChevronRight, ChevronDown, CheckCircle,
  Lock, Star, Play, Award, BarChart2, Brain, TrendingUp, DollarSign,
  AlertTriangle, Lightbulb, Target, Clock, ArrowLeft, X, Plus, Edit2,
  Trash2, Upload, PlayCircle, Eye, RefreshCw
} from 'lucide-react';
import { supabase } from '../supabaseClient';

// ─── CURSO COMPLETO (Formação Escrita) ──────────────────────────────────────────
const FACULDADES = [
  {
    id: 'F1',
    nome: 'Faculdade 1 — Fundamentos da Educação Financeira',
    icon: '📚',
    cor: '#6366f1',
    desc: 'Base teórica essencial sobre dinheiro, mentalidade e psicologia financeira.',
    aulas: [
      {
        id: 'F1A1',
        titulo: 'O Que É Dinheiro',
        duracao: '45 min',
        nivel: 'Iniciante',
        objetivos: [
          'Compreender o conceito de dinheiro',
          'Entender a evolução histórica do dinheiro',
          'Conhecer as características que tornam algo um dinheiro',
          'Compreender a diferença entre riqueza e dinheiro',
        ],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'Introdução',
            texto: `Imagine que amanhã todo o dinheiro desaparecesse. Sem notas. Sem moedas. Sem cartões. Sem transferências.\n\nComo compraria comida? Como pagaria a internet? Como compraria combustível?\n\nA resposta mostra a importância do dinheiro na sociedade moderna.\n\n**Dinheiro é qualquer coisa aceite por uma comunidade como meio de troca para aquisição de bens e serviços.** Em termos simples: Dinheiro é uma ferramenta que facilita trocas.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Capítulo 1 — A História do Dinheiro',
            texto: `**FASE 1 – ESCAMBO**\nAntes do dinheiro, as pessoas utilizavam o escambo — troca directa. Exemplo: João troca 10 kg de milho por 2 galinhas de Pedro. Problema: E se Pedro não quiser milho? Este problema chama-se **Dupla Coincidência de Necessidades**.\n\n**FASE 2 – DINHEIRO-MERCADORIA**\nCivilizações começaram a usar sal, gado, conchas, chá e tabaco como dinheiro. 💡 Curiosidade: A palavra "salário" vem do latim "salarium" — os soldados romanos recebiam parte do pagamento em sal!\n\n**FASE 3 – METAIS PRECIOSOS**\nOuro e prata tornaram-se padrão porque possuem: Escassez, Durabilidade, Divisibilidade, Transportabilidade e Aceitação universal.\n\n**FASE 4 – PAPEL-MOEDA**\nTransportar grandes quantidades de ouro era perigoso. Os bancos passaram a guardar o ouro e emitir recibos que circulavam como dinheiro.\n\n**FASE 5 – SISTEMA BANCÁRIO MODERNO**\nHoje a maior parte do dinheiro existe digitalmente. O seu saldo bancário de 100.000 Kz raramente existe fisicamente — é apenas um registo electrónico.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Capítulo 2 — As 3 Funções do Dinheiro',
            texto: `**1. Meio de Troca** — Serve para comprar bens e serviços: pão, combustível, roupa.\n\n**2. Unidade de Conta** — Permite medir valor: Pão = 500 Kz | Gasolina = 700 Kz | Telemóvel = 300.000 Kz.\n\n**3. Reserva de Valor** — Permite guardar riqueza para uso futuro. Exemplo: guardar dinheiro hoje para comprar uma casa daqui a 5 anos.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Capítulo 3 — As 5 Características do Bom Dinheiro',
            texto: `✅ **Escassez** — Não pode ser criado facilmente. O ouro é escasso; areia não é.\n\n✅ **Durabilidade** — Precisa resistir ao tempo. O ouro dura séculos; bananas não.\n\n✅ **Divisibilidade** — Pode ser dividido: 1.000 Kz → 500 Kz → 100 Kz.\n\n✅ **Portabilidade** — Deve ser fácil de transportar.\n\n✅ **Aceitabilidade** — As pessoas precisam de o aceitar.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Capítulo 4 — Dinheiro vs Riqueza',
            texto: `Muitas pessoas confundem os dois. Não são a mesma coisa!\n\n**Dinheiro** = Ferramenta de troca.\n**Riqueza** = Conjunto de activos que geram valor: empresas, imóveis, terrenos, acções, direitos autorais.\n\n**Exemplo:**\nPessoa A: possui 20 milhões Kz na conta.\nPessoa B: possui 5 apartamentos alugados.\nQuem é mais rico? Normalmente Pessoa B — tem activos geradores de renda.\n\n**Estudo de caso:**\nJoão ganha 500.000 Kz/mês e gasta 500.000 Kz. Património: 0 Kz.\nPedro ganha 300.000 Kz e investe 100.000 Kz durante 20 anos. Quem ficará mais rico? **Pedro.** Porque acumula activos.`,
          },
        ],
        exercicios: [
          'Explique por que o escambo é ineficiente.',
          'Liste as 5 características de um bom dinheiro.',
          'Explique a diferença entre dinheiro e riqueza.',
          'Uma comunidade utiliza bananas como dinheiro. Que problemas surgirão?',
          'Se um governo imprimir dinheiro excessivamente, o que pode acontecer?',
        ],
        quiz: [
          { pergunta: 'O que é escambo?', opcoes: ['Troca directa de bens sem dinheiro', 'Uma moeda medieval', 'Um tipo de investimento'], correto: 0, explicacao: 'Escambo é a troca directa de bens ou serviços sem utilização de dinheiro como intermediário.' },
          { pergunta: 'Qual das seguintes é uma função do dinheiro?', opcoes: ['Decoração', 'Reserva de Valor', 'Meio de produção'], correto: 1, explicacao: 'O dinheiro serve como Meio de Troca, Unidade de Conta e Reserva de Valor.' },
          { pergunta: 'Por que o ouro foi historicamente usado como dinheiro?', opcoes: ['Porque é bonito', 'Porque é escasso, durável e divisível', 'Porque os governos decidiram'], correto: 1, explicacao: 'O ouro reúne as características essenciais do bom dinheiro: escassez, durabilidade, divisibilidade e portabilidade.' },
          { pergunta: 'Qual a diferença entre riqueza e dinheiro?', opcoes: ['São a mesma coisa', 'Riqueza são activos geradores de valor; dinheiro é ferramenta de troca', 'Dinheiro é mais valioso'], correto: 1, explicacao: 'Riqueza é o conjunto de activos que geram valor continuamente, enquanto dinheiro é apenas um meio de troca.' },
        ],
        leituras: ['The Psychology of Money — Morgan Housel', 'Pai Rico, Pai Pobre — Robert Kiyosaki', 'The Bitcoin Standard — Saifedean Ammous'],
      },
      {
        id: 'F1A2',
        titulo: 'Mentalidade dos Ricos',
        duracao: '60 min',
        nivel: 'Iniciante',
        objetivos: [
          'Compreender as diferenças entre pessoas ricas e pobres na forma de pensar',
          'Identificar crenças limitantes sobre dinheiro',
          'Entender como os ricos utilizam o dinheiro',
          'Diferenciar rendimento activo de rendimento passivo',
          'Compreender o Quadrante do Fluxo de Caixa',
        ],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'Introdução',
            texto: `Muitas pessoas acreditam que a riqueza depende apenas de sorte, herança ou salário elevado.\n\nMas a realidade mostra algo diferente. Existem pessoas que ganham muito e permanecem pobres; e outras que ganham pouco e tornam-se milionárias.\n\nA diferença geralmente está na **mentalidade**.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Capítulo 1 — O Que É Mentalidade Financeira',
            texto: `Mentalidade financeira é o conjunto de crenças, hábitos e decisões relacionadas ao dinheiro. Ela influencia como ganha, gasta e investe dinheiro.\n\n**Exemplo:** Duas pessoas recebem 500.000 Kz.\n\nPessoa A: Compra roupas, telemóvel, festas → Após 1 ano: Saldo = 0\nPessoa B: Investe 30%, compra activos, estuda finanças → Após 1 ano: Património crescente\n\nMesmo rendimento. Resultados completamente diferentes.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Capítulo 2 — Crenças Limitantes',
            texto: `Muitas pessoas cresceram a ouvir:\n• "Dinheiro é a raiz de todo o mal"\n• "Rico é ladrão"\n• "Quem nasce pobre morre pobre"\n• "Dinheiro não traz felicidade"\n• "Investir é perigoso"\n\nEstas crenças influenciam negativamente as decisões financeiras. Para criar riqueza, é necessário identificar e eliminar estas crenças limitantes.\n\n**Exercício de reflexão:** O que os seus pais diziam sobre dinheiro? O que acredita sobre pessoas ricas?`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Capítulo 3 — Pobres, Classe Média e Ricos',
            texto: `**POBRES:** Recebem → Gastam tudo → Precisam trabalhar novamente\nFluxo: Salário → Despesas\n\n**CLASSE MÉDIA:** Recebem → Compram passivos → Criam mais despesas\nFluxo: Salário → Carro financiado → Casa financiada → Dívidas\n\n**RICOS:** Recebem → Compram activos → Activos geram renda → Compram mais activos\nFluxo: Dinheiro → Activos → Mais dinheiro`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Capítulo 4 — Activos vs Passivos',
            texto: `**ACTIVO** = algo que coloca dinheiro no seu bolso:\n• Imóveis alugados\n• Dividendos\n• Empresas\n• Acções\n• Direitos autorais\n• Negócios digitais\n\n**PASSIVO** = algo que retira dinheiro do seu bolso:\n• Dívidas\n• Empréstimos\n• Carros financiados\n• Cartões de crédito\n\n**Exemplo:** Carro particular (combustível + seguro + manutenção) = Passivo. Táxi/Uber próprio que gera renda = pode ser Activo.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Capítulo 5 — O Quadrante do Fluxo de Caixa (Kiyosaki)',
            texto: `**E – Empregado:** Troca tempo por dinheiro. Estabilidade mas limite de rendimento.\nExemplos: professor, médico contratado, funcionário público.\n\n**A – Autónomo:** Trabalha por conta própria. Se parar de trabalhar, deixa de ganhar.\nExemplos: mecânico, advogado independente, freelancer.\n\n**D – Dono de Negócio:** Possui sistemas e pessoas a trabalhar. Escalabilidade mas maior responsabilidade.\n\n**I – Investidor:** Dinheiro trabalha para ele. Liberdade financeira quase ilimitada.\n\n**Exemplo:** João (empregado) recebe 500.000 Kz apenas se trabalhar. Pedro (investidor) com 10 apartamentos recebe 2.000.000 Kz mesmo dormindo. Quem tem mais liberdade? **Pedro.**`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Capítulo 6 — O Poder dos Juros Compostos',
            texto: `Albert Einstein está frequentemente associado à frase: *"Os juros compostos são a oitava maravilha do mundo."*\n\n**Exemplo:** Investindo 100.000 Kz/mês com rentabilidade de 10% ao ano durante 30 anos → acumula dezenas de milhões de Kz.\n\n**O tempo é o maior aliado do investidor.** Quem começa cedo normalmente vence, mesmo com menos capital.`,
          },
        ],
        exercicios: [
          'Explique a diferença entre activo e passivo com exemplos da sua vida.',
          'Em qual quadrante (E, A, D, I) está actualmente? Justifique.',
          'Liste 5 crenças sobre dinheiro que ouviu durante a infância.',
          'Identifique 3 activos que poderia adquirir nos próximos 5 anos.',
          'Por que os ricos priorizam activos antes de luxos?',
        ],
        quiz: [
          { pergunta: 'O que é um activo segundo Kiyosaki?', opcoes: ['Algo que você possui', 'Algo que coloca dinheiro no seu bolso', 'O seu carro particular'], correto: 1, explicacao: 'Um activo é qualquer coisa que gera rendimento ou coloca dinheiro no bolso do proprietário.' },
          { pergunta: 'No Quadrante do Fluxo de Caixa, quem representa o maior nível de liberdade financeira?', opcoes: ['E (Empregado)', 'A (Autónomo)', 'I (Investidor)'], correto: 2, explicacao: 'O Investidor tem o dinheiro a trabalhar por ele, permitindo liberdade financeira máxima.' },
          { pergunta: 'Qual é o fluxo financeiro dos ricos?', opcoes: ['Salário → Despesas', 'Dinheiro → Activos → Mais dinheiro', 'Salário → Luxos → Poupança'], correto: 1, explicacao: 'Os ricos focam-se em adquirir activos que geram renda passiva, criando um ciclo de acumulação de riqueza.' },
          { pergunta: 'O que é uma crença limitante?', opcoes: ['Uma meta financeira', 'Uma crença que bloqueia o crescimento financeiro', 'Um tipo de investimento'], correto: 1, explicacao: 'Crenças limitantes são pensamentos negativos sobre dinheiro que bloqueiam o crescimento financeiro e as decisões inteligentes.' },
        ],
        leituras: ['Pai Rico, Pai Pobre — Robert Kiyosaki', 'O Homem Mais Rico da Babilônia — George S. Clason', 'The Psychology of Money — Morgan Housel'],
      },
      {
        id: 'F1A3',
        titulo: 'Psicologia Financeira',
        duracao: '75 min',
        nivel: 'Iniciante',
        objetivos: [
          'Compreender como o cérebro toma decisões financeiras',
          'Identificar emoções que afectam investimentos',
          'Reconhecer os principais vieses cognitivos',
          'Controlar impulsos financeiros e desenvolver disciplina',
        ],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'Introdução',
            texto: `Imagine dois investidores. O primeiro conhece análise técnica, análise fundamentalista e gestão de risco — mas perde dinheiro constantemente. O segundo tem menos conhecimento técnico mas mantém disciplina e controla emoções — e ganha consistentemente.\n\nPor quê? Porque o mercado financeiro é, acima de tudo, um **jogo psicológico**. Muitos investidores não perdem por falta de conhecimento, mas por não controlarem as suas emoções.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Os Dois Sistemas do Cérebro',
            texto: `**Sistema 1 – Emocional:** Rápido, automático, instintivo, impulsivo. Quando vê "GANHE 500% EM 30 DIAS" sente entusiasmo imediato.\n\n**Sistema 2 – Racional:** Lento, analítico, lógico, disciplinado. Antes de investir analisa: riscos, retorno, histórico, probabilidade.\n\n**Regra de Ouro:** Investidores ricos usam o Sistema 2. Investidores emocionais usam o Sistema 1.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Medo e Ganância',
            texto: `**MEDO** aparece quando o mercado cai, quando perde dinheiro, quando há incerteza.\nSintomas: fechar posições cedo, não entrar em boas oportunidades, vender no pior momento.\n\nExemplo: Compra uma acção a 100 → cai para 95 → você vende (medo) → dias depois sobe para 130. O medo expulsou-o do mercado.\n\n**GANÂNCIA** aparece quando ganha dinheiro rapidamente.\nSintomas: operar demais, assumir riscos excessivos, ignorar gestão de risco.\n\nExemplo: Ganhou 50.000 Kz → quer 500.000 → aumenta o lote sem critério → perde tudo.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Os Principais Vieses Cognitivos',
            texto: `**🐑 Efeito Manada:** Tendência de seguir a maioria mesmo quando está errada. Durante a bolha imobiliária de 2008, todos compravam imóveis porque todos compravam. Resultado: colapso global.\n\n**🔍 Viés de Confirmação:** Procurar apenas informações que confirmam o que já acreditamos. Solução: Para cada argumento favorável, liste 1 argumento contrário.\n\n**💪 Excesso de Confiança:** Acreditar que sabe mais do que realmente sabe. Após 10 operações vencedoras, o trader pensa "sou invencível" → aumenta o risco → perde metade da conta. O mercado castiga a arrogância.\n\n**😰 Aversão à Perda:** Uma perda de 100 dólares causa mais dor do que um ganho de 100 dólares gera felicidade. Consequência: segurar prejuízos e vender lucros cedo — exactamente o oposto do correcto.\n\n**📱 FOMO (Fear Of Missing Out):** Bitcoin sobe 30%, todos falam → você compra no topo → mercado corrige. Antídoto: "Eu compraria isto se ninguém estivesse a falar disso?"\n\n**💢 Vingança Contra o Mercado:** Perde 50.000 Kz → fica irritado → abre nova operação emocional → perde novamente. Regra: após perdas, PARE, analise, respire, retorne apenas quando estiver racional.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'O Diário Emocional',
            texto: `Ferramenta usada por traders profissionais. Após cada operação registe:\n\n• Data:\n• Activo:\n• Resultado:\n• Emoção antes da operação:\n• Emoção durante:\n• Emoção depois:\n• Lição aprendida:\n\n**Exemplo real:**\nData: 10/06 | Activo: NASDAQ | Resultado: -15.000 Kz | Emoção: Ansiedade | Erro: Entrei antes do sinal | Lição: Esperar confirmação.\n\n**Fórmula do sucesso:** Conhecimento + Psicologia + Disciplina = Resultados Consistentes`,
          },
        ],
        exercicios: [
          'Explique a diferença entre Sistema 1 e Sistema 2 no contexto financeiro.',
          'Descreva um exemplo pessoal de FOMO em finanças.',
          'Explique o efeito manada com um exemplo real.',
          'Qual viés psicológico mais te afecta? Justifique.',
          'Crie o seu Diário Emocional para as próximas 2 semanas.',
        ],
        quiz: [
          { pergunta: 'O que é FOMO no contexto financeiro?', opcoes: ['Uma estratégia de investimento', 'O medo de ficar de fora de uma oportunidade', 'Uma técnica de análise técnica'], correto: 1, explicacao: 'FOMO (Fear Of Missing Out) é o medo de perder uma oportunidade, levando a decisões impulsivas como comprar no topo de mercado.' },
          { pergunta: 'O que é o viés de confirmação?', opcoes: ['Confirmar uma operação no mercado', 'Procurar apenas informações que confirmam o que já acreditamos', 'Analisar ambos os lados de um investimento'], correto: 1, explicacao: 'O viés de confirmação faz-nos ignorar informações contrárias às nossas crenças, criando uma visão distorcida da realidade.' },
          { pergunta: 'Qual é a regra após uma perda emocional no mercado?', opcoes: ['Operar mais para recuperar o prejuízo', 'Parar, analisar, respirar e retornar apenas racional', 'Aumentar o tamanho das posições'], correto: 1, explicacao: 'Após perdas, a "vingança contra o mercado" é um dos erros mais destrutivos. A disciplina exige paragem e reflexão antes de continuar.' },
          { pergunta: 'Qual sistema do cérebro deve dominar as decisões financeiras?', opcoes: ['Sistema 1 — rápido e instintivo', 'Sistema 2 — racional e analítico', 'Ambos em igual proporção'], correto: 1, explicacao: 'O Sistema 2 (lento, analítico, lógico) é o que leva a decisões financeiras consistentes e bem fundamentadas.' },
        ],
        leituras: ['The Psychology of Money — Morgan Housel', 'Thinking, Fast and Slow — Daniel Kahneman', 'Trading in the Zone — Mark Douglas', 'Atomic Habits — James Clear'],
      },
      {
        id: 'F1A4',
        titulo: 'Fluxo de Caixa Pessoal',
        duracao: '50 min',
        nivel: 'Iniciante',
        objetivos: ['Aprender para onde o dinheiro vai', 'Mapear toda a vida financeira', 'Classificar tipos de gastos', 'Identificar vazamentos financeiros'],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'Conceito Principal',
            texto: `A maioria das pessoas sabe quanto ganha. Pouquíssimas sabem exactamente quanto gastam.\n\n**Fluxo de Caixa = Entradas – Saídas**\n\nExemplo prático:\nSalário: 500.000 Kz + Renda Extra: 100.000 Kz = **Total Entradas: 600.000 Kz**\n\nCasa: 150.000 | Transporte: 50.000 | Alimentação: 100.000 | Internet: 20.000 | Lazer: 80.000 | Outros: 50.000 = **Total Saídas: 450.000 Kz**\n\n**Fluxo de Caixa = 600.000 – 450.000 = 150.000 Kz positivo**`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Os 4 Tipos de Gastos',
            texto: `**🔴 Necessários:** Água, luz, alimentação, habitação. Não pode eliminar.\n\n**🟡 Importantes:** Educação, saúde, poupança. Deve manter.\n\n**🟢 Supérfluos:** Luxos, compras por impulso, assinaturas não utilizadas. Analise criticamente.\n\n**🔵 Investimentos:** Acções, ETFs, imóveis, negócios. Maximize esta categoria!\n\n**Exercício prático:** Liste todos os gastos dos últimos 30 dias e classifique cada um nestas 4 categorias. Provavelmente vai surpreender-se com o que descobre.`,
          },
        ],
        exercicios: [
          'Liste todos os gastos dos últimos 30 dias e classifique cada um.',
          'Calcule o seu fluxo de caixa mensal actual.',
          'Identifique os 3 maiores "vazamentos financeiros" nos seus gastos.',
          'Crie uma planilha completa de fluxo de caixa.',
        ],
        quiz: [
          { pergunta: 'Qual é a fórmula do Fluxo de Caixa?', opcoes: ['Entradas × Saídas', 'Entradas – Saídas', 'Entradas + Poupança'], correto: 1, explicacao: 'Fluxo de Caixa = Entradas – Saídas. Um resultado positivo significa que está a viver dentro das suas possibilidades.' },
          { pergunta: 'Qual tipo de gasto deve ser maximizado?', opcoes: ['Supérfluos', 'Necessários', 'Investimentos'], correto: 2, explicacao: 'Os Investimentos são o único tipo de gasto que geram retorno futuro e constroem riqueza ao longo do tempo.' },
          { pergunta: 'O que são "vazamentos financeiros"?', opcoes: ['Dívidas bancárias', 'Gastos desnecessários que drenam o seu dinheiro sem valor percebido', 'Impostos pagos ao Estado'], correto: 1, explicacao: 'Vazamentos financeiros são gastos pequenos e invisíveis (assinaturas não usadas, café diário, compras impulsivas) que somados representam montantes significativos.' },
        ],
        leituras: ['I Will Teach You to Be Rich — Ramit Sethi', 'The Total Money Makeover — Dave Ramsey'],
      },
      {
        id: 'F1A5',
        titulo: 'Orçamento Profissional',
        duracao: '55 min',
        nivel: 'Iniciante',
        objetivos: ['Criar um orçamento que funcione', 'Aplicar a Regra 50-30-20', 'Evitar os erros comuns de orçamento'],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'O Que É um Orçamento',
            texto: `Um orçamento é um plano que determina **para onde o seu dinheiro irá antes de recebê-lo**.\n\nSem orçamento, o dinheiro simplesmente "some" no fim do mês e você não sabe para onde foi.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'A Regra 50-30-20',
            texto: `**50% — Necessidades:** Habitação, alimentação, transporte, serviços essenciais.\nExemplo com 500.000 Kz: 250.000 Kz\n\n**30% — Desejos:** Lazer, restaurantes, roupas, entretenimento.\nExemplo: 150.000 Kz\n\n**20% — Investimentos/Poupança:** Obrigatório. Pague-se a si próprio primeiro.\nExemplo: 100.000 Kz\n\n**Método Militar:** 70% Custos | 20% Investimentos | 10% Reserva de emergência`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Os 4 Erros Fatais de Orçamento',
            texto: `❌ **Gastar antes de planejar** — O dinheiro desaparece antes de chegar ao fim do mês.\n❌ **Não investir nada** — Trabalha-se para sobreviver, não para prosperar.\n❌ **Não registar despesas** — Impossível controlar o que não se mede.\n❌ **Comprar por emoção** — As compras por impulso destroem qualquer orçamento.`,
          },
        ],
        exercicios: [
          'Crie o seu orçamento mensal usando a Regra 50-30-20.',
          'Identifique onde a sua distribuição actual se desvia da regra ideal.',
          'Crie um plano de orçamento para os próximos 12 meses.',
        ],
        quiz: [
          { pergunta: 'Na Regra 50-30-20, qual percentagem é destinada a investimentos?', opcoes: ['50%', '30%', '20%'], correto: 2, explicacao: '20% do rendimento deve ser destinado a poupança e investimentos. Este é o "salário que paga a si próprio".' },
          { pergunta: 'O que significa "pagar-se a si próprio primeiro"?', opcoes: ['Gastar no lazer antes das contas', 'Transferir a poupança antes de qualquer gasto', 'Pagar as dívidas primeiro'], correto: 1, explicacao: 'Transferir a poupança/investimento logo ao receber o salário garante que este dinheiro não seja gasto por impulso.' },
        ],
        leituras: ['The Automatic Millionaire — David Bach', 'I Will Teach You to Be Rich — Ramit Sethi'],
      },
      {
        id: 'F1A6',
        titulo: 'Juros Simples',
        duracao: '40 min',
        nivel: 'Intermediário',
        objetivos: ['Compreender o conceito de juros', 'Aplicar a fórmula dos juros simples', 'Resolver problemas práticos'],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'O Que São Juros',
            texto: `Juros são o **preço do dinheiro no tempo**. Quando empresta dinheiro, cobra juros. Quando pede emprestado, paga juros.\n\n**Fórmula dos Juros Simples:**\n\n**J = C × i × t**\n\nOnde: J = Juros | C = Capital | i = Taxa | t = Tempo`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Exemplos Resolvidos',
            texto: `**Exemplo 1:**\nCapital: 100.000 Kz | Taxa: 10% ao ano | Prazo: 2 anos\nJ = 100.000 × 0,10 × 2 = **20.000 Kz**\nMontante Final = 100.000 + 20.000 = **120.000 Kz**\n\n**Exemplo 2:**\nCapital: 200.000 Kz | Taxa: 5% ao ano | Prazo: 3 anos\nJ = 200.000 × 0,05 × 3 = **30.000 Kz**\nMontante Final = **230.000 Kz**\n\n**Aplicações práticas:** Empréstimos pessoais, financiamentos básicos, operações comerciais de curto prazo.`,
          },
        ],
        exercicios: [
          'Calcule os juros simples: C=500.000, i=8%, t=2 anos.',
          'Um banco cobra 15% ao ano em juros simples. Num empréstimo de 1.000.000 Kz por 18 meses, qual o total a pagar?',
          'Calcule 10 problemas de juros simples com diferentes cenários.',
        ],
        quiz: [
          { pergunta: 'Na fórmula J = C × i × t, o que representa "i"?', opcoes: ['Investimento', 'Taxa de juro', 'Tempo'], correto: 1, explicacao: '"i" representa a taxa de juro aplicada sobre o capital.' },
          { pergunta: 'Capital de 100.000 Kz a 10% ao ano por 1 ano em juros simples resulta em:', opcoes: ['10.000 Kz de juros', '100.000 Kz de juros', '110.000 Kz de juros'], correto: 0, explicacao: 'J = 100.000 × 0,10 × 1 = 10.000 Kz de juros. O montante final é 110.000 Kz.' },
        ],
        leituras: ['Matemática Financeira — Ion Ionescu', 'Finanças Pessoais para Dummies'],
      },
      {
        id: 'F1A7',
        titulo: 'Juros Compostos — A 8ª Maravilha do Mundo',
        duracao: '60 min',
        nivel: 'Intermediário',
        objetivos: ['Compreender os juros compostos', 'Aplicar a fórmula M = C(1+i)^n', 'Simular cenários de longo prazo', 'Compreender o poder do tempo nos investimentos'],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'Juros sobre Juros',
            texto: `Nos juros compostos, os **juros de cada período são adicionados ao capital** e passam a gerar mais juros no período seguinte. É o "efeito bola de neve".\n\n**Fórmula:** M = C(1+i)^n\nOnde: M = Montante Final | C = Capital Inicial | i = Taxa por período | n = Número de períodos`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Exemplos Comparativos',
            texto: `**Capital:** 100.000 Kz | **Taxa:** 10%/ano | **Prazo:** 3 anos\n\nJuros Simples:\nAno 1: 110.000 | Ano 2: 120.000 | Ano 3: 130.000 Kz\n\nJuros Compostos:\nAno 1: 110.000 | Ano 2: 121.000 | Ano 3: 133.100 Kz\n\nDiferença: 3.100 Kz — e esta diferença cresce exponencialmente com o tempo!\n\n**Longo prazo:** 100.000 Kz a 10% durante 30 anos = **≈ 1.744.940 Kz**\n\n**A Regra dos Investidores: Tempo > Capital**\nQuem começa 10 anos antes, mesmo com menos capital, normalmente acaba com mais.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'A Regra dos 72',
            texto: `A Regra dos 72 diz quanto tempo leva para dobrar o capital:\n\n**Anos para dobrar = 72 ÷ Taxa de juros**\n\nExemplos:\n• Taxa 10%: 72 ÷ 10 = 7,2 anos para dobrar\n• Taxa 14,5% (BTs Angola): 72 ÷ 14,5 = ≈ 5 anos para dobrar\n• Taxa 17% (OTs Angola): 72 ÷ 17 = ≈ 4,2 anos para dobrar\n\nIsso significa que investindo em OTs angolanas, o seu capital dobra a cada ≈ 4 anos!`,
          },
        ],
        exercicios: [
          'Calcule M = C(1+i)^n para: C=500.000, i=17%, n=5 anos.',
          'Compare juros simples vs compostos para o mesmo cenário durante 20 anos.',
          'Use a Regra dos 72 para calcular quando o seu capital dobra com as taxas actuais da BODIVA.',
          'Simule investir 50.000 Kz/mês por 10, 20 e 30 anos com taxa de 17%.',
        ],
        quiz: [
          { pergunta: 'Qual é a diferença fundamental entre juros simples e compostos?', opcoes: ['O tempo de aplicação', 'Nos compostos, os juros se somam ao capital e geram mais juros', 'A taxa de juro aplicada'], correto: 1, explicacao: 'Nos juros compostos, o rendimento de cada período é reinvestido, criando o efeito exponencial que multiplica o capital ao longo do tempo.' },
          { pergunta: 'Pela Regra dos 72, com taxa de 12% ao ano, quanto tempo leva para dobrar o capital?', opcoes: ['6 anos', '8 anos', 'Exactamente 12 anos'], correto: 0, explicacao: '72 ÷ 12 = 6 anos. Num prazo de 6 anos com taxa de 12% compostos, o capital dobra.' },
          { pergunta: 'O que é mais importante nos juros compostos?', opcoes: ['A taxa de juro', 'O capital inicial', 'O tempo de investimento'], correto: 2, explicacao: 'O tempo é o factor mais poderoso nos juros compostos. Quem começa cedo, mesmo com menos capital, normalmente termina com mais.' },
        ],
        leituras: ['The Compound Effect — Darren Hardy', 'Pai Rico, Pai Pobre — Robert Kiyosaki'],
      },
      {
        id: 'F1A8',
        titulo: 'Valor Presente e Valor Futuro',
        duracao: '55 min',
        nivel: 'Intermediário',
        objetivos: ['Compreender o valor do dinheiro no tempo', 'Calcular Valor Futuro (VF)', 'Calcular Valor Presente (VP)', 'Aplicar conceitos em decisões reais'],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'O Dinheiro Muda de Valor no Tempo',
            texto: `**100.000 Kz hoje NÃO têm o mesmo valor que 100.000 Kz daqui a 10 anos.**\n\nPorquê? Porque 100.000 Kz hoje podem ser investidos e crescer. A inflação também reduz o poder de compra.\n\nPor isso, precisamos de ferramentas para comparar dinheiro em diferentes momentos do tempo.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Valor Futuro (VF)',
            texto: `Quanto valerá o seu dinheiro no futuro?\n\n**Fórmula:** VF = VP × (1+i)^n\n\nExemplo:\nVP = 100.000 Kz | Taxa = 10%/ano | Prazo = 5 anos\nVF = 100.000 × (1,10)^5 = **161.051 Kz**\n\nInvestindo 100.000 Kz hoje a 10%, terá 161.051 Kz daqui a 5 anos.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Valor Presente (VP)',
            texto: `Quanto vale hoje um valor que receberá no futuro?\n\n**Fórmula:** VP = VF ÷ (1+i)^n\n\nExemplo:\nVF = 200.000 Kz (a receber daqui a 5 anos) | Taxa = 10%\nVP = 200.000 ÷ (1,10)^5 = **124.184 Kz**\n\nIsso significa que 200.000 Kz daqui a 5 anos equivalem apenas a 124.184 Kz hoje!\n\n**Decisão prática:** Opção A: Receber 1 milhão hoje. Opção B: Receber 1 milhão daqui a 10 anos. Qual é melhor? **Opção A!** — porque pode investir o dinheiro hoje.`,
          },
        ],
        exercicios: [
          'Calcule o VF de 500.000 Kz a 17% por 10 anos.',
          'Calcule o VP de 2.000.000 Kz a receber em 15 anos com taxa de 10%.',
          'Compare: receber 500.000 Kz hoje vs 800.000 Kz daqui a 3 anos (taxa 15%). O que é mais vantajoso?',
        ],
        quiz: [
          { pergunta: 'Qual é a fórmula do Valor Futuro?', opcoes: ['VF = VP ÷ (1+i)^n', 'VF = VP × (1+i)^n', 'VF = VP × i × n'], correto: 1, explicacao: 'VF = VP × (1+i)^n — aplica-se a taxa composta durante n períodos sobre o capital presente.' },
          { pergunta: '100.000 Kz hoje são mais valiosos do que 100.000 Kz daqui a 10 anos?', opcoes: ['Falso — o valor é igual', 'Verdadeiro — o dinheiro de hoje pode ser investido', 'Depende da inflação apenas'], correto: 1, explicacao: 'Verdadeiro. 100.000 Kz hoje podem ser investidos e crescer. Além disso, a inflação corrói o poder de compra do dinheiro futuro.' },
        ],
        leituras: ['Finanças para Empreendedores', 'Corporate Finance — Brealey, Myers & Allen'],
      },
    ],
  },
  {
    id: 'F2',
    nome: 'Faculdade 2 — Gestão Financeira Avançada',
    icon: '📊',
    cor: '#34d399',
    desc: 'Estratégias avançadas de gestão, planeamento e construção de patrimônio.',
    bloqueada: false,
    aulas: [
      { id: 'F2A1', titulo: 'Taxas Equivalentes e Taxa Real', duracao: '45 min', nivel: 'Avançado', objetivos: ['Converter taxas entre diferentes períodos', 'Calcular taxa real de retorno descontando inflação'], conteudo: [{ tipo: 'intro', titulo: 'Taxas Equivalentes', texto: `Uma taxa mensal de 1% é equivalente a quanto ao ano? NÃO é simplesmente 12%!\n\nTaxa Anual Equivalente = (1 + taxa mensal)^12 - 1\n= (1,01)^12 - 1 = 12,68%\n\n**Taxa Real de Retorno:**\nTaxa Real ≈ Taxa Nominal – Inflação\nSe um investimento rende 17% ao ano mas a inflação é 7%, o retorno real é ≈ 10%.\n\nIsto é crucial para avaliar se um investimento está realmente a gerar riqueza ou apenas a preservar o poder de compra.` }], exercicios: ['Converta: 2% ao mês para taxa anual efectiva.', 'Um investimento rende 14,5%. Com inflação de 6%, qual é o retorno real?'], quiz: [{ pergunta: 'Como calcular a taxa anual equivalente a 1% ao mês?', opcoes: ['1% × 12 = 12%', '(1,01)^12 - 1 ≈ 12,68%', '1% × 365'], correto: 1, explicacao: 'A conversão de taxas usa a fórmula da capitalização composta: (1 + taxa)^n - 1.' }], leituras: ['Matemática Financeira — Gilberto Assaf Neto'] },
      { id: 'F2A2', titulo: 'Inflação e Poder de Compra', duracao: '50 min', nivel: 'Avançado', objetivos: ['Compreender a inflação angolana', 'Proteger o poder de compra'], conteudo: [{ tipo: 'intro', titulo: 'O Que É Inflação', texto: `Inflação é o aumento geral dos preços ao longo do tempo. Em Angola, medida pelo Índice de Preços ao Consumidor (IPC) pelo INE.\n\nSe a inflação é 10% ao ano, 100.000 Kz compram hoje o que 90.909 Kz comprariam no ano passado.\n\n**Como proteger o poder de compra:**\n• Invista em activos reais (imóveis, ouro)\n• Use instrumentos indexados à inflação\n• Invista em divisas fortes (USD, EUR)\n• Diversifique geograficamente` }], exercicios: ['Se a inflação é 8% e o salário não aumenta, quanto poder de compra perde em 5 anos?'], quiz: [{ pergunta: 'Como a inflação afecta o dinheiro guardado "debaixo do colchão"?', opcoes: ['Não afecta', 'Aumenta o valor', 'Destrói o poder de compra gradualmente'], correto: 2, explicacao: 'Dinheiro parado perde poder de compra em proporção à inflação. Num ambiente de 10% de inflação, perde 10% do poder de compra por ano.' }], leituras: ['A Riqueza das Nações — Adam Smith'] },
    ],
  },
  {
    id: 'F3',
    nome: 'Faculdade 3 — Mercado de Capitais e BODIVA',
    icon: '📈',
    cor: '#f59e0b',
    desc: 'Formação específica sobre o mercado angolano, BODIVA, BNA e instrumentos financeiros locais.',
    bloqueada: false,
    aulas: [
      { id: 'F3A1', titulo: 'Estrutura do Mercado Financeiro Angolano', duracao: '60 min', nivel: 'Avançado', objetivos: ['Conhecer os reguladores angolanos', 'Entender BNA, BODIVA, ARSEG e CMC'], conteudo: [{ tipo: 'intro', titulo: 'O Sistema Financeiro Angolano', texto: `**BNA (Banco Nacional de Angola):** Banco central. Regula a política monetária, define a taxa de referência (BNA Rate), emite moeda e supervisiona o sistema bancário.\n\n**BODIVA (Bolsa de Dívida e Valores de Angola):** Bolsa de valores angolana. Negociação de Bilhetes do Tesouro (BTs), Obrigações do Tesouro (OTs) e acções cotadas.\n\n**CMC (Comissão do Mercado de Capitais):** Supervisiona o mercado de capitais, protege investidores e regula emissores de valores mobiliários.\n\n**ARSEG (Agência Reguladora de Seguros):** Supervisiona o sector segurador angolano.\n\n**Como investir:** Necessita de abrir conta num banco autorizado pela BODIVA e solicitar acesso ao mercado secundário.` }], exercicios: ['Pesquise as actuais taxas de BTs em leilão no BNA.', 'Liste 5 empresas cotadas na BODIVA e os seus sectores.'], quiz: [{ pergunta: 'Qual instituição regula o mercado de capitais em Angola?', opcoes: ['BNA', 'CMC (Comissão do Mercado de Capitais)', 'BODIVA'], correto: 1, explicacao: 'A CMC é o regulador do mercado de capitais angolano, supervisionando emissores, intermediários e protegendo investidores.' }], leituras: ['Website oficial da BODIVA — bodiva.ao', 'Website do BNA — bna.ao'] },
    ],
  },
  {
    id: 'F4',
    nome: 'Faculdade 4 — Análise de Investimentos',
    icon: '🔬',
    cor: '#ec4899',
    desc: 'Análise técnica, análise fundamentalista e gestão de risco profissional.',
    bloqueada: false,
    aulas: [
      { id: 'F4A1', titulo: 'Análise Fundamentalista', duracao: '75 min', nivel: 'Avançado', objetivos: ['Avaliar o valor intrínseco de empresas e títulos', 'Analisar balanços e demonstrações financeiras'], conteudo: [{ tipo: 'intro', titulo: 'O Que É Análise Fundamentalista', texto: `Análise fundamentalista avalia o valor real (intrínseco) de um activo com base nos fundamentos económicos, financeiros e do sector.\n\n**Para acções:** Analisar receita, lucro, dívida, crescimento, gestão e perspectivas de mercado.\n\n**Para BTs/OTs:** Analisar a situação fiscal do Estado, rating soberano, taxa LUIBOR e spread de crédito.\n\n**Indicadores principais:**\n• P/E (Price-to-Earnings): preço da acção ÷ lucro por acção\n• ROE (Return on Equity): lucro ÷ capital próprio × 100\n• Dívida/Patrimônio: indica alavancagem\n• Dividend Yield: dividendo anual ÷ preço da acção × 100` }], exercicios: ['Pesquise o P/E ratio de 3 empresas cotadas na BODIVA.', 'Analise o balanço simplificado de uma empresa angolana conhecida.'], quiz: [{ pergunta: 'O que indica um P/E ratio baixo?', opcoes: ['A empresa está cara', 'A empresa pode estar subvalorizada ou ter perspectivas fracas', 'A empresa não paga dividendos'], correto: 1, explicacao: 'Um P/E baixo pode indicar que a acção está subvalorizada (oportunidade) ou que o mercado antecipa problemas futuros (risco). É necessário analisar o contexto completo.' }], leituras: ['The Intelligent Investor — Benjamin Graham', 'Security Analysis — Graham & Dodd'] },
    ],
  },
];

// ─── Componente Aula Modal ─────────────────────────────────────────────────────

// AulaModal para aulas escritas
function AulaModal({ aula, onClose, onComplete, concluida }) {
  const [step, setStep] = useState('conteudo');
  const [quizStep, setQuizStep] = useState(0);
  const [quizResp, setQuizResp] = useState([]);
  const [quizConcluido, setQuizConcluido] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleQuizResp = (idx) => {
    const correctas = [...quizResp, idx === aula.quiz[quizStep].correto];
    setQuizResp(correctas);
    if (quizStep < aula.quiz.length - 1) {
      setQuizStep(q => q + 1);
    } else {
      const score = correctas.filter(Boolean).length;
      setQuizScore(score);
      setQuizConcluido(true);
      if (score >= Math.ceil(aula.quiz.length * 0.75) && !concluida) {
        onComplete(aula.id);
      }
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '760px', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{aula.nivel} · {aula.duracao}</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{aula.titulo}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-color)' }}>
          {['conteudo', 'exercicios', 'quiz'].map(s => (
            <button key={s} onClick={() => { setStep(s); setQuizStep(0); setQuizResp([]); setQuizConcluido(false); }} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '8px 14px', fontWeight: step === s ? 700 : 400,
              color: step === s ? 'var(--color-accent)' : 'var(--text-muted)',
              borderBottom: step === s ? '2px solid var(--color-accent)' : '2px solid transparent',
              fontSize: '0.82rem'
            }}>
              {s === 'conteudo' ? '📖 Conteúdo' : s === 'exercicios' ? '✏️ Exercícios' : '🧪 Quiz'}
            </button>
          ))}
          {concluida && <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', fontSize: '0.78rem', fontWeight: 700 }}><CheckCircle size={14} /> Concluída</div>}
        </div>

        {step === 'conteudo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto' }}>
            {aula.conteudo.map((bloco, i) => (
              <div key={i} style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>{bloco.titulo}</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{bloco.texto}</p>
              </div>
            ))}
          </div>
        )}

        {step === 'exercicios' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {aula.exercicios.map((ex, i) => (
              <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', color: '#fff', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{ex}</div>
              </div>
            ))}
          </div>
        )}

        {step === 'quiz' && !quizConcluido && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pergunta {quizStep + 1} de {aula.quiz.length}</span>
            <h4 style={{ fontWeight: 700 }}>{aula.quiz[quizStep].pergunta}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {aula.quiz[quizStep].opcoes.map((op, i) => (
                <button key={i} onClick={() => handleQuizResp(i)} style={{ padding: '12px 16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}>
                  {op}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'quiz' && quizConcluido && (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{quizScore >= Math.ceil(aula.quiz.length * 0.75) ? '🎉' : '📖'}</div>
            <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px' }}>{quizScore}/{aula.quiz.length} corretas</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{quizScore >= Math.ceil(aula.quiz.length * 0.75) ? 'Excelente! Aula concluída.' : 'Reveja o conteúdo e tente novamente.'}</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button onClick={onClose} className="btn btn-secondary">Fechar</button>
          {step === 'conteudo' && <button onClick={() => setStep('exercicios')} className="btn btn-primary">Exercícios</button>}
          {step === 'exercicios' && <button onClick={() => setStep('quiz')} className="btn btn-primary">Fazer Quiz</button>}
        </div>
      </div>
    </div>
  );
}

// Componente Principal
export default function AcademiaView({ currentUser }) {
  const [activeModule, setActiveModule] = useState('escrito'); // 'videos' | 'escrito' | 'admin'
  
  // Written course state
  const [aulaAberta, setAulaAberta] = useState(null);
  const [concluidas, setConcluidas] = useState([]);
  const [faculdadeAberta, setFaculdadeAberta] = useState('F1');

  // Video course state
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoCategory, setVideoCategory] = useState('all');
  const [watchStats, setWatchStats] = useState({});
  const [loadingVideos, setLoadingVideos] = useState(true);

  // Admin stats
  const [adminStats, setAdminStats] = useState({ totalViews: 0, completed: 0, activeUsers: 0 });

  // Admin Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Educação Financeira');
  const [level, setLevel] = useState('Iniciante');
  const [sortOrder, setSortOrder] = useState('0');
  const [duration, setDuration] = useState('0');
  const [planAllowed, setPlanAllowed] = useState('Gratuito');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const videoPlayerRef = useRef(null);
  const isAdmin = currentUser?.Role === 'admin' || currentUser?.Role === 'superadmin';
  const isProUser = currentUser?.Plano === 'Pro' || isAdmin;

  useEffect(() => {
    fetchWrittenConcluidas();
    fetchVideos();
    if (isAdmin) fetchAdminStats();
  }, []);

  // Fetch written courses completions from profiles/settings or local backup
  const fetchWrittenConcluidas = () => {
    try {
      const data = JSON.parse(localStorage.getItem('academia_concluidas_v2')) || [];
      setConcluidas(data);
    } catch {
      setConcluidas([]);
    }
  };

  const handleConcluirEscrito = (aulaId) => {
    setConcluidas(prev => {
      const updated = prev.includes(aulaId) ? prev : [...prev, aulaId];
      localStorage.setItem('academia_concluidas_v2', JSON.stringify(updated));
      return updated;
    });
  };

  // Fetch videos from database
  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      // Query videos table
      const { data: vData, error: vError } = await supabase
        .from('videos')
        .select('*')
        .order('sort_order', { ascending: true });

      // If error (e.g. table not created yet), just show empty list
      if (vError) {
        console.warn('Tabela videos não encontrada ou erro:', vError.message);
        setVideos([]);
        setLoadingVideos(false);
        return;
      }
      setVideos(vData || []);

      // Query watch stats for current user (skip if no user)
      if (!currentUser?.id) { setLoadingVideos(false); return; }
      const { data: sData } = await supabase
        .from('video_watch_stats')
        .select('*')
        .eq('user_id', currentUser.id);

      const statsObj = {};
      sData?.forEach(s => {
        statsObj[s.video_id] = s;
      });
      setWatchStats(statsObj);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Fetch Admin Video Panel Stats
  const fetchAdminStats = async () => {
    try {
      const { data, error } = await supabase
        .from('video_watch_stats')
        .select('*');

      if (error) throw error;
      
      const totalViews = data?.length || 0;
      const completed = data?.filter(s => s.is_completed).length || 0;
      const uniqueUsers = new Set(data?.map(s => s.user_id)).size;

      setAdminStats({
        totalViews,
        completed,
        activeUsers: uniqueUsers
      });
    } catch (err) {
      console.error('Error fetching admin statistics:', err);
    }
  };

  // Video Watch Progress Tracking
  const handleTimeUpdate = async () => {
    const video = videoPlayerRef.current;
    if (!video || !selectedVideo) return;

    const progress = (video.currentTime / video.duration) * 100;
    const isCompleted = progress >= 90; // 90% watched = completed

    // Debounce database calls by updating stats locally, save to DB on progress milestones or ends
    const roundedProgress = Math.round(progress);
    if (roundedProgress % 10 === 0 || isCompleted) {
      try {
        await supabase
          .from('video_watch_stats')
          .upsert({
            user_id: currentUser.id,
            video_id: selectedVideo.id,
            watch_time: Math.round(video.currentTime),
            progress: parseFloat(progress.toFixed(2)),
            is_completed: isCompleted || (watchStats[selectedVideo.id]?.is_completed || false),
            last_watched_at: new Date().toISOString()
          }, { onConflict: 'user_id,video_id' });

        setWatchStats(prev => ({
          ...prev,
          [selectedVideo.id]: {
            video_id: selectedVideo.id,
            progress,
            is_completed: isCompleted || (prev[selectedVideo.id]?.is_completed || false)
          }
        }));
      } catch (err) {
        console.error('Error saving watch statistics:', err);
      }
    }
  };

  // Admin: Video management handlers
  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!title || !videoFile) {
      alert('Preencha o título e carregue o ficheiro de vídeo.');
      return;
    }

    setSubmitting(true);
    try {
      let videoUrl = '';
      let thumbnailUrl = '';

      // 1. Upload video file to bucket
      const videoExt = videoFile.name.split('.').pop();
      const videoName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${videoExt}`;
      const { error: vUploadErr } = await supabase.storage
        .from('videos')
        .upload(videoName, videoFile);
      if (vUploadErr) throw vUploadErr;

      const { data: vUrlData } = supabase.storage.from('videos').getPublicUrl(videoName);
      videoUrl = vUrlData.publicUrl;

      // 2. Upload thumbnail file to bucket (optional)
      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split('.').pop();
        const thumbName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${thumbExt}`;
        const { error: tUploadErr } = await supabase.storage
          .from('thumbnails')
          .upload(thumbName, thumbnailFile);
        if (tUploadErr) throw tUploadErr;

        const { data: tUrlData } = supabase.storage.from('thumbnails').getPublicUrl(thumbName);
        thumbnailUrl = tUrlData.publicUrl;
      }

      // 3. Save metadata to table
      const { error: dbErr } = await supabase
        .from('videos')
        .insert([{
          title,
          description,
          category,
          level,
          sort_order: parseInt(sortOrder) || 0,
          duration: parseInt(duration) || 0,
          plan_allowed: planAllowed,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl
        }]);

      if (dbErr) throw dbErr;

      alert('Vídeo adicionado com sucesso!');
      setShowAddForm(false);
      resetForm();
      fetchVideos();
    } catch (err) {
      console.error('Error adding video:', err);
      alert('Erro ao carregar vídeo: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Tem a certeza que deseja apagar esta aula?')) return;
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Vídeo removido!');
      fetchVideos();
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Educação Financeira');
    setLevel('Iniciante');
    setSortOrder('0');
    setDuration('0');
    setPlanAllowed('Gratuito');
    setVideoFile(null);
    setThumbnailFile(null);
  };

  const filteredVideos = videos.filter(v => {
    if (videoCategory === 'all') return true;
    return v.category === videoCategory;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Written course modal */}
      {aulaAberta && (
        <AulaModal
          aula={aulaAberta}
          onClose={() => setAulaAberta(null)}
          onComplete={handleConcluirEscrito}
          concluida={concluidas.includes(aulaAberta.id)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={26} style={{ color: '#fff' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Academia Financeira</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Evolua a sua literacia financeira com aulas escritas e vídeos interativos</p>
          </div>
        </div>

        {/* Sub-tabs menu */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button onClick={() => setActiveModule('videos')} style={{ background: activeModule === 'videos' ? 'var(--color-accent)' : 'none', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#fff', fontSize: '0.82rem', fontWeight: 600 }}>🎥 Aulas em Vídeo</button>
          <button onClick={() => setActiveModule('escrito')} style={{ background: activeModule === 'escrito' ? 'var(--color-accent)' : 'none', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#fff', fontSize: '0.82rem', fontWeight: 600 }}>📖 Formação Escrita</button>
          {isAdmin && (
            <button onClick={() => setActiveModule('admin')} style={{ background: activeModule === 'admin' ? 'rgba(245,158,11,0.2)' : 'none', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#f59e0b', fontSize: '0.82rem', fontWeight: 600 }}>⚙️ Painel Admin</button>
          )}
        </div>
      </div>

      {/* ─── MODULO 1: VÍDEOS ─── */}
      {activeModule === 'videos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {selectedVideo ? (
            /* Streaming video player overlay/container */
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button onClick={() => setSelectedVideo(null)} className="btn btn-secondary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={16} /> Voltar para a lista
              </button>
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                {/* HTML5 video player configured to disable download buttons and allow streaming */}
                <video
                  ref={videoPlayerRef}
                  src={selectedVideo.video_url}
                  controls
                  controlsList="nodownload"
                  onTimeUpdate={handleTimeUpdate}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedVideo.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '6px', lineHeight: 1.6 }}>{selectedVideo.description}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>🏷️ Categoria: {selectedVideo.category}</span>
                  <span>📊 Nível: {selectedVideo.level}</span>
                  <span>⏱ Duração: {Math.round(selectedVideo.duration / 60)} min</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Category filters */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['all', 'Educação Financeira', 'Investimentos', 'Empresas', 'Impostos', 'Poupar Dinheiro', 'Planeamento Financeiro', 'Dívidas', 'Orçamento', 'Academia'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setVideoCategory(cat)}
                    style={{
                      background: videoCategory === cat ? 'var(--color-accent)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-color)', color: '#fff', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap'
                    }}
                  >
                    {cat === 'all' ? 'Ver Todos' : cat}
                  </button>
                ))}
              </div>

              {/* Video list */}
              {loadingVideos ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" size={24} /></div>
              ) : filteredVideos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Sem vídeos disponíveis nesta categoria.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {filteredVideos.map(v => {
                    const isLocked = v.plan_allowed === 'Pro' && !isProUser;
                    const stats = watchStats[v.id] || {};
                    const progress = stats.progress || 0;
                    const isCompleted = stats.is_completed || false;

                    return (
                      <div
                        key={v.id}
                        className="glass-panel"
                        onClick={() => {
                          if (isLocked) {
                            alert('Esta aula em vídeo é exclusiva para utilizadores Pro.');
                            return;
                          }
                          setSelectedVideo(v);
                        }}
                        style={{
                          padding: '0', overflow: 'hidden', cursor: isLocked ? 'not-allowed' : 'pointer',
                          opacity: isLocked ? 0.7 : 1, transition: 'all 0.2s', border: isCompleted ? '1px solid rgba(52,211,153,0.3)' : '1px solid var(--border-color)'
                        }}
                      >
                        {/* Thumbnail overlay */}
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: 'rgba(0,0,0,0.2)' }}>
                          {v.thumbnail_url ? (
                            <img src={v.thumbnail_url} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                              <PlayCircle size={36} style={{ opacity: 0.2 }} />
                            </div>
                          )}
                          
                          {/* Locked overlay */}
                          {isLocked && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                              <Lock size={20} style={{ color: '#f59e0b' }} />
                              <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>Exclusivo Pro</span>
                            </div>
                          )}
                          
                          {/* Play button overlay when hovered */}
                          {!isLocked && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                                 onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                 onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                              <Play size={24} />
                            </div>
                          )}
                        </div>

                        {/* Title details */}
                        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--color-accent)', fontWeight: 700 }}>{v.category}</span>
                            {isCompleted && <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '8px', background: 'rgba(52,211,153,0.1)', color: '#34d399', fontWeight: 700 }}>Concluído</span>}
                          </div>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</h4>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <span>⏱ Duração: {Math.round(v.duration / 60)} min</span>
                            <span>{v.level}</span>
                          </div>

                          {/* Progress bar */}
                          {progress > 0 && (
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
                              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-success)' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ─── MODULO 2: ESCRITO ─── */}
      {activeModule === 'escrito' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {FACULDADES.map(fac => {
            const aulasF = fac.aulas.length;
            const concluidasF = fac.aulas.filter(a => concluidas.includes(a.id)).length;
            const pctF = (concluidasF / aulasF) * 100;
            const aberta = faculdadeAberta === fac.id;

            return (
              <div key={fac.id} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <button
                  onClick={() => setFaculdadeAberta(aberta ? null : fac.id)}
                  style={{
                    width: '100%', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left',
                    borderBottom: aberta ? '1px solid var(--border-color)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '1.8rem' }}>{fac.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{fac.nome}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fac.desc}</div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', flex: 1, maxWidth: '200px' }}>
                        <div style={{ height: '100%', width: `${pctF}%`, background: fac.cor, borderRadius: '4px' }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: fac.cor, fontWeight: 700 }}>{concluidasF}/{aulasF} concluídas</span>
                    </div>
                  </div>
                  {aberta ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>

                {aberta && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {fac.aulas.map((aula, idx) => {
                      const isConcluida = concluidas.includes(aula.id);
                      return (
                        <div
                          key={aula.id}
                          onClick={() => setAulaAberta(aula)}
                          style={{
                            display: 'flex', gap: '14px', alignItems: 'center', padding: '14px 20px', cursor: 'pointer',
                            borderBottom: idx < fac.aulas.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            background: isConcluida ? 'rgba(52,211,153,0.03)' : 'transparent'
                          }}
                        >
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                            background: isConcluida ? 'rgba(52,211,153,0.15)' : `${fac.cor}15`,
                            border: `1px solid ${isConcluida ? 'rgba(52,211,153,0.3)' : fac.cor + '30'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: isConcluida ? '#34d399' : fac.cor, fontWeight: 800
                          }}>
                            {isConcluida ? <CheckCircle size={16} /> : idx + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{aula.titulo}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⏱ {aula.duracao} · 📊 {aula.nivel}</div>
                          </div>
                          <ChevronRight size={16} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODULO 3: ADMIN PANEL (VIDEOS UPLOAD) ─── */}
      {activeModule === 'admin' && isAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visualizações Totais</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent)' }}>{adminStats.totalViews}</span>
            </div>
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vídeos Concluídos</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)' }}>{adminStats.completed}</span>
            </div>
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estudantes Ativos</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{adminStats.activeUsers}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Aulas em Vídeo Publicadas</h3>
            <button onClick={() => { resetForm(); setShowAddForm(!showAddForm); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Adicionar Nova Aula
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddVideo} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontWeight: 800 }}>Novo Vídeo para a Academia</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Título da Aula</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Categoria</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="form-input">
                    {['Educação Financeira', 'Investimentos', 'Empresas', 'Impostos', 'Poupar Dinheiro', 'Planeamento Financeiro', 'Dívidas', 'Orçamento', 'Academia'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Descrição / Objetivos</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="form-input" rows="3" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nível</label>
                  <select value={level} onChange={e => setLevel(e.target.value)} className="form-input">
                    <option>Iniciante</option>
                    <option>Intermédio</option>
                    <option>Avançado</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Plano Permitido</label>
                  <select value={planAllowed} onChange={e => setPlanAllowed(e.target.value)} className="form-input">
                    <option>Gratuito</option>
                    <option>Pro</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Duração (em segundos)</label>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="form-input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Ficheiro de Vídeo</label>
                  <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} className="form-input" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Capa / Miniatura (Imagem)</label>
                  <input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files[0])} className="form-input" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  {submitting ? 'A carregar...' : 'Publicar Aula'}
                </button>
              </div>
            </form>
          )}

          {/* Videos Grid with actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {videos.map(v => (
              <div key={v.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{v.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <span>📂 {v.category}</span>
                    <span>📊 {v.level}</span>
                    <span>🔑 Acesso: {v.plan_allowed}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleDeleteVideo(v.id)} className="btn btn-secondary" style={{ padding: '6px', color: 'var(--color-error)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
