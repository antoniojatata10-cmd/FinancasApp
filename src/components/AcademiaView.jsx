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
            texto: `Muitas pessoas acreditam que a riqueza depende apenas de sorte, herança ou salário elevado.\n\nMas a realidade mostra algo diferente. Existem pessoas que ganham muito e permanecem pobres; e outras que ganham pouco e tornam-se milionárias.\n\nA diferença geralmente está na **mentalidade**..`,
          },
        ],
        exercicios: [
          'Explique a diferença entre activo e passivo com exemplos da sua vida.',
          'Em qual quadrante (E, A, D, I) está actualmente? Justifique.',
        ],
        quiz: [
          { pergunta: 'O que é um activo segundo Kiyosaki?', opcoes: ['Algo que você possui', 'Algo que coloca dinheiro no seu bolso', 'O seu carro particular'], correto: 1, explicacao: 'Um activo é qualquer coisa que gera rendimento ou coloca dinheiro no bolso do proprietário.' },
        ],
        leituras: ['Pai Rico, Pai Pobre — Robert Kiyosaki'],
      }
    ]
  }
];

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
  const [activeModule, setActiveModule] = useState('videos'); // 'videos' | 'escrito' | 'admin'
  
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

      if (vError) throw vError;
      setVideos(vData || []);

      // Query watch stats for current user
      const { data: sData, error: sError } = await supabase
        .from('video_watch_stats')
        .select('*')
        .eq('user_id', currentUser.id);

      if (sError) throw sError;
      const statsObj = {};
      sData?.forEach(s => {
        statsObj[s.video_id] = s;
      });
      setWatchStats(statsObj);
    } catch (err) {
      console.error('Error fetching videos:', err);
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
