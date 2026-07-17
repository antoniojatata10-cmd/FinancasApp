import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  GraduationCap, BookOpen, ChevronRight, ChevronDown, CheckCircle,
  Lock, Star, Play, Award, BarChart2, Brain, TrendingUp, DollarSign,
  AlertTriangle, Lightbulb, Target, Clock, ArrowLeft, X, Plus, Edit2,
  Trash2, Upload, PlayCircle, Eye, RefreshCw
} from 'lucide-react';
import { supabase } from '../supabaseClient';

// â”€â”€â”€ CURSO COMPLETO (FormaÃ§Ã£o Escrita) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FACULDADES = [
  {
    id: 'F1',
    nome: 'Faculdade 1 â€” Fundamentos da EducaÃ§Ã£o Financeira',
    icon: 'ðŸ“š',
    cor: '#6366f1',
    desc: 'Base teÃ³rica essencial sobre dinheiro, mentalidade e psicologia financeira.',
    aulas: [
      {
        id: 'F1A1',
        titulo: 'O Que Ã‰ Dinheiro',
        duracao: '45 min',
        nivel: 'Iniciante',
        objetivos: [
          'Compreender o conceito de dinheiro',
          'Entender a evoluÃ§Ã£o histÃ³rica do dinheiro',
          'Conhecer as caracterÃ­sticas que tornam algo um dinheiro',
          'Compreender a diferenÃ§a entre riqueza e dinheiro',
        ],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'IntroduÃ§Ã£o',
            texto: `Imagine que amanhÃ£ todo o dinheiro desaparecesse. Sem notas. Sem moedas. Sem cartÃµes. Sem transferÃªncias.\n\nComo compraria comida? Como pagaria a internet? Como compraria combustÃ­vel?\n\nA resposta mostra a importÃ¢ncia do dinheiro na sociedade moderna.\n\n**Dinheiro Ã© qualquer coisa aceite por uma comunidade como meio de troca para aquisiÃ§Ã£o de bens e serviÃ§os.** Em termos simples: Dinheiro Ã© uma ferramenta que facilita trocas.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'CapÃ­tulo 1 â€” A HistÃ³ria do Dinheiro',
            texto: `**FASE 1 â€“ ESCAMBO**\nAntes do dinheiro, as pessoas utilizavam o escambo â€” troca directa. Exemplo: JoÃ£o troca 10 kg de milho por 2 galinhas de Pedro. Problema: E se Pedro nÃ£o quiser milho? Este problema chama-se **Dupla CoincidÃªncia de Necessidades**.\n\n**FASE 2 â€“ DINHEIRO-MERCADORIA**\nCivilizaÃ§Ãµes comeÃ§aram a usar sal, gado, conchas, chÃ¡ e tabaco como dinheiro. ðŸ’¡ Curiosidade: A palavra "salÃ¡rio" vem do latim "salarium" â€” os soldados romanos recebiam parte do pagamento em sal!\n\n**FASE 3 â€“ METAIS PRECIOSOS**\nOuro e prata tornaram-se padrÃ£o porque possuem: Escassez, Durabilidade, Divisibilidade, Transportabilidade e AceitaÃ§Ã£o universal.\n\n**FASE 4 â€“ PAPEL-MOEDA**\nTransportar grandes quantidades de ouro era perigoso. Os bancos passaram a guardar o ouro e emitir recibos que circulavam como dinheiro.\n\n**FASE 5 â€“ SISTEMA BANCÃRIO MODERNO**\nHoje a maior parte do dinheiro existe digitalmente. O seu saldo bancÃ¡rio de 100.000 Kz raramente existe fisicamente â€” Ã© apenas um registo electrÃ³nico.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'CapÃ­tulo 2 â€” As 3 FunÃ§Ãµes do Dinheiro',
            texto: `**1. Meio de Troca** â€” Serve para comprar bens e serviÃ§os: pÃ£o, combustÃ­vel, roupa.\n\n**2. Unidade de Conta** â€” Permite medir valor: PÃ£o = 500 Kz | Gasolina = 700 Kz | TelemÃ³vel = 300.000 Kz.\n\n**3. Reserva de Valor** â€” Permite guardar riqueza para uso futuro. Exemplo: guardar dinheiro hoje para comprar uma casa daqui a 5 anos.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'CapÃ­tulo 3 â€” As 5 CaracterÃ­sticas do Bom Dinheiro',
            texto: `âœ… **Escassez** â€” NÃ£o pode ser criado facilmente. O ouro Ã© escasso; areia nÃ£o Ã©.\n\nâœ… **Durabilidade** â€” Precisa resistir ao tempo. O ouro dura sÃ©culos; bananas nÃ£o.\n\nâœ… **Divisibilidade** â€” Pode ser dividido: 1.000 Kz â†’ 500 Kz â†’ 100 Kz.\n\nâœ… **Portabilidade** â€” Deve ser fÃ¡cil de transportar.\n\nâœ… **Aceitabilidade** â€” As pessoas precisam de o aceitar.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'CapÃ­tulo 4 â€” Dinheiro vs Riqueza',
            texto: `Muitas pessoas confundem os dois. NÃ£o sÃ£o a mesma coisa!\n\n**Dinheiro** = Ferramenta de troca.\n**Riqueza** = Conjunto de activos que geram valor: empresas, imÃ³veis, terrenos, acÃ§Ãµes, direitos autorais.\n\n**Exemplo:**\nPessoa A: possui 20 milhÃµes Kz na conta.\nPessoa B: possui 5 apartamentos alugados.\nQuem Ã© mais rico? Normalmente Pessoa B â€” tem activos geradores de renda.\n\n**Estudo de caso:**\nJoÃ£o ganha 500.000 Kz/mÃªs e gasta 500.000 Kz. PatrimÃ³nio: 0 Kz.\nPedro ganha 300.000 Kz e investe 100.000 Kz durante 20 anos. Quem ficarÃ¡ mais rico? **Pedro.** Porque acumula activos.`,
          },
        ],
        exercicios: [
          'Explique por que o escambo Ã© ineficiente.',
          'Liste as 5 caracterÃ­sticas de um bom dinheiro.',
          'Explique a diferenÃ§a entre dinheiro e riqueza.',
          'Uma comunidade utiliza bananas como dinheiro. Que problemas surgirÃ£o?',
          'Se um governo imprimir dinheiro excessivamente, o que pode acontecer?',
        ],
        quiz: [
          { pergunta: 'O que Ã© escambo?', opcoes: ['Troca directa de bens sem dinheiro', 'Uma moeda medieval', 'Um tipo de investimento'], correto: 0, explicacao: 'Escambo Ã© a troca directa de bens ou serviÃ§os sem utilizaÃ§Ã£o de dinheiro como intermediÃ¡rio.' },
          { pergunta: 'Qual das seguintes Ã© uma funÃ§Ã£o do dinheiro?', opcoes: ['DecoraÃ§Ã£o', 'Reserva de Valor', 'Meio de produÃ§Ã£o'], correto: 1, explicacao: 'O dinheiro serve como Meio de Troca, Unidade de Conta e Reserva de Valor.' },
          { pergunta: 'Por que o ouro foi historicamente usado como dinheiro?', opcoes: ['Porque Ã© bonito', 'Porque Ã© escasso, durÃ¡vel e divisÃ­vel', 'Porque os governos decidiram'], correto: 1, explicacao: 'O ouro reÃºne as caracterÃ­sticas essenciais do bom dinheiro: escassez, durabilidade, divisibilidade e portabilidade.' },
          { pergunta: 'Qual a diferenÃ§a entre riqueza e dinheiro?', opcoes: ['SÃ£o a mesma coisa', 'Riqueza sÃ£o activos geradores de valor; dinheiro Ã© ferramenta de troca', 'Dinheiro Ã© mais valioso'], correto: 1, explicacao: 'Riqueza Ã© o conjunto de activos que geram valor continuamente, enquanto dinheiro Ã© apenas um meio de troca.' },
        ],
        leituras: ['The Psychology of Money â€” Morgan Housel', 'Pai Rico, Pai Pobre â€” Robert Kiyosaki', 'The Bitcoin Standard â€” Saifedean Ammous'],
      },
      {
        id: 'F1A2',
        titulo: 'Mentalidade dos Ricos',
        duracao: '60 min',
        nivel: 'Iniciante',
        objetivos: [
          'Compreender as diferenÃ§as entre pessoas ricas e pobres na forma de pensar',
          'Identificar crenÃ§as limitantes sobre dinheiro',
          'Entender como os ricos utilizam o dinheiro',
          'Diferenciar rendimento activo de rendimento passivo',
          'Compreender o Quadrante do Fluxo de Caixa',
        ],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'IntroduÃ§Ã£o',
            texto: `Muitas pessoas acreditam que a riqueza depende apenas de sorte, heranÃ§a ou salÃ¡rio elevado.\n\nMas a realidade mostra algo diferente. Existem pessoas que ganham muito e permanecem pobres; e outras que ganham pouco e tornam-se milionÃ¡rias.\n\nA diferenÃ§a geralmente estÃ¡ na **mentalidade**.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'CapÃ­tulo 1 â€” O Que Ã‰ Mentalidade Financeira',
            texto: `Mentalidade financeira Ã© o conjunto de crenÃ§as, hÃ¡bitos e decisÃµes relacionadas ao dinheiro. Ela influencia como ganha, gasta e investe dinheiro.\n\n**Exemplo:** Duas pessoas recebem 500.000 Kz.\n\nPessoa A: Compra roupas, telemÃ³vel, festas â†’ ApÃ³s 1 ano: Saldo = 0\nPessoa B: Investe 30%, compra activos, estuda finanÃ§as â†’ ApÃ³s 1 ano: PatrimÃ³nio crescente\n\nMesmo rendimento. Resultados completamente diferentes.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'CapÃ­tulo 2 â€” CrenÃ§as Limitantes',
            texto: `Muitas pessoas cresceram a ouvir:\nâ€¢ "Dinheiro Ã© a raiz de todo o mal"\nâ€¢ "Rico Ã© ladrÃ£o"\nâ€¢ "Quem nasce pobre morre pobre"\nâ€¢ "Dinheiro nÃ£o traz felicidade"\nâ€¢ "Investir Ã© perigoso"\n\nEstas crenÃ§as influenciam negativamente as decisÃµes financeiras. Para criar riqueza, Ã© necessÃ¡rio identificar e eliminar estas crenÃ§as limitantes.\n\n**ExercÃ­cio de reflexÃ£o:** O que os seus pais diziam sobre dinheiro? O que acredita sobre pessoas ricas?`,
          },
          {
            tipo: 'capitulo',
            titulo: 'CapÃ­tulo 3 â€” Pobres, Classe MÃ©dia e Ricos',
            texto: `**POBRES:** Recebem â†’ Gastam tudo â†’ Precisam trabalhar novamente\nFluxo: SalÃ¡rio â†’ Despesas\n\n**CLASSE MÃ‰DIA:** Recebem â†’ Compram passivos â†’ Criam mais despesas\nFluxo: SalÃ¡rio â†’ Carro financiado â†’ Casa financiada â†’ DÃ­vidas\n\n**RICOS:** Recebem â†’ Compram activos â†’ Activos geram renda â†’ Compram mais activos\nFluxo: Dinheiro â†’ Activos â†’ Mais dinheiro`,
          },
          {
            tipo: 'capitulo',
            titulo: 'CapÃ­tulo 4 â€” Activos vs Passivos',
            texto: `**ACTIVO** = algo que coloca dinheiro no seu bolso:\nâ€¢ ImÃ³veis alugados\nâ€¢ Dividendos\nâ€¢ Empresas\nâ€¢ AcÃ§Ãµes\nâ€¢ Direitos autorais\nâ€¢ NegÃ³cios digitais\n\n**PASSIVO** = algo que retira dinheiro do seu bolso:\nâ€¢ DÃ­vidas\nâ€¢ EmprÃ©stimos\nâ€¢ Carros financiados\nâ€¢ CartÃµes de crÃ©dito\n\n**Exemplo:** Carro particular (combustÃ­vel + seguro + manutenÃ§Ã£o) = Passivo. TÃ¡xi/Uber prÃ³prio que gera renda = pode ser Activo.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'CapÃ­tulo 5 â€” O Quadrante do Fluxo de Caixa (Kiyosaki)',
            texto: `**E â€“ Empregado:** Troca tempo por dinheiro. Estabilidade mas limite de rendimento.\nExemplos: professor, mÃ©dico contratado, funcionÃ¡rio pÃºblico.\n\n**A â€“ AutÃ³nomo:** Trabalha por conta prÃ³pria. Se parar de trabalhar, deixa de ganhar.\nExemplos: mecÃ¢nico, advogado independente, freelancer.\n\n**D â€“ Dono de NegÃ³cio:** Possui sistemas e pessoas a trabalhar. Escalabilidade mas maior responsabilidade.\n\n**I â€“ Investidor:** Dinheiro trabalha para ele. Liberdade financeira quase ilimitada.\n\n**Exemplo:** JoÃ£o (empregado) recebe 500.000 Kz apenas se trabalhar. Pedro (investidor) com 10 apartamentos recebe 2.000.000 Kz mesmo dormindo. Quem tem mais liberdade? **Pedro.**`,
          },
          {
            tipo: 'capitulo',
            titulo: 'CapÃ­tulo 6 â€” O Poder dos Juros Compostos',
            texto: `Albert Einstein estÃ¡ frequentemente associado Ã  frase: *"Os juros compostos sÃ£o a oitava maravilha do mundo."*\n\n**Exemplo:** Investindo 100.000 Kz/mÃªs com rentabilidade de 10% ao ano durante 30 anos â†’ acumula dezenas de milhÃµes de Kz.\n\n**O tempo Ã© o maior aliado do investidor.** Quem comeÃ§a cedo normalmente vence, mesmo com menos capital.`,
          },
        ],
        exercicios: [
          'Explique a diferenÃ§a entre activo e passivo com exemplos da sua vida.',
          'Em qual quadrante (E, A, D, I) estÃ¡ actualmente? Justifique.',
          'Liste 5 crenÃ§as sobre dinheiro que ouviu durante a infÃ¢ncia.',
          'Identifique 3 activos que poderia adquirir nos prÃ³ximos 5 anos.',
          'Por que os ricos priorizam activos antes de luxos?',
        ],
        quiz: [
          { pergunta: 'O que Ã© um activo segundo Kiyosaki?', opcoes: ['Algo que vocÃª possui', 'Algo que coloca dinheiro no seu bolso', 'O seu carro particular'], correto: 1, explicacao: 'Um activo Ã© qualquer coisa que gera rendimento ou coloca dinheiro no bolso do proprietÃ¡rio.' },
          { pergunta: 'No Quadrante do Fluxo de Caixa, quem representa o maior nÃ­vel de liberdade financeira?', opcoes: ['E (Empregado)', 'A (AutÃ³nomo)', 'I (Investidor)'], correto: 2, explicacao: 'O Investidor tem o dinheiro a trabalhar por ele, permitindo liberdade financeira mÃ¡xima.' },
          { pergunta: 'Qual Ã© o fluxo financeiro dos ricos?', opcoes: ['SalÃ¡rio â†’ Despesas', 'Dinheiro â†’ Activos â†’ Mais dinheiro', 'SalÃ¡rio â†’ Luxos â†’ PoupanÃ§a'], correto: 1, explicacao: 'Os ricos focam-se em adquirir activos que geram renda passiva, criando um ciclo de acumulaÃ§Ã£o de riqueza.' },
          { pergunta: 'O que Ã© uma crenÃ§a limitante?', opcoes: ['Uma meta financeira', 'Uma crenÃ§a que bloqueia o crescimento financeiro', 'Um tipo de investimento'], correto: 1, explicacao: 'CrenÃ§as limitantes sÃ£o pensamentos negativos sobre dinheiro que bloqueiam o crescimento financeiro e as decisÃµes inteligentes.' },
        ],
        leituras: ['Pai Rico, Pai Pobre â€” Robert Kiyosaki', 'O Homem Mais Rico da BabilÃ´nia â€” George S. Clason', 'The Psychology of Money â€” Morgan Housel'],
      },
      {
        id: 'F1A3',
        titulo: 'Psicologia Financeira',
        duracao: '75 min',
        nivel: 'Iniciante',
        objetivos: [
          'Compreender como o cÃ©rebro toma decisÃµes financeiras',
          'Identificar emoÃ§Ãµes que afectam investimentos',
          'Reconhecer os principais vieses cognitivos',
          'Controlar impulsos financeiros e desenvolver disciplina',
        ],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'IntroduÃ§Ã£o',
            texto: `Imagine dois investidores. O primeiro conhece anÃ¡lise tÃ©cnica, anÃ¡lise fundamentalista e gestÃ£o de risco â€” mas perde dinheiro constantemente. O segundo tem menos conhecimento tÃ©cnico mas mantÃ©m disciplina e controla emoÃ§Ãµes â€” e ganha consistentemente.\n\nPor quÃª? Porque o mercado financeiro Ã©, acima de tudo, um **jogo psicolÃ³gico**. Muitos investidores nÃ£o perdem por falta de conhecimento, mas por nÃ£o controlarem as suas emoÃ§Ãµes.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Os Dois Sistemas do CÃ©rebro',
            texto: `**Sistema 1 â€“ Emocional:** RÃ¡pido, automÃ¡tico, instintivo, impulsivo. Quando vÃª "GANHE 500% EM 30 DIAS" sente entusiasmo imediato.\n\n**Sistema 2 â€“ Racional:** Lento, analÃ­tico, lÃ³gico, disciplinado. Antes de investir analisa: riscos, retorno, histÃ³rico, probabilidade.\n\n**Regra de Ouro:** Investidores ricos usam o Sistema 2. Investidores emocionais usam o Sistema 1.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Medo e GanÃ¢ncia',
            texto: `**MEDO** aparece quando o mercado cai, quando perde dinheiro, quando hÃ¡ incerteza.\nSintomas: fechar posiÃ§Ãµes cedo, nÃ£o entrar em boas oportunidades, vender no pior momento.\n\nExemplo: Compra uma acÃ§Ã£o a 100 â†’ cai para 95 â†’ vocÃª vende (medo) â†’ dias depois sobe para 130. O medo expulsou-o do mercado.\n\n**GANÃ‚NCIA** aparece quando ganha dinheiro rapidamente.\nSintomas: operar demais, assumir riscos excessivos, ignorar gestÃ£o de risco.\n\nExemplo: Ganhou 50.000 Kz â†’ quer 500.000 â†’ aumenta o lote sem critÃ©rio â†’ perde tudo.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Os Principais Vieses Cognitivos',
            texto: `**ðŸ‘ Efeito Manada:** TendÃªncia de seguir a maioria mesmo quando estÃ¡ errada. Durante a bolha imobiliÃ¡ria de 2008, todos compravam imÃ³veis porque todos compravam. Resultado: colapso global.\n\n**ðŸ” ViÃ©s de ConfirmaÃ§Ã£o:** Procurar apenas informaÃ§Ãµes que confirmam o que jÃ¡ acreditamos. SoluÃ§Ã£o: Para cada argumento favorÃ¡vel, liste 1 argumento contrÃ¡rio.\n\n**ðŸ’ª Excesso de ConfianÃ§a:** Acreditar que sabe mais do que realmente sabe. ApÃ³s 10 operaÃ§Ãµes vencedoras, o trader pensa "sou invencÃ­vel" â†’ aumenta o risco â†’ perde metade da conta. O mercado castiga a arrogÃ¢ncia.\n\n**ðŸ˜° AversÃ£o Ã  Perda:** Uma perda de 100 dÃ³lares causa mais dor do que um ganho de 100 dÃ³lares gera felicidade. ConsequÃªncia: segurar prejuÃ­zos e vender lucros cedo â€” exactamente o oposto do correcto.\n\n**ðŸ“± FOMO (Fear Of Missing Out):** Bitcoin sobe 30%, todos falam â†’ vocÃª compra no topo â†’ mercado corrige. AntÃ­doto: "Eu compraria isto se ninguÃ©m estivesse a falar disso?"\n\n**ðŸ’¢ VinganÃ§a Contra o Mercado:** Perde 50.000 Kz â†’ fica irritado â†’ abre nova operaÃ§Ã£o emocional â†’ perde novamente. Regra: apÃ³s perdas, PARE, analise, respire, retorne apenas quando estiver racional.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'O DiÃ¡rio Emocional',
            texto: `Ferramenta usada por traders profissionais. ApÃ³s cada operaÃ§Ã£o registe:\n\nâ€¢ Data:\nâ€¢ Activo:\nâ€¢ Resultado:\nâ€¢ EmoÃ§Ã£o antes da operaÃ§Ã£o:\nâ€¢ EmoÃ§Ã£o durante:\nâ€¢ EmoÃ§Ã£o depois:\nâ€¢ LiÃ§Ã£o aprendida:\n\n**Exemplo real:**\nData: 10/06 | Activo: NASDAQ | Resultado: -15.000 Kz | EmoÃ§Ã£o: Ansiedade | Erro: Entrei antes do sinal | LiÃ§Ã£o: Esperar confirmaÃ§Ã£o.\n\n**FÃ³rmula do sucesso:** Conhecimento + Psicologia + Disciplina = Resultados Consistentes`,
          },
        ],
        exercicios: [
          'Explique a diferenÃ§a entre Sistema 1 e Sistema 2 no contexto financeiro.',
          'Descreva um exemplo pessoal de FOMO em finanÃ§as.',
          'Explique o efeito manada com um exemplo real.',
          'Qual viÃ©s psicolÃ³gico mais te afecta? Justifique.',
          'Crie o seu DiÃ¡rio Emocional para as prÃ³ximas 2 semanas.',
        ],
        quiz: [
          { pergunta: 'O que Ã© FOMO no contexto financeiro?', opcoes: ['Uma estratÃ©gia de investimento', 'O medo de ficar de fora de uma oportunidade', 'Uma tÃ©cnica de anÃ¡lise tÃ©cnica'], correto: 1, explicacao: 'FOMO (Fear Of Missing Out) Ã© o medo de perder uma oportunidade, levando a decisÃµes impulsivas como comprar no topo de mercado.' },
          { pergunta: 'O que Ã© o viÃ©s de confirmaÃ§Ã£o?', opcoes: ['Confirmar uma operaÃ§Ã£o no mercado', 'Procurar apenas informaÃ§Ãµes que confirmam o que jÃ¡ acreditamos', 'Analisar ambos os lados de um investimento'], correto: 1, explicacao: 'O viÃ©s de confirmaÃ§Ã£o faz-nos ignorar informaÃ§Ãµes contrÃ¡rias Ã s nossas crenÃ§as, criando uma visÃ£o distorcida da realidade.' },
          { pergunta: 'Qual Ã© a regra apÃ³s uma perda emocional no mercado?', opcoes: ['Operar mais para recuperar o prejuÃ­zo', 'Parar, analisar, respirar e retornar apenas racional', 'Aumentar o tamanho das posiÃ§Ãµes'], correto: 1, explicacao: 'ApÃ³s perdas, a "vinganÃ§a contra o mercado" Ã© um dos erros mais destrutivos. A disciplina exige paragem e reflexÃ£o antes de continuar.' },
          { pergunta: 'Qual sistema do cÃ©rebro deve dominar as decisÃµes financeiras?', opcoes: ['Sistema 1 â€” rÃ¡pido e instintivo', 'Sistema 2 â€” racional e analÃ­tico', 'Ambos em igual proporÃ§Ã£o'], correto: 1, explicacao: 'O Sistema 2 (lento, analÃ­tico, lÃ³gico) Ã© o que leva a decisÃµes financeiras consistentes e bem fundamentadas.' },
        ],
        leituras: ['The Psychology of Money â€” Morgan Housel', 'Thinking, Fast and Slow â€” Daniel Kahneman', 'Trading in the Zone â€” Mark Douglas', 'Atomic Habits â€” James Clear'],
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
            texto: `A maioria das pessoas sabe quanto ganha. PouquÃ­ssimas sabem exactamente quanto gastam.\n\n**Fluxo de Caixa = Entradas â€“ SaÃ­das**\n\nExemplo prÃ¡tico:\nSalÃ¡rio: 500.000 Kz + Renda Extra: 100.000 Kz = **Total Entradas: 600.000 Kz**\n\nCasa: 150.000 | Transporte: 50.000 | AlimentaÃ§Ã£o: 100.000 | Internet: 20.000 | Lazer: 80.000 | Outros: 50.000 = **Total SaÃ­das: 450.000 Kz**\n\n**Fluxo de Caixa = 600.000 â€“ 450.000 = 150.000 Kz positivo**`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Os 4 Tipos de Gastos',
            texto: `**ðŸ”´ NecessÃ¡rios:** Ãgua, luz, alimentaÃ§Ã£o, habitaÃ§Ã£o. NÃ£o pode eliminar.\n\n**ðŸŸ¡ Importantes:** EducaÃ§Ã£o, saÃºde, poupanÃ§a. Deve manter.\n\n**ðŸŸ¢ SupÃ©rfluos:** Luxos, compras por impulso, assinaturas nÃ£o utilizadas. Analise criticamente.\n\n**ðŸ”µ Investimentos:** AcÃ§Ãµes, ETFs, imÃ³veis, negÃ³cios. Maximize esta categoria!\n\n**ExercÃ­cio prÃ¡tico:** Liste todos os gastos dos Ãºltimos 30 dias e classifique cada um nestas 4 categorias. Provavelmente vai surpreender-se com o que descobre.`,
          },
        ],
        exercicios: [
          'Liste todos os gastos dos Ãºltimos 30 dias e classifique cada um.',
          'Calcule o seu fluxo de caixa mensal actual.',
          'Identifique os 3 maiores "vazamentos financeiros" nos seus gastos.',
          'Crie uma planilha completa de fluxo de caixa.',
        ],
        quiz: [
          { pergunta: 'Qual Ã© a fÃ³rmula do Fluxo de Caixa?', opcoes: ['Entradas Ã— SaÃ­das', 'Entradas â€“ SaÃ­das', 'Entradas + PoupanÃ§a'], correto: 1, explicacao: 'Fluxo de Caixa = Entradas â€“ SaÃ­das. Um resultado positivo significa que estÃ¡ a viver dentro das suas possibilidades.' },
          { pergunta: 'Qual tipo de gasto deve ser maximizado?', opcoes: ['SupÃ©rfluos', 'NecessÃ¡rios', 'Investimentos'], correto: 2, explicacao: 'Os Investimentos sÃ£o o Ãºnico tipo de gasto que geram retorno futuro e constroem riqueza ao longo do tempo.' },
          { pergunta: 'O que sÃ£o "vazamentos financeiros"?', opcoes: ['DÃ­vidas bancÃ¡rias', 'Gastos desnecessÃ¡rios que drenam o seu dinheiro sem valor percebido', 'Impostos pagos ao Estado'], correto: 1, explicacao: 'Vazamentos financeiros sÃ£o gastos pequenos e invisÃ­veis (assinaturas nÃ£o usadas, cafÃ© diÃ¡rio, compras impulsivas) que somados representam montantes significativos.' },
        ],
        leituras: ['I Will Teach You to Be Rich â€” Ramit Sethi', 'The Total Money Makeover â€” Dave Ramsey'],
      },
      {
        id: 'F1A5',
        titulo: 'OrÃ§amento Profissional',
        duracao: '55 min',
        nivel: 'Iniciante',
        objetivos: ['Criar um orÃ§amento que funcione', 'Aplicar a Regra 50-30-20', 'Evitar os erros comuns de orÃ§amento'],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'O Que Ã‰ um OrÃ§amento',
            texto: `Um orÃ§amento Ã© um plano que determina **para onde o seu dinheiro irÃ¡ antes de recebÃª-lo**.\n\nSem orÃ§amento, o dinheiro simplesmente "some" no fim do mÃªs e vocÃª nÃ£o sabe para onde foi.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'A Regra 50-30-20',
            texto: `**50% â€” Necessidades:** HabitaÃ§Ã£o, alimentaÃ§Ã£o, transporte, serviÃ§os essenciais.\nExemplo com 500.000 Kz: 250.000 Kz\n\n**30% â€” Desejos:** Lazer, restaurantes, roupas, entretenimento.\nExemplo: 150.000 Kz\n\n**20% â€” Investimentos/PoupanÃ§a:** ObrigatÃ³rio. Pague-se a si prÃ³prio primeiro.\nExemplo: 100.000 Kz\n\n**MÃ©todo Militar:** 70% Custos | 20% Investimentos | 10% Reserva de emergÃªncia`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Os 4 Erros Fatais de OrÃ§amento',
            texto: `âŒ **Gastar antes de planejar** â€” O dinheiro desaparece antes de chegar ao fim do mÃªs.\nâŒ **NÃ£o investir nada** â€” Trabalha-se para sobreviver, nÃ£o para prosperar.\nâŒ **NÃ£o registar despesas** â€” ImpossÃ­vel controlar o que nÃ£o se mede.\nâŒ **Comprar por emoÃ§Ã£o** â€” As compras por impulso destroem qualquer orÃ§amento.`,
          },
        ],
        exercicios: [
          'Crie o seu orÃ§amento mensal usando a Regra 50-30-20.',
          'Identifique onde a sua distribuiÃ§Ã£o actual se desvia da regra ideal.',
          'Crie um plano de orÃ§amento para os prÃ³ximos 12 meses.',
        ],
        quiz: [
          { pergunta: 'Na Regra 50-30-20, qual percentagem Ã© destinada a investimentos?', opcoes: ['50%', '30%', '20%'], correto: 2, explicacao: '20% do rendimento deve ser destinado a poupanÃ§a e investimentos. Este Ã© o "salÃ¡rio que paga a si prÃ³prio".' },
          { pergunta: 'O que significa "pagar-se a si prÃ³prio primeiro"?', opcoes: ['Gastar no lazer antes das contas', 'Transferir a poupanÃ§a antes de qualquer gasto', 'Pagar as dÃ­vidas primeiro'], correto: 1, explicacao: 'Transferir a poupanÃ§a/investimento logo ao receber o salÃ¡rio garante que este dinheiro nÃ£o seja gasto por impulso.' },
        ],
        leituras: ['The Automatic Millionaire â€” David Bach', 'I Will Teach You to Be Rich â€” Ramit Sethi'],
      },
      {
        id: 'F1A6',
        titulo: 'Juros Simples',
        duracao: '40 min',
        nivel: 'IntermediÃ¡rio',
        objetivos: ['Compreender o conceito de juros', 'Aplicar a fÃ³rmula dos juros simples', 'Resolver problemas prÃ¡ticos'],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'O Que SÃ£o Juros',
            texto: `Juros sÃ£o o **preÃ§o do dinheiro no tempo**. Quando empresta dinheiro, cobra juros. Quando pede emprestado, paga juros.\n\n**FÃ³rmula dos Juros Simples:**\n\n**J = C Ã— i Ã— t**\n\nOnde: J = Juros | C = Capital | i = Taxa | t = Tempo`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Exemplos Resolvidos',
            texto: `**Exemplo 1:**\nCapital: 100.000 Kz | Taxa: 10% ao ano | Prazo: 2 anos\nJ = 100.000 Ã— 0,10 Ã— 2 = **20.000 Kz**\nMontante Final = 100.000 + 20.000 = **120.000 Kz**\n\n**Exemplo 2:**\nCapital: 200.000 Kz | Taxa: 5% ao ano | Prazo: 3 anos\nJ = 200.000 Ã— 0,05 Ã— 3 = **30.000 Kz**\nMontante Final = **230.000 Kz**\n\n**AplicaÃ§Ãµes prÃ¡ticas:** EmprÃ©stimos pessoais, financiamentos bÃ¡sicos, operaÃ§Ãµes comerciais de curto prazo.`,
          },
        ],
        exercicios: [
          'Calcule os juros simples: C=500.000, i=8%, t=2 anos.',
          'Um banco cobra 15% ao ano em juros simples. Num emprÃ©stimo de 1.000.000 Kz por 18 meses, qual o total a pagar?',
          'Calcule 10 problemas de juros simples com diferentes cenÃ¡rios.',
        ],
        quiz: [
          { pergunta: 'Na fÃ³rmula J = C Ã— i Ã— t, o que representa "i"?', opcoes: ['Investimento', 'Taxa de juro', 'Tempo'], correto: 1, explicacao: '"i" representa a taxa de juro aplicada sobre o capital.' },
          { pergunta: 'Capital de 100.000 Kz a 10% ao ano por 1 ano em juros simples resulta em:', opcoes: ['10.000 Kz de juros', '100.000 Kz de juros', '110.000 Kz de juros'], correto: 0, explicacao: 'J = 100.000 Ã— 0,10 Ã— 1 = 10.000 Kz de juros. O montante final Ã© 110.000 Kz.' },
        ],
        leituras: ['MatemÃ¡tica Financeira â€” Ion Ionescu', 'FinanÃ§as Pessoais para Dummies'],
      },
      {
        id: 'F1A7',
        titulo: 'Juros Compostos â€” A 8Âª Maravilha do Mundo',
        duracao: '60 min',
        nivel: 'IntermediÃ¡rio',
        objetivos: ['Compreender os juros compostos', 'Aplicar a fÃ³rmula M = C(1+i)^n', 'Simular cenÃ¡rios de longo prazo', 'Compreender o poder do tempo nos investimentos'],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'Juros sobre Juros',
            texto: `Nos juros compostos, os **juros de cada perÃ­odo sÃ£o adicionados ao capital** e passam a gerar mais juros no perÃ­odo seguinte. Ã‰ o "efeito bola de neve".\n\n**FÃ³rmula:** M = C(1+i)^n\nOnde: M = Montante Final | C = Capital Inicial | i = Taxa por perÃ­odo | n = NÃºmero de perÃ­odos`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Exemplos Comparativos',
            texto: `**Capital:** 100.000 Kz | **Taxa:** 10%/ano | **Prazo:** 3 anos\n\nJuros Simples:\nAno 1: 110.000 | Ano 2: 120.000 | Ano 3: 130.000 Kz\n\nJuros Compostos:\nAno 1: 110.000 | Ano 2: 121.000 | Ano 3: 133.100 Kz\n\nDiferenÃ§a: 3.100 Kz â€” e esta diferenÃ§a cresce exponencialmente com o tempo!\n\n**Longo prazo:** 100.000 Kz a 10% durante 30 anos = **â‰ˆ 1.744.940 Kz**\n\n**A Regra dos Investidores: Tempo > Capital**\nQuem comeÃ§a 10 anos antes, mesmo com menos capital, normalmente acaba com mais.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'A Regra dos 72',
            texto: `A Regra dos 72 diz quanto tempo leva para dobrar o capital:\n\n**Anos para dobrar = 72 Ã· Taxa de juros**\n\nExemplos:\nâ€¢ Taxa 10%: 72 Ã· 10 = 7,2 anos para dobrar\nâ€¢ Taxa 14,5% (BTs Angola): 72 Ã· 14,5 = â‰ˆ 5 anos para dobrar\nâ€¢ Taxa 17% (OTs Angola): 72 Ã· 17 = â‰ˆ 4,2 anos para dobrar\n\nIsso significa que investindo em OTs angolanas, o seu capital dobra a cada â‰ˆ 4 anos!`,
          },
        ],
        exercicios: [
          'Calcule M = C(1+i)^n para: C=500.000, i=17%, n=5 anos.',
          'Compare juros simples vs compostos para o mesmo cenÃ¡rio durante 20 anos.',
          'Use a Regra dos 72 para calcular quando o seu capital dobra com as taxas actuais da BODIVA.',
          'Simule investir 50.000 Kz/mÃªs por 10, 20 e 30 anos com taxa de 17%.',
        ],
        quiz: [
          { pergunta: 'Qual Ã© a diferenÃ§a fundamental entre juros simples e compostos?', opcoes: ['O tempo de aplicaÃ§Ã£o', 'Nos compostos, os juros se somam ao capital e geram mais juros', 'A taxa de juro aplicada'], correto: 1, explicacao: 'Nos juros compostos, o rendimento de cada perÃ­odo Ã© reinvestido, criando o efeito exponencial que multiplica o capital ao longo do tempo.' },
          { pergunta: 'Pela Regra dos 72, com taxa de 12% ao ano, quanto tempo leva para dobrar o capital?', opcoes: ['6 anos', '8 anos', 'Exactamente 12 anos'], correto: 0, explicacao: '72 Ã· 12 = 6 anos. Num prazo de 6 anos com taxa de 12% compostos, o capital dobra.' },
          { pergunta: 'O que Ã© mais importante nos juros compostos?', opcoes: ['A taxa de juro', 'O capital inicial', 'O tempo de investimento'], correto: 2, explicacao: 'O tempo Ã© o factor mais poderoso nos juros compostos. Quem comeÃ§a cedo, mesmo com menos capital, normalmente termina com mais.' },
        ],
        leituras: ['The Compound Effect â€” Darren Hardy', 'Pai Rico, Pai Pobre â€” Robert Kiyosaki'],
      },
      {
        id: 'F1A8',
        titulo: 'Valor Presente e Valor Futuro',
        duracao: '55 min',
        nivel: 'IntermediÃ¡rio',
        objetivos: ['Compreender o valor do dinheiro no tempo', 'Calcular Valor Futuro (VF)', 'Calcular Valor Presente (VP)', 'Aplicar conceitos em decisÃµes reais'],
        conteudo: [
          {
            tipo: 'intro',
            titulo: 'O Dinheiro Muda de Valor no Tempo',
            texto: `**100.000 Kz hoje NÃƒO tÃªm o mesmo valor que 100.000 Kz daqui a 10 anos.**\n\nPorquÃª? Porque 100.000 Kz hoje podem ser investidos e crescer. A inflaÃ§Ã£o tambÃ©m reduz o poder de compra.\n\nPor isso, precisamos de ferramentas para comparar dinheiro em diferentes momentos do tempo.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Valor Futuro (VF)',
            texto: `Quanto valerÃ¡ o seu dinheiro no futuro?\n\n**FÃ³rmula:** VF = VP Ã— (1+i)^n\n\nExemplo:\nVP = 100.000 Kz | Taxa = 10%/ano | Prazo = 5 anos\nVF = 100.000 Ã— (1,10)^5 = **161.051 Kz**\n\nInvestindo 100.000 Kz hoje a 10%, terÃ¡ 161.051 Kz daqui a 5 anos.`,
          },
          {
            tipo: 'capitulo',
            titulo: 'Valor Presente (VP)',
            texto: `Quanto vale hoje um valor que receberÃ¡ no futuro?\n\n**FÃ³rmula:** VP = VF Ã· (1+i)^n\n\nExemplo:\nVF = 200.000 Kz (a receber daqui a 5 anos) | Taxa = 10%\nVP = 200.000 Ã· (1,10)^5 = **124.184 Kz**\n\nIsso significa que 200.000 Kz daqui a 5 anos equivalem apenas a 124.184 Kz hoje!\n\n**DecisÃ£o prÃ¡tica:** OpÃ§Ã£o A: Receber 1 milhÃ£o hoje. OpÃ§Ã£o B: Receber 1 milhÃ£o daqui a 10 anos. Qual Ã© melhor? **OpÃ§Ã£o A!** â€” porque pode investir o dinheiro hoje.`,
          },
        ],
        exercicios: [
          'Calcule o VF de 500.000 Kz a 17% por 10 anos.',
          'Calcule o VP de 2.000.000 Kz a receber em 15 anos com taxa de 10%.',
          'Compare: receber 500.000 Kz hoje vs 800.000 Kz daqui a 3 anos (taxa 15%). O que Ã© mais vantajoso?',
        ],
        quiz: [
          { pergunta: 'Qual Ã© a fÃ³rmula do Valor Futuro?', opcoes: ['VF = VP Ã· (1+i)^n', 'VF = VP Ã— (1+i)^n', 'VF = VP Ã— i Ã— n'], correto: 1, explicacao: 'VF = VP Ã— (1+i)^n â€” aplica-se a taxa composta durante n perÃ­odos sobre o capital presente.' },
          { pergunta: '100.000 Kz hoje sÃ£o mais valiosos do que 100.000 Kz daqui a 10 anos?', opcoes: ['Falso â€” o valor Ã© igual', 'Verdadeiro â€” o dinheiro de hoje pode ser investido', 'Depende da inflaÃ§Ã£o apenas'], correto: 1, explicacao: 'Verdadeiro. 100.000 Kz hoje podem ser investidos e crescer. AlÃ©m disso, a inflaÃ§Ã£o corrÃ³i o poder de compra do dinheiro futuro.' },
        ],
        leituras: ['FinanÃ§as para Empreendedores', 'Corporate Finance â€” Brealey, Myers & Allen'],
      },
    ],
  },
  {
    id: 'F2',
    nome: 'Faculdade 2 â€” GestÃ£o Financeira AvanÃ§ada',
    icon: 'ðŸ“Š',
    cor: '#34d399',
    desc: 'EstratÃ©gias avanÃ§adas de gestÃ£o, planeamento e construÃ§Ã£o de patrimÃ´nio.',
    bloqueada: false,
    aulas: [
      { id: 'F2A1', titulo: 'Taxas Equivalentes e Taxa Real', duracao: '45 min', nivel: 'AvanÃ§ado', objetivos: ['Converter taxas entre diferentes perÃ­odos', 'Calcular taxa real de retorno descontando inflaÃ§Ã£o'], conteudo: [{ tipo: 'intro', titulo: 'Taxas Equivalentes', texto: `Uma taxa mensal de 1% Ã© equivalente a quanto ao ano? NÃƒO Ã© simplesmente 12%!\n\nTaxa Anual Equivalente = (1 + taxa mensal)^12 - 1\n= (1,01)^12 - 1 = 12,68%\n\n**Taxa Real de Retorno:**\nTaxa Real â‰ˆ Taxa Nominal â€“ InflaÃ§Ã£o\nSe um investimento rende 17% ao ano mas a inflaÃ§Ã£o Ã© 7%, o retorno real Ã© â‰ˆ 10%.\n\nIsto Ã© crucial para avaliar se um investimento estÃ¡ realmente a gerar riqueza ou apenas a preservar o poder de compra.` }], exercicios: ['Converta: 2% ao mÃªs para taxa anual efectiva.', 'Um investimento rende 14,5%. Com inflaÃ§Ã£o de 6%, qual Ã© o retorno real?'], quiz: [{ pergunta: 'Como calcular a taxa anual equivalente a 1% ao mÃªs?', opcoes: ['1% Ã— 12 = 12%', '(1,01)^12 - 1 â‰ˆ 12,68%', '1% Ã— 365'], correto: 1, explicacao: 'A conversÃ£o de taxas usa a fÃ³rmula da capitalizaÃ§Ã£o composta: (1 + taxa)^n - 1.' }], leituras: ['MatemÃ¡tica Financeira â€” Gilberto Assaf Neto'] },
      { id: 'F2A2', titulo: 'InflaÃ§Ã£o e Poder de Compra', duracao: '50 min', nivel: 'AvanÃ§ado', objetivos: ['Compreender a inflaÃ§Ã£o angolana', 'Proteger o poder de compra'], conteudo: [{ tipo: 'intro', titulo: 'O Que Ã‰ InflaÃ§Ã£o', texto: `InflaÃ§Ã£o Ã© o aumento geral dos preÃ§os ao longo do tempo. Em Angola, medida pelo Ãndice de PreÃ§os ao Consumidor (IPC) pelo INE.\n\nSe a inflaÃ§Ã£o Ã© 10% ao ano, 100.000 Kz compram hoje o que 90.909 Kz comprariam no ano passado.\n\n**Como proteger o poder de compra:**\nâ€¢ Invista em activos reais (imÃ³veis, ouro)\nâ€¢ Use instrumentos indexados Ã  inflaÃ§Ã£o\nâ€¢ Invista em divisas fortes (USD, EUR)\nâ€¢ Diversifique geograficamente` }], exercicios: ['Se a inflaÃ§Ã£o Ã© 8% e o salÃ¡rio nÃ£o aumenta, quanto poder de compra perde em 5 anos?'], quiz: [{ pergunta: 'Como a inflaÃ§Ã£o afecta o dinheiro guardado "debaixo do colchÃ£o"?', opcoes: ['NÃ£o afecta', 'Aumenta o valor', 'DestrÃ³i o poder de compra gradualmente'], correto: 2, explicacao: 'Dinheiro parado perde poder de compra em proporÃ§Ã£o Ã  inflaÃ§Ã£o. Num ambiente de 10% de inflaÃ§Ã£o, perde 10% do poder de compra por ano.' }], leituras: ['A Riqueza das NaÃ§Ãµes â€” Adam Smith'] },
    ],
  },
  {
    id: 'F3',
    nome: 'Faculdade 3 â€” Mercado de Capitais e BODIVA',
    icon: 'ðŸ“ˆ',
    cor: '#f59e0b',
    desc: 'FormaÃ§Ã£o especÃ­fica sobre o mercado angolano, BODIVA, BNA e instrumentos financeiros locais.',
    bloqueada: false,
    aulas: [
      { id: 'F3A1', titulo: 'Estrutura do Mercado Financeiro Angolano', duracao: '60 min', nivel: 'AvanÃ§ado', objetivos: ['Conhecer os reguladores angolanos', 'Entender BNA, BODIVA, ARSEG e CMC'], conteudo: [{ tipo: 'intro', titulo: 'O Sistema Financeiro Angolano', texto: `**BNA (Banco Nacional de Angola):** Banco central. Regula a polÃ­tica monetÃ¡ria, define a taxa de referÃªncia (BNA Rate), emite moeda e supervisiona o sistema bancÃ¡rio.\n\n**BODIVA (Bolsa de DÃ­vida e Valores de Angola):** Bolsa de valores angolana. NegociaÃ§Ã£o de Bilhetes do Tesouro (BTs), ObrigaÃ§Ãµes do Tesouro (OTs) e acÃ§Ãµes cotadas.\n\n**CMC (ComissÃ£o do Mercado de Capitais):** Supervisiona o mercado de capitais, protege investidores e regula emissores de valores mobiliÃ¡rios.\n\n**ARSEG (AgÃªncia Reguladora de Seguros):** Supervisiona o sector segurador angolano.\n\n**Como investir:** Necessita de abrir conta num banco autorizado pela BODIVA e solicitar acesso ao mercado secundÃ¡rio.` }], exercicios: ['Pesquise as actuais taxas de BTs em leilÃ£o no BNA.', 'Liste 5 empresas cotadas na BODIVA e os seus sectores.'], quiz: [{ pergunta: 'Qual instituiÃ§Ã£o regula o mercado de capitais em Angola?', opcoes: ['BNA', 'CMC (ComissÃ£o do Mercado de Capitais)', 'BODIVA'], correto: 1, explicacao: 'A CMC Ã© o regulador do mercado de capitais angolano, supervisionando emissores, intermediÃ¡rios e protegendo investidores.' }], leituras: ['Website oficial da BODIVA â€” bodiva.ao', 'Website do BNA â€” bna.ao'] },
    ],
  },
  {
    id: 'F4',
    nome: 'Faculdade 4 â€” AnÃ¡lise de Investimentos',
    icon: 'ðŸ”¬',
    cor: '#ec4899',
    desc: 'AnÃ¡lise tÃ©cnica, anÃ¡lise fundamentalista e gestÃ£o de risco profissional.',
    bloqueada: false,
    aulas: [
      { id: 'F4A1', titulo: 'AnÃ¡lise Fundamentalista', duracao: '75 min', nivel: 'AvanÃ§ado', objetivos: ['Avaliar o valor intrÃ­nseco de empresas e tÃ­tulos', 'Analisar balanÃ§os e demonstraÃ§Ãµes financeiras'], conteudo: [{ tipo: 'intro', titulo: 'O Que Ã‰ AnÃ¡lise Fundamentalista', texto: `AnÃ¡lise fundamentalista avalia o valor real (intrÃ­nseco) de um activo com base nos fundamentos econÃ³micos, financeiros e do sector.\n\n**Para acÃ§Ãµes:** Analisar receita, lucro, dÃ­vida, crescimento, gestÃ£o e perspectivas de mercado.\n\n**Para BTs/OTs:** Analisar a situaÃ§Ã£o fiscal do Estado, rating soberano, taxa LUIBOR e spread de crÃ©dito.\n\n**Indicadores principais:**\nâ€¢ P/E (Price-to-Earnings): preÃ§o da acÃ§Ã£o Ã· lucro por acÃ§Ã£o\nâ€¢ ROE (Return on Equity): lucro Ã· capital prÃ³prio Ã— 100\nâ€¢ DÃ­vida/PatrimÃ´nio: indica alavancagem\nâ€¢ Dividend Yield: dividendo anual Ã· preÃ§o da acÃ§Ã£o Ã— 100` }], exercicios: ['Pesquise o P/E ratio de 3 empresas cotadas na BODIVA.', 'Analise o balanÃ§o simplificado de uma empresa angolana conhecida.'], quiz: [{ pergunta: 'O que indica um P/E ratio baixo?', opcoes: ['A empresa estÃ¡ cara', 'A empresa pode estar subvalorizada ou ter perspectivas fracas', 'A empresa nÃ£o paga dividendos'], correto: 1, explicacao: 'Um P/E baixo pode indicar que a acÃ§Ã£o estÃ¡ subvalorizada (oportunidade) ou que o mercado antecipa problemas futuros (risco). Ã‰ necessÃ¡rio analisar o contexto completo.' }], leituras: ['The Intelligent Investor â€” Benjamin Graham', 'Security Analysis â€” Graham & Dodd'] },
    ],
  },
];

