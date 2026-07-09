import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare, Send, Image, FileText, Check, CheckCheck,
  Archive, CheckCircle2, User, Search, Loader2, ArrowLeft,
  Circle, X, Paperclip
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

// ─── LOCAL (OFFLINE) CHAT ENGINE ─────────────────────────────────────────────
const LOCAL_KEY = 'financas_chat_local_v2';

function loadLocalMessages() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; } catch { return []; }
}

function saveLocalMessages(msgs) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(msgs));
}

export default function ChatView({ currentUser }) {
  console.log("CURRENT USER NO CHAT:", currentUser);
  const isAdmin = (currentUser?.role === 'admin' || currentUser?.role === 'Admin' || currentUser?.role === 'superadmin' || currentUser?.role === 'SuperAdmin' || currentUser?.Role === 'admin' || currentUser?.Role === 'Admin' || currentUser?.Role === 'superadmin' || currentUser?.Role === 'SuperAdmin');

  const [supabaseAvailable, setSupabaseAvailable] = useState(false);
  const [checking, setChecking] = useState(true);

  // Local/Offline state
  const [localMessages, setLocalMessages] = useState(loadLocalMessages);
  const [inputText, setInputText] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Supabase state
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('active');

  const messagesEndRef = useRef(null);

  // Check if Supabase chat tables exist
  useEffect(() => {
    const checkSupabase = async () => {
      if (!isSupabaseConfigured()) {
        setChecking(false);
        setSupabaseAvailable(false);
        return;
      }
      try {
        const { error } = await supabase
          .from('chat_messages')
          .select('id')
          .limit(1);

        if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
          setSupabaseAvailable(false);
        } else {
          setSupabaseAvailable(true);
        }
      } catch {
        setSupabaseAvailable(false);
      } finally {
        setChecking(false);
      }
    };
    checkSupabase();
  }, []);

  // ── SUPABASE: fetch conversations ──────────────────────────────────────────
  useEffect(() => {
    if (!supabaseAvailable || checking) return;
    fetchConversations();
  }, [supabaseAvailable, checking, filterMode]);

  const fetchConversations = async () => {
    console.log("CHATVIEW VERSÃO - FETCH CONVERSATIONS");
    setLoadingConv(true);
    try {
      if (isAdmin) {
        let query = supabase
          .from('chat_conversations')
          .select(`id, is_archived, is_resolved, last_message_at, user_id, profiles:user_id (full_name, plan)`);

        if (filterMode === 'archived') query = query.eq('is_archived', true);
        else if (filterMode === 'resolved') query = query.eq('is_resolved', true);
        else query = query.eq('is_archived', false).eq('is_resolved', false);

        const { data, error } = await query;
        console.table(data);
        console.log("ADMIN ERRO:", error);

        if (!error) {
          setConversations(data || []);
        }
      } else if (currentUser?.id) {
        // User single conversation
        const { data, error } = await supabase
          .from('chat_conversations')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        if (error && error.code === 'PGRST116') {
          const { data: newConv, error: createErr } = await supabase
            .from('chat_conversations')
            .insert([{ user_id: currentUser.id }])
            .select()
            .single();
          if (!createErr) {
            setConversations([newConv]);
            setActiveConversation(newConv);
          }
        } else if (data) {
          setConversations([data]);
          setActiveConversation(data);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConv(false);
    }
  };

  // Auto-activate user's conversation for user
  useEffect(() => {
    if (!isAdmin && conversations.length > 0) {
      setActiveConversation(conversations[0]);
    }
  }, [conversations, isAdmin]);

  // ── SUPABASE: fetch messages ───────────────────────────────────────────────
  useEffect(() => {
    if (!supabaseAvailable || !activeConversation) return;
    fetchMessages();

    const channel = supabase.channel(`messages:${activeConversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `conversation_id=eq.${activeConversation.id}`
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [activeConversation, supabaseAvailable]);

  const fetchMessages = async () => {
    setLoadingMessages(true);
    console.log("FETCH MESSAGES - Conversation:", activeConversation.id);
    console.log("FETCH MESSAGES INICIADO");
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', activeConversation.id)
        .order('created_at', { ascending: true });

      if (!error) {
        setMessages(data || []);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // ── SUPABASE: send message ─────────────────────────────────────────────────
  const handleSendSupabase = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    // Ensure we have a conversation created first
    let convId = activeConversation?.id;
    if (!convId && !isAdmin && currentUser?.id) {
      try {
        const { data: newConv, error: createErr } = await supabase
          .from('chat_conversations')
          .insert([{ user_id: currentUser.id }])
          .select()
          .single();
        if (!createErr && newConv) {
          convId = newConv.id;
          setActiveConversation(newConv);
          setConversations([newConv]);
        }
      } catch (err) {
        console.error('Error creating conversation on send:', err);
      }
    }

    if (!convId) return;

    const text = inputText.trim();
    console.log("ANTES DO ENVIO:", {
      isAdmin,
      conversation_id: convId,
      activeConversation_id: activeConversation?.id,
      user_id_da_conversa: activeConversation?.user_id,
      currentUser_id: currentUser?.id
    });
    setInputText('');
    try {
      const { data: newMsg, error: sendErr } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: convId,
          sender_id: currentUser.id,
          receiver_id: isAdmin ? activeConversation.user_id : null,
          is_admin_reply: isAdmin,
          content: text,
          message: text
        }])
        .select()
        .single();

      console.log("SEND MESSAGE:", newMsg);
      console.log("SEND MESSAGE ERROR:", sendErr);

      if (sendErr) {
        alert(sendErr.message);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }

  }

  // ── LOCAL: send message ────────────────────────────────────────────────────
  const handleSendLocal = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');

    const newMsg = {
      id: Date.now().toString(),
      content: text,
      sender_id: currentUser?.id || currentUser?.Email || 'user',
      sender_name: isAdmin ? 'Administrador' : (currentUser?.Nome || 'Utilizador'),
      is_admin: isAdmin,
      created_at: new Date().toISOString(),
      is_read: false
    };

    const updated = [...localMessages, newMsg];
    setLocalMessages(updated);
    saveLocalMessages(updated);
    scrollToBottom();
  };

  const handleClearLocal = () => {
    if (window.confirm('Apagar todo o histórico de chat? Esta acção é irreversível.')) {
      setLocalMessages([]);
      saveLocalMessages([]);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => { scrollToBottom(); }, [localMessages, messages]);

  const handleToggleArchive = async () => {
    if (!activeConversation) return;
    const { error } = await supabase.from('chat_messages')
      .update({ is_archived: !activeConversation.is_archived })
      .eq('id', activeConversation.id);
    if (!error) {
      setActiveConversation(prev => ({ ...prev, is_archived: !prev.is_archived }));
      fetchConversations();
    }
  };

  const handleToggleResolve = async () => {
    if (!activeConversation) return;
    const { error } = await supabase.from('chat_messages')
      .update({ is_resolved: !activeConversation.is_resolved })
      .eq('id', activeConversation.id);
    if (!error) {
      setActiveConversation(prev => ({ ...prev, is_resolved: !prev.is_resolved }));
      fetchConversations();
    }
  };

  const filteredConversations = conversations.filter(c => {
    if (!isAdmin) return true;
    const name = c.profiles?.full_name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.85rem' }}>A verificar ligação ao chat...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LOCAL / OFFLINE MODE
  // ══════════════════════════════════════════════════════════════════════════
  if (!supabaseAvailable) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.1)', borderRadius: '12px 12px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), #a5b4fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
              {isAdmin ? '👑' : (currentUser?.Nome?.[0] || 'U')}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {isAdmin ? 'Suporte ao Cliente — Painel Admin' : 'Fale com o Administrador'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {isAdmin ? `${localMessages.length} mensagem(ns) no histórico` : 'Escreva a sua mensagem abaixo.'}
              </div>
            </div>
          </div>
          {isAdmin && localMessages.length > 0 && (
            <button onClick={handleClearLocal} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
              🗑️ Limpar
            </button>
          )}
        </div>

        {/* Notice banner */}
        <div style={{ padding: '8px 16px', background: 'rgba(245,158,11,0.07)', borderBottom: '1px solid rgba(245,158,11,0.15)', fontSize: '0.72rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ⚠️ Modo local — mensagens guardadas no seu dispositivo. Execute o SQL do chat no Supabase para ativar chat online.
        </div>

        {/* Messages list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.05)' }}>
          {localMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <MessageSquare size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
                {isAdmin
                  ? 'Nenhuma mensagem de suporte ainda.\nOs utilizadores podem contactar-te aqui.'
                  : 'Olá! 👋 Escreva a sua mensagem abaixo para o administrador.'}
              </p>
            </div>
          ) : (
            localMessages.map(m => {
              const isOwn = isAdmin ? m.is_admin : !m.is_admin;
              return (
                <div key={m.id} style={{ alignSelf: isOwn ? 'flex-end' : 'flex-start', maxWidth: '72%' }}>
                  {!isOwn && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '3px', marginLeft: '4px' }}>
                      {m.is_admin ? '👑 Administrador' : (m.sender_name || 'Utilizador')}
                    </div>
                  )}
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: isOwn ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isOwn ? 'var(--color-accent)' : 'rgba(255,255,255,0.07)',
                    border: isOwn ? 'none' : '1px solid var(--border-color)',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '0.88rem', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{m.content}</span>
                    <div style={{ alignSelf: 'flex-end', fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)' }}>
                      {new Date(m.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSendSupabase} style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '0 0 12px 12px' }}>
          <input
            type="text"
            placeholder="Escreva a sua mensagem..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{ background: inputText.trim() ? 'var(--color-accent)' : 'rgba(99,102,241,0.3)', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', cursor: inputText.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SUPABASE ONLINE MODE
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ display: 'flex', height: '100%', minHeight: '400px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>

      {/* Conversations sidebar (Only shown for Admin) */}
      {isAdmin && (
        <div style={{ width: '280px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)', flexShrink: 0 }}>
          <div style={{ padding: '14px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>💬 Conversas</h3>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '9px', top: '9px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '6px 10px 6px 28px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '7px', color: 'var(--text-primary)', fontSize: '0.82rem', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['active', 'resolved', 'archived'].map(mode => (
                <button key={mode} onClick={() => setFilterMode(mode)} style={{
                  flex: 1, padding: '4px 6px', fontSize: '0.68rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: filterMode === mode ? 'var(--color-accent)' : 'rgba(255,255,255,0.04)',
                  color: filterMode === mode ? '#fff' : 'var(--text-secondary)', fontWeight: 600
                }}>
                  {mode === 'active' ? 'Ativas' : mode === 'resolved' ? 'Resolv.' : 'Arq.'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {loadingConv ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader2 style={{ animation: 'spin 1s linear infinite' }} size={20} /></div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sem conversas.</div>
            ) : (
              filteredConversations.map(c => (
                <div key={c.id} onClick={() => {
                  console.log("CONVERSA ADMIN SELECIONADA:", c);
                  setActiveConversation(c);
                }} style={{
                  padding: '10px', borderRadius: '9px', cursor: 'pointer', display: 'flex', gap: '9px', alignItems: 'center', marginBottom: '4px',
                  background: activeConversation?.id === c.id ? 'rgba(99,102,241,0.12)' : 'transparent',
                  border: activeConversation?.id === c.id ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, flexShrink: 0 }}>
                    {(c.profiles?.full_name || 'U')[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.profiles?.full_name || 'Utilizador'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Plano: {c.profiles?.plan || 'Gratuito'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat Area (Always rendered directly for normal users) */}
      {(!isAdmin || activeConversation) ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.05)', minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), #a5b4fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
                {isAdmin ? (activeConversation?.profiles?.full_name?.[0] || 'U') : '👑'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                  {isAdmin ? (activeConversation?.profiles?.full_name || 'Utilizador') : 'Fale com o Administrador'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {isAdmin ? 'Conversa de Suporte' : 'Suporte Oficial Finança ao Ponto'}
                </div>
              </div>
            </div>
            {isAdmin && activeConversation && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handleToggleResolve} style={{
                  padding: '5px 10px', border: '1px solid var(--border-color)',
                  background: activeConversation.is_resolved ? 'rgba(52,211,153,0.1)' : 'transparent',
                  color: activeConversation.is_resolved ? 'var(--color-success)' : 'var(--text-secondary)',
                  borderRadius: '7px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <CheckCircle2 size={12} /> {activeConversation.is_resolved ? 'Resolvida' : 'Resolver'}
                </button>
                <button onClick={handleToggleArchive} style={{
                  padding: '5px 10px', border: '1px solid var(--border-color)',
                  background: activeConversation.is_archived ? 'rgba(245,158,11,0.1)' : 'transparent',
                  color: activeConversation.is_archived ? '#f59e0b' : 'var(--text-secondary)',
                  borderRadius: '7px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <Archive size={12} /> {activeConversation.is_archived ? 'Arquivada' : 'Arquivar'}
                </button>
              </div>
            )}
          </div>

          {/* Messages list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loadingMessages ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={24} />
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <MessageSquare size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: '0.85rem' }}>Olá! Escreva a sua mensagem abaixo. Ela será enviada diretamente para o administrador.</p>
              </div>
            ) : (
              messages.map(m => {
                const isOwn = m.sender_id === currentUser?.id;
                return (
                  <div key={m.id} style={{
                    alignSelf: isOwn ? 'flex-end' : 'flex-start',
                    maxWidth: '72%', padding: '10px 14px',
                    borderRadius: isOwn ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isOwn ? 'var(--color-accent)' : 'rgba(255,255,255,0.06)',
                    border: isOwn ? 'none' : '1px solid var(--border-color)',
                    color: '#fff', display: 'flex', flexDirection: 'column', gap: '4px'
                  }}>
                    {m.message_attachments?.map(att => (
                      <div key={att.id} style={{ marginBottom: '6px' }}>
                        {att.file_type === 'image' ? (
                          <img src={att.file_url} alt={att.file_name} style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => window.open(att.file_url, '_blank')} />
                        ) : (
                          <a href={att.file_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontSize: '0.8rem' }}>
                            <FileText size={16} /> {att.file_name}
                          </a>
                        )}
                      </div>
                    ))}
                    <span style={{ fontSize: '0.88rem', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{m.content}</span>
                    <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.62rem', color: 'rgba(255,255,255,0.55)' }}>
                      <span>{new Date(m.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
                      {isOwn && (m.is_read ? <CheckCheck size={11} style={{ color: '#34d399' }} /> : <Check size={11} />)}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input form */}
          <form onSubmit={handleSendSupabase} style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
            <input
              type="text"
              placeholder="Escreva a sua mensagem para o admin..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
            />
            <button type="submit" disabled={!inputText.trim()} style={{
              background: inputText.trim() ? 'var(--color-accent)' : 'rgba(99,102,241,0.3)',
              border: 'none', padding: '10px', borderRadius: '8px', color: '#fff',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <p style={{ fontSize: '0.9rem' }}>Selecione uma conversa para responder.</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