// â”€â”€â”€ Componente Aula Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{aula.nivel} Â· {aula.duracao}</div>
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
              {s === 'conteudo' ? 'ðŸ“– ConteÃºdo' : s === 'exercicios' ? 'âœï¸ ExercÃ­cios' : 'ðŸ§ª Quiz'}
            </button>
          ))}
          {concluida && <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', fontSize: '0.78rem', fontWeight: 700 }}><CheckCircle size={14} /> ConcluÃ­da</div>}
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
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{quizScore >= Math.ceil(aula.quiz.length * 0.75) ? 'ðŸŽ‰' : 'ðŸ“–'}</div>
            <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px' }}>{quizScore}/{aula.quiz.length} corretas</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{quizScore >= Math.ceil(aula.quiz.length * 0.75) ? 'Excelente! Aula concluÃ­da.' : 'Reveja o conteÃºdo e tente novamente.'}</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button onClick={onClose} className="btn btn-secondary">Fechar</button>
          {step === 'conteudo' && <button onClick={() => setStep('exercicios')} className="btn btn-primary">ExercÃ­cios</button>}
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
  const [category, setCategory] = useState('EducaÃ§Ã£o Financeira');
  const [level, setLevel] = useState('Iniciante');
  const [sortOrder, setSortOrder] = useState('0');
  const [duration, setDuration] = useState('0');
  const [planAllowed, setPlanAllowed] = useState('Gratuito');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Written Lessons Admin state
  const [showWrittenForm, setShowWrittenForm] = useState(false);
  const [writtenTitle, setWrittenTitle] = useState('');
  const [writtenDescription, setWrittenDescription] = useState('');
  const [writtenContent, setWrittenContent] = useState('');
  const [writtenCategory, setWrittenCategory] = useState('Educação Financeira');
  const [writtenLevel, setWrittenLevel] = useState('Iniciante');
  const [writtenPlanAllowed, setWrittenPlanAllowed] = useState('Gratuito');
  const [writtenImageFile, setWrittenImageFile] = useState(null);
  const [writtenLessons, setWrittenLessons] = useState([]);



  const videoPlayerRef = useRef(null);
  const isAdmin = currentUser?.Role === 'admin' || currentUser?.Role === 'superadmin';
  const isProUser = currentUser?.Plano === 'Pro' || isAdmin;

  useEffect(() => {
    fetchWrittenConcluidas();
    fetchVideos();
    fetchWrittenLessons();
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


  // Fetch written lessons from database
  const fetchWrittenLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('written_lessons')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erro ao carregar aulas escritas:', error.message);
        setWrittenLessons([]);
        return;
      }

      setWrittenLessons(data || []);

    } catch (err) {
      console.error('Erro fetchWrittenLessons:', err);
      setWrittenLessons([]);
    }
  };


  // Fetch videos from database
  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      // Query videos table
      const { data: vData, error: vError } = await supabase
        .from('videos')
        .select('*')
        .order('order_index', { ascending: true });

      // If error (e.g. table not created yet), just show empty list
      if (vError) {
        console.warn('Tabela videos nÃ£o encontrada ou erro:', vError.message);
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
      alert('Preencha o tÃ­tulo e carregue o ficheiro de vÃ­deo.');
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
          order_index: parseInt(sortOrder) || 0,
          duration_seconds: parseInt(duration) || 0,
          plan_allowed: planAllowed,
          youtube_url: videoUrl,
          thumbnail_url: thumbnailUrl
        }]);

      if (dbErr) throw dbErr;

      alert('VÃ­deo adicionado com sucesso!');
      setShowAddForm(false);
      resetForm();
      fetchVideos();
      fetchWrittenLessons();
    } catch (err) {
      console.error('Error adding video:', err);
      alert('Erro ao carregar vÃ­deo: ' + err.message);
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
      alert('VÃ­deo removido!');
      fetchVideos();
      fetchWrittenLessons();
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('EducaÃ§Ã£o Financeira');
    setLevel('Iniciante');
    setSortOrder('0');
    setDuration('0');
    setPlanAllowed('Gratuito');
    setVideoFile(null);
    setThumbnailFile(null);
  };


  // Admin: Create written lesson
  const handleAddWrittenLesson = async (e) => {
    e.preventDefault();

    if (!writtenTitle || !writtenContent) {
      alert('Preencha o título e o conteúdo da aula.');
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = '';

      if (writtenImageFile) {
        const ext = writtenImageFile.name.split('.').pop();
        const fileName = Math.random().toString(36).substring(2, 15) + '_' + Date.now() + '.' + ext;

        const { error: uploadError } = await supabase.storage
          .from('lesson-images')
          .upload(fileName, writtenImageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('lesson-images')
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from('written_lessons')
        .insert([{
          title: writtenTitle,
          description: writtenDescription,
          content: writtenContent,
          image_url: imageUrl,
          category: writtenCategory,
          level: writtenLevel,
          plan_allowed: writtenPlanAllowed,
          created_by: currentUser.id
        }]);

      if (error) throw error;

      alert('Aula escrita criada com sucesso!');

      setShowWrittenForm(false);
      fetchWrittenLessons();

    } catch (err) {
      console.error('Erro ao criar aula escrita:', err);
      alert(err.message);

    } finally {
      setSubmitting(false);
    }
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
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Evolua a sua literacia financeira com aulas escritas e vÃ­deos interativos</p>
          </div>
        </div>

        {/* Sub-tabs menu */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button onClick={() => setActiveModule('videos')} style={{ background: activeModule === 'videos' ? 'var(--color-accent)' : 'none', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#fff', fontSize: '0.82rem', fontWeight: 600 }}>ðŸŽ¥ Aulas em VÃ­deo</button>
          <button onClick={() => setActiveModule('escrito')} style={{ background: activeModule === 'escrito' ? 'var(--color-accent)' : 'none', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#fff', fontSize: '0.82rem', fontWeight: 600 }}>ðŸ“– FormaÃ§Ã£o Escrita</button>
          {isAdmin && (
            <button onClick={() => setActiveModule('admin')} style={{ background: activeModule === 'admin' ? 'rgba(245,158,11,0.2)' : 'none', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#f59e0b', fontSize: '0.82rem', fontWeight: 600 }}>âš™ï¸ Painel Admin</button>
          )}
        </div>
      </div>

      {/* â”€â”€â”€ MODULO 1: VÃDEOS â”€â”€â”€ */}
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
                  src={selectedVideo.youtube_url}
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
                  <span>ðŸ·ï¸ Categoria: {selectedVideo.category}</span>
                  <span>ðŸ“Š NÃ­vel: {selectedVideo.level}</span>
                  <span>â± DuraÃ§Ã£o: {Math.round(selectedVideo.duration / 60)} min</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Category filters */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['all', 'EducaÃ§Ã£o Financeira', 'Investimentos', 'Empresas', 'Impostos', 'Poupar Dinheiro', 'Planeamento Financeiro', 'DÃ­vidas', 'OrÃ§amento', 'Academia'].map(cat => (
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
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Sem vÃ­deos disponÃ­veis nesta categoria.</div>
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
                            alert('Esta aula em vÃ­deo Ã© exclusiva para utilizadores Pro.');
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
                            {isCompleted && <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '8px', background: 'rgba(52,211,153,0.1)', color: '#34d399', fontWeight: 700 }}>ConcluÃ­do</span>}
                          </div>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</h4>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <span>â± DuraÃ§Ã£o: {Math.round(v.duration / 60)} min</span>
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

      {/* ─────── MÓDULO 2: FORMAÇÃO ESCRITA ─────── */}
      {activeModule === 'escrito' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {Object.entries(
            writtenLessons.reduce((acc, aula) => {
              if (!acc[aula.category]) acc[aula.category] = [];
              acc[aula.category].push(aula);
              return acc;
            }, {})
          ).map(([categoria, aulas]) => {

            const aberta = faculdadeAberta === categoria;

            return (
              <div
                key={categoria}
                className="glass-panel"
                style={{ padding: 0, overflow: 'hidden' }}
              >

                <button
                  onClick={() =>
                    setFaculdadeAberta(aberta ? null : categoria)
                  }
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >

                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '1rem'
                      }}
                    >
                      {categoria}
                    </div>

                    <div
                      style={{
                        fontSize: '.75rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {aulas.length} aula(s)
                    </div>
                  </div>

                  {aberta ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}

                </button>

                {aberta && (

                  <div>

                    {aulas.map((aula, index) => {

                      const concluida =
                        concluidas.includes(aula.id);

                      return (

                        <div
                          key={aula.id}
                          onClick={() => setAulaAberta(aula)}
                          style={{
                            padding: '14px 20px',
                            display: 'flex',
                            gap: '12px',
                            cursor: 'pointer',
                            borderTop:
                              '1px solid rgba(255,255,255,.05)'
                          }}
                        >

                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              background: concluida
                                ? '#22c55e'
                                : '#334155',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              color: '#fff',
                              fontWeight: 700
                            }}
                          >
                            {concluida
                              ? <CheckCircle size={16} />
                              : index + 1}
                          </div>

                          <div style={{ flex: 1 }}>

                            <div
                              style={{
                                fontWeight: 700
                              }}
                            >
                              {aula.title}
                            </div>

                            <div
                              style={{
                                fontSize: '.75rem',
                                color: 'var(--text-muted)',
                                marginTop: 4
                              }}
                            >
                              {aula.level} • {aula.plan_allowed}
                            </div>

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

          {writtenLessons.length === 0 && (
            <div
              className="glass-panel"
              style={{
                padding: 30,
                textAlign: 'center'
              }}
            >
              Ainda não existem aulas escritas publicadas.
            </div>
          )}

        </div>
      )}

      {/* â”€â”€â”€ MODULO 3: ADMIN PANEL (VIDEOS UPLOAD) â”€â”€â”€ */}
      {activeModule === 'admin' && isAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>VisualizaÃ§Ãµes Totais</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent)' }}>{adminStats.totalViews}</span>
            </div>
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>VÃ­deos ConcluÃ­dos</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)' }}>{adminStats.completed}</span>
            </div>
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estudantes Ativos</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{adminStats.activeUsers}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Aulas em VÃ­deo Publicadas</h3>
            <button onClick={() => { resetForm(); setShowAddForm(!showAddForm); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Adicionar Nova Aula
            </button>
            <button onClick={() => setShowWrittenForm(!showWrittenForm)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Adicionar Aula Escrita

            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddVideo} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontWeight: 800 }}>Novo VÃ­deo para a Academia</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">TÃ­tulo da Aula</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Categoria</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="form-input">
                    {['EducaÃ§Ã£o Financeira', 'Investimentos', 'Empresas', 'Impostos', 'Poupar Dinheiro', 'Planeamento Financeiro', 'DÃ­vidas', 'OrÃ§amento', 'Academia'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">DescriÃ§Ã£o / Objetivos</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="form-input" rows="3" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">NÃ­vel</label>
                  <select value={level} onChange={e => setLevel(e.target.value)} className="form-input">
                    <option>Iniciante</option>
                    <option>IntermÃ©dio</option>
                    <option>AvanÃ§ado</option>
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
                  <label className="form-label">DuraÃ§Ã£o (em segundos)</label>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="form-input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Ficheiro de VÃ­deo</label>
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
          {showWrittenForm && (
            <form onSubmit={handleAddWrittenLesson} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontWeight: 800 }}>Nova Aula Escrita</h4>

              <div className="form-group">
                <label className="form-label">Título</label>
                <input
                  type="text"
                  value={writtenTitle}
                  onChange={e => setWrittenTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                  value={writtenDescription}
                  onChange={e => setWrittenDescription(e.target.value)}
                  className="form-input"
                  rows="3"
                />
              </div>


              <div className="form-group">
                <label className="form-label">Conteúdo da Aula</label>
                <textarea
                  value={writtenContent}
                  onChange={e => setWrittenContent(e.target.value)}
                  className="form-input"
                  rows="10"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>

                <select
                  value={writtenCategory}
                  onChange={e => setWrittenCategory(e.target.value)}
                  className="form-input"
                >
                  <option>Educação Financeira</option>
                  <option>Investimentos</option>
                  <option>Empresas</option>
                  <option>Impostos</option>
                </select>

                <select
                  value={writtenLevel}
                  onChange={e => setWrittenLevel(e.target.value)}
                  className="form-input"
                >
                  <option>Iniciante</option>
                  <option>Intermédio</option>
                  <option>Avançado</option>
                </select>

                <select
                  value={writtenPlanAllowed}
                  onChange={e => setWrittenPlanAllowed(e.target.value)}
                  className="form-input"
                >
                  <option>Gratuito</option>
                  <option>Pro</option>
                </select>

              </div>


              <div className="form-group">
                <label className="form-label">Imagem da Aula</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setWrittenImageFile(e.target.files[0])}
                  className="form-input"
                />
              </div>


              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowWrittenForm(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'A publicar...' : 'Publicar Aula Escrita'}
                </button>
              </div>

            </form>
          )}


/* Videos Grid with actions */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {videos.map(v => (
              <div key={v.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{v.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <span>ðŸ“‚ {v.category}</span>
                    <span>ðŸ“Š {v.level}</span>
                    <span>ðŸ”‘ Acesso: {v.plan_allowed}</span>
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










